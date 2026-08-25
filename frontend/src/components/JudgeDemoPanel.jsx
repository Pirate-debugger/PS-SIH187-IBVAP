import React, { useState } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { 
  Sparkles, 
  RotateCcw, 
  Pause, 
  Play, 
  Trash2, 
  CheckCircle2, 
  HelpCircle, 
  Award, 
  Zap, 
  ShieldAlert,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function JudgeDemoPanel() {
  const { 
    scenariosList, 
    triggerScenario, 
    resetAllScenarios, 
    togglePauseStreams, 
    clearAllIncidents, 
    isPaused, 
    setActiveTab, 
    setSpotlightCameraId 
  } = useSurveillance();

  const [activeStep, setActiveStep] = useState(1);
  const [activeFaqTab, setActiveFaqTab] = useState('SCRIPT'); // 'SCRIPT', 'INNOVATIONS', 'FAQ'

  const demoSteps = [
    {
      step: 1,
      title: "Introduction: Existing CCTV Baseline",
      cue: "Show normal multi-camera wall without hardware modifications. 'These are standard, existing IP cameras deployed across remote border outposts.'",
      actionLabel: "View Multi-Camera Wall",
      tab: "grid"
    },
    {
      step: 2,
      title: "Scenario 1: Zero-Line Restricted Zone Intrusion",
      cue: "Trigger Scenario 1. Target P-017 breaches the Zero-Line wire fence into Red Zone. Explain how Shapely Ray-Casting & Kalman tracking calculate speed (14 km/h) and direction (North -> South).",
      actionLabel: "Launch Scenario 1",
      scenarioId: 1,
      camera: "BOP-CAM-01"
    },
    {
      step: 3,
      title: "Explainable Risk Scoring & Incident Dossier",
      cue: "Open Incident INC-2026-0081. Show judges the itemized risk calculation (+35 Restricted Zone +25 Directional Crossing = 75/100 HIGH) and the step-by-step SSB QRF deployment SOP.",
      actionLabel: "Open Incident Room",
      tab: "incidents"
    },
    {
      step: 4,
      title: "Scenario 3: Vehicle ANPR & Smuggler Watchlist Hit",
      cue: "Trigger Scenario 3. Bolero approaches Checkpost Alpha. Optical OCR extracts 'HR26DK8337', instantly matching the contraband watchlist database.",
      actionLabel: "Launch Scenario 3 (ANPR)",
      scenarioId: 3,
      camera: "BOP-CAM-03"
    },
    {
      step: 5,
      title: "Scenario 4: Night-Time Thermal Surveillance",
      cue: "Switch to Sector 4 Riverine marsh. Activate Thermal FLIR Simulation and NVG Phosphor Green modes to reveal crawling stealth intruder in pitch darkness.",
      actionLabel: "Launch Scenario 4 (Night Vision)",
      scenarioId: 4,
      camera: "BOP-CAM-04"
    },
    {
      step: 6,
      title: "Tactical GIS Map & 1-Click PDF Dossier Export",
      cue: "Switch to Tactical GIS Map to inspect geo-spatial FOV cones and export a print-ready confidential SSB incident dossier for command headquarters.",
      actionLabel: "View Tactical Map",
      tab: "map"
    }
  ];

  const innovations = [
    { title: "1. 100% Software-Defined Edge Intelligence", desc: "Eliminates reliance on costly proprietary smart cameras by running AI on commercial edge hardware." },
    { title: "2. Transparent Explainable 8-Rule Engine", desc: "Replaces vague black-box AI claims with deterministic, court-admissible reasons (RULE-01 to RULE-08)." },
    { title: "3. Itemized Additive Risk Scoring", desc: "Computes 0-100 threat score with mathematical factor breakdown (+35 Restricted Zone, +25 Directional Crossing)." },
    { title: "4. Multi-Mode Night Surveillance", desc: "Adaptive CLAHE, Gamma, Retinex, NVG Phosphor Green, and False-Color FLIR Thermal Simulation." },
    { title: "5. Automated Incident-to-SOP Pipeline", desc: "Automatically binds structured dossiers (INC-2026-XXXX) with official SSB Standard Operating Procedures." },
    { title: "6. Interactive Virtual Zone Canvas", desc: "Enables border operators to click and plot custom restricted polygons and directional tripwires over live feeds." },
    { title: "7. Degraded Network / Edge Resilience", desc: "Queues events locally during WAN outages and automatically synchronizes when uplink is restored." },
    { title: "8. Continuous Camera Health Diagnostics", desc: "Monitors frame drops, jitter, FPS, and stream degradation across all remote border outposts." },
    { title: "9. Cross-Camera Target Trajectory Forensics", desc: "Reconstructs target journey (P-017) across multiple BOP sectors with chronological micro-timelines." },
    { title: "10. One-Click Court-Admissible PDF Export", desc: "Generates formatted confidential evidence dossiers with keyframe snapshots and audit trails." }
  ];

  const faqs = [
    { q: "How does IBVAP work with existing low-resolution or legacy CCTV cameras?", a: "IBVAP ingests standard RTSP/MJPEG IP streams. It applies pre-processing (bilateral filtering, CLAHE, Retinex contrast stretching) before feeding frames to lightweight edge detectors (YOLOv8/Torchvision), requiring no specialized camera hardware." },
    { q: "How do you prevent false positives from wildlife or shifting shadows?", a: "By combining multi-target Kalman centroid tracking, spatial dwell thresholds (>6s), and directional vector validation. Transient shadows or small animals do not maintain persistent human trajectories." },
    { q: "Is the thermal mode actual thermal hardware?", a: "No, we explicitly label it 'THERMAL SIMULATION (FLIR)'. It uses adaptive CLAHE and false-color Inferno heatmaps to highlight infrared signatures from low-light CCTV without falsely claiming physical thermal sensors." },
    { q: "What happens if border connectivity goes down?", a: "IBVAP features an Edge-First architecture: local AI processing continues unhindered, alerts are buffered in a local FIFO queue, and auto-sync occurs once connection is restored." },
    { q: "How does the ANPR engine handle dirty or non-standard plates?", a: "EasyOCR with adaptive morphology filtering extracts alphanumeric text, which is normalized via Indian registration RegEx patterns and fuzzy-matched against the contraband watchlist." }
  ];

  const handleExecuteStep = (stepItem) => {
    setActiveStep(stepItem.step);
    if (stepItem.scenarioId) {
      triggerScenario(stepItem.scenarioId);
    } else if (stepItem.tab) {
      setActiveTab(stepItem.tab);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top Banner & Global Presentation Toolbar */}
      <div className="tactical-panel px-4 py-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-amber-400">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-400">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="font-orbitron font-black text-base text-white">
              SIH JUDGE DEMONSTRATION CONTROL CENTER
            </div>
            <div className="text-xs text-slate-300 font-mono-hud mt-0.5">
              5-Minute Presentation Cue Card • Quick Scenario Triggers • Reset & Control Toolbar • Judge Q&A Reference
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetAllScenarios}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono-hud font-bold flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={togglePauseStreams}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono-hud font-bold flex items-center gap-1.5 transition-all ${
              isPaused
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-yellow-950 border-yellow-500 text-yellow-300'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? "Resume AI" : "Pause AI"}</span>
          </button>

          <button
            onClick={clearAllIncidents}
            className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-500/40 text-xs font-mono-hud font-bold flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Incidents</span>
          </button>
        </div>
      </div>

      {/* Mode Sub-Tabs */}
      <div className="flex items-center gap-2 bg-[#090d16] p-1 rounded-lg border border-slate-800 w-fit">
        <button
          onClick={() => setActiveFaqTab('SCRIPT')}
          className={`px-4 py-1.5 rounded-md text-xs font-mono-hud font-bold transition-all ${
            activeFaqTab === 'SCRIPT' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          🎬 5-Minute Demo Script
        </button>
        <button
          onClick={() => setActiveFaqTab('INNOVATIONS')}
          className={`px-4 py-1.5 rounded-md text-xs font-mono-hud font-bold transition-all ${
            activeFaqTab === 'INNOVATIONS' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          💡 Top 10 Innovations
        </button>
        <button
          onClick={() => setActiveFaqTab('FAQ')}
          className={`px-4 py-1.5 rounded-md text-xs font-mono-hud font-bold transition-all ${
            activeFaqTab === 'FAQ' ? 'bg-amber-400 text-black shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          ❓ Judge Q&A Reference
        </button>
      </div>

      {/* Tab 1: 5-Minute Script Stepper */}
      {activeFaqTab === 'SCRIPT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {demoSteps.map(st => {
            const isCurrent = activeStep === st.step;
            return (
              <div
                key={st.step}
                className={`tactical-panel p-4 rounded-xl flex flex-col justify-between gap-3 transition-all ${
                  isCurrent ? 'border-amber-400 bg-[#0e1626] shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-hud font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      STEP {st.step} OF 6
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono-hud text-emerald-400 flex items-center gap-1 font-bold animate-pulse">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE DEMO CUE
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-bold text-white">
                    {st.title}
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed bg-[#080d16] p-2.5 rounded-lg border border-slate-800 font-mono-hud">
                    "{st.cue}"
                  </div>
                </div>

                <button
                  onClick={() => handleExecuteStep(st)}
                  className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold font-mono-hud text-xs flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all"
                >
                  <span>{st.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Top 10 Innovations */}
      {activeFaqTab === 'INNOVATIONS' && (
        <div className="tactical-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {innovations.map((inv, idx) => (
            <div key={idx} className="bg-[#090d16] p-3.5 rounded-lg border border-slate-800 flex flex-col gap-1">
              <div className="font-orbitron font-bold text-xs text-amber-300">
                {inv.title}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-mono-hud">
                {inv.desc}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Judge Q&A Reference */}
      {activeFaqTab === 'FAQ' && (
        <div className="tactical-panel p-5 rounded-xl flex flex-col gap-3">
          {faqs.map((f, idx) => (
            <div key={idx} className="bg-[#090d16] p-4 rounded-lg border border-slate-800 flex flex-col gap-1.5">
              <div className="font-bold text-xs text-amber-300 font-mono-hud flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Q: {f.q}</span>
              </div>
              <div className="text-xs text-slate-200 leading-relaxed font-mono-hud pl-6">
                <strong>Answer:</strong> {f.a}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
