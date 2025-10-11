import { ReversiColor, ReversiStone } from "./ReversiStone.ts";

export interface ReversiBoard {
  board: ReversiCell[][];
}
export const ReversiBoard = {
  Empty(): ReversiBoard {
    return {
      board: [],
    };
  },
} as const;

export interface ReversiCell {
  floor?: ReversiFloor;
  stone?: ReversiStone;
  placeables: Map<ReversiColor, ReversiOutcome>;
}
export const ReversiCell = {
  Empty(): ReversiCell {
    return {
      placeables: new Map(),
    };
  },
} as const;

export type ReversiFloor = never;

export interface ReversiOutcome {
  coin: number;
  score: number;
}
export const ReversiOutcome = {
  None(): ReversiOutcome {
    return { coin: 0, score: 0 };
  },
  sum(comes: ReversiOutcome[]) {
    let coin = 0;
    let score = 0;
    comes.forEach((come) => {
      coin += come.coin;
      score += come.score;
    });
    return { coin, score: score * comes.length };
  },
};
