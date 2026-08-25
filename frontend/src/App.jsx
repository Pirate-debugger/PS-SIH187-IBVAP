import React, { useState } from 'react';
import { SurveillanceProvider, useSurveillance } from './context/SurveillanceContext';
import Navbar from './components/Navbar';
import StatsBar from './components/StatsBar';
import MultiCameraGrid from './components/MultiCameraGrid';
import TacticalBorderMap from './components/TacticalBorderMap';
import ANPRWatchlistHub from './components/ANPRWatchlistHub';
import IncidentRoom from './components/IncidentRoom';
import InvestigationHub from './components/InvestigationHub';
import JudgeDemoPanel from './components/JudgeDemoPanel';
import ScenarioSwitcher from './components/ScenarioSwitcher';
import RealtimeAlertStream from './components/RealtimeAlertStream';
import ZoneEditorModal from './components/ZoneEditorModal';

function DashboardContent() {
  const { activeTab, alerts, edgeDegraded } = useSurveillance();

  return (
    <div className="min-h-screen flex flex-col bg-[#06090f] text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main KPI Stats Bar */}
      <StatsBar />

      {/* Primary Workspace Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-3 py-1.5 flex flex-col lg:flex-row gap-3">
        
        {/* Main Center Display (switched via activeTab) */}
        <div className="flex-1 min-w-0">
          {activeTab === 'grid' && <MultiCameraGrid />}
          {activeTab === 'map' && <TacticalBorderMap />}
          {activeTab === 'anpr' && <ANPRWatchlistHub />}
          {activeTab === 'incidents' && <IncidentRoom />}
          {activeTab === 'investigation' && <InvestigationHub />}
          {activeTab === 'judge' && <JudgeDemoPanel />}
          {activeTab === 'scenarios' && <ScenarioSwitcher />}
        </div>

        {/* Right Tactical Alert Stream (Always active on Grid & Map views) */}
        {(activeTab === 'grid' || activeTab === 'map') && (
          <aside className="lg:w-84 xl:w-96 flex flex-col shrink-0">
            <RealtimeAlertStream />
          </aside>
        )}

      </main>

      {/* Floating Zone Editor Modal */}
      <ZoneEditorModal />

      {/* Footer Status Bar */}
      <footer className="bg-[#05070c] border-t border-slate-800/80 px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono-hud text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            IBVAP 3.0 AI EDGE ENGINE: ONLINE
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="hidden sm:inline">SSB POLICE II DIVISION • SMART BORDER SURVEILLANCE MATRIX</span>
          <span className="hidden md:inline text-amber-400 font-bold">[DEMO & SYNTHETIC DATA LABELED]</span>
        </div>

        <div className="flex items-center gap-3">
          <span>LINK: <strong className={edgeDegraded ? "text-orange-400" : "text-emerald-400"}>{edgeDegraded ? "DEGRADED (BUFFERING)" : "ONLINE"}</strong></span>
          <span className="text-slate-700">|</span>
          <span className="text-emerald-400">LATENCY: 18.2ms</span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <SurveillanceProvider>
      <DashboardContent />
    </SurveillanceProvider>
  );
}
