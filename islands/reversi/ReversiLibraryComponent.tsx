import { ReversiItems } from "../../models/reversi/ReversiItem.ts";
import {
  ReversiColor,
  ReversiStone,
} from "../../models/reversi/ReversiStone.ts";
import { ReversiShopFunc } from "./ReversiShopFunc.ts";

export default function ReversiLibraryComponent() {
  return (
    <div class="reversi-library-component">
      <div class="desc">
        <p>全てのアイテムと石のリストです</p>
        <p class="alert">未解禁のものもあるのでネタバレ注意！</p>
        <p class="alert">没アイテムもあります！</p>
      </div>
      <div class="items-desc">
        <p>アイテム（全{ReversiItems.length}種）</p>
      </div>
      <div class="items shop">
        {[...Object.values(ReversiItems)].map((item, i) => {
          return (
            <div class="shop-item" key={i}>
              <div class="icon-and-name">
                <p class="icon">{item.icon}</p>
                <div>
                  <p class="name">
                    <span>{item.name}</span>
                    {!item.isUnique && (
                      <span class="tooltip">
                        [重複]
                        <div class="tooltip-text">
                          <b>重複</b>
                          <p>
                            このアイテムは複数回購入することができ、効果が蓄積していきます。
                          </p>
                          <p>ただし、購入の度に値段が倍になります。</p>
                        </div>
                      </span>
                    )}
                    {item.used !== undefined && (
                      <span class="tooltip">
                        [発動]
                        <div class="tooltip-text">
                          <b>発動</b>
                          <p>
                            このアイテムはアイテム欄をクリックすると効果が適用されます。
                          </p>
                          <p>
                            使用回数はラウンド終了時に回復します。
                          </p>
                        </div>
                      </span>
                    )}
                  </p>
                  <p class="desc">{ReversiShopFunc.shopItemDesc(item)}</p>
                </div>
              </div>
              <button
                type="button"
                disabled
              >
                🪙{item.price}
              </button>
            </div>
          );
        })}
      </div>
      <div class="stones-desc">
        <p>石（全{[...Object.values(ReversiStone)].length}種）</p>
      </div>
      <div class="stones shop">
        {[...Object.values(ReversiStone)].map((stone, i) => {
          return (
            <div class="shop-item" key={i}>
              <div class="icon-and-name">
                <p class="icon">{stone.icon}</p>
                <div>
                  <p class="name">
                    <span>{stone.name}</span>
                  </p>
                  <p class="desc">
                    <p>
                      💠{stone.score}🪙{stone.coin} -{" "}
                      {stone.color === ReversiColor.Black
                        ? "黒"
                        : stone.color === ReversiColor.White
                        ? "白"
                        : "中立"}
                    </p>
                    <p>{stone.desc}</p>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
