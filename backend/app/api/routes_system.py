from fastapi import APIRouter
from app.models.schemas import SystemTelemetry

def get_system_router(stream_manager):
    router = APIRouter(prefix="/api/system", tags=["System"])

    @router.get("/telemetry", response_model=SystemTelemetry)
    def get_telemetry():
        return stream_manager.get_system_telemetry()

    @router.get("/health")
    def health_check():
        return {
            "status": "HEALTHY",
            "version": "IBVAP 2.0.0",
            "active_cameras": len(stream_manager.cameras),
            "ai_engine": "ONLINE",
            "anpr_engine": "ONLINE",
            "zone_engine": "ONLINE"
        }

    return router
