from fastapi import APIRouter
from app.models.schemas import SystemTelemetry, EdgeQueueStatus

def get_system_router(stream_manager):
    router = APIRouter(prefix="/api/system", tags=["System & Edge Diagnostics"])

    @router.get("/telemetry", response_model=SystemTelemetry)
    def get_telemetry():
        return stream_manager.get_system_telemetry()

    @router.get("/health")
    def health_check():
        return {
            "status": "HEALTHY",
            "version": "IBVAP 3.0.0-PROD",
            "active_cameras": len(stream_manager.cameras),
            "ai_engine": "ONLINE",
            "anpr_engine": "ONLINE",
            "zone_engine": "ONLINE",
            "rules_engine": "ONLINE",
            "edge_first_mode": "ACTIVE"
        }

    @router.post("/edge/connectivity")
    def set_edge_connectivity(payload: dict):
        """Simulates degraded WAN connection between remote border outpost and central command."""
        online = payload.get("online", True)
        stream_manager.edge_manager.set_connectivity_mode(online)
        stream_manager.audit_logger.log_action(
            action_type="EDGE_CONNECTIVITY_TOGGLE",
            target_resource="WAN_UPLINK",
            details=f"Switched WAN link to {'ONLINE' if online else 'DEGRADED_OFFLINE'}"
        )
        return stream_manager.edge_manager.get_status()

    @router.get("/edge/status", response_model=EdgeQueueStatus)
    def get_edge_status():
        return stream_manager.edge_manager.get_status()

    return router
