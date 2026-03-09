// お知らせページ - Worker APIから通知履歴を取得して表示
(function() {
  var API_URL = 'https://snpit-guide-push.airsori-info.workers.dev/notifications';

  function formatDate(isoString) {
    if (!isoString) return '';
    var date = new Date(isoString);
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    var h = String(date.getHours()).padStart(2, '0');
    var min = String(date.getMinutes()).padStart(2, '0');
    return y + '/' + m + '/' + d + ' ' + h + ':' + min;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function loadNews() {
    var listEl = document.getElementById('newsList');
    var emptyEl = document.getElementById('newsEmpty');
    if (!listEl) return;

    try {
      var response = await fetch(API_URL);
      var data = await response.json();

      if (!data.notifications || data.notifications.length === 0) {
        listEl.style.display = 'none';
        emptyEl.style.display = '';
        return;
      }

      var html = '';
      data.notifications.forEach(function(item) {
        var dateStr = formatDate(item.createdAt);
        html += '<div class="news-item">';
        html += '<div class="news-item-date">' + dateStr + '</div>';
        if (item.url) {
          html += '<a href="' + escapeHtml(item.url) + '" class="news-item-title news-item-link">' + escapeHtml(item.title) + '</a>';
        } else {
          html += '<div class="news-item-title">' + escapeHtml(item.title) + '</div>';
        }
        if (item.body) {
          html += '<div class="news-item-body">' + escapeHtml(item.body) + '</div>';
        }
        html += '</div>';
      });

      listEl.innerHTML = html;
    } catch (err) {
      console.error('お知らせ取得エラー:', err);
      listEl.innerHTML = '<p class="news-empty-text">読み込みに失敗しました</p>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNews);
  } else {
    loadNews();
  }
})();
