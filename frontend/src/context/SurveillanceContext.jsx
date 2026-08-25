import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { tacticalAudio } from '../utils/sounds';

const SurveillanceContext = createContext(null);

export function SurveillanceProvider({ children }) {
  const [cameras, setCameras] = useState([]);
  const [telemetry, setTelemetry] = useState({
    system_name: "IBVAP 3.0",
    system_version: "3.0.0-PROD",
    agency: "Sashastra Seema Bal (SSB) | Ministry of Home Affairs",
    sector: "Sector 04 - Zero Line Border Perimeter",
    timestamp: new Date().toLocaleTimeString(),
    threat_level: "DEFCON 3 (ELEVATED)",
    active_inference_mode: "DEMO SIMULATION",
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
    bandwidth_saved_percent: 78.5,
    edge_queue: {
      central_link_status: "ONLINE",
      edge_engine_status: "ONLINE",
      queued_events_count: 0,
      last_sync_timestamp: new Date().toLocaleTimeString(),
      sync_progress_percent: 100.0
    }
  });
  const [alerts, setAlerts] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activeTab, setActiveTab] = useState("grid"); // "grid", "map", "anpr", "incidents", "investigation", "judge", "scenarios"
  const [spotlightCameraId, setSpotlightCameraId] = useState("BOP-CAM-01");
  const [zoneEditorOpen, setZoneEditorOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [scenariosList, setScenariosList] = useState([]);
  const [operatorRole, setOperatorRole] = useState("COMMANDER"); // "OPERATOR", "COMMANDER"
  const [edgeDegraded, setEdgeDegraded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const wsRef = useRef(null);
  const lastAlertCountRef = useRef(0);

  useEffect(() => {
    tacticalAudio.setMuted(soundMuted);
  }, [soundMuted]);

  // Fetch Initial Data
  const fetchInitialData = async () => {
    try {
      const [camsRes, incsRes, alertsRes, scensRes, auditRes] = await Promise.all([
        fetch('/api/cameras').then(r => r.json()).catch(() => []),
        fetch('/api/incidents').then(r => r.json()).catch(() => []),
        fetch('/api/incidents/alerts').then(r => r.json()).catch(() => []),
        fetch('/api/scenarios').then(r => r.json()).catch(() => []),
        fetch('/api/audit').then(r => r.json()).catch(() => [])
      ]);

      if (Array.isArray(camsRes) && camsRes.length > 0) setCameras(camsRes);
      if (Array.isArray(incsRes)) setIncidents(incsRes);
      if (Array.isArray(alertsRes)) setAlerts(alertsRes);
      if (Array.isArray(scensRes)) setScenariosList(scensRes);
      if (Array.isArray(auditRes)) setAuditLogs(auditRes);
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

  // Switch Camera Mode
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

  // Trigger Scenario
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

  // Reset All Scenarios (SIH Judge Mode)
  const resetAllScenarios = async () => {
    try {
      tacticalAudio.playAckClick();
      await fetch('/api/scenarios/control/reset', { method: 'POST' });
      fetchInitialData();
    } catch (e) {
      console.error("Reset error:", e);
    }
  };

  // Pause / Resume Streams
  const togglePauseStreams = async () => {
    try {
      tacticalAudio.playAckClick();
      const nextState = !isPaused;
      await fetch('/api/scenarios/control/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paused: nextState })
      });
      setIsPaused(nextState);
    } catch (e) {
      console.error("Pause error:", e);
    }
  };

  // Clear Incidents Queue
  const clearAllIncidents = async () => {
    try {
      tacticalAudio.playAckClick();
      await fetch('/api/scenarios/control/clear-incidents', { method: 'POST' });
      setIncidents([]);
      setAlerts([]);
      fetchInitialData();
    } catch (e) {
      console.error("Clear error:", e);
    }
  };

  // Toggle Degraded WAN Connectivity
  const toggleEdgeConnectivity = async () => {
    try {
      tacticalAudio.playAckClick();
      const nextState = !edgeDegraded;
      const res = await fetch('/api/system/edge/connectivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ online: !nextState })
      });
      const data = await res.json();
      setEdgeDegraded(nextState);
      setTelemetry(prev => ({ ...prev, edge_queue: data }));
    } catch (e) {
      console.error("Edge connectivity error:", e);
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
  const updateIncidentStatus = async (incidentId, status, notes, responder) => {
    try {
      tacticalAudio.playAckClick();
      const res = await fetch(`/api/incidents/${incidentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes, assigned_responder: responder })
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
        operatorRole,
        setOperatorRole,
        edgeDegraded,
        isPaused,
        auditLogs,
        switchCameraMode,
        triggerScenario,
        resetAllScenarios,
        togglePauseStreams,
        clearAllIncidents,
        toggleEdgeConnectivity,
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
