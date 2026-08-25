# API Reference & Telemetry Specification — IBVAP 3.0

**Intelligent Border Video Analytics Platform (SIH2026187)**

---

## REST Endpoints

### 1. Cameras & Ingestion Health
- `GET /api/cameras` — Returns list of all configured border cameras with current telemetry, tracks, and health status.
- `GET /api/cameras/{camera_id}` — Returns single camera details.
- `GET /api/cameras/{camera_id}/health` — Returns camera diagnostics (FPS, latency_ms, dropped_frames, bitrate_kbps, health_status).
- `POST /api/cameras/{camera_id}/mode` — Switch visual mode (`STANDARD`, `LOW_LIGHT_ENHANCED`, `THERMAL_FLIR`, `NIGHT_VISION_GREEN`).
- `GET /api/cameras/{camera_id}/stream` — MJPEG live video feed (Multipart JPEG, 25 FPS).

### 2. Spatial Zones & Tripwires
- `GET /api/zones` — Returns all active polygon zones and directional tripwires across all cameras.
- `GET /api/zones/{camera_id}` — Returns zones for a specific camera.
- `POST /api/zones` — Create or update a virtual polygon zone / tripwire.
- `DELETE /api/zones/{zone_id}` — Delete a zone.

### 3. Incidents & Forensics Dossiers
- `GET /api/incidents` — Returns chronological list of all detected incidents with evidence micro-timelines.
- `GET /api/incidents/{incident_id}` — Returns single incident dossier with attached risk assessment and SSB SOP.
- `PATCH /api/incidents/{incident_id}/status` — Update incident status (`DETECTED`, `TRIAGED`, `ACKNOWLEDGED`, `UNDER_INVESTIGATION`, `RESOLVED`, `ARCHIVED`), add operator notes, or assign responders.
- `GET /api/incidents/alerts` — Returns real-time threat alerts stream.
- `POST /api/incidents/alerts/{alert_id}/acknowledge` — Acknowledge an active threat alert.

### 4. Vehicle Intelligence & ANPR
- `GET /api/anpr/records` — Returns license plate sightings audit log.
- `GET /api/anpr/watchlist` — Returns contraband/smuggler vehicle database.
- `POST /api/anpr/watchlist` — Add a new vehicle to watchlist.
- `GET /api/anpr/check/{plate_number}` — Check if a plate matches the watchlist.

### 5. Investigation Hub
- `POST /api/investigation/search` — Multi-parameter search across keyword, camera, object type, track ID, plate, severity, status.
- `GET /api/investigation/track/{track_id}` — Reconstructs multi-camera spatial journey and timeline for a specific track ID (`P-017`, `V-004`).

### 6. Security Audit Trail
- `GET /api/audit` — Returns security audit logs for operator actions and status changes.

### 7. Scenarios & Judge Demo Control
- `GET /api/scenarios` — Catalog of the 6 procedural border defense scenarios.
- `POST /api/scenarios/trigger/{scenario_id}` — 1-click trigger for a specific scenario (1–6).
- `POST /api/scenarios/control/reset` — Resets all cameras to nominal baseline and clears incidents.
- `POST /api/scenarios/control/pause` — Pause or resume AI stream processing.
- `POST /api/scenarios/control/clear-incidents` — Clears incident queue.

### 8. System & Edge Diagnostics
- `GET /api/system/telemetry` — Live system-wide metrics (threat level, active tracks, FPS, latency, edge buffer).
- `GET /api/system/health` — Subsystem readiness probe.
- `POST /api/system/edge/connectivity` — Toggle WAN connection online/offline for degraded link testing.

---

## WebSocket Interface

- **Endpoint**: `/ws/live`
- **Payload Structure**:
```json
{
  "type": "TELEMETRY_SYNC",
  "telemetry": {
    "system_name": "IBVAP 3.0",
    "threat_level": "DEFCON 3 (ELEVATED)",
    "active_inference_mode": "DEMO SIMULATION",
    "persons_monitored": 3,
    "vehicles_tracked": 1,
    "total_incidents": 4,
    "ai_inference_fps": 24.8,
    "pipeline_latency_ms": 18.2,
    "edge_queue": {
      "central_link_status": "ONLINE",
      "queued_events_count": 0
    }
  },
  "cameras": [...],
  "alerts": [...],
  "timestamp": 1771954200.125
}
```
