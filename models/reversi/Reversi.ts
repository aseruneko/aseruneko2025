import { ReversiBoard } from "./ReversiBoard.ts";
import { ReversiItem, ReversiItemCode } from "./ReversiItem.ts";
import { ReversiLog } from "./ReversiLog.ts";

export interface Reversi {
  logs: ReversiLog[];
  board: ReversiBoard;
  state: ReversiState;
  waiting: boolean;
  round: number;
  score: number;
  goalScore: number;
  coins: number;
  vibes: number;
  reroleCost: number;
  totalScore: number;
  totalCoins: number;
  roundScores: number[];
  shop: Map<ReversiItemCode, ReversiItem>;
  inventory: Map<ReversiItemCode, ReversiItem>;
  itemPool: Set<ReversiItemCode>;
}

export const ReversiState = {
  InRound: "IN_ROUND",
  Interval: "INTERVAL",
  GameOver: "GAME_OVER",
  GameClear: "GAME_CLEAER",
} as const;
export type ReversiState = (typeof ReversiState)[keyof typeof ReversiState];

export const Reversi = {
  Default(): Reversi {
    return {
      logs: [],
      board: ReversiBoard.Empty(),
      state: ReversiState.Interval,
      waiting: false,
      round: 1,
      score: 0,
      vibes: 0,
      goalScore: ReversiGoalScore[0],
      coins: ReversiDefaultCoins,
      totalScore: 0,
      totalCoins: 0,
      reroleCost: 0,
      roundScores: [],
      shop: new Map(),
      inventory: new Map(),
      itemPool: new Set(),
    };
  },
  DEFAULT_WIDTH: 4,
  DEFAULT_HEIGHT: 4,
} as const;

export const ReversiGoalScore = [
  8,
  20,
  50,
  100,
  250,
  666,
  1000,
  5000,
] as const;

export const ReversiGoalScoreHard = [
  8,
  25,
  75,
  200,
  500,
  1000,
  5000,
  10000,
] as const;

export const ReversiDefaultShopSlot = 6 as const; // 6
export const ReversiDefaultCoins = 15 as const; // 15
