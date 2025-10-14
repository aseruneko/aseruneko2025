import { Signal } from "@preact/signals";
import {
  Reversi,
  ReversiGoalScore,
  ReversiGoalScoreHard,
  ReversiState,
} from "../../models/reversi/Reversi.ts";
import {
  ReversiItem,
  ReversiItemCode,
  ReversiItems,
} from "../../models/reversi/ReversiItem.ts";
import { ReversiBoardFunc } from "./ReversiBoardFunc.ts";
import { ReversiCellFunc } from "./ReversiCellFunc.ts";
import { ReversiColor } from "../../models/reversi/ReversiStone.ts";
import { ReversiShopFunc } from "./ReversiShopFunc.ts";
import { ReversiEffect, ReversiSoundService } from "./ReversiSoundService.ts";
import { at } from "../../models/shared/TwoDimension.ts";
import { ReversiTofuService } from "./tofu/ReversiTofuService.ts";
import {
  ReversiPackCode,
  ReversiPacks,
} from "../../models/reversi/ReversiPack.ts";
import { ReversiItemChain } from "../../models/reversi/ReversiTofu.ts";

export class ReversiService {
  readonly version = "v0.1.1";
  public tofu: ReversiTofuService;

  constructor(
    private _reversi: Signal<Reversi>,
    public localStorage: Storage,
    public sound: ReversiSoundService,
  ) {
    this.tofu = new ReversiTofuService(this, localStorage);
    while (true) {
      if (this.tofu) {
        this.onClickReset(true);
        break;
      }
    }
  }

  setTofu(tofu: ReversiTofuService) {
    this.tofu = tofu;
    this.onClickReset(true);
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

  calcItemPool() {
    const pool = this.reversi.itemPool;
    pool.clear();
    ReversiPacks[ReversiPackCode.Basic].items.map((c) => pool.add(c));
    ReversiPacks[ReversiPackCode.Hidden].items.map((c) => {
      if (this.tofu.isUnlocked(c)) pool.add(c);
    });
    ReversiPacks[ReversiPackCode.Chain].items.map((c) => {
      const premises = ReversiItemChain[c];
      if ((premises ?? []).every((p) => this.has(p))) pool.add(c);
    });
    this.tofu.tofu.value.activePacks.map((p) => {
      ReversiPacks[p].items.map((i) => pool.add(i));
    });
    this.reversi = { itemPool: pool };
  }

  calcEmblems() {
    const inv = this.reversi.inventory;
    inv.clear();
    this.tofu.tofu.value.activeEmblems.map((e) => {
      const item = ReversiItems.find((i) => i.code === e)!;
      inv.set(item.code, { ...item, amount: 1 });
    });
    this.reversi = { inventory: inv };
  }

  startRound() {
    this.sound.play(ReversiEffect.Start);
    this.reversi = {
      score: 0,
      state: ReversiState.InRound,
    };
    ReversiBoardFunc.initBoard(this);
    this.tofu.tofuable.value = false;
    this.log(
      `ROUND${this.reversi.round} 開始 : 目標💠${this.reversi.goalScore}`,
    );
  }

  endRound() {
    applyJudgeMoon(this);
    applyLibraMoon(this);
    applyGradCap(this);
    applyCapricorn(this);
    applyPisces(this);
    applyMusic(this);
    applyMicrophone(this);
    applyAccordion(this);
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
      this.tofu.earnTofuValue();
      this.tofu.tofuable.value = true;
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
        this.tofu.earnTofuValue();
        this.tofu.tofuable.value = true;
        return;
      }
    }
    this.sound.play(ReversiEffect.RoundClear);
    applyBank(this);
    const goalScore = this.has(ReversiItemCode.One)
      ? ReversiGoalScoreHard[this.reversi.round]
      : ReversiGoalScore[this.reversi.round];
    this.reversi = {
      round: this.reversi.round + 1,
      goalScore,
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

  onClickReset(se: boolean = true) {
    if (se) this.sound.play(ReversiEffect.Reset);
    this._reversi.value = Reversi.Default();
    this.reversi = this._reversi.value;
    this.calcEmblems();
    this.calcItemPool();
    ReversiBoardFunc.initBoard(this);
    ReversiShopFunc.rerole(this, true);
  }

  onClickUse(item: ReversiItem) {
    if (!this.isUsable(item)) return;
    this.sound.play(ReversiEffect.Use);
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
    if (item.code === ReversiItemCode.Guitar) applyGuitar(this);
  }

  onClickLibrary() {
    this.tofu.unlockItem(ReversiItemCode.GradCap);
  }

  onClickCopy() {
    this.tofu.unlockItem(ReversiItemCode.Clipboard);
  }

  onClickStartMusic() {
    this.tofu.unlockItem(ReversiItemCode.Music);
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

function applyGradCap(game: ReversiService) {
  const cap = game.has(ReversiItemCode.GradCap);
  if (cap) {
    const earned = Math.ceil(
      game.reversi.score * game.reversi.inventory.size *
        (cap.currentValue ?? 0) / 100,
    );
    game.reversi = {
      score: game.reversi.score + earned,
      totalScore: game.reversi.totalScore + earned,
    };
    if (earned > 0) game.log(`${cap.icon}${cap.name}により💠${earned}を獲得`);
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

function applyMusic(game: ReversiService) {
  const music = game.has(ReversiItemCode.Music);
  if (music && game.sound.playing.value !== undefined) {
    const earned = Math.ceil(game.reversi.score * 0.03);
    game.reversi = {
      score: game.reversi.score + earned,
      totalScore: game.reversi.totalScore + earned,
    };
    if (earned > 0) {
      game.log(`${music.icon}${music.name}により💠${earned}を獲得`);
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

function applyGuitar(game: ReversiService) {
  ReversiShopFunc.reactivate(game, ReversiItemCode.Guitar);
  if (game.reversi.vibes < 1) {
    game.log(`しかし何も起こらなかった！`);
    return;
  }
  game.reversi = { vibes: game.reversi.vibes - 1 };
  ReversiShopFunc.rerole(game, true);
}

function applyMicrophone(game: ReversiService) {
  const microphone = game.has(ReversiItemCode.Microphone);
  if (!microphone) return;
  const earned = microphone.value ?? 0;
  game.log(`${microphone.icon}${microphone.name}により🎵${earned}を獲得`);
  game.reversi = { vibes: game.reversi.vibes + earned };
}

function applyAccordion(game: ReversiService) {
  const accordion = game.has(ReversiItemCode.Accordion);
  if (!accordion) return;
  const earned = game.reversi.vibes * (accordion.value ?? 0);
  game.log(
    `${accordion.icon}${accordion.name}により💠${earned}🪙${earned}を獲得`,
  );
  game.reversi = {
    coins: game.reversi.coins + earned,
    score: game.reversi.score + earned,
    totalCoins: game.reversi.coins + earned,
    totalScore: game.reversi.score + earned,
  };
}
