import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
SNAPSHOT_DIR = DATA_DIR / "snapshots"
REPORTS_DIR = DATA_DIR / "reports"

SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# System Metadata
SYSTEM_NAME = "IBVAP 2.0"
SYSTEM_LONG_NAME = "Intelligent Border Video Analytics Platform"
AGENCY = "Sashastra Seema Bal (SSB) | Ministry of Home Affairs"
SECTOR = "Sector 04 - Indo-Border Perimeter (Zero-Line Grid)"

# Camera Outpost Specifications
DEFAULT_CAMERAS = [
    {
        "id": "BOP-CAM-01",
        "name": "Zero-Line North Perimeter (BOP-01)",
        "location": "Sector 4 - Pillar 84/2",
        "type": "Fixed PTZ 4K IR",
        "fps": 25,
        "resolution": "1920x1080",
        "status": "ONLINE",
        "night_mode_available": True,
        "active_mode": "STANDARD",  # STANDARD, LOW_LIGHT_ENHANCED, THERMAL_FLIR, NIGHT_VISION_GREEN
        "lat": 27.1482,
        "lng": 84.8724,
        "heading": 350,
        "fov": 85,
        "scenario_id": 1,
    },
    {
        "id": "BOP-CAM-02",
        "name": "Perimeter Buffer Fence (BOP-02)",
        "location": "Sector 4 - Western Wire Grid",
        "type": "Wide-Angle CCTV 1080p",
        "fps": 25,
        "resolution": "1920x1080",
        "status": "ONLINE",
        "night_mode_available": True,
        "active_mode": "STANDARD",
        "lat": 27.1495,
        "lng": 84.8681,
        "heading": 45,
        "fov": 95,
        "scenario_id": 2,
    },
    {
        "id": "BOP-CAM-03",
        "name": "Checkpost Alpha Vehicle Gate",
        "location": "Highway Access Point 3",
        "type": "ANPR High-Speed Optical",
        "fps": 30,
        "resolution": "1920x1080",
        "status": "ONLINE",
        "night_mode_available": True,
        "active_mode": "STANDARD",
        "lat": 27.1430,
        "lng": 84.8750,
        "heading": 180,
        "fov": 65,
        "scenario_id": 3,
    },
    {
        "id": "BOP-CAM-04",
        "name": "Riverine Marsh Crossing (BOP-04)",
        "location": "Mechi River Sector",
        "type": "Thermal/IR Long-Range Dual",
        "fps": 25,
        "resolution": "1920x1080",
        "status": "ONLINE",
        "night_mode_available": True,
        "active_mode": "THERMAL_FLIR",
        "lat": 27.1530,
        "lng": 84.8810,
        "heading": 120,
        "fov": 75,
        "scenario_id": 4,
    },
    {
        "id": "BOP-CAM-05",
        "name": "North Boundary Line (BOP-05)",
        "location": "Sector 4 - Pillar 85/1",
        "type": "Low-Light Starvis Camera",
        "fps": 25,
        "resolution": "1920x1080",
        "status": "ONLINE",
        "night_mode_available": True,
        "active_mode": "STANDARD",
        "lat": 27.1560,
        "lng": 84.8700,
        "heading": 15,
        "fov": 90,
        "scenario_id": 5,
    },
    {
        "id": "BOP-CAM-06",
        "name": "Transit Checkpost Gate Bravo",
        "location": "BOP Secondary Barrier Gate",
        "type": "HD Inspection Camera",
        "fps": 25,
        "resolution": "1920x1080",
        "status": "ONLINE",
        "night_mode_available": True,
        "active_mode": "STANDARD",
        "lat": 27.1415,
        "lng": 84.8710,
        "heading": 210,
        "fov": 70,
        "scenario_id": 6,
    }
]

# Detection & Tracking Constants
CONFIDENCE_THRESHOLD = 0.45
IOU_THRESHOLD = 0.40
LOITERING_TIME_THRESHOLD_SEC = 6.0  # seconds in zone to trigger loitering alarm
NIGHT_LIGHT_THRESHOLD = 60  # Average frame brightness below this is low-light

# Server Configuration
HOST = "0.0.0.0"
PORT = 8000
