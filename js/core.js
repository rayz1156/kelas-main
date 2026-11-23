// Shared helpers. Everything runs in the browser; nothing is sent to a server.

export const $ = (sel, root = document) => root.querySelector(sel);

export function h(tag, attrs = {}, ...kids) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    node.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return node;
}

export const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
/** Pick n distinct items from arr, excluding any in `not`. */
export function sample(arr, n, not = []) {
  return shuffle(arr.filter((x) => !not.includes(x))).slice(0, n);
}

// localStorage can be blocked (private mode, school-managed browsers), so every call is guarded.
export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem('km:' + key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('km:' + key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
};

export const isMuted = () => store.get('mute', false);
export function setMuted(v) { store.set('mute', !!v); }

let audio;
const TUNES = { ok: [523, 659, 784], no: [247, 196], win: [523, 659, 784, 1047, 1319], tick: [880], start: [392, 523, 659], tap: [660] };
export function sfx(kind) {
  if (isMuted()) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    (TUNES[kind] || [440]).forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = kind === 'no' ? 'square' : 'triangle';
      osc.frequency.value = freq;
      const t = audio.currentTime + i * (kind === 'tap' ? 0 : 0.11);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(kind === 'no' ? 0.08 : 0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.connect(gain).connect(audio.destination);
      osc.start(t); osc.stop(t + 0.32);
    });
  } catch { /* audio not available */ }
}

/** Read text aloud with a Malay voice when the device has one (Indonesian is the fallback). */
export function speak(text) {
  try {
    if (isMuted() || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const v = voices.find((x) => /^ms/i.test(x.lang)) || voices.find((x) => /^id/i.test(x.lang));
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'ms-MY'; }
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch { /* speech not available */ }
}
if ('speechSynthesis' in window) { try { speechSynthesis.getVoices(); } catch {} }

export function confetti(n = 90) {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#e2552d', '#1e7a6d', '#e8b33b', '#6366f1', '#ec4899', '#10b981'];
  for (let i = 0; i < n; i++) {
    const c = h('i', { class: 'confetti' });
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = pick(colors);
    c.style.animationDuration = 2 + Math.random() * 2 + 's';
    c.style.animationDelay = Math.random() * 0.6 + 's';
    document.body.append(c);
    setTimeout(() => c.remove(), 5000);
  }
}

export function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  } catch {}
}

/** Theme: follows the device unless the teacher picks one. */
export function applyTheme() {
  const t = store.get('theme', null);
  if (t) document.documentElement.setAttribute('data-theme', t);
}
export function cycleTheme() {
  const cur = store.get('theme', null);
  const next = cur === null ? 'dark' : cur === 'dark' ? 'light' : null;
  store.set('theme', next);
  if (next) document.documentElement.setAttribute('data-theme', next);
  else document.documentElement.removeAttribute('data-theme');
}

export function registerSW() {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function downloadFile(name, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['﻿' + text], { type });
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
