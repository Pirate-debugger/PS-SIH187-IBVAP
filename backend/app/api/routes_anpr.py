from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import WatchlistItem

def get_anpr_router(stream_manager):
    router = APIRouter(prefix="/api/anpr", tags=["ANPR & Watchlist"])

    @router.get("/watchlist", response_model=List[WatchlistItem])
    def get_watchlist():
        return stream_manager.anpr_engine.get_all_watchlist()

    @router.post("/watchlist", response_model=WatchlistItem)
    def add_to_watchlist(item: WatchlistItem):
        stream_manager.anpr_engine.add_watchlist_item(item)
        return item

    @router.delete("/watchlist/{plate_number}")
    def delete_watchlist_item(plate_number: str):
        stream_manager.anpr_engine.remove_watchlist_item(plate_number)
        return {"status": "success", "removed_plate": plate_number}

    @router.get("/check/{plate_number}")
    def check_plate(plate_number: str):
        is_hit, item = stream_manager.anpr_engine.match_watchlist(plate_number)
        return {
            "plate_number": plate_number,
            "matched_watchlist": is_hit,
            "watchlist_item": item.model_dump() if item else None
        }

    return router
