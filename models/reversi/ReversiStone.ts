export interface ReversiStone {
  color: ReversiColor;
  code: ReversiStoneCode;
  score: number;
  coin: number;
  icon: string;
  name: string;
  desc: string;
  state?: ReversiStoneState;
}

export const ReversiColor = {
  Black: "BLACK",
  White: "WHITE",
  Neutral: "NEUTRAL",
} as const;
export type ReversiColor = (typeof ReversiColor)[keyof typeof ReversiColor];

export const ReversiStoneCode = {
  Black: "BLACK",
  White: "WHITE",
  Moai: "MOAI",
  EightBall: "EIGHT_BALL",
  Mail: "MAIL",
  Email: "E_MAIL",
  Ring: "RING",
  Jewel: "JEWEL",
  Orange: "ORANGE",
  Rat: "RAT",
  Sunflower: "SUNFLOWER",
  Chick: "CHICK",
  BlackCat: "BLACK_CAT",
  Chicken: "CHICKEN",
  Prohibited: "PROHIBITED",
  Sheep: "SHEEP",
  Rabbit: "RABBIT",
};
export type ReversiStoneCode =
  (typeof ReversiStoneCode)[keyof typeof ReversiStoneCode];

export type ReversiStoneState = never;

export const ReversiStone: { [p in string]: ReversiStone } = {
  Black: {
    color: ReversiColor.Black,
    code: ReversiStoneCode.Black,
    score: 1,
    coin: 1,
    icon: "⚫️",
    name: "黒石",
    desc: "効果なし",
  },
  Moai: {
    color: ReversiColor.Black,
    code: ReversiStoneCode.Moai,
    score: 1,
    coin: 1,
    icon: "🗿",
    name: "モアイ",
    desc: "反転されない",
  },
  EightBall: {
    color: ReversiColor.Black,
    code: ReversiStoneCode.EightBall,
    score: 1,
    coin: 1,
    icon: "🎱",
    name: "エイトボール",
    desc: "反転されない",
  },
  Rat: {
    color: ReversiColor.Black,
    code: ReversiStoneCode.Rat,
    score: 1,
    coin: 1,
    icon: "🐀",
    name: "ネズミ",
    desc: "白番終了時に💠1を生産",
  },
  BlackCat: {
    color: ReversiColor.Black,
    code: ReversiStoneCode.BlackCat,
    score: 1,
    coin: 1,
    icon: "🐈‍⬛",
    name: "黒猫",
    desc: "白番終了時に💠(🐀の数)を生産",
  },
  White: {
    color: ReversiColor.White,
    code: ReversiStoneCode.White,
    score: 1,
    coin: 1,
    icon: "⚪️",
    name: "白石",
    desc: "効果なし",
  },
  Mail: {
    color: ReversiColor.White,
    code: ReversiStoneCode.Mail,
    score: 3,
    coin: 1,
    icon: "✉️",
    name: "郵便物",
    desc: "効果なし",
  },
  Email: {
    color: ReversiColor.White,
    code: ReversiStoneCode.Email,
    score: 5,
    coin: 1,
    icon: "📧",
    name: "e-mail",
    desc: "効果なし",
  },
  Ring: {
    color: ReversiColor.White,
    code: ReversiStoneCode.Ring,
    score: 1,
    coin: 3,
    icon: "💍",
    name: "指輪",
    desc: "効果なし",
  },
  Jewel: {
    color: ReversiColor.White,
    code: ReversiStoneCode.Jewel,
    score: 1,
    coin: 5,
    icon: "💎",
    name: "宝石",
    desc: "効果なし",
  },
  Sheep: {
    color: ReversiColor.White,
    code: ReversiStoneCode.Sheep,
    score: 2,
    coin: 2,
    icon: "🐑",
    name: "迷える子羊",
    desc: "白番終了時に可能なら左に動く",
  },
  Rabbit: {
    color: ReversiColor.White,
    code: ReversiStoneCode.Rabbit,
    score: 3,
    coin: 3,
    icon: "🐇",
    name: "わんぱくウサギ",
    desc: "白番終了時に可能なら上に自身を複製",
  },
  Prohibited: {
    color: ReversiColor.Neutral,
    code: ReversiStoneCode.Prohibited,
    score: 1,
    coin: 0,
    icon: "🚫",
    name: "進入禁止",
    desc: "効果なし",
  },
  Orange: {
    color: ReversiColor.Neutral,
    code: ReversiStoneCode.Orange,
    score: 5,
    coin: 5,
    icon: "🍊",
    name: "オレンジ",
    desc: "効果なし",
  },
  Sunflower: {
    color: ReversiColor.Neutral,
    code: ReversiStoneCode.Sunflower,
    score: 2,
    coin: 2,
    icon: "🌻",
    name: "ヒマワリ",
    desc: "白番終了時に💠2を生産",
  },
  Chick: {
    color: ReversiColor.Neutral,
    code: ReversiStoneCode.Chick,
    score: 1,
    coin: 0,
    icon: "🐤",
    name: "ひよこ陛下",
    desc: "白番終了時に💠2を生産",
  },
  Chicken: {
    color: ReversiColor.Neutral,
    code: ReversiStoneCode.Chicken,
    score: 1,
    coin: 0,
    icon: "🐔",
    name: "にわとり上皇",
    desc: "白番終了時に🪙(🐤の数)を生産",
  },
} as const;
