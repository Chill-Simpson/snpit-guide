// Firebase Messaging Service Worker
// Push通知をバックグラウンドで受信・表示する

importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB4DKpWh1tuKJZGQoX6IgNvniMrITGXJuE',
  authDomain: 'snpit-guide.firebaseapp.com',
  projectId: 'snpit-guide',
  storageBucket: 'snpit-guide.firebasestorage.app',
  messagingSenderId: '788074705330',
  appId: '1:788074705330:web:2fdb2bc36731bb37ac34ab'
});

const messaging = firebase.messaging();

// バックグラウンドで通知を受信した時の処理
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'SNPITガイド';
  const options = {
    body: payload.notification?.body || '新しいお知らせがあります',
    icon: '/images/icon-192.svg',
    badge: '/images/icon-192.svg',
    data: {
      url: payload.data?.url || '/'
    }
  };
  self.registration.showNotification(title, options);
});

// 通知をクリックした時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // 既に開いているタブがあればフォーカス
      for (const client of windowClients) {
        if (client.url.includes('snpit-guide.pages.dev') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // なければ新しいタブで開く
      return clients.openWindow(url);
    })
  );
});
