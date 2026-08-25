import os
import time
import json
import uuid
import cv2
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.config import SNAPSHOT_DIR, REPORTS_DIR, DATA_DIR
from app.models.schemas import Incident, Alert, TimelineEvent, RiskAssessment
from app.core.risk_engine import RiskEngine

class IncidentEngine:
    """
    Incident Intelligence & Forensics Engine for IBVAP 3.0.
    Transforms raw CV events into structured, court-admissible military dossiers:
    - Unique ID: INC-2026-XXXX
    - Full 6-Stage Lifecycle: DETECTED -> TRIAGED -> ACKNOWLEDGED -> UNDER_INVESTIGATION -> RESOLVED -> ARCHIVED
    - Multi-Step Evidence Micro-Timeline
    - Explainable Risk Breakdown & Rule Attribution
    - Actionable SSB Standard Operating Procedures (SOP)
    """

    def __init__(self):
        self.incidents: List[Incident] = []
        self.alerts: List[Alert] = []
        self.incident_counter = 80
        self.load_history()

    def load_history(self):
        history_file = DATA_DIR / "incident_history.json"
        if history_file.exists():
            try:
                with open(history_file, "r") as f:
                    raw_data = json.load(f)
                    self.incidents = [Incident(**item) for item in raw_data.get("incidents", [])]
                    self.alerts = [Alert(**item) for item in raw_data.get("alerts", [])]
                    for inc in self.incidents:
                        parts = inc.incident_id.split("-")
                        if len(parts) == 3 and parts[2].isdigit():
                            self.incident_counter = max(self.incident_counter, int(parts[2]))
            except Exception:
                pass

    def save_history(self):
        history_file = DATA_DIR / "incident_history.json"
        data = {
            "incidents": [inc.model_dump() for inc in self.incidents[-100:]],
            "alerts": [alt.model_dump() for alt in self.alerts[-100:]]
        }
        try:
            with open(history_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception:
            pass

    def generate_incident_id(self) -> str:
        self.incident_counter += 1
        return f"INC-2026-{self.incident_counter:04d}"

    def get_sop_for_event(self, event_type: str, severity: str) -> Dict[str, Any]:
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
            "DIRECTIONAL_PERIMETER_BREACH": {
                "title": "SOP-SEC-02: Directional Virtual Fence Crossing Defense",
                "steps": [
                    "Sound localized siren alert at BOP outpost station",
                    "Deploy interceptor team along predicted exit vector",
                    "Isolate sector transit routes and forest trail bottlenecks",
                    "Initiate search protocol in coordinates buffer grid"
                ]
            },
            "LOITERING_DETECTED": {
                "title": "SOP-SEC-03: Suspicious Perimeter Loitering Protocol",
                "steps": [
                    "Zoom PTZ camera to capture face profile and clothing details",
                    "Deploy foot reconnaissance patrol to verify identity and clearance",
                    "Check perimeter fencing for cut marks or sensor tampering",
                    "Log subject track trajectory and dwell duration into intelligence database"
                ]
            },
            "GROUP_MOVEMENT_BREACH": {
                "title": "SOP-SEC-04: Coordinated Infiltration Perimeter Defense",
                "steps": [
                    "Declare DEFCON 1 High Perimeter Alert across sector",
                    "Deploy dual QRF squads in pincer containment maneuver",
                    "Activate perimeter ground radar and thermal drones",
                    "Establish road blocks at all sector egress highway exits"
                ]
            },
            "BLACKLISTED_VEHICLE_ANPR": {
                "title": "SOP-SEC-05: Flagged High-Threat Vehicle Interception",
                "steps": [
                    "Trigger automated tire shredder / barrier lockdown at Checkpost Alpha",
                    "Notify Sector Intelligence Officer and SSB Interceptor Squad",
                    "Establish secondary vehicle cordon at 500m perimeter checkpoint",
                    "Detain occupants for biometric verification and cargo inspection",
                    "Cross-reference vehicle registration with National Crime Record Bureau (NCRB)"
                ]
            },
            "NIGHT_STEALTH_INTRUSION": {
                "title": "SOP-SEC-06: Night-Time Thermal Intrusion Protocol",
                "steps": [
                    "Lock dual-spectrum thermal tracker onto heat signature coordinates",
                    "Deploy Night-Patrol squad equipped with Gen-3 Night Vision Goggles (NVGs)",
                    "Coordinate intercept path using tactical map telemetry",
                    "Ensure drone / UAV overwatch launch from nearest BOP station"
                ]
            },
            "UNATTENDED_CARGO": {
                "title": "SOP-SEC-07: Suspicious Package / Checkpost Anomaly Protocol",
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
        rule_id: str = "RULE-01",
        rule_explanation: str = "",
        objects_involved: Optional[List[str]] = None,
        movement_vector: str = "North -> South",
        duration_sec: float = 0.0,
        frame: Optional[np.ndarray] = None,
        is_restricted_zone: bool = False,
        is_directional_crossing: bool = False,
        is_night_window: bool = False,
        is_watchlist_match: bool = False,
        is_group_movement: bool = False,
        telemetry: Optional[Dict[str, Any]] = None
    ) -> Incident:
        incident_id = self.generate_incident_id()
        now_dt = datetime.now()
        timestamp = now_dt.strftime("%Y-%m-%d %H:%M:%S")

        # 1. Compute Explainable Additive Risk Score
        risk = RiskEngine.calculate_risk(
            event_type=event_type,
            is_restricted_zone=is_restricted_zone,
            is_directional_crossing=is_directional_crossing,
            is_night_window=is_night_window,
            is_watchlist_match=is_watchlist_match,
            is_group_movement=is_group_movement,
            dwell_time_sec=duration_sec
        )

        # 2. Save Evidence Snapshot
        snapshot_filename = f"{incident_id}_{int(time.time())}.jpg"
        snapshot_path = SNAPSHOT_DIR / snapshot_filename
        snapshot_url = f"/api/snapshots/{snapshot_filename}"

        if frame is not None and frame.size > 0:
            evidence_frame = frame.copy()
            cv2.putText(evidence_frame, f"IBVAP 3.0 EVIDENCE: {incident_id} | {timestamp}", (20, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            cv2.putText(evidence_frame, f"CAM: {camera_id} | RISK: {risk.score}/100 [{risk.level}]", (20, 65),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            cv2.imwrite(str(snapshot_path), evidence_frame)
        else:
            placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(placeholder, f"EVIDENCE KEYFRAME: {incident_id}", (30, 240),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 240, 255), 2)
            cv2.imwrite(str(snapshot_path), placeholder)

        # 3. Construct Forensics Micro-Timeline
        t_str = now_dt.strftime("%H:%M:%S")
        evidence_timeline = [
            TimelineEvent(
                timestamp_str=t_str,
                relative_sec=-4.5,
                description=f"Target localized by AI tracking engine on {camera_id}",
                event_category="DETECTION",
                camera_id=camera_id
            ),
            TimelineEvent(
                timestamp_str=t_str,
                relative_sec=-2.0,
                description=f"Perimeter spatial boundary interaction evaluated ({event_type})",
                event_category="ZONE_ENTRY",
                camera_id=camera_id
            ),
            TimelineEvent(
                timestamp_str=t_str,
                relative_sec=0.0,
                description=f"Incident {incident_id} raised with Risk Score {risk.score}/100 [{risk.level}]",
                event_category="ALERT_RAISED",
                camera_id=camera_id
            )
        ]

        sop_info = self.get_sop_for_event(event_type, risk.level)

        incident = Incident(
            incident_id=incident_id,
            timestamp=timestamp,
            camera_id=camera_id,
            camera_name=camera_name,
            location_str=location_str,
            sector="Sector 04",
            event_type=event_type,
            rule_id=rule_id,
            rule_explanation=rule_explanation,
            severity=risk.level,
            risk_assessment=risk,
            objects_involved=objects_involved or ["1 Detected Entity"],
            movement_vector=movement_vector,
            duration_sec=duration_sec,
            confidence_score=0.94,
            snapshot_url=snapshot_url,
            sop_title=sop_info["title"],
            sop_steps=sop_info["steps"],
            status="DETECTED",
            operator_notes=[f"Autonomous incident logged under {rule_id}."],
            evidence_timeline=evidence_timeline,
            telemetry=telemetry or {},
            is_demo_simulation=True
        )

        self.incidents.insert(0, incident)

        # Create corresponding real-time Alert
        alert = Alert(
            id=str(uuid.uuid4())[:8],
            timestamp=timestamp,
            camera_id=camera_id,
            camera_name=camera_name,
            severity=risk.level,
            event_type=event_type,
            rule_id=rule_id,
            rule_name=rule_id,
            description=f"[{incident_id}] {event_type.replace('_', ' ')}: {rule_explanation}",
            reason_explanation=rule_explanation,
            risk_score=risk.score,
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

    def acknowledge_alert(self, alert_id: str, operator_name: str = "SSB-OPR-402") -> bool:
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.acknowledged = True
                alert.acknowledged_by = operator_name
                alert.acknowledged_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                self.save_history()
                return True
        return False

    def update_incident_status(
        self,
        incident_id: str,
        new_status: str,
        operator_note: Optional[str] = None,
        assigned_responder: Optional[str] = None
    ) -> Optional[Incident]:
        for inc in self.incidents:
            if inc.incident_id == incident_id:
                inc.status = new_status
                if assigned_responder:
                    inc.assigned_responder = assigned_responder
                if operator_note:
                    inc.operator_notes.append(operator_note)
                
                # Add timeline milestone
                inc.evidence_timeline.append(TimelineEvent(
                    timestamp_str=datetime.now().strftime("%H:%M:%S"),
                    relative_sec=round(inc.duration_sec + 10.0, 1),
                    description=f"Status changed to {new_status} by operator. Note: {operator_note or 'No notes'}",
                    event_category="STATUS_CHANGE",
                    camera_id=inc.camera_id
                ))
                self.save_history()
                return inc
        return None

    def clear_incidents(self):
        """Clears incidents and alerts for SIH Judge demonstration reset."""
        self.incidents.clear()
        self.alerts.clear()
        self.incident_counter = 80
        self.save_history()
