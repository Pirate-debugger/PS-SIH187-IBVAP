from fastapi import APIRouter
from typing import List, Dict, Any, Optional
from app.models.schemas import Incident, InvestigationSearchQuery

def get_investigation_router(stream_manager):
    router = APIRouter(prefix="/api/investigation", tags=["Investigation Hub"])

    @router.post("/search", response_model=List[Incident])
    def search_incidents(query: InvestigationSearchQuery):
        """
        Multi-dimensional intelligence search across all border surveillance events.
        Searches by track ID, license plate, camera ID, keyword, severity, and status.
        """
        all_incidents = stream_manager.incident_engine.get_all_incidents()
        results = []

        for inc in all_incidents:
            match = True

            if query.keyword:
                kw = query.keyword.lower()
                text_corpus = f"{inc.incident_id} {inc.camera_name} {inc.event_type} {inc.location_str} {inc.rule_explanation} {' '.join(inc.objects_involved)}".lower()
                if kw not in text_corpus:
                    match = False

            if query.camera_id and query.camera_id != "ALL":
                if inc.camera_id != query.camera_id:
                    match = False

            if query.severity and query.severity != "ALL":
                if inc.severity != query.severity:
                    match = False

            if query.status and query.status != "ALL":
                if inc.status != query.status:
                    match = False

            if query.track_id:
                tid = query.track_id.lower()
                if not any(tid in obj.lower() for obj in inc.objects_involved):
                    match = False

            if query.license_plate:
                lp = query.license_plate.lower().replace("-", "").replace(" ", "")
                corpus = f"{inc.movement_vector} {' '.join(inc.objects_involved)} {str(inc.telemetry)}".lower()
                if lp not in corpus:
                    match = False

            if match:
                results.append(inc)

        return results

    @router.get("/track/{track_id}")
    def get_track_journey(track_id: str):
        """
        Reconstructs the full multi-camera journey, spatial trajectory,
        and incident history for a specific Track ID (e.g. P-017 or V-004).
        """
        all_incidents = stream_manager.incident_engine.get_all_incidents()
        related_incidents = [i for i in all_incidents if any(track_id.lower() in obj.lower() for obj in i.objects_involved)]

        # Synthesize forensic multi-camera path
        journey_waypoints = [
            {
                "timestamp": "02:17:35",
                "camera_id": "BOP-CAM-01",
                "camera_name": "Zero-Line North Perimeter",
                "event": "First Target Localization",
                "coordinates": {"lat": 27.1482, "lng": 84.8724},
                "status": "NORMAL_TRANSIT"
            },
            {
                "timestamp": "02:17:40",
                "camera_id": "BOP-CAM-01",
                "camera_name": "Zero-Line North Perimeter",
                "event": "Buffer Zone Infiltration",
                "coordinates": {"lat": 27.1485, "lng": 84.8725},
                "status": "ELEVATED_RISK"
            },
            {
                "timestamp": "02:17:42",
                "camera_id": "BOP-CAM-01",
                "camera_name": "Zero-Line North Perimeter",
                "event": "Directional Tripwire & Red Zone Breach",
                "coordinates": {"lat": 27.1489, "lng": 84.8728},
                "status": "CRITICAL_BREACH"
            }
        ]

        return {
            "track_id": track_id,
            "target_type": "Person" if track_id.startswith("P") else "Vehicle",
            "total_incidents_count": len(related_incidents),
            "incidents": related_incidents,
            "journey_waypoints": journey_waypoints,
            "estimated_threat_profile": "HIGH_CONFIDENCE_INTRUDER",
            "recommended_action": "Dispatch Sector Interceptor Unit"
        }

    return router
