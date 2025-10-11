import { useState } from "preact/hooks";
import { ReversiService } from "./ReversiService.ts";
import { useSignal } from "@preact/signals";
import { Reversi, ReversiState } from "../../models/reversi/Reversi.ts";
import { ReversiShopFunc } from "./ReversiShopFunc.ts";
import { ReversiStoneCode } from "../../models/reversi/ReversiStone.ts";

export default function ReversiComponent() {
  const reversi = useSignal(Reversi.Default());
  const [game] = useState(() =>
    new ReversiService(reversi, globalThis.localStorage)
  );
  const state = reversi.value.state;
  const board = reversi.value.board;
  const cells = board.board;
  return (
    <div class="reversi-component">
      <div class="reversi">
        <div class="left">
          <div class="board">
            {cells.map((row, y) => {
              return (
                <div class="row" key={y}>
                  {row.map((cell, x) => {
                    return (
                      <div
                        class={game.isClickable(x, y)
                          ? "cell clickable"
                          : "cell"}
                        onClick={() => game.onClick(x, y)}
                        key={x}
                      >
                        {cell.stone && (
                          <div class={"tooltip stone " + cell.stone.color}>
                            <span>{cell.stone.icon}</span>
                            {cell.stone.code !== ReversiStoneCode.Black &&
                              cell.stone.code !== ReversiStoneCode.White &&
                              (
                                <div class="tooltip-text">
                                  <b>{cell.stone.name}</b>
                                  <p>💠{cell.stone.score}🪙{cell.stone.coin}</p>
                                  <p>{cell.stone.desc}</p>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div class="logs">
            {reversi.value.logs.map((line, i) => {
              return (
                <p key={i}>
                  <span>{"[" + line.timestamp + "] "}</span>
                  <span>{line.text}</span>
                </p>
              );
            })}
          </div>
        </div>
        <div class="right">
          <div class="game-state">
            <div class="left">
              {state === ReversiState.Interval &&
                (
                  <div>
                    <p>今は {reversi.value.round} ラウンド目</p>
                    <p>準備ができたらボタン🔘を押そう👉️</p>
                    <p>目標スコア：💠{reversi.value.goalScore}</p>
                  </div>
                )}
              {state === ReversiState.InRound &&
                (
                  <div>
                    <p>今は {reversi.value.round} ラウンド目</p>
                    <p>現在スコア：💠{reversi.value.score}</p>
                    <p>目標スコア：💠{reversi.value.goalScore}</p>
                  </div>
                )}
              {state === ReversiState.GameClear &&
                (
                  <div>
                    <p>🎉ゲームクリア おめでとうございます🎉</p>
                    <p>総獲得スコア：💠{reversi.value.totalScore}</p>
                    <p>総獲得コイン：🪙{reversi.value.totalCoins}</p>
                  </div>
                )}
              {state === ReversiState.GameOver &&
                (
                  <div>
                    <p>😞ゲームオーバー 次は頑張ろう😞</p>
                    <p>総獲得スコア：💠{reversi.value.totalScore}</p>
                    <p>総獲得コイン：🪙{reversi.value.totalCoins}</p>
                  </div>
                )}
            </div>
            <div class="right">
              {(state === ReversiState.InRound ||
                state === ReversiState.Interval) && (
                <button
                  type="button"
                  onClick={() => game.startRound()}
                  disabled={state !== ReversiState.Interval}
                >
                  💥開始💥
                </button>
              )}
              {(state === ReversiState.GameClear ||
                state === ReversiState.GameOver) && (
                <button
                  type="button"
                  onClick={() => game.onClickReset()}
                >
                  🔃リセット🔃
                </button>
              )}
            </div>
          </div>
          <div class="shop-state">
            <p class="money">🪙{reversi.value.coins}</p>
            <button
              type="button"
              disabled={game.isReroleDisabled()}
              onClick={() => game.onClickRerole()}
            >
              リロール 🪙{reversi.value.reroleCost}
            </button>
          </div>
          <div class="shop">
            {[...reversi.value.shop.values()].map((item, i) => {
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
                    disabled={game.isPurchaseDisabled(item.code)}
                    onClick={() => game.onClickPurchase(item.code)}
                  >
                    🪙{item.price}
                  </button>
                </div>
              );
            })}
          </div>
          <div class="inventory">
            {[...reversi.value.inventory.values()].map((item, i) => {
              return (
                <div
                  class={"inventory-item tooltip" +
                    (item.used !== undefined ? " clickable" : "") +
                    (game.isUsable(item) ? "" : " disabled")}
                  key={i}
                  onClick={() => game.onClickUse(item)}
                >
                  <p class="icon">{item.icon}</p>
                  <div class="tooltip-text">
                    <b>{item.name}</b>
                    <p>{ReversiShopFunc.inventoryItemDesc(item)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div class="my-score">
        <p>
          <span>プレイ記録を貼り付けて友達を驚かせましょう！</span>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard.writeText(game.playLog()).then(() =>
                globalThis.alert("コピーしました")
              )}
          >
            📋️コピー
          </button>
        </p>
        <textarea id="myScore">{game.playLog()}</textarea>
      </div>
      <div class="done">
        <b>v0.0.2</b>
        <p>・初期アイテム枠を5から6に変更。バランス微調整。</p>
        <p>・🔨追加。🕊️♎🐤追加（プレイ後に解禁）</p>
      </div>
      <div class="todo">
        <b>やりたいことリスト</b>
        <p>・難易度調整</p>
        <p>・アイテム増やす</p>
        <p>・効果音ならす</p>
      </div>
    </div>
  );
}
