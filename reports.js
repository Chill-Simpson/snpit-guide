// ===================================
// 報告一覧ページ
// ===================================

// Firebase設定（chat.jsと同じ値を使う）
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyB4DKpWh1tuKJZGQoX6IgNvniMrITGXJuE',
  authDomain: 'snpit-guide.firebaseapp.com',
  projectId: 'snpit-guide',
  storageBucket: 'snpit-guide.firebasestorage.app',
  messagingSenderId: '788074705330',
  appId: '1:788074705330:web:2fdb2bc36731bb37ac34ab'
};

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

function createReportCard(data) {
  const card = document.createElement('div');
  card.className = 'report-card';

  card.innerHTML = `
    <div class="report-card-header">
      <span class="report-card-nickname">${escapeHtml(data.nickname)}</span>
      <span class="report-card-date">${formatDate(data.createdAt)}</span>
    </div>
    <div class="report-card-body">
      <div class="report-card-field">
        <span class="report-card-label">質問:</span>
        <span class="report-card-value">${escapeHtml(data.userQuestion)}</span>
      </div>
      <div class="report-card-field">
        <span class="report-card-label">AI回答:</span>
        <span class="report-card-value">${escapeHtml(data.aiAnswer)}</span>
      </div>
      <div class="report-card-highlight">
        <span class="report-card-highlight-icon">&#9888;</span>
        <div>
          <div class="report-card-highlight-label">間違いの指摘:</div>
          <div class="report-card-highlight-text">${escapeHtml(data.whatIsWrong)}</div>
        </div>
      </div>
      ${data.correctInfo ? `
      <div class="report-card-field">
        <span class="report-card-label">正しい情報:</span>
        <span class="report-card-value">${escapeHtml(data.correctInfo)}</span>
      </div>
      ` : ''}
    </div>
  `;

  return card;
}

function initReports() {
  if (!FIREBASE_CONFIG.apiKey) {
    document.getElementById('reportsLoading').style.display = 'none';
    document.getElementById('reportsEmpty').style.display = 'block';
    document.getElementById('reportsEmpty').querySelector('p').textContent = '報告機能は現在準備中です';
    return;
  }

  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    const db = firebase.firestore();

    // リアルタイムで報告を取得（新しい順）
    db.collection('reports')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .onSnapshot((snapshot) => {
        const listEl = document.getElementById('reportsList');
        const loadingEl = document.getElementById('reportsLoading');
        const emptyEl = document.getElementById('reportsEmpty');

        loadingEl.style.display = 'none';

        // 既存のカードをクリア（ローディング以外）
        const existingCards = listEl.querySelectorAll('.report-card');
        existingCards.forEach(card => card.remove());

        if (snapshot.empty) {
          emptyEl.style.display = 'block';
          return;
        }

        emptyEl.style.display = 'none';

        snapshot.forEach((doc) => {
          const card = createReportCard(doc.data());
          listEl.appendChild(card);
        });
      }, (error) => {
        console.error('報告取得エラー:', error);
        document.getElementById('reportsLoading').style.display = 'none';
        document.getElementById('reportsEmpty').style.display = 'block';
        document.getElementById('reportsEmpty').querySelector('p').textContent = 'データの読み込みに失敗しました';
      });

  } catch (error) {
    console.error('Firebase初期化エラー:', error);
    document.getElementById('reportsLoading').style.display = 'none';
    document.getElementById('reportsEmpty').style.display = 'block';
    document.getElementById('reportsEmpty').querySelector('p').textContent = 'エラーが発生しました';
  }
}

document.addEventListener('DOMContentLoaded', initReports);
