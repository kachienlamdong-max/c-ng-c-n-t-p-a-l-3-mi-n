import React from 'react';
import { Volume2, VolumeX, RotateCcw, BookOpen, Gamepad2, Layers, Share2 } from 'lucide-react';
import { soundEngine } from '../utils/audioEffects';

export type AppViewMode = 'parallel-reading' | 'drag-drop-game' | 'terrain-explorer';

interface TopBarProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetGame?: () => void;
  onOpenShare?: () => void;
  gameScore?: number;
  gameCardsRemaining?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onViewChange,
  isMuted,
  onToggleMute,
  onResetGame,
  onOpenShare,
  gameScore = 0,
  gameCardsRemaining = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onViewChange('parallel-reading')}
          className="text-left font-serif text-base sm:text-xl font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
        >
          Ba Miền Tự Nhiên
        </button>

        {/* Zone 2: Clean single-line navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              soundEngine.playCardPick();
              onViewChange('parallel-reading');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'parallel-reading'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Đọc & So sánh</span>
            <span className="xs:hidden">So sánh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playCardPick();
              onViewChange('drag-drop-game');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'drag-drop-game'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Trò chơi Kéo thả</span>
            <span className="xs:hidden">Trò chơi</span>
            {currentView === 'drag-drop-game' && gameCardsRemaining > 0 && (
              <span className="text-[10px] bg-slate-950 text-emerald-400 px-1.5 py-0.2 rounded font-mono tabular-nums">
                {gameCardsRemaining}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playCardPick();
              onViewChange('terrain-explorer');
            }}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              currentView === 'terrain-explorer'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Địa hình 3D</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Share link + Audio toggle + Reset) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onOpenShare && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playCardPick();
                onOpenShare();
              }}
              title="Chia sẻ link / Mã QR để mở trên điện thoại"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Chia sẻ link</span>
            </button>
          )}

          {currentView === 'drag-drop-game' && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-400 mr-1">
              <span>Điểm:</span>
              <span className="text-emerald-400 font-bold text-sm">{gameScore}</span>
            </div>
          )}

          {currentView === 'drag-drop-game' && onResetGame && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playCardPick();
                onResetGame();
              }}
              title="Chơi lại từ đầu"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Bật âm thanh hiệu ứng' : 'Tắt âm thanh'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isMuted
                ? 'text-rose-400 bg-rose-950/40 hover:bg-rose-900/60'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
