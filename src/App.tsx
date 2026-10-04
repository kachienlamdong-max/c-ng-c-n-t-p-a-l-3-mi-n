/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopBar, AppViewMode } from './components/TopBar';
import { ParallelReadingView } from './components/ParallelReadingView';
import { DragDropGameView } from './components/DragDropGameView';
import { Terrain3DExplorerView } from './components/Terrain3DExplorerView';
import { ShareModal } from './components/ShareModal';
import { soundEngine } from './utils/audioEffects';

export default function App() {
  const [currentView, setCurrentView] = useState<AppViewMode>('parallel-reading');
  const [isMuted, setIsMuted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameCardsRemaining, setGameCardsRemaining] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleResetGame = () => {
    setResetSignal((s) => s + 1);
  };

  const handleScoreUpdate = (score: number, remaining: number) => {
    setGameScore(score);
    setGameCardsRemaining(remaining);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Bar with 3-Zone Contract */}
      <TopBar
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onResetGame={handleResetGame}
        onOpenShare={() => setIsShareOpen(true)}
        gameScore={gameScore}
        gameCardsRemaining={gameCardsRemaining}
      />

      {/* Share & Mobile QR Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'parallel-reading' && (
          <ParallelReadingView
            onGoToGame={() => setCurrentView('drag-drop-game')}
          />
        )}

        {currentView === 'drag-drop-game' && (
          <DragDropGameView
            onScoreUpdate={handleScoreUpdate}
            resetSignal={resetSignal}
          />
        )}

        {currentView === 'terrain-explorer' && (
          <Terrain3DExplorerView
            onGoToGame={() => setCurrentView('drag-drop-game')}
          />
        )}
      </main>

      {/* Clean Human Editorial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Địa Lý Tự Nhiên Việt Nam</span>
            <span aria-hidden="true">·</span>
            <span>Chương trình giáo dục phổ thông môn Địa lý</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => setCurrentView('parallel-reading')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              1. So Sánh Song Song
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setCurrentView('drag-drop-game')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              2. Trò Chơi Kéo Thả
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setCurrentView('terrain-explorer')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              3. Bản Đồ 3D
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
