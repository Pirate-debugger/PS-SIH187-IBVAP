import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import SNAPSHOT_DIR, REPORTS_DIR, SYSTEM_NAME, SYSTEM_LONG_NAME, AGENCY, BASE_DIR
from app.core.stream_manager import StreamManager
from app.api.routes_cameras import get_cameras_router
from app.api.routes_zones import get_zones_router
from app.api.routes_incidents import get_incidents_router
from app.api.routes_anpr import get_anpr_router
from app.api.routes_scenarios import get_scenarios_router
from app.api.routes_system import get_system_router
from app.api.routes_investigation import get_investigation_router
from app.api.routes_audit import get_audit_router

# Initialize single orchestrator instance
stream_manager = StreamManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: launch background multi-camera stream processing loop
    loop_task = asyncio.create_task(stream_manager.run_loop())
    print(f"[{SYSTEM_NAME}] Intelligence Server initialized for {AGENCY}")
    yield
    # Shutdown
    stream_manager.running = False
    loop_task.cancel()
    print(f"[{SYSTEM_NAME}] Shutdown complete.")

app = FastAPI(
    title=f"{SYSTEM_NAME} - {SYSTEM_LONG_NAME}",
    description="Next-Generation AI-Based Intelligent Video Analytics Platform for Border Surveillance (SSB / Ministry of Home Affairs)",
    version="3.0.0",
    lifespan=lifespan
)

# CORS middleware for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount evidence snapshots directory
app.mount("/api/snapshots", StaticFiles(directory=str(SNAPSHOT_DIR)), name="snapshots")

# Register API routers
app.include_router(get_cameras_router(stream_manager))
app.include_router(get_zones_router(stream_manager))
app.include_router(get_incidents_router(stream_manager))
app.include_router(get_anpr_router(stream_manager))
app.include_router(get_scenarios_router(stream_manager))
app.include_router(get_system_router(stream_manager))
app.include_router(get_investigation_router(stream_manager))
app.include_router(get_audit_router(stream_manager))

@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await websocket.accept()
    stream_manager.websocket_clients.add(websocket)
    try:
        while True:
            # Keep alive and listen for client messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        stream_manager.websocket_clients.remove(websocket)
    except Exception:
        if websocket in stream_manager.websocket_clients:
            stream_manager.websocket_clients.remove(websocket)

from fastapi.responses import FileResponse

# Mount frontend static assets if available
frontend_dist = BASE_DIR.parent / "frontend" / "dist"
assets_dir = frontend_dist / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

@app.get("/")
def serve_index():
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {
        "platform": SYSTEM_NAME,
        "subtitle": SYSTEM_LONG_NAME,
        "agency": AGENCY,
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

@app.get("/{full_path:path}")
def serve_spa_catchall(full_path: str):
    # Avoid intercepting api routes
    if full_path.startswith("api") or full_path.startswith("ws"):
        return {"detail": "Not Found"}
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"detail": "Not Found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
