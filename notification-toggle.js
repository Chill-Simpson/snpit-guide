// 通知トグル（全ページ共通）
(function() {
  var FIREBASE_CONFIG = {
    apiKey: 'AIzaSyB4DKpWh1tuKJZGQoX6IgNvniMrITGXJuE',
    authDomain: 'snpit-guide.firebaseapp.com',
    projectId: 'snpit-guide',
    storageBucket: 'snpit-guide.firebasestorage.app',
    messagingSenderId: '788074705330',
    appId: '1:788074705330:web:2fdb2bc36731bb37ac34ab'
  };

  // トグル初期化
  function initToggle() {
    var toggle = document.getElementById('notificationToggle');
    var row = document.getElementById('notificationToggleRow');
    if (!toggle || !row) return;
    row.style.display = 'flex';
    if ('Notification' in window && Notification.permission === 'granted' && localStorage.getItem('pushSubscribed') === 'true') {
      toggle.checked = true;
    } else {
      toggle.checked = false;
    }
  }

  // PWAガイド表示
  function showPWAGuide() {
    var overlay = document.createElement('div');
    overlay.className = 'push-dialog-overlay';
    overlay.innerHTML =
      '<div class="push-dialog">' +
        '<div class="push-dialog-icon">📲</div>' +
        '<h3 class="push-dialog-title">ホーム画面に追加してね</h3>' +
        '<p class="push-dialog-text">iPhoneで通知を受け取るには、まずこのサイトをホーム画面に追加する必要があります。</p>' +
        '<div class="pwa-guide-steps">' +
          '<div class="pwa-guide-step"><span class="pwa-guide-num">1</span><span>画面下の <strong>共有ボタン</strong>（□↑）をタップ</span></div>' +
          '<div class="pwa-guide-step"><span class="pwa-guide-num">2</span><span><strong>「ホーム画面に追加」</strong>をタップ</span></div>' +
          '<div class="pwa-guide-step"><span class="pwa-guide-num">3</span><span>追加したアイコンからサイトを開く</span></div>' +
          '<div class="pwa-guide-step"><span class="pwa-guide-num">4</span><span>もう一度通知をオンにする</span></div>' +
        '</div>' +
        '<div class="push-dialog-buttons">' +
          '<button class="push-dialog-btn push-dialog-dismiss" id="pwaGuideCloseBtn">わかった</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    requestAnimationFrame(function() { overlay.classList.add('active'); });
    document.getElementById('pwaGuideCloseBtn').addEventListener('click', function() {
      overlay.classList.remove('active');
      setTimeout(function() { overlay.remove(); }, 300);
    });
  }

  // Firebase初期化（このJS単独で動かすため）
  function ensureFirebase() {
    if (typeof firebase === 'undefined') return false;
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    return true;
  }

  // 通知許可を要求してトークンを保存
  async function requestPush() {
    if (!ensureFirebase()) return false;
    try {
      var permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      var messaging = firebase.messaging();
      var registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      var token = await messaging.getToken({ vapidKey: '', serviceWorkerRegistration: registration });

      if (token) {
        // Firestoreにトークン保存
        if (!firebase.auth().currentUser) {
          await firebase.auth().signInAnonymously();
        }
        var db = firebase.firestore();
        await db.collection('push_tokens').doc(token).set({
          token: token,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          userAgent: navigator.userAgent
        });
        localStorage.setItem('pushSubscribed', 'true');
        return true;
      }
      return false;
    } catch (err) {
      console.error('通知許可エラー:', err);
      return false;
    }
  }

  // トグル変更時（グローバルに公開）
  window.toggleNotification = async function(checkbox) {
    if (checkbox.checked) {
      // 通知非対応ブラウザ → PWAガイド
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        checkbox.checked = false;
        showPWAGuide();
        return;
      }
      // chat.jsのrequestPushPermissionがあればそちらを使う
      var fn = window.requestPushPermission || requestPush;
      var success = await fn();
      if (!success) {
        checkbox.checked = false;
        if (Notification.permission === 'denied') {
          alert('ブラウザの設定で通知がブロックされています。\nブラウザの設定画面から通知を許可してください。');
        }
      }
      initToggle();
    } else {
      localStorage.removeItem('pushSubscribed');
    }
  };

  // DOM読み込み後に初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }
})();
