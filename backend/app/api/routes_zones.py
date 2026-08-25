from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import Zone

def get_zones_router(stream_manager):
    router = APIRouter(prefix="/api/zones", tags=["Zones"])

    @router.get("/{camera_id}", response_model=List[Zone])
    def get_camera_zones(camera_id: str):
        return stream_manager.zone_engine.get_zones_for_camera(camera_id)

    @router.post("", response_model=Zone)
    def create_or_update_zone(zone: Zone):
        stream_manager.zone_engine.add_or_update_zone(zone)
        return zone

    @router.delete("/{camera_id}/{zone_id}")
    def delete_zone(camera_id: str, zone_id: str):
        stream_manager.zone_engine.delete_zone(camera_id, zone_id)
        return {"status": "success", "deleted_zone_id": zone_id}

    return router
