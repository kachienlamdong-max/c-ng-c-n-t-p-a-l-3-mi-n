import React, { useState } from 'react';
import { REGIONS_DATA } from '../data/geographyData';
import { RegionId, TerrainFeature } from '../types';
import { Mountain, Waves, Compass, MapPin, Eye, CheckCircle2 } from 'lucide-react';

interface Terrain3DExplorerViewProps {
  onGoToGame: () => void;
}

export const Terrain3DExplorerView: React.FC<Terrain3DExplorerViewProps> = ({
  onGoToGame,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId>('dong-bac');
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);

  const region = REGIONS_DATA[selectedRegionId];
  const activeFeature = region.features.find((f) => f.id === activeFeatureId) || region.features[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>Mô Hình Địa Hình 3D & Cấu Trúc Địa Lý</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
            Khảo Sát Địa Hình 3D Ba Miền Tự Nhiên
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Xem xét chi tiết cấu trúc địa hình không gian 3 chiều theo chuẩn bản đồ SGK: Cánh cung đồi núi, đỉnh núi cao, cao nguyên ba dan xếp tầng và hệ thống châu thổ.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToGame}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          Luyện tập kéo thả →
        </button>
      </div>

      {/* Region Selector Segmented Control */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-full sm:w-fit overflow-x-auto">
        {(Object.values(REGIONS_DATA)).map((r) => {
          const isSelected = r.id === selectedRegionId;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelectedRegionId(r.id);
                setActiveFeatureId(r.features[0]?.id || null);
              }}
              className={`px-4 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-slate-100 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Miền {r.romanId}: {r.shortName}
            </button>
          );
        })}
      </div>

      {/* Big Interactive 3D Terrain Showcase Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Visual Stage (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl relative">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden">
            {/* 3D Topographic Render */}
            <img
              src={region.image}
              alt={region.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Interactive Pins */}
            {region.features.map((feat) => {
              const isSelected = feat.id === activeFeature?.id;
              return (
                <button
                  key={feat.id}
                  type="button"
                  onClick={() => setActiveFeatureId(feat.id)}
                  style={{ left: `${feat.x}%`, top: `${feat.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-950 ring-4 ring-emerald-400 shadow-xl scale-110 font-bold'
                      : 'bg-slate-950/85 hover:bg-slate-800 text-slate-200 border border-slate-700 shadow-lg backdrop-blur-xs font-medium hover:scale-105'
                  } text-xs`}
                >
                  {feat.type === 'mountain' && <Mountain className="w-3.5 h-3.5 text-amber-500" />}
                  {feat.type === 'river' && <Waves className="w-3.5 h-3.5 text-sky-500" />}
                  {feat.type === 'delta' && <Compass className="w-3.5 h-3.5 text-emerald-500" />}
                  {feat.type === 'plateau' && <Mountain className="w-3.5 h-3.5 text-orange-500" />}
                  {feat.type === 'karst' && <MapPin className="w-3.5 h-3.5 text-sky-400" />}
                  <span className="hidden sm:inline">{feat.name}</span>
                </button>
              );
            })}

            {/* Bottom Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                  Bản Đồ Cấu Trúc Địa Hình
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {region.title}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Inspector Deck (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Landmark Spotlight */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Điểm địa hình tiêu biểu</span>
            </div>

            <h4 className="text-lg font-bold text-white">
              {activeFeature.name}
            </h4>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeFeature.description}
            </p>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span className="text-slate-500 block mb-1">Đặc trưng SGK:</span>
              <p className="text-[12px] text-slate-300 italic">
                "{region.terrain3DDescription}"
              </p>
            </div>
          </div>

          {/* Quick List of Features in this Region */}
          <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Các đối tượng địa hình trong miền:
            </span>

            <div className="space-y-1.5">
              {region.features.map((feat) => {
                const isSelected = feat.id === activeFeature?.id;
                return (
                  <button
                    key={feat.id}
                    type="button"
                    onClick={() => setActiveFeatureId(feat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span>{feat.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {feat.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
