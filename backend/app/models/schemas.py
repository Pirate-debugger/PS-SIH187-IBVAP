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
    track_id: str  # e.g. "P-17", "V-04"
    label: str    # "person", "car", "truck", "motorcycle", "bus"
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
    watchlist_flag: Optional[str] = None  # None, "BLACK_LIST", "STOLEN", "SUSPECT", "VIP"

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

class Alert(BaseModel):
    id: str
    timestamp: str
    camera_id: str
    camera_name: str
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    event_type: str  # "RESTRICTED_ZONE_BREACH", "LOITERING_DETECTED", "BLACKLISTED_VEHICLE_ANPR", "NIGHT_STEALTH_INTRUSION", "DIRECTIONAL_PERIMETER_BREACH", "UNATTENDED_CARGO"
    description: str
    track_id: Optional[str] = None
    object_type: Optional[str] = None
    snapshot_url: Optional[str] = None
    acknowledged: bool = False

class Incident(BaseModel):
    incident_id: str  # "INC-2026-0081"
    timestamp: str
    camera_id: str
    camera_name: str
    location_str: str
    event_type: str
    severity: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    objects_involved: List[str]  # ["1 Person (Track P-17)"]
    movement_vector: str  # "North -> South (Towards Zero Line)"
    duration_sec: float
    snapshot_url: str
    video_snippet_url: Optional[str] = None
    sop_title: str
    sop_steps: List[str]
    status: str = "ACTIVE"  # "ACTIVE", "DISPATCHED", "RESOLVED"
    notes: Optional[str] = None
    telemetry: Dict[str, Any] = {}

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

class CameraStatus(BaseModel):
    id: str
    name: str
    location: str
    type: str
    fps: int
    resolution: str
    status: str
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

class SystemTelemetry(BaseModel):
    system_name: str
    agency: str
    sector: str
    timestamp: str
    threat_level: str  # "DEFCON 1", "DEFCON 2", "DEFCON 3", "NORMAL"
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
