export type Color = 'red' | 'blue' | 'gold' | 'green' | 'purple';
export type TileType = Color | 'pebble' | 'rock' | 'empty';
export const COLORS: Color[] = ['red', 'blue', 'gold', 'green', 'purple'];

export type SaintKey =
  | 'Moreau'
  | 'Brigid'
  | 'Lawrence'
  | 'Francis'
  | 'Dionysius'
  | 'Christopher';

export type Phase =
  | 'lobby'
  | 'saint_select'
  | 'income'
  | 'market'
  | 'auction'
  | 'auction_reveal'
  | 'placement'
  | 'demand_update'
  | 'end_round'
  | 'rule_removal'
  | 'game_over';

export interface Triangle {
  id: number;
  sector: number;
  i: number;
  j: number;
  type: 'up' | 'down';
  ring: number;
  points: Array<{ x: number; y: number }>;
}

export interface Player {
  id: string;
  name: string;
  saint: SaintKey | null;
  gold: number;
  score: number;
  board: Record<number, TileType>;
  roundScores: number[];
  ready: boolean;
}

export interface LotShape {
  kind: 'tri' | 'diamond' | 'strip3' | 'wedge' | 'rhomb4' | 'strip5';
  triangles: number[][];
}

export type LotCategory = 'glass' | 'pebble' | 'rock';

export interface Lot {
  id: string;
  category: LotCategory;
  color: TileType;
  shape: LotShape;
  label: string;
}

export interface RuleCard {
  id: string;
  era: 'Income' | 'Scoring' | 'Bonus' | 'Penalty';
  title: string;
  body: string;
  flavor: string;
  swatches: TileType[];
  status: string;
}

export interface Bid {
  playerId: string;
  lotId: string;
  amount: number;
}

export interface AuctionResult {
  lotId: string;
  winnerId: string | null;
  price: number;
}

export interface GameState {
  roomId: string;
  hostId: string;
  createdAt: number;
  status: 'lobby' | 'playing' | 'over';
  phase: Phase;
  round: number;
  turn: number;
  players: Player[];
  demand: Record<Color, number>;
  thresholds: number[];
  activeRules: RuleCard[];
  lots: Lot[];
  bids: Record<string, Record<string, number>>;
  bidsRevealed: boolean;
  auctionResults: AuctionResult[];
  pendingPlacements: string[];
  ruleRemovalPlayerId: string | null;
  lotDeck: Lot[];
  scoringLog: string[];
}
