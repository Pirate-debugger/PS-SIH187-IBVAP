import React, { useState, useEffect, useRef } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { X, Plus, Trash2, Save, Undo, Sparkles, Shield, AlertTriangle, Clock } from 'lucide-react';

export default function ZoneEditorModal() {
  const { 
    zoneEditorOpen, 
    setZoneEditorOpen, 
    cameras, 
    spotlightCameraId, 
    setSpotlightCameraId 
  } = useSurveillance();

  const [activeCameraId, setActiveCameraId] = useState(spotlightCameraId || 'BOP-CAM-01');
  const [zones, setZones] = useState([]);
  const [activeZoneId, setActiveZoneId] = useState(null);
  const [currentDrawingPoints, setCurrentDrawingPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoneType, setZoneType] = useState('RESTRICTED_ZONE');
  const [zoneName, setZoneName] = useState('New Restricted Zone');
  const [severity, setSeverity] = useState('CRITICAL');
  const [loiteringSec, setLoiteringSec] = useState(6.0);
  const [statusMsg, setStatusMsg] = useState(null);

  const canvasRef = useRef(null);

  // Fetch zones for current camera
  const loadCameraZones = async (camId) => {
    try {
      const res = await fetch(`/api/zones/${camId}`);
      const data = await res.json();
      setZones(Array.isArray(data) ? data : []);
      if (data.length > 0) setActiveZoneId(data[0].id);
    } catch (e) {
      console.warn("Failed to load zones:", e);
    }
  };

  useEffect(() => {
    if (zoneEditorOpen) {
      setActiveCameraId(spotlightCameraId || 'BOP-CAM-01');
      loadCameraZones(spotlightCameraId || 'BOP-CAM-01');
    }
  }, [zoneEditorOpen, spotlightCameraId]);

  // Handle canvas click to place points
  const handleCanvasClick = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setCurrentDrawingPoints(prev => [...prev, [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]]);
  };

  // Finish polygon drawing
  const finishDrawing = async () => {
    if (currentDrawingPoints.length < (zoneType === 'VIRTUAL_FENCE' ? 2 : 3)) {
      alert(`Please plot at least ${zoneType === 'VIRTUAL_FENCE' ? '2' : '3'} points on the camera canvas.`);
      return;
    }

    const newZone = {
      id: `ZONE-${activeCameraId.replace(/[^A-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
      camera_id: activeCameraId,
      name: zoneName,
      zone_type: zoneType,
      points: currentDrawingPoints,
      color: zoneType === 'RESTRICTED_ZONE' ? '#ff3366' : zoneType === 'LOITERING_ZONE' ? '#ffb700' : '#00f0ff',
      severity_on_breach: severity,
      tripwire_direction: 'NORTH_TO_SOUTH',
      loitering_threshold_sec: loiteringSec,
      active: true
    };

    try {
      await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newZone)
      });
      setZones(prev => [...prev, newZone]);
      setActiveZoneId(newZone.id);
      setIsDrawing(false);
      setCurrentDrawingPoints([]);
      setStatusMsg("Virtual zone saved & active on AI engine!");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (e) {
      console.error("Save zone error:", e);
    }
  };

  const deleteZone = async (zoneId) => {
    try {
      await fetch(`/api/zones/${activeCameraId}/${zoneId}`, { method: 'DELETE' });
      setZones(prev => prev.filter(z => z.id !== zoneId));
      if (activeZoneId === zoneId) setActiveZoneId(null);
    } catch (e) {
      console.error("Delete zone error:", e);
    }
  };

  if (!zoneEditorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="tactical-panel w-full max-w-5xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-cyan-500/40">
        
        {/* Modal Header */}
        <div className="bg-[#090d16] px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="font-orbitron font-bold text-sm text-white">
                VIRTUAL BORDER & POLYGON ZONE BUILDER
              </div>
              <div className="text-[11px] text-slate-400 font-mono-hud">
                AI Geometric Perimeter Engine (Shapely Point-in-Polygon & Vector Tripwire)
              </div>
            </div>
          </div>

          <button
            onClick={() => setZoneEditorOpen(false)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Selector Bar */}
        <div className="bg-[#0c121e] px-5 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-mono-hud text-slate-400 font-bold uppercase shrink-0">
            Select Camera:
          </span>
          {cameras.map(cam => (
            <button
              key={cam.id}
              onClick={() => {
                setActiveCameraId(cam.id);
                loadCameraZones(cam.id);
              }}
              className={`px-3 py-1 rounded text-xs font-mono-hud transition-all shrink-0 ${
                activeCameraId === cam.id
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              {cam.id} ({cam.name.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Main Content: Canvas on Left, Controls on Right */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-5 overflow-y-auto">
          
          {/* Canvas Interactive Frame */}
          <div className="lg:col-span-2 flex flex-col gap-2">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video border border-slate-700 select-none">
              
              {/* Background Video Snapshot */}
              <img
                src={`/api/cameras/${activeCameraId}/stream`}
                alt="Camera Frame"
                className="w-full h-full object-cover"
              />

              {/* Drawing / Overlay Canvas */}
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`absolute inset-0 w-full h-full ${isDrawing ? 'cursor-crosshair' : 'cursor-default'}`}
              />

              {/* SVG Virtual Zones Overlay */}
              <svg viewBox="0 0 1000 562" className="absolute inset-0 w-full h-full pointer-events-none">
                {zones.map(z => {
                  const ptsStr = z.points.map(p => `${p[0] * 1000},${p[1] * 562}`).join(' ');
                  const isRed = z.zone_type === 'RESTRICTED_ZONE';
                  return z.zone_type === 'VIRTUAL_FENCE' ? (
                    <line
                      key={z.id}
                      x1={z.points[0][0] * 1000}
                      y1={z.points[0][1] * 562}
                      x2={z.points[1][0] * 1000}
                      y2={z.points[1][1] * 562}
                      stroke={z.color || '#ff3366'}
                      strokeWidth="4"
                      strokeDasharray="6 3"
                    />
                  ) : (
                    <polygon
                      key={z.id}
                      points={ptsStr}
                      fill={z.color || (isRed ? '#ff3366' : '#ffb700')}
                      fillOpacity="0.25"
                      stroke={z.color || (isRed ? '#ff3366' : '#ffb700')}
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Currently In-Progress Drawing Points */}
                {currentDrawingPoints.length > 0 && (
                  <g>
                    <polyline
                      points={currentDrawingPoints.map(p => `${p[0] * 1000},${p[1] * 562}`).join(' ')}
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="3"
                      strokeDasharray="4 4"
                    />
                    {currentDrawingPoints.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p[0] * 1000}
                        cy={p[1] * 562}
                        r="6"
                        fill="#00f0ff"
                        stroke="#000"
                        strokeWidth="2"
                      />
                    ))}
                  </g>
                )}
              </svg>

              {/* Status Hint Watermark */}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 text-[11px] font-mono-hud text-cyan-300 backdrop-blur-md">
                {isDrawing
                  ? `📍 Click on image to plot points (${currentDrawingPoints.length} added)`
                  : `🔒 Viewing ${zones.length} active zones`}
              </div>
            </div>

            {/* Canvas Actions Bar */}
            <div className="flex items-center justify-between gap-2">
              {!isDrawing ? (
                <button
                  onClick={() => {
                    setIsDrawing(true);
                    setCurrentDrawingPoints([]);
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono-hud text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Drawing New Zone</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={finishDrawing}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono-hud text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  >
                    <Save className="w-4 h-4" />
                    <span>Complete & Save Zone</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawing(false);
                      setCurrentDrawingPoints([]);
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono-hud text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {statusMsg && (
                <span className="text-xs font-mono-hud text-emerald-400 font-bold animate-pulse">
                  ✓ {statusMsg}
                </span>
              )}
            </div>
          </div>

          {/* Right Configuration Sidebar */}
          <div className="flex flex-col gap-4 bg-[#090e17] p-4 rounded-xl border border-slate-800">
            
            {isDrawing && (
              <div className="flex flex-col gap-3 pb-3 border-b border-slate-800">
                <div className="text-xs font-mono-hud text-cyan-400 font-bold uppercase tracking-wider">
                  New Zone Properties
                </div>

                <div>
                  <label className="text-[11px] font-mono-hud text-slate-400">Zone Name</label>
                  <input
                    type="text"
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono-hud focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono-hud text-slate-400">Zone Type</label>
                  <select
                    value={zoneType}
                    onChange={(e) => setZoneType(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono-hud focus:border-cyan-400 outline-none"
                  >
                    <option value="RESTRICTED_ZONE">🚨 Red Restricted Zone (Intrusion Alarm)</option>
                    <option value="LOITERING_ZONE">⚠️ Loitering Monitored Zone (Timer Dwell)</option>
                    <option value="VIRTUAL_FENCE">⚡ Directional Virtual Tripwire</option>
                    <option value="BUFFER_ZONE">🟡 Security Buffer Zone</option>
                  </select>
                </div>

                {zoneType === 'LOITERING_ZONE' && (
                  <div>
                    <label className="text-[11px] font-mono-hud text-slate-400">Loitering Threshold (Seconds)</label>
                    <input
                      type="number"
                      value={loiteringSec}
                      onChange={(e) => setLoiteringSec(parseFloat(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono-hud"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Existing Zones List */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-xs font-mono-hud text-slate-400 font-bold uppercase tracking-wider">
                Configured Zones for {activeCameraId}:
              </div>

              {zones.length === 0 ? (
                <div className="text-center text-slate-500 font-mono-hud text-xs p-4">
                  No zones configured for this camera yet.
                </div>
              ) : (
                zones.map(z => (
                  <div
                    key={z.id}
                    className="p-2.5 rounded-lg bg-[#0c121e] border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color || '#ff3366' }} />
                        <span>{z.name}</span>
                      </div>
                      <div className="text-[10px] font-mono-hud text-slate-400 mt-0.5">
                        {z.zone_type} • {z.severity_on_breach}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteZone(z.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
