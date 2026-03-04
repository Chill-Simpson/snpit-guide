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

let db = null;
let editingDocId = null; // 編集中のドキュメントID
let editingData = null; // 編集中のデータ

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

function createReportCard(docId, data) {
  const card = document.createElement('div');
  card.className = 'report-card';

  // ステータスバッジ
  const statusBadge = data.status === 'resolved'
    ? '<span class="report-card-status resolved">対応済み</span>'
    : '';

  // 対応メモ
  const adminNote = data.adminNote
    ? `<div class="report-card-admin-note">
        <span class="report-card-admin-note-label">対応メモ:</span>
        <span class="report-card-admin-note-text">${escapeHtml(data.adminNote)}</span>
      </div>`
    : '';

  // 対応済み かつ 正しい情報がある場合は修正版レイアウト
  const isResolved = data.status === 'resolved' && data.correctInfo;

  if (isResolved) {
    card.innerHTML = `
      <div class="report-card-header">
        <div class="report-card-header-left">
          <span class="report-card-nickname">${escapeHtml(data.nickname)}</span>
          ${statusBadge}
        </div>
        <span class="report-card-date">${formatDate(data.createdAt)}</span>
      </div>
      <div class="report-card-body">
        <div class="report-card-field">
          <span class="report-card-label">質問:</span>
          <span class="report-card-value">${escapeHtml(data.userQuestion)}</span>
        </div>
        <div class="report-card-corrected">
          <div class="report-card-corrected-label">&#10003; 修正版の回答</div>
          <div class="report-card-corrected-text">${escapeHtml(data.correctInfo)}</div>
        </div>
        ${adminNote}
        <details class="report-card-details">
          <summary class="report-card-details-toggle">報告の詳細を見る</summary>
          <div class="report-card-details-content">
            <div class="report-card-field">
              <span class="report-card-label">AI回答（修正前）:</span>
              <span class="report-card-value">${escapeHtml(data.aiAnswer)}</span>
            </div>
            <div class="report-card-highlight">
              <span class="report-card-highlight-icon">&#9888;</span>
              <div>
                <div class="report-card-highlight-label">間違いの指摘:</div>
                <div class="report-card-highlight-text">${escapeHtml(data.whatIsWrong)}</div>
              </div>
            </div>
          </div>
        </details>
      </div>
      <div class="report-card-footer">
        <button class="report-card-edit-btn" onclick="openEditModal('${docId}')">編集</button>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="report-card-header">
        <div class="report-card-header-left">
          <span class="report-card-nickname">${escapeHtml(data.nickname)}</span>
          ${statusBadge}
        </div>
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
        ${adminNote}
      </div>
      <div class="report-card-footer">
        <button class="report-card-edit-btn" onclick="openEditModal('${docId}')">編集</button>
      </div>
    `;
  }

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
    db = firebase.firestore();

    // 匿名認証でサインイン（編集機能に必要）
    firebase.auth().signInAnonymously().catch((error) => {
      console.error('匿名認証エラー:', error);
    });

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
          const card = createReportCard(doc.id, doc.data());
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

// --- 編集機能 ---
function openEditModal(docId) {
  if (!db) return;

  editingDocId = docId;

  // Firestoreからデータ取得
  db.collection('reports').doc(docId).get().then((doc) => {
    if (!doc.exists) return;
    editingData = doc.data();

    document.getElementById('editWhatIsWrong').value = editingData.whatIsWrong || '';
    document.getElementById('editCorrectInfo').value = editingData.correctInfo || '';
    document.getElementById('editAdminNote').value = editingData.adminNote || '';
    document.getElementById('editStatusSelect').value = editingData.status || 'new';
    document.getElementById('editNickname').value = '';
    document.getElementById('editStatusMsg').textContent = '';
    document.getElementById('editStatusMsg').className = 'edit-note';
    document.getElementById('editSubmitBtn').disabled = false;
    document.getElementById('editOverlay').classList.add('active');
  }).catch((error) => {
    console.error('報告取得エラー:', error);
  });
}

function closeEditModal() {
  document.getElementById('editOverlay').classList.remove('active');
  editingDocId = null;
  editingData = null;
}

async function submitEdit() {
  const whatIsWrong = document.getElementById('editWhatIsWrong').value.trim();
  const correctInfo = document.getElementById('editCorrectInfo').value.trim();
  const adminNote = document.getElementById('editAdminNote').value.trim();
  const status = document.getElementById('editStatusSelect').value;
  const editorNickname = document.getElementById('editNickname').value.trim();
  const statusEl = document.getElementById('editStatusMsg');
  const submitBtn = document.getElementById('editSubmitBtn');

  if (!editorNickname) {
    statusEl.textContent = 'ニックネームを入力してください';
    statusEl.className = 'edit-note error';
    return;
  }
  if (!whatIsWrong) {
    statusEl.textContent = '間違いの内容を入力してください';
    statusEl.className = 'edit-note error';
    return;
  }

  submitBtn.disabled = true;
  statusEl.textContent = '保存中...';
  statusEl.className = 'edit-note';

  try {
    // ニックネームを追記（既存名と重複しなければ）
    let updatedNickname = editingData.nickname || '';
    if (!updatedNickname.includes(editorNickname)) {
      updatedNickname = updatedNickname
        ? `${updatedNickname}, ${editorNickname}`
        : editorNickname;
    }

    await db.collection('reports').doc(editingDocId).update({
      whatIsWrong: whatIsWrong,
      correctInfo: correctInfo,
      adminNote: adminNote,
      status: status,
      nickname: updatedNickname,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    statusEl.textContent = '保存しました！';
    statusEl.className = 'edit-note success';

    setTimeout(() => {
      closeEditModal();
    }, 1000);

  } catch (error) {
    console.error('編集エラー:', error);
    statusEl.textContent = '保存に失敗しました。もう一度お試しください';
    statusEl.className = 'edit-note error';
    submitBtn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', initReports);
