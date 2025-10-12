import { ReversiItemCode } from "./ReversiItem.ts";

export const ReversiPackCode = {
  Emblem: "EMBLEM",
  Basic: "BASIC",
  Hidden: "HIDDEN",
  Chain: "CHAIN",
  Deprecated: "DEPRECATED",
  Orange: "ORANGE",
  Zodiac1: "ZODIAC1",
  Vibes: "VIBES",
  Banned: "BANNED",
} as const;
export type ReversiPackCode =
  (typeof ReversiPackCode)[keyof typeof ReversiPackCode];

export interface ReversiPack {
  name: string;
  desc: string;
  price: number;
  items: ReversiItemCode[];
}

export const ReversiPacks: Record<ReversiPackCode, ReversiPack> = {
  [ReversiPackCode.Emblem]: {
    name: "紋章パック",
    desc: "これはアイテムではない",
    price: 0,
    items: [ReversiItemCode.Katakana, ReversiItemCode.One, ReversiItemCode.Two],
  },
  [ReversiPackCode.Basic]: {
    name: "基本パック",
    desc: "なし",
    price: 0,
    items: [
      ReversiItemCode.Yokoplus,
      ReversiItemCode.Tateplus,
      ReversiItemCode.FastUp,
      ReversiItemCode.Pass,
      ReversiItemCode.Hammer,
      ReversiItemCode.Moai,
      ReversiItemCode.Rat,
      ReversiItemCode.Mail,
      ReversiItemCode.Ring,
      ReversiItemCode.Sheep,
      ReversiItemCode.Insurance,
      ReversiItemCode.Abacus,
      ReversiItemCode.Study,
      ReversiItemCode.Interest,
      ReversiItemCode.JudgeMoon,
      ReversiItemCode.LibraMoon,
      ReversiItemCode.Cart,
      ReversiItemCode.BlackMonolis,
      ReversiItemCode.WhiteMonolis,
    ],
  },
  [ReversiPackCode.Hidden]: {
    name: "隠しパック",
    desc: "アンロックが必要なアイテム",
    price: 0,
    items: [
      ReversiItemCode.Reload,
      ReversiItemCode.Pigeon,
      ReversiItemCode.EightBall,
      ReversiItemCode.Email,
      ReversiItemCode.Jewel,
      ReversiItemCode.Rabbit,
      ReversiItemCode.GradCap,
      ReversiItemCode.Music,
      ReversiItemCode.Clipboard,
    ],
  },
  [ReversiPackCode.Chain]: {
    name: "チェインパック",
    desc: "前提が必要なアイテム",
    price: 0,
    items: [
      ReversiItemCode.BlackCat,
      ReversiItemCode.Chicken,
    ],
  },
  [ReversiPackCode.Deprecated]: {
    name: "もう使わないパック",
    desc: "没アイテム",
    price: 0,
    items: [
      ReversiItemCode.Nanameplus,
    ],
  },
  [ReversiPackCode.Orange]: {
    name: "オレンジパック",
    desc: "中立の石を扱うアイテムのパックです",
    price: 1,
    items: [
      ReversiItemCode.Orange,
      ReversiItemCode.Dmz,
      ReversiItemCode.Chick,
      ReversiItemCode.Chicken,
    ],
  },
  [ReversiPackCode.Zodiac1]: {
    name: "十二星座パック-I",
    desc: "メリットとデメリットを併せ持つアイテムのパックです",
    price: 50,
    items: [
      ReversiItemCode.Libra,
      ReversiItemCode.Aquarias,
      ReversiItemCode.Capricorn,
      ReversiItemCode.Pisces,
    ],
  },
  [ReversiPackCode.Vibes]: {
    name: "楽器隊パック",
    desc: "🎵バイブスを扱うアイテムのパックです",
    price: 100,
    items: [
      ReversiItemCode.Microphone,
      ReversiItemCode.Saxophone,
      ReversiItemCode.Accordion,
      ReversiItemCode.Guitar,
    ],
  },
  [ReversiPackCode.Banned]: {
    name: "プレミアム殿堂パック",
    desc: "デッキに1枚でも強すぎる「特別な切り札」だけに与えられる最強の称号",
    price: 1000,
    items: [
      ReversiItemCode.Bank,
    ],
  },
} as const;
