from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.schemas import Incident, Alert

def get_incidents_router(stream_manager):
    router = APIRouter(prefix="/api/incidents", tags=["Incidents"])

    @router.get("", response_model=List[Incident])
    def get_incidents():
        return stream_manager.incident_engine.get_all_incidents()

    @router.get("/alerts", response_model=List[Alert])
    def get_alerts():
        return stream_manager.incident_engine.get_all_alerts()

    @router.post("/alerts/{alert_id}/acknowledge")
    def acknowledge_alert(alert_id: str):
        success = stream_manager.incident_engine.acknowledge_alert(alert_id)
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")
        return {"status": "success", "alert_id": alert_id, "acknowledged": True}

    @router.patch("/{incident_id}/status")
    def update_status(incident_id: str, payload: dict):
        new_status = payload.get("status", "RESOLVED")
        notes = payload.get("notes")
        inc = stream_manager.incident_engine.update_incident_status(incident_id, new_status, notes)
        if not inc:
            raise HTTPException(status_code=404, detail="Incident not found")
        return inc

    return router
