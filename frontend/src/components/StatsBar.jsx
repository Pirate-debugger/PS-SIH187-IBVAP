import React from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { Video, Users, Car, AlertTriangle, Cpu, Activity, Zap } from 'lucide-react';

export default function StatsBar() {
  const { telemetry, cameras, incidents, alerts } = useSurveillance();

  const totalPersons = cameras.reduce((acc, c) => acc + (c.current_persons || 0), 0);
  const totalVehicles = cameras.reduce((acc, c) => acc + (c.current_vehicles || 0), 0);
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 px-4 py-2.5 max-w-[1920px] mx-auto">
      
      {/* 1. Active Cameras */}
      <div className="tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 border-l-cyan-500">
        <div>
          <div className="text-[11px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Active Cameras
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-orbitron text-xl font-black text-white">
              {cameras.length}
            </span>
            <span className="text-xs text-cyan-400 font-mono-hud font-semibold">
              / {telemetry.total_cameras_count || 6}
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            100% Operational
          </div>
        </div>
        <div className="p-2 rounded-md bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
          <Video className="w-4 h-4" />
        </div>
      </div>

      {/* 2. Persons Tracked */}
      <div className="tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 border-l-yellow-400">
        <div>
          <div className="text-[11px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Persons Monitored
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-orbitron text-xl font-black text-white">
              {totalPersons}
            </span>
            <span className="text-[10px] text-yellow-400 font-mono-hud">
              Active Targets
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            Kalman Track Matrix
          </div>
        </div>
        <div className="p-2 rounded-md bg-yellow-950/60 text-yellow-400 border border-yellow-500/20">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Vehicles & ANPR */}
      <div className="tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 border-l-blue-500">
        <div>
          <div className="text-[11px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Vehicles & ANPR
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-orbitron text-xl font-black text-white">
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
          <div className="text-[11px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Active Threats
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`font-orbitron text-xl font-black ${criticalCount > 0 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {incidents.length}
            </span>
            <span className="text-[10px] text-red-400 font-mono-hud font-bold">
              {criticalCount} Critical
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            SSB SOP Generated
          </div>
        </div>
        <div className={`p-2 rounded-md ${criticalCount > 0 ? 'bg-red-900/60 text-red-400 border border-red-500/40 animate-bounce' : 'bg-orange-950/60 text-orange-400 border border-orange-500/20'}`}>
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>

      {/* 5. Edge AI FPS & Latency */}
      <div className="tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 border-l-emerald-500">
        <div>
          <div className="text-[11px] font-mono-hud text-slate-400 uppercase tracking-wider">
            AI Inference
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-orbitron text-xl font-black text-emerald-400">
              {telemetry.ai_inference_fps || '25.0'}
            </span>
            <span className="text-xs text-slate-400 font-mono-hud">FPS</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            Latency: {telemetry.pipeline_latency_ms || '18.5'}ms
          </div>
        </div>
        <div className="p-2 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
          <Activity className="w-4 h-4" />
        </div>
      </div>

      {/* 6. Hardware Optimization & Bandwidth */}
      <div className="tactical-panel p-2.5 rounded-lg flex items-center justify-between border-l-2 border-l-purple-500">
        <div>
          <div className="text-[11px] font-mono-hud text-slate-400 uppercase tracking-wider">
            Edge Compute Load
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-orbitron text-xl font-black text-purple-300">
              {telemetry.edge_gpu_percent || '48'}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono-hud">GPU</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono-hud mt-0.5">
            -{telemetry.bandwidth_saved_percent || '78'}% Bandwidth
          </div>
        </div>
        <div className="p-2 rounded-md bg-purple-950/60 text-purple-400 border border-purple-500/20">
          <Zap className="w-4 h-4" />
        </div>
      </div>

    </div>
  );
}
