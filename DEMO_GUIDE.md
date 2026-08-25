# 🎬 5-Minute SIH Presentation Script — IBVAP 3.0

**SIH Problem Statement**: SIH2026187  
**Department**: Sashastra Seema Bal (SSB), Police II Division | Ministry of Home Affairs  
**Product**: **IBVAP 3.0 — Intelligent Border Video Analytics Platform**

---

## ⏱️ Exact 5-Minute Competition Walkthrough

```
[00:00 - 00:45] ──> STEP 1: The Problem & Baseline CCTV
[00:45 - 01:45] ──> STEP 2: Scenario 1 - Zero-Line Intrusion & Mathematical Risk
[01:45 - 02:45] ──> STEP 3: Scenario 3 - Vehicle ANPR & Smuggler Interception
[02:45 - 03:45] ──> STEP 4: Scenario 4 - Low-Light Night Enhancement & Thermal Simulation
[03:45 - 04:30] ──> STEP 5: Tactical GIS Map & Target Journey Forensics
[04:30 - 05:00] ──> STEP 6: Edge-First Resilience & 1-Click PDF Export
```

---

### Minute 1: The Problem & Baseline CCTV (0:00 – 0:45)
- **Presenter**: *"Respected Judges, conventional border CCTV cameras at remote Border Out Posts are passive. They record video, but require continuous human observation. Dedicated smart cameras with hardware ANPR or FRS are too expensive to deploy across thousands of kilometers of rugged border terrain."*
- **Action**: Open **Camera Wall** tab (`http://localhost:8000`). Show 6 active camera feeds (`BOP-CAM-01` to `BOP-CAM-06`).
- **Presenter**: *"IBVAP 3.0 is a 100% software-defined AI platform. It connects directly to existing standard IP cameras and provides real-time situational intelligence without requiring proprietary smart hardware."*

---

### Minute 2: Scenario 1 — Zero-Line Intrusion & Explainable Risk (0:45 – 1:45)
- **Action**: Switch to **SIH Judge Demo** tab $\rightarrow$ Click **Launch Scenario 1**.
- **Presenter**: *"Target P-017 approaches the Zero-Line wire fence at BOP-01. Notice our Kalman tracking engine: it computes speed (14 km/h), direction heading (North $\rightarrow$ South towards Zero Line), and dwell duration."*
- **Action**: As target crosses the red polygon, hear the siren alarm and see the high-severity incident `INC-2026-0081` generated.
- **Presenter**: *"Rather than giving a black-box AI percentage, our Explainable Risk Engine calculates an itemized score: Base (20) + Restricted Zone (35) + Directional Crossing (25) = 75/100 HIGH Risk. It immediately attaches the official SSB SOP: Dispatch Quick Reaction Force (QRF) Team Alpha."*

---

### Minute 3: Scenario 3 — ANPR & Smuggler Watchlist Interception (1:45 – 2:45)
- **Action**: In Judge Demo tab $\rightarrow$ Click **Launch Scenario 3 (ANPR)**.
- **Presenter**: *"Now, let's look at vehicle intelligence at Checkpost Alpha. An approaching Mahindra Bolero enters the inspection bay."*
- **Action**: Show license plate `HR26DK8337` localized, normalized, and cross-referenced with the Contraband Watchlist.
- **Presenter**: *"The plate matches an active smuggling case flagged by SSB Intelligence. An instant CRITICAL barrier lockdown alert is generated, preventing unauthorized border crossing."*

---

### Minute 4: Scenario 4 — Night-Time Thermal Surveillance (2:45 – 3:45)
- **Action**: In Judge Demo tab $\rightarrow$ Click **Launch Scenario 4 (Night Vision)**.
- **Presenter**: *"Border infiltration attempts peak at night along riverine marshlands where conventional CCTV is pitch dark. Let's switch vision modes."*
- **Action**: Toggle **Thermal FLIR Simulation** and **NVG Phosphor Green** on `BOP-CAM-04`.
- **Presenter**: *"Adaptive CLAHE and false-color thermal gradient mapping highlight the crawling intruder's signature in the reeds, triggering an autonomous Night-Patrol SOP."*

---

### Minute 5: GIS Map, Edge Resilience & PDF Export (3:45 – 5:00)
- **Action**: Switch to **Tactical Map** tab to show spatial FOV cones $\rightarrow$ Switch to **Investigation** tab and query `P-017` to show the multi-camera journey.
- **Action**: In Top Navbar, click **WAN Link** button to demonstrate **Degraded Connectivity Mode** (queuing events locally on the edge node).
- **Action**: Open Incident Room $\rightarrow$ Click **Export Confidential Dossier (PDF)**.
- **Presenter**: *"With 1 click, a complete court-admissible evidence dossier is exported with keyframe snapshots, SOP checklists, and mathematical risk breakdown. IBVAP 3.0 delivers practical, deployable, and software-defined border intelligence for the Ministry of Home Affairs."*
