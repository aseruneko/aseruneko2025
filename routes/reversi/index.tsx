import { Head } from "fresh/runtime";
import { define } from "@/utils.ts";
import ReversiComponent from "../../islands/reversi/ReversiComponent.tsx";

export default define.page(function ReversiPage() {
  return (
    <div class="page">
      <Head>
        <title>GreedyReversi</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;900&display=swap"
          rel="stylesheet"
        />
        <link href="css/reversi.css" rel="stylesheet" />
      </Head>
      <main>
        <section class="title">
          <h1>GreedyReversi</h1>
        </section>
        <section class="description">
          <p>
            ・ローグライトリバーシです。「アイテムを購入して、リバーシをプレイして、要求スコア💠を満たす」を8回繰り返すとクリアです。
          </p>
          <p>
            ・あなたは先手（黒）です。盤面が埋まるか、あなたがパスすると、そのラウンドが終了します。
          </p>
          <p>
            ・後手（白）は必ず最もスコア💠を多く獲得できる場所に白石を配置します。複数ある場合は盤面の上側を優先。次は左側を優先します。
          </p>
          <p>
            ・獲得スコア💠は (反転した石のスコア💠の総和) x (反転した石の数)
            です。獲得コイン🪙は (反転した石のコイン🪙の総和) です。
          </p>
          <p>
            ・盤面は4x4から開始され、ラウンドごとに横と縦が交互に拡張されます。
          </p>
          <p>・バージョン: 0.0.3</p>
        </section>
        <section class="game">
          <ReversiComponent></ReversiComponent>
        </section>
      </main>
      <footer>
        <a href="https://x.com/aseruneko">@aseruneko</a>
      </footer>
    </div>
  );
});
