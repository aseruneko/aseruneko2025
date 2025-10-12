import {
  Reversi,
  ReversiDefaultShopSlot,
} from "../../models/reversi/Reversi.ts";
import {
  ReversiItem,
  ReversiItemCode,
  ReversiItems,
} from "../../models/reversi/ReversiItem.ts";
import {
  ReversiItemChain,
  ReversiPurchasingChain,
} from "../../models/reversi/ReversiTofu.ts";
import { random } from "../../models/shared/Random.ts";
import { ReversiService } from "./ReversiService.ts";
import { ReversiEffect } from "./ReversiSoundService.ts";

type Shop = Reversi["shop"];
export const ReversiShopFunc = {
  setShop(game: ReversiService, shop: Shop) {
    game.reversi = { shop: shop };
  },
  clearShop(game: ReversiService) {
    game.reversi.shop.clear();
    game.reversi = { shop: game.reversi.shop };
  },
  pushItem(game: ReversiService, item: ReversiItem) {
    const shop = game.reversi.shop;
    shop.set(item.code, item);
    this.setShop(game, shop);
  },
  rerole(game: ReversiService, isFree = false) {
    const reversi = game.reversi;
    if (!isFree && reversi.coins < reversi.reroleCost) return;
    this.clearShop(game);
    const slot = ReversiDefaultShopSlot +
      (game.has(ReversiItemCode.Cart)?.currentValue ?? 0);
    addRandomItems(game, slot);
    if (!isFree) {
      game.sound.play(ReversiEffect.Rerole);
      reversi.coins -= reversi.reroleCost;
      reversi.reroleCost = Math.ceil(reversi.reroleCost * 1.2);
      game.reversi = reversi;
      game.tofu.unlockItem(ReversiItemCode.Reload);
    }
  },
  purchaseItem(game: ReversiService, code: ReversiItemCode) {
    const shop = game.reversi.shop;
    const inv = game.reversi.inventory;
    const toBuy = shop.get(code);
    if (!toBuy) return;
    if (game.reversi.coins < toBuy.price) return;
    game.sound.play(ReversiEffect.Purchase);
    game.tofu.tofuable.value = false;
    const chained = ReversiPurchasingChain[code];
    (chained ?? []).map((chain) => {
      game.tofu.unlockItem(chain);
    });
    const itemChained = ReversiItemChain[code];
    (itemChained ?? []).map((chain) => {
      game.tofu.unlockItem(chain);
    });
    shop.delete(code);
    game.reversi.coins -= toBuy.price;
    const baught = inv.get(code);
    if (baught) {
      inv.set(code, {
        ...baught,
        currentValue: (baught.currentValue ?? 0) + (toBuy.value ?? 0),
        amount: (baught.amount ?? 0) + 1,
      });
    } else {
      inv.set(code, {
        ...toBuy,
        currentValue: toBuy.value,
        amount: 1,
      });
    }
    if (game.reversi.reroleCost === 0) {
      game.reversi.reroleCost = 5;
    }
    game.reversi = { ...game.reversi, shop, inventory: inv };
    game.calcItemPool();
    applyClipboard(game, toBuy.code);
    applyMicrophone(game, toBuy.code);
    applySaxophone(game, toBuy.code);
    applyAccordion(game, toBuy.code);
    applyGuitar(game, toBuy.code);
  },
  shopItemDesc(item: ReversiItem) {
    return item.desc.replace("$v", (item.value ?? 0).toString());
  },
  inventoryItemDesc(item: ReversiItem) {
    if (item.currentValue === item.value) {
      return item.desc.replace("$v", `${item.currentValue}`);
    } else {
      return item.desc.replace("$v", `${item.currentValue}(${item.value})`);
    }
  },
  reactivate(game: ReversiService, code: ReversiItemCode) {
    const item = game.has(code);
    if (!item || item.used === undefined) return;
    const inv = game.reversi.inventory;
    inv.set(code, {
      ...item,
      used: false,
    });
    game.reversi = { inventory: inv };
  },
  replenish(game: ReversiService) {
    const inv = game.reversi.inventory;
    [...inv.values()].map((item) => {
      if (item.used === undefined) return;
      inv.set(item.code, {
        ...item,
        currentValue: (item.value ?? 0),
      });
    });
    game.reversi = { inventory: inv };
  },
};

function addRandomItems(game: ReversiService, n: number) {
  for (let i = 0; i < n; i++) {
    addRandomItem(game);
  }
}

function addRandomItem(game: ReversiService) {
  const pool: Set<ReversiItemCode> = new Set([...game.reversi.itemPool]);
  [...game.reversi.shop.values()].map((item) => {
    pool.delete(item.code);
  });
  [...game.reversi.inventory.values()].map((item) => {
    if (item.isUnique) pool.delete(item.code);
  });
  const codeToAdd = random([...pool]);
  const itemToAdd = codeToAdd && of(codeToAdd);
  if (itemToAdd) ReversiShopFunc.pushItem(game, adjustPrice(game, itemToAdd));
}

function addItem(game: ReversiService, code: ReversiItemCode) {
  const pool: Set<ReversiItemCode> = new Set([...game.reversi.itemPool]);
  [...game.reversi.shop.values()].map((item) => {
    pool.delete(item.code);
  });
  [...game.reversi.inventory.values()].map((item) => {
    if (item.isUnique) pool.delete(item.code);
  });
  const itemToAdd = of(code);
  if (itemToAdd && pool.has(code)) {
    ReversiShopFunc.pushItem(game, adjustPrice(game, itemToAdd));
  }
}

function of(code: ReversiItemCode | undefined) {
  return ReversiItems.find((item) => item.code === code);
}

function adjustPrice(game: ReversiService, item: ReversiItem) {
  let price = item.price * (2 ** (game.has(item.code)?.amount ?? 0));
  if (game.has(ReversiItemCode.Katakana)) {
    if (/[ァ-ヴ]/.test(item.name)) {
      price = Math.ceil(price / 2);
    } else {
      price = price * 2;
    }
  }
  return {
    ...item,
    price,
  };
}

function applyClipboard(game: ReversiService, code: ReversiItemCode) {
  if (!game.has(ReversiItemCode.Clipboard)) return;
  addItem(game, code);
}

function applyMicrophone(game: ReversiService, code: ReversiItemCode) {
  if (code !== ReversiItemCode.Microphone) return;
  const microphone = of(code);
  if (!microphone) return;
  game.log(`${microphone.icon}${microphone.name}により🎵1を獲得`);
  game.reversi = { vibes: game.reversi.vibes + 1 };
}

function applySaxophone(game: ReversiService, code: ReversiItemCode) {
  if (code !== ReversiItemCode.Saxophone) return;
  const saxophone = of(code);
  if (!saxophone) return;
  game.log(`${saxophone.icon}${saxophone.name}により🎵1を獲得`);
  game.reversi = { vibes: game.reversi.vibes + 1 };
}

function applyAccordion(game: ReversiService, code: ReversiItemCode) {
  if (code !== ReversiItemCode.Accordion) return;
  const accordion = of(code);
  if (!accordion) return;
  game.log(`${accordion.icon}${accordion.name}により🎵1を獲得`);
  game.reversi = { vibes: game.reversi.vibes + 1 };
}

function applyGuitar(game: ReversiService, code: ReversiItemCode) {
  if (code !== ReversiItemCode.Guitar) return;
  const guitar = of(code);
  if (!guitar) return;
  game.log(`${guitar.icon}${guitar.name}により🎵1を獲得`);
  game.reversi = { vibes: game.reversi.vibes + 1 };
}
