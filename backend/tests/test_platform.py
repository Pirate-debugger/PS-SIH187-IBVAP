import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.core.night_enhancer import NightEnhancer
from app.core.zone_engine import ZoneEngine
from app.core.anpr_engine import ANPREngine
from app.core.incident_engine import IncidentEngine
from app.core.ai_pipeline import AIPipeline
from app.core.model_adapters import ModelManager, SynthesizedDetectorAdapter, YOLOv8DetectorAdapter
from app.core.rules_engine import ExplainableRulesEngine
from app.core.risk_engine import RiskEngine
from app.core.edge_manager import EdgeManager
from app.models.schemas import Zone, TrackedObject, BoundingBox

client = TestClient(app)

def test_system_health():
    response = client.get("/api/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "IBVAP 3.0" in data["version"]

def test_system_telemetry():
    response = client.get("/api/system/telemetry")
    assert response.status_code == 200
    data = response.json()
    assert data["system_name"] == "IBVAP 3.0"
    assert "edge_queue" in data

def test_cameras_list_and_health():
    response = client.get("/api/cameras")
    assert response.status_code == 200
    cameras = response.json()
    assert len(cameras) >= 6

    # Test camera health endpoint
    health_resp = client.get("/api/cameras/BOP-CAM-01/health")
    assert health_resp.status_code == 200
    health_data = health_resp.json()
    assert health_data["health_status"] == "HEALTHY"
    assert health_data["fps"] > 0

def test_model_adapters():
    manager = ModelManager(preferred_mode="DEMO_SIMULATION")
    detector = manager.get_detector()
    assert detector is not None
    assert "Simulation" in detector.get_adapter_name()

    manager.set_mode("LIVE_AI_INFERENCE")
    assert manager.get_mode_label() == "LIVE AI INFERENCE"

def test_explainable_rules():
    engine = ExplainableRulesEngine()
    test_obj = TrackedObject(
        track_id="P-017",
        label="person",
        bbox=[0.2, 0.2, 0.4, 0.5],
        confidence=0.94,
        direction="South (Towards Border)",
        speed_kmh=14.2,
        dwell_time_sec=8.5,
        history=[[0.3, 0.35]]
    )
    test_zone = Zone(
        id="TEST-ZONE",
        camera_id="BOP-CAM-01",
        name="Zero-Line Red Zone",
        zone_type="RESTRICTED_ZONE",
        points=[[0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]],
        color="#ff3366"
    )

    res = engine.evaluate_restricted_zone(test_obj, test_zone, 8.5, "BOP-CAM-01", "02:17:42")
    assert res is not None
    assert res.rule_id == "RULE-01"
    assert "P-017" in res.explanation
    assert res.risk_points == 35

def test_risk_engine_calculation():
    assessment = RiskEngine.calculate_risk(
        event_type="RESTRICTED_ZONE_BREACH",
        is_restricted_zone=True,
        is_directional_crossing=True,
        is_night_window=True,
        dwell_time_sec=10.0
    )
    assert assessment.score >= 80
    assert assessment.level == "CRITICAL"
    assert len(assessment.factors) >= 4
    assert any(f.factor == "Restricted Red Zone" for f in assessment.factors)

def test_edge_manager_queue_and_sync():
    edge = EdgeManager()
    assert edge.get_status().central_link_status == "ONLINE"

    # Simulate WAN degradation
    edge.set_connectivity_mode(False)
    assert edge.get_status().central_link_status == "DEGRADED_OFFLINE"

    edge.record_event({"incident_id": "INC-TEST-01"})
    assert edge.get_status().queued_events_count == 1

    # Restore link
    edge.set_connectivity_mode(True)
    assert edge.get_status().central_link_status == "ONLINE"
    assert edge.get_status().queued_events_count == 0

def test_investigation_search_and_track():
    # Test search endpoint
    search_payload = {"keyword": "Zero", "severity": "ALL"}
    resp = client.post("/api/investigation/search", json=search_payload)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    # Test track journey reconstruction
    track_resp = client.get("/api/investigation/track/P-017")
    assert track_resp.status_code == 200
    track_data = track_resp.json()
    assert track_data["track_id"] == "P-017"
    assert len(track_data["journey_waypoints"]) >= 3

def test_audit_logs():
    resp = client.get("/api/audit")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

def test_judge_scenarios_control():
    reset_resp = client.post("/api/scenarios/control/reset")
    assert reset_resp.status_code == 200
    assert reset_resp.json()["status"] == "success"

    pause_resp = client.post("/api/scenarios/control/pause", json={"paused": True})
    assert pause_resp.status_code == 200
    assert pause_resp.json()["is_paused"] is True

    resume_resp = client.post("/api/scenarios/control/pause", json={"paused": False})
    assert resume_resp.status_code == 200
    assert resume_resp.json()["is_paused"] is False

def test_anpr_watchlist_check():
    response = client.get("/api/anpr/check/HR26DK8337")
    assert response.status_code == 200
    data = response.json()
    assert data["matched_watchlist"] is True
    assert data["watchlist_item"]["threat_level"] == "CRITICAL"

if __name__ == "__main__":
    pytest.main(["-v", __file__])
