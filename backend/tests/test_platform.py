import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.core.night_enhancer import NightEnhancer
from app.core.zone_engine import ZoneEngine
from app.core.anpr_engine import ANPREngine
from app.core.incident_engine import IncidentEngine
from app.core.ai_pipeline import AIPipeline
from app.models.schemas import Zone, TrackedObject, BoundingBox

client = TestClient(app)

def test_system_health():
    response = client.get("/api/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["version"] == "IBVAP 2.0.0"

def test_system_telemetry():
    response = client.get("/api/system/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert data["system_name"] == "IBVAP 2.0"
    assert "active_cameras_count" in data

def test_cameras_list():
    response = client.get("/api/cameras")
    assert response.status_code == 200
    cameras = response.json()
    assert len(cameras) >= 6
    assert any(c["id"] == "BOP-CAM-01" for c in cameras)

def test_camera_mode_switch():
    response = client.post("/api/cameras/BOP-CAM-01/mode", json={"mode": "THERMAL_FLIR"})
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "THERMAL_FLIR"

def test_anpr_watchlist_check():
    # Test known watchlist plate
    response = client.get("/api/anpr/check/HR26DK8337")
    assert response.status_code == 200
    data = response.json()
    assert data["matched_watchlist"] is True
    assert data["watchlist_item"]["threat_level"] == "CRITICAL"

def test_scenarios_list_and_trigger():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    scenarios = response.json()
    assert len(scenarios) == 6

    # Trigger Scenario 1
    trig_resp = client.post("/api/scenarios/trigger/1")
    assert trig_resp.status_code == 200
    assert trig_resp.json()["camera_id"] == "BOP-CAM-01"

def test_night_enhancement_filters():
    # Create test dummy frame
    dummy = np.zeros((100, 100, 3), dtype=np.uint8)
    enhanced = NightEnhancer.enhance_low_light(dummy)
    assert enhanced.shape == (100, 100, 3)

    thermal = NightEnhancer.apply_thermal_flir(dummy)
    assert thermal.shape == (100, 100, 3)

    nvg = NightEnhancer.apply_night_vision_green(dummy)
    assert nvg.shape == (100, 100, 3)

def test_zone_engine_polygon_intrusion():
    engine = ZoneEngine()
    test_zone = Zone(
        id="TEST-ZONE-01",
        camera_id="BOP-CAM-TEST",
        name="Test Red Zone",
        zone_type="RESTRICTED_ZONE",
        points=[[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]],
        color="#ff3366",
        severity_on_breach="CRITICAL"
    )
    engine.set_zones_for_camera("BOP-CAM-TEST", [test_zone])

    # Object inside zone
    obj = TrackedObject(
        track_id="P-99",
        label="person",
        bbox=[0.2, 0.2, 0.4, 0.5],
        confidence=0.9,
        direction="South",
        speed_kmh=12.0,
        dwell_time_sec=2.0,
        history=[[0.3, 0.35]]
    )

    violations = engine.check_intrusions("BOP-CAM-TEST", [obj], current_time=100.0)
    assert len(violations) >= 1
    assert violations[0]["event_type"] == "RESTRICTED_ZONE_BREACH"
    assert violations[0]["severity"] == "CRITICAL"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
