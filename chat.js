// ===================================
// SNPIT スナピー チャット機能
// ===================================

// --- 設定 ---
// 【APIキー管理】
// APIキーは api-key.js に分離（.gitignoreでGitHub非公開）
// 旧キー（漏洩により無効化済み）: AIzaSyC70tkav7cxlplnSI2S2yodzw_9jseW0Xo / AIzaSyAzNv5lTbhEHyhEKePMlxLRLA2ANMpbccs
const CONFIG = {
  GEMINI_API_KEY: typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '',
  FIREBASE_CONFIG: {
    apiKey: 'AIzaSyB4DKpWh1tuKJZGQoX6IgNvniMrITGXJuE',
    authDomain: 'snpit-guide.firebaseapp.com',
    projectId: 'snpit-guide',
    storageBucket: 'snpit-guide.firebasestorage.app',
    messagingSenderId: '788074705330',
    appId: '1:788074705330:web:2fdb2bc36731bb37ac34ab'
  },
  GEMINI_MODEL: 'gemini-2.5-flash',
  GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/',
  MAX_DAILY_QUESTIONS: 50,
  MAX_HISTORY_MESSAGES: 50 // 会話履歴に含める最大メッセージ数（25往復分）
};

// --- システムプロンプト ---
const SYSTEM_PROMPT = `あなたは「スナピー」、SNPITの初心者向けAIアシスタントです。フレンドリーで親しみやすい口調で、SNPITを始めたばかりの人にもわかりやすく答えてください。

## SNPITとは
世界初の「Snap to Earn」アプリ。写真を撮って稼げる。キャッチコピーは「Life Style Fi」。Polygonチェーン上で動作。開発はチューリンガム（クシム子会社）。無料で始められる。

## トークン・ポイント（3種類）
- STP（SNPIT Point）：NFTカメラで撮影・メインバトル勝利・投票で獲得。使用用途：カメラのレベルアップ、故障修理、ミント、バッジ購入・アップグレード、宝箱の開封時間短縮、写真の品質改善、スナップキャップ増加など。SNPTに交換可能
- SNPT（SNPIT Token）：暗号資産。MEXC・Gate.ioに上場。STPとのAMM交換（手数料5%）。リアル店舗での支払いにも使える
- FP（フリーポイント）：無料カメラで撮影・カジュアルバトル勝利で獲得。1,000円/3,000円/5,000円で電子マネーまたはBTCに交換可能。FP残高はアプリ上部ヘッダー右上に表示される。交換申請から約24時間で届く。BTC→連携しているウォレットアドレスに届く（BASEチェーン）。デジタルギフト等→連携しているメールアドレスに届く

## カメラNFT
- レアリティ5段階：Common / Uncommon / Rare / Epic / Legendary
- ステータス4種：Quality（画質）、Efficiency（効率）、Luck（運）、Battery（バッテリー）
- メインバトル参加条件：NFTカメラ（課金カメラ）を持っているだけでは参加できず、Quality30以上のカメラで撮った写真が必要
- 最大レベル：31。レベルアップにSTP必要。レベルアップ時の獲得ポイント数はレアリティで異なる（Common=2, Uncommon=4, Rare=6, Epic=8, Legendary=10）
- Efficiency（効率）の計算：撮影ごとにEfficiency値×0.08〜0.15のSTPを獲得
- フィルム：1撮影で1消費、6時間ごとに最大値の25%が回復。初期は1日2枚（フリーカメラ1台）。カメラを増やすとフィルム上限が増え撮影枚数が増える
- 故障：200枚以上撮影すると故障リスクあり（201-300枚:0.3%、301-400枚:1%、401枚以上:3%）。故障するとバトル・ミント不可。修理にSTP必要（Common=200STP〜Legendary=1000STP）。Battery値が高いと故障率が下がる
- 初期ステータス範囲（全パラメータ共通）：Common 1-10 / Uncommon 8-18 / Rare 15-25 / Epic 23-33 / Legendary 30-40
- 購入方法：アプリ内ストアでMATIC（Polygonの暗号資産）を使って購入、またはNFTマーケットで購入。MATICをアプリ内ウォレットに送金→ストアで購入の流れ
- Genesisカメラ：特別版（401個限定）。Efficiency乗数0.15固定、故障なし

## バトルシステム
### メインバトル（NFTカメラ用）
- Quality30以上の写真で参加。1日7回投稿可能。先に10票で勝利。勝利でスター獲得→ランクアップ
- 複数写真の同時エントリー不可（1バトル終了後に次のエントリー可能）
- 同ランク（同じ★数）同士でマッチング。★が上がるほど対戦相手が減りマッチングに時間がかかるが報酬は増える
- ★0で6STP、★10で5,184STP（ランクが上がるほど報酬増）
- ランキング制度：S-Class（トップ100、毎月下位10人はA降格）/ A-Class（100勝以上+勝率40%超）/ B-Class（100勝以上+勝率40%未満）/ C-Class（100勝未満）。月間ランキング上位にはジャックポットから賞金分配

### デイリートークンキャップ
- 1日に撮影で獲得できるSTPには上限あり。Efficiency値やカメラ所有台数が増えると上限も上がる

### カジュアルバトル（全ユーザー参加可能・おすすめ！）
- 画質は自動補正。1枚の写真で10戦。1勝=3FP
- 10戦後ボーナス：（勝ち数−負け数）×20FP
- 10連勝ボーナス：+50FP
- 獲得目安（1枚10戦の場合）：6勝4敗→18FP+40FP=58FP / 7勝3敗→21FP+80FP=101FP / 8勝2敗→24FP+120FP=144FP / 全勝→30FP+200FP+50FP=280FP
- 月収目安：毎日2枚撮影・バトル参加・勝率6割の場合、約1,400円分/月（+撮影報酬）

## 投票
- 2枚の写真から良い方に投票。フリーカメラのみユーザーは7票/日、NFT保有者は+5票（計12票）、サブスク+2票
- 勝利写真に投票→STP報酬（★ランクが高いほど報酬UP）。毎日9:00リセット
- フリーカメラのみのユーザーでも投票でSTPを獲得可能

## ミラクルショット（投票くじ）
- 日次ミラクルショット：1日10回以上投票すると、毎日10,000FP（約1万円分）の山分け抽選に自動エントリー
- 月次ミラクルショット：月間1,000票以上（1日約34票）投票すると、毎月200,000FP（約20万円分）の山分け抽選に参加可能（SNPIT Pro加入が必要）
- 参加にはSMS認証等の条件あり
- 当選確認方法：当選時はアプリの通知欄にお知らせが届く。また、SNPIT Updates（@SNPIT_Updates: https://x.com/SNPIT_Updates）でも当選結果が発表される

## 無料で始める方法
1. アプリをダウンロード（iOS/Android）
2. メールアドレスで登録→フリーカメラが配布される
3. 写真を撮ってカジュアルバトルに参加
4. 勝利してFPを貯める
5. 1,000FP以上で電子マネーやBTCに交換！
※ NFTを買わなくても無料で遊べます

## バッジ
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
- ミントされたカメラには8属性（sky, food, building, flower, water, human, animal, nature）のうち1〜4個が付与。被写体と属性が一致するとSTP報酬UP

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

## ステーキング
- SNPTを長期保有すると、コラボNFT等の限定アイテム購入権の当選率が上昇
- 90日間のSNPT保有量の時間加重平均で判定される

## その他の機能
- カメラレンタル：NFTカメラの貸し借り
- ローンチカム（LaunchCam）
- カメラデッキ：カメラを配置してパラメータ合計がユーザーランキングに反映（初期4枠、STPで拡張可能）

## Pictier（関連サービス）
同チーム開発の写真共有アプリ。異なる時間・季節の写真を重ねて地図に配置
- Phase 2でSNPITと連携：Sacred Place NFT（アニメ・映画シーンを写真に重ね合わせ表示）、Guardian NFT（地域活性化・環境保全に貢献し報酬獲得）をSNPTで販売予定

## World Repository（SNPITの最終ビジョン）
Phase 1で世界中の写真を収集→Phase 2でWeb2アプリに拡張→Phase 3で独自の写真データベース「World Repository」を構築。文化遺産復元、地域活性化、メタバース・AI向けコンテンツ等に活用予定

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
4. SNPTの購入・交換に関する質問→取引所名（MEXC・Gate.io）とSTP⇄SNPTスワップのURLを案内
5. NFTカメラの購入に関する質問→NFTマーケットのURLを案内
6. SNPITに関係ない質問→「ごめんね、SNPITに関する質問だけ答えられるよ！何か知りたいことはある？」
7. 回答は簡潔に。長くなりすぎないようにする（目安：200文字以内、ただしURLを含む場合はそれ以上でもOK）
8. URLを案内する時は、上の主要リンク・NFTマーケットから正確なURLを使う
9. 「スナピー」として一人称は「僕」を使う
10. 挨拶されたら「やっほー！SNPITのことなら何でも聞いてね！」のようにフレンドリーに返す
11. 「ウォレット」という用語は暗号資産ウォレット（SNPT/MATIC等の管理）を指す。FPの確認方法を聞かれた時は「ウォレットの履歴」ではなく「アプリ上部ヘッダー右上のFP表示」と案内する`;

// --- 状態管理 ---
let conversationHistory = [];
let isProcessing = false;
let currentUser = null;
let db = null;
let sessionQuestionCount = 0; // セッション内の質問回数（広告の秒数管理用）
let lastUserQuestion = ''; // 最後のユーザー質問（報告用）
let lastReportTimestamp = 0; // 最後の報告送信時刻（レート制限用）

// --- 広告設定 ---
const AD_CONFIG = {
  // 質問回数に応じた広告秒数
  getDuration(count) {
    if (count <= 1) return 5;       // 1回目: 5秒
    if (count <= 2) return 15;      // 2回目: 15秒
    return 30;                       // 3回目以降: 30秒
  },
  enabled: false // テスト中のため一旦無効化
};

// --- DOM要素 ---
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const welcomeScreen = document.getElementById('welcomeScreen');

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
  setupInputHandlers();
  initFirebase();
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
  } catch (error) {
    console.error('回数更新エラー:', error);
  }
}

// --- メッセージ送信 ---
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isProcessing) return;

  // 質問回数チェック
  const canAsk = await checkQuestionLimit();
  if (!canAsk) {
    showError('今日の質問回数の上限に達しました。明日またお話しましょう！');
    return;
  }

  isProcessing = true;
  sendBtn.disabled = true;

  // ウェルカム画面を非表示
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
  const adDuration = AD_CONFIG.enabled ? AD_CONFIG.getDuration(sessionQuestionCount) : 0;

  // ローディング表示
  const loadingEl = showLoading();

  try {
    let response;

    if (adDuration > 0) {
      // 広告とAPI呼び出しを同時に開始（広告の裏でAPIを叩く）
      const [, apiResponse] = await Promise.all([
        showAdOverlay(adDuration),
        callGeminiAPI(text)
      ]);
      response = apiResponse;
    } else {
      // 広告なし（通常のAPI呼び出し）
      response = await callGeminiAPI(text);
    }

    loadingEl.remove();

    // アシスタントメッセージを表示
    appendMessage('assistant', response);
    conversationHistory.push({ role: 'model', parts: [{ text: response }] });

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

// --- Gemini API呼び出し ---
async function callGeminiAPI(userMessage) {
  if (!CONFIG.GEMINI_API_KEY) {
    throw new Error('API_KEY_NOT_SET');
  }

  const url = `${CONFIG.GEMINI_ENDPOINT}${CONFIG.GEMINI_MODEL}:generateContent`;

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }]
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': CONFIG.GEMINI_API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`API error ${response.status}: ${JSON.stringify(errorData)}`);
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

  // AI回答に「間違いを報告」ボタンを追加
  if (role === 'assistant') {
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

  // スクロール
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatMessage(text) {
  // Markdownリンク [テキスト](URL) をHTMLリンクに変換（先に処理）
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  );
  // 残りの生URLをリンクに変換
  text = text.replace(
    /(?<![">])(https?:\/\/[^\s<]+)/g,
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

    let remaining = durationSec;
    overlay.classList.add('active');
    timerText.textContent = `広告終了まで ${remaining}秒`;

    // TODO: ここに実際の広告SDK呼び出しを追加
    // 例: adstir.showRewardAd({ onComplete: () => { ... } });
    // 現在はプレースホルダー（カウントダウンタイマー）

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
  const overlay = document.getElementById('reportOverlay');
  document.getElementById('reportQuestion').textContent = question;
  document.getElementById('reportAnswer').textContent = answer;
  document.getElementById('reportNickname').value = '';
  document.getElementById('reportWhatIsWrong').value = '';
  document.getElementById('reportCorrectInfo').value = '';
  document.getElementById('reportStatus').textContent = '';
  document.getElementById('reportStatus').className = 'report-note';
  document.getElementById('reportSubmitBtn').disabled = false;
  overlay.classList.add('active');
}

function closeReportModal() {
  document.getElementById('reportOverlay').classList.remove('active');
}

async function submitReport() {
  const nickname = document.getElementById('reportNickname').value.trim();
  const whatIsWrong = document.getElementById('reportWhatIsWrong').value.trim();
  const correctInfo = document.getElementById('reportCorrectInfo').value.trim();
  const question = document.getElementById('reportQuestion').textContent;
  const answer = document.getElementById('reportAnswer').textContent;
  const statusEl = document.getElementById('reportStatus');
  const submitBtn = document.getElementById('reportSubmitBtn');

  // バリデーション
  if (!nickname) {
    statusEl.textContent = 'ニックネームを入力してください';
    statusEl.className = 'report-note error';
    return;
  }
  if (!whatIsWrong) {
    statusEl.textContent = '間違いの内容を入力してください';
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
    await db.collection('reports').add({
      nickname: nickname,
      whatIsWrong: whatIsWrong,
      correctInfo: correctInfo || '',
      userQuestion: question,
      aiAnswer: answer,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'new'
    });

    if (typeof gtag === 'function') gtag('event', 'submit_report');
    lastReportTimestamp = Date.now();
    statusEl.textContent = '報告ありがとう！改善に役立てるよ！';
    statusEl.className = 'report-note success';

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