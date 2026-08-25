import React, { useState } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import { MapPin, Navigation, Eye, AlertTriangle, ShieldCheck, Video } from 'lucide-react';

export default function TacticalBorderMap() {
  const { cameras, alerts, setActiveTab, setSpotlightCameraId } = useSurveillance();
  const [selectedPin, setSelectedPin] = useState(null);

  // Sector 4 Tactical Geographic Bounding Box coordinates
  const mapCenter = { lat: 27.1485, lng: 84.8735 };

  // Convert geo-coordinates to SVG coordinate space (0 - 1000 x 0 - 650)
  const geoToSvg = (lat, lng) => {
    const latMin = 27.1380, latMax = 27.1600;
    const lngMin = 84.8620, lngMax = 84.8860;

    const x = ((lng - lngMin) / (lngMax - lngMin)) * 960 + 20;
    const y = ((latMax - lat) / (latMax - latMin)) * 600 + 20;
    return { x, y };
  };

  const handleCameraClick = (camId) => {
    setSpotlightCameraId(camId);
    setActiveTab('grid');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-195px)]">
      
      {/* Main Tactical GIS Vector Canvas */}
      <div className="flex-1 tactical-panel rounded-xl overflow-hidden relative flex flex-col">
        
        {/* Map Header HUD */}
        <div className="bg-[#090d16]/95 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="font-mono-hud font-bold text-xs text-white">
              GIS TACTICAL BORDER GRID — SECTOR 04
            </span>
            <span className="text-[10px] font-mono-hud px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
              WGS-84 TELEMETRY ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-hud text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-red-500" />
              <span>Zero-Line Border</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>BOP Outposts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Checkposts</span>
            </div>
          </div>
        </div>

        {/* SVG Tactical Map Layer */}
        <div className="flex-1 relative bg-[#040810] overflow-hidden flex items-center justify-center">
          
          {/* Tactical Grid Background */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #00f0ff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          <svg viewBox="0 0 1000 640" className="w-full h-full select-none">
            
            {/* Topographic Contour Lines */}
            <path d="M 50 120 Q 300 80, 550 140 T 950 110" fill="none" stroke="#0e1f38" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M 30 250 Q 280 210, 520 270 T 980 230" fill="none" stroke="#0e1f38" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M 40 450 Q 320 400, 600 470 T 960 420" fill="none" stroke="#0e1f38" strokeWidth="1.5" strokeDasharray="4 4" />

            {/* Riverine Waterway (Mechi River Sector) */}
            <path
              d="M 680 0 Q 720 180, 760 320 T 820 640"
              fill="none"
              stroke="#0a324d"
              strokeWidth="38"
              strokeLinecap="round"
            />
            <path
              d="M 680 0 Q 720 180, 760 320 T 820 640"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.4"
            />
            <text x="730" y="240" fill="#00f0ff" fontSize="10" fontFamily="JetBrains Mono" opacity="0.6" transform="rotate(70, 730, 240)">
              MECHI RIVER SECTOR (RIVERINE BOUNDARY)
            </text>

            {/* ZERO-LINE INTERNATIONAL BOUNDARY */}
            <path
              d="M 20 200 L 280 180 L 520 210 L 730 200 L 980 190"
              fill="none"
              stroke="#ff3366"
              strokeWidth="3"
              strokeDasharray="8 4"
            />
            <text x="290" y="172" fill="#ff3366" fontSize="11" fontFamily="Orbitron" fontWeight="bold" letterSpacing="2">
              ★★★ ZERO LINE PERIMETER (INTERNATIONAL BORDER) ★★★
            </text>

            {/* High Security Buffer Corridor */}
            <polygon
              points="20,180 980,170 980,240 20,250"
              fill="#ff3366"
              fillOpacity="0.05"
            />

            {/* Restricted Polygonal Zones */}
            <polygon
              points="160,220 380,220 390,340 150,340"
              fill="#ff3366"
              fillOpacity="0.12"
              stroke="#ff3366"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            <text x="170" y="240" fill="#ff3366" fontSize="9" fontFamily="JetBrains Mono">
              RESTRICTED ZONE (BOP-01 SECTOR)
            </text>

            {/* Checkpost Alpha Road & Corridor */}
            <line x1="480" y1="640" x2="480" y2="210" stroke="#1e293b" strokeWidth="18" />
            <line x1="480" y1="640" x2="480" y2="210" stroke="#f59e0b" strokeWidth="2" strokeDasharray="8 6" opacity="0.7" />
            <text x="495" y="480" fill="#f59e0b" fontSize="9" fontFamily="JetBrains Mono">
              HIGHWAY ACCESS CORRIDOR 03
            </text>

            {/* Camera Outpost Pins & FOV Cones */}
            {cameras.map(cam => {
              const { x, y } = geoToSvg(cam.lat, cam.lng);
              const isSelected = selectedPin?.id === cam.id;

              // Compute FOV cone triangle based on heading and FOV
              const headingRad = ((cam.heading - 90) * Math.PI) / 180;
              const fovRad = (cam.fov * Math.PI) / 180;
              const radius = 85;

              const angle1 = headingRad - fovRad / 2;
              const angle2 = headingRad + fovRad / 2;

              const p1x = x + radius * Math.cos(angle1);
              const p1y = y + radius * Math.sin(angle1);
              const p2x = x + radius * Math.cos(angle2);
              const p2y = y + radius * Math.sin(angle2);

              const conePoints = `${x},${y} ${p1x},${p1y} ${p2x},${p2y}`;

              return (
                <g key={cam.id} className="cursor-pointer" onClick={() => setSelectedPin(cam)}>
                  
                  {/* Camera FOV Vision Cone */}
                  <polygon
                    points={conePoints}
                    fill={cam.id === 'BOP-CAM-04' ? '#ff3366' : '#00f0ff'}
                    fillOpacity={isSelected ? 0.35 : 0.15}
                    stroke={cam.id === 'BOP-CAM-04' ? '#ff3366' : '#00f0ff'}
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />

                  {/* Pulsing Radar Ring on Camera Outpost */}
                  <circle cx={x} cy={y} r="14" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.4" className="animate-ping" />
                  <circle cx={x} cy={y} r="8" fill="#090d16" stroke="#00f0ff" strokeWidth="2" />
                  <circle cx={x} cy={y} r="3" fill="#00f0ff" />

                  {/* Camera ID Label */}
                  <rect x={x - 36} y={y + 12} width="72" height="18" rx="3" fill="#090d16" stroke="#00f0ff" strokeWidth="1" opacity="0.9" />
                  <text x={x} y={y + 24} fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono" textAnchor="middle">
                    {cam.id}
                  </text>
                </g>
              );
            })}

            {/* Real-Time Simulated Target Blips */}
            <g>
              {/* Target 1: Red Alert Intruder near BOP-01 */}
              <circle cx="280" cy="260" r="5" fill="#ff3366" className="animate-pulse" />
              <circle cx="280" cy="260" r="10" fill="none" stroke="#ff3366" strokeWidth="1" className="animate-ping" />
              <text x="292" y="264" fill="#ff3366" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">
                P-01 [INTRUDER]
              </text>

              {/* Target 2: Vehicle near Checkpost Alpha */}
              <rect x="474" y="380" width="12" height="8" rx="2" fill="#38bdf8" />
              <text x="492" y="387" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono">
                V-03 [HR26DK8337]
              </text>
            </g>

          </svg>
        </div>

      </div>

      {/* Side Details Panel: Camera Inspector & Sector Telemetry */}
      <div className="lg:w-96 flex flex-col gap-3">
        
        {/* Outpost Inspector Card */}
        <div className="tactical-panel p-4 rounded-xl flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="font-mono-hud font-bold text-xs text-white">
                OUTPOST TELEMETRY
              </span>
            </div>
            <span className="text-[10px] font-mono-hud text-slate-400">
              {selectedPin ? selectedPin.id : 'SELECT PIN'}
            </span>
          </div>

          {selectedPin ? (
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-sm font-bold text-white">
                  {selectedPin.name}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedPin.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#090d16] p-2.5 rounded-lg border border-slate-800 text-xs font-mono-hud">
                <div>
                  <span className="text-slate-500 text-[10px]">LATITUDE</span>
                  <div className="text-cyan-300">{selectedPin.lat} N</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">LONGITUDE</span>
                  <div className="text-cyan-300">{selectedPin.lng} E</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">HEADING</span>
                  <div className="text-white">{selectedPin.heading}°</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">FOV CONE</span>
                  <div className="text-white">{selectedPin.fov}°</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">ACTIVE MODE</span>
                  <div className="text-amber-400">{selectedPin.active_mode}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">STATUS</span>
                  <div className="text-emerald-400">ONLINE 25FPS</div>
                </div>
              </div>

              <button
                onClick={() => handleCameraClick(selectedPin.id)}
                className="w-full mt-2 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono-hud text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Jump to Live Camera Feed</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs font-mono-hud p-6">
              <MapPin className="w-10 h-10 text-slate-700 mb-2 animate-bounce" />
              <span>Click on any BOP Outpost pin on the map to inspect live coordinates and camera telemetry.</span>
            </div>
          )}
        </div>

        {/* Tactical Sector Security Notice */}
        <div className="tactical-panel p-3.5 rounded-xl border-l-2 border-l-cyan-400 text-xs font-mono-hud">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>SSB BORDER MATRIX INTEGRITY</span>
          </div>
          <div className="text-slate-400 text-[11px] leading-relaxed">
            All 6 Border Outpost cameras are geo-synchronized with WGS-84 coordinate transformation for automated artillery and QRF dispatch.
          </div>
        </div>

      </div>

    </div>
  );
}
