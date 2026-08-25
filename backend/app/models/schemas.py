from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field
from datetime import datetime

class Point(BaseModel):
    x: float  # Normalized 0.0 - 1.0 or pixel coordinate
    y: float

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    label: str
    class_id: int

class TrackedObject(BaseModel):
    track_id: str  # e.g. "P-017", "V-004"
    label: str    # "person", "car", "truck", "motorcycle", "bus", "patrol_vehicle"
    bbox: List[float]  # [x1, y1, x2, y2]
    confidence: float
    direction: str  # "North", "South", "East", "West", "North-East", etc.
    speed_kmh: float
    dwell_time_sec: float
    history: List[List[float]] = []  # [[x, y], ...] centroid history
    is_in_restricted_zone: bool = False
    is_loitering: bool = False
    license_plate: Optional[str] = None
    plate_confidence: Optional[float] = None
    watchlist_flag: Optional[str] = None  # None, "BLACK_LIST", "STOLEN", "SUSPECT", "WHITE_LIST"
    first_seen_time: float = 0.0
    last_seen_time: float = 0.0
    camera_id: str = "BOP-CAM-01"

class Zone(BaseModel):
    id: str
    camera_id: str
    name: str
    zone_type: str  # "RESTRICTED_ZONE", "SAFE_ZONE", "BUFFER_ZONE", "VIRTUAL_FENCE", "LOITERING_ZONE"
    points: List[List[float]]  # [[x1, y1], [x2, y2], ...] normalized 0.0-1.0
    color: str  # "#ff3366", "#00ff88", "#ffb700", "#00f0ff"
    severity_on_breach: str = "HIGH"  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    tripwire_direction: Optional[str] = "NORTH_TO_SOUTH"  # For virtual fence
    loitering_threshold_sec: float = 6.0
    active: bool = True

class RiskFactor(BaseModel):
    factor: str
    points: int
    description: str

class RiskAssessment(BaseModel):
    score: int  # 0 to 100
    level: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    factors: List[RiskFactor] = []
    calculation_summary: str = ""

class TimelineEvent(BaseModel):
    timestamp_str: str
    relative_sec: float
    description: str
    event_category: str  # "DETECTION", "ZONE_ENTRY", "TRIPWIRE_BREACH", "ALERT_RAISED", "OPERATOR_ACTION", "STATUS_CHANGE"
    camera_id: str

class Alert(BaseModel):
    id: str
    timestamp: str
    camera_id: str
    camera_name: str
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"
    event_type: str
    rule_id: str = "RULE-01"
    rule_name: str = "Restricted Zone Breach"
    description: str
    reason_explanation: str = ""
    risk_score: int = 75
    track_id: Optional[str] = None
    object_type: Optional[str] = None
    snapshot_url: Optional[str] = None
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_time: Optional[str] = None

class Incident(BaseModel):
    incident_id: str  # "INC-2026-0081"
    timestamp: str
    camera_id: str
    camera_name: str
    location_str: str
    sector: str = "Sector 04"
    event_type: str
    rule_id: str = "RULE-01"
    rule_explanation: str = ""
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    risk_assessment: Optional[RiskAssessment] = None
    objects_involved: List[str]  # ["1 Person (Track P-017)"]
    movement_vector: str  # "North -> South (Towards Zero Line)"
    duration_sec: float
    confidence_score: float = 0.94
    snapshot_url: str
    video_snippet_url: Optional[str] = None
    sop_title: str
    sop_steps: List[str]
    status: str = "DETECTED"  # "DETECTED", "TRIAGED", "ACKNOWLEDGED", "UNDER_INVESTIGATION", "RESOLVED", "ARCHIVED"
    assigned_responder: Optional[str] = None
    operator_notes: List[str] = []
    evidence_timeline: List[TimelineEvent] = []
    telemetry: Dict[str, Any] = {}
    is_demo_simulation: bool = True

class WatchlistItem(BaseModel):
    plate_number: str
    vehicle_type: str
    vehicle_make_model: str
    color: str
    threat_level: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW", "WHITE_LIST"
    reason: str        # "Arms Trafficking Suspect", "Stolen Bolero", "Banned Smuggler Convoy", "SSB Patrol Whitelist"
    registered_owner: str
    reported_date: str
    active: bool = True
    is_synthetic_demo: bool = True

class ANPRRecord(BaseModel):
    id: str
    timestamp: str
    camera_id: str
    camera_name: str
    plate_number: str
    vehicle_type: str
    confidence: float
    snapshot_url: str
    matched_watchlist: bool = False
    watchlist_threat: Optional[str] = None
    watchlist_reason: Optional[str] = None
    is_synthetic_demo: bool = True

class CameraHealth(BaseModel):
    camera_id: str
    fps: float
    target_fps: float = 25.0
    latency_ms: float
    dropped_frames_rate: float
    bitrate_kbps: float
    health_status: str  # "HEALTHY", "DEGRADED", "OFFLINE"
    last_heartbeat: str
    recommendation: Optional[str] = None

class CameraStatus(BaseModel):
    id: str
    name: str
    location: str
    sector: str = "Sector 04"
    type: str
    fps: int
    resolution: str
    status: str  # "ONLINE", "DEGRADED", "OFFLINE"
    source_type: str = "DEMO_SIMULATION"  # "LIVE_RTSP", "IP_CCTV", "DEMO_SIMULATION", "UPLOADED_VIDEO", "WEBCAM"
    night_mode_available: bool
    active_mode: str  # "STANDARD", "LOW_LIGHT_ENHANCED", "THERMAL_FLIR", "NIGHT_VISION_GREEN"
    lat: float
    lng: float
    heading: float
    fov: float
    current_persons: int = 0
    current_vehicles: int = 0
    active_incidents_count: int = 0
    scenario_id: int = 1
    health: Optional[CameraHealth] = None

class EdgeQueueStatus(BaseModel):
    central_link_status: str  # "ONLINE", "DEGRADED_OFFLINE"
    edge_engine_status: str   # "ONLINE", "PAUSED"
    queued_events_count: int
    last_sync_timestamp: Optional[str] = None
    sync_progress_percent: float = 100.0

class AuditLogEntry(BaseModel):
    id: str
    timestamp: str
    operator_id: str
    operator_role: str  # "OPERATOR", "COMMANDER", "SYSTEM"
    action_type: str    # "ACKNOWLEDGE_ALERT", "STATUS_CHANGE", "ZONE_EDIT", "WATCHLIST_EDIT", "DOSSIER_EXPORT", "SCENARIO_TRIGGER"
    target_resource: str
    details: str

class SystemTelemetry(BaseModel):
    system_name: str
    system_version: str = "IBVAP 3.0"
    agency: str
    sector: str
    timestamp: str
    threat_level: str  # "DEFCON 1 (MAX ALERT)", "DEFCON 2 (HIGH THREAT)", "DEFCON 3 (ELEVATED)", "NORMAL (MONITORING)"
    active_inference_mode: str = "DEMO SIMULATION"  # "LIVE AI INFERENCE", "RECORDED VIDEO", "DEMO SIMULATION"
    active_cameras_count: int
    total_cameras_count: int
    persons_monitored: int
    vehicles_tracked: int
    total_incidents: int
    active_critical_alerts: int
    ai_inference_fps: float
    pipeline_latency_ms: float
    edge_cpu_percent: float
    edge_gpu_percent: float
    bandwidth_saved_percent: float
    edge_queue: Optional[EdgeQueueStatus] = None

class InvestigationSearchQuery(BaseModel):
    keyword: Optional[str] = None
    camera_id: Optional[str] = None
    object_type: Optional[str] = None
    track_id: Optional[str] = None
    license_plate: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
