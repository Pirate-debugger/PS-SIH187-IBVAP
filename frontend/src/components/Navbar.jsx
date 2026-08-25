import React, { useState, useEffect } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { 
  ShieldAlert, 
  Grid, 
  Map as MapIcon, 
  Car, 
  FileText, 
  Sparkles, 
  Search,
  Award,
  Volume2, 
  VolumeX, 
  Radio, 
  Maximize, 
  Minimize,
  Sliders,
  Wifi,
  WifiOff,
  UserCheck
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
    setZoneEditorOpen,
    operatorRole,
    setOperatorRole,
    edgeDegraded,
    toggleEdgeConnectivity
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
    <header className="tactical-panel border-b border-cyan-500/20 px-3 py-2 sticky top-0 z-40">
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Ministry / Platform Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-950/90 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron text-sm font-black tracking-wider text-white">
                IBVAP <span className="text-cyan-400">3.0</span>
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono-hud font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SSB POLICE II
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-tight">
              Ministry of Home Affairs • Border Video Intelligence Matrix
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#090e17]/90 p-1 rounded-lg border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'grid'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Camera Wall</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
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
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'anpr'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>ANPR Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'incidents'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Incidents</span>
            {incidents.length > 0 && (
              <span className="px-1.5 py-0.2 text-[9px] font-mono-hud rounded-full bg-red-500/90 text-white font-bold">
                {incidents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('investigation')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'investigation'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Investigation</span>
          </button>

          <button
            onClick={() => setActiveTab('judge')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-bold transition-all shrink-0 ${
              activeTab === 'judge'
                ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                : 'text-amber-400 hover:bg-amber-400/10 border border-amber-400/30'
            }`}
          >
            <Award className="w-3.5 h-3.5 animate-bounce" />
            <span>SIH Judge Demo</span>
          </button>
        </nav>

        {/* Right Controls: Role, Degraded Link, DEFCON, Clocks */}
        <div className="flex items-center gap-2">
          
          {/* Degraded WAN Link Toggle */}
          <button
            onClick={toggleEdgeConnectivity}
            title={edgeDegraded ? "Uplink Jammed/Offline: Buffering locally on edge node" : "Uplink Online: Real-time telemetry streaming"}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono-hud font-bold border transition-all ${
              edgeDegraded
                ? 'bg-orange-950/80 border-orange-500 text-orange-400 animate-pulse'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
            }`}
          >
            {edgeDegraded ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
            <span className="hidden md:inline">{edgeDegraded ? "EDGE QUEUE (WAN OFFLINE)" : "WAN UPLINK ONLINE"}</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1 bg-[#090d16] px-2 py-1 rounded border border-slate-800 text-[10px] font-mono-hud">
            <UserCheck className="w-3 h-3 text-cyan-400" />
            <select
              value={operatorRole}
              onChange={(e) => setOperatorRole(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer"
            >
              <option value="COMMANDER" className="bg-slate-900 text-white">COMMANDER</option>
              <option value="OPERATOR" className="bg-slate-900 text-white">OPERATOR</option>
            </select>
          </div>

          {/* Threat DEFCON Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono-hud text-[11px] font-bold ${
            criticalCount > 0
              ? 'bg-red-950/70 border-red-500 text-red-400 shadow-[0_0_12px_rgba(255,51,102,0.35)] animate-pulse'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
          }`}>
            <Radio className="w-3 h-3" />
            <span>{telemetry.threat_level?.split(' ')[0] || 'DEFCON 3'}</span>
          </div>

          {/* Zone Editor Modal */}
          <button
            onClick={() => setZoneEditorOpen(true)}
            title="Configure Virtual Border Zones"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-medium"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Zone Editor</span>
          </button>

          {/* Audio Alarm */}
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            title={soundMuted ? "Unmute Tactical Audio" : "Mute Tactical Audio"}
            className={`p-1.5 rounded border transition-all ${
              soundMuted ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40'
            }`}
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>
    </header>
  );
}
