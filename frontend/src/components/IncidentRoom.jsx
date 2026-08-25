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
  ChevronRight,
  Filter,
  UserPlus,
  MessageSquare,
  Activity,
  Layers
} from 'lucide-react';

export default function IncidentRoom() {
  const { incidents, selectedIncident, setSelectedIncident, updateIncidentStatus } = useSurveillance();
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [responderInput, setResponderInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const filteredIncidents = incidents.filter(inc => {
    if (severityFilter === 'ALL') return true;
    return inc.severity === severityFilter;
  });

  const activeInc = selectedIncident || filteredIncidents[0] || null;

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteInput || !activeInc) return;
    updateIncidentStatus(activeInc.incident_id, activeInc.status, noteInput, activeInc.assigned_responder);
    setNoteInput('');
  };

  const handleAssignResponder = (e) => {
    e.preventDefault();
    if (!responderInput || !activeInc) return;
    updateIncidentStatus(activeInc.incident_id, 'UNDER_INVESTIGATION', `Assigned to ${responderInput}`, responderInput);
    setResponderInput('');
  };

  const lifecycleStages = ["DETECTED", "TRIAGED", "ACKNOWLEDGED", "UNDER_INVESTIGATION", "RESOLVED"];

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top Banner */}
      <div className="tactical-panel px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-red-500">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-950/70 border border-red-500/40 text-red-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="font-orbitron font-bold text-sm text-white">
              BORDER INCIDENT INTELLIGENCE & FORENSICS ROOM
            </div>
            <div className="text-[11px] text-slate-400 font-mono-hud">
              Lifecycle Tracking • Explainable Mathematical Risk Breakdown • Evidence Micro-Timelines • SSB Tactical SOPs
            </div>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-slate-800">
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

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left 4 Cols: Incidents Timeline List */}
        <div className="lg:col-span-4 tactical-panel p-3.5 rounded-xl flex flex-col gap-2.5 max-h-[780px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-mono-hud font-bold text-xs text-white uppercase tracking-wider">
              Incident Dossier Feed ({filteredIncidents.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="text-center text-slate-500 font-mono-hud text-xs p-8">
                No incidents match the selected filter.
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const isSelected = activeInc?.incident_id === inc.incident_id;
                const riskScore = inc.risk_assessment?.score || 75;
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
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono-hud text-amber-400 font-bold bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-500/30">
                          {riskScore}/100
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono-hud font-bold border ${
                          inc.severity === 'CRITICAL' ? 'bg-red-950/70 border-red-500 text-red-400' : 'bg-orange-950/70 border-orange-500 text-orange-400'
                        }`}>
                          {inc.severity}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-white truncate">
                      {inc.event_type.replace(/_/g, ' ')}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      {inc.camera_name}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono-hud text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Status: <strong className="text-emerald-400">{inc.status}</strong></span>
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
        <div className="lg:col-span-8 tactical-panel p-5 rounded-xl flex flex-col gap-4 overflow-y-auto max-h-[780px]">
          {activeInc ? (
            <div className="flex flex-col gap-4">
              
              {/* Dossier Header & Export */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-black text-xl text-white">
                      {activeInc.incident_id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono-hud font-bold border ${
                      activeInc.severity === 'CRITICAL' ? 'bg-red-950 border-red-500 text-red-400' : 'bg-orange-950 border-orange-500 text-orange-400'
                    }`}>
                      {activeInc.severity} SEVERITY
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-mono-hud font-bold bg-amber-950/60 text-amber-300 border border-amber-500/40">
                      THREAT SCORE: {activeInc.risk_assessment?.score || 75}/100
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono-hud mt-0.5">
                    {activeInc.location_str} • {activeInc.timestamp} IST • Sector 04
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportIncidentDossier(activeInc)}
                    className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono-hud text-xs flex items-center gap-2 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Export Confidential Dossier (PDF)</span>
                  </button>
                </div>
              </div>

              {/* 6-Stage Lifecycle Stepper */}
              <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                <div className="text-[11px] font-mono-hud text-slate-400 uppercase font-bold">
                  Incident Response Lifecycle:
                </div>
                <div className="flex items-center justify-between gap-1 overflow-x-auto">
                  {lifecycleStages.map((stage, idx) => {
                    const currentIndex = lifecycleStages.indexOf(activeInc.status);
                    const isPassed = idx <= currentIndex;
                    return (
                      <div key={stage} className="flex items-center gap-1.5 shrink-0">
                        <div className={`px-2 py-1 rounded text-[10px] font-mono-hud font-bold border transition-all ${
                          isPassed ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-600'
                        }`}>
                          {stage}
                        </div>
                        {idx < lifecycleStages.length - 1 && (
                          <div className={`w-4 h-0.5 ${idx < currentIndex ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mathematical Explainable Risk Breakdown */}
              {activeInc.risk_assessment && (
                <div className="bg-[#080d17] p-3.5 rounded-lg border border-amber-500/30 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono-hud font-bold text-amber-300 uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    <span>Explainable Risk Factor Mathematical Breakdown (Score: {activeInc.risk_assessment.score}/100)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono-hud">
                    {activeInc.risk_assessment.factors.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#0e1626] p-2 rounded border border-slate-800">
                        <span className="text-slate-300">{f.factor}</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                          +{f.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] font-mono-hud text-slate-400 italic">
                    {activeInc.risk_assessment.calculation_summary}
                  </div>
                </div>
              )}

              {/* Keyframe Snapshot & Forensics Micro-Timeline Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Snapshot */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono-hud text-slate-300 font-bold uppercase">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Keyframe Evidence</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video">
                    <img
                      src={activeInc.snapshot_url}
                      alt="Keyframe Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Evidence Micro-Timeline */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono-hud text-slate-300 font-bold uppercase">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Evidence Micro-Timeline</span>
                  </div>
                  <div className="flex-1 bg-[#090d16] p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5 overflow-y-auto max-h-56">
                    {(activeInc.evidence_timeline || []).map((ev, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs font-mono-hud">
                        <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] shrink-0 font-bold">
                          {ev.timestamp_str}
                        </span>
                        <span className="text-slate-200 leading-snug">{ev.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tactical SSB SOP Checklist */}
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
                    <div key={idx} className="flex items-start gap-2 bg-[#0d1422] p-2 rounded border border-slate-800/80">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold shrink-0">
                        STEP {idx + 1}
                      </span>
                      <span className="text-slate-200 leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>

                {/* Operator Actions & Assign Responder Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  {/* Assign Responder */}
                  <form onSubmit={handleAssignResponder} className="flex items-center gap-2 font-mono-hud text-xs">
                    <input
                      type="text"
                      placeholder="Assign unit (e.g. QRF Team Alpha)..."
                      value={responderInput}
                      onChange={(e) => setResponderInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold shrink-0"
                    >
                      Assign
                    </button>
                  </form>

                  {/* Add Operator Note */}
                  <form onSubmit={handleAddNote} className="flex items-center gap-2 font-mono-hud text-xs">
                    <input
                      type="text"
                      placeholder="Add investigation note..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold shrink-0"
                    >
                      Add Note
                    </button>
                  </form>
                </div>

                {/* Quick Status Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => updateIncidentStatus(activeInc.incident_id, 'UNDER_INVESTIGATION', 'Investigating telemetry anomalies')}
                    className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono-hud font-bold"
                  >
                    ⚡ Under Investigation
                  </button>
                  <button
                    onClick={() => updateIncidentStatus(activeInc.incident_id, 'RESOLVED', 'Area cordoned and cleared by QRF')}
                    className="px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono-hud font-bold"
                  >
                    ✓ Mark Resolved
                  </button>
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
