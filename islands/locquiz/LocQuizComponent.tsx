import { signal } from "@preact/signals";
import { useState } from "preact/hooks";
import { random } from "../../models/shared/Random.ts";
import "./LocQuizComponent.css";

export default function LocQuizComponent() {
  const [quiz] = useState(() => new Quiz());
  return (
    <div class="loc-quiz">
      <div>ポイント:{quiz.point.value}</div>
      {!quiz.gameOver.value && <div>Q{quiz.stage.value + 1}/10</div>}
      {QuizComponent(quiz)}
      {quiz.gameOver.value && (
        <button onClick={() => quiz.reset()}>リセット</button>
      )}
    </div>
  );
}

function QuizComponent(quiz: Quiz) {
  let q = quiz.quiz[quiz.stage.value];
  if (q) {
    return (
      <div class="quiz">
        <div class="desc">{q.desc}</div>
        <input type="text" id="answer"></input>
        <button onClick={() => quiz.submit()}>回答</button>
      </div>
    );
  }
}

class Quiz {
  public quiz: Abnormality[] = [];
  public stage = signal(0);
  public point = signal(0);
  public gameOver = signal(false);

  constructor() {
    this.reset();
  }

  submit() {
    const text = (document.querySelector("#answer") as HTMLInputElement).value;
    if (text === this.quiz[this.stage.value].ja) {
      this.point.value += 10;
    }
    (document.querySelector("#answer") as HTMLInputElement).value = "";
    this.stage.value++;
    if (this.stage.value == 10) {
      this.gameOver.value = true;
    }
  }

  reset() {
    let quiz: Abnormality[] = [];
    for (let i = 0; i < 10; i++) {
      const q = random(Abnormalities);
      if (q) {
        quiz.push({
          id: q[0],
          en: q[1],
          ja: q[2],
          code: q[3],
          type: q[4],
          level: q[5],
          desc: q[6],
        });
      }
    }
    this.quiz = quiz;
    this.gameOver.value = false;
    this.stage.value = 0;
    this.point.value = 0;
  }
}

interface Abnormality {
  id: number;
  en: string;
  ja: string;
  code: string;
  type: string;
  level: string;
  desc: string;
}

const Abnormalities: [
  number,
  string,
  string,
  string,
  string,
  string,
  string,
][] = [[
  0,
  "Standard Training-Dummy Rabbit",
  "教育用 ウサギロボ",
  "0-00-00",
  "RED",
  "TETH",
  "新しい管理人たちの教育用に作られた\n疑似アブノーマリティです。",
], [
  2,
  "Scorched Girl",
  "マッチガール",
  "F-01-02",
  "RED",
  "TETH",
  "君の元に行こう。\nやがて私のように灰になってしまう、君の元へ。",
], [
  3,
  "One Sin and Hundreds of Good Deeds",
  "たった一つの罪と何百もの善",
  "O-03-03",
  "WHITE",
  "ZAYIN",
  "それはあなたを裁く救世主であり、\n奈落へ落とす執行者です。",
], [
  4,
  "The Queen of Hatred",
  "憎しみの女王",
  "O-01-04",
  "BLACK",
  "WAW",
  "愛と正義の名のもとに、魔法少女がやってくる！",
], [
  6,
  "Happy Teddy Bear",
  "幸せなテディ",
  "T-04-06",
  "WHITE",
  "HE",
  "その記憶は暖かい抱擁から始まります。",
], [
  8,
  "The Red Shoes",
  "赤い靴",
  "O-04-08",
  "RED",
  "HE",
  "泣いている少女は嘆願する、\n「ミスター、私の足を切ってください......」",
], [
  9,
  "Theresia",
  "テレジア",
  "T-09-09",
  "X",
  "TETH",
  "「この旋律を覚えていますか？\n　生徒が眠りそうになると、\n　先生はこの曲を演奏してくださいましたね。\n　お誕生日おめでとうございます。」",
], [
  12,
  "Old Lady",
  "オールドレディ",
  "O-01-12",
  "WHITE",
  "TETH",
  "彼女は以前はとてもおしゃべりだった。\n結局、孤独が唯一の聴衆だった。",
], [
  15,
  "Nameless Fetus",
  "無名の胎児",
  "O-01-15",
  "RED",
  "HE",
  "いつか、あなたは知るかもしれない。\nルーレットが回転しているときの顔の絶望の意味を。",
], [
  18,
  "The Lady Facing the Wall",
  "壁に向かう女",
  "F-01-18",
  "WHITE",
  "TETH",
  "彼女の悲しみは長くなり、\n悲しげな髪で覆われるまで育った。",
], [
  20,
  "Nothing There",
  "「何もない」",
  "O-06-20",
  "RED",
  "ALEPH",
  "そして多くの「皮」は、ただ一つの言葉「管理人」とわめく。",
], [
  27,
  "1.76 MHz",
  "1.76 MHz",
  "T-06-27",
  "WHITE",
  "TETH",
  "これは決して忘れてはならないその日の記録です。",
], [
  30,
  "Singing Machine",
  "歌う機械",
  "O-05-30",
  "WHITE",
  "HE",
  "けれど人間の時のような音は出なかった。",
], [
  31,
  "The Silent Orchestra",
  "静かなオーケストラ",
  "T-01-31",
  "WHITE",
  "ALEPH",
  "壊れたものたちから世の中で一番美しい演奏が始まる。",
], [
  32,
  "Warm-Hearted Woodsman",
  "暖かい心の木こり",
  "F-05-32",
  "WHITE",
  "HE",
  "随所に数多くの心がある森。\n切っても切っても依然として森は鬱蒼としている。",
], [
  37,
  "The Snow Queen",
  "雪の女王",
  "F-01-37",
  "WHITE",
  "HE",
  "「氷は溶けている......\n　春が訪れたからか、\n　宮殿が崩れ落ちてしまったからか、\n　私たちには分かりません。」",
], [
  40,
  "Big Bird",
  "大鳥",
  "O-02-40",
  "BLACK",
  "WAW",
  "『怪物』は存在しないと結論づけた。",
], [
  41,
  "All-Around Helper",
  "オールアラウンドヘルパー",
  "T-05-41",
  "RED",
  "HE",
  "床全体を覆う鮮血、ひどい恐ろしい叫び声、逃げる人々...",
], [
  42,
  "Snow White's Apple",
  "白雪姫のりんご",
  "F-04-42",
  "BLACK",
  "WAW",
  "リンゴが王女と王の庭に落ちた日、\n魔女の心は崩壊しました。",
], [
  43,
  "Spider Bud",
  "母なるクモ",
  "T-02-43",
  "RED",
  "TETH",
  "誰も彼の遺体を持ち帰ることを願い出ませんでした。",
], [
  44,
  "Beauty and the Beast",
  "美女と野獣",
  "F-02-44",
  "WHITE",
  "TETH",
  "呪いを解くことはできません、繰り返すだけです。",
], [
  45,
  "Plague Doctor",
  "ペスト医師",
  "O-01-45",
  "WHITE",
  "ZAYIN",
  "「あなたのあらゆる病を治し、\n　あなたを治療しましょう。」",
], [
  46,
  "WhiteNight",
  "白夜",
  "T-03-46",
  "PALE",
  "ALEPH",
  "「我が使徒たちよ、目覚めよ。\n　そして我を迎えるのだ。」",
], [
  47,
  "Don't Touch Me",
  "触れてはならない",
  "O-05-47",
  "UNKNOWN",
  "ZAYIN",
  "何度も押してきましたが、\nまだ知りたいことがあるんですか？",
], [
  49,
  "Rudolta of the Sleigh",
  "そりのルドル・タ",
  "F-02-49",
  "WHITE",
  "HE",
  "私の計り知れない憎悪を込めて、\nあなたにプレゼントを贈ります。",
], [
  50,
  "Queen Bee",
  "女王蜂",
  "T-04-50",
  "RED",
  "WAW",
  "首への痒み、腹痛を感じたら、できることは、もう二度と見ることの出来ない最後の青空を見ることだけです。",
], [
  51,
  "Bloodbath",
  "血の風呂",
  "T-05-51",
  "WHITE",
  "TETH",
  "多くの手が風呂に浮かぶ。\nこれらは私がかつて愛していた人々の手です。",
], [
  52,
  "Opened Can of WellCheers",
  "蓋の空いたウェルチアース",
  "F-05-52",
  "RED",
  "ZAYIN",
  "どこか遠くで、カモメの声が聞こえる。",
], [
  53,
  "Alriune",
  "アルリウネ",
  "T-04-53",
  "WHITE",
  "WAW",
  "塵に帰りたいという彼女の願いは、 生きようとするものすべてを死に場所へと返すでしょう。",
], [
  54,
  "Forsaken Murderer",
  "捨てられた殺人者",
  "T-01-54",
  "RED",
  "TETH",
  "しかし、君は本当に哀れな人だ。\n私に殺されるのだから。",
], [
  55,
  "Child of the Galaxy",
  "銀河の子",
  "O-01-55",
  "BLACK",
  "HE",
  "子供の涙が落ちると、星が空から降りてきた。\n世界は幸せに包まれ、眠りに落ちた。",
], [
  56,
  "Punishing Bird",
  "罰鳥",
  "O-02-56",
  "RED",
  "TETH",
  "人々は大昔から罪を犯してきた。\n『なぜ彼らはそのようなことをするのだろう？\n　それが悪いことだと知っているのに。』",
], [
  57,
  "Little Red Riding Hooded Mercenary",
  "赤ずきんの傭兵",
  "F-01-57",
  "RED",
  "WAW",
  "あの野郎の首を私のベッドの上にぶら下げてやる。\nそれだけで、悪夢を見ることなく眠ることができる。",
], [
  58,
  "Big and Will be Bad Wolf",
  "大きくて悪いオオカミ",
  "F-02-58",
  "RED",
  "WAW",
  "それでも構わないという気がした。\n自分は大きくて悪いオオカミなのだから。",
], [
  59,
  "You're Bald...",
  "お前、ハゲだよ…",
  "Bald-Is-Awesome!",
  "BLACK",
  "ZAYIN",
  "あなたは電動バリカンのスイッチをオンにしました...",
], [
  60,
  "Fragment of the Universe",
  "宇宙の欠片",
  "O-03-60",
  "BLACK",
  "TETH",
  "あなたはその曲に出会います。\n魅惑的にあなたに近づいてきます...",
], [
  61,
  "Crumbling Armor",
  "壊れゆく甲冑",
  "O-05-61",
  "RED",
  "TETH",
  "「生は死を恐れぬ者にのみ与えられる。」",
], [
  62,
  "Judgement Bird",
  "審判鳥",
  "O-02-62",
  "PALE",
  "WAW",
  "彼の天秤はあらゆる種類の罪を、\n公正に評価することができます。",
], [
  63,
  "Apocalypse Bird",
  "終末鳥",
  "O-02-63",
  "BLACK",
  "ALEPH",
  "混乱と泣き声の中で誰かが叫びました。\n「『怪物』だ！\n　恐ろしい大きな怪物が黒の森の闇に潜んでるぞ！」",
], [
  64,
  "The King of Greed",
  "貪欲の王",
  "O-01-64",
  "RED",
  "WAW",
  "悲しみが叫ぶ、消えろ！ 死ね！ と。\nしかし、欲望は永遠を望んでいた。\n深く、永久に続く永遠を望んでいた！",
], [
  66,
  "The Little Prince",
  "小さな王子",
  "O-04-66",
  "BLACK",
  "WAW",
  "これが私の呪いであっても、\n私はこの呪いを祝福として愛するだろう。",
], [
  67,
  "Laetitia",
  "レティシア",
  "O-01-67",
  "BLACK",
  "HE",
  "だから、ちびはすごいアイディアを思いついたの！",
], [
  68,
  "The Funeral of the Dead Butterflies",
  "死んだ蝶の葬儀",
  "T-01-68",
  "WHITE",
  "HE",
  "人は死んだらどこへ行く？",
], [
  69,
  "Der Freischütz",
  "魔弾の射手",
  "F-01-69",
  "BLACK",
  "HE",
  "この魔法の弾丸はお前の言ったとおり\n本当に誰にでも当たるな！",
], [
  70,
  "Dream of a Black Swan",
  "黒鳥の夢",
  "F-02-70",
  "WHITE",
  "WAW",
  "黒鳥が、白鳥になった夢から覚めた時、\n何が起こるのでしょうか？",
], [
  71,
  "The Dreaming Current",
  "夢見る流れ",
  "T-02-71",
  "WHITE",
  "WAW",
  "赤ん坊に、彼が好きなブドウ味のキャンディが手に入ることを教えてあげてください。",
], [
  72,
  "The Burrowing Heaven",
  "地中の天国",
  "O-04-72",
  "BLACK",
  "WAW",
  "視線を逸らさず、見続けて下さい。\nそれはあなたの視界にあります。",
], [
  73,
  "The Knight of Despair",
  "絶望の騎士",
  "O-01-73",
  "WHITE",
  "WAW",
  "残ったのは風化した騎士の空虚な誇りでした。",
], [
  74,
  "The Naked Nest",
  "裸の巣",
  "O-02-74",
  "RED",
  "WAW",
  "それはあなたの体のどの穴にでも侵入できます。",
], [
  75,
  "Mountain of Smiling Bodies",
  "笑う死体の山",
  "T-01-75",
  "BLACK",
  "ALEPH",
  "その笑顔は不気味で悲しみに満ちています。",
], [
  76,
  "Schadenfreude",
  "シャーデンフロイデ",
  "O-05-76",
  "RED",
  "HE",
  "機械の中の鍵穴からは、執拗な視線を感じる。",
], [
  77,
  "The Heart of Aspiration",
  "熱望する心臓",
  "T-09-77",
  "X",
  "TETH",
  "過度な熱望は誤った興奮をもたらしました。",
], [
  78,
  "Note from a Crazed Researcher",
  "狂研究者のノート",
  "T-09-78",
  "X",
  "HE",
  "最終章は「生まれ変わる」という一文で終わります。",
], [
  79,
  "Flesh Idol",
  "肉の偶像",
  "T-09-79",
  "X",
  "WAW",
  "そして、祈りはいつも祈る者の\n永遠の絶望で締めくくられる。",
], [
  80,
  "Giant Tree Sap",
  "巨木の樹液",
  "T-09-80",
  "X",
  "HE",
  "「木はただ与えていたものを\n　返してもらっただけなのですよ。」",
], [
  81,
  "Mirror of Adjustment",
  "調整の鏡",
  "O-09-81",
  "X",
  "ZAYIN",
  "「満足は一時的なものだろうに。」",
], [
  82,
  "Shelter from the 27th of March",
  "3月27日のシェルター",
  "T-09-82",
  "X",
  "HE",
  "言葉通りの「地球で一番安全な場所」になっていくことでしょう。",
], [
  83,
  "Fairy Festival",
  "妖精の祭典",
  "F-04-83",
  "RED",
  "ZAYIN",
  "妖精があなたを助けている間、\nすべてが平和になるでしょう。",
], [
  84,
  "Meat Lantern",
  "肉の灯篭",
  "O-04-84",
  "WHITE",
  "TETH",
  "それは花じゃない、\nすべての職員にすぐに逃げるように指示しろ。",
], [
  85,
  "We Can Change Anything",
  "何でも変えて差し上げます",
  "T-09-85",
  "X",
  "ZAYIN",
  "今すぐ全てが良くなるでしょう。",
], [
  86,
  "Express Train to Hell",
  "地獄への急行列車",
  "T-09-86",
  "X",
  "WAW",
  "時間が来ると、高らかな警笛とともに列車が通過する。",
], [
  87,
  "Scarecrow Searching for Wisdom",
  "知恵を欲する案山子",
  "F-01-87",
  "WHITE",
  "HE",
  "そしてそこは、変わらずエメラルドの道が美しく輝く都市のままでした。",
], [
  88,
  "Dimensional Refraction Variant",
  "次元屈折変異体",
  "O-03-88",
  "WHITE",
  "WAW",
  "慎重に、あなたの周辺を意識してください。",
], [
  89,
  "CENSORED",
  "規制済み",
  "O-03-89",
  "BLACK",
  "ALEPH",
  "システムの問題によりアブノーマリティが脱走した場合、直ちに管理人を処分する必要があります。",
], [
  90,
  "Skin Prophecy",
  "皮膚の予言",
  "T-09-90",
  "X",
  "TETH",
  "今、永遠に私たちを救ってください。\n真実は私たちを自由にするでしょう。",
], [
  91,
  "Portrait of Another World",
  "異界の肖像",
  "O-09-91",
  "X",
  "HE",
  "この肖像画は今この瞬間を捉える。\nいつか失うしかないものを。",
], [
  92,
  "Today's Shy Look",
  "今日は恥ずかしがり屋",
  "O-01-92",
  "BLACK",
  "TETH",
  "今日は良い日！あなたはまだ恥ずかしがり屋なの？",
], [
  93,
  "Blue Star",
  "蒼星",
  "O-03-93",
  "WHITE",
  "ALEPH",
  "やがて星となって再会しよう。",
], [
  94,
  "You Must Be Happy",
  "あなたは幸せでなければならない",
  "T-09-94",
  "X",
  "ZAYIN",
  "この機械で手術を受けた多くの人は心が安らぎ、\n再び健康になりました。",
], [
  95,
  "Luminous Bracelet",
  "輝く腕輪",
  "O-09-95",
  "X",
  "TETH",
  "この腕輪は欲深い者を許さないので、\n誠実な者だけが着用しなければならない。",
], [
  96,
  "Behavior Adjustment",
  "行動矯正",
  "O-09-96",
  "X",
  "TETH",
  "最終的には存在理由さえも忘れるほど、\n知恵はその意味を失くしてしまう。",
], [
  97,
  "Old Faith and Promise",
  "古い信念と約束",
  "T-09-97",
  "X",
  "ZAYIN",
  "裏切られた心は深淵の中で\nゆっくりと忘れ去られてゆきました。",
], [
  98,
  "Porccubus",
  "ポーキュバス",
  "O-02-98",
  "BLACK",
  "HE",
  "私の頭が爆発する時間ですね。 良い一日でした。",
], [
  99,
  "Void Dream",
  "空虚な夢",
  "T-02-99",
  "BLACK",
  "TETH",
  "お願いだ、私の夢を食べてくれ。",
], [
  100,
  "Grave of Cherry Blossoms",
  "墓穴の桜",
  "O-04-100",
  "WHITE",
  "TETH",
  "血を得れば得るほど、その妖艶さは色を濃くします。",
], [
  101,
  "The Firebird",
  "火の鳥",
  "O-02-101",
  "RED",
  "WAW",
  "狩りに成功した者らには、多くの狩人があれほど欲した羽根が証のように残される。",
], [
  102,
  "Yin",
  "陰",
  "O-05-102",
  "BLACK",
  "WAW",
  "いま汝は空となり、我は地となる。",
], [
  103,
  "Yang",
  "陽",
  "O-07-103",
  "X",
  "WAW",
  "しかし、どうして世界が明るさと暖かさだけで成り立つことができようか。",
], [
  104,
  "Backward Clock",
  "逆行時計",
  "D-09-104",
  "X",
  "WAW",
  "底まで落ちてしまって、もう方法が見えないのですか？",
], [
  105,
  "El Llanto de la Luna",
  "ラ・ルナ",
  "D-01-105",
  "WHITE",
  "WAW",
  "『月が人をよく魅了するってよく言われるけど、\n　人は月に絶望しているだけ。』",
], [
  106,
  "Army In Black",
  "黒の兵隊",
  "D-01-106",
  "WHITE",
  "ZAYIN",
  "人間の心はピンク色です。\nそれ故にピンク色の軍服を着ていれば、\n人間の心に溶け込むことが出来るのです。",
], [
  107,
  "Ppodae",
  "キュートちゃん",
  "D-02-107",
  "RED",
  "TETH",
  "いや、その天使が今まさに、\n同僚を食べてるんだけど...",
], [
  108,
  "Parasite Tree",
  "寄生樹",
  "D-04-108",
  "WHITE",
  "WAW",
  "『安心してください、祝福が必要でしょう？』",
], [
  109,
  "Melting Love",
  "溶ける愛",
  "D-03-109",
  "BLACK",
  "ALEPH",
  "…そして私の愛する職員の皆さん。先ほどここに入る時に、支給されたマスクは着用しましたか？",
], [
  110,
  "Honored Monk",
  "風雲僧",
  "D-01-110",
  "WHITE",
  "WAW",
  "しかし天下が驚くほどの仏舎利が出たならば、\nそなたの名は後世に残ることだろう。",
]] as const;
