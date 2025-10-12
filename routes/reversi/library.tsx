import { Head } from "fresh/runtime";
import { define } from "@/utils.ts";
import ReversiLibraryComponent from "../../islands/reversi/ReversiLibraryComponent.tsx";

export default define.page(function ReveriLibraryPage() {
  return (
    <div class="page">
      <Head>
        <title>図鑑 | GreedyReversi</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;900&display=swap"
          rel="stylesheet"
        />
        <link href="../css/reversi.css" rel="stylesheet" />
      </Head>
      <main>
        <section class="title">
          <h1>GreedyReversi 図鑑</h1>
        </section>
        <section class="game">
          <ReversiLibraryComponent></ReversiLibraryComponent>
        </section>
      </main>
      <footer>
        <a href="https://x.com/aseruneko">@aseruneko</a>
      </footer>
    </div>
  );
});
