import { computed, signal } from "@preact/signals";
import { ReversiService } from "../ReversiService.ts";
import { ReversiTofu } from "../../../models/reversi/ReversiTofu.ts";
import { ReversiState } from "../../../models/reversi/Reversi.ts";
import {
  ReversiPackCode,
  ReversiPacks,
} from "../../../models/reversi/ReversiPack.ts";
import { ReversiEffect } from "../ReversiSoundService.ts";
import {
  ReversiItem,
  ReversiItemCode,
  ReversiItems,
} from "../../../models/reversi/ReversiItem.ts";

export class ReversiTofuService {
  readonly tofu = signal<ReversiTofu>(ReversiTofu.Initial());
  readonly isShopOpen = computed<boolean>(
    () => (this.tofu.value.shopUnlocked),
  );
  readonly tofuable = signal<boolean>(true);

  constructor(
    private game: ReversiService,
    private storage: Storage,
  ) {
    this.read();
    this.write();
    this.unlockPack(ReversiPackCode.Orange);
    this.unlockPack(ReversiPackCode.Zodiac1);
    this.unlockPack(ReversiPackCode.Vibes);
    this.unlockPack(ReversiPackCode.Banned);
    this.unlockEmblem(ReversiItemCode.Katakana);
    this.unlockEmblem(ReversiItemCode.One);
  }

  get tofuValue() {
    return this.tofu.value.value;
  }

  set tofuValue(value: number) {
    this.tofu.value = { ...this.tofu.value, value, shopUnlocked: true };
    this.write();
  }

  read() {
    const raw = this.storage.getItem(ReversiTofu.StorageKey);
    if (!raw) return;
    const tofu = JSON.parse(raw) as Partial<ReversiTofu>;
    this.tofu.value = { ...this.tofu.value, ...tofu };
  }

  write() {
    const tofu = JSON.stringify(this.tofu.value);
    this.storage.setItem(ReversiTofu.StorageKey, tofu);
  }

  earnTofuValue() {
    let tv = this.game.reversi.round;
    tv = tv * tv;
    if (this.game.reversi.state === ReversiState.GameClear) tv *= 2;
    if (this.game.has(ReversiItemCode.One)) tv *= 2;
    if (this.game.has(ReversiItemCode.Two)) tv *= 2;
    this.game.log(`📛${tv}を獲得`);
    this.tofuValue = this.tofuValue + tv;
  }

  purchasePack(code: ReversiPackCode) {
    this.game.sound.play(ReversiEffect.Purchase);
    const tofuValue = this.tofu.value.value - ReversiPacks[code].price;
    this.tofu.value.purchasedPacks = [...this.tofu.value.purchasedPacks, code];
    const pack = ReversiPacks[code];
    pack.items.map((item) => {
      if (!this.tofu.value.unlockedItems.includes(item)) {
        this.tofu.value.unlockedItems.push(item);
      }
    });
    this.tofu.value = { ...this.tofu.value, value: tofuValue };
    this.write();
  }

  enablePack(code: ReversiPackCode) {
    this.game.sound.play(ReversiEffect.Rerole);
    const actives = this.tofu.value.activePacks;
    if (!actives.includes(code)) actives.push(code);
    this.tofu.value = { ...this.tofu.value };
    this.write();
    ReversiPacks[code].items.map((i) => this.unlockItem(i));
    this.game.calcItemPool();
  }

  disablePack(code: ReversiPackCode) {
    this.game.sound.play(ReversiEffect.Rerole);
    const tofu = this.tofu.value;
    tofu.activePacks = tofu.activePacks.filter((a) => a !== code);
    this.tofu.value = { ...tofu };
    this.write();
    ReversiPacks[code].items.map((i) => this.unlockItem(i));
    this.game.calcItemPool();
  }

  purchaseEmblem(code: ReversiItemCode) {
    this.game.sound.play(ReversiEffect.Purchase);
    const tofuValue = this.tofu.value.value -
      ReversiItems.find((i) => i.code === code)!.price;
    this.tofu.value.purchasedEmblems = [
      ...this.tofu.value.purchasedEmblems,
      code,
    ];
    if (!this.tofu.value.unlockedItems.includes(code)) {
      this.tofu.value.unlockedItems.push(code);
    }
    this.tofu.value = { ...this.tofu.value, value: tofuValue };
    this.write();
    if (code === ReversiItemCode.One) this.unlockEmblem(ReversiItemCode.Two);
    this.game.onClickReset(false);
  }

  enableEmblem(code: ReversiItemCode) {
    this.game.sound.play(ReversiEffect.Rerole);
    const actives = this.tofu.value.activeEmblems;
    if (!actives.includes(code)) actives.push(code);
    this.tofu.value = { ...this.tofu.value };
    this.write();
    this.unlockItem(code);
    if (code === ReversiItemCode.One) this.unlockEmblem(ReversiItemCode.Two);
    this.game.calcItemPool();
    this.game.onClickReset(false);
  }

  disableEmblem(code: ReversiItemCode) {
    this.game.sound.play(ReversiEffect.Rerole);
    const tofu = this.tofu.value;
    tofu.activeEmblems = tofu.activeEmblems.filter((a) => a !== code);
    this.tofu.value = { ...tofu };
    this.write();
    this.unlockItem(code);
    if (code === ReversiItemCode.One) this.unlockEmblem(ReversiItemCode.Two);
    this.game.calcItemPool();
    this.game.onClickReset(false);
  }

  unlockItem(code: ReversiItemCode) {
    const tofu = this.tofu.value;
    if (tofu.unlockedItems.includes(code)) return;
    const item = ReversiItems.find((i) => i.code === code);
    if (!item) return false;
    this.game.sound.play(ReversiEffect.Unlock);
    this.game.log(`${item.icon}${item.name}がアンロック！`);
    tofu.unlockedItems.push(code);
    this.tofu.value = { ...tofu };
    this.write();
    this.game.calcItemPool();
  }

  unlockPack(code: ReversiPackCode) {
    const tofu = this.tofu.value;
    if (tofu.unlockedPacks.includes(code)) return;
    this.game.sound.play(ReversiEffect.Unlock);
    tofu.unlockedPacks.push(code);
    this.tofu.value = { ...tofu };
    this.write();
  }

  unlockEmblem(code: ReversiItemCode) {
    const tofu = this.tofu.value;
    if (tofu.unlockedEmblems.includes(code)) return;
    this.game.sound.play(ReversiEffect.Unlock);
    tofu.unlockedEmblems.push(code);
    this.tofu.value = { ...tofu };
    this.unlockItem(code);
    this.write();
  }

  isUnlocked(code: ReversiItemCode): boolean {
    return this.tofu.value.unlockedItems.includes(code);
  }

  static isBasic(code: ReversiItemCode): boolean {
    return ReversiPacks[ReversiPackCode.Basic].items.includes(code);
  }

  static isDeprecated(code: ReversiItemCode): boolean {
    return ReversiPacks[ReversiPackCode.Deprecated].items.includes(code);
  }

  static isBanned(code: ReversiItemCode): boolean {
    return ReversiPacks[ReversiPackCode.Banned].items.includes(code);
  }

  static isEmblem(code: ReversiItemCode): boolean {
    return ReversiPacks[ReversiPackCode.Emblem].items.includes(code);
  }

  static unlockedItems(storage: Storage): ReversiItemCode[] {
    const raw = storage.getItem(ReversiTofu.StorageKey);
    if (!raw) return [];
    const tofu = JSON.parse(raw) as Partial<ReversiTofu>;
    return tofu?.unlockedItems ?? [];
  }

  static emblems(): ReversiItem[] {
    return ReversiItems.filter((item) => this.isEmblem(item.code));
  }
}
