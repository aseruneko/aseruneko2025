import {
  Reversi,
  ReversiDefaultShopSlot,
} from "../../models/reversi/Reversi.ts";
import {
  ReversiItem,
  ReversiItemCode,
  ReversiItems,
} from "../../models/reversi/ReversiItem.ts";
import { random } from "../../models/shared/Random.ts";
import { ReversiService } from "./ReversiService.ts";

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
      reversi.coins -= reversi.reroleCost;
      reversi.reroleCost = Math.ceil(reversi.reroleCost * 1.2);
      game.reversi = reversi;
      this.unlock(game, ReversiItemCode.Reload);
    }
  },
  purchaseItem(game: ReversiService, code: ReversiItemCode) {
    const shop = game.reversi.shop;
    const inv = game.reversi.inventory;
    const toBuy = shop.get(code);
    if (!toBuy) return;
    if (game.reversi.coins < toBuy.price) return;
    if (toBuy.code === ReversiItemCode.Mail) {
      this.unlock(game, ReversiItemCode.Email);
    }
    if (toBuy.code === ReversiItemCode.Ring) {
      this.unlock(game, ReversiItemCode.Jewel);
    }
    if (toBuy.code === ReversiItemCode.EightBall) {
      this.unlock(game, ReversiItemCode.Pigeon);
    }
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
    game.reversi = { ...game.reversi, shop, inventory: inv };
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
  unlock(game: ReversiService, code: ReversiItemCode) {
    console.log(code);
    const toUnlock = of(code);
    if (game.reversi.unlocked.has(code)) return;
    if (toUnlock) {
      const saved = (game.localStorage.getItem("reversiUnlockedItems")?.split(
        "/",
      ) ?? []) as ReversiItemCode[];
      game.localStorage.setItem(
        "reversiUnlockedItems",
        saved.concat(toUnlock.code).join("/"),
      );
      game.reversi.unlocked.add(toUnlock.code);
      game.log(`${toUnlock.icon}${toUnlock.name}がアンロック！`);
    }
  },
};

function addRandomItems(game: ReversiService, n: number) {
  for (let i = 0; i < n; i++) {
    addRandomItem(game);
  }
}

function addRandomItem(game: ReversiService) {
  const pool: Set<ReversiItemCode> = new Set([...game.reversi.unlocked]);
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

function of(code: ReversiItemCode | undefined) {
  return ReversiItems.find((item) => item.code === code);
}

function adjustPrice(game: ReversiService, item: ReversiItem) {
  return {
    ...item,
    price: item.price * (2 ** (game.has(item.code)?.amount ?? 0)),
  };
}
