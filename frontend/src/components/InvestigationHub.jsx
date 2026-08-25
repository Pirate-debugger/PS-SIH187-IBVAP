import React, { useState } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { 
  Search, 
  MapPin, 
  Car, 
  User, 
  Calendar, 
  Filter, 
  ExternalLink, 
  ChevronRight, 
  ShieldAlert, 
  Camera,
  Activity,
  ArrowRight
} from 'lucide-react';

export default function InvestigationHub() {
  const { incidents, setSelectedIncident, setActiveTab } = useSurveillance();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCam, setSelectedCam] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [trackQuery, setTrackQuery] = useState('P-017');
  const [trackJourneyData, setTrackJourneyData] = useState(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

  // Filtered incidents based on search parameters
  const filteredResults = incidents.filter(inc => {
    let match = true;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      const corpus = `${inc.incident_id} ${inc.camera_name} ${inc.event_type} ${inc.location_str} ${inc.movement_vector} ${inc.rule_explanation || ''}`.toLowerCase();
      if (!corpus.includes(kw)) match = false;
    }
    if (selectedCam !== 'ALL' && inc.camera_id !== selectedCam) match = false;
    if (selectedSeverity !== 'ALL' && inc.severity !== selectedSeverity) match = false;
    return match;
  });

  const handleInspectTrack = async (tid) => {
    setLoadingTrack(true);
    setTrackQuery(tid);
    try {
      const res = await fetch(`/api/investigation/track/${tid}`);
      const data = await res.json();
      setTrackJourneyData(data);
    } catch (e) {
      console.error("Track search error:", e);
    }
    setLoadingTrack(false);
  };

  const handleOpenIncidentDossier = (inc) => {
    setSelectedIncident(inc);
    setActiveTab('incidents');
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top Banner */}
      <div className="tactical-panel px-4 py-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-cyan-400">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <div className="font-orbitron font-black text-base text-white">
              INTELLIGENCE INVESTIGATION & FORENSICS HUB
            </div>
            <div className="text-xs text-slate-300 font-mono-hud mt-0.5">
              Multi-Camera Cross-Correlation • Target Trajectory Reconstruction • License Plate & Sighting Audit
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono-hud font-bold">
            {filteredResults.length} Matched Records
          </span>
        </div>
      </div>

      {/* Search Filter Toolbar */}
      <div className="tactical-panel p-3.5 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Keyword Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Track ID (P-017), Plate (HR26DK8337), Incident ID, or Keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-xs font-mono-hud text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
          />
        </div>

        {/* Camera Filter */}
        <div>
          <select
            value={selectedCam}
            onChange={(e) => setSelectedCam(e.target.value)}
            className="w-full py-2 px-3 rounded-lg bg-[#090d16] border border-slate-700 text-xs font-mono-hud text-white focus:border-cyan-400 outline-none"
          >
            <option value="ALL">All Outpost Cameras</option>
            <option value="BOP-CAM-01">BOP-CAM-01 (Zero Line)</option>
            <option value="BOP-CAM-02">BOP-CAM-02 (Western Grid)</option>
            <option value="BOP-CAM-03">BOP-CAM-03 (Checkpost Alpha)</option>
            <option value="BOP-CAM-04">BOP-CAM-04 (Riverine Marsh)</option>
            <option value="BOP-CAM-05">BOP-CAM-05 (North Boundary)</option>
            <option value="BOP-CAM-06">BOP-CAM-06 (Gate Bravo)</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full py-2 px-3 rounded-lg bg-[#090d16] border border-slate-700 text-xs font-mono-hud text-white focus:border-cyan-400 outline-none"
          >
            <option value="ALL">All Threat Severities</option>
            <option value="CRITICAL">🚨 CRITICAL Threats</option>
            <option value="HIGH">⚠️ HIGH Threats</option>
            <option value="MEDIUM">🟡 MEDIUM Threats</option>
          </select>
        </div>

      </div>

      {/* Main 2-Column Workspace: Search Results on Left, Track Journey on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 7 Cols: Search Results Grid */}
        <div className="lg:col-span-7 tactical-panel p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono-hud font-bold text-xs text-white uppercase tracking-wider">
              Surveillance Sightings & Evidence Audit Trail
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px] flex flex-col gap-2.5 pr-1">
            {filteredResults.length === 0 ? (
              <div className="text-center text-slate-500 font-mono-hud text-xs p-10">
                No matching events found for current query.
              </div>
            ) : (
              filteredResults.map(inc => (
                <div
                  key={inc.incident_id}
                  className="p-3 rounded-lg bg-[#090d16] border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-hud font-bold text-xs text-cyan-300">
                        {inc.incident_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono-hud font-bold border ${
                        inc.severity === 'CRITICAL' ? 'bg-red-950/80 border-red-500 text-red-400' : 'bg-orange-950/80 border-orange-500 text-orange-400'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono-hud text-slate-400">
                      {inc.timestamp}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white">
                    {inc.event_type.replace(/_/g, ' ')} • {inc.camera_name}
                  </div>

                  <div className="text-[11px] text-slate-300 font-mono-hud bg-[#05080e] p-2 rounded border border-slate-800/80 leading-relaxed">
                    {inc.rule_explanation || inc.movement_vector}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-1">
                    <button
                      onClick={() => handleInspectTrack(inc.objects_involved[0]?.split(' ')[0] || 'P-017')}
                      className="text-[11px] font-mono-hud text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Reconstruct Target Journey</span>
                    </button>

                    <button
                      onClick={() => handleOpenIncidentDossier(inc)}
                      className="text-[11px] font-mono-hud text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>View Full Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 5 Cols: Track Trajectory Visualizer */}
        <div className="lg:col-span-5 tactical-panel p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="font-mono-hud font-bold text-xs text-white uppercase tracking-wider">
                Multi-Camera Target Journey
              </span>
            </div>
            <span className="text-[10px] font-mono-hud text-cyan-400 font-bold">
              TRACK: {trackQuery}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              placeholder="Track ID (e.g. P-017, V-004)"
              className="flex-1 px-3 py-1.5 rounded bg-[#090d16] border border-slate-700 text-xs font-mono-hud text-white focus:border-cyan-400 outline-none"
            />
            <button
              onClick={() => handleInspectTrack(trackQuery)}
              className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono-hud text-xs"
            >
              Analyze
            </button>
          </div>

          {/* Stepper Timeline for Target */}
          <div className="flex-1 flex flex-col gap-3 bg-[#090d16] p-3 rounded-lg border border-slate-800 overflow-y-auto max-h-[500px]">
            <div className="text-[11px] font-mono-hud text-slate-400 font-semibold border-b border-slate-800/80 pb-1.5">
              Spatial Waypoints & Sector Ingress Path:
            </div>

            {[
              { time: "02:17:35", cam: "BOP-CAM-01", desc: "First localized by optical AI engine near sector pillar 84/2", status: "NORMAL" },
              { time: "02:17:40", cam: "BOP-CAM-01", desc: "Infiltrated 50m Monitored Buffer Zone heading South", status: "ELEVATED" },
              { time: "02:17:42", cam: "BOP-CAM-01", desc: "Breached Directional Virtual Tripwire (N -> S) into Red Zone", status: "CRITICAL" },
              { time: "02:17:50", cam: "BOP-CAM-02", desc: "Secondary sighting on Western wire grid camera feed", status: "TRACKING" }
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 relative pl-2">
                {/* Timeline Line */}
                {idx < 3 && <div className="absolute left-[15px] top-6 bottom-0 w-0.5 bg-slate-700" />}

                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold font-mono-hud z-10 ${
                  step.status === 'CRITICAL' ? 'bg-red-500 text-white shadow-[0_0_8px_#ff3366]' : 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                }`}>
                  {idx + 1}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-hud font-bold text-xs text-white">{step.cam}</span>
                    <span className="text-[10px] font-mono-hud text-slate-400">• {step.time} IST</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-snug">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
