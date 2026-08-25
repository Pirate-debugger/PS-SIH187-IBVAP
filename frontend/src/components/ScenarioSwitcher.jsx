import React, { useState } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { 
  Sparkles, 
  Play, 
  ShieldAlert, 
  Clock, 
  Car, 
  Moon, 
  Users, 
  Package, 
  CheckCircle2, 
  ArrowRight,
  Video
} from 'lucide-react';

export default function ScenarioSwitcher() {
  const { scenariosList, triggerScenario, setActiveTab, setSpotlightCameraId } = useSurveillance();
  const [activeScenarioId, setActiveScenarioId] = useState(1);
  const [triggering, setTriggering] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const scenarioIcons = {
    1: ShieldAlert,
    2: Clock,
    3: Car,
    4: Moon,
    5: Users,
    6: Package
  };

  const handleLaunch = async (scenario) => {
    setTriggering(true);
    setActiveScenarioId(scenario.id);
    const data = await triggerScenario(scenario.id);
    setTriggering(false);
    setSuccessMsg(`🚀 Scenario ${scenario.id} active on ${scenario.camera_id}!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleJumpToFeed = (camId) => {
    setSpotlightCameraId(camId);
    setActiveTab('grid');
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top Banner */}
      <div className="tactical-panel px-4 py-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-amber-400">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-400">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <div className="font-orbitron font-black text-base text-white">
              6 BATTLE-TESTED HACKATHON DEMO SCENARIOS
            </div>
            <div className="text-xs text-slate-300 font-mono-hud mt-0.5">
              Live AI evaluation feeds designed for seamless hackathon presentations, judge walkthroughs, and defense evaluations.
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono-hud text-xs font-bold animate-bounce">
            {successMsg}
          </div>
        )}
      </div>

      {/* Grid of 6 Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenariosList.map(scen => {
          const Icon = scenarioIcons[scen.id] || ShieldAlert;
          const isSelected = activeScenarioId === scen.id;

          return (
            <div
              key={scen.id}
              className={`tactical-panel p-4 rounded-xl flex flex-col justify-between gap-3 transition-all ${
                isSelected
                  ? 'border-amber-400 bg-[#0e1626] shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                  : 'hover:border-slate-600'
              }`}
            >
              <div className="flex flex-col gap-2">
                
                {/* Header: Number + Camera ID */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-orbitron font-bold text-xs text-white">
                      SCENARIO #{scen.id}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-hud font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                    {scen.camera_id}
                  </span>
                </div>

                {/* Scenario Title */}
                <div className="text-sm font-bold text-white mt-1">
                  {scen.title.split(': ')[1] || scen.title}
                </div>

                {/* Scenario Narrative Description */}
                <div className="text-xs text-slate-300 leading-relaxed">
                  {scen.description}
                </div>

                {/* AI Detection & Expected Alert Badge */}
                <div className="mt-1 p-2 rounded-lg bg-[#080d16] border border-slate-800 text-[11px] font-mono-hud flex flex-col gap-1">
                  <div className="text-slate-400">
                    <strong className="text-cyan-400">AI Trigger:</strong> {scen.expected_alert}
                  </div>
                  <div className="text-slate-400">
                    <strong className="text-amber-400">Tactical SOP:</strong> {scen.sop}
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleLaunch(scen)}
                  className="flex-1 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold font-mono-hud text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Launch Live Demo</span>
                </button>

                <button
                  onClick={() => handleJumpToFeed(scen.camera_id)}
                  title="View Camera Feed"
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs transition-all"
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Presentation Architecture Explainer for Judges */}
      <div className="tactical-panel p-4 rounded-xl border-l-4 border-l-cyan-400 flex flex-col gap-2 font-mono-hud text-xs">
        <div className="font-orbitron font-bold text-sm text-cyan-300">
          💡 HOW IBVAP 2.0 EVALUATES EACH SCENARIO UNDER THE HOOD:
        </div>
        <div className="text-slate-300 leading-relaxed">
          1. <strong>Video Stream Ingestion:</strong> Standard IP/RTSP CCTV streams are ingested frame-by-frame with zero proprietary hardware.<br/>
          2. <strong>Computer Vision Pipeline:</strong> Multi-target Kalman/Centroid tracking assigns permanent track IDs (`P-01`, `V-03`), speed vectors, and directional paths.<br/>
          3. <strong>Geometric & OCR Inference:</strong> Shapely Ray-Casting tests polygon restricted boundaries and tripwires. Optical OCR sanitizes vehicle plates and matches against the contraband watchlist database.<br/>
          4. <strong>Actionable Intelligence:</strong> Generates structured `INC-2026-XXXX` dossiers, triggers siren alarms, and provisions SSB Standard Operating Procedures (SOP) with 1-click PDF export.
        </div>
      </div>

    </div>
  );
}
