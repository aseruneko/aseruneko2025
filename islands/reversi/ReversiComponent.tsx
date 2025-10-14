import { useState } from "preact/hooks";
import { ReversiService } from "./ReversiService.ts";
import { useSignal } from "@preact/signals";
import { Reversi, ReversiState } from "../../models/reversi/Reversi.ts";
import { ReversiShopFunc } from "./ReversiShopFunc.ts";
import { ReversiStoneCode } from "../../models/reversi/ReversiStone.ts";
import { ReversiMusic, ReversiSoundService } from "./ReversiSoundService.ts";
import ReversiTofuComponent from "./tofu/ReversiTofuComponent.tsx";

export default function ReversiComponent() {
  const reversi = useSignal(Reversi.Default());
  const [sound] = useState(() => new ReversiSoundService());
  const [game] = useState(() => {
    return new ReversiService(reversi, globalThis.localStorage, sound);
  });

  const state = reversi.value.state;
  const board = reversi.value.board;
  const cells = board.board;
  return (
    <div class="reversi-component">
      <audio ref={sound.music.MAIN} src="mp3/reversi/main.mp3">
      </audio>
      <audio ref={sound.effect.GAME_CLEAR} src="mp3/reversi/game_clear.mp3">
      </audio>
      <audio ref={sound.effect.GAME_OVER} src="mp3/reversi/game_over.mp3">
      </audio>
      <audio ref={sound.effect.PURCHASE} src="mp3/reversi/purchase.mp3"></audio>
      <audio ref={sound.effect.PUT} src="mp3/reversi/put.mp3"></audio>
      <audio ref={sound.effect.REROLE} src="mp3/reversi/rerole.mp3"></audio>
      <audio ref={sound.effect.ROUND_CLEAR} src="mp3/reversi/round_clear.mp3">
      </audio>
      <audio ref={sound.effect.UNLOCK} src="mp3/reversi/unlock.mp3">
      </audio>
      <audio ref={sound.effect.START} src="mp3/reversi/start.mp3"></audio>
      <audio ref={sound.effect.PUT} src="mp3/reversi/put.mp3"></audio>
      <audio ref={sound.effect.RESET} src="mp3/reversi/reset.mp3"></audio>
      <audio ref={sound.effect.USE} src="mp3/reversi/use.mp3"></audio>
      <div class="audio">
        <div class="sliders">
          <p>
            <span>{game.version}</span>
            <span class="smartphone">Tablet/PC推奨</span>
          </p>
          <div class="slider">
            <b>BGM</b>
            <input
              ref={sound.musicVolRef}
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sound.soundVolume.value}
              onInput={() => sound.onChangeMusicVol()}
            />
          </div>
          <div class="slider">
            <b>SE</b>
            <input
              ref={sound.effectVolRef}
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={sound.effectVolume.value}
              onInput={() => sound.onChangeEffectVol()}
            />
          </div>
        </div>
        <div class="buttons">
          {!game.sound.playing.value &&
            (
              <button
                type="button"
                onClick={() => {
                  game.onClickStartMusic();
                  game.sound.begin(ReversiMusic.Main);
                }}
              >
                ▶️ BGM
              </button>
            )}
          {game.sound.playing.value &&
            (
              <button
                type="button"
                onClick={() => game.sound.stop()}
              >
                ⏸️ BGM
              </button>
            )}
        </div>
      </div>
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
                            <div>{cell.stone.icon}</div>
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
          <div class="not-inventory">
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
              <p class="money">
                <span>🪙{reversi.value.coins}</span>
                {reversi.value.vibes > 0 && <span>🎵{reversi.value.vibes}
                </span>}
              </p>
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
      <ReversiTofuComponent tofu={game.tofu!}></ReversiTofuComponent>
      <div class="my-score">
        <p>
          <span>図鑑ができました👉️</span>
          <a
            href="reversi/library"
            target="_blank"
            onClick={() => game.onClickLibrary()}
          >
            🎓図鑑（新しいタブで開く）
          </a>
        </p>
        <p>
          <span>プレイ記録を貼り付けて友達を驚かせましょう！</span>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard.writeText(game.playLog()).then(() => {
                game.onClickCopy();
                globalThis.alert("コピーしました");
              })}
          >
            📋️コピー
          </button>
        </p>
        <textarea id="myScore">{game.playLog()}</textarea>
      </div>
      <div class="done">
        <b>v0.1.1b</b>
        <p>・嘘の説明文を修正</p>
        <p>・🎷が重複しないバグを修正</p>
        <p>・📋が重複アイテムになっていたバグを修正</p>
        <p>・⬛と⬜モノリスは重複アイテムになりました</p>
        <p>・🎤🎷🪗にテコ入れ</p>
        <b>v0.1.1</b>
        <p>・InternalServerErrorの修正</p>
        <b>v0.1.0</b>
        <p>・🔥炎上豆腐店🔥を追加</p>
        <p>・オレンジパック（🍊🌻🐤🐔）の追加</p>
        <p>・十二星座パック（♎♒♑♓）の追加</p>
        <p>・楽器隊パック（🎤🎷🪗🎸）の追加</p>
        <p>・プレミアム殿堂パック（🏦）の追加</p>
        <p>・🈂️1️⃣2️⃣の追加</p>
        <b>v0.0.4a</b>
        <p>・図鑑がネタバレをしないように変更</p>
        <p>・🎓📋️🎶追加。要解禁</p>
        <b>v0.0.4</b>
        <p>・図鑑を追加</p>
        <p>・一番最初だけリロールコストを0にした</p>
        <p>・最大ログ件数を7から100にした</p>
        <p>・🛒の効果量を2から3に変更</p>
        <p>・🐑🌕⏫追加</p>
        <p>・🐈‍⬛追加。🐀購入後にのみ出現します</p>
        <p>・🐔追加。🐤購入後にのみ出現します</p>
        <p>・🐇♑♓追加。要解禁</p>
        <p>・スマートフォン向け調整</p>
        <b>v0.0.3</b>
        <p>・スマートフォン対応</p>
        <p>・BGMとSEの追加</p>
        <p>・初期コインを10から15に変更</p>
        <p>・プレイ記録にバージョンを記載</p>
        <p>・石のアイコンがズレて表示されるのを軽減</p>
        <b>v0.0.2</b>
        <p>・初期アイテム枠を5から6に変更。バランス微調整。</p>
        <p>・🔨追加。</p>
        <p>・🕊️♎🐤追加。要解禁</p>
      </div>
    </div>
  );
}
