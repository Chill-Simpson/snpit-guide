// ===================================
// 通知管理ページ
// ===================================

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyB4DKpWh1tuKJZGQoX6IgNvniMrITGXJuE',
  authDomain: 'snpit-guide.firebaseapp.com',
  projectId: 'snpit-guide',
  storageBucket: 'snpit-guide.firebasestorage.app',
  messagingSenderId: '788074705330',
  appId: '1:788074705330:web:2fdb2bc36731bb37ac34ab'
};

const ADMIN_UID = 'EWRWzpV4SxZsfS2uDPZlwedMRJ83';
// Cloudflare Worker のURL（デプロイ後に設定）
const WORKER_URL = 'https://snpit-guide-push.airsori-info.workers.dev';

let db = null;
let isAdmin = false;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.firestore();
});

// 管理者ログイン
async function adminLogin() {
  const statusEl = document.getElementById('loginStatus');
  statusEl.textContent = 'ログイン中...';
  statusEl.className = 'notif-status';

  try {
    // メールアドレスとパスワードで認証
    const credentials = await fetch('/.snpit-admin-credentials')
      .then(r => r.text())
      .then(t => {
        const lines = t.trim().split('\n');
        return { email: lines[0], password: lines[1] };
      })
      .catch(() => null);

    if (!credentials) {
      // 認証情報ファイルがない場合は匿名認証を試す
      const result = await firebase.auth().signInAnonymously();
      if (result.user.uid !== ADMIN_UID) {
        statusEl.textContent = '管理者権限がありません';
        statusEl.className = 'notif-status error';
        return;
      }
    } else {
      await firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password);
    }

    const user = firebase.auth().currentUser;
    if (user && user.uid === ADMIN_UID) {
      isAdmin = true;
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('adminSection').style.display = '';
      loadTokenCount();
      loadHistory();
    } else {
      statusEl.textContent = '管理者権限がありません';
      statusEl.className = 'notif-status error';
    }
  } catch (error) {
    console.error('ログインエラー:', error);
    statusEl.textContent = 'ログインに失敗しました: ' + error.message;
    statusEl.className = 'notif-status error';
  }
}

// 登録トークン数を取得
async function loadTokenCount() {
  try {
    const snapshot = await db.collection('push_tokens').get();
    document.getElementById('tokenCount').textContent = snapshot.size + ' 人';
  } catch (error) {
    document.getElementById('tokenCount').textContent = '取得エラー';
    console.error('トークン数取得エラー:', error);
  }
}

// 通知を送信
async function sendNotification() {
  const title = document.getElementById('notifTitle').value.trim();
  const body = document.getElementById('notifBody').value.trim();
  const url = document.getElementById('notifUrl').value.trim();
  const statusEl = document.getElementById('sendStatus');
  const sendBtn = document.getElementById('sendNotifBtn');

  if (!title || !body) {
    statusEl.textContent = 'タイトルと本文を入力してください';
    statusEl.className = 'notif-status error';
    return;
  }

  sendBtn.disabled = true;
  statusEl.textContent = '送信中...';
  statusEl.className = 'notif-status';

  try {
    if (WORKER_URL) {
      // Cloudflare Worker経由で送信
      const idToken = await firebase.auth().currentUser.getIdToken();
      const response = await fetch(WORKER_URL + '/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + idToken
        },
        body: JSON.stringify({ title, body, url })
      });

      const result = await response.json();
      if (response.ok) {
        statusEl.textContent = `送信完了！ ${result.successCount || 0} 件に送信されました`;
        statusEl.className = 'notif-status success';
      } else {
        throw new Error(result.error || '送信に失敗しました');
      }
    } else {
      // Worker未設定の場合はFirestoreに保存のみ
      statusEl.textContent = 'Worker未設定のため、Firestoreに記録のみ行います';
      statusEl.className = 'notif-status';
    }

    // Firestoreに通知履歴を保存
    await db.collection('notifications').add({
      title,
      body,
      url: url || 'https://snpit-guide.pages.dev/',
      status: WORKER_URL ? 'sent' : 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      sentBy: firebase.auth().currentUser.uid
    });

    // フォームをリセット
    document.getElementById('notifTitle').value = '';
    document.getElementById('notifBody').value = '';
    document.getElementById('notifUrl').value = 'https://snpit-guide.pages.dev/chat';

    if (!WORKER_URL) {
      statusEl.textContent = 'Firestoreに記録しました（Worker設定後に実際の送信が可能になります）';
      statusEl.className = 'notif-status success';
    }

    // 履歴を更新
    loadHistory();
  } catch (error) {
    console.error('送信エラー:', error);
    statusEl.textContent = '送信に失敗しました: ' + error.message;
    statusEl.className = 'notif-status error';
  }

  sendBtn.disabled = false;
}

// 送信履歴を読み込み
async function loadHistory() {
  const container = document.getElementById('notifHistory');

  try {
    const snapshot = await db.collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<p class="notif-history-empty">まだ通知を送信していません</p>';
      return;
    }

    container.innerHTML = '';
    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.createdAt ? formatDate(data.createdAt) : '日時不明';
      const item = document.createElement('div');
      item.className = 'notif-history-item';
      item.innerHTML = `
        <div class="notif-history-header">
          <span class="notif-history-title">${escapeHtml(data.title)}</span>
          <span class="notif-history-date">${date}</span>
        </div>
        <div class="notif-history-body">${escapeHtml(data.body)}</div>
        <div class="notif-history-meta">${data.status === 'sent' ? '送信済み' : '未送信'} | ${escapeHtml(data.url || '')}</div>
      `;
      container.appendChild(item);
    });
  } catch (error) {
    console.error('履歴取得エラー:', error);
    container.innerHTML = '<p class="notif-card-text">履歴の取得に失敗しました</p>';
  }
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${h}:${min}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
