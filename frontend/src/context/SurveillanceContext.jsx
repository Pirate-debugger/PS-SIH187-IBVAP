import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { tacticalAudio } from '../utils/sounds';

const SurveillanceContext = createContext(null);

export function SurveillanceProvider({ children }) {
  const [cameras, setCameras] = useState([]);
  const [telemetry, setTelemetry] = useState({
    system_name: "IBVAP 2.0",
    agency: "Sashastra Seema Bal (SSB)",
    sector: "Sector 04 - Zero Line Border Perimeter",
    timestamp: new Date().toLocaleTimeString(),
    threat_level: "DEFCON 3 (ELEVATED)",
    active_cameras_count: 6,
    total_cameras_count: 6,
    persons_monitored: 0,
    vehicles_tracked: 0,
    total_incidents: 0,
    active_critical_alerts: 0,
    ai_inference_fps: 25.0,
    pipeline_latency_ms: 18.2,
    edge_cpu_percent: 32.0,
    edge_gpu_percent: 48.0,
    bandwidth_saved_percent: 78.5
  });
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activeTab, setActiveTab] = useState("grid"); // "grid", "map", "anpr", "incidents", "scenarios"
  const [spotlightCameraId, setSpotlightCameraId] = useState("BOP-CAM-01");
  const [zoneEditorOpen, setZoneEditorOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [scenariosList, setScenariosList] = useState([]);

  const wsRef = useRef(null);
  const lastAlertCountRef = useRef(0);

  // Sync sound muted state
  useEffect(() => {
    tacticalAudio.setMuted(soundMuted);
  }, [soundMuted]);

  // Initial Data Fetching
  const fetchInitialData = async () => {
    try {
      const [camsRes, incsRes, alertsRes, scensRes] = await Promise.all([
        fetch('/api/cameras').then(r => r.json()).catch(() => []),
        fetch('/api/incidents').then(r => r.json()).catch(() => []),
        fetch('/api/incidents/alerts').then(r => r.json()).catch(() => []),
        fetch('/api/scenarios').then(r => r.json()).catch(() => [])
      ]);

      if (Array.isArray(camsRes) && camsRes.length > 0) setCameras(camsRes);
      if (Array.isArray(incsRes)) setIncidents(incsRes);
      if (Array.isArray(alertsRes)) setAlerts(alertsRes);
      if (Array.isArray(scensRes)) setScenariosList(scensRes);
    } catch (e) {
      console.warn("Initial data fetch error:", e);
    }
  };

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 5000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket Live Sync Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    function connectWs() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "TELEMETRY_SYNC") {
            if (data.telemetry) setTelemetry(data.telemetry);
            if (data.cameras) setCameras(data.cameras);
            if (data.alerts) {
              setAlerts(data.alerts);
              // Sound alert if new alert arrived
              if (data.alerts.length > lastAlertCountRef.current) {
                const latest = data.alerts[0];
                if (latest?.severity === "CRITICAL") {
                  tacticalAudio.playCriticalAlarm();
                } else {
                  tacticalAudio.playWarningBeep();
                }
              }
              lastAlertCountRef.current = data.alerts.length;
            }
          }
        } catch (err) {
          console.warn("WS message parse err:", err);
        }
      };

      ws.onclose = () => {
        // Auto-reconnect after 2 seconds
        setTimeout(connectWs, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Switch Camera Night Vision / HUD Mode
  const switchCameraMode = async (cameraId, mode) => {
    try {
      tacticalAudio.playAckClick();
      await fetch(`/api/cameras/${cameraId}/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      setCameras(prev => prev.map(c => c.id === cameraId ? { ...c, active_mode: mode } : c));
    } catch (e) {
      console.error("Failed to switch camera mode:", e);
    }
  };

  // Trigger 1-Click Demo Scenario
  const triggerScenario = async (scenarioId) => {
    try {
      tacticalAudio.playCriticalAlarm();
      const res = await fetch(`/api/scenarios/trigger/${scenarioId}`, { method: 'POST' });
      const data = await res.json();
      if (data.camera_id) {
        setSpotlightCameraId(data.camera_id);
      }
      fetchInitialData();
      return data;
    } catch (e) {
      console.error("Failed to trigger scenario:", e);
    }
  };

  // Acknowledge Alert
  const acknowledgeAlert = async (alertId) => {
    try {
      tacticalAudio.playAckClick();
      await fetch(`/api/incidents/alerts/${alertId}/acknowledge`, { method: 'POST' });
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    } catch (e) {
      console.error("Failed to acknowledge alert:", e);
    }
  };

  // Update Incident Status
  const updateIncidentStatus = async (incidentId, status, notes) => {
    try {
      tacticalAudio.playAckClick();
      const res = await fetch(`/api/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      const updated = await res.json();
      setIncidents(prev => prev.map(inc => inc.incident_id === incidentId ? updated : inc));
      if (selectedIncident?.incident_id === incidentId) {
        setSelectedIncident(updated);
      }
    } catch (e) {
      console.error("Failed to update incident status:", e);
    }
  };

  return (
    <SurveillanceContext.Provider
      value={{
        cameras,
        telemetry,
        alerts,
        incidents,
        activeTab,
        setActiveTab,
        spotlightCameraId,
        setSpotlightCameraId,
        zoneEditorOpen,
        setZoneEditorOpen,
        soundMuted,
        setSoundMuted,
        selectedIncident,
        setSelectedIncident,
        scenariosList,
        switchCameraMode,
        triggerScenario,
        acknowledgeAlert,
        updateIncidentStatus,
        fetchInitialData
      }}
    >
      {children}
    </SurveillanceContext.Provider>
  );
}

export function useSurveillance() {
  const ctx = useContext(SurveillanceContext);
  if (!ctx) throw new Error("useSurveillance must be used within a SurveillanceProvider");
  return ctx;
}
