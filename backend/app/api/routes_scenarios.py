from fastapi import APIRouter, HTTPException

def get_scenarios_router(stream_manager):
    router = APIRouter(prefix="/api/scenarios", tags=["Demo Scenarios & Judge Mode"])

    SCENARIOS_CATALOG = [
        {
            "id": 1,
            "title": "Scenario 1: Zero-Line Restricted Zone Intrusion",
            "camera_id": "BOP-CAM-01",
            "target_type": "Person",
            "rule_id": "RULE-01",
            "description": "An unidentified individual breaches the Zero-Line wire fence and infiltrates the Red Restricted Zone.",
            "expected_alert": "CRITICAL: RESTRICTED_ZONE_BREACH (INC-2026-0081)",
            "sop": "SOP-SEC-01: QRF Team Alpha Deployment"
        },
        {
            "id": 2,
            "title": "Scenario 2: Perimeter Loitering Suspicion",
            "camera_id": "BOP-CAM-02",
            "target_type": "Person",
            "rule_id": "RULE-03",
            "description": "A subject paces back and forth along the Western wire grid for over 8 seconds, triggering loitering suspicion.",
            "expected_alert": "MEDIUM: LOITERING_DETECTED (INC-2026-0082)",
            "sop": "SOP-SEC-03: Foot Patrol Reconnaissance"
        },
        {
            "id": 3,
            "title": "Scenario 3: Blacklisted Vehicle & ANPR Trigger",
            "camera_id": "BOP-CAM-03",
            "target_type": "Vehicle (Bolero)",
            "rule_id": "RULE-05",
            "description": "A Mahindra Bolero with plate HR26DK8337 approaches Checkpost Alpha. Optical OCR matches the Smuggler Watchlist.",
            "expected_alert": "HIGH: BLACKLISTED_VEHICLE_ANPR (INC-2026-0083)",
            "sop": "SOP-SEC-05: Barrier Gate Lockdown"
        },
        {
            "id": 4,
            "title": "Scenario 4: Night-Time Stealth Infiltration",
            "camera_id": "BOP-CAM-04",
            "target_type": "Crawling Person",
            "rule_id": "RULE-06",
            "description": "In pitch darkness along the riverine marsh, low-light Retinex and Thermal FLIR reveal a crawling stealth intruder.",
            "expected_alert": "CRITICAL: NIGHT_STEALTH_INTRUSION (INC-2026-0084)",
            "sop": "SOP-SEC-06: Night Vision Patrol & Thermal Lock"
        },
        {
            "id": 5,
            "title": "Scenario 5: Multi-Person Directional Perimeter Breach",
            "camera_id": "BOP-CAM-05",
            "target_type": "Group of 3 Persons",
            "rule_id": "RULE-04",
            "description": "A group of 3 infiltrators crosses the virtual boundary line moving from North to South towards the Zero Line.",
            "expected_alert": "HIGH: GROUP_MOVEMENT_BREACH (INC-2026-0085)",
            "sop": "SOP-SEC-04: Coordinate Intercept & Cordon"
        },
        {
            "id": 6,
            "title": "Scenario 6: Checkpost Anomaly / Unattended Cargo",
            "camera_id": "BOP-CAM-06",
            "target_type": "Unattended Object",
            "rule_id": "RULE-07",
            "description": "An unattended package/cargo is left near Barrier Gate Bravo, detected as a stationary obstruction anomaly.",
            "expected_alert": "MEDIUM: UNATTENDED_CARGO (INC-2026-0086)",
            "sop": "SOP-SEC-07: Bomb Disposal & Canine Sweep"
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

    @router.post("/control/reset")
    def reset_all_scenarios():
        """Resets all cameras to default nominal scenario states."""
        for cam in stream_manager.cameras.values():
            cam.scenario_id = 1
        stream_manager.simulator.frame_counts.clear()
        stream_manager.incident_engine.clear_incidents()
        stream_manager.audit_logger.log_action(
            action_type="RESET_SCENARIOS",
            target_resource="ALL_CAMERAS",
            details="Reset all camera feeds and cleared incident queue for SIH demo"
        )
        return {"status": "success", "message": "All scenarios and incidents reset cleanly."}

    @router.post("/control/pause")
    def toggle_pause(payload: dict):
        pause = payload.get("paused", False)
        stream_manager.is_paused = pause
        return {"status": "success", "is_paused": pause}

    @router.post("/control/clear-incidents")
    def clear_incidents():
        stream_manager.incident_engine.clear_incidents()
        return {"status": "success", "message": "Incident queue cleared."}

    return router
