import { ReversiState } from "../../models/reversi/Reversi.ts";
import { ReversiColor } from "../../models/reversi/ReversiStone.ts";
import { at, Coord } from "../../models/shared/TwoDimension.ts";
import { ReversiBoardFunc } from "./ReversiBoardFunc.ts";
import { ReversiService } from "./ReversiService.ts";

export const ReversiCellFunc = {
  isClickable(game: ReversiService, c: Coord) {
    if (game.reversi.waiting) return false;
    if (game.reversi.state !== ReversiState.InRound) return false;
    return at(game.reversi.board.board, c)?.placeables?.get(ReversiColor.Black)
      ?.score ?? 0 > 0;
  },
  isPlaceable(game: ReversiService, by: ReversiColor, c: Coord) {
    return ReversiBoardFunc.countReversible(game, by, c).score > 0;
  },
  isReversible(at: ReversiColor, by: ReversiColor) {
    return at !== by;
  },
};
