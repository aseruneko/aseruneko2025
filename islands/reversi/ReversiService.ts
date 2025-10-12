import { Signal } from "@preact/signals";
import {
  Reversi,
  ReversiGoalScore,
  ReversiState,
} from "../../models/reversi/Reversi.ts";
import {
  ReversiItem,
  ReversiItemCode,
} from "../../models/reversi/ReversiItem.ts";
import { ReversiBoardFunc } from "./ReversiBoardFunc.ts";
import { ReversiCellFunc } from "./ReversiCellFunc.ts";
import { ReversiColor } from "../../models/reversi/ReversiStone.ts";
import { ReversiShopFunc } from "./ReversiShopFunc.ts";
import { ReversiEffect, ReversiSoundService } from "./ReversiSoundService.ts";
import { at } from "../../models/shared/TwoDimension.ts";

export class ReversiService {
  readonly version = "v0.0.4";

  constructor(
    private _reversi: Signal<Reversi>,
    public localStorage: Storage,
    public sound: ReversiSoundService,
  ) {
    ReversiBoardFunc.initBoard(this);
    this.initialUnlock();
    ReversiShopFunc.rerole(this, true);
  }

  has(code: ReversiItemCode): ReversiItem | undefined {
    return this.reversi.inventory.get(code);
  }

  isActive(code: ReversiItemCode): boolean {
    return this.reversi.inventory.get(code)?.used === true;
  }

  get reversi(): Reversi {
    return this._reversi.value;
  }

  set reversi(r: Partial<Reversi>) {
    this._reversi.value = {
      ...this._reversi.value,
      ...r,
    };
  }

  isClickable(x: number, y: number) {
    return ReversiCellFunc.isClickable(this, [x, y]);
  }

  initialUnlock() {
    const unlocked = (this.localStorage.getItem("reversiUnlockedItems")?.split(
      "/",
    ) ?? []) as ReversiItemCode[];
    unlocked.forEach((code) => this.reversi.unlocked.add(code));
    this.reversi = { unlocked: this.reversi.unlocked };
  }

  startRound() {
    this.sound.play(ReversiEffect.Start);
    this.reversi = {
      score: 0,
      state: ReversiState.InRound,
    };
    ReversiBoardFunc.initBoard(this);
    this.log(
      `ROUND${this.reversi.round} 開始 : 目標💠${this.reversi.goalScore}`,
    );
  }

  endRound() {
    applyJudgeMoon(this);
    applyLibraMoon(this);
    applyCapricorn(this);
    applyPisces(this);
    this.reversi = {
      totalScore: this.reversi.totalScore + this.reversi.score,
      roundScores: [...this.reversi.roundScores, this.reversi.score],
    };
    this.log(
      `ROUND ${this.reversi.round} 終了 : 目標💠${this.reversi.goalScore}`,
    );
    if (this.reversi.goalScore > this.reversi.score) {
      this.sound.play(ReversiEffect.GameOver);
      this.log(`GAME OVER : 獲得💠${this.reversi.score}`);
      this.reversi = { state: ReversiState.GameOver };
      ReversiShopFunc.unlock(this, ReversiItemCode.Orange);
      ReversiShopFunc.unlock(this, ReversiItemCode.Dmz);
      ReversiShopFunc.unlock(this, ReversiItemCode.Aquarias);
      ReversiShopFunc.unlock(this, ReversiItemCode.Libra);
      ReversiShopFunc.unlock(this, ReversiItemCode.Chick);
      ReversiShopFunc.unlock(this, ReversiItemCode.Capricorn);
      ReversiShopFunc.unlock(this, ReversiItemCode.Pisces);
      return;
    } else {
      this.log(
        `ROUND ${this.reversi.round} 成功 : 獲得💠${this.reversi.score}`,
      );
      if (this.reversi.round === 8) {
        this.sound.play(ReversiEffect.GameClear);
        this.log(
          `GAME CLEAR : THANK YOU FOR PLAYING!`,
        );
        this.reversi = { state: ReversiState.GameClear };
        ReversiShopFunc.unlock(this, ReversiItemCode.Orange);
        ReversiShopFunc.unlock(this, ReversiItemCode.Dmz);
        ReversiShopFunc.unlock(this, ReversiItemCode.Aquarias);
        ReversiShopFunc.unlock(this, ReversiItemCode.Libra);
        ReversiShopFunc.unlock(this, ReversiItemCode.Chick);
        ReversiShopFunc.unlock(this, ReversiItemCode.Capricorn);
        ReversiShopFunc.unlock(this, ReversiItemCode.Pisces);
        return;
      }
    }
    this.sound.play(ReversiEffect.RoundClear);
    applyBank(this);
    this.reversi = {
      round: this.reversi.round + 1,
      goalScore: ReversiGoalScore[this.reversi.round],
      state: ReversiState.Interval,
      reroleCost: 5 * (this.has(ReversiItemCode.Capricorn) ? 2 : 1),
    };
    ReversiShopFunc.rerole(this, true);
    ReversiShopFunc.replenish(this);
  }

  log(text: string) {
    this.reversi = {
      logs: [{
        text: text,
        timestamp: (new Date()).toISOString().replace(/.*T(.*)\..*/, "$1"),
      }, ...this.reversi.logs].slice(0, 100),
    };
  }

  async onClick(x: number, y: number) {
    if (!this.isClickable(x, y)) return;
    this.reversi = { ...this.reversi, waiting: true };
    this.sound.play(ReversiEffect.Put);
    ReversiBoardFunc.putStone(this, ReversiColor.Black, [x, y]);
    await sleep(300);
    ReversiBoardFunc.doWhiteTurn(this);
    if (!ReversiBoardFunc.countPlacables(this, ReversiColor.Black)) {
      this.endRound();
    } else {
      if (this.has(ReversiItemCode.Aquarias)) {
        await sleep(300);
        ReversiBoardFunc.doWhiteTurn(this);
        if (!ReversiBoardFunc.countPlacables(this, ReversiColor.Black)) {
          this.endRound();
        }
      }
    }
    this.reversi = { ...this.reversi, waiting: false };
  }

  onClickRerole() {
    ReversiShopFunc.rerole(this);
  }

  onClickPurchase(code: ReversiItemCode) {
    ReversiShopFunc.purchaseItem(this, code);
  }

  onClickReset() {
    this.sound.play(ReversiEffect.Reset);
    this._reversi.value = Reversi.Default();
    this.reversi = this._reversi.value;
    this.initialUnlock();
    ReversiBoardFunc.initBoard(this);
    ReversiShopFunc.rerole(this, true);
  }

  onClickUse(item: ReversiItem) {
    if (!this.isUsable(item)) return;
    const inventory = this.reversi.inventory;
    inventory.set(item.code, {
      ...item,
      used: true,
      currentValue: (item.currentValue ?? 0) - 1,
    });
    this.log(
      `${item.icon}${item.name}を使用(残り${(item.currentValue ?? 0) - 1}回)`,
    );
    this.reversi = { inventory };
    if (item.code === ReversiItemCode.Pass) applyPass(this);
    if (item.code === ReversiItemCode.Reload) applyReload(this);
    if (item.code === ReversiItemCode.Hammer) applyHammer(this);
    if (item.code === ReversiItemCode.FastUp) applyFastUp(this);
  }

  isReroleDisabled() {
    if (this.reversi.state !== ReversiState.Interval) return true;
    return this.reversi.coins < this.reversi.reroleCost;
  }

  isPurchaseDisabled(code: ReversiItemCode) {
    if (this.reversi.state !== ReversiState.Interval) return true;
    const toBuy = this.reversi.shop.get(code);
    if (!toBuy) return false;
    return this.reversi.coins < toBuy.price;
  }

  isUsable(item: ReversiItem): boolean {
    if (item.used === undefined) return false;
    if (item.usedFor !== this.reversi.state) return false;
    if (this.reversi.waiting) return false;
    return (!item.used && (item.currentValue ?? 0) > 0);
  }

  playLog(): string {
    const str: string[] = [];
    if (this.reversi.state === ReversiState.GameClear) {
      str.push(`${this.version} ゲームクリア`);
    } else if (this.reversi.state === ReversiState.GameOver) {
      str.push(`${this.version} ゲームオーバー(ROUND ${this.reversi.round})`);
    } else {
      str.push(`${this.version} ゲーム中(ROUND ${this.reversi.round})`);
    }
    str.push(
      `総獲得:💠${this.reversi.totalScore}, 🪙${this.reversi.totalCoins}`,
    );
    str.push(
      "各ラウンドスコア:" +
        this.reversi.roundScores.map((score) => `💠${score}`).join("→"),
    );
    const items: string[] = [];
    [...this.reversi.inventory.values()].map((item) => {
      items.push(`${item.icon}${item.amount}`);
    });
    str.push(items.join("/"));
    return str.join("\n");
  }
}

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

function applyBank(game: ReversiService) {
  const itemBank = game.has(ReversiItemCode.Bank);
  let coins = game.reversi.coins;
  if (itemBank) {
    const earned = Math.ceil(
      coins * (itemBank?.currentValue ?? 0) / 100,
    );
    coins += earned;
    if (earned > 0) {
      game.log(`${itemBank.icon}${itemBank.name}により🪙${earned}を獲得`);
    }
  }
  game.reversi = { coins, totalCoins: game.reversi.totalCoins + coins };
}

function applyPass(game: ReversiService) {
  ReversiBoardFunc.doWhiteTurn(game);
  if (!ReversiBoardFunc.countPlacables(game, ReversiColor.Black)) {
    game.endRound();
  }
  ReversiShopFunc.reactivate(game, ReversiItemCode.Pass);
}

function applyReload(game: ReversiService) {
  game.sound.play(ReversiEffect.Reset);
  ReversiShopFunc.rerole(game, true);
  ReversiShopFunc.reactivate(game, ReversiItemCode.Reload);
}

function applyJudgeMoon(game: ReversiService) {
  const moon = game.has(ReversiItemCode.JudgeMoon);
  if (moon) {
    const earned = game.reversi.board.board.flatMap((row) => {
      return row.filter((cell) => cell.stone?.color === ReversiColor.Black);
    }).length * (moon.currentValue ?? 0);
    game.reversi = {
      score: game.reversi.score + earned,
      totalScore: game.reversi.totalScore + earned,
    };
    if (earned > 0) game.log(`${moon.icon}${moon.name}により💠${earned}を獲得`);
  }
}
function applyLibraMoon(game: ReversiService) {
  const moon = game.has(ReversiItemCode.LibraMoon);
  if (moon) {
    const earned = game.reversi.board.board.flatMap((row) => {
      return row.filter((cell) => cell.stone?.color === ReversiColor.White);
    }).length * (moon.currentValue ?? 0);
    game.reversi = {
      coins: game.reversi.coins + earned,
      totalCoins: game.reversi.totalCoins + earned,
    };
    if (earned > 0) game.log(`${moon.icon}${moon.name}により🪙${earned}を獲得`);
  }
}

function applyCapricorn(game: ReversiService) {
  const capricorn = game.has(ReversiItemCode.Capricorn);
  if (capricorn) {
    const earned = Math.ceil(game.reversi.score * 0.2);
    game.reversi = {
      score: game.reversi.score + earned,
      totalScore: game.reversi.totalScore + earned,
    };
    if (earned > 0) {
      game.log(`${capricorn.icon}${capricorn.name}により💠${earned}を獲得`);
    }
  }
}

function applyPisces(game: ReversiService) {
  const pisces = game.has(ReversiItemCode.Pisces);
  if (pisces) {
    const earned = Math.ceil(game.reversi.score * 0.3);
    game.reversi = {
      score: game.reversi.score + earned,
      totalScore: game.reversi.totalScore + earned,
    };
    if (earned > 0) {
      game.log(`${pisces.icon}${pisces.name}により💠${earned}を獲得`);
    }
  }
}

function applyHammer(game: ReversiService) {
  ReversiBoardFunc.calcPlaceables(game, false);
  ReversiShopFunc.reactivate(game, ReversiItemCode.Hammer);
}

function applyFastUp(game: ReversiService) {
  ReversiShopFunc.reactivate(game, ReversiItemCode.FastUp);
  const board = game.reversi.board.board;
  board.map((row, y) => {
    row.map((cell, x) => {
      if (cell.stone !== undefined) {
        const up = at(board, [x, y - 1]);
        if (!up) return;
        if (up.stone === undefined) {
          board[y - 1][x].stone = cell.stone;
          board[y][x].stone = undefined;
        }
      }
    });
  });
  ReversiBoardFunc.setBoard(game, { board });
  ReversiBoardFunc.calcPlaceables(game);
}
