from fastapi import APIRouter
from typing import List
from app.models.schemas import AuditLogEntry

def get_audit_router(stream_manager):
    router = APIRouter(prefix="/api/audit", tags=["Security Audit"])

    @router.get("", response_model=List[AuditLogEntry])
    def get_audit_logs():
        return stream_manager.audit_logger.get_logs(limit=50)

    return router
