import React, { useState } from 'react';
import { REGIONS_DATA, CRITERIA_TABS } from '../data/geographyData';
import { CriterionCategory, RegionId } from '../types';
import { TerrainVisualCard } from './TerrainVisualCard';
import { 
  Compass, 
  Mountain, 
  CloudSun, 
  Waves, 
  TreePine, 
  Gem, 
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';

interface ParallelReadingViewProps {
  onStartQuizWithRegion?: (regionId: RegionId) => void;
  onGoToGame: () => void;
}

const CATEGORY_ICONS: Record<Exclude<CriterionCategory, 'all'>, React.ReactNode> = {
  'vi-tri': <Compass className="w-4 h-4 text-sky-400" />,
  'dia-hinh': <Mountain className="w-4 h-4 text-amber-400" />,
  'khi-hau': <CloudSun className="w-4 h-4 text-rose-400" />,
  'song-ngoi': <Waves className="w-4 h-4 text-blue-400" />,
  'sinh-vat': <TreePine className="w-4 h-4 text-emerald-400" />,
  'khoang-san': <Gem className="w-4 h-4 text-purple-400" />,
};

export const ParallelReadingView: React.FC<ParallelReadingViewProps> = ({
  onGoToGame,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CriterionCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileRegionFilter, setMobileRegionFilter] = useState<'all' | RegionId>('all');

  const allRegions = Object.values(REGIONS_DATA);
  const regionsList = mobileRegionFilter === 'all' 
    ? allRegions 
    : allRegions.filter(r => r.id === mobileRegionFilter);

  // Criteria categories to render
  const categoriesToRender: Exclude<CriterionCategory, 'all'>[] = 
    selectedCategory === 'all'
      ? ['vi-tri', 'dia-hinh', 'khi-hau', 'song-ngoi', 'sinh-vat', 'khoang-san']
      : [selectedCategory];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phần 1 · Đọc & So Sánh Song Song Toàn Diện</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Dùng trực tiếp trên web</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
            Đặc Điểm Ba Miền Địa Lý Tự Nhiên
          </h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed text-wrap">
            So sánh trực quan các đặc trưng tự nhiên giữa ba miền: Vị trí, Địa hình, Khí hậu, Sông ngòi, Sinh vật và Khoáng sản. Chọn tiêu chí bên dưới để đối chiếu song song.
          </p>
        </div>

        {/* Action button to switch to Game */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onGoToGame}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Thực hành Kéo thả</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile-Friendly Region Switcher (Shows on small screens to easily focus) */}
      <div className="flex lg:hidden items-center justify-between gap-1 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-400 px-2 shrink-0 font-medium">Xem miền:</span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setMobileRegionFilter('all')}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              mobileRegionFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cả 3 miền
          </button>
          <button
            type="button"
            onClick={() => setMobileRegionFilter('dong-bac')}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              mobileRegionFilter === 'dong-bac'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Miền I
          </button>
          <button
            type="button"
            onClick={() => setMobileRegionFilter('tay-bac')}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              mobileRegionFilter === 'tay-bac'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Miền II
          </button>
          <button
            type="button"
            onClick={() => setMobileRegionFilter('nam-bo')}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              mobileRegionFilter === 'nam-bo'
                ? 'bg-emerald-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Miền III
          </button>
        </div>
      </div>

      {/* Filter Toolbar: Criteria Selection & Keyword Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
        {/* Horizontal scrollable criteria tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {CRITERIA_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as CriterionCategory)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-100 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input for fast lookup */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tra cứu: Than đá, Phan-xi-păng..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* 3 Main Frames Layout (3 Columns on Desktop, Responsive Stacking on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {regionsList.map((region, rIdx) => {
          return (
            <div
              key={region.id}
              className={`flex flex-col rounded-3xl border ${region.themeColor.border} bg-gradient-to-b ${region.themeColor.bg} p-4 sm:p-5 shadow-2xl relative`}
            >
              {/* Region Header Badge & Title */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">
                    KHUNG {rIdx + 1} · MIỀN {region.romanId}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${region.themeColor.badgeBg} ${region.themeColor.badgeText}`}>
                    {region.shortName}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                  {region.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {region.geographicSpan}
                </p>
              </div>

              {/* 3D Visual Terrain Model Card */}
              <div className="mb-5">
                <TerrainVisualCard region={region} />
              </div>

              {/* Parallel Criteria Blocks */}
              <div className="space-y-4 flex-1">
                {categoriesToRender.map((catKey) => {
                  const criterion = region.criteria[catKey];
                  if (!criterion) return null;

                  // Keyword filter matches
                  const isMatch =
                    !searchQuery ||
                    criterion.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    criterion.bulletPoints.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    criterion.keyTags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

                  if (!isMatch) return null;

                  return (
                    <section
                      key={catKey}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 transition-all hover:border-slate-700 space-y-2"
                    >
                      {/* Category Label with Icon */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-white border-b border-slate-800/60 pb-1.5">
                        {CATEGORY_ICONS[catKey]}
                        <span>{criterion.categoryLabel}</span>
                      </div>

                      {/* Summary Key Sentence */}
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">
                        {criterion.summary}
                      </p>

                      {/* Detailed Bullet Points from SGK */}
                      <ul className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                        {criterion.bulletPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-emerald-400 font-bold shrink-0 mt-0.5">·</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Key tags (unboxed text with typographic separators per constitution) */}
                      <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 border-t border-slate-900">
                        {criterion.keyTags.map((tag, tIdx) => (
                          <React.Fragment key={tIdx}>
                            <span className="text-slate-400 hover:text-slate-200 transition-colors">
                              {tag}
                            </span>
                            {tIdx < criterion.keyTags.length - 1 && (
                              <span aria-hidden="true" className="text-slate-700">·</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Bottom Quick Fact Summary */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chuẩn kiến thức SGK Địa lý</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">Miền {region.romanId}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
