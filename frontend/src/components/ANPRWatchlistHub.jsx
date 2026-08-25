import React, { useState, useEffect } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { Car, Search, Plus, Trash2, ShieldAlert, CheckCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react';

export default function ANPRWatchlistHub() {
  const { incidents } = useSurveillance();
  const [watchlist, setWatchlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Watchlist Form State
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('SUV / Bolero');
  const [newModel, setNewModel] = useState('Mahindra Bolero');
  const [newColor, setNewColor] = useState('Black');
  const [newThreat, setNewThreat] = useState('CRITICAL');
  const [newReason, setNewReason] = useState('Suspected Contraband Smuggling');
  const [newOwner, setNewOwner] = useState('Unknown');

  const loadWatchlist = async () => {
    try {
      const res = await fetch('/api/anpr/watchlist');
      const data = await res.json();
      setWatchlist(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("Failed to load watchlist:", e);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleAddWatchlist = async (e) => {
    e.preventDefault();
    if (!newPlate) return;

    const item = {
      plate_number: newPlate.toUpperCase().trim(),
      vehicle_type: newType,
      vehicle_make_model: newModel,
      color: newColor,
      threat_level: newThreat,
      reason: newReason,
      registered_owner: newOwner,
      reported_date: new Date().toISOString().slice(0, 10),
      active: true
    };

    try {
      await fetch('/api/anpr/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      setShowAddModal(false);
      setNewPlate('');
      loadWatchlist();
    } catch (err) {
      console.error("Add watchlist err:", err);
    }
  };

  const handleDelete = async (plate) => {
    try {
      await fetch(`/api/anpr/watchlist/${plate}`, { method: 'DELETE' });
      setWatchlist(prev => prev.filter(w => w.plate_number !== plate));
    } catch (err) {
      console.error("Delete watchlist err:", err);
    }
  };

  const filteredWatchlist = watchlist.filter(w => 
    w.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter vehicle incidents from main incident log
  const anprIncidents = incidents.filter(i => i.event_type.includes('VEHICLE') || i.event_type.includes('ANPR'));

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top ANPR Hub Bar */}
      <div className="tactical-panel px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-950/70 border border-blue-500/40 text-blue-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="font-orbitron font-bold text-sm text-white">
              ANPR & BORDER VEHICLE INTELLIGENCE HUB
            </div>
            <div className="text-[11px] text-slate-400 font-mono-hud">
              Automatic Number Plate Recognition • Optical Character Verification • Smuggler Watchlist Cross-Check
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono-hud text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Suspect Vehicle to Watchlist</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout: Watchlist on Left, Live ANPR Hits on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Watchlist Table */}
        <div className="lg:col-span-2 tactical-panel p-4 rounded-xl flex flex-col gap-3">
          
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span className="font-mono-hud font-bold text-xs text-white uppercase tracking-wider">
                Border Security Watchlist Database ({watchlist.length} Flagged)
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search plate or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#090d16] border border-slate-700 text-xs font-mono-hud text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-hud text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-[#090d16]/80">
                  <th className="py-2 px-3">Plate Number</th>
                  <th className="py-2 px-3">Vehicle Details</th>
                  <th className="py-2 px-3">Threat Level</th>
                  <th className="py-2 px-3">Reason / Incident Flag</th>
                  <th className="py-2 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWatchlist.map(w => (
                  <tr key={w.plate_number} className="hover:bg-[#0c1424] transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-1 rounded font-bold text-black bg-yellow-400 border border-yellow-500 shadow-sm inline-block">
                        {w.plate_number}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-white font-semibold">{w.vehicle_make_model}</div>
                      <div className="text-[10px] text-slate-400">{w.vehicle_type} • {w.color}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        w.threat_level === 'CRITICAL'
                          ? 'bg-red-950/70 border-red-500 text-red-400'
                          : w.threat_level === 'HIGH'
                          ? 'bg-orange-950/70 border-orange-500 text-orange-400'
                          : w.threat_level === 'WHITE_LIST'
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-400'
                          : 'bg-yellow-950/70 border-yellow-500 text-yellow-400'
                      }`}>
                        {w.threat_level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-xs text-slate-300 text-[11px] leading-snug">
                      {w.reason}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDelete(w.plate_number)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"
                        title="Remove from Watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right 1 Col: Live Checkpost ANPR Interceptions */}
        <div className="tactical-panel p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="font-mono-hud font-bold text-xs text-white uppercase tracking-wider">
              Recent Checkpost ANPR Hits
            </span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 max-h-[550px] pr-1">
            {anprIncidents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 font-mono-hud text-xs p-6">
                <Car className="w-8 h-8 text-slate-600 mb-2" />
                <span>No vehicle watchlist violations detected in current shift.</span>
              </div>
            ) : (
              anprIncidents.map(inc => (
                <div
                  key={inc.incident_id}
                  className="p-3 rounded-lg bg-[#090d16] border border-red-500/40 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-hud font-bold text-xs text-red-400">
                      {inc.incident_id}
                    </span>
                    <span className="text-[10px] font-mono-hud text-slate-400">
                      {inc.timestamp.split(' ')[1]}
                    </span>
                  </div>

                  <div className="text-xs text-white font-medium">
                    {inc.camera_name}
                  </div>

                  <div className="text-[11px] font-mono-hud text-yellow-400 bg-yellow-950/30 p-1.5 rounded border border-yellow-500/20">
                    {inc.movement_vector}
                  </div>

                  <div className="text-[10px] text-slate-400">
                    SOP: {inc.sop_title}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Watchlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="tactical-panel w-full max-w-md rounded-xl p-5 border border-cyan-500/50 shadow-2xl flex flex-col gap-4">
            <div className="font-orbitron font-bold text-sm text-white">
              FLAG SUSPICIOUS VEHICLE ON BORDER WATCHLIST
            </div>

            <form onSubmit={handleAddWatchlist} className="flex flex-col gap-3 font-mono-hud text-xs">
              <div>
                <label className="text-slate-400">License Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. HR26DK8337"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  required
                  className="w-full mt-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white uppercase focus:border-cyan-400 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Vehicle Type</label>
                  <input
                    type="text"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Make & Model</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400">Threat Level</label>
                <select
                  value={newThreat}
                  onChange={(e) => setNewThreat(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white"
                >
                  <option value="CRITICAL">🚨 CRITICAL (Arms / Contraband Smuggler)</option>
                  <option value="HIGH">⚠️ HIGH (Stolen / Unauthorized Cross-Over)</option>
                  <option value="MEDIUM">🟡 MEDIUM (Transit Overstay / Check Required)</option>
                  <option value="WHITE_LIST">🟢 WHITE_LIST (Authorized SSB / QRF Convoy)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400">Intelligence / Case Reason</label>
                <textarea
                  rows="2"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                >
                  Save to Watchlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
