import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameCard, RegionId } from '../types';
import { GAME_CARDS_BANK, REGIONS_DATA } from '../data/geographyData';
import { soundEngine } from '../utils/audioEffects';
import { EffectsCanvas } from './EffectsCanvas';
import { 
  Trophy, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Flame, 
  ArrowDownCircle,
  Lightbulb,
  Check,
  MousePointerClick
} from 'lucide-react';

interface DragDropGameViewProps {
  onScoreUpdate?: (score: number, remaining: number) => void;
  resetSignal?: number;
}

interface RegionFeedback {
  type: 'fireworks' | 'explosion';
  triggerKey: number;
  message: string;
  cardText: string;
}

export const DragDropGameView: React.FC<DragDropGameViewProps> = ({
  onScoreUpdate,
  resetSignal,
}) => {
  // Game states
  const [deck, setDeck] = useState<GameCard[]>([]);
  const [placedCards, setPlacedCards] = useState<Record<RegionId, GameCard[]>>({
    'dong-bac': [],
    'tay-bac': [],
    'nam-bo': [],
  });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<RegionId | null>(null);
  const [shakingRegionId, setShakingRegionId] = useState<RegionId | null>(null);
  const [reboundingCardId, setReboundingCardId] = useState<string | null>(null);
  const [activeHintCardId, setActiveHintCardId] = useState<string | null>(null);

  // Score & Gamification stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Region localized visual effects
  const [regionFeedbacks, setRegionFeedbacks] = useState<Record<RegionId, RegionFeedback | null>>({
    'dong-bac': null,
    'tay-bac': null,
    'nam-bo': null,
  });

  const regionsList = Object.values(REGIONS_DATA);

  // Initialize and shuffle game deck
  const startNewGame = useCallback(() => {
    const shuffled = [...GAME_CARDS_BANK].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setPlacedCards({
      'dong-bac': [],
      'tay-bac': [],
      'nam-bo': [],
    });
    setSelectedCardId(null);
    setDraggedCardId(null);
    setScore(0);
    setStreak(0);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setIsCompleted(false);
    setActiveHintCardId(null);
    setRegionFeedbacks({
      'dong-bac': null,
      'tay-bac': null,
      'nam-bo': null,
    });
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame, resetSignal]);

  // Sync score and remaining cards to parent TopBar
  useEffect(() => {
    if (onScoreUpdate) {
      onScoreUpdate(score, deck.length);
    }
  }, [score, deck.length, onScoreUpdate]);

  // Check game completion
  useEffect(() => {
    if (deck.length === 0 && GAME_CARDS_BANK.length > 0 && !isCompleted) {
      setIsCompleted(true);
      soundEngine.playVictoryFanfare();
    }
  }, [deck.length, isCompleted]);

  /**
   * Handle dropping or assigning a card to a region
   */
  const handleAssignCardToRegion = (cardId: string, targetRegionId: RegionId) => {
    const card = deck.find((c) => c.id === cardId);
    if (!card) return;

    setTotalAttempts((prev) => prev + 1);

    if (card.correctRegionId === targetRegionId) {
      // ===== CORRECT DROP =====
      soundEngine.playCelebration();

      // Trigger Fireworks Effect on this Region's frame
      setRegionFeedbacks((prev) => ({
        ...prev,
        [targetRegionId]: {
          type: 'fireworks',
          triggerKey: Date.now(),
          message: 'Chính xác! Tuyệt vời!',
          cardText: card.text,
        },
      }));

      // Update streaks and score
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setCorrectAttempts((c) => c + 1);
      const pointsWon = 100 + (newStreak > 1 ? (newStreak - 1) * 20 : 0);
      setScore((s) => s + pointsWon);

      // Pin card to that region & remove from remaining deck
      setPlacedCards((prev) => ({
        ...prev,
        [targetRegionId]: [card, ...prev[targetRegionId]],
      }));
      setDeck((prev) => prev.filter((c) => c.id !== cardId));
      setSelectedCardId(null);
      setDraggedCardId(null);
      setActiveHintCardId(null);
    } else {
      // ===== INCORRECT DROP =====
      soundEngine.playExplosion();

      // Trigger Explosion Effect on this Region's frame
      setRegionFeedbacks((prev) => ({
        ...prev,
        [targetRegionId]: {
          type: 'explosion',
          triggerKey: Date.now(),
          message: `Sai rồi! Thẻ này không thuộc Miền ${REGIONS_DATA[targetRegionId].romanId}!`,
          cardText: card.text,
        },
      }));

      // Shake animation on the incorrect region frame
      setShakingRegionId(targetRegionId);
      setTimeout(() => setShakingRegionId(null), 600);

      // Rebound animation on the card
      setReboundingCardId(cardId);
      setTimeout(() => setReboundingCardId(null), 600);

      // Reset streak
      setStreak(0);
      setScore((s) => Math.max(0, s - 20)); // slight penalty
      setSelectedCardId(null);
      setDraggedCardId(null);
    }
  };

  // Drag event handlers
  const handleDragStart = (e: React.DragEvent, card: GameCard) => {
    soundEngine.playCardPick();
    setDraggedCardId(card.id);
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, regionId: RegionId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (hoveredRegionId !== regionId) {
      setHoveredRegionId(regionId);
    }
  };

  const handleDragLeave = (regionId: RegionId) => {
    if (hoveredRegionId === regionId) {
      setHoveredRegionId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, regionId: RegionId) => {
    e.preventDefault();
    setHoveredRegionId(null);
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (cardId) {
      handleAssignCardToRegion(cardId, regionId);
    }
  };

  // Tap-to-place handler (Click card -> Click region)
  const handleCardClick = (card: GameCard) => {
    soundEngine.playCardPick();
    if (selectedCardId === card.id) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(card.id);
    }
  };

  const handleRegionClick = (regionId: RegionId) => {
    if (selectedCardId) {
      handleAssignCardToRegion(selectedCardId, regionId);
    }
  };

  const progressPercentage = Math.round(
    ((GAME_CARDS_BANK.length - deck.length) / GAME_CARDS_BANK.length) * 100
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-6">
      {/* Game Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phần 2 · Trò Chơi Kéo Thả Tương Tác</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-tight">
            Kéo Thả Đặc Điểm Tự Nhiên Vào Đúng 3 Miền
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dùng chuột hoặc chạm tay kéo thẻ bên dưới thả vào đúng khung của miền tương ứng. Thả sai sẽ nổ tung và bật lại, thả đúng sẽ bắn pháo hoa!
          </p>
        </div>

        {/* Stats Pill Tickers (tabular nums, clean typography) */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs shrink-0">
          <div className="text-center">
            <span className="text-slate-500 block text-[11px]">Tiến độ</span>
            <span className="font-bold text-white font-mono tabular-nums text-base">
              {GAME_CARDS_BANK.length - deck.length}/{GAME_CARDS_BANK.length}
            </span>
          </div>

          <div className="text-center">
            <span className="text-slate-500 block text-[11px]">Điểm số</span>
            <span className="font-bold text-emerald-400 font-mono tabular-nums text-base">
              {score}
            </span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-amber-400 animate-pulse">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span className="font-mono font-bold">{streak}x Chuỗi</span>
            </div>
          )}

          <button
            type="button"
            onClick={startNewGame}
            title="Chơi lại ván mới"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Trộn lại</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-emerald-500 to-sky-400 h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Selected Card Prompt for Touch/Click users */}
      {selectedCardId && (
        <div className="flex items-center justify-between p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>
              Đang chọn thẻ: <strong>"{deck.find((c) => c.id === selectedCardId)?.text}"</strong>. Nhấn vào 1 trong 3 khung bên dưới để thả!
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCardId(null)}
            className="text-[11px] underline text-emerald-400 hover:text-white cursor-pointer ml-2"
          >
            Hủy chọn
          </button>
        </div>
      )}

      {/* 3 REGION DROP FRAMES (Top Targets) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {regionsList.map((region, idx) => {
          const isHovered = hoveredRegionId === region.id;
          const isShaking = shakingRegionId === region.id;
          const isTargetReady = !!selectedCardId;
          const feedback = regionFeedbacks[region.id];
          const cardsInRegion = placedCards[region.id];

          return (
            <div
              key={region.id}
              onDragOver={(e) => handleDragOver(e, region.id)}
              onDragLeave={() => handleDragLeave(region.id)}
              onDrop={(e) => handleDrop(e, region.id)}
              onClick={() => handleRegionClick(region.id)}
              className={`relative flex flex-col rounded-3xl border-2 transition-all duration-300 p-4 bg-gradient-to-b ${
                region.themeColor.bg
              } ${
                isShaking
                  ? 'border-rose-500 shadow-[0_0_35px_rgba(239,68,68,0.5)] translate-x-1 animate-[shake_0.4s_ease-in-out]'
                  : isHovered || (isTargetReady && selectedCardId)
                  ? 'border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.3)] ring-4 ring-emerald-500/20 cursor-pointer'
                  : `${region.themeColor.border} hover:border-slate-600`
              }`}
            >
              {/* Particle Effects Canvas Overlay (Fireworks or Explosion) */}
              <EffectsCanvas
                effectType={feedback?.type || null}
                triggerKey={feedback?.triggerKey || 0}
              />

              {/* Temporary Feedback Notification Toast inside Region Frame */}
              {feedback && (
                <div
                  className={`absolute top-3 left-3 right-3 z-30 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xl animate-fadeIn ${
                    feedback.type === 'fireworks'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {feedback.type === 'fireworks' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">{feedback.message}</span>
                </div>
              )}

              {/* Region Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  KHUNG {idx + 1} · MIỀN {region.romanId}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold ${region.themeColor.badgeBg} ${region.themeColor.badgeText}`}>
                  {cardsInRegion.length} thẻ đã ghim
                </span>
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                {region.title}
              </h3>

              {/* 3D Visual Terrain Model Frame */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 mb-3 group bg-slate-950">
                <img
                  src={region.image}
                  alt={region.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const fallbackMap: Record<string, string> = {
                      'dong-bac': '/images/region_dong_bac_1791109952497.jpg',
                      'tay-bac': '/images/region_tay_bac_1791109965527.jpg',
                      'nam-bo': '/images/region_nam_bo_1791109977644.jpg',
                    };
                    const target = e.currentTarget;
                    if (fallbackMap[region.id] && target.src !== fallbackMap[region.id]) {
                      target.src = fallbackMap[region.id];
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-2.5 right-2.5 text-[11px] text-slate-200 font-medium">
                  {region.terrain3DDescription}
                </div>
              </div>

              {/* Drop Target Hint Area */}
              <div
                className={`p-2.5 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 text-xs font-medium mb-3 ${
                  isHovered || isTargetReady
                    ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300 scale-[1.01]'
                    : 'border-slate-800 bg-slate-950/40 text-slate-500'
                }`}
              >
                <ArrowDownCircle className={`w-4 h-4 ${isHovered ? 'animate-bounce text-emerald-400' : ''}`} />
                <span>
                  {isTargetReady
                    ? 'Nhấp để thả thẻ đã chọn vào đây'
                    : 'Thả thẻ thông tin của miền vào đây'}
                </span>
              </div>

              {/* Pinned Correct Cards List */}
              <div className="flex-1 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {cardsInRegion.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-center text-slate-500 text-xs p-3">
                    <span>Chưa có thẻ nào được ghim.</span>
                    <span className="text-[11px] text-slate-600 mt-0.5">Kéo thẻ từ khay bên dưới thả vào đây.</span>
                  </div>
                ) : (
                  cardsInRegion.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/50 text-xs text-slate-200 shadow-sm animate-fadeIn"
                    >
                      <div className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-medium text-slate-100 leading-snug">{c.text}</p>
                          <p className="text-[10px] text-emerald-400/90 leading-tight">
                            ✓ {c.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTTOM SECTION: SHUFFLED CARD DECK */}
      <div className="mt-8 p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Khay Thẻ Thông Tin Tự Nhiên Cần Phân Loại</span>
              <span className="text-xs bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-md font-mono">
                Còn {deck.length} thẻ
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kéo thẻ hoặc nhấp chọn thẻ, sau đó thả/nhấp vào 1 trong 3 khung miền phía trên.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">Hỗ trợ thao tác kéo thả chuột & chạm tay trên điện thoại</span>
          </div>
        </div>

        {/* Remaining Cards Grid */}
        {deck.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Trophy className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Xuất sắc! Bạn đã phân loại toàn bộ kiến thức!</h4>
            <p className="text-xs text-slate-400 max-w-md">
              Bạn đã nắm vững toàn bộ đặc điểm tự nhiên của Ba Miền Địa Lý Việt Nam với độ chính xác{' '}
              {totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100}%.
            </p>
            <button
              type="button"
              onClick={startNewGame}
              className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Chơi Lại Ván Mới
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {deck.map((card) => {
              const isSelected = selectedCardId === card.id;
              const isRebounding = reboundingCardId === card.id;
              const showHint = activeHintCardId === card.id;

              return (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card)}
                  onClick={() => handleCardClick(card)}
                  className={`relative p-3.5 rounded-2xl border transition-all duration-200 select-none cursor-grab active:cursor-grabbing ${
                    isRebounding
                      ? 'border-rose-500 bg-rose-950/30 scale-95 animate-[shake_0.4s_ease-in-out]'
                      : isSelected
                      ? 'border-emerald-400 bg-slate-800 ring-2 ring-emerald-500/30 shadow-lg -translate-y-1'
                      : 'border-slate-800 bg-slate-950/90 hover:border-slate-700 hover:bg-slate-950 hover:-translate-y-0.5 shadow-sm'
                  }`}
                >
                  {/* Card Category Header */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span className="font-medium text-slate-400">
                      {card.categoryLabel}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHintCardId(showHint ? null : card.id);
                      }}
                      title="Xem gợi ý"
                      className="p-1 text-slate-500 hover:text-amber-400 rounded transition-colors cursor-pointer"
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${showHint ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Card Body Text */}
                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed mb-2">
                    {card.text}
                  </p>

                  {/* Hint disclosure */}
                  {showHint && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-950/50 border border-amber-500/30 text-[11px] text-amber-300">
                      💡 Gợi ý: {card.hint}
                    </div>
                  )}

      {/* Drag / Select affordance footer */}
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900">
                    <span>Kéo chuột hoặc bấm nút:</span>
                    {isSelected && (
                      <span className="text-emerald-400 font-semibold">Đang chọn ✓</span>
                    )}
                  </div>

                  {/* Mobile & Fast Tap Quick Assign Buttons */}
                  <div className="mt-2 pt-2 border-t border-slate-900/80 flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-[10px] text-slate-500 font-medium">Thả vào:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignCardToRegion(card.id, 'dong-bac');
                        }}
                        title="Thả vào Miền I (Bắc & Đông Bắc Bắc Bộ)"
                        className="px-2 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800/70 font-semibold transition-all cursor-pointer text-[11px] active:scale-95"
                      >
                        Miền I
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignCardToRegion(card.id, 'tay-bac');
                        }}
                        title="Thả vào Miền II (Tây Bắc & Bắc Trung Bộ)"
                        className="px-2 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800/70 font-semibold transition-all cursor-pointer text-[11px] active:scale-95"
                      >
                        Miền II
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignCardToRegion(card.id, 'nam-bo');
                        }}
                        title="Thả vào Miền III (Nam Trung Bộ & Nam Bộ)"
                        className="px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/70 font-semibold transition-all cursor-pointer text-[11px] active:scale-95"
                      >
                        Miền III
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Drawer for Mobile when a card is selected */}
      {selectedCardId && (
        <aside aria-label="Khung điều khiển thả thẻ nhanh" className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 p-3.5 bg-slate-900/95 border-2 border-emerald-400 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đang chọn thẻ:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedCardId(null)}
              className="text-[11px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
            >
              Hủy chọn ✕
            </button>
          </div>

          <p className="text-xs text-slate-200 font-medium line-clamp-2">
            {deck.find((c) => c.id === selectedCardId)?.text}
          </p>

          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 mr-1">Chạm để thả:</span>
            <button
              type="button"
              onClick={() => handleAssignCardToRegion(selectedCardId, 'dong-bac')}
              className="flex-1 py-1.5 text-xs font-bold rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all cursor-pointer active:scale-95"
            >
              Miền I
            </button>
            <button
              type="button"
              onClick={() => handleAssignCardToRegion(selectedCardId, 'tay-bac')}
              className="flex-1 py-1.5 text-xs font-bold rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer active:scale-95"
            >
              Miền II
            </button>
            <button
              type="button"
              onClick={() => handleAssignCardToRegion(selectedCardId, 'nam-bo')}
              className="flex-1 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer active:scale-95"
            >
              Miền III
            </button>
          </div>
        </aside>
      )}

      {/* Completion Modal / Celebration Dialog */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white font-serif">
              Chúc Mừng Hoàn Thành!
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn đã ghim chính xác toàn bộ kiến thức về ba miền tự nhiên Việt Nam: Đông Bắc, Tây Bắc - Bắc Trung Bộ, và Nam Trung Bộ - Nam Bộ!
            </p>

            <div className="grid grid-cols-3 gap-2 py-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Tổng điểm</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{score}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Chuỗi cao nhất</span>
                <span className="text-lg font-bold text-amber-400 font-mono">{bestStreak}x</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Độ chính xác</span>
                <span className="text-lg font-bold text-sky-400 font-mono">
                  {totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={startNewGame}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Chơi lại lần nữa
              </button>
              <button
                type="button"
                onClick={() => setIsCompleted(false)}
                className="py-2.5 px-4 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
