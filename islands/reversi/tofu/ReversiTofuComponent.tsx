import {
  ReversiItem,
  ReversiItemCode,
  ReversiItems,
} from "../../../models/reversi/ReversiItem.ts";
import { ReversiPacks } from "../../../models/reversi/ReversiPack.ts";
import { ReversiTofuService } from "../tofu/ReversiTofuService.ts";
import { ReversiShopFunc } from "../ReversiShopFunc.ts";

interface Props {
  tofu: ReversiTofuService;
}

export default function ReversiTofuComponent(props: Props) {
  const tofu = props.tofu;
  return (
    <div class="tofu-component">
      {tofu.isShopOpen && (
        <div class="tofu-shop">
          <div class="header">
            <h2>🔥炎上豆腐店🔥</h2>
            <p>📛{tofu.tofu.value.value}</p>
          </div>
          <div class="desc">
            <p>
              プレイ終了時にラウンド数に応じて📛が貰えます。クリアすると更に📛が貰えます。📛はゲームを閉じても保存されます。
            </p>
            <p class="lore">――📛が燃えてる豆腐に見えるという話です。</p>
          </div>
          <hr />
          <div class="category">
            <div class="desc">
              <h3>🥡パック🥡</h3>
              <p>
                幾つかのアイテムを纏めたパック🥡です。纏めて出現を制御できます。
              </p>
              <p class="lore">――実装アイテムが増えてもビルドが組める✌️</p>
            </div>
            <div class="packs">
              {tofu.tofu.value.unlockedPacks.map((pack, i) => {
                return (
                  <div class="pack" key={i}>
                    <div class="left">
                      <h4>{ReversiPacks[pack].name}</h4>
                      <p>{ReversiPacks[pack].desc}</p>
                    </div>
                    <div class="center">
                      {ReversiPacks[pack].items.map((item, j) => {
                        return (
                          <div class="icon tooltip" key={j}>
                            <p>{of(item)?.icon}</p>{" "}
                            <div class="tofu-item tooltip-text">
                              <div class="name-and-tag">
                                <p class="name">{of(item)!.name}</p>
                                <p class="tag">
                                  {of(item)!.isUnique
                                    ? of(item)!.used === undefined
                                      ? ""
                                      : "[発動]"
                                    : "[重複]"}
                                </p>
                              </div>
                              <p>
                                {ReversiShopFunc.inventoryItemDesc(of(item)!)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div class="right">
                      {tofu.tofu.value.purchasedPacks.includes(pack)
                        ? tofu.tofu.value.activePacks.includes(pack)
                          ? (
                            <div>
                              <p>✔️</p>
                              <button
                                type="button"
                                disabled={!tofu.tofuable.value}
                                onClick={() => tofu.disablePack(pack)}
                              >
                                無効化
                              </button>
                            </div>
                          )
                          : (
                            <div>
                              <p>❌</p>
                              <button
                                type="button"
                                disabled={!tofu.tofuable.value}
                                onClick={() => tofu.enablePack(pack)}
                              >
                                有効化
                              </button>
                            </div>
                          )
                        : (
                          <button
                            type="button"
                            disabled={!tofu.tofuable.value ||
                              ReversiPacks[pack].price >
                                tofu.tofu.value.value}
                            onClick={() => tofu.purchasePack(pack)}
                          >
                            📛{ReversiPacks[pack].price}
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <hr />
          <div class="category">
            <div class="desc">
              <h3>⏺️紋章⏺️</h3>
              <p>
                有効にすると、初めからこの紋章⏺️を所持した状態で始まります。
              </p>
              <p class="lore">――アセンション。ステークス。クルーシボール。</p>
            </div>
            <div class="emblems">
              {tofu.tofu.value.unlockedEmblems.map((emblem, i) => {
                const item = ReversiItems.find((i) => i.code === emblem)!;
                return (
                  <div class="emblem" key={i}>
                    <div class="left">
                      <p class="icon">{item.icon}</p>
                    </div>
                    <div class="center">
                      <p class="name">
                        {item.name}
                      </p>
                      <p class="desc">
                        {ReversiShopFunc.inventoryItemDesc(item)}
                      </p>
                    </div>
                    <div class="right">
                      {tofu.tofu.value.purchasedEmblems.includes(emblem)
                        ? tofu.tofu.value.activeEmblems.includes(emblem)
                          ? (
                            <div>
                              <p>✔️</p>
                              <button
                                type="button"
                                disabled={!tofu.tofuable.value}
                                onClick={() => tofu.disableEmblem(emblem)}
                              >
                                無効化
                              </button>
                            </div>
                          )
                          : (
                            <div>
                              <p>❌</p>
                              <button
                                type="button"
                                disabled={!tofu.tofuable.value}
                                onClick={() => tofu.enableEmblem(emblem)}
                              >
                                有効化
                              </button>
                            </div>
                          )
                        : (
                          <button
                            type="button"
                            disabled={!tofu.tofuable.value ||
                              item.price >
                                tofu.tofu.value.value}
                            onClick={() => tofu.purchaseEmblem(emblem)}
                          >
                            📛{item.price}
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function of(code: ReversiItemCode): ReversiItem | undefined {
  const item = ReversiItems.find((item) => item.code === code);
  if (item) return { ...item, currentValue: item.value };
}
