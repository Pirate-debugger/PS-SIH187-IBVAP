from fastapi import APIRouter, HTTPException

def get_scenarios_router(stream_manager):
    router = APIRouter(prefix="/api/scenarios", tags=["Demo Scenarios"])

    SCENARIOS_CATALOG = [
        {
            "id": 1,
            "title": "Scenario 1: Zero-Line Restricted Zone Intrusion",
            "camera_id": "BOP-CAM-01",
            "target_type": "Person",
            "description": "An unidentified individual breaches the Zero-Line wire fence and infiltrates the Red Restricted Zone.",
            "expected_alert": "CRITICAL: RESTRICTED_ZONE_BREACH (INC-2026-0081)",
            "sop": "SOP-SEC-01: QRF Team Alpha Deployment"
        },
        {
            "id": 2,
            "title": "Scenario 2: Perimeter Loitering Suspicion",
            "camera_id": "BOP-CAM-02",
            "target_type": "Person",
            "description": "A subject paces back and forth along the Western wire grid for over 8 seconds, triggering loitering suspicion.",
            "expected_alert": "MEDIUM: LOITERING_DETECTED (INC-2026-0082)",
            "sop": "SOP-SEC-02: Foot Patrol Reconnaissance"
        },
        {
            "id": 3,
            "title": "Scenario 3: Blacklisted Vehicle & ANPR Trigger",
            "camera_id": "BOP-CAM-03",
            "target_type": "Vehicle (Bolero)",
            "description": "A Mahindra Bolero with plate HR26DK8337 approaches Checkpost Alpha. Optical OCR matches the Smuggler Watchlist.",
            "expected_alert": "HIGH: BLACKLISTED_VEHICLE_ANPR (INC-2026-0083)",
            "sop": "SOP-SEC-03: Barrier Gate Lockdown"
        },
        {
            "id": 4,
            "title": "Scenario 4: Night-Time Stealth Infiltration",
            "camera_id": "BOP-CAM-04",
            "target_type": "Crawling Person",
            "description": "In pitch darkness along the riverine marsh, low-light Retinex and Thermal FLIR reveal a crawling stealth intruder.",
            "expected_alert": "CRITICAL: NIGHT_STEALTH_INTRUSION (INC-2026-0084)",
            "sop": "SOP-SEC-04: Night Vision Patrol & Thermal Lock"
        },
        {
            "id": 5,
            "title": "Scenario 5: Multi-Person Directional Perimeter Breach",
            "camera_id": "BOP-CAM-05",
            "target_type": "Group of 3 Persons",
            "description": "A group of 3 infiltrators crosses the virtual boundary line moving from North to South towards the Zero Line.",
            "expected_alert": "HIGH: DIRECTIONAL_PERIMETER_BREACH (INC-2026-0085)",
            "sop": "SOP-SEC-05: Coordinate Intercept & Cordon"
        },
        {
            "id": 6,
            "title": "Scenario 6: Checkpost Anomaly / Unattended Cargo",
            "camera_id": "BOP-CAM-06",
            "target_type": "Unattended Object",
            "description": "An unattended package/cargo is left near Barrier Gate Bravo, detected as a stationary obstruction anomaly.",
            "expected_alert": "MEDIUM: UNATTENDED_CARGO (INC-2026-0086)",
            "sop": "SOP-SEC-06: Bomb Disposal & Canine Sweep"
        }
    ]

    @router.get("")
    def list_scenarios():
        return SCENARIOS_CATALOG

    @router.post("/trigger/{scenario_id}")
    def trigger_scenario(scenario_id: int):
        if scenario_id < 1 or scenario_id > 6:
            raise HTTPException(status_code=400, detail="Invalid scenario ID (Must be 1-6)")

        target_scenario = next((s for s in SCENARIOS_CATALOG if s["id"] == scenario_id), None)
        if target_scenario:
            cam_id = target_scenario["camera_id"]
            stream_manager.set_camera_scenario(cam_id, scenario_id)
            return {
                "status": "triggered",
                "scenario": target_scenario,
                "camera_id": cam_id
            }
        raise HTTPException(status_code=404, detail="Scenario not found")

    return router
