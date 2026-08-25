# IBVAP 3.0: Intelligent Border Video Analytics Platform

[![SIH 2026](https://img.shields.io/badge/SIH-SIH2026187-blue.svg)](https://sih.gov.in)
[![Organization](https://img.shields.io/badge/Ministry-Home%20Affairs-red.svg)](https://mha.gov.in)
[![Department](https://img.shields.io/badge/Department-Sashastra%20Seema%20Bal%20(SSB)-orange.svg)](https://ssb.gov.in)
[![Architecture](https://img.shields.io/badge/Architecture-Edge--First%20AI-emerald.svg)](./ARCHITECTURE.md)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20MHA-slate.svg)]()

> **"From Existing CCTV to Actionable Border Intelligence"**  
> AI-Based Intelligent Video Analytics Platform for Border Surveillance using existing CCTV Infrastructure without requiring proprietary smart camera hardware.

---

## 🎯 Problem Statement (SIH2026187)

- **Organization**: Ministry of Home Affairs (MHA)
- **Department**: Sashastra Seema Bal (SSB), Police II Division
- **Category**: Software | **Theme**: Smart Automation
- **Challenge**: Border security forces deploy standard CCTV cameras at Border Out Posts (BOPs), checkposts, and zero-line border roads. However, conventional systems primarily provide passive recording, requiring continuous human monitoring. Proprietary smart cameras with built-in ANPR or FRS are prohibitively expensive to deploy across remote border sectors.
- **Solution**: **IBVAP 3.0** is an edge-native, software-defined video intelligence platform that transforms existing legacy RTSP/IP cameras into an autonomous border security matrix with explainable mathematical risk scoring, directional virtual tripwires, vehicle ANPR, low-light enhancement, and automated SSB standard operating procedure (SOP) binding.

---

## 🚀 Key Innovations in IBVAP 3.0

1. **100% Software-Defined Edge Intelligence**: Direct RTSP/MJPEG video ingestion from legacy CCTV cameras with zero hardware modifications.
2. **Modular Model Adapter Architecture**: Swappable interfaces for Deep Neural Detectors (`YOLOv8DetectorAdapter`, `TorchvisionAdapter`, `SynthesizedDetectorAdapter`) and OCR (`EasyOCRAdapter`).
3. **Explainable 8-Rule Event Engine**: Deterministic, auditable rules (`RULE-01` to `RULE-08`) generating human-readable reasons (e.g. *"Person P-017 crossed ZERO-LINE-01 from NORTH to SOUTH at 02:17:42"*).
4. **Additive Mathematical Risk Scoring**: Itemized 0–100 threat score formula with explicit factor breakdown (`+35 Restricted Zone`, `+25 Directional Crossing`, `+15 Night Movement`).
5. **Multi-Mode Night Surveillance**: Adaptive CLAHE, Retinex contrast stretching, Gen-3 Phosphor Green NVG, and False-Color FLIR Thermal Simulation.
6. **Edge-First Degraded Connectivity**: Autonomous local event buffering during border WAN outages with automatic upstream synchronization.
7. **Incident Lifecycle & Forensics Timelines**: 6-stage lifecycle (`DETECTED` $\rightarrow$ `TRIAGED` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `UNDER_INVESTIGATION` $\rightarrow$ `RESOLVED` $\rightarrow$ `ARCHIVED`) with micro-event timelines and 1-click court-admissible PDF dossier export.
8. **Multi-Camera Target Journey Forensics**: Universal search and spatial path reconstruction for specific Track IDs (`P-017`, `V-004`).
9. **Interactive Canvas Zone Editor**: Real-time browser canvas for drawing polygon restricted zones and directional virtual tripwires over live feeds.
10. **SIH Judge Presentation Center**: 1-Click scenario launcher, Reset, Pause, and 5-Minute presentation cue card.

---

## 📁 System Architecture

```
IBVAP/
├── backend/
│   ├── app/
│   │   ├── api/                # FastAPI REST & WebSocket routes
│   │   │   ├── routes_cameras.py        # Stream & health endpoints
│   │   │   ├── routes_zones.py          # Polygon & tripwire routes
│   │   │   ├── routes_incidents.py      # Lifecycle & SOP routes
│   │   │   ├── routes_anpr.py           # ANPR & Watchlist database
│   │   │   ├── routes_investigation.py  # Universal search & track journey
│   │   │   ├── routes_audit.py          # Security audit trail
│   │   │   ├── routes_scenarios.py      # 6 Demo scenarios & judge controls
│   │   │   └── routes_system.py         # Telemetry & edge degraded toggle
│   │   ├── core/               # CV, AI & Intelligence Engines
│   │   │   ├── model_adapters.py        # Modular Detector & OCR adapters
│   │   │   ├── rules_engine.py          # Explainable 8-rule event engine
│   │   │   ├── risk_engine.py           # Additive 0-100 risk scoring
│   │   │   ├── edge_manager.py          # Edge buffer & degraded sync
│   │   │   ├── audit_logger.py          # Security action logging
│   │   │   ├── ai_pipeline.py           # Multi-target Kalman tracking
│   │   │   ├── zone_engine.py           # Shapely polygon & tripwires
│   │   │   ├── anpr_engine.py           # EasyOCR & Indian plate matcher
│   │   │   ├── night_enhancer.py        # CLAHE, Retinex, NVG, Thermal FLIR
│   │   │   ├── incident_engine.py       # Incident dossiers & SSB SOPs
│   │   │   ├── scenario_simulator.py    # 6 Procedural border scenarios
│   │   │   └── stream_manager.py        # Multi-camera orchestrator & HUD
│   │   └── models/schemas.py   # Pydantic data schemas
│   └── tests/test_platform.py  # Pytest automated test suite (11/11 passing)
├── frontend/                   # React 19 + Tailwind CSS Tactical Dashboard
│   └── src/
│       ├── components/
│       │   ├── MultiCameraGrid.jsx      # 3x2 & spotlight video wall
│       │   ├── TacticalBorderMap.jsx    # SVG GIS map with FOV cones
│       │   ├── ANPRWatchlistHub.jsx     # Vehicle plate manager
│       │   ├── IncidentRoom.jsx         # Dossier viewer & PDF export
│       │   ├── InvestigationHub.jsx     # Search & target journey tracker
│       │   ├── JudgeDemoPanel.jsx       # SIH presentation control center
│       │   ├── RealtimeAlertStream.jsx  # Siren audio & alert feed
│       │   └── ZoneEditorModal.jsx      # Canvas polygon drawing tool
│       └── utils/sounds.js              # Tactical Web Audio synthesizer
├── ARCHITECTURE.md             # Detailed multi-layer system architecture
├── DEMO_GUIDE.md               # 5-Minute SIH Presentation Script
├── API.md                      # REST & WebSocket specification
├── SECURITY.md                 # RBAC, privacy & ethics disclosure
└── run_server.py               # Single-command launcher
```

---

## ⚡ Quick Start & Execution

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Single-Command Launch
```bash
python run_server.py
```
This launches the FastAPI backend and serves the compiled tactical dashboard at:
👉 **`http://localhost:8000`**

### 3. Run Automated Test Suite
```bash
cd backend
python -m pytest -v tests/test_platform.py
```

---

## 📊 Evaluation Scenarios Catalog

| Scenario | Target | Rule ID | Expected Outcome | SSB SOP |
| :--- | :--- | :--- | :--- | :--- |
| **1. Zero-Line Intrusion** | Person (P-017) | `RULE-01` | CRITICAL Red Zone Breach alert | SOP-SEC-01: QRF Team Alpha |
| **2. Perimeter Loitering** | Person (P-02) | `RULE-03` | MEDIUM Loitering Dwell alert (>8s) | SOP-SEC-03: Foot Patrol Recon |
| **3. ANPR Watchlist Hit** | Bolero (HR26DK8337) | `RULE-05` | HIGH Smuggler Interception alert | SOP-SEC-05: Barrier Lockdown |
| **4. Night Stealth Infiltration** | Crawling Intruder | `RULE-06` | CRITICAL Low-Light Thermal alert | SOP-SEC-06: NVG Night Patrol |
| **5. Group Boundary Crossing** | 3 Infiltrators | `RULE-04` | HIGH Directional Crossing alert | SOP-SEC-04: Cordon & Search |
| **6. Unattended Cargo Anomaly** | Stationary Package | `RULE-07` | MEDIUM Checkpost Obstruction | SOP-SEC-07: Bomb Squad Sweep |

---

## 🏛️ Ministry & Department
- **Ministry**: Ministry of Home Affairs (MHA), Government of India
- **Department**: Sashastra Seema Bal (SSB), Police II Division
- **Project**: IBVAP 3.0 (Smart India Hackathon 2026 - SIH2026187)
