export type RegionId = 'dong-bac' | 'tay-bac' | 'nam-bo';

export type CriterionCategory = 
  | 'all'
  | 'vi-tri'
  | 'dia-hinh'
  | 'khi-hau'
  | 'song-ngoi'
  | 'sinh-vat'
  | 'khoang-san';

export interface CriterionDetail {
  id: string;
  category: CriterionCategory;
  categoryLabel: string;
  summary: string;
  bulletPoints: string[];
  keyTags: string[];
}

export interface TerrainFeature {
  id: string;
  name: string;
  type: 'mountain' | 'river' | 'delta' | 'coast' | 'plateau' | 'karst';
  x: number; // percentage in visualization 0-100
  y: number; // percentage in visualization 0-100
  description: string;
}

export interface RegionInfo {
  id: RegionId;
  romanId: string;
  title: string;
  shortName: string;
  geographicSpan: string;
  image: string;
  themeColor: {
    accent: string;
    border: string;
    bg: string;
    badgeBg: string;
    badgeText: string;
    glow: string;
  };
  terrain3DDescription: string;
  features: TerrainFeature[];
  criteria: Record<Exclude<CriterionCategory, 'all'>, CriterionDetail>;
}

export interface GameCard {
  id: string;
  text: string;
  category: Exclude<CriterionCategory, 'all'>;
  categoryLabel: string;
  correctRegionId: RegionId;
  hint: string;
  explanation: string;
}

export interface GameState {
  remainingCards: GameCard[];
  placedCards: Record<RegionId, GameCard[]>;
  score: number;
  streak: number;
  bestStreak: number;
  totalAttempts: number;
  correctAttempts: number;
  selectedCardId: string | null;
  lastFeedback: {
    regionId: RegionId;
    isCorrect: boolean;
    cardId: string;
    timestamp: number;
  } | null;
  isCompleted: boolean;
}
