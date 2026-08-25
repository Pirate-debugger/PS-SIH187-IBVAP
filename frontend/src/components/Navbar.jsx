import React, { useState, useEffect } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { 
  ShieldAlert, 
  Grid, 
  Map as MapIcon, 
  Car, 
  FileText, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Radio, 
  Maximize, 
  Minimize,
  Sliders
} from 'lucide-react';

export default function Navbar() {
  const { 
    telemetry, 
    activeTab, 
    setActiveTab, 
    soundMuted, 
    setSoundMuted, 
    alerts, 
    incidents,
    setZoneEditorOpen 
  } = useSurveillance();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  return (
    <header className="tactical-panel border-b border-cyan-500/20 px-4 py-2.5 sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Ministry / Platform Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-base font-black tracking-wider text-white">
                IBVAP <span className="text-cyan-400">2.0</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono-hud font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SSB POLICE II
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-tight">
              Ministry of Home Affairs • Border Outpost AI Matrix
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#090e17]/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'grid'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Camera Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'map'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Tactical Map</span>
          </button>

          <button
            onClick={() => setActiveTab('anpr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'anpr'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>ANPR & Watchlist</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'incidents'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Incident Room</span>
            {incidents.length > 0 && (
              <span className="px-1.5 py-0.2 text-[9px] font-mono-hud rounded-full bg-red-500/80 text-white font-bold">
                {incidents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'scenarios'
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                : 'text-amber-400 hover:bg-amber-400/10 border border-amber-400/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>6 Demo Scenarios</span>
          </button>
        </nav>

        {/* Right: Threat Level, Clocks & Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Threat DEFCON Badge */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-md border font-mono-hud text-xs font-bold ${
            criticalCount > 0
              ? 'bg-red-950/70 border-red-500 text-red-400 shadow-[0_0_15px_rgba(255,51,102,0.35)] animate-pulse'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
          }`}>
            <Radio className="w-3.5 h-3.5" />
            <span>{telemetry.threat_level}</span>
          </div>

          {/* Time Displays */}
          <div className="hidden lg:flex flex-col items-end font-mono-hud text-[11px] leading-tight">
            <span className="text-cyan-400 font-bold">
              {currentTime.toLocaleTimeString('en-IN', { hour12: false })} IST
            </span>
            <span className="text-slate-500 text-[10px]">
              {currentTime.toISOString().slice(0, 10)}
            </span>
          </div>

          {/* Virtual Zone Editor Button */}
          <button
            onClick={() => setZoneEditorOpen(true)}
            title="Configure Virtual Border Zones"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zone Editor</span>
          </button>

          {/* Sound Alarm Mute/Unmute */}
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            title={soundMuted ? "Unmute Tactical Audio" : "Mute Tactical Audio"}
            className={`p-1.5 rounded-md border transition-all ${
              soundMuted
                ? 'bg-slate-800 text-slate-500 border-slate-700'
                : 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40 hover:bg-cyan-900/60'
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
}
