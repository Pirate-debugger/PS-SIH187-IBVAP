import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.config import DATA_DIR
from app.models.schemas import AuditLogEntry

class AuditLogger:
    """
    Security Audit Trail & Governance Logger for IBVAP 3.0.
    Tracks operator actions, privilege checks, evidence access, and system state transitions.
    """

    def __init__(self):
        self.logs: List[AuditLogEntry] = []
        self.load_logs()

    def load_logs(self):
        log_file = DATA_DIR / "audit_log.json"
        if log_file.exists():
            try:
                with open(log_file, "r") as f:
                    raw = json.load(f)
                    self.logs = [AuditLogEntry(**item) for item in raw]
            except Exception:
                self.logs = []

    def save_logs(self):
        log_file = DATA_DIR / "audit_log.json"
        try:
            with open(log_file, "w") as f:
                json.dump([l.model_dump() for l in self.logs[-200:]], f, indent=2)
        except Exception:
            pass

    def log_action(
        self,
        action_type: str,
        target_resource: str,
        details: str,
        operator_id: str = "SSB-OPR-402",
        operator_role: str = "OPERATOR"
    ) -> AuditLogEntry:
        entry = AuditLogEntry(
            id=str(uuid.uuid4())[:8],
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            operator_id=operator_id,
            operator_role=operator_role,
            action_type=action_type,
            target_resource=target_resource,
            details=details
        )
        self.logs.insert(0, entry)
        self.save_logs()
        return entry

    def get_logs(self, limit: int = 50) -> List[AuditLogEntry]:
        return self.logs[:limit]
