import React, { useState } from 'react';
import { RegionInfo, TerrainFeature } from '../types';
import { MapPin, Info, Mountain, Waves, Compass } from 'lucide-react';

interface TerrainVisualCardProps {
  region: RegionInfo;
  className?: string;
  isCompact?: boolean;
}

export const TerrainVisualCard: React.FC<TerrainVisualCardProps> = ({
  region,
  className = '',
  isCompact = false,
}) => {
  const [activeFeature, setActiveFeature] = useState<TerrainFeature | null>(null);
  const [viewMode, setViewMode] = useState<'realistic' | 'structural'>('realistic');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentImgSrc, setCurrentImgSrc] = useState(region.image);

  // Sync if region prop changes
  React.useEffect(() => {
    setCurrentImgSrc(region.image);
  }, [region.image]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 8, y: y * -8 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setActiveFeature(null);
  };

  const handleImageError = () => {
    // If bundled asset fails for any reason, fallback to public directory path
    const fallbackMap: Record<string, string> = {
      'dong-bac': '/images/region_dong_bac_1791109952497.jpg',
      'tay-bac': '/images/region_tay_bac_1791109965527.jpg',
      'nam-bo': '/images/region_nam_bo_1791109977644.jpg',
    };
    if (fallbackMap[region.id] && currentImgSrc !== fallbackMap[region.id]) {
      setCurrentImgSrc(fallbackMap[region.id]);
    }
  };

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Visual Canvas Container with 3D Tilt */}
      <div
        className="relative w-full overflow-hidden transition-transform duration-200 ease-out bg-slate-950"
        style={{
          height: isCompact ? '180px' : '230px',
          transform: `perspective(700px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
        }}
      >
        {/* Layer 1: Realistic Generated 3D Landscape */}
        <img
          src={currentImgSrc}
          alt={`Mô hình địa hình 3D ${region.title}`}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-500 ${
            viewMode === 'structural' ? 'opacity-55 brightness-90 contrast-110' : 'opacity-100 group-hover:scale-105'
          }`}
          onError={handleImageError}
        />

        {/* Gradient Scrim for Contrast & Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

        {/* Layer 2: Interactive SVG Topographic Diagram Overlay */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Region Specific Structural Linework */}
          {region.id === 'dong-bac' && (
            <g className="stroke-sky-400/60 stroke-[1.2] fill-none transition-opacity duration-300">
              {/* 4 Arc-shaped mountain curves opening north */}
              <path d="M 28,68 Q 24,42 35,18" strokeDasharray="2 1" />
              <path d="M 38,68 Q 38,40 50,22" />
              <path d="M 48,68 Q 54,42 66,28" strokeDasharray="3 1.5" />
              <path d="M 58,70 Q 72,50 82,38" />
              {/* Red River Delta Fan */}
              <path d="M 32,58 L 65,78 L 22,82 Z" fill="rgba(56, 189, 248, 0.15)" stroke="rgba(56, 189, 248, 0.5)" />
              {/* Halong Karst Island clusters */}
              <circle cx="78" cy="62" r="1.8" fill="#38bdf8" />
              <circle cx="82" cy="60" r="1.3" fill="#38bdf8" />
              <circle cx="75" cy="66" r="1.2" fill="#38bdf8" />
              <circle cx="85" cy="64" r="1.5" fill="#38bdf8" />
            </g>
          )}

          {region.id === 'tay-bac' && (
            <g className="stroke-amber-400/70 stroke-[1.4] fill-none transition-opacity duration-300">
              {/* Massive Hoang Lien Son ridge trending NW-SE */}
              <path d="M 22,12 L 44,52" strokeWidth="2.5" />
              <path d="M 14,28 L 32,68" strokeDasharray="2.5 1.5" />
              <path d="M 35,52 L 68,88" strokeWidth="2" />
              {/* Fansipan triangle peak */}
              <polygon points="32,25 28,32 36,32" fill="#fbbf24" stroke="none" />
              {/* Steep Rivers Da & Ma cutting through */}
              <path d="M 36,18 Q 42,40 55,56" stroke="rgba(56, 189, 248, 0.8)" strokeWidth="1.2" />
              {/* Narrow coastal strip & lagoons */}
              <path d="M 58,62 Q 72,76 82,92" stroke="#fcd34d" strokeWidth="1" strokeDasharray="1 1" />
            </g>
          )}

          {region.id === 'nam-bo' && (
            <g className="stroke-emerald-400/70 stroke-[1.2] fill-none transition-opacity duration-300">
              {/* Stepped Basalt Plateaus */}
              <rect x="42" y="24" width="28" height="18" rx="3" fill="rgba(52, 211, 153, 0.12)" stroke="rgba(52, 211, 153, 0.6)" />
              <rect x="46" y="44" width="25" height="16" rx="3" fill="rgba(52, 211, 153, 0.12)" stroke="rgba(52, 211, 153, 0.6)" />
              {/* Mekong Delta vast plain */}
              <path d="M 20,68 L 68,68 L 52,94 L 18,92 Z" fill="rgba(16, 185, 129, 0.18)" stroke="rgba(52, 211, 153, 0.5)" />
              {/* Mekong branching river mouths */}
              <path d="M 40,68 L 44,82 L 48,90" stroke="rgba(56, 189, 248, 0.8)" strokeWidth="1.3" />
              <path d="M 40,68 L 34,80 L 32,88" stroke="rgba(56, 189, 248, 0.8)" strokeWidth="1.3" />
              <path d="M 44,82 L 56,92" stroke="rgba(56, 189, 248, 0.8)" strokeWidth="1.1" />
            </g>
          )}
        </svg>

        {/* Layer 3: Interactive Hotspots on Topography */}
        <div className="absolute inset-0">
          {region.features.map((feat) => {
            const isSelected = activeFeature?.id === feat.id;
            return (
              <button
                key={feat.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFeature(isSelected ? null : feat);
                }}
                onMouseEnter={() => setActiveFeature(feat)}
                style={{ left: `${feat.x}%`, top: `${feat.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center p-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 scale-125 ring-4 ring-emerald-400 shadow-lg'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:scale-110 border border-slate-700 shadow-md backdrop-blur-xs'
                }`}
                title={feat.name}
              >
                {feat.type === 'mountain' && <Mountain className="w-3.5 h-3.5 text-amber-400" />}
                {feat.type === 'river' && <Waves className="w-3.5 h-3.5 text-sky-400" />}
                {feat.type === 'delta' && <Compass className="w-3.5 h-3.5 text-emerald-400" />}
                {feat.type === 'coast' && <Waves className="w-3.5 h-3.5 text-cyan-400" />}
                {feat.type === 'plateau' && <Mountain className="w-3.5 h-3.5 text-orange-400" />}
                {feat.type === 'karst' && <MapPin className="w-3.5 h-3.5 text-sky-300" />}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle Button */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center bg-slate-950/80 backdrop-blur-md rounded-lg p-0.5 border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('realistic');
            }}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'realistic' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mô hình 3D
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setViewMode('structural');
            }}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
              viewMode === 'structural' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sơ đồ SGK
          </button>
        </div>

        {/* Region Roman Tag & Short Name */}
        <div className="absolute bottom-2.5 left-3 z-10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <span className="font-bold text-white tracking-wider">MIỀN {region.romanId}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[210px]">{region.shortName}</span>
          </div>
        </div>
      </div>

      {/* Feature Popover / Tooltip when active */}
      {activeFeature && (
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-300 animate-fadeIn">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">{activeFeature.name}</span>
              <p className="text-slate-400 leading-relaxed text-[12px]">{activeFeature.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Terrain 3D Structure Description Footer */}
      {!activeFeature && (
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-xs text-slate-400">
          <p className="line-clamp-2 leading-relaxed text-[12px] text-slate-300">
            <span className="text-slate-400 font-medium">Cấu trúc địa hình: </span>
            {region.terrain3DDescription}
          </p>
        </div>
      )}
    </div>
  );
};
