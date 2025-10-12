import { ReversiItemCode } from "./ReversiItem.ts";
import { ReversiPackCode } from "./ReversiPack.ts";

export interface ReversiTofu {
  value: number;
  shopUnlocked: boolean;
  unlockedItems: ReversiItemCode[];
  unlockedEmblems: ReversiItemCode[];
  unlockedPacks: ReversiPackCode[];
  purchasedEmblems: ReversiItemCode[];
  purchasedPacks: ReversiPackCode[];
  activePacks: ReversiPackCode[];
  activeEmblems: ReversiItemCode[];
}
export const ReversiTofu = {
  StorageKey: "reversiTofu",
  Initial(): ReversiTofu {
    return {
      value: 0,
      shopUnlocked: false,
      unlockedItems: [],
      unlockedEmblems: [],
      unlockedPacks: [],
      purchasedEmblems: [],
      purchasedPacks: [],
      activePacks: [],
      activeEmblems: [],
    };
  },
} as const;

export const ReversiPurchasingChain: Partial<
  Record<
    ReversiItemCode,
    ReversiItemCode[]
  >
> = {
  [ReversiItemCode.Mail]: [ReversiItemCode.Email],
  [ReversiItemCode.Ring]: [ReversiItemCode.Jewel],
  [ReversiItemCode.EightBall]: [ReversiItemCode.Pigeon],
  [ReversiItemCode.Sheep]: [ReversiItemCode.Rabbit],
} as const;

export const ReversiItemChain: Partial<
  Record<
    ReversiItemCode,
    ReversiItemCode[]
  >
> = {
  [ReversiItemCode.BlackCat]: [ReversiItemCode.Rat],
  [ReversiItemCode.Chicken]: [ReversiItemCode.Chick],
} as const;
