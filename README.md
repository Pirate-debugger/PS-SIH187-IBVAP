# 🚀 IBVAP 2.0 — Intelligent Border Video Analytics Platform

> **"From standard CCTV footage to actionable border intelligence."**

**Organization**: Ministry of Home Affairs  
**Department**: Sashastra Seema Bal (SSB), Police II Division  
**Category**: Software | **Theme**: Smart Automation  

---

## 📌 Executive Summary

Conventional border CCTV infrastructure across Border Out Posts (BOPs), checkposts, and zero-line perimeters primarily provides passive recording and manual observation. Existing smart surveillance solutions typically demand expensive proprietary hardware (dedicated FRS, ANPR, thermal cameras, and GPU edge appliances), making large-scale deployment across remote border sectors economically prohibitive.

**IBVAP 2.0** is an autonomous, software-defined surveillance intelligence matrix. It ingests live video streams from standard, low-cost IP cameras and transforms them into an intelligent situational awareness network with zero dedicated smart hardware.

---

## ⚡ Core Platform Capabilities

| Module | Capability | Implementation in IBVAP 2.0 |
|---|---|---|
| **Module 1** | **Multi-Camera Intelligence** | Concurrent processing of 6+ border camera streams (`BOP-CAM-01` to `BOP-CAM-06`, Riverine marsh, Gate Checkposts) with live AI HUD overlays and stream telemetry. |
| **Module 2** | **Human Intelligence & Tracking** | Person detection, unique Kalman/Centroid Track IDs (`P-17`), motion speed vectors, direction estimation (e.g. *North $\rightarrow$ South towards Zero Line*), entry/exit counting, and dwell timers. |
| **Module 3** | **Vehicle Intelligence & ANPR** | Multi-class classification (Car, Truck, Bus, Motorcycle, Patrol Jeep), optical character recognition for license plates, and instant matching against the Border Security Watchlist (Stolen / Wanted / Smuggler). |
| **Module 4** | **Virtual Border & Polygonal Zones** | Interactive in-browser polygon editor. Real-time Point-in-Polygon & Directional Tripwire crossing alerts powered by Shapely geometric ray-casting. |
| **Module 5** | **Night Surveillance & Low-Light AI** | Multi-mode vision engine: Adaptive CLAHE/Retinex enhancement, Night-Vision Phosphor Green, and False-Color Thermal/FLIR Heatmap (Ironbow) simulation. |
| **Module 6** | **Incident Intelligence & SOPs** | Auto-generates structured dossiers (`INC-2026-XXXX`) with timestamps, coordinates, snapshots, severity triage, and actionable SSB Standard Operating Procedure (SOP) checklists with 1-click PDF export. |
| **Module 7** | **AI Tactical Command Center** | Military/Tactical Glassmorphism UI (Tailwind CSS, React 19, Lucide Icons, Interactive GIS Vector Map, Web Audio tactical sirens, and WebSockets). |

---

## 🎯 6 Battle-Tested Hackathon Demo Scenarios

Launchable with 1-Click from the **Demo Scenarios** tab:

1. 🚨 **Scenario 1: Zero-Line Restricted Zone Intrusion** (`BOP-CAM-01`)  
   *Target enters the high-security red polygon $\rightarrow$ AI detects breach $\rightarrow$ Generates `INC-2026-0081` $\rightarrow$ Triggers QRF Team Alpha SOP.*
2. ⏱️ **Scenario 2: Perimeter Loitering Detection** (`BOP-CAM-02`)  
   *Subject paces near the western wire grid for > 8 seconds $\rightarrow$ Triggers loitering alert & searchlight SOP.*
3. 🚗 **Scenario 3: Blacklisted Vehicle & ANPR Trigger** (`BOP-CAM-03`)  
   *Bolero SUV approaches Checkpost Alpha $\rightarrow$ Optical OCR extracts `HR26DK8337` $\rightarrow$ Matches Smuggler Watchlist $\rightarrow$ High-threat barrier lockdown SOP.*
4. 🌙 **Scenario 4: Night-Time Stealth Infiltration** (`BOP-CAM-04`)  
   *Low-light riverine marsh $\rightarrow$ Switch to Thermal FLIR / NVG mode $\rightarrow$ AI detects crawling heat signature $\rightarrow$ Night Patrol dispatch SOP.*
5. 👥 **Scenario 5: Multi-Person Directional Perimeter Breach** (`BOP-CAM-05`)  
   *Group of 3 persons crossing virtual tripwire moving North to South towards the Zero Line $\rightarrow$ Flanking intercept SOP.*
6. 📦 **Scenario 6: Checkpost Anomaly / Unattended Cargo** (`BOP-CAM-06`)  
   *Stationary package left near barrier $\rightarrow$ Detected as unattended obstruction anomaly $\rightarrow$ Bomb Disposal & Canine sweep SOP.*

---

## 🏗️ Architecture & Technology Stack

```
IBVAP 2.0 /
├── backend/                         # Python 3.14 + FastAPI + OpenCV AI Engine
│   ├── app/
│   │   ├── config.py                # Camera metadata, thresholds, file paths
│   │   ├── main.py                  # FastAPI app, WebSockets (/ws/live), static mounts
│   │   ├── core/
│   │   │   ├── ai_pipeline.py       # Object detector & Kalman/Centroid tracker
│   │   │   ├── zone_engine.py       # Shapely polygonal & tripwire intersection
│   │   │   ├── anpr_engine.py       # EasyOCR & Watchlist cross-referencing
│   │   │   ├── night_enhancer.py    # CLAHE, Retinex, NVG & Thermal FLIR filters
│   │   │   ├── incident_engine.py   # INC-2026-XXXX dossiers, SOP generator, snapshots
│   │   │   ├── stream_manager.py    # Multi-camera orchestrator & HUD renderer
│   │   │   └── scenario_simulator.py# 6 dynamic scenario visual streams
│   │   ├── models/schemas.py        # Pydantic data validation models
│   │   ├── data/                    # Persistent Watchlist, Zones, Snapshots
│   │   └── api/                     # REST API endpoints
│   ├── tests/                       # Automated test suite (Pytest)
│   └── requirements.txt
│
├── frontend/                        # React 19 + Vite + Tailwind CSS UI
│   ├── src/
│   │   ├── components/              # Command Center, Map, Grid, ANPR, Incidents
│   │   ├── context/                 # Global Surveillance Provider & WebSocket sync
│   │   └── utils/                   # Web Audio synthesizer & PDF dossier export
│   └── dist/                        # Optimized production build
│
├── run_server.py                    # Unified launch script
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Launch the Platform
```bash
python run_server.py
```

### 2. Access the Command Center
Open your browser and navigate to:
- **Command Center Dashboard**: [http://localhost:8000](http://localhost:8000)
- **Interactive REST API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Run Automated Tests
```bash
cd backend
python -m pytest -v tests/test_platform.py
```

---

## 🛡️ Ministry of Home Affairs / SSB Alignment
IBVAP 2.0 directly satisfies every specification of Problem Statement 187 (SIH 2026):
- ✅ Transforms existing standard CCTV without hardware lock-in
- ✅ Real-time Human & Vehicle tracking with direction and dwell analytics
- ✅ Automatic Number Plate Recognition (ANPR) with active Watchlist matching
- ✅ Interactive Polygonal Virtual Fencing & Directional Tripwires
- ✅ Low-Light & Thermal Simulation for 24/7 night surveillance
- ✅ Structured incident dossiers (`INC-2026-XXXX`) with actionable SSB SOP checklists
