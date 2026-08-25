import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from app.models.schemas import CameraStatus, CameraHealth

def get_cameras_router(stream_manager):
    router = APIRouter(prefix="/api/cameras", tags=["Cameras"])

    @router.get("", response_model=List[CameraStatus])
    def list_cameras():
        return stream_manager.get_all_cameras()

    @router.get("/{camera_id}", response_model=CameraStatus)
    def get_camera(camera_id: str):
        cam = stream_manager.get_camera(camera_id)
        if not cam:
            raise HTTPException(status_code=404, detail="Camera not found")
        return cam

    @router.get("/{camera_id}/health", response_model=CameraHealth)
    def get_camera_health(camera_id: str):
        cam = stream_manager.get_camera(camera_id)
        if not cam or not cam.health:
            raise HTTPException(status_code=404, detail="Camera health telemetry not found")
        return cam.health

    @router.post("/{camera_id}/mode")
    def set_camera_mode(camera_id: str, payload: dict):
        mode = payload.get("mode", "STANDARD")
        stream_manager.set_camera_mode(camera_id, mode)
        return {"status": "success", "camera_id": camera_id, "mode": mode}

    @router.get("/{camera_id}/stream")
    def stream_camera_mjpeg(camera_id: str):
        """Streams live video frame by frame as standard MJPEG (Multipart JPEG)"""
        async def frame_generator():
            while True:
                frame_bytes = stream_manager.latest_frames.get(camera_id)
                if frame_bytes:
                    yield (b"--frame\r\n"
                           b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n")
                await asyncio.sleep(0.04)  # ~25 FPS

        return StreamingResponse(
            frame_generator(),
            media_type="multipart/x-mixed-replace; boundary=frame"
        )

    return router
