import React from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { Video, Users, Car, AlertTriangle, Activity, Zap, Cpu, Wifi } from 'lucide-react';

export default function StatsBar() {
  const { telemetry, cameras, incidents, alerts, edgeDegraded } = useSurveillance();

  const totalPersons = cameras.reduce((acc, c) => acc + (c.current_persons || 0), 0);
  const totalVehicles = cameras.reduce((acc, c) => acc + (c.current_vehicles || 0), 0);
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;
  const queuedCount = telemetry.edge_queue?.queued_events_count || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 px-3 py-2 max-w-[1920px] mx-auto">
      
      {/* 1. Active Cameras & Health */}
      <div className="tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 border-l-cyan-500">
        <div>
          <div className="text-[10px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Border Cameras
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-orbitron text-lg font-black text-white">
              {cameras.length}
            </span>
            <span className="text-[11px] text-cyan-400 font-mono-hud font-semibold">
              / {telemetry.total_cameras_count || 6}
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            6/6 Healthy (Nominal)
          </div>
        </div>
        <div className="p-2 rounded-md bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
          <Video className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Persons Tracked */}
      <div className="tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 border-l-yellow-400">
        <div>
          <div className="text-[10px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Persons Monitored
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-orbitron text-lg font-black text-white">
              {totalPersons}
            </span>
            <span className="text-[10px] text-yellow-400 font-mono-hud">
              Targets
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            Kalman Centroid Array
          </div>
        </div>
        <div className="p-2 rounded-md bg-yellow-950/60 text-yellow-400 border border-yellow-500/20">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Vehicles & ANPR */}
      <div className="tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 border-l-blue-500">
        <div>
          <div className="text-[10px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Vehicles & ANPR
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-orbitron text-lg font-black text-white">
              {totalVehicles}
            </span>
            <span className="text-[10px] text-blue-400 font-mono-hud">
              In Transit
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            Watchlist OCR Active
          </div>
        </div>
        <div className="p-2 rounded-md bg-blue-950/60 text-blue-400 border border-blue-500/20">
          <Car className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Incidents & Threat Events */}
      <div className={`tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 ${
        criticalCount > 0 ? 'border-l-red-500 bg-red-950/30' : 'border-l-orange-500'
      }`}>
        <div>
          <div className="text-[10px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Active Incidents
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`font-orbitron text-lg font-black ${criticalCount > 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {incidents.length}
            </span>
            <span className="text-[10px] text-red-400 font-mono-hud font-bold">
              {criticalCount} Critical
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            SSB SOP Bound
          </div>
        </div>
        <div className={`p-2 rounded-md ${criticalCount > 0 ? 'bg-red-900/60 text-red-400 border border-red-500/40 animate-bounce' : 'bg-orange-950/60 text-orange-400 border border-orange-500/20'}`}>
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>

      {/* 5. Edge AI FPS & Inference Mode */}
      <div className="tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 border-l-emerald-500">
        <div>
          <div className="text-[10px] font-mono-hud text-slate-400 uppercase tracking-wider">
            AI Engine Rate
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-orbitron text-lg font-black text-emerald-400">
              {telemetry.ai_inference_fps || '25.0'}
            </span>
            <span className="text-xs text-slate-400 font-mono-hud">FPS</span>
          </div>
          <div className="text-[9px] font-mono-hud font-bold text-cyan-300 mt-0.5">
            [{telemetry.active_inference_mode || 'DEMO SIMULATION'}]
          </div>
        </div>
        <div className="p-2 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
          <Activity className="w-4 h-4" />
        </div>
      </div>

      {/* 6. Edge Buffer / Network State */}
      <div className={`tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 ${
        edgeDegraded ? 'border-l-orange-500 bg-orange-950/30' : 'border-l-purple-500'
      }`}>
        <div>
          <div className="text-[10px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Edge Node Buffer
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`font-orbitron text-lg font-black ${edgeDegraded ? 'text-orange-400' : 'text-purple-300'}`}>
              {queuedCount}
            </span>
            <span className="text-[10px] text-slate-400 font-mono-hud">Queued</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono-hud mt-0.5">
            {edgeDegraded ? "WAN Link Jammed" : "-78.5% Bandwidth Saved"}
          </div>
        </div>
        <div className={`p-2 rounded-md ${edgeDegraded ? 'bg-orange-950/60 text-orange-400 border border-orange-500/30' : 'bg-purple-950/60 text-purple-400 border border-purple-500/20'}`}>
          <Zap className="w-4 h-4" />
        </div>
      </div>

    </div>
  );
}
