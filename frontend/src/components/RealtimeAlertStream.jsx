import React from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function RealtimeAlertStream() {
  const { alerts, acknowledgeAlert, setActiveTab, setSelectedIncident, incidents } = useSurveillance();

  const handleAlertClick = (alert) => {
    // Locate corresponding incident if available
    const inc = incidents.find(i => i.camera_id === alert.camera_id && alert.description.includes(i.incident_id));
    if (inc) {
      setSelectedIncident(inc);
      setActiveTab('incidents');
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-950/70 border-red-500 text-red-400',
          icon: ShieldAlert,
          color: 'text-red-400'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/70 border-orange-500 text-orange-400',
          icon: AlertTriangle,
          color: 'text-orange-400'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-950/70 border-yellow-500 text-yellow-400',
          icon: AlertCircle,
          color: 'text-yellow-400'
        };
      default:
        return {
          bg: 'bg-cyan-950/70 border-cyan-500 text-cyan-400',
          icon: Info,
          color: 'text-cyan-400'
        };
    }
  };

  return (
    <div className="tactical-panel rounded-xl p-3.5 flex flex-col h-full">
      
      {/* Alert Stream Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono-hud font-bold text-xs text-white uppercase tracking-wider">
            Live Threat & Alert Stream
          </span>
        </div>
        <span className="text-[10px] font-mono-hud px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
          {alerts.length} Total Events
        </span>
      </div>

      {/* Scrolling Alerts List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
        {alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono-hud text-xs p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
            <span>Perimeter Secure. No Active Security Violations.</span>
          </div>
        ) : (
          alerts.slice(0, 15).map(alert => {
            const badge = getSeverityBadge(alert.severity);
            const Icon = badge.icon;

            return (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  alert.acknowledged
                    ? 'bg-[#090d16]/60 border-slate-800 opacity-60 hover:opacity-100'
                    : alert.severity === 'CRITICAL'
                    ? 'alert-panel-critical'
                    : 'tactical-panel hover:border-cyan-500/40'
                }`}
              >
                {/* Alert Top Row: Severity + Camera + Time */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono-hud font-bold border ${badge.bg}`}>
                      {alert.severity}
                    </span>
                    <span className="font-mono-hud font-bold text-xs text-white truncate">
                      {alert.camera_id}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono-hud text-slate-400 shrink-0">
                    {alert.timestamp.split(' ')[1] || alert.timestamp}
                  </span>
                </div>

                {/* Alert Description */}
                <div className="text-xs text-slate-200 font-medium leading-snug">
                  {alert.description}
                </div>

                {/* Bottom Row: Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-0.5">
                  <div className="text-[10px] font-mono-hud text-cyan-400 flex items-center gap-1">
                    <span>Inspect Dossier</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>

                  {!alert.acknowledged ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        acknowledgeAlert(alert.id);
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-mono-hud bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-500/50 text-slate-300 border border-slate-700 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono-hud text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Acknowledged</span>
                    </span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
