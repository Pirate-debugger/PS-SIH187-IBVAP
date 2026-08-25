import json
from typing import List, Dict, Any, Tuple, Optional
from shapely.geometry import Point as SPoint, Polygon as SPolygon, LineString as SLineString
from app.config import DATA_DIR
from app.models.schemas import Zone, TrackedObject

class ZoneEngine:
    """
    Virtual Border & Polygonal Zone Engine.
    Handles:
    - Restricted Zone Intrusions (Point-in-Polygon)
    - Virtual Fence / Tripwire Breaches with Directional crossing (North -> South vs South -> North)
    - Loitering Dwell-Time monitoring (> threshold sec)
    - Multi-zone management per camera
    """

    def __init__(self):
        self.zones: Dict[str, List[Zone]] = {}  # camera_id -> list of Zone objects
        self.track_zone_entry_times: Dict[str, Dict[str, float]] = {}  # track_id -> {zone_id: first_seen_time}
        self.load_zones()

    def load_zones(self):
        """Loads zones from JSON file or initializes defaults."""
        zones_file = DATA_DIR / "default_zones.json"
        if zones_file.exists():
            try:
                with open(zones_file, "r") as f:
                    raw_zones = json.load(f)
                    self.zones.clear()
                    for item in raw_zones:
                        z = Zone(**item)
                        if z.camera_id not in self.zones:
                            self.zones[z.camera_id] = []
                        self.zones[z.camera_id].append(z)
            except Exception as e:
                print(f"[ZoneEngine] Error loading zones: {e}")

    def save_zones(self):
        """Persists current zones to default_zones.json."""
        zones_file = DATA_DIR / "default_zones.json"
        all_zones = []
        for cam_id, zlist in self.zones.items():
            for z in zlist:
                all_zones.append(z.model_dump())
        with open(zones_file, "w") as f:
            json.dump(all_zones, f, indent=2)

    def get_zones_for_camera(self, camera_id: str) -> List[Zone]:
        return self.zones.get(camera_id, [])

    def set_zones_for_camera(self, camera_id: str, new_zones: List[Zone]):
        self.zones[camera_id] = new_zones
        self.save_zones()

    def add_or_update_zone(self, zone: Zone):
        cam_id = zone.camera_id
        if cam_id not in self.zones:
            self.zones[cam_id] = []
        
        # Replace if exists
        updated = False
        for idx, existing in enumerate(self.zones[cam_id]):
            if existing.id == zone.id:
                self.zones[cam_id][idx] = zone
                updated = True
                break
        if not updated:
            self.zones[cam_id].append(zone)
        self.save_zones()

    def delete_zone(self, camera_id: str, zone_id: str):
        if camera_id in self.zones:
            self.zones[camera_id] = [z for z in self.zones[camera_id] if z.id != zone_id]
            self.save_zones()

    def check_intrusions(
        self, camera_id: str, tracked_objects: List[TrackedObject], current_time: float
    ) -> List[Dict[str, Any]]:
        """
        Evaluates all tracked objects against the active zones for this camera.
        Returns a list of detected zone violations / events.
        """
        violations = []
        camera_zones = self.zones.get(camera_id, [])

        for obj in tracked_objects:
            # Bottom-center of bounding box represents feet/ground contact
            x1, y1, x2, y2 = obj.bbox
            feet_x = (x1 + x2) / 2.0
            feet_y = y2
            obj_point = SPoint(feet_x, feet_y)

            # Historical movement vector for tripwire line intersection
            track_line = None
            if len(obj.history) >= 2:
                recent_pts = obj.history[-5:]
                if len(recent_pts) >= 2:
                    track_line = SLineString(recent_pts)

            for zone in camera_zones:
                if not zone.active:
                    continue

                if zone.zone_type == "VIRTUAL_FENCE":
                    # Tripwire line check
                    if len(zone.points) >= 2 and track_line is not None:
                        fence_line = SLineString(zone.points)
                        if track_line.intersects(fence_line):
                            # Calculate crossing direction
                            y_start = recent_pts[0][1]
                            y_end = recent_pts[-1][1]
                            direction_str = "North -> South" if y_end > y_start else "South -> North"
                            
                            violations.append({
                                "zone_id": zone.id,
                                "zone_name": zone.name,
                                "zone_type": "VIRTUAL_FENCE",
                                "event_type": "DIRECTIONAL_PERIMETER_BREACH",
                                "severity": zone.severity_on_breach,
                                "track_id": obj.track_id,
                                "object_type": obj.label,
                                "direction": direction_str,
                                "dwell_time": obj.dwell_time_sec,
                                "description": f"Virtual Fence breach: {obj.label.capitalize()} ({obj.track_id}) crossed {zone.name} heading {direction_str}."
                            })

                else:
                    # Polygonal zone (RESTRICTED_ZONE, LOITERING_ZONE, BUFFER_ZONE)
                    if len(zone.points) >= 3:
                        poly = SPolygon(zone.points)
                        is_inside = poly.contains(obj_point) or poly.touches(obj_point)

                        if is_inside:
                            # Update entry time
                            if obj.track_id not in self.track_zone_entry_times:
                                self.track_zone_entry_times[obj.track_id] = {}
                            if zone.id not in self.track_zone_entry_times[obj.track_id]:
                                self.track_zone_entry_times[obj.track_id][zone.id] = current_time

                            dwell_in_zone = current_time - self.track_zone_entry_times[obj.track_id][zone.id]

                            if zone.zone_type == "RESTRICTED_ZONE":
                                obj.is_in_restricted_zone = True
                                violations.append({
                                    "zone_id": zone.id,
                                    "zone_name": zone.name,
                                    "zone_type": "RESTRICTED_ZONE",
                                    "event_type": "RESTRICTED_ZONE_BREACH",
                                    "severity": zone.severity_on_breach,
                                    "track_id": obj.track_id,
                                    "object_type": obj.label,
                                    "direction": obj.direction,
                                    "dwell_time": round(dwell_in_zone, 1),
                                    "description": f"🚨 Critical Breach: {obj.label.capitalize()} ({obj.track_id}) inside {zone.name}."
                                })

                            elif zone.zone_type == "LOITERING_ZONE":
                                if dwell_in_zone >= zone.loitering_threshold_sec:
                                    obj.is_loitering = True
                                    violations.append({
                                        "zone_id": zone.id,
                                        "zone_name": zone.name,
                                        "zone_type": "LOITERING_ZONE",
                                        "event_type": "LOITERING_DETECTED",
                                        "severity": zone.severity_on_breach,
                                        "track_id": obj.track_id,
                                        "object_type": obj.label,
                                        "direction": obj.direction,
                                        "dwell_time": round(dwell_in_zone, 1),
                                        "description": f"⚠️ Loitering Alert: {obj.label.capitalize()} ({obj.track_id}) lingering in {zone.name} for {round(dwell_in_zone, 1)}s (Threshold {zone.loitering_threshold_sec}s)."
                                    })
                        else:
                            # Clear entry time if object left zone
                            if obj.track_id in self.track_zone_entry_times and zone.id in self.track_zone_entry_times[obj.track_id]:
                                del self.track_zone_entry_times[obj.track_id][zone.id]

        return violations
