import React, { useState } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { 
  Eye, 
  Moon, 
  Flame, 
  ShieldAlert, 
  Maximize2, 
  Sliders, 
  Camera, 
  Radio,
  Sparkles
} from 'lucide-react';

export default function CameraFeedCard({ camera, isSpotlight = false, onSpotlight }) {
  const { switchCameraMode, setSpotlightCameraId, setZoneEditorOpen, triggerScenario } = useSurveillance();
  const [imageError, setImageError] = useState(false);

  const activeMode = camera.active_mode || "STANDARD";

  const modeOptions = [
    { key: "STANDARD", label: "RGB Optical", icon: Eye, color: "text-cyan-400" },
    { key: "LOW_LIGHT_ENHANCED", label: "Low-Light AI", icon: Moon, color: "text-yellow-400" },
    { key: "THERMAL_FLIR", label: "Thermal FLIR", icon: Flame, color: "text-red-400" },
    { key: "NIGHT_VISION_GREEN", label: "NVG Green", icon: ShieldAlert, color: "text-emerald-400" }
  ];

  const handleOpenZoneEditor = (e) => {
    e.stopPropagation();
    setSpotlightCameraId(camera.id);
    setZoneEditorOpen(true);
  };

  const handleTriggerScenario = (e) => {
    e.stopPropagation();
    if (camera.scenario_id) {
      triggerScenario(camera.scenario_id);
    }
  };

  return (
    <div className={`tactical-panel rounded-xl overflow-hidden flex flex-col transition-all duration-300 ${
      isSpotlight ? 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.2)]' : 'hover:border-slate-700'
    }`}>
      
      {/* Top Card Header */}
      <div className="bg-[#090d16]/90 px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-mono-hud font-bold text-xs text-white truncate">
            {camera.id}
          </span>
          <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
            • {camera.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Scenario Re-Trigger Button */}
          <button
            onClick={handleTriggerScenario}
            title={`Trigger Scenario ${camera.scenario_id}`}
            className="p-1 rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 border border-amber-500/30 text-[10px] font-mono-hud flex items-center gap-1 transition-all"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden md:inline">S-{camera.scenario_id}</span>
          </button>

          {/* Zone Editor Modal Trigger */}
          <button
            onClick={handleOpenZoneEditor}
            title="Edit Virtual Zones & Tripwires"
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[10px] font-mono-hud flex items-center gap-1 transition-all"
          >
            <Sliders className="w-3 h-3" />
            <span className="hidden md:inline">Zones</span>
          </button>

          {/* Spotlight View Toggle */}
          {onSpotlight && (
            <button
              onClick={onSpotlight}
              title="Spotlight View"
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Video Stream Container */}
      <div className="relative bg-black aspect-video scanline group overflow-hidden flex items-center justify-center">
        {!imageError ? (
          <img
            src={`/api/cameras/${camera.id}/stream`}
            alt={camera.name}
            className="w-full h-full object-cover select-none"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-500 font-mono-hud text-xs p-4 text-center">
            <Radio className="w-8 h-8 text-red-500 animate-pulse" />
            <span>Connecting to RTSP Stream for {camera.id}...</span>
            <button
              onClick={() => setImageError(false)}
              className="mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[11px]"
            >
              Retry Stream
            </button>
          </div>
        )}

        {/* Live HUD Floating Watermarks */}
        <div className="absolute top-2 left-2 pointer-events-none flex flex-col gap-1 z-20">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/75 border border-cyan-500/40 text-[10px] font-mono-hud font-semibold text-cyan-300 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            LIVE AI STREAM
          </div>
          <div className="text-[10px] font-mono-hud text-slate-300 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
            LOC: {camera.location}
          </div>
        </div>

        {/* Bottom Right Live Target Counters */}
        <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1.5 z-20">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 border border-yellow-500/30 text-[10px] font-mono-hud text-yellow-300 backdrop-blur-sm">
            <span>P: {camera.current_persons || 0}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 border border-blue-500/30 text-[10px] font-mono-hud text-blue-300 backdrop-blur-sm">
            <span>V: {camera.current_vehicles || 0}</span>
          </div>
        </div>
      </div>

      {/* Bottom Mode Switcher Bar */}
      <div className="bg-[#080c14] p-2 border-t border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto">
        <div className="text-[10px] font-mono-hud text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-1">
          Vision Mode:
        </div>
        <div className="flex items-center gap-1">
          {modeOptions.map(m => {
            const Icon = m.icon;
            const isSelected = activeMode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => switchCameraMode(camera.id, m.key)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono-hud font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3 h-3 ${m.color}`} />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
