import React, { useState } from 'react';
import { useSurveillance } from '../context/SurveillanceContext';
import CameraFeedCard from './CameraFeedCard';
import { LayoutGrid, Grid3X3, Square, Radio, Filter } from 'lucide-react';

export default function MultiCameraGrid() {
  const { cameras, spotlightCameraId, setSpotlightCameraId } = useSurveillance();
  const [layout, setLayout] = useState('grid'); // 'grid' (2x3 or 3x2), 'spotlight' (1 big + thumbnails), '2x2'
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'ZERO_LINE', 'CHECKPOST', 'NIGHT'

  const filteredCameras = cameras.filter(c => {
    if (selectedFilter === 'ZERO_LINE') return c.id === 'BOP-CAM-01' || c.id === 'BOP-CAM-02' || c.id === 'BOP-CAM-05';
    if (selectedFilter === 'CHECKPOST') return c.id === 'BOP-CAM-03' || c.id === 'BOP-CAM-06';
    if (selectedFilter === 'NIGHT') return c.id === 'BOP-CAM-04' || c.active_mode !== 'STANDARD';
    return true;
  });

  const spotlightCam = cameras.find(c => c.id === spotlightCameraId) || cameras[0];

  return (
    <div className="flex flex-col gap-3">
      
      {/* Top Grid Control Toolbar */}
      <div className="tactical-panel px-3.5 py-2 rounded-lg flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Sector & Camera Counts */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono-hud text-xs text-cyan-400 font-bold">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>SECTOR 04 MULTI-CAM MATRIX</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-xs text-slate-400 font-mono-hud">
            Showing <strong className="text-white">{filteredCameras.length}</strong> of {cameras.length} Active Feeds
          </div>
        </div>

        {/* Center: Camera Filter Pills */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-md border border-slate-800">
          <Filter className="w-3 h-3 text-slate-500 ml-1.5 mr-0.5" />
          {[
            { key: 'ALL', label: 'All Feeds' },
            { key: 'ZERO_LINE', label: 'Zero Line' },
            { key: 'CHECKPOST', label: 'Checkposts' },
            { key: 'NIGHT', label: 'Night / Thermal' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setSelectedFilter(f.key)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-mono-hud transition-all ${
                selectedFilter === f.key
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Right: Layout Switcher */}
        <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setLayout('grid')}
            title="Multi-Grid View (3x2)"
            className={`p-1 rounded transition-all ${
              layout === 'grid'
                ? 'bg-cyan-500 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLayout('2x2')}
            title="2x2 Matrix View"
            className={`p-1 rounded transition-all ${
              layout === '2x2'
                ? 'bg-cyan-500 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLayout('spotlight')}
            title="Spotlight Single Camera View"
            className={`p-1 rounded transition-all ${
              layout === 'spotlight'
                ? 'bg-cyan-500 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Main Feeds Display based on Layout */}
      {layout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredCameras.map(camera => (
            <CameraFeedCard
              key={camera.id}
              camera={camera}
              onSpotlight={() => {
                setSpotlightCameraId(camera.id);
                setLayout('spotlight');
              }}
            />
          ))}
        </div>
      )}

      {layout === '2x2' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCameras.slice(0, 4).map(camera => (
            <CameraFeedCard
              key={camera.id}
              camera={camera}
              onSpotlight={() => {
                setSpotlightCameraId(camera.id);
                setLayout('spotlight');
              }}
            />
          ))}
        </div>
      )}

      {layout === 'spotlight' && spotlightCam && (
        <div className="flex flex-col lg:flex-row gap-3.5">
          {/* Main Large Spotlight Feed */}
          <div className="flex-1">
            <CameraFeedCard
              camera={spotlightCam}
              isSpotlight={true}
            />
          </div>

          {/* Side Thumbnail List */}
          <div className="lg:w-80 flex flex-col gap-2 max-h-[750px] overflow-y-auto pr-1">
            <div className="text-xs font-mono-hud text-slate-400 font-bold uppercase tracking-wider px-1">
              Select Camera Stream:
            </div>
            {cameras.map(camera => (
              <div
                key={camera.id}
                onClick={() => setSpotlightCameraId(camera.id)}
                className={`tactical-panel p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  camera.id === spotlightCam.id
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'hover:border-slate-600'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-mono-hud font-bold text-xs text-white truncate">
                    {camera.id}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {camera.name}
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-hud bg-slate-800 text-cyan-300 border border-slate-700">
                  {camera.active_mode}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
