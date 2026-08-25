import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.models.schemas import EdgeQueueStatus

class EdgeManager:
    """
    Edge-First Processing & Degraded Connectivity Manager.
    Simulates real-world remote border outpost deployment where WAN connectivity
    to central command is intermittent or jammed.
    """

    def __init__(self):
        self.central_link_online: bool = True
        self.edge_engine_online: bool = True
        self.queued_events: List[Dict[str, Any]] = []
        self.last_sync_time: str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def set_connectivity_mode(self, is_online: bool):
        self.central_link_online = is_online
        if is_online and self.queued_events:
            # Sync queued items when link restored
            self.last_sync_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[EdgeManager] Central link restored. Synchronized {len(self.queued_events)} local edge events.")
            self.queued_events.clear()

    def record_event(self, event_data: Dict[str, Any]):
        if not self.central_link_online:
            self.queued_events.append({
                "queued_at": time.time(),
                "event": event_data
            })
            print(f"[EdgeManager] Link offline. Queued event locally on edge node. Total queued: {len(self.queued_events)}")

    def get_status(self) -> EdgeQueueStatus:
        return EdgeQueueStatus(
            central_link_status="ONLINE" if self.central_link_online else "DEGRADED_OFFLINE",
            edge_engine_status="ONLINE" if self.edge_engine_online else "PAUSED",
            queued_events_count=len(self.queued_events),
            last_sync_timestamp=self.last_sync_time,
            sync_progress_percent=100.0 if self.central_link_online else 45.0
        )
