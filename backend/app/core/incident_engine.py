import os
import time
import json
import uuid
import cv2
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.config import SNAPSHOT_DIR, REPORTS_DIR, DATA_DIR
from app.models.schemas import Incident, Alert

class IncidentEngine:
    """
    Incident Intelligence & Automated Dossier Engine.
    Transforms raw CV events into structured military/tactical incidents:
    - Unique ID: INC-2026-XXXX
    - Keyframe evidence snapshot generation
    - Severity assignment (CRITICAL / HIGH / MEDIUM / LOW)
    - Actionable SSB Standard Operating Procedures (SOP) guidance
    - Exportable incident reports
    """

    def __init__(self):
        self.incidents: List[Incident] = []
        self.alerts: List[Alert] = []
        self.incident_counter = 80
        self.load_history()

    def load_history(self):
        """Loads previous incidents from JSON storage if present."""
        history_file = DATA_DIR / "incident_history.json"
        if history_file.exists():
            try:
                with open(history_file, "r") as f:
                    raw_data = json.load(f)
                    self.incidents = [Incident(**item) for item in raw_data.get("incidents", [])]
                    self.alerts = [Alert(**item) for item in raw_data.get("alerts", [])]
                    if self.incidents:
                        # Extract max counter
                        for inc in self.incidents:
                            parts = inc.incident_id.split("-")
                            if len(parts) == 3 and parts[2].isdigit():
                                self.incident_counter = max(self.incident_counter, int(parts[2]))
            except Exception as e:
                print(f"[IncidentEngine] Error loading history: {e}")

    def save_history(self):
        """Saves current incidents and alerts to disk."""
        history_file = DATA_DIR / "incident_history.json"
        data = {
            "incidents": [inc.model_dump() for inc in self.incidents[-100:]],
            "alerts": [alt.model_dump() for alt in self.alerts[-100:]]
        }
        with open(history_file, "w") as f:
            json.dump(data, f, indent=2)

    def generate_incident_id(self) -> str:
        self.incident_counter += 1
        return f"INC-2026-{self.incident_counter:04d}"

    def get_sop_for_event(self, event_type: str, severity: str) -> Dict[str, Any]:
        """
        Retrieves the exact tactical Standard Operating Procedure (SOP) based on SSB Border Doctrine.
        """
        sops = {
            "RESTRICTED_ZONE_BREACH": {
                "title": "SOP-SEC-01: Zero-Line Restricted Zone Intrusion Response",
                "steps": [
                    "Dispatch Quick Reaction Force (QRF) Team Alpha to Sector Pillar",
                    "Illuminate sector with high-intensity infrared searchlights",
                    "Issue audio warning via automated long-range acoustic device (LRAD)",
                    "Alert adjacent Border Outposts (BOP Bravo & BOP Charlie) to seal flanking tracks",
                    "Record high-resolution tracking logs for post-incident intelligence debrief"
                ]
            },
            "LOITERING_DETECTED": {
                "title": "SOP-SEC-02: Suspicious Perimeter Loitering Protocol",
                "steps": [
                    "Zoom PTZ camera to capture face profile and clothing details",
                    "Deploy foot reconnaissance patrol to verify identity and clearance",
                    "Check perimeter fencing for cut marks or sensor tampering",
                    "Log subject track trajectory and dwell duration into intelligence database"
                ]
            },
            "BLACKLISTED_VEHICLE_ANPR": {
                "title": "SOP-SEC-03: Flagged High-Threat Vehicle Interception",
                "steps": [
                    "Trigger automated tire shredder / barrier lockdown at Checkpost Alpha",
                    "Notify Sector Intelligence Officer and SSB Interceptor Squad",
                    "Establish secondary vehicle cordon at 500m perimeter checkpoint",
                    "Detain occupants for biometric verification and cargo inspection",
                    "Cross-reference vehicle registration with National Crime Record Bureau (NCRB)"
                ]
            },
            "NIGHT_STEALTH_INTRUSION": {
                "title": "SOP-SEC-04: Night-Time Thermal Intrusion Protocol",
                "steps": [
                    "Lock dual-spectrum thermal tracker onto heat signature coordinates",
                    "Deploy Night-Patrol squad equipped with Gen-3 Night Vision Goggles (NVGs)",
                    "Coordinate intercept path using tactical map telemetry",
                    "Ensure drone / UAV overwatch launch from nearest BOP station"
                ]
            },
            "DIRECTIONAL_PERIMETER_BREACH": {
                "title": "SOP-SEC-05: Directional Virtual Fence Crossing Defense",
                "steps": [
                    "Sound localized siren alert at BOP outpost station",
                    "Deploy interceptor team along predicted exit vector",
                    "Isolate sector transit routes and forest trail bottlenecks",
                    "Initiate search protocol in coordinates buffer grid"
                ]
            },
            "UNATTENDED_CARGO": {
                "title": "SOP-SEC-06: Suspicious Package / Checkpost Anomaly Protocol",
                "steps": [
                    "Establish 100m standoff safety perimeter around anomalous object",
                    "Deploy Bomb Disposal & Sniffer Canine Squad (BDDS)",
                    "Review rewind CCTV footage to identify dropper vehicle/person track ID",
                    "Notify SSB Bomb Safety Officer and sector command center"
                ]
            }
        }
        return sops.get(event_type, {
            "title": "SOP-GEN-00: Standard Border Security Verification",
            "steps": [
                "Deploy patrol team to investigate anomalous telemetry",
                "Monitor camera feed continuously",
                "Log event to command center daily report"
            ]
        })

    def create_incident(
        self,
        camera_id: str,
        camera_name: str,
        location_str: str,
        event_type: str,
        severity: str,
        objects_involved: List[str],
        movement_vector: str,
        duration_sec: float,
        frame: Optional[np.ndarray] = None,
        telemetry: Optional[Dict[str, Any]] = None
    ) -> Incident:
        """
        Creates, logs, and persists a structured incident dossier.
        """
        incident_id = self.generate_incident_id()
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Save snapshot
        snapshot_filename = f"{incident_id}_{int(time.time())}.jpg"
        snapshot_path = SNAPSHOT_DIR / snapshot_filename
        snapshot_url = f"/api/snapshots/{snapshot_filename}"

        if frame is not None and frame.size > 0:
            # Draw watermark HUD on evidence snapshot
            evidence_frame = frame.copy()
            cv2.putText(evidence_frame, f"IBVAP 2.0 EVIDENCE: {incident_id} | {timestamp}", (20, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(evidence_frame, f"CAM: {camera_id} | {location_str}", (20, 65),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            cv2.imwrite(str(snapshot_path), evidence_frame)
        else:
            # Create synthetic evidence placeholder frame if none provided
            placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(placeholder, f"INCIDENT KEYFRAME: {incident_id}", (30, 240),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 240, 255), 2)
            cv2.imwrite(str(snapshot_path), placeholder)

        sop_info = self.get_sop_for_event(event_type, severity)

        incident = Incident(
            incident_id=incident_id,
            timestamp=timestamp,
            camera_id=camera_id,
            camera_name=camera_name,
            location_str=location_str,
            event_type=event_type,
            severity=severity,
            objects_involved=objects_involved,
            movement_vector=movement_vector,
            duration_sec=duration_sec,
            snapshot_url=snapshot_url,
            sop_title=sop_info["title"],
            sop_steps=sop_info["steps"],
            status="ACTIVE",
            telemetry=telemetry or {}
        )

        self.incidents.insert(0, incident)

        # Create corresponding real-time Alert
        alert = Alert(
            id=str(uuid.uuid4())[:8],
            timestamp=timestamp,
            camera_id=camera_id,
            camera_name=camera_name,
            severity=severity,
            event_type=event_type,
            description=f"[{incident_id}] {event_type.replace('_', ' ')} detected at {camera_name}.",
            track_id=objects_involved[0] if objects_involved else None,
            object_type=event_type,
            snapshot_url=snapshot_url,
            acknowledged=False
        )
        self.alerts.insert(0, alert)

        self.save_history()
        return incident

    def get_all_incidents(self) -> List[Incident]:
        return self.incidents

    def get_all_alerts(self) -> List[Alert]:
        return self.alerts

    def acknowledge_alert(self, alert_id: str) -> bool:
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.acknowledged = True
                self.save_history()
                return True
        return False

    def update_incident_status(self, incident_id: str, new_status: str, notes: Optional[str] = None) -> Optional[Incident]:
        for inc in self.incidents:
            if inc.incident_id == incident_id:
                inc.status = new_status
                if notes:
                    inc.notes = notes
                self.save_history()
                return inc
        return None
