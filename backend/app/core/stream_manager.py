import time
import json
import asyncio
import cv2
import numpy as np
from typing import Dict, List, Any, Optional
from app.config import DEFAULT_CAMERAS
from app.models.schemas import CameraStatus, TrackedObject, SystemTelemetry
from app.core.scenario_simulator import ScenarioSimulator
from app.core.ai_pipeline import AIPipeline
from app.core.zone_engine import ZoneEngine
from app.core.anpr_engine import ANPREngine
from app.core.night_enhancer import NightEnhancer
from app.core.incident_engine import IncidentEngine

class StreamManager:
    """
    Multi-Camera Video Ingestion & AI Stream Orchestrator.
    Manages concurrent video feeds for all border cameras (BOP-01 to BOP-06).
    Coordinates:
    - Live video frame generation / ingestion
    - Night vision mode processing (Standard, Enhanced Low-Light, Thermal FLIR, Night Vision Green)
    - AI detection, Kalman tracking, and direction telemetry
    - Virtual polygon zone checks & intrusion alerts
    - Automatic Number Plate Recognition (ANPR) & Watchlist triggers
    - Live HUD overlay rendering (bounding boxes, track IDs, speed, direction arrows, zone boundaries)
    - WebSocket event broadcasting to command center dashboard
    """

    def __init__(self):
        self.simulator = ScenarioSimulator()
        self.ai_pipeline = AIPipeline()
        self.zone_engine = ZoneEngine()
        self.anpr_engine = ANPREngine()
        self.incident_engine = IncidentEngine()
        self.night_enhancer = NightEnhancer()

        self.cameras: Dict[str, CameraStatus] = {}
        self.camera_modes: Dict[str, str] = {}
        self.latest_frames: Dict[str, bytes] = {}
        self.latest_raw_frames: Dict[str, np.ndarray] = {}
        self.latest_tracks: Dict[str, List[TrackedObject]] = {}
        self.websocket_clients = set()
        self.running = False
        self.last_incident_times: Dict[str, float] = {}  # event cooldown tracker

        self._init_cameras()

    def _init_cameras(self):
        for cam_data in DEFAULT_CAMERAS:
            c = CameraStatus(**cam_data)
            self.cameras[c.id] = c
            self.camera_modes[c.id] = c.active_mode

    def get_camera(self, camera_id: str) -> Optional[CameraStatus]:
        return self.cameras.get(camera_id)

    def get_all_cameras(self) -> List[CameraStatus]:
        return list(self.cameras.values())

    def set_camera_mode(self, camera_id: str, mode: str):
        if camera_id in self.cameras:
            self.cameras[camera_id].active_mode = mode
            self.camera_modes[camera_id] = mode

    def set_camera_scenario(self, camera_id: str, scenario_id: int):
        if camera_id in self.cameras:
            self.cameras[camera_id].scenario_id = scenario_id

    def get_system_telemetry(self) -> SystemTelemetry:
        total_persons = sum(c.current_persons for c in self.cameras.values())
        total_vehicles = sum(c.current_vehicles for c in self.cameras.values())
        incidents = self.incident_engine.get_all_incidents()
        critical_alerts = sum(1 for a in self.incident_engine.get_all_alerts() if a.severity == "CRITICAL" and not a.acknowledged)

        threat_level = "DEFCON 1 (MAX ALERT)" if critical_alerts > 0 else "DEFCON 3 (ELEVATED)"

        return SystemTelemetry(
            system_name="IBVAP 2.0",
            agency="Sashastra Seema Bal (SSB)",
            sector="Sector 04 - Zero Line Border Perimeter",
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
            threat_level=threat_level,
            active_cameras_count=len(self.cameras),
            total_cameras_count=len(self.cameras),
            persons_monitored=total_persons,
            vehicles_tracked=total_vehicles,
            total_incidents=len(incidents),
            active_critical_alerts=critical_alerts,
            ai_inference_fps=24.8,
            pipeline_latency_ms=18.5,
            edge_cpu_percent=32.4,
            edge_gpu_percent=48.2,
            bandwidth_saved_percent=78.5
        )

    def draw_hud(
        self,
        frame: np.ndarray,
        camera: CameraStatus,
        tracked_objects: List[TrackedObject],
        fps: float
    ) -> np.ndarray:
        """
        Draws high-contrast military HUD overlays directly on the frame:
        - Polygonal Zones (Red for Restricted, Amber for Loitering/Buffer, Blue for ANPR)
        - Object Bounding Boxes with Track IDs, Speed, and Direction
        - License plate popups
        - Camera telemetry watermarks (FPS, Resolution, Sector, Active Mode)
        """
        hud_frame = frame.copy()
        h, w = hud_frame.shape[:2]

        # 1. Draw Zones
        zones = self.zone_engine.get_zones_for_camera(camera.id)
        for zone in zones:
            if not zone.active:
                continue
            if zone.zone_type == "VIRTUAL_FENCE":
                if len(zone.points) >= 2:
                    p1 = (int(zone.points[0][0] * w), int(zone.points[0][1] * h))
                    p2 = (int(zone.points[1][0] * w), int(zone.points[1][1] * h))
                    cv2.line(hud_frame, p1, p2, (0, 0, 255), 2)
                    cv2.putText(hud_frame, f"[TRIPWIRE] {zone.name}", (p1[0] + 10, p1[1] - 8),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)
            else:
                if len(zone.points) >= 3:
                    pts = np.array([[int(p[0] * w), int(p[1] * h)] for p in zone.points], np.int32)
                    pts = pts.reshape((-1, 1, 2))
                    # Hex color to BGR
                    color = (0, 0, 255) if "RESTRICTED" in zone.zone_type else (0, 180, 255)
                    # Draw semi-transparent overlay
                    overlay = hud_frame.copy()
                    cv2.fillPoly(overlay, [pts], color)
                    cv2.addWeighted(overlay, 0.18, hud_frame, 0.82, 0, hud_frame)
                    cv2.polylines(hud_frame, [pts], True, color, 2)
                    # Label
                    label_pos = (pts[0][0][0] + 8, pts[0][0][1] + 18)
                    cv2.putText(hud_frame, zone.name.upper(), label_pos,
                                cv2.FONT_HERSHEY_SIMPLEX, 0.40, color, 1)

        # 2. Draw Tracked Objects
        for obj in tracked_objects:
            x1 = int(obj.bbox[0] * w)
            y1 = int(obj.bbox[1] * h)
            x2 = int(obj.bbox[2] * w)
            y2 = int(obj.bbox[3] * h)

            # Box color: Red if restricted zone breach, Amber if loitering, Yellow if watchlist hit, Cyan otherwise
            if obj.is_in_restricted_zone:
                box_color = (0, 0, 255)  # Red Alert
            elif obj.watchlist_flag:
                box_color = (0, 60, 255)  # Orange Alert
            elif obj.is_loitering:
                box_color = (0, 190, 255)  # Amber
            else:
                box_color = (255, 230, 0) if obj.label == "person" else (0, 240, 255)  # Cyan/Yellow

            # Bounding box corners
            cv2.rectangle(hud_frame, (x1, y1), (x2, y2), box_color, 2)

            # Trajectory trail
            if len(obj.history) >= 2:
                for i in range(1, len(obj.history)):
                    pt1 = (int(obj.history[i - 1][0] * w), int(obj.history[i - 1][1] * h))
                    pt2 = (int(obj.history[i][0] * w), int(obj.history[i][1] * h))
                    cv2.line(hud_frame, pt1, pt2, box_color, 1)

            # HUD Label badge
            label_text = f"{obj.track_id} | {obj.label.upper()} | {obj.speed_kmh}km/h | {obj.direction}"
            if obj.license_plate:
                label_text += f" | [{obj.license_plate}]"
                if obj.watchlist_flag:
                    label_text += f" [WATCHLIST: {obj.watchlist_flag}]"

            # Badge background
            (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.40, 1)
            badge_y1 = max(0, y1 - th - 8)
            cv2.rectangle(hud_frame, (x1, badge_y1), (x1 + tw + 10, badge_y1 + th + 6), (15, 20, 25), -1)
            cv2.rectangle(hud_frame, (x1, badge_y1), (x1 + tw + 10, badge_y1 + th + 6), box_color, 1)
            cv2.putText(hud_frame, label_text, (x1 + 5, badge_y1 + th + 2),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1)

        # 3. Top Telemetry Banner
        cv2.rectangle(hud_frame, (0, 0), (w, 24), (10, 14, 23), -1)
        cv2.line(hud_frame, (0, 24), (w, 24), (40, 60, 80), 1)
        hud_info = f"IBVAP 2.0 | {camera.id} | {camera.name} | MODE: {camera.active_mode} | {fps:.1f} FPS"
        cv2.putText(hud_frame, hud_info, (10, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (0, 240, 255), 1)

        # Live REC indicator
        rec_color = (0, 0, 255) if int(time.time() * 2) % 2 == 0 else (100, 100, 100)
        cv2.circle(hud_frame, (w - 35, 12), 4, rec_color, -1)
        cv2.putText(hud_frame, "REC", (w - 26, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (255, 255, 255), 1)

        return hud_frame

    def process_camera_tick(self, camera_id: str):
        """
        Executes one full AI cycle for a given camera stream:
        1. Render/Ingest frame from scenario generator or camera
        2. Apply Night/Thermal Enhancement if mode selected
        3. Multi-target object detection & Kalman tracking
        4. ANPR plate extraction & Watchlist check
        5. Zone intrusion & loitering analysis
        6. Incident & Alert trigger on violation
        7. Render HUD overlay and encode JPEG
        """
        camera = self.cameras.get(camera_id)
        if not camera:
            return

        current_time = time.time()
        active_mode = self.camera_modes.get(camera_id, "STANDARD")

        # 1. Generate / Ingest Frame
        raw_frame, gt_detections, meta = self.simulator.render_scenario_frame(
            camera_id=camera_id,
            scenario_id=camera.scenario_id,
            width=640,
            height=360
        )

        # 2. Night Enhancement Filter
        enhanced_frame = self.night_enhancer.process_frame(raw_frame, mode=active_mode)

        # 3. Object Tracking
        tracked_objects = self.ai_pipeline.update_tracks(gt_detections, camera_id, current_time)

        # Update camera person & vehicle counts
        person_count = sum(1 for o in tracked_objects if o.label == "person")
        vehicle_count = sum(1 for o in tracked_objects if o.label in ["car", "truck", "motorcycle", "bus"])
        camera.current_persons = person_count
        camera.current_vehicles = vehicle_count

        # 4. ANPR Plate Evaluation
        for obj in tracked_objects:
            if obj.label in ["car", "truck", "motorcycle", "bus"]:
                plate_text = meta.get("plate_number")
                if plate_text:
                    obj.license_plate = plate_text
                    obj.plate_confidence = 0.96
                    is_hit, wl_item = self.anpr_engine.match_watchlist(plate_text)
                    if is_hit and wl_item:
                        obj.watchlist_flag = wl_item.threat_level
                        # Trigger ANPR Incident if not on cooldown
                        cooldown_key = f"ANPR_{plate_text}"
                        if current_time - self.last_incident_times.get(cooldown_key, 0) > 8.0:
                            self.last_incident_times[cooldown_key] = current_time
                            self.incident_engine.create_incident(
                                camera_id=camera.id,
                                camera_name=camera.name,
                                location_str=camera.location,
                                event_type="BLACKLISTED_VEHICLE_ANPR",
                                severity="HIGH",
                                objects_involved=[f"Vehicle {obj.track_id} (Plate: {plate_text})"],
                                movement_vector=f"{obj.direction} @ {obj.speed_kmh} km/h",
                                duration_sec=obj.dwell_time_sec,
                                frame=enhanced_frame,
                                telemetry={"plate": plate_text, "threat": wl_item.threat_level, "reason": wl_item.reason}
                            )

        # 5. Zone Intrusions & Loitering Check
        violations = self.zone_engine.check_intrusions(camera_id, tracked_objects, current_time)
        for v in violations:
            cooldown_key = f"{camera_id}_{v['zone_id']}_{v['track_id']}_{v['event_type']}"
            if current_time - self.last_incident_times.get(cooldown_key, 0) > 6.0:
                self.last_incident_times[cooldown_key] = current_time
                self.incident_engine.create_incident(
                    camera_id=camera.id,
                    camera_name=camera.name,
                    location_str=camera.location,
                    event_type=v["event_type"],
                    severity=v["severity"],
                    objects_involved=[f"{v['object_type'].capitalize()} (Track {v['track_id']})"],
                    movement_vector=f"{v.get('direction', 'North -> South')} in {v['zone_name']}",
                    duration_sec=v["dwell_time"],
                    frame=enhanced_frame,
                    telemetry={"zone_id": v["zone_id"], "zone_name": v["zone_name"]}
                )

        # Special Night Stealth Infiltration trigger for Scenario 4
        if camera.scenario_id == 4:
            cooldown_key = f"{camera_id}_NIGHT_STEALTH"
            if current_time - self.last_incident_times.get(cooldown_key, 0) > 8.0:
                self.last_incident_times[cooldown_key] = current_time
                self.incident_engine.create_incident(
                    camera_id=camera.id,
                    camera_name=camera.name,
                    location_str=camera.location,
                    event_type="NIGHT_STEALTH_INTRUSION",
                    severity="CRITICAL",
                    objects_involved=["1 Crawling Intruder (Track P-04)"],
                    movement_vector="Crawling South-East through Marsh Reeds",
                    duration_sec=12.4,
                    frame=enhanced_frame,
                    telemetry={"thermal_signature": "Confirmed Human Core 37.1 C"}
                )

        # 6. Render HUD and Encode Frame
        hud_frame = self.draw_hud(enhanced_frame, camera, tracked_objects, fps=25.0)
        _, jpeg = cv2.imencode(".jpg", hud_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])

        self.latest_frames[camera_id] = jpeg.tobytes()
        self.latest_raw_frames[camera_id] = hud_frame
        self.latest_tracks[camera_id] = tracked_objects

    async def run_loop(self):
        """Main background loop updating all camera feeds at ~20-25 FPS."""
        self.running = True
        print("[StreamManager] Multi-camera AI processing loop started.")
        while self.running:
            for cam_id in self.cameras.keys():
                self.process_camera_tick(cam_id)

            # Broadcast WebSocket payload if clients connected
            if self.websocket_clients:
                payload = {
                    "type": "TELEMETRY_SYNC",
                    "telemetry": self.get_system_telemetry().model_dump(),
                    "cameras": [c.model_dump() for c in self.cameras.values()],
                    "alerts": [a.model_dump() for a in self.incident_engine.get_all_alerts()[:10]],
                    "timestamp": time.time()
                }
                msg = json.dumps(payload)
                disconnected = set()
                for ws in self.websocket_clients:
                    try:
                        await ws.send_text(msg)
                    except Exception:
                        disconnected.add(ws)
                self.websocket_clients -= disconnected

            await asyncio.sleep(0.04)  # ~25 FPS loop
