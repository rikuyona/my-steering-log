// app.js - My Steering Log
// Handles saving/loading entries, rendering history, and streak calculation

const STORAGE_PREFIX = 'diary_';

function getTodayKey() {
  return STORAGE_PREFIX + new Date().toISOString().split('T')[0];
}

function gatherResponses() {
  const result = {};
  const radios = document.querySelectorAll('input[type=radio]');
  radios.forEach(r => {
    if (r.checked) {
      const q = r.name.replace(/___/g, ' / ');
      result[q] = r.value;
    }
  });
  const txt = document.getElementById('msg');
  if (txt) result['明日の自分へ'] = txt.value || '';
  return result;
}

function saveEntry() {
  const key = getTodayKey();
  const data = gatherResponses();
  localStorage.setItem(key, JSON.stringify(data));
  showSavedNotice();
  renderHistory();
}

function loadEntry(dateStr) {
  const key = STORAGE_PREFIX + dateStr;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function showSavedNotice() {
  const el = document.getElementById('saved');
  if (!el) return;
  el.textContent = '保存しました！';
  setTimeout(() => el.textContent = '', 2000);
}

function renderHistory() {
  const historyEl = document.getElementById('history');
  if (!historyEl) return;
  const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX)).sort().reverse();
  historyEl.innerHTML = '';
  if (keys.length === 0) {
    historyEl.innerHTML = '<p class="muted">まだ記録がありません。</p>';
    updateStreak(0);
    return;
  }
  const ul = document.createElement('ul');
  keys.forEach(k => {
    const date = k.replace(STORAGE_PREFIX, '');
    const li = document.createElement('li');
    const data = loadEntry(date);
    li.innerHTML = `<strong>${date}</strong> — ${data ? (data['気分'] || JSON.stringify(data)) : '（読み込めません）'}`;
    ul.appendChild(li);
  });
  historyEl.appendChild(ul);
  calculateAndShowStreak(keys);
}

function calculateAndShowStreak(keys) {
  // keys assumed sorted desc
  const dates = keys.map(k => k.replace(STORAGE_PREFIX, '')).sort(); // asc
  const today = new Date();
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = new Date(dates[i]);
    const daysDiff = Math.round((today - d)/(1000*60*60*24));
    // if date is within streak window (consecutive days)
  }
  // simpler: count consecutive days from most recent
  const seen = new Set(dates);
  let day = new Date();
  while (true) {
    const key = day.toISOString().split('T')[0];
    if (seen.has(key)) { streak++; day.setDate(day.getDate() - 1); } else break;
  }
  updateStreak(streak);
}

function updateStreak(n) {
  const el = document.getElementById('streak');
  if (!el) return;
  el.textContent = `連続記録: ${n}日`;
}

function init() {
  // attach save to button if exists
  const btn = document.querySelector('button[onclick="save()"], button#saveBtn');
  if (btn) btn.addEventListener('click', saveEntry);
  renderHistory();
}

window.addEventListener('load', init);

// expose save for compatibility with inline index
window.save = saveEntry;
