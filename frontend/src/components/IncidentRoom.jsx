import React, { useState } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { exportIncidentDossier } from '../utils/exportDossier';
import { 
  FileText, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Navigation, 
  Camera, 
  ListChecks, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function IncidentRoom() {
  const { incidents, selectedIncident, setSelectedIncident, updateIncidentStatus } = useSurveillance();
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredIncidents = incidents.filter(inc => {
    if (severityFilter === 'ALL') return true;
    return inc.severity === severityFilter;
  });

  const activeInc = selectedIncident || filteredIncidents[0] || null;

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top Banner */}
      <div className="tactical-panel px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-950/70 border border-red-500/40 text-red-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-orbitron font-bold text-sm text-white">
              INCIDENT INTELLIGENCE & INVESTIGATION ROOM
            </div>
            <div className="text-[11px] text-slate-400 font-mono-hud">
              Structured Border Incident Dossiers • Keyframe Evidence • Tactical SSB Standard Operating Procedures (SOP)
            </div>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 bg-[#090d16] p-1 rounded-lg border border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded text-xs font-mono-hud transition-all ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Incidents List on Left, Active Dossier on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 4 Cols: Incidents Timeline List */}
        <div className="lg:col-span-4 tactical-panel p-3.5 rounded-xl flex flex-col gap-2.5 max-h-[750px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono-hud font-bold text-xs text-white uppercase tracking-wider">
              Incident Dossier Feed ({filteredIncidents.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="text-center text-slate-500 font-mono-hud text-xs p-6">
                No incidents match the selected filter.
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const isSelected = activeInc?.incident_id === inc.incident_id;
                return (
                  <div
                    key={inc.incident_id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-[#090d16]/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-hud font-bold text-xs text-cyan-300">
                        {inc.incident_id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono-hud font-bold border ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-red-950/70 border-red-500 text-red-400'
                          : inc.severity === 'HIGH'
                          ? 'bg-orange-950/70 border-orange-500 text-orange-400'
                          : 'bg-yellow-950/70 border-yellow-500 text-yellow-400'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-white truncate">
                      {inc.event_type.replace(/_/g, ' ')}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      {inc.camera_name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono-hud text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>{inc.timestamp}</span>
                      <span className="text-cyan-400 flex items-center gap-0.5">
                        Inspect <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 8 Cols: Detailed Dossier Viewer */}
        <div className="lg:col-span-8 tactical-panel p-5 rounded-xl flex flex-col gap-4">
          {activeInc ? (
            <div className="flex flex-col gap-4">
              
              {/* Dossier Header & Export Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-black text-xl text-white">
                      {activeInc.incident_id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono-hud font-bold border ${
                      activeInc.severity === 'CRITICAL'
                        ? 'bg-red-950 border-red-500 text-red-400'
                        : 'bg-orange-950 border-orange-500 text-orange-400'
                    }`}>
                      {activeInc.severity} SEVERITY
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono-hud mt-0.5">
                    {activeInc.location_str} • Timestamp: {activeInc.timestamp} IST
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportIncidentDossier(activeInc)}
                    className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono-hud text-xs flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Export Dossier (Print / PDF)</span>
                  </button>
                </div>
              </div>

              {/* Dossier Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#090d16] p-3 rounded-lg border border-slate-800 font-mono-hud text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Camera ID</span>
                  <div className="text-white font-bold">{activeInc.camera_id}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Movement Vector</span>
                  <div className="text-yellow-400 font-bold">{activeInc.movement_vector}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Dwell / Breach Duration</span>
                  <div className="text-cyan-300 font-bold">{activeInc.duration_sec} Seconds</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Investigation Status</span>
                  <div className="text-emerald-400 font-bold">{activeInc.status}</div>
                </div>
              </div>

              {/* Keyframe Evidence Snapshot */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-mono-hud text-slate-300 font-bold uppercase tracking-wider">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Keyframe Surveillance Evidence Snapshot</span>
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-72">
                  <img
                    src={activeInc.snapshot_url}
                    alt="Keyframe Evidence"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>
              </div>

              {/* SSB Standard Operating Procedure (SOP) Action Checklist */}
              <div className="bg-[#090e18] p-4 rounded-xl border border-cyan-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-cyan-400" />
                    <span className="font-orbitron font-bold text-xs text-white">
                      {activeInc.sop_title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-hud text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                    MHA / SSB PROTOCOL
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-xs font-mono-hud">
                  {activeInc.sop_steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-[#0d1422] p-2 rounded border border-slate-800/80">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold shrink-0">
                        STEP {idx + 1}
                      </span>
                      <span className="text-slate-200 leading-relaxed">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status Updater Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
                  <span className="text-xs font-mono-hud text-slate-400">
                    Mark Tactical Action:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateIncidentStatus(activeInc.incident_id, 'DISPATCHED', 'QRF Dispatched to Sector')}
                      className="px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono-hud font-bold"
                    >
                      ⚡ QRF Dispatched
                    </button>
                    <button
                      onClick={() => updateIncidentStatus(activeInc.incident_id, 'RESOLVED', 'Area Secured and Cleared')}
                      className="px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono-hud font-bold"
                    >
                      ✓ Area Secured & Resolved
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono-hud text-xs p-12 text-center">
              <FileText className="w-12 h-12 text-slate-700 mb-2" />
              <span>Select an incident from the timeline to inspect full keyframe evidence and tactical SOP checklist.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
