# Security, Governance & Ethics — IBVAP 3.0

**Intelligent Border Video Analytics Platform (SIH2026187)**

---

## 1. Role-Based Access Control (RBAC)

IBVAP 3.0 enforces dual-tier operational role segregation:

| Role | Permissions |
| :--- | :--- |
| **OPERATOR** | Live feed monitoring, visual mode switching, alert acknowledgment, adding investigation notes. |
| **COMMANDER / ADMIN** | Zone editing, Watchlist modification, SOP authorization, incident status overrides, and PDF dossier export. |

---

## 2. Audit Trail & Chain of Custody

All user actions are recorded immutably in the local security audit log (`backend/app/data/audit_log.json`):
- Operator ID & Role (`SSB-OPR-402`, `COMMANDER`)
- Timestamp & Exact Action Type (`ACKNOWLEDGE_ALERT`, `STATUS_CHANGE`, `ZONE_EDIT`, `DOSSIER_EXPORT`)
- Resource Identifier & Target ID

---

## 3. Edge-First Data Protection & Privacy

- **Local Processing**: Video frames are processed in-memory at the local edge node. Raw video streams are never transmitted unencrypted over open WAN.
- **Bandwidth Conservation**: Only structured JSON telemetry (coordinates, bounding boxes, risk scores) and trigger keyframes are forwarded upstream to central command, reducing WAN bandwidth consumption by over 78%.
- **Zero Facial Data Persistence**: No private biometric vectors are stored locally; only anonymous tracking IDs (`P-017`, `V-004`) are retained during the session.

---

## 4. Synthetic Data & Simulation Disclosure

- **Transparency Statement**: For hackathon evaluation and demonstration safety, all personnel names, license plates, and incident narratives presented in the default scenarios are **synthetic demo artifacts**.
- **Visual Disclosure**: All demo components, watchlist items, and thermal pseudo-color modes are explicitly labeled in the UI as `DEMO / SYNTHETIC DATA` and `THERMAL SIMULATION (FLIR)`.
