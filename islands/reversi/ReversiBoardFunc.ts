import { Reversi } from "../../models/reversi/Reversi.ts";
import {
  ReversiBoard,
  ReversiCell,
  ReversiOutcome,
} from "../../models/reversi/ReversiBoard.ts";
import { ReversiItemCode } from "../../models/reversi/ReversiItem.ts";
import {
  ReversiColor,
  ReversiStone,
  ReversiStoneCode,
} from "../../models/reversi/ReversiStone.ts";
import {
  at,
  Coord,
  crop,
  Direction,
  Directions,
  plus,
} from "../../models/shared/TwoDimension.ts";
import { ReversiCellFunc } from "./ReversiCellFunc.ts";
import { ReversiService } from "./ReversiService.ts";
import { random, randomInt } from "../../models/shared/Random.ts";
import { ReversiShopFunc } from "./ReversiShopFunc.ts";
import { ReversiEffect } from "./ReversiSoundService.ts";

export const ReversiBoardFunc = {
  setBoard(game: ReversiService, board: Partial<ReversiBoard>) {
    game.reversi = { board: { ...game.reversi.board, ...board } };
  },
  initBoard(game: ReversiService) {
    const width = crop(
      Reversi.DEFAULT_WIDTH + Math.floor(game.reversi.round / 2) +
        (game.has(ReversiItemCode.Yokoplus)?.currentValue ?? 0) +
        (game.has(ReversiItemCode.Libra) ? -2 : 0),
      4,
      12,
    );
    const height = crop(
      Reversi.DEFAULT_HEIGHT + Math.floor((game.reversi.round - 1) / 2) +
        (game.has(ReversiItemCode.Tateplus)?.currentValue ?? 0) +
        (game.has(ReversiItemCode.Libra) ? -2 : 0),
      4,
      12,
    );
    const board: ReversiCell[][] = [];
    for (let y = 0; y < height; y++) {
      const row: ReversiCell[] = [];
      for (let x = 0; x < width; x++) {
        row.push(ReversiCell.Empty());
      }
      board.push(row);
    }
    this.setBoard(game, { board: board });
    this.setInitStone(game);
    this.calcPlaceables(game);
  },
  setInitStone(game: ReversiService) {
    const board = game.reversi.board.board;
    const cx = Math.floor(this.getWidth(game) / 2) - 1;
    const cy = Math.floor(this.getHeight(game) / 2) - 1;
    board[cy][cx].stone = ReversiStone.White;
    board[cy][cx + 1].stone = ReversiStone.Black;
    board[cy + 1][cx].stone = ReversiStone.Black;
    board[cy + 1][cx + 1].stone = ReversiStone.White;
    raffleNeutralStones(game);
    this.setBoard(game, { board: board });
  },
  getWidth(game: ReversiService) {
    return game.reversi.board.board[0].length;
  },
  getHeight(game: ReversiService) {
    return game.reversi.board.board.length;
  },
  countReversible(
    game: ReversiService,
    by: ReversiColor,
    from: Coord,
    emptyCheck: boolean = true,
  ): ReversiOutcome {
    const board = game.reversi.board.board;
    const to = at(board, from);
    if (to === undefined) return ReversiOutcome.None();
    if (emptyCheck && to.stone !== undefined) return ReversiOutcome.None();
    return ReversiOutcome.sum(Directions.flatMap((d) => {
      return _countReversible(board, by, plus(from, d), d);
    }));
  },
  countPlacables(
    game: ReversiService,
    by: ReversiColor,
  ) {
    const board = game.reversi.board.board;
    let count = 0;
    board.forEach((row) => {
      row.forEach((cell) => {
        count += cell.placeables.get(by)?.score ? 1 : 0;
      });
    });
    return count;
  },
  calcPlaceables(game: ReversiService, emptyCheck: boolean = true) {
    const reversi = game.reversi;
    reversi.board.board.map((row, y) => {
      row.map((cell, x) => {
        cell.placeables.clear();
        [...Object.values(ReversiColor)].forEach((color) => {
          const result = this.countReversible(game, color, [x, y], emptyCheck);
          if (result) cell.placeables.set(color, result);
        });
      });
    });
    game.reversi = reversi;
  },
  putStone(game: ReversiService, color: ReversiColor, [x, y]: Coord) {
    const board = game.reversi.board.board;
    let stone = ReversiStone.Black;
    if (color === ReversiColor.Black) {
      if (game.has(ReversiItemCode.Insurance)) applyInsurance(game);
      stone = raffleBlackStone(game);
    }
    if (color === ReversiColor.White) stone = raffleWhiteStone(game);
    board[y][x].stone = stone;
    const score = board[y][x].placeables.get(color) ?? ReversiOutcome.None();
    const originalScore = { ...score };
    Directions.forEach((d) => {
      if (_countReversible(board, color, plus([x, y], d), d).length === 0) {
        return;
      }
      _reverse(game, board, color, plus([x, y], d), d);
    });
    ReversiShopFunc.reactivate(game, ReversiItemCode.Pigeon);
    this.setBoard(game, { board: board });
    adjustScore(game, score);
    if (color === ReversiColor.Black) {
      game.log(`黒(${x}, ${y})->💠${score.score}, 🪙${score.coin}`);
      game.reversi = {
        score: game.reversi.score + score.score,
        coins: game.reversi.coins + score.coin,
        totalCoins: game.reversi.totalCoins + score.coin,
      };
    } else {
      game.log(`白(${x}, ${y})`);
    }
    if (originalScore.coin >= 3) applySaxophone(game);
    this.calcPlaceables(game);
  },
  doWhiteTurn(game: ReversiService) {
    const board = game.reversi.board.board;
    const cands: [number, number, number][] = board.flatMap((row, y) => {
      return row.map((
        cell,
        x,
      ) =>
        [x, y, cell.placeables.get(ReversiColor.White)?.score ?? 0] as [
          number,
          number,
          number,
        ]
      );
    });
    const [nx, ny, ns] = cands.reduce((a, b) => a[2] > b[2] ? a : b);
    if (ns > 0) {
      this.putStone(game, ReversiColor.White, [nx, ny]);
      game.sound.play(ReversiEffect.Put);
    }
    applyRat(game);
    applyDmz(game);
    applyChick(game);
    applyChicken(game);
    applyBlackCat(game);
    applySheep(game);
    applyRabbit(game);
    applyMicrophone(game);
  },
};

function _countReversible(
  board: ReversiCell[][],
  by: ReversiColor,
  next: Coord,
  d: Direction,
  acc: ReversiOutcome[] = [],
): ReversiOutcome[] {
  const n = at(board, next);
  if (n?.stone === undefined) return [];
  if (n.stone.color === by) return acc;
  if (!ReversiCellFunc.isReversible(n.stone.color, by)) return acc;
  return _countReversible(
    board,
    by,
    plus(next, d),
    d,
    acc.concat({ coin: n.stone.coin, score: n.stone.score }),
  );
}

function _reverse(
  game: ReversiService,
  board: ReversiCell[][],
  by: ReversiColor,
  [x, y]: Coord,
  d: Direction,
) {
  const n = board[y][x];
  if (n?.stone === undefined) return;
  if (n.stone.color === by) return;
  if (ReversiCellFunc.isReversible(n.stone.color, by)) {
    let stone = ReversiStone.Black;
    if (by === ReversiColor.Black) {
      stone = ReversiStone.Black;
      const blackMonolis =
        game.has(ReversiItemCode.BlackMonolis)?.currentValue ?? 0;
      if (randomInt(100) < blackMonolis) {
        stone = raffleBlackStone(game);
      }
      if (game.isActive(ReversiItemCode.Pigeon)) {
        stone = n.stone;
      }
    }
    if (by === ReversiColor.White) {
      stone = ReversiStone.White;
      const whiteMonolis =
        game.has(ReversiItemCode.WhiteMonolis)?.currentValue ?? 0;
      if (randomInt(100) < whiteMonolis) {
        stone = raffleWhiteStone(game);
      }
    }
    if (n.stone.code === ReversiStoneCode.Moai) stone = n.stone;
    if (n.stone.code === ReversiStoneCode.EightBall) stone = n.stone;
    n.stone = stone;
    _reverse(game, board, by, plus([x, y], d), d);
  }
  return;
}

function raffleBlackStone(game: ReversiService) {
  if (game.isActive(ReversiItemCode.EightBall)) {
    ReversiShopFunc.reactivate(game, ReversiItemCode.EightBall);
    return ReversiStone.EightBall;
  }
  if (game.isActive(ReversiItemCode.BlackCat)) {
    ReversiShopFunc.reactivate(game, ReversiItemCode.BlackCat);
    return ReversiStone.BlackCat;
  }
  const pools: ReversiStone[] = [];
  const moai = game.has(ReversiItemCode.Moai)?.currentValue;
  const rat = game.has(ReversiItemCode.Rat)?.currentValue;
  const sunflower = game.has(ReversiItemCode.Dmz)?.currentValue;
  if (moai) pools.push(...new Array(moai ?? 0).fill(ReversiStone.Moai));
  if (rat) pools.push(...new Array(rat ?? 0).fill(ReversiStone.Rat));
  if (sunflower) {
    pools.push(...new Array(sunflower ?? 0).fill(ReversiStone.Sunflower));
  }
  if (randomInt(100) >= pools.length) return ReversiStone.Black;
  return random(pools)!;
}

function raffleWhiteStone(game: ReversiService) {
  const pools: ReversiStone[] = [];
  const mail = game.has(ReversiItemCode.Mail)?.currentValue;
  const email = game.has(ReversiItemCode.Email)?.currentValue;
  const ring = game.has(ReversiItemCode.Ring)?.currentValue;
  const jewel = game.has(ReversiItemCode.Jewel)?.currentValue;
  const sheep = game.has(ReversiItemCode.Sheep)?.currentValue;
  const rabbit = game.has(ReversiItemCode.Rabbit)?.currentValue;
  if (mail) pools.push(...new Array(mail ?? 0).fill(ReversiStone.Mail));
  if (email) pools.push(...new Array(email ?? 0).fill(ReversiStone.Email));
  if (ring) pools.push(...new Array(ring ?? 0).fill(ReversiStone.Ring));
  if (jewel) pools.push(...new Array(jewel ?? 0).fill(ReversiStone.Jewel));
  if (sheep) pools.push(...new Array(sheep ?? 0).fill(ReversiStone.Sheep));
  if (rabbit) pools.push(...new Array(rabbit ?? 0).fill(ReversiStone.Rabbit));
  if (randomInt(100) >= pools.length) return ReversiStone.White;
  return random(pools)!;
}

function raffleNeutralStones(game: ReversiService) {
  const board = game.reversi.board.board;
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[0].length; x++) {
      if (board[y][x].stone === undefined) {
        const stone = raffleNeutralStone(game, [x, y]);
        board[y][x].stone = stone;
      }
    }
  }
  ReversiBoardFunc.setBoard(game, { board: board });
}

function raffleNeutralStone(game: ReversiService, [x, y]: Coord) {
  const pools: ReversiStone[] = [];
  if (
    x === ReversiBoardFunc.getWidth(game) - 1 && y === 0 &&
    game.has(ReversiItemCode.Two)
  ) {
    return ReversiStone.Prohibited;
  }
  if (x === 0 && y === 0 && game.has(ReversiItemCode.Pisces)) {
    return ReversiStone.Prohibited;
  }
  if (
    x === ReversiBoardFunc.getWidth(game) - 1 &&
    y === ReversiBoardFunc.getHeight(game) - 1 &&
    game.has(ReversiItemCode.Pisces)
  ) {
    return ReversiStone.Prohibited;
  }
  const orange = game.has(ReversiItemCode.Orange)?.currentValue;
  const chick = game.has(ReversiItemCode.Chick)?.currentValue;
  const chicken = game.has(ReversiItemCode.Chicken)?.currentValue;
  if (orange) pools.push(...new Array(orange ?? 0).fill(ReversiStone.Orange));
  if (chick) pools.push(...new Array(chick ?? 0).fill(ReversiStone.Chick));
  if (chicken) {
    pools.push(...new Array(chicken ?? 0).fill(ReversiStone.Chicken));
  }
  if (randomInt(100) >= pools.length) return undefined;
  return random(pools)!;
}

function adjustScore(game: ReversiService, score: ReversiOutcome) {
  if (game.has(ReversiItemCode.Abacus) && score.score >= 10) {
    score.score = score.score * 2;
  }
  if (game.has(ReversiItemCode.Study)) {
    const trans = Math.floor(score.coin / 2);
    score.score = score.score + trans;
    score.coin = score.coin - trans;
  }
  const interest = game.has(ReversiItemCode.Interest);
  if (interest) {
    const interestIncome = Math.ceil(
      score.score * game.reversi.coins / 100,
    );
    if (interestIncome > 0) {
      game.log(
        `${interest.icon}${interest.name}により獲得💠が${interestIncome}増加`,
      );
    }
    score.score = score.score + interestIncome;
  }
  const aquariasItem = game.has(ReversiItemCode.Aquarias);
  if (aquariasItem) {
    const aquarias = score.score;
    if (aquarias > 0) {
      score.score = score.score + aquarias;
      game.log(
        `${aquariasItem.icon}${aquariasItem.name}により獲得💠が${aquarias}増加`,
      );
    }
  }
  const libraItem = game.has(ReversiItemCode.Libra);
  if (libraItem) {
    const libra = score.score;
    if (libra > 0) {
      score.score = score.score + libra;
      game.log(
        `${libraItem.icon}${libraItem.name}により獲得💠が${libra}増加`,
      );
    }
  }
}

function applyInsurance(game: ReversiService) {
  const insurance = game.has(ReversiItemCode.Insurance);
  if (insurance) {
    game.reversi = {
      coins: game.reversi.coins + (insurance.currentValue ?? 0),
      totalCoins: game.reversi.coins + (insurance.currentValue ?? 0),
    };
    if ((insurance.currentValue ?? 0) > 0) {
      game.log(
        `${insurance.icon}${insurance.name}により🪙${(insurance.currentValue ??
          0)}を獲得`,
      );
    }
  }
}

function applyRat(game: ReversiService) {
  const rat = game.has(ReversiItemCode.Rat);
  if (rat) {
    const earned = game.reversi.board.board.flatMap((row) => {
      return row.filter((cell) => cell.stone?.code === ReversiStoneCode.Rat);
    }).length;
    game.reversi = {
      score: game.reversi.score + earned,
      totalScore: game.reversi.score + earned,
    };
    if (earned > 0) {
      game.log(
        `${ReversiStone.Rat.icon}${ReversiStone.Rat.name}により💠${earned}を獲得`,
      );
    }
  }
}

function applyBlackCat(game: ReversiService) {
  const blackCat = game.has(ReversiItemCode.BlackCat);
  if (blackCat) {
    const earned = game.reversi.board.board.flatMap((row) => {
      return row.filter((cell) => cell.stone?.code === ReversiStoneCode.Rat);
    }).length * game.reversi.board.board.flatMap((row) => {
      return row.filter((cell) =>
        cell.stone?.code === ReversiStoneCode.BlackCat
      );
    }).length * 2;
    game.reversi = {
      score: game.reversi.score + earned,
      totalScore: game.reversi.score + earned,
    };
    if (earned > 0) {
      game.log(
        `${ReversiStone.BlackCat.icon}${ReversiStone.BlackCat.name}により💠${earned}を獲得`,
      );
    }
  }
}

function applyDmz(game: ReversiService) {
  const dmz = game.has(ReversiItemCode.Dmz);
  if (dmz) {
    const earned = game.reversi.board.board.flatMap((row) => {
      return row.filter((cell) =>
        cell.stone?.code === ReversiStoneCode.Sunflower
      );
    }).length * 2;
    game.reversi = {
      score: game.reversi.score + earned,
      totalScore: game.reversi.score + earned,
    };
    if (earned > 0) {
      game.log(
        `${ReversiStone.Sunflower.icon}${ReversiStone.Sunflower.name}により💠${earned}を獲得`,
      );
    }
  }
}

function applyChick(game: ReversiService) {
  const chick = game.has(ReversiItemCode.Chick);
  if (chick) {
    const earned = game.reversi.board.board.flatMap((row) => {
      return row.filter((cell) => cell.stone?.code === ReversiStoneCode.Chick);
    }).length * 2;
    game.reversi = {
      score: game.reversi.score + earned,
      totalScore: game.reversi.score + earned,
    };
    if (earned > 0) {
      game.log(
        `${ReversiStone.Chick.icon}${ReversiStone.Chick.name}により💠${earned}を獲得`,
      );
    }
  }
}

function applyChicken(game: ReversiService) {
  const chicken = game.has(ReversiItemCode.Chicken);
  if (chicken) {
    const earned = game.reversi.board.board.flatMap((row) => {
      return row.filter((cell) => cell.stone?.code === ReversiStoneCode.Chick);
    }).length * game.reversi.board.board.flatMap((row) => {
      return row.filter((cell) =>
        cell.stone?.code === ReversiStoneCode.Chicken
      );
    }).length;
    game.reversi = {
      coins: game.reversi.coins + earned,
      totalCoins: game.reversi.coins + earned,
    };
    if (earned > 0) {
      game.log(
        `${ReversiStone.Chicken.icon}${ReversiStone.Chicken.name}により🪙${earned}を獲得`,
      );
    }
  }
}

function applySheep(game: ReversiService) {
  const board = game.reversi.board.board;
  if (!game.has(ReversiItemCode.Sheep)) return;
  board.map((row, y) => {
    row.map((cell, x) => {
      if (cell.stone?.code === ReversiStoneCode.Sheep) {
        const left = at(board, [x - 1, y]);
        if (!left) return;
        if (left.stone === undefined) {
          board[y][x - 1].stone = ReversiStone.Sheep;
          board[y][x].stone = undefined;
        }
      }
    });
  });
  ReversiBoardFunc.setBoard(game, { board });
  ReversiBoardFunc.calcPlaceables(game);
}

function applyRabbit(game: ReversiService) {
  const board = game.reversi.board.board;
  if (!game.has(ReversiItemCode.Rabbit)) return;
  board.map((row, y) => {
    row.map((cell, x) => {
      if (cell.stone?.code === ReversiStoneCode.Rabbit) {
        const up = at(board, [x, y - 1]);
        if (!up) return;
        if (up.stone === undefined) {
          board[y - 1][x].stone = ReversiStone.Rabbit;
        }
      }
    });
  });
  ReversiBoardFunc.setBoard(game, { board });
  ReversiBoardFunc.calcPlaceables(game);
}

function applyMicrophone(game: ReversiService) {
  const microphone = game.has(ReversiItemCode.Microphone);
  if (!microphone) return;
  const earned = microphone.currentValue ?? 0;
  game.log(`${microphone.icon}${microphone.name}により🎵${earned}を獲得`);
  game.reversi = { vibes: game.reversi.vibes + earned };
}

function applySaxophone(game: ReversiService) {
  const saxophone = game.has(ReversiItemCode.Saxophone);
  if (!saxophone) return;
  const earned = saxophone.currentValue ?? 0;
  game.log(`${saxophone.icon}${saxophone.name}により🎵${earned}を獲得`);
  game.reversi = { vibes: game.reversi.vibes + earned };
}
