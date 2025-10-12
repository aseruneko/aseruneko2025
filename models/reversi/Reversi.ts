import { ReversiBoard } from "./ReversiBoard.ts";
import {
  ReversiInitialUnlocked,
  ReversiItem,
  ReversiItemCode,
} from "./ReversiItem.ts";
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
  reroleCost: number;
  totalScore: number;
  totalCoins: number;
  shop: Map<ReversiItemCode, ReversiItem>;
  inventory: Map<ReversiItemCode, ReversiItem>;
  unlocked: Set<ReversiItemCode>;
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
      goalScore: ReversiGoalScore[0],
      coins: ReversiDefaultCoins,
      totalScore: 0,
      totalCoins: 0,
      reroleCost: 5,
      shop: new Map(),
      inventory: new Map(),
      unlocked: new Set(ReversiInitialUnlocked),
    };
  },
  DEFAULT_WIDTH: 4,
  DEFAULT_HEIGHT: 4,
} as const;

export const ReversiGoalScore = [
  10,
  25,
  50,
  100,
  250,
  666,
  1000,
  5000,
] as const;

export const ReversiDefaultShopSlot = 6 as const; // 6
export const ReversiDefaultCoins = 15 as const; // 10
