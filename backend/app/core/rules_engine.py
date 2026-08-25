import time
from typing import List, Dict, Any, Optional
from app.models.schemas import TrackedObject, Zone

class RuleResult:
    def __init__(
        self,
        rule_id: str,
        rule_name: str,
        event_type: str,
        severity: str,
        explanation: str,
        contributing_factor: str,
        risk_points: int,
        track_id: Optional[str] = None,
        camera_id: Optional[str] = None,
        zone_id: Optional[str] = None
    ):
        self.rule_id = rule_id
        self.rule_name = rule_name
        self.event_type = event_type
        self.severity = severity
        self.explanation = explanation
        self.contributing_factor = contributing_factor
        self.risk_points = risk_points
        self.track_id = track_id
        self.camera_id = camera_id
        self.zone_id = zone_id

class ExplainableRulesEngine:
    """
    Explainable Border Security Event Engine (SIH2026187).
    Replaces opaque black-box alerts with deterministic, auditable rules
    that explicitly answer: WHY WAS THIS FLAGGED?
    """

    def __init__(self):
        self.recent_crossings: List[Dict[str, Any]] = []  # tracks recent tripwire events for group detection

    def evaluate_restricted_zone(self, obj: TrackedObject, zone: Zone, dwell_sec: float, camera_id: str, timestamp_str: str) -> Optional[RuleResult]:
        """RULE 01: Person / Object Enters Red Restricted Zone."""
        if zone.zone_type == "RESTRICTED_ZONE":
            explanation = (
                f"{obj.label.capitalize()} ({obj.track_id}) entered {zone.name} "
                f"at {timestamp_str}. Dwell: {dwell_sec:.1f}s, Vector: {obj.direction}."
            )
            return RuleResult(
                rule_id="RULE-01",
                rule_name="Restricted Zone Breach",
                event_type="RESTRICTED_ZONE_BREACH",
                severity=zone.severity_on_breach or "CRITICAL",
                explanation=explanation,
                contributing_factor="Restricted Red Zone Violation",
                risk_points=35,
                track_id=obj.track_id,
                camera_id=camera_id,
                zone_id=zone.id
            )
        return None

    def evaluate_directional_tripwire(self, obj: TrackedObject, zone: Zone, direction_str: str, camera_id: str, timestamp_str: str) -> RuleResult:
        """RULE 02: Person Crosses Directional Virtual Tripwire Toward Protected Area."""
        explanation = (
            f"{obj.label.capitalize()} ({obj.track_id}) breached {zone.name} "
            f"crossing heading {direction_str} toward the protected zero line at {timestamp_str}."
        )
        return RuleResult(
            rule_id="RULE-02",
            rule_name="Directional Tripwire Infiltration",
            event_type="DIRECTIONAL_PERIMETER_BREACH",
            severity="HIGH",
            explanation=explanation,
            contributing_factor="Directional Tripwire Breach (North -> South)",
            risk_points=25,
            track_id=obj.track_id,
            camera_id=camera_id,
            zone_id=zone.id
        )

    def evaluate_loitering(self, obj: TrackedObject, zone: Zone, dwell_sec: float, camera_id: str, timestamp_str: str) -> Optional[RuleResult]:
        """RULE 03: Prolonged Presence Inside Monitored Zone Exceeding Dwell Threshold."""
        if zone.zone_type == "LOITERING_ZONE" and dwell_sec >= zone.loitering_threshold_sec:
            explanation = (
                f"Subject ({obj.track_id}) lingered inside {zone.name} for {dwell_sec:.1f}s "
                f"(Exceeds security threshold of {zone.loitering_threshold_sec:.1f}s) at {timestamp_str}."
            )
            return RuleResult(
                rule_id="RULE-03",
                rule_name="Suspicious Perimeter Loitering",
                event_type="LOITERING_DETECTED",
                severity="MEDIUM",
                explanation=explanation,
                contributing_factor="Prolonged Dwell Time Loitering",
                risk_points=20,
                track_id=obj.track_id,
                camera_id=camera_id,
                zone_id=zone.id
            )
        return None

    def evaluate_group_movement(self, camera_id: str, current_time: float, timestamp_str: str) -> Optional[RuleResult]:
        """RULE 04: Multiple Persons Breaching Perimeter within a Tight Temporal Window."""
        # Prune older than 5.0 seconds
        self.recent_crossings = [c for c in self.recent_crossings if current_time - c["time"] <= 5.0]
        cam_crossings = [c for c in self.recent_crossings if c["camera_id"] == camera_id]

        if len(cam_crossings) >= 2:
            track_ids = [c["track_id"] for c in cam_crossings]
            explanation = (
                f"Coordinated group breach detected: {len(cam_crossings)} targets ({', '.join(track_ids)}) "
                f"crossed perimeter in {camera_id} within 5.0s at {timestamp_str}."
            )
            return RuleResult(
                rule_id="RULE-04",
                rule_name="Coordinated Group Boundary Breach",
                event_type="GROUP_MOVEMENT_BREACH",
                severity="HIGH",
                explanation=explanation,
                contributing_factor="Multi-Person Coordinated Infiltration",
                risk_points=25,
                camera_id=camera_id
            )
        return None

    def evaluate_watchlist_vehicle(self, obj: TrackedObject, plate: str, wl_threat: str, wl_reason: str, camera_id: str, timestamp_str: str) -> RuleResult:
        """RULE 05: License Plate Matched Against Border Security Watchlist."""
        explanation = (
            f"Vehicle ({obj.track_id}) with license plate [{plate}] detected at {camera_id}. "
            f"Matched {wl_threat} Watchlist: '{wl_reason}' at {timestamp_str}."
        )
        return RuleResult(
            rule_id="RULE-05",
            rule_name="Watchlist Vehicle Interception",
            event_type="BLACKLISTED_VEHICLE_ANPR",
            severity="HIGH" if wl_threat != "CRITICAL" else "CRITICAL",
            explanation=explanation,
            contributing_factor=f"Contraband Watchlist Match ({plate})",
            risk_points=40,
            track_id=obj.track_id,
            camera_id=camera_id
        )

    def evaluate_night_stealth_movement(self, obj: TrackedObject, camera_id: str, timestamp_str: str) -> RuleResult:
        """RULE 06: Target Movement Detected During Configured Night Surveillance Window."""
        explanation = (
            f"Low-light stealth movement detected in {camera_id} at {timestamp_str}. "
            f"Target ({obj.track_id}) velocity: {obj.speed_kmh} km/h."
        )
        return RuleResult(
            rule_id="RULE-06",
            rule_name="Night-Time Stealth Infiltration",
            event_type="NIGHT_STEALTH_INTRUSION",
            severity="CRITICAL",
            explanation=explanation,
            contributing_factor="Low-Light Stealth Movement",
            risk_points=20,
            track_id=obj.track_id,
            camera_id=camera_id
        )

    def evaluate_unattended_cargo(self, camera_id: str, timestamp_str: str) -> RuleResult:
        """RULE 07: Stationary Unattended Object / Barrier Obstruction."""
        explanation = (
            f"Stationary cargo package left unattended near barrier at {camera_id} at {timestamp_str}. "
            f"Obstruction dwell exceeds standoff safety threshold."
        )
        return RuleResult(
            rule_id="RULE-07",
            rule_name="Unattended Cargo Anomaly",
            event_type="UNATTENDED_CARGO",
            severity="MEDIUM",
            explanation=explanation,
            contributing_factor="Stationary Cargo Obstruction",
            risk_points=15,
            camera_id=camera_id
        )
