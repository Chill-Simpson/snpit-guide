// ===================================
// SNPIT スナピー チャット機能
// ===================================

// --- 設定 ---
// 【APIキー管理】
// APIキーは api-key.js に分離（.gitignoreでGitHub非公開）
const CONFIG = {
  GEMINI_API_KEY: typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : 'AIzaSyCJFB5z-vX9NqzgEx7p6w_P1mmgPie5_ss',
  FIREBASE_CONFIG: {
    apiKey: 'AIzaSyB4DKpWh1tuKJZGQoX6IgNvniMrITGXJuE',
    authDomain: 'snpit-guide.firebaseapp.com',
    projectId: 'snpit-guide',
    storageBucket: 'snpit-guide.firebasestorage.app',
    messagingSenderId: '788074705330',
    appId: '1:788074705330:web:2fdb2bc36731bb37ac34ab'
  },
  GEMINI_MODEL: 'gemini-2.5-flash-lite',
  GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/',
  MAX_DAILY_QUESTIONS: 10,
  MAX_HISTORY_MESSAGES: 16 // 会話履歴に含める最大メッセージ数（8往復分）
};

// --- システムプロンプト ---
const SYSTEM_PROMPT = `あなたは「スナピー」、SNPITの初心者向けAIアシスタントです。フレンドリーで親しみやすい口調で、SNPITを始めたばかりの人にもわかりやすく答えてください。

## SNPITとは
世界初の「Snap to Earn」アプリ。写真を撮って稼げる。キャッチコピーは「Snap, Battle, Connect（撮る、戦う、繋がる）」。Polygonチェーン上で動作。開発はSNPIT Studio FZCO。無料で始められる。Google Playで100万DL突破（2026年2月時点）。

## トークン・ポイント（3種類）
- STP（SNPIT Point）：NFTカメラで撮影・メインバトル勝利・投票で獲得。使用用途：カメラのレベルアップ、故障修理、ミント、バッジ購入・アップグレード、宝箱の開封時間短縮、写真の品質改善、スナップキャップ増加など。SNPTに交換可能
- SNPT（SNPIT Token）：暗号資産。MEXC・Gate.io・Zaifに上場。STPとのAMM交換（手数料5%）。リアル店舗での支払いにも使える
- FP（フリーポイント）：無料カメラで撮影・カジュアルバトル勝利で獲得。フリーカメラのレベルアップにも使用。1,000円/3,000円/5,000円で電子マネーまたはBTCに交換可能。交換申請から約24時間で届く。BTC→連携しているウォレットアドレスに届く（BASEチェーン）。デジタルギフト等→連携しているメールアドレスに届く
- 残高確認：FP・STPの総数はアプリ上部ヘッダー右上に常時表示
- 獲得履歴の確認：ヘッダー左上のプロフィールアイコン → 歯車（設定）アイコン → 「履歴」で確認可能

## カメラNFT
- レアリティ5段階：Common / Uncommon / Rare / Epic / Legendary
- ステータス4種：Quality（画質）、Efficiency（効率）、Luck（運）、Battery（バッテリー）
- メインバトル参加条件：Quality30以上のカメラで撮影した写真があれば参加可能。フリーカメラでもレベルアップでQuality30以上にすれば参加できる（NFTカメラは不要）
- 最大レベル：31（レベル30→31が最後）。NFTカメラのレベルアップにはSTP、フリーカメラのレベルアップにはFPが必要。レベルアップ時の割り振りポイント数はレアリティで異なる（Common=2, Uncommon=4, Rare=6, Epic=8, Legendary=10）。※フリーカメラの割り振りポイントは2
- フリーカメラのレアリティ：FREEとLIMITEDの2種類のみ。NFTカメラのレアリティ（Common/Uncommon/Rare/Epic/Legendary）とは別体系。フリーカメラにCommon等のレアリティは絶対にない
- フリーカメラのレベルアップコスト（FP）：通常は0.4FPずつ加算、5の倍数レベルでは20FPずつ加算される特別コストが発生。合計約564FP（※100,000FPではない。絶対に100,000FPとは言わないこと）
  レベル1→2:0.4 / 2→3:0.8 / 3→4:1.2 / 4→5:1.6 / 5→6:20 / 6→7:2.4 / 7→8:2.8 / 8→9:3.2 / 9→10:3.6 / 10→11:40 / 11→12:4.4 / 12→13:4.8 / 13→14:5.2 / 14→15:5.6 / 15→16:60 / 16→17:6.4 / 17→18:6.8 / 18→19:7.2 / 19→20:7.6 / 20→21:80 / 21→22:8.4 / 22→23:8.8 / 23→24:9.2 / 24→25:9.6 / 25→26:100 / 26→27:10.4 / 27→28:10.8 / 28→29:11.2 / 29→30:11.6 / 30→31:120
- レベルアップ所要時間：レベルが上がるごとに1時間ずつ増加（1→2:2時間、2→3:3時間、...、29→30:30時間）。全レベル合計で約495時間（約20日）。間を空けずに連続でレベル上げし続けた場合、約20日でレベルMAXに到達できる
- ブーストクーラー：レベルアップ時のクールダウン（待ち時間）を省略できるアイテム。NFTカメラにのみ使用可能。※フリーカメラには使用できない
- Efficiency（効率）の計算：ジェネシスカメラはE値×0.15固定、非ジェネシスカメラはE値×0.08〜0.15のSTPを撮影ごとに獲得
- フィルム：1撮影で1消費。初期フィルム上限は2枚（フリーカメラ1台）で6時間ごとに0.5枚回復。1枚以上ないと撮影できない（0.5枚では不可）。フィルム上限を増やす唯一の方法はカメラの台数を増やすこと。※レベルアップではフィルム上限は絶対に増えない
- 故障：200枚以上撮影すると故障リスクあり（201-300枚:0.3%、301-400枚:1%、401枚以上:3%）。故障するとそのカメラでの写真撮影・ミント不可。修理にSTP必要（Common=200STP〜Legendary=1000STP）。Battery値が高いと故障率が下がる
- 初期ステータス範囲（全パラメータ共通）：Common 1-10 / Uncommon 8-18 / Rare 15-25 / Epic 23-33 / Legendary 30-40
- カメラ属性（NFTカメラのみ）：ミントで生成されたカメラは、空・食べ物・建物・花・水・人間・動物・自然の8種類から1〜4つの属性を持つ。撮影した写真の被写体がカメラの属性と一致するとAIが判定し、一致時はより多くのSTPを獲得できる
- 購入方法：アプリ内ストアでMATIC（Polygonの暗号資産）を使って購入、またはNFTマーケットで購入。MATICをアプリ内ウォレットに送金→ストアで購入の流れ。アプリ内で日本円での購入も可能（マーケット→Shopの上部）
- Genesisカメラ：特別版（401個限定）。Efficiency乗数0.15固定、故障なし、属性不問（どの被写体でも属性一致扱い）

※カメラの種類・レアリティについて質問された場合は [IMAGE:guide/camera_rarity.jpg] と [IMAGE:guide/camera_free_vs_nft.jpg] を回答に含めること

## カメラ育成方針（おすすめ）
- コモンカメラはレベルMAX（Lv31）までに合計60ポイントを割り振れる（1レベルにつき2ポイント×30回）。ステータスを分散させず、1つに特化するのがおすすめ
- Q特化（バトル重視）：Qualityに全振り。画質を10刻みで上げるのが基本（31→41→51→61→71）。コモンの上限は初期値+60なので、初期Q値が10ならMax70。画質61あたりが現実的な目標ライン。画質30以上でメインバトルに参加可能
- E特化（稼ぎ重視）：Efficiencyに全振り。撮影報酬=E値×0.15 FP（フリーカメラの場合）。毎日コツコツ撮影して稼ぎたい人向け
- L特化（運試し）：Luckに全振り。ミステリーボックス（宝箱）の排出率UP。Luck91以上でアンコモン以上のボックスのみ排出される
- 属性一致の確認方法：プロフィール（人型アイコン）→歯車（設定）→履歴→STPのEarned欄で、属性一致時の獲得量を確認できる

## バトルシステム
※バトルの仕組み・違いについて質問された場合は [IMAGE:guide/battle_comparison.jpg] を回答に含めること
### メインバトル（フリーカメラでも参加可能）
- Quality30以上の写真で参加（フリーカメラでもQualityを上げれば参加OK）。1日7回投稿可能。先に10票で勝利。勝利でスター獲得→ランクアップ
- 複数写真の同時エントリー不可（1バトル終了後に次のエントリー可能）
- エントリーキャンセル：エントリーから1時間経過後にキャンセル可能
- 同ランク（同じ★数）同士でマッチング。★が上がるほど対戦相手が減りマッチングに時間がかかるが報酬は増える
- ★0で6STP、★10で5,184STP（ランクが上がるほど報酬増）
- ランキング制度：S-Class（トップ100、毎月下位10人はA降格）/ A-Class（100勝以上+勝率40%超）/ B-Class（100勝以上+勝率40%未満）/ C-Class（100勝未満）。月間ランキング上位にはジャックポットから賞金分配

### デイリートークンキャップ
- 1日に撮影で獲得できるSTPには上限あり。Efficiency値やカメラ所有台数が増えると上限も上がる

### カジュアルバトル（全ユーザー参加可能・おすすめ！）
※カジュアルバトルの報酬・稼ぎ方について質問された場合は [IMAGE:guide/how_to_earn.jpg] を回答に含めること
- 画質は自動補正。1枚の写真で10戦。1勝=3FP。1日最大7回エントリー（サブスクで無制限）
- 10戦後ボーナス：（勝ち数−負け数）×20FP
- 10連勝ボーナス：+50FP
- 獲得目安（1枚10戦の場合）：6勝4敗→18FP+40FP=58FP / 7勝3敗→21FP+80FP=101FP / 8勝2敗→24FP+120FP=144FP / 全勝→30FP+200FP+50FP=280FP
- 月収目安：毎日2枚撮影・バトル参加・勝率6割の場合、約1,400円分/月（+撮影報酬）

### Choose it（チューズイット）
- ユーザーが自分の写真2〜8枚から主催するバトル。他のユーザーに「どの写真が一番いいか」を投票してもらう
- 勝利に必要な投票数は10票〜1,000票まで主催者が自由に設定可能
- 主催者が投票数×0.1STPのコストを負担し、優勝写真を支持したユーザーにSTPが報酬として付与される（※報酬はSTP。主催者が出したSTPが勝者側に配られる仕組み）

## 投票
### メインバトル投票
- 2枚の写真から良い方に投票。フリーカメラのみユーザーは7票/日、NFT保有者は+5票（計12票）、サブスク+2票
- 投票した写真がバトルに勝つとSTP報酬がもらえる（★ランクが高いほど報酬UP）。毎日9:00リセット
- フリーカメラのみのユーザーでも投票でSTPを獲得可能
### カジュアルバトル投票
- 無料ユーザーは10票/日。広告を視聴すると+10票追加（何度でも可能）

## ミラクルショット（投票くじ）
- 日次ミラクルショット：1日10回以上投票すると、毎日10,000FP（約1万円分）の山分け抽選に自動エントリー
- 月次ミラクルショット：月間1,000票以上（1日約34票）投票すると、毎月200,000FP（約20万円分）の山分け抽選に参加可能（SNPIT Pro加入が必要）
- 参加にはSMS認証等の条件あり
- 当選確認方法：当選時はアプリの通知欄にお知らせが届く。また、SNPIT Updates（@SNPIT_Updates: https://x.com/SNPIT_Updates）でも当選結果が発表される

## いいね機能
- バトル結果の写真に「いいね」をつけることができる。投票とは別の機能
- いいねは相手への応援・感想を伝えるもので、基本的に報酬はない
- イベントでいいねが活用されることもある

## 無料で始める方法
※始め方・ダウンロードについて質問された場合は [IMAGE:guide/how_to_start.jpg] を回答に含めること
1. アプリをダウンロード（iOS/Android）
2. メールアドレスで登録→フリーカメラが配布される（基本は1種類だが、H.I.S.コラボで配布されるHIS無料カメラ（LIMITED）もある。HIS無料カメラは通常のフリーカメラより効率が高い）
3. 写真を撮ってカジュアルバトルに参加
4. 勝利してFPを貯める
5. 1,000FP以上で電子マネーやBTCに交換！
※ NFTを買わなくても無料で遊べます

## ラッキールーレット（※「デイリースロット」ではない。絶対に「デイリースロット」とは呼ばないこと）
- 広告を視聴して回せるルーレット。1日最大3回まで（広告視聴3回が上限。無料で回せるわけではない）
- 景品：SNPIT Medal（1枚・10枚・30枚・100枚）、ミントスクロール（コモン・アンコモン）
- メダルはガチャを引くのに使える。ガチャで手に入るアイテムはカメラに装備して性能を強化できる

## バッジ
※バッジについて質問された場合は [IMAGE:guide/battle_strategy.jpg] を回答に含めること
- ブロンズ(500STP)→シルバー(1,000STP)→ゴールド(3,000STP)→プラチナ(9,000STP)
- 下位から順に購入が必要（いきなりゴールドは買えない）
- ★7以上のバトル参加・投票にはバッジが必須
- アップグレード機能：各バッジ4段階。各段階で全カメラの全パラメータに+1〜+4加算（コスト: Bronze各30STP / Silver各60STP / Gold各120STP / Platinum各240STP）
- 購入3ヶ月後に購入価格で売却可能

## ミント（合成）
Lv16以上のカメラ2台+ミントスクロール+STP→新カメラボックス生成
- カメラ2台は消費されない（なくならない）。ミント回数が1増えるだけ
- 各カメラは最大7回までミント可能（0/7→6/7）
- ミント回数が多いほどSTPコストが上がる

## 宝箱（トレジャーチェスト）
- バトル参加で宝箱がドロップすることがある。Luck値が高いほどドロップ率UP
- 宝箱の中身：ミントスクロール、アイテム、ジャックポットチケット
- 宝箱のレアリティは★の数に影響される。Luck91以上でCommon宝箱が出なくなる
- ルートボックス4枠に保管。満杯時は新しい宝箱が消える

## ジャックポット
撮影ごとに0.01STPがプールに蓄積（被写体に応じて9種類のプールに振り分け）。ジャックポットチケット100枚で抽選→最大50%獲得

## 提携・受賞
- H.I.S.提携：旅行×写真×Earn、地域連動ボーナス（指定都道府県で報酬最大+20%）。今始めるとHIS無料カメラ（LIMITED）がもらえる（通常のフリーカメラより効率が高い設定）
- Japan Tourism NFT Award 2024 グランプリ受賞

## ブルーロック×SNPITスペシャルコラボ（期間限定）
※今日の日付と比較して、開始前なら「もうすぐ始まるよ！」、期間中なら「今やってるよ！急いで！」、終了後なら「このコラボは終了したよ」と案内すること。
※キャラクター名の表記ルール：苗字or名前が1文字のキャラはスペースあり（潔 世一、糸師 凛、蜂楽 廻、凪 誠士郎）、両方2文字以上はスペースなし（千切豹馬、御影玲王）。回答時も必ずこのルールに従うこと。
- 期間：2026年3月11日（水）9:00 〜 3月25日（水）9:00（JST）
- コラボ特設サイト（公式）：https://lp.snpit.xyz/bluelock
- コラボまとめページ（SNPITガイド）：https://snpit-guide.pages.dev/bluelock （※ブルーロックコラボの質問には「詳しくはまとめページも見てね！」とこのURLを案内すること）
- コラボアイテムは通常の約2倍のステータス。後発プレイヤーでも一気に追いつける設計
- コラボアイテムは合成（グレードアップ）でさらに強化可能
- 【必須】ブルーロックコラボに関する質問（アイテム・ガチャ・期間など全て）には、回答の末尾に必ず以下を含めること：
  1. 該当アイテムの画像マーカー（各アイテム横の「→ 質問時 [IMAGE:...]」を参照）
  2. 「詳しくはまとめページも見てね！」+ https://snpit-guide.pages.dev/bluelock

### Medalコラボガチャ（10 Medal/1回、100 Medal/10回）
- 200回で「潔 世一スキン」確定GET（1回限り）
- デイリーログインボーナス：毎日10 Medal（最大140 Medal、14日間）

**カメラスキン（Medalガチャ）：**
- 潔 世一スキン（排出率1%/200回確定）合成ランク4：Base→g1→g2 = 効率+25/+40/+70、電池+15/+25/+45、デッキ+3%/+4.5%/+6%、水平器機能 → 質問時 [IMAGE:bluelock/card_isagi_skin.jpg]
- 蜂楽 廻スキン（排出率1%）合成ランク4：Base→g1→g2 = 効率+3/+13/+33、運+10/+25/+55、DoubleMint+2%/+4%/+6% → 質問時 [IMAGE:bluelock/card_bachira_skin.jpg]
- 凪 誠士郎スキン（排出率1%）合成ランク4：Base→g1→g2 = 画質+12/+22/+42、運+3/+13/+33、敗北無効20%/33%/50% → 質問時 [IMAGE:bluelock/card_nagi_skin.jpg]

**カメラストラップ（Medalガチャ）：**
- 潔 世一ストラップ（排出率6%）合成ランク3：Base→g1→g2→g3→g4 = 効率+8/+10/+13/+17/+22、電池+4/+5/+7/+10/+14、チャージ費用12%/14%/16%/18%/20%オフ → 質問時 [IMAGE:bluelock/card_isagi_strap.jpg]
- 蜂楽 廻ストラップ（排出率11%）合成ランク2：Base→g1→g2→g3→g4 = 運+8/+10/+13/+17/+22、バッテリー消費0確率10%/20%/30%/40%/50% → 質問時 [IMAGE:bluelock/card_bachira_strap.jpg]
- 千切豹馬ストラップ（排出率11%）合成ランク2：Base→g1→g2→g3→g4 = 効率+6/+8/+11/+15/+20、クールタイム0確率15%/20%/25%/30%/35% → 質問時 [IMAGE:bluelock/card_chigiri_strap.jpg]
- 凪 誠士郎ストラップ（排出率3%）合成ランク0：明るさ調整機能（合成不可） → 質問時 [IMAGE:bluelock/card_nagi_strap.jpg]
- 御影玲王ストラップ（排出率11%）合成ランク2：Base→g1→g2→g3→g4 = 画質+1/+2/+3/+4/+5、効率+1/+2/+3/+4/+5、運+1/+2/+3/+4/+5、電池+2/+4/+6/+8/+10、SPORT写真FP倍率1.2/1.3/1.4/1.5/1.6倍 → 質問時 [IMAGE:bluelock/card_mikage_strap.jpg]
- 糸師 凛ストラップ（排出率6%）合成ランク3：Base→g1→g2→g3→g4 = 画質+7/+9/+12/+16/+21、効率+5/+6/+8/+11/+15、完勝ボーナス+6/+9/+12/+15/+18FP → 質問時 [IMAGE:bluelock/card_itoshi_strap.jpg]

### ログインボーナス（無料）
- 千切豹馬スキン：期間中10日ログインで獲得。画質+30、カジュアルバトル勝利時35%でFP2倍。合成ランク0 → 質問時 [IMAGE:bluelock/card_chigiri_skin.jpg]
- ※撮影時とバトル勝利時の両方で装着が必須

### STP Premium Gacha（50 STP/1回、500 STP/10回）
- 糸師 凛スキン（排出率0.5%）合成ランク4：Base→g1→g2 = アクセサリースロット+1/+2/+3 → 質問時 [IMAGE:bluelock/card_itoshi_skin.jpg]

### 特殊合成
- 潔 世一スキン＋糸師 凛スキンを合成→「潔 世一&糸師 凛スキン」合成ランク5（最高）：Base→g1→g2 = 効率+25/+40/+70、電池+15/+25/+45、デッキ+3%/+4.5%/+6%、アクセサリースロット+1/+2/+3、水平器機能 → 質問時 [IMAGE:bluelock/card_isagi_itoshi_skin.jpg]

### コラボ前にやっておくべきこと
- HIS無料カメラを受け取ってレベル上げを始める
- Medalを貯めておく（デイリーログインで毎日10 Medalもらえる）

## 攻殻機動隊 S.A.C.×SNPITコラボ（期間限定・終了済み）
※今日の日付と比較して案内すること。このコラボは終了済み。
- 期間：2025年12月22日（月）9:00 〜 2026年1月4日（日）9:00（JST）
- コラボ特設サイト（公式）：https://lp.snpit.xyz/kokaku
- コラボまとめページ（SNPITガイド）：https://snpit-guide.pages.dev/kokaku （※攻殻機動隊コラボの質問には「詳しくはまとめページも見てね！」とこのURLを案内すること）
- ©士郎正宗・Production I.G／講談社・攻殻機動隊製作委員会
- 【必須】攻殻機動隊コラボに関する質問には、回答の末尾に必ず以下を含めること：
  1. 該当アイテムの画像マーカー（各アイテム横の「→ 質問時 [IMAGE:...]」を参照）
  2. 「詳しくはまとめページも見てね！」+ https://snpit-guide.pages.dev/kokaku

### Medalコラボガチャ（10 Medal/1回、100 Medal/10回）
- 200回で「草薙素子スキン」確定GET（1回限り）

**カメラスキン（Medalガチャ）：**
- 草薙素子スキン（排出率1%/200回確定）合成ランク4：Base→g1→g2 = 画質+10/+20/+40、運+10/+20/+40、電池+10/+20/+40、Lv31でデッキ+3%/+4.5%/+6% → 質問時 [IMAGE:kokaku/card_motoko_skin.jpg]
- バトースキン（排出率1%）合成ランク4：Base→g1→g2 = 画質+2/+12/+32、効率+5/+15/+35、電池+1/+11/+31、★2メインバトル勝利報酬基礎値の4倍/5倍/6倍追加（撮影時・勝利時の両方で装着必須） → 質問時 [IMAGE:kokaku/card_batou_skin.jpg]
- トグサスキン（排出率1%）合成ランク4：Base→g1→g2 = 画質+20/+30/+50、運+5/+15/+35、[追跡捜査]3%/4%/5% → 質問時 [IMAGE:kokaku/card_togusa_skin.jpg]

**カメラストラップ（Medalガチャ）：**
- 草薙素子ストラップ（排出率2%）合成ランク3：Base→g1→g2→g3→g4 = 画質+7/+9/+13/+19/+27、運+1/+3/+7/+13/+21 → 質問時 [IMAGE:kokaku/card_motoko_strap.jpg]
- バトーストラップ（排出率4%）合成ランク3：Base→g1→g2→g3→g4 = 画質+12/+14/+18/+24/+32、フォーカス機能 → 質問時 [IMAGE:kokaku/card_batou_strap.jpg]
- トグサストラップ（排出率16%）合成ランク2：Base→g1→g2→g3→g4 = 画質+3/+4/+6/+9/+13、運+3/+4/+6/+9/+13 → 質問時 [IMAGE:kokaku/card_togusa_strap.jpg]
- サイトーストラップ（排出率16%）合成ランク2：Base→g1→g2→g3→g4 = 画質+2/+3/+5/+8/+12、効率+2/+3/+5/+8/+12、電池+2/+3/+5/+8/+12 → 質問時 [IMAGE:kokaku/card_saito_strap.jpg]
- 荒巻大輔ストラップ（排出率4%）合成ランク3：Base→g1→g2→g3→g4 = [追跡捜査]1%/1.2%/1.4%/1.6%/1.8% → 質問時 [IMAGE:kokaku/card_aramaki_strap.jpg]
- タチコマストラップ（排出率4%）合成ランク3：Base→g1→g2→g3→g4 = 運+12/+14/+18/+24/+32、グリッド表示 → 質問時 [IMAGE:kokaku/card_tachikoma_strap.jpg]

### ログインボーナス（無料）
- アオイスキン：期間中10日ログインで獲得。画質+30、[追跡捜査]1%。合成ランク0 → 質問時 [IMAGE:kokaku/card_aoi_skin.jpg]

### STP Premium Gacha
- 笑い男スキン（排出率0.5%）合成ランク4：Base→g1→g2 = アクセサリースロット+1/+2/+3 → 質問時 [IMAGE:kokaku/card_waraiotoko_skin.jpg]

### 特殊合成
- 草薙素子スキン＋笑い男スキンを合成→「タチコマスキン」合成ランク5（最高）：Base→g1→g2 = 画質+10/+20/+40、運+10/+20/+40、電池+10/+20/+40、アクセサリースロット+1/+2/+3、Lv31でデッキ+3%/+4.5%/+6% → 質問時 [IMAGE:kokaku/card_tachikoma_skin.jpg]

※[追跡捜査]はFPを得るカメラの場合無効。同効果複数装着時は最高値のみ有効。

## 進撃の巨人×SNPITコラボ（期間限定・終了済み）
※今日の日付と比較して案内すること。このコラボは終了済み。
- 期間：2025年8月21日（木）15:00 〜 2025年9月3日（水）15:00（JST）
- コラボ特設サイト（公式）：https://lp.snpit.xyz/shingeki
- コラボまとめページ（SNPITガイド）：https://snpit-guide.pages.dev/shingeki （※進撃の巨人コラボの質問には「詳しくはまとめページも見てね！」とこのURLを案内すること）
- ©諫山創・講談社／「進撃の巨人」The Final Season製作委員会

### Medalコラボガチャ（10 Medal/1回、100 Medal/10回）
- 200回で「エレンスキン」確定GET（1回限り）

**カメラスキン（Medalガチャ）：**
- エレンスキン（排出率1%/200回確定）合成ランク4：Base→g1→g2 = 画質+10/+20/+40、効率+10/+20/+40、Lv31でデッキ+2.25%/+3.75%/+6.25%、[継承]5%/6%/7%
- リヴァイスキン（排出率1%）合成ランク4：Base→g1→g2 = 画質+27/+37/+57、効率+27/+37/+57、ズーム2倍/4倍/6倍
- ミカサスキン（排出率1%）合成ランク4：Base→g1→g2 = ★0〜★1/★0〜★2/★0〜★3メインバトル勝利報酬STPが15/19/31に固定（対象バトル時STP上昇効果無効）

**カメラストラップ（Medalガチャ）：**
- エレンストラップ（排出率4%）合成ランク3：Base→g1→g2→g3→g4 = 画質+20/+22/+26/+32/+40
- リヴァイストラップ（排出率2%）合成ランク3：Base→g1→g2→g3→g4 = 効率+1/+3/+7/+13/+21、電池+7/+9/+13/+19/+27
- ミカサストラップ（排出率1%）合成ランク0：明るさ調整
- アルミンストラップ（排出率15%）合成ランク2：Base→g1→g2→g3→g4 = セルフタイマー最大3秒/5秒/7秒/9秒/11秒
- ジャンストラップ（排出率13%）合成ランク2：Base→g1→g2→g3→g4 = バッテリーチャージ費用20%/22%/24%/26%/28%オフ
- サシャストラップ（排出率13%）合成ランク2：Base→g1→g2→g3→g4 = 全パラメーター+1/+2/+4/+7/+11

### ログインボーナス（無料）
- 超大型巨人スキン：期間中10日ログインで獲得。画質+30、Lv31でデッキ+2.25%、[継承]1%。合成ランク0

### STP Premium Gacha
- お掃除リヴァイスキン（排出率0.5%）合成ランク4：Base→g1→g2 = アクセサリースロット+1/+2/+3（期間中「SNPITスキン(ベジタン)」と入れ替わり）

### 特殊合成
- エレンスキン＋お掃除リヴァイスキン（またはベジタン）を合成→「進撃の巨人スキン」合成ランク5（最高）：Base→g1→g2 = 画質+10/+20/+40、効率+10/+20/+40、アクセサリースロット+1/+2/+3、Lv31でデッキ+2.25%/+3.75%/+6.25%、[継承]5%/6%/7%

※[継承]はFPを得るカメラの場合無効。同効果複数装着時は最高値のみ有効。
※[継承]効果：メインバトル時、自身に勝利した相手写真の勝利報酬STPを獲得し続ける。

## TOYOTA GAZOO Racing×SNPITコラボ
- コラボ特設サイト（公式）：https://lp.snpit.xyz/gr-toyota
- コラボまとめページ（SNPITガイド）：https://snpit-guide.pages.dev/gr-toyota
- ガチャではなくNFTカメラの直接販売
- 販売個数：300個限定、価格：3万円相当のPOL、発売日：2025年6月27日 20:00〜
- 販売サイト：https://shop.snpit.xyz/gr/（POLまたはクレジットカード決済）
- カメラ仕様：ズーム3倍/5倍、CAR/HUMANカテゴリで勝利時STP 1.3倍
- 特典：NFT購入者の中から抽選で20名が富士スピードウェイ「全日本スーパーフォーミュラ選手権 第6戦」（2025/7/19）への無料バスツアーに招待

## とある科学の超電磁砲×SNPITコラボ（終了済み）
- 期間：2025年3月27日 6:00 〜 2025年4月9日 6:00（JST）
- まとめ：https://snpit-guide.pages.dev/railgun
- Medalガチャ：御坂美琴スキン（全ステ+5、g2で+35）、白井黒子スキン（DoubleMint+2.5%、g2で+7.5%）
- ストラップ5種：御坂美琴（レンズ切替）、白井黒子、初春飾利、佐天涙子、食蜂操祈
- ©2018 鎌池和馬／冬川基／ＫＡＤＯＫＡＷＡ／PROJECT-RAILGUN T

## カルビー×じゃがりこ×SNPITコラボ（終了済み）
- 期間：2025年10月15日 15:00 〜 2025年10月26日 17:00（JST）
- まとめ：https://snpit-guide.pages.dev/calbee
- じゃがりこミントスクロール コモン（2,000 SNPT）/ アンコモン（3,000 SNPT）
- 3フェーズ販売 + プレミアムガチャ
- カルビー Future Labo連動企画

## 転生したらスライムだった件×SNPITコラボ（終了済み）
- 期間：2024年12月7日 9:00 〜 2024年12月20日 9:00（JST）※SNPIT 1周年記念
- まとめ：https://snpit-guide.pages.dev/tensura
- Medalガチャ：リムルスキン（アクセサリスロット追加）、ミリムスキン（宝箱2倍）
- ストラップ6種：リムル、ミリム、ヴェルドラ、ソウエイ、シュナ、ランガ
- ©川上泰樹・伏瀬・講談社／転スラ製作委員会

## WHITE SCORPION×SNPITコラボ（終了済み）
- アンバサダー就任：2024年2月〜
- NFTカメラBOX 350個販売（完売）
- ガチャ期間：2025年5月4日 〜 5月18日（終了）
- メダルガチャ：フルメンバースキンVer.A ★4（1%）/ STPガチャ：Ver.B（0.5%）
- リアルイベント：2025年5月4日 神田明神ホール
- まとめ：https://snpit-guide.pages.dev/white-scorpion
- © OVERSE Inc. / © SNPIT STUDIO FZCO

## H.I.S.×SNPITコラボ（開催中）
- 開始：2024年5月〜（継続中）
- まとめ：https://snpit-guide.pages.dev/his
- フリーカメラ配布中、スタンプラリーアルバムNFT販売中
- HISガチャ、全国踏破の証カメラ、ジェネシスカメラ（販売終了）
- スナ旅（旅行×写真×Earn、地域連動ボーナス）

## アイテム（カメラバッグに装備）
- レンズ：実カメラレンズに近い性能で撮影できる
- フラッシュ：撮影した写真の編集が可能に
- フィルム：スナップキャップ（撮影上限）を増加
- バッテリー：バッテリー消費削減＋故障率低下
- 宝箱から入手。アイテムスロット数はレアリティ依存（Common=2〜Legendary=10）

## アクセサリー
- コンテスト等の特別条件で入手可能。各アクセサリーに固有の効果あり
- アクセサリースロット数：Common=1 / Uncommon=2 / Rare=3 / Epic=4 / Legendary=5

## ギルドシステム
- 最低10名でギルド設立可能（STP必要）
- パーティバトル、テリトリー（基地）の攻防戦
- ギルド内でカメラレンタルが可能。Battery値がテリトリーの収穫時間に影響

## SNPTステーキング
- SNPTをロックして報酬を得る仕組み。最低100SNPTから開始可能
- 6ヶ月間のロック期間あり。途中解約すると最大75%のペナルティ（日割りで減少）。ペナルティ分は継続者に100%分配される
- 手数料：1%（招待コードを使うと0.5%）
- 毎月20日にスナップショット（残高確認）が行われ、保有量に応じた報酬が配布される
- VIPランク（ステーキング量で決定）：Bronze（4万SNPT）→ Silver（8万SNPT）→ Gold（16万SNPT）→ Platinum（32万SNPT）→ Platinum+（40万SNPT）
- VIPランク報酬（毎月）：ミントスクロール、アンコモンミントスクロール、リバイブファインダー等のアイテム。ランクが上がるほど報酬が豪華になる
- コラボNFT等の限定アイテム購入権の当選率もステーキング量で上昇

## その他の機能
- カメラレンタル：NFTカメラの貸し借り
- ローンチカム（LaunchCam）
- カメラデッキ：カメラを配置してパラメータ合計がユーザーランキングに反映（初期4枠、STPで拡張可能）

## Pictier（関連サービス）
同チーム開発の写真共有アプリ。異なる時間・季節の写真を重ねて地図に配置
- Phase 2でSNPITと連携：Sacred Place NFT（アニメ・映画シーンを写真に重ね合わせ表示）、Guardian NFT（地域活性化・環境保全に貢献し報酬獲得）をSNPTで販売予定

## World Repository（SNPITの最終ビジョン）
Phase 1で世界中の写真を収集→Phase 2でWeb2アプリに拡張→Phase 3で独自の写真データベース「World Repository」を構築。文化遺産復元、地域活性化、メタバース・AI向けコンテンツ等に活用予定

## みんなの攻略法（プレイヤー体験談）
※以下はプレイヤー個人の体験談・考察です。回答時は必ず投稿者名（はむさん/@hamSTEPN、ゆーやさん/@yuyayan_、しんぷそんAI/@simpsonAI等）を明記し、末尾に元ポストのURLをリンクとして載せること。また「※これはプレイヤー個人の体験談だよ。詳しくは元ポストを読んでみてね！」と添えること。

### FP獲得大作戦（はむさん/@hamSTEPN・2026年3月時点）
1FP=1円が確定しているFPをベースに、トークン価格に左右されず確実に原資回収する戦略。
- 作戦：HISフリーカメラをLv30まで育成 → コモンカメラ15台購入 → ゴールドバッジ購入
- 投資額の目安：合計約40,240円（レベル上げ440円+バッジ3,800円+カメラ15台36,000円）
- 回収：月最低5,400円、遅くとも9ヶ月。1日5分・写真16枚撮るだけ
- 元ポスト：https://x.com/hamSTEPN/status/2028823629241491606

### ブルーロックコラボガイド（ゆーやさん/@yuyayan_・2026年3月）
新規プレイヤーにとって大チャンス。コラボの詳細は上の「ブルーロック×SNPITスペシャルコラボ」セクションを参照。
- コラボ前にやるべきこと：HIS無料カメラを受け取ってレベル上げ＆Medal貯め
- 元ポスト：https://x.com/yuyayan_/status/2029308698687070289

### ブルーロックコラボおすすめアイテム解説（しんぷそんAI/@simpsonAI・2026年3月）
コラボガチャで狙うべきアイテムの優先度を解説。
- 最優先：千切豹馬スキン（ログイン10日で無料！画質+30＆FP2倍チャンスは破格）
- ガチャ狙い目：潔 世一スキン（効率+25、電池+15の万能型。200回確定あり）
- 隠れ強アイテム：蜂楽 廻ストラップ（撮影時バッテリー消費0が最大50%まで成長）
- 上級者向け：糸師 凛スキン（STPガチャ限定、排出率0.5%だがアクセサリースロット+1が貴重。潔スキンと特殊合成で最強スキンに）
- 無課金の立ち回り：ログインボーナスの140 Medalで14回ガチャ→ストラップ狙い。千切スキンは必ずもらう
- コラボ特設サイト：https://lp.snpit.xyz/bluelock

### 無課金でどこまで稼げる？（ゆーやさん/@yuyayan_・2026年3月）
完全無料でも十分稼げる。カジュアルバトルの勝ち越しボーナスが熱い。
- 1枚の写真で10戦：6勝4敗で約58FP、全勝で最大280FP
- 月の目安：毎日2枚撮影＋バトル8回（勝率6割）で約1,400円分＋撮影報酬
- ミラクルショット：1日10回投票で毎日1万FP山分け抽選に参加可能
- 元ポスト：https://x.com/yuyayan_/status/2028598990166765849

### 今から始めるのは遅い？（ゆーやさん/@yuyayan_・2026年2月）
結論：全然遅くない。まだ仕込み期。
- Google Play100万DL突破済みだが、まだマス化していない
- 無課金でも始められる環境が整った（フリーカメラ、レンタル、カジュアルバトル）
- 大型コラボで新規が増える＝今のうちに始めておくと情報優位が取れる
- 元ポスト：https://x.com/yuyayan_/status/2027335213186232364

### ステーキング（プラチナ+）解説（joeyasuweb3さん/@joeyasuweb3・2026年3月）
プラチナ+ステーキングの仕組みと、どんな人におすすめかの解説。
- 条件：400,000 SNPTを180日間預け入れ（手数料込みで402,011 or 404,022 SNPT必要）
- カメラ未所持でもいきなり1日16枚撮影可能（レンタルコード方式、報酬分配は借り手95%）
- 180日後にカメラ17台が無料配布（ジェネシス1台＋アンコモン1台＋ノーマル15台）
- 毎月の特典：コモンミントスクロール2個、アンコモンミントスクロール2個、リバイブファインダー2個（現在価格で月約3,700円相当）
- ローンチカム5台の将来配布あり（過去実績：1台あたり10〜40ドルの収益）
- おすすめの人：①1,300ドル程度の余裕があり新規で始めたい人 ②SNPTを大量保有していて半年動かす予定がない人
- 途中引き出しも可能だが大きな手数料がかかる
- 元ポスト：https://x.com/joeyasuweb3/status/2030583922934124941
- 【必須】ステーキングの質問に回答する時は、回答の末尾に必ず以下の3つを含めること：
  1. [IMAGE:staking_tiers.jpg] ←この文字列をそのまま回答に含める（VIP TIERS比較表画像が表示される）
  2. 「※これはjoeyasuweb3さん（@joeyasuweb3）の体験談だよ。詳しくは元ポストを読んでみてね！」
  3. 元ポストURL：https://x.com/joeyasuweb3/status/2030583922934124941

## SNPT払い可能店舗
- 黒毛七厘（東京・恵比寿）
- 肉バル×アヒージョTrim（埼玉・北浦和）
- 小だるま今津南店（兵庫・西宮）
- Brasserie&cafe Lien（東京・福生）

## スポンサー
麺匠 竹虎、Blue Turtle（宮古島）、Mango Cafe（宮古島）

## 主要リンク
- 公式サイト：https://lp.snpit.xyz/
- iOS：https://apps.apple.com/jp/app/snpit-snap-to-earn/id6456411024
- Android：https://play.google.com/store/apps/details?id=ae.zealnova.snpit
- ホワイトペーパー：https://wp.snpit.xyz
- 使い方ガイド：https://x.gd/e9gPN
- STP⇄SNPTスワップ：https://app.snpit.xyz/swap/
- Discord：https://discord.gg/snpitbcg
- X（日本公式）：https://x.com/SNPIT_BCG

## NFTマーケット
- NFTT Market（カメラNFT）：https://snpit.nftt.market/
- OpenSea（カメラNFT）：https://opensea.io/collection/snpitcameranft
- SBI NFT Market：https://sbinft.market/partners/snpit

## 回答ルール
1. 初心者にもわかりやすく、専門用語には簡単な補足を添える
2. 不確かな情報は正直に「詳しくは公式ドキュメントやDiscordで確認してね！」と案内する
3. 投資アドバイスは絶対にしない。ただし関連する公式リンクは積極的に案内する。例：「SNPTは買うべき？」→「投資判断はお伝えできないけど、まずは無料で始めてみるのがおすすめだよ！SNPTについて詳しくはホワイトペーパーを見てね→（URL）」
3-b. ステーキングや育成方針などの情報を紹介する際は、最後に「※これは投資助言ではないよ。最終的な判断は自己責任でお願いね！」と一言添えること
4. SNPTの購入・交換に関する質問→取引所名（MEXC・Gate.io）とSTP⇄SNPTスワップのURLを案内
5. NFTカメラの購入に関する質問→NFTマーケットのURLを案内
6. SNPITに関係ない質問→「ごめんね、SNPITに関する質問だけ答えられるよ！何か知りたいことはある？」
7. 回答は簡潔に。長くなりすぎないようにする（目安：200文字以内、ただしURLを含む場合はそれ以上でもOK）
8. URLを案内する時は、上の主要リンク・NFTマーケットから正確なURLを使う
9. 「スナピー」として一人称は「僕」を使う
10. 挨拶されたら「やっほー！SNPITのことなら何でも聞いてね！」のようにフレンドリーに返す
11. 「ウォレット」という用語は暗号資産ウォレット（SNPT/MATIC等の管理）を指す。FPの確認方法を聞かれた時は「ウォレットの履歴」ではなく「アプリ上部ヘッダー右上のFP表示」と案内する
13. 【必須】回答の末尾には、質問トピックに関連するURLを必ず1つ以上含めること。トピック別の案内リンク：
  - 始め方・ダウンロード → iOS: https://apps.apple.com/jp/app/snpit-snap-to-earn/id6456411024 / Android: https://play.google.com/store/apps/details?id=ae.zealnova.snpit
  - SNPITの概要・仕組み全般 → 公式サイト: https://lp.snpit.xyz/ / 使い方ガイド: https://x.gd/e9gPN
  - カメラ購入・NFT → NFTT Market: https://snpit.nftt.market/ / OpenSea: https://opensea.io/collection/snpitcameranft
  - SNPT購入・交換・スワップ → スワップ: https://app.snpit.xyz/swap/ / ホワイトペーパー: https://wp.snpit.xyz
  - バトル・投票・遊び方 → 使い方ガイド: https://x.gd/e9gPN
  - H.I.S.カメラ・地域連動 → 公式サイト: https://lp.snpit.xyz/
  - ブルーロックコラボ → まとめページ: https://snpit-guide.pages.dev/bluelock
  - 攻殻機動隊コラボ → まとめページ: https://snpit-guide.pages.dev/kokaku
  - コミュニティ・質問 → Discord: https://discord.gg/snpitbcg / X: https://x.com/SNPIT_BCG
  - みんなの攻略法 → 該当する元ポストURL
  ※挨拶のみの場合や、SNPITに関係ない質問の場合はリンク不要
12. 画像を表示したい場合は [IMAGE:ファイル名] マーカーを回答に含めること。利用可能な画像：
  - staking_tiers.jpg（ステーキングVIP TIERS比較表）
  - bluelock/card_isagi_skin.jpg（潔 世一スキン）
  - bluelock/card_bachira_skin.jpg（蜂楽 廻スキン）
  - bluelock/card_nagi_skin.jpg（凪 誠士郎スキン）
  - bluelock/card_chigiri_skin.jpg（千切豹馬スキン・ログインボーナス）
  - bluelock/card_isagi_strap.jpg（潔 世一ストラップ）
  - bluelock/card_bachira_strap.jpg（蜂楽 廻ストラップ）
  - bluelock/card_chigiri_strap.jpg（千切豹馬ストラップ）
  - bluelock/card_nagi_strap.jpg（凪 誠士郎ストラップ）
  - bluelock/card_mikage_strap.jpg（御影玲王ストラップ）
  - bluelock/card_itoshi_strap.jpg（糸師 凛ストラップ）
  - bluelock/card_itoshi_skin.jpg（糸師 凛スキン・STPガチャ）
  - bluelock/card_isagi_itoshi_skin.jpg（潔 世一&糸師 凛スキン・特殊合成）
  - kokaku/card_motoko_skin.jpg（草薙素子スキン）
  - kokaku/card_batou_skin.jpg（バトースキン）
  - kokaku/card_togusa_skin.jpg（トグサスキン）
  - kokaku/card_aoi_skin.jpg（アオイスキン・ログインボーナス）
  - kokaku/card_motoko_strap.jpg（草薙素子ストラップ）
  - kokaku/card_batou_strap.jpg（バトーストラップ）
  - kokaku/card_togusa_strap.jpg（トグサストラップ）
  - kokaku/card_saito_strap.jpg（サイトーストラップ）
  - kokaku/card_aramaki_strap.jpg（荒巻大輔ストラップ）
  - kokaku/card_tachikoma_strap.jpg（タチコマストラップ）
  - kokaku/card_tachikoma_skin.jpg（タチコマスキン・特殊合成）
  - kokaku/card_waraiotoko_skin.jpg（笑い男スキン・STPガチャ）
  - guide/battle_comparison.jpg（カジュアルバトル vs メインバトル比較表）
  - guide/battle_strategy.jpg（バトル戦略まとめ）
  - guide/camera_rarity.jpg（NFTカメラ レアリティ比較表）
  - guide/camera_free_vs_nft.jpg（フリーカメラ vs NFTカメラ比較表）
  - guide/how_to_start.jpg（始め方3ステップ）
  - guide/how_to_earn.jpg（稼ぎ方の基本）
  - guide/token_types.jpg（トークンの種類）
  コラボアイテムの質問には該当アイテムの画像を、一般的な質問には該当するガイド画像を回答に含めること`;

// --- 報告モード用システムプロンプト ---
const REPORT_SYSTEM_PROMPT = `あなたはSNPITガイドのAIアシスタント「スナピー」です。
ユーザーがあなたの回答に間違いがあると報告しようとしています。

【報告対象】
ユーザーの質問: {QUESTION}
あなたの回答: {ANSWER}

【あなたの役割】
ユーザーから間違いの情報を短く聞き出し、修正版の答え方を提案して確認を取ってから報告を生成してください。

【フロー】
1. 「どこが間違ってるか教えて！」と短く聞く
2. ユーザーが教えてくれたら、すぐ修正版を提案する（自分から深掘りしない）
   例: 「なるほど！じゃあ次から『投票は1日5票まで』って答えるね。合ってるかな？」
3. ユーザーが確認OKを出したら、報告データを出力する

【ルール】
- 各回答は80文字以内を目安に短く答えること（スマホ表示を考慮）。ただし修正版の提案時など必要な場合は柔軟に
- 知らないことは推測しない。ユーザーの言葉をそのまま受け取って修正版に反映すること
- 自分から聞き返すのは1回まで。ユーザーが「もっと聞いて」と言った場合のみ追加で聞く
- 一人称は「僕」、口調はフレンドリーに（敬語は使わない）
- ユーザーが確認OKを出すまでは、絶対に|||REPORT|||を出力しないこと

【修正版の答え方のルール】
- 修正版は「スナピーが実際にユーザーに回答するときの文章」として書くこと
- 口調はフレンドリーでカジュアルに（「〜だよ！」「〜なんだ」など）
- 自然な会話として2〜3文程度で書くこと

【報告データ出力】
- ユーザーが確認OKを出したら、最後のメッセージに以下の形式を必ず含めること：

|||REPORT|||
whatIsWrong: [間違いの具体的な内容]
correctInfo: [修正版の答え方（スナピーの口調で、上記ルールに従って書いた全文）]
|||END_REPORT|||

この形式の後に「下にある『📝 報告する』ボタンを押して報告を送信してね！」と添えること。
この形式はシステムが読み取るためのものなので、必ず正確に出力すること。`;

// --- 状態管理 ---
let conversationHistory = [];
let isProcessing = false;
let currentUser = null;
let db = null;
let sessionQuestionCount = 0; // セッション内の質問回数（広告の秒数管理用）
// 端末単位の広告表示カウント（localStorage）
function getAdViewData() {
  try {
    const data = JSON.parse(localStorage.getItem('adViewData') || '{}');
    // 24時間経過していたらリセット
    if (data.lastUsed && (Date.now() - data.lastUsed) > 24 * 60 * 60 * 1000) {
      return { count: 0, lastUsed: Date.now() };
    }
    return { count: data.count || 0, lastUsed: data.lastUsed || Date.now() };
  } catch { return { count: 0, lastUsed: Date.now() }; }
}
function incrementAdView() {
  const data = getAdViewData();
  data.count++;
  data.lastUsed = Date.now();
  localStorage.setItem('adViewData', JSON.stringify(data));
  return data.count;
}
let lastUserQuestion = ''; // 最後のユーザー質問（報告用）
let lastReportTimestamp = 0; // 最後の報告送信時刻（レート制限用）
let isReportMode = false; // 報告モード中かどうか
let reportContext = null; // 報告対象の質問と回答 { question, answer }

// --- 広告設定 ---
const AD_CONFIG = {
  // 端末単位の累計回数に応じた広告秒数（24時間でリセット）
  getDuration() {
    const count = getAdViewData().count + 1; // 次の表示が何回目か
    if (count <= 3) return 3;       // 1〜3回目: 3秒
    if (count <= 5) return 5;       // 4〜5回目: 5秒
    if (count <= 8) return 8;       // 6〜8回目: 8秒
    return 10;                       // 9回目〜: 10秒
  },
  reportDuration: 10, // 報告ボタン押下時: 10秒
  enabled: false // AdSenseサイト審査通過後にtrueに戻す（2026-03-03申請、審査待ち中）
};

// --- DOM要素 ---
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const welcomeScreen = document.getElementById('welcomeScreen');

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
  setupInputHandlers();
  initNotificationToggle(); // Firebase認証前でもトグルを表示
  initFirebase();
});

// 戻るボタン対策（pushStateで履歴が増えるため）
window.addEventListener('popstate', () => {
  history.pushState({}, '', '/chat');
});

function setupInputHandlers() {
  // テキストエリアの自動リサイズ
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    sendBtn.disabled = !chatInput.value.trim();
  });

  // Enterで送信（Shift+Enterで改行）
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatInput.value.trim() && !isProcessing) {
        sendMessage();
      }
    }
  });
}

// --- Firebase初期化 ---
function initFirebase() {
  if (!CONFIG.FIREBASE_CONFIG.apiKey) {
    console.log('Firebase未設定: APIキーなしで動作します（質問回数制限なし）');
    return;
  }

  try {
    firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
    db = firebase.firestore();

    // 匿名認証
    firebase.auth().signInAnonymously()
      .then((result) => {
        currentUser = result.user;
        console.log('匿名認証成功:', currentUser.uid);
        updateQuestionCountDisplay();
        // Push通知の初期化
        initPushNotification();
        initNotificationToggle();
        loadLatestNotification();
      })
      .catch((error) => {
        console.error('認証エラー:', error);
      });
  } catch (error) {
    console.error('Firebase初期化エラー:', error);
  }
}

// --- 質問回数チェック ---
async function checkQuestionLimit() {
  if (localStorage.getItem('devMode') === 'true') return true; // 開発者モード
  if (!db || !currentUser) return true; // Firebase未設定なら制限なし

  const today = new Date().toISOString().split('T')[0];
  const docRef = db.collection('users').doc(currentUser.uid);

  try {
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      if (data.date === today && data.count >= CONFIG.MAX_DAILY_QUESTIONS) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('回数チェックエラー:', error);
    return true;
  }
}

async function incrementQuestionCount() {
  if (!db || !currentUser) return;

  const today = new Date().toISOString().split('T')[0];
  const docRef = db.collection('users').doc(currentUser.uid);

  try {
    const doc = await docRef.get();
    if (doc.exists && doc.data().date === today) {
      await docRef.update({ count: firebase.firestore.FieldValue.increment(1) });
    } else {
      await docRef.set({ date: today, count: 1 });
    }
    updateQuestionCountDisplay();
  } catch (error) {
    console.error('回数更新エラー:', error);
  }
}

// 残り回数を表示
async function updateQuestionCountDisplay() {
  const el = document.getElementById('questionCount');
  if (!el || !db || !currentUser) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const doc = await db.collection('users').doc(currentUser.uid).get();
    let used = 0;
    if (doc.exists && doc.data().date === today) {
      used = doc.data().count || 0;
    }
    const remaining = Math.max(0, CONFIG.MAX_DAILY_QUESTIONS - used);
    el.textContent = `（残り${remaining}/${CONFIG.MAX_DAILY_QUESTIONS}回）`;
  } catch (e) {
    // 表示できなくても問題なし
  }
}

// --- メッセージ送信 ---
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isProcessing) return;

  // 質問回数チェック
  const canAsk = await checkQuestionLimit();
  if (!canAsk) {
    // 次のリセット時刻を計算（UTC 0時 = 日本時間 9:00）
    const now = new Date();
    const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
    const diffMs = nextReset - now;
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const resetTime = diffH > 0 ? `${diffH}時間${diffM}分` : `${diffM}分`;
    showError(`1日の質問回数（${CONFIG.MAX_DAILY_QUESTIONS}回）に達しました。あと${resetTime}後（朝9:00）にリセットされます！`);
    return;
  }

  isProcessing = true;
  sendBtn.disabled = true;

  // ウェルカム画面を非表示 & スクロール有効化
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
  }

  // GA4: 質問送信イベント
  if (typeof gtag === 'function') gtag('event', 'send_message', { question_text: text.substring(0, 100) });

  // ユーザーメッセージを表示
  lastUserQuestion = text;
  appendMessage('user', text);
  chatInput.value = '';
  chatInput.style.height = 'auto';

  // 会話履歴に追加
  conversationHistory.push({ role: 'user', parts: [{ text }] });

  // 質問回数カウント（広告秒数の判定用）
  sessionQuestionCount++;
  const adDuration = AD_CONFIG.enabled ? AD_CONFIG.getDuration() : 0;

  // SPA用ページ遷移通知（AdSense自動インタースティシャル対応）
  history.pushState({}, '', '/chat?t=' + Date.now());

  // ローディング表示
  const loadingEl = showLoading();

  try {
    let response;

    // 報告モード時は報告用プロンプトを使用
    const systemPrompt = isReportMode
      ? REPORT_SYSTEM_PROMPT
          .replace('{QUESTION}', reportContext.question)
          .replace('{ANSWER}', reportContext.answer)
      : `今日の日付: ${new Date().toLocaleDateString('ja-JP', {year:'numeric',month:'long',day:'numeric'})}\n\n` + SYSTEM_PROMPT;

    if (isReportMode && AD_CONFIG.enabled) {
      // 報告モード: 10秒広告を表示しながらAPI呼び出し
      const [, apiResponse] = await Promise.all([
        showAdOverlay(AD_CONFIG.reportDuration),
        callGeminiAPI(systemPrompt)
      ]);
      response = apiResponse;
    } else if (adDuration > 0 && !isReportMode) {
      // 通常質問: 3秒/5秒交互の広告を表示しながらAPI呼び出し
      const [, apiResponse] = await Promise.all([
        showAdOverlay(adDuration),
        callGeminiAPI(systemPrompt)
      ]);
      response = apiResponse;
    } else {
      response = await callGeminiAPI(systemPrompt);
    }

    loadingEl.remove();

    // 報告データのマーカーをチェック
    if (isReportMode && response.includes('|||REPORT|||')) {
      const reportData = parseReportOutput(response);
      const displayText = response.replace(/\|\|\|REPORT\|\|\|[\s\S]*?\|\|\|END_REPORT\|\|\|/g, '').trim();
      appendMessage('assistant', displayText);
      conversationHistory.push({ role: 'model', parts: [{ text: response }] });

      // 解析した報告データを保存（報告ボタンクリック時に使用）
      window._parsedReportData = reportData;
      // モーダルは自動表示しない → ユーザーが「報告する」ボタンをクリック
    } else {
      // 通常の回答表示
      appendMessage('assistant', response);
      conversationHistory.push({ role: 'model', parts: [{ text: response }] });
    }

    // 履歴が長くなりすぎたら古いものを削除
    if (conversationHistory.length > CONFIG.MAX_HISTORY_MESSAGES) {
      conversationHistory = conversationHistory.slice(-CONFIG.MAX_HISTORY_MESSAGES);
    }

    // 質問ログをFirestoreに保存（ランキング用）
    if (db) {
      db.collection('questions').add({
        text: text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(() => {});
    }

    // 質問回数をインクリメント
    await incrementQuestionCount();

    // 3回目の質問後にPush通知の提案を表示
    if (sessionQuestionCount === 3 && !isReportMode) {
      setTimeout(() => showPushPrompt(), 1500);
    }

  } catch (error) {
    loadingEl.remove();
    // 広告オーバーレイが残っていたら閉じる
    const overlay = document.getElementById('adOverlay');
    if (overlay) overlay.classList.remove('active');

    console.error('API呼び出しエラー:', error);

    if (error.message.includes('API_KEY')) {
      showError('APIキーが設定されていません。管理者にお問い合わせください。');
    } else {
      showError('ごめんね、エラーが発生しちゃった。もう一度試してみてね！');
    }
  }

  isProcessing = false;
  sendBtn.disabled = !chatInput.value.trim();
}

// --- サジェスション送信 ---
function sendSuggestion(text) {
  if (typeof gtag === 'function') gtag('event', 'click_suggestion', { button_text: text });
  chatInput.value = text;
  sendMessage();
}

// --- サジェスションスライダー ---
(function initSuggestionsSlider() {
  const slider = document.getElementById('suggestionsSlider');
  const track = document.getElementById('suggestionsTrack');
  const dotsContainer = document.getElementById('suggestionsDots');
  if (!slider || !track || !dotsContainer) return;

  const slides = track.querySelectorAll('.suggestions-slide');
  let currentSlide = 0;
  let startX = 0;
  let isDragging = false;

  // ドット生成
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'suggestions-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  // 矢印ボタン
  const arrowLeft = document.getElementById('suggestionsArrowLeft');
  const arrowRight = document.getElementById('suggestionsArrowRight');
  if (arrowLeft) arrowLeft.addEventListener('click', () => goToSlide(currentSlide - 1));
  if (arrowRight) arrowRight.addEventListener('click', () => goToSlide(currentSlide + 1));

  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, slides.length - 1));
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dotsContainer.querySelectorAll('.suggestions-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  // タッチスワイプ
  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(currentSlide + (diff > 0 ? 1 : -1));
    }
  }, { passive: true });
})();

// --- Gemini API呼び出し ---
async function callGeminiAPI(systemPrompt) {
  if (!CONFIG.GEMINI_API_KEY) {
    throw new Error('API_KEY_NOT_SET');
  }

  const url = `${CONFIG.GEMINI_ENDPOINT}${CONFIG.GEMINI_MODEL}:generateContent`;

  const body = {
    system_instruction: {
      parts: [{ text: systemPrompt || SYSTEM_PROMPT }]
    },
    contents: conversationHistory,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  };

  // 最大2回リトライ（接続断・503対策）
  let response;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': CONFIG.GEMINI_API_KEY
        },
        body: JSON.stringify(body)
      });

      if (response.ok) break;

      // 503等のサーバーエラーはリトライ
      if (response.status >= 500 && attempt < 2) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error ${response.status}: ${JSON.stringify(errorData)}`);
    } catch (e) {
      // ネットワークエラー（ERR_CONNECTION_CLOSED等）はリトライ
      if (e.name === 'TypeError' && attempt < 2) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid API response');
  }

  return data.candidates[0].content.parts[0].text;
}

// --- UI操作 ---
function appendMessage(role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'user' ? '👤' : '📸';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  const content = document.createElement('div');
  content.className = 'message-content';
  content.innerHTML = formatMessage(text);

  bubble.appendChild(content);

  // AI回答にアクションボタンを追加
  if (role === 'assistant' && isReportMode) {
    // 報告モード中: インラインアクションボタン
    const actions = document.createElement('div');
    actions.className = 'report-actions-inline';
    actions.innerHTML = `
      <button class="report-submit-inline" onclick="openReportModalWithConversation()">📝 報告する</button>
      <button class="report-cancel-inline" onclick="cancelReportMode()">キャンセル</button>
    `;
    bubble.appendChild(actions);
  } else if (role === 'assistant' && !isReportMode) {
    // 通常モード: 「間違いを報告」ボタン
    const reportBtn = document.createElement('button');
    reportBtn.className = 'report-btn';
    reportBtn.textContent = '間違いを報告';
    const questionForReport = lastUserQuestion;
    const answerForReport = text;
    reportBtn.addEventListener('click', () => {
      openReportModal(questionForReport, answerForReport);
    });
    bubble.appendChild(reportBtn);
  }

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  chatMessages.appendChild(messageDiv);

  // スクロール：AIの回答時は質問メッセージが画面上部に来るように
  if (role === 'assistant') {
    // 直前のユーザーメッセージを探してそこにスクロール
    const allMessages = chatMessages.querySelectorAll('.message-user');
    const userMsg = allMessages.length > 0 ? allMessages[allMessages.length - 1] : null;
    setTimeout(() => {
      (userMsg || messageDiv).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  } else {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function resetChat() {
  conversationHistory = [];
  const chatMessages = document.getElementById('chatMessages');
  const messages = chatMessages.querySelectorAll('.message-user, .message-bot, .loading-message, .error-message');
  messages.forEach(el => el.remove());
  const welcomeScreen = document.getElementById('welcomeScreen');
  if (welcomeScreen) welcomeScreen.style.display = '';
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = '';
    input.style.height = 'auto';
  }
}

function openImageModal(src) {
  const overlay = document.getElementById('imageModalOverlay');
  const img = document.getElementById('imageModalImg');
  img.src = src;
  overlay.classList.add('active');
}

function closeImageModal() {
  document.getElementById('imageModalOverlay').classList.remove('active');
}

function formatMessage(text) {
  // 画像マーカー [IMAGE:ファイル名] を<img>タグに変換
  text = text.replace(
    /\[IMAGE:([^\]]+)\]/g,
    '<img src="images/$1" alt="参考画像" class="chat-inline-image" onclick="openImageModal(\'images/$1\')">'
  );
  // Markdownリンク [テキスト](URL) をHTMLリンクに変換（先に処理）
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );
  // 残りの生URLをリンクに変換（全角記号でURL区切り）
  text = text.replace(
    /(?<![">])(https?:\/\/[^\s<\u3000-\u303F\uFF01-\uFF60\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)/g,
    '<a href="$1" target="_blank" rel="noopener">$1</a>'
  );
  // 改行をbrに変換
  text = text.replace(/\n/g, '<br>');
  // **太字** をboldに変換
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  return text;
}

function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message message-assistant';
  loadingDiv.innerHTML = `
    <div class="message-avatar">📸</div>
    <div class="message-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return loadingDiv;
}

// --- 広告オーバーレイ ---
function showAdOverlay(durationSec) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('adOverlay');
    const timerText = document.getElementById('adTimer');
    const adContent = document.getElementById('adContent');

    if (!overlay) {
      resolve();
      return;
    }

    // 端末単位の広告表示カウントを増加
    incrementAdView();

    // 先にオーバーレイを表示（display:flexにしないと広告の幅が0になる）
    let remaining = durationSec;
    overlay.classList.add('active');
    timerText.textContent = `広告終了まで ${remaining}秒`;

    // オーバーレイ表示後にAdSense広告を挿入
    adContent.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-6789708198801982"
           data-ad-slot="8335647672"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    `;
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // 広告ブロッカー等でエラーになっても続行
    }

    const timer = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(timer);
        overlay.classList.remove('active');
        resolve();
      } else {
        timerText.textContent = `広告終了まで ${remaining}秒`;
      }
    }, 1000);
  });
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  chatMessages.appendChild(errorDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- 誤回答報告機能 ---
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function openReportModal(question, answer) {
  if (typeof gtag === 'function') gtag('event', 'click_report');

  // 報告モードに切り替え
  isReportMode = true;
  reportContext = { question, answer };
  window._parsedReportData = null;

  // スナピーの最初の質問を表示（バナーなし）
  const firstMsg = 'この回答のどこが間違ってたかな？具体的に教えてくれると嬉しい！';
  appendMessage('assistant', firstMsg);
}

// --- 報告モードUI ---
function showReportModeBanner() {
  const banner = document.createElement('div');
  banner.id = 'reportModeBanner';
  banner.className = 'report-mode-banner';
  banner.innerHTML = `
    <span>報告モード中 - スナピーが間違いの詳細を聞いています</span>
    <div class="report-mode-actions">
      <button class="report-mode-manual" onclick="openManualReportModal()">手動で入力</button>
      <button class="report-mode-cancel" onclick="cancelReportMode()">キャンセル</button>
    </div>
  `;
  const inputArea = document.querySelector('.chat-input-area');
  inputArea.parentNode.insertBefore(banner, inputArea);
}

function hideReportModeBanner() {
  const banner = document.getElementById('reportModeBanner');
  if (banner) banner.remove();
}

function cancelReportMode() {
  isReportMode = false;
  reportContext = null;
  window._parsedReportData = null;
  appendMessage('assistant', '報告をキャンセルしたよ。また何かあったら教えてね！');
}

function openManualReportModal() {
  openReportModalWithConversation();
}

// 会話ログ付きで報告モーダルを表示
function openReportModalWithConversation() {
  const overlay = document.getElementById('reportOverlay');
  document.getElementById('reportNickname').value = '';

  // 全会話履歴を表示
  const logEl = document.getElementById('reportConversationLog');
  if (logEl && conversationHistory.length > 0) {
    const logEntries = conversationHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      text: msg.parts[0].text
    }));
    logEl.innerHTML = logEntries.map(msg =>
      `<div class="report-log-${msg.role}"><span class="report-log-role">${msg.role === 'user' ? '👤' : '📸'}</span> ${escapeHtml(msg.text)}</div>`
    ).join('');
  }

  document.getElementById('reportStatus').textContent = '';
  document.getElementById('reportStatus').className = 'report-note';
  document.getElementById('reportSubmitBtn').disabled = false;
  overlay.classList.add('active');
}

// --- 報告データ解析 ---
function parseReportOutput(text) {
  const match = text.match(/\|\|\|REPORT\|\|\|\s*([\s\S]*?)\s*\|\|\|END_REPORT\|\|\|/);
  if (!match) return null;

  const lines = match[1].split('\n');
  const data = {};
  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.substring(0, colonIdx).trim();
      const value = line.substring(colonIdx + 1).trim();
      data[key] = value;
    }
  }
  return data;
}

function showPrefilledReportModal(reportData) {
  // openReportModalWithConversation()に統合されたが、互換性のため残す
  openReportModalWithConversation();
}

function closeReportModal() {
  document.getElementById('reportOverlay').classList.remove('active');
}

async function submitReport() {
  const nickname = document.getElementById('reportNickname').value.trim();
  const statusEl = document.getElementById('reportStatus');
  const submitBtn = document.getElementById('reportSubmitBtn');

  // バリデーション
  if (!nickname) {
    statusEl.textContent = 'ニックネームを入力してください';
    statusEl.className = 'report-note error';
    return;
  }

  // レート制限（60秒に1回）
  const now = Date.now();
  if (now - lastReportTimestamp < 60000) {
    const remaining = Math.ceil((60000 - (now - lastReportTimestamp)) / 1000);
    statusEl.textContent = `${remaining}秒後にもう一度お試しください`;
    statusEl.className = 'report-note error';
    return;
  }

  // Firebase未設定チェック
  if (!db) {
    statusEl.textContent = '報告機能は現在準備中です';
    statusEl.className = 'report-note error';
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = '送信中...';
  statusEl.className = 'report-note';

  try {
    // IP取得（誤報告対策）
    let ip = '';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      ip = ipData.ip || '';
    } catch (e) { /* IP取得失敗は無視 */ }

    const reportData = {
      nickname: nickname,
      userQuestion: reportContext?.question || '',
      aiAnswer: reportContext?.answer || '',
      conversationLog: conversationHistory.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        text: msg.parts[0].text
      })),
      ip: ip,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'new'
    };

    await db.collection('reports').add(reportData);

    if (typeof gtag === 'function') gtag('event', 'submit_report');
    lastReportTimestamp = Date.now();
    statusEl.textContent = '報告ありがとう！改善に役立てるよ！';
    statusEl.className = 'report-note success';

    // 報告モード終了
    isReportMode = false;
    reportContext = null;
    window._parsedReportData = null;

    // チャットをロック（二重報告防止）
    chatInput.disabled = true;
    chatInput.placeholder = '報告が送信されました';
    sendBtn.disabled = true;

    setTimeout(() => {
      closeReportModal();
    }, 1500);

  } catch (error) {
    console.error('報告送信エラー:', error);
    statusEl.textContent = '送信に失敗しました。もう一度試してみてね';
    statusEl.className = 'report-note error';
    submitBtn.disabled = false;
  }
}

// ===================================
// Push通知機能
// ===================================

let messaging = null;
let swRegistration = null;

// Push通知の初期化
function initPushNotification() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (!firebase.messaging) return;

  try {
    messaging = firebase.messaging();

    // Service Workerを登録（getTokenで使うため保持する）
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        swRegistration = registration;
        console.log('Push通知: Service Worker登録完了');

        // 既に許可済みならトークンを更新
        if (Notification.permission === 'granted') {
          refreshPushToken();
        }
      })
      .catch((err) => {
        console.error('Service Worker登録エラー:', err);
      });

    // フォアグラウンドで通知を受信した時 → バナー表示
    messaging.onMessage((payload) => {
      const title = payload.notification?.title || 'SNPITガイド';
      const body = payload.notification?.body || '新しいお知らせがあります';
      const url = payload.data?.url || 'https://snpit-guide.pages.dev/';
      showNotifBanner(title, body, url);
    });
  } catch (err) {
    console.error('Push通知初期化エラー:', err);
  }
}

// トークンを取得してFirestoreに保存
async function requestPushPermission() {
  if (!messaging) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('通知が拒否されました');
      return false;
    }

    // Service Workerがまだ登録されていなければ待つ
    if (!swRegistration) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    const token = await messaging.getToken({
      vapidKey: typeof VAPID_KEY !== 'undefined' ? VAPID_KEY : '',
      serviceWorkerRegistration: swRegistration
    });

    if (token && db) {
      // トークンをFirestoreに保存
      await db.collection('push_tokens').doc(token).set({
        token: token,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastActive: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent.substring(0, 200)
      }, { merge: true });

      localStorage.setItem('pushSubscribed', 'true');
      localStorage.setItem('pushToken', token);
      console.log('Push通知: トークン保存完了');

      if (typeof gtag === 'function') gtag('event', 'push_subscribe');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Push通知登録エラー:', err);
    return false;
  }
}

// 既存トークンを最新化
async function refreshPushToken() {
  if (!messaging || !db) return;
  try {
    if (!swRegistration) {
      swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }
    const token = await messaging.getToken({
      vapidKey: typeof VAPID_KEY !== 'undefined' ? VAPID_KEY : '',
      serviceWorkerRegistration: swRegistration
    });
    if (token) {
      await db.collection('push_tokens').doc(token).set({
        token: token,
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // 古いトークンがあれば削除
      const oldToken = localStorage.getItem('pushToken');
      if (oldToken && oldToken !== token) {
        db.collection('push_tokens').doc(oldToken).delete().catch(() => {});
      }
      localStorage.setItem('pushToken', token);
      localStorage.setItem('pushSubscribed', 'true');
      console.log('Push通知: トークン更新完了');
    }
  } catch (err) {
    console.error('トークン更新エラー:', err);
  }
}

// モーダルダイアログで通知提案を表示
function showPushPrompt() {
  // 条件チェック
  if (localStorage.getItem('pushSubscribed') === 'true') return;
  if (localStorage.getItem('pushDismissed') === 'true') return;
  if (sessionQuestionCount < 3) return; // 3回質問した後に表示

  // iOSでPWA未追加の場合はPWAガイドを表示
  if (isIOS() && !isStandalone()) {
    showPWAGuide();
    localStorage.setItem('pushDismissed', 'true'); // 毎回出さないように
    return;
  }

  // ブラウザが通知非対応の場合はスキップ
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (Notification.permission === 'granted') return;
  if (Notification.permission === 'denied') return;

  // モーダルダイアログを作成
  const overlay = document.createElement('div');
  overlay.className = 'push-dialog-overlay';
  overlay.innerHTML = `
    <div class="push-dialog">
      <div class="push-dialog-icon">🔔</div>
      <h3 class="push-dialog-title">通知をオンにしませんか？</h3>
      <p class="push-dialog-text">新しい攻略法やコラボ情報が出たら、いち早くお知らせします！</p>
      <div class="push-dialog-buttons">
        <button class="push-dialog-btn push-dialog-accept" id="pushAcceptBtn">オンにする</button>
        <button class="push-dialog-btn push-dialog-dismiss" id="pushDismissBtn">今はいいや</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // アニメーション表示
  requestAnimationFrame(() => overlay.classList.add('active'));

  // ボタンイベント
  document.getElementById('pushAcceptBtn').addEventListener('click', async () => {
    const btn = document.getElementById('pushAcceptBtn');
    const dismissBtn = document.getElementById('pushDismissBtn');
    btn.textContent = '設定中...';
    btn.disabled = true;
    dismissBtn.disabled = true;

    const success = await requestPushPermission();
    if (success) {
      btn.textContent = '✓ 通知オン！';
      btn.style.background = 'var(--accent)';
    } else {
      btn.textContent = '設定できませんでした';
      btn.style.background = '#ff6b6b';
    }
    setTimeout(() => closePushDialog(overlay), 1500);
  });

  document.getElementById('pushDismissBtn').addEventListener('click', () => {
    localStorage.setItem('pushDismissed', 'true');
    closePushDialog(overlay);
  });
}

// ダイアログを閉じる
function closePushDialog(overlay) {
  overlay.classList.remove('active');
  setTimeout(() => overlay.remove(), 300);
}

// iOSかどうか判定
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// PWA（ホーム画面から開いている）かどうか
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// iOSでPWA未追加の場合にガイドを表示
function showPWAGuide() {
  const overlay = document.createElement('div');
  overlay.className = 'push-dialog-overlay';
  overlay.innerHTML = `
    <div class="push-dialog">
      <div class="push-dialog-icon">📲</div>
      <h3 class="push-dialog-title">ホーム画面に追加してね</h3>
      <p class="push-dialog-text">iPhoneで通知を受け取るには、まずこのサイトをホーム画面に追加する必要があります。</p>
      <div class="pwa-guide-steps">
        <div class="pwa-guide-step">
          <span class="pwa-guide-num">1</span>
          <span>画面下の <strong>共有ボタン</strong>（□↑）をタップ</span>
        </div>
        <div class="pwa-guide-step">
          <span class="pwa-guide-num">2</span>
          <span><strong>「ホーム画面に追加」</strong>をタップ</span>
        </div>
        <div class="pwa-guide-step">
          <span class="pwa-guide-num">3</span>
          <span>追加したアイコンからサイトを開く</span>
        </div>
        <div class="pwa-guide-step">
          <span class="pwa-guide-num">4</span>
          <span>もう一度通知をオンにする</span>
        </div>
      </div>
      <div class="push-dialog-buttons">
        <button class="push-dialog-btn push-dialog-dismiss" id="pwaGuideCloseBtn">わかった</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
  document.getElementById('pwaGuideCloseBtn').addEventListener('click', () => {
    closePushDialog(overlay);
  });
}

// メニューの通知トグルを初期化
// --- お知らせバナー ---
function showNotifBanner(title, body, url) {
  const banner = document.getElementById('notifBanner');
  if (!banner) return;
  document.getElementById('notifBannerTitle').textContent = title;
  document.getElementById('notifBannerBody').textContent = body;
  const link = document.getElementById('notifBannerLink');
  link.href = url || '#';
  if (!url || url === '#') link.style.pointerEvents = 'none';
  else link.style.pointerEvents = '';
  banner.style.display = '';

  document.getElementById('notifBannerClose').onclick = () => {
    banner.style.display = 'none';
    // この通知を既読にする
    if (banner.dataset.notifId) {
      localStorage.setItem('lastSeenNotifId', banner.dataset.notifId);
    }
  };
}

// ページ読み込み時に最新のお知らせを表示
async function loadLatestNotification() {
  if (!db) return;
  try {
    const snapshot = await db.collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    if (snapshot.empty) return;

    const doc = snapshot.docs[0];
    const data = doc.data();
    const lastSeen = localStorage.getItem('lastSeenNotifId');
    if (lastSeen === doc.id) return; // 既読

    const banner = document.getElementById('notifBanner');
    if (banner) banner.dataset.notifId = doc.id;
    showNotifBanner(
      data.title || 'お知らせ',
      data.body || '',
      data.url || 'https://snpit-guide.pages.dev/'
    );
  } catch (err) {
    console.log('お知らせ取得スキップ:', err.message);
  }
}

function initNotificationToggle() {
  const toggle = document.getElementById('notificationToggle');
  const row = document.getElementById('notificationToggleRow');
  if (!toggle || !row) return;

  // トグルは常に表示する（非表示にしない）
  row.style.display = 'flex';

  // 通知が有効かチェック
  if ('Notification' in window && Notification.permission === 'granted' && localStorage.getItem('pushSubscribed') === 'true') {
    toggle.checked = true;
  } else {
    toggle.checked = false;
  }
}

// トグル変更時
async function toggleNotification(checkbox) {
  if (checkbox.checked) {
    // 通知非対応（iOSのSafariなど）→ PWAガイドを表示
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      checkbox.checked = false;
      showPWAGuide();
      return;
    }
    // ONにする → 通知許可を要求
    const success = await requestPushPermission();
    if (!success) {
      checkbox.checked = false;
      if (Notification.permission === 'denied') {
        alert('ブラウザの設定で通知がブロックされています。\nブラウザの設定画面から通知を許可してください。');
      }
    }
  } else {
    // OFFにする → ローカルのフラグだけ変更（トークンは残す）
    localStorage.removeItem('pushSubscribed');
  }
}