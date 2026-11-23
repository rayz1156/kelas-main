// Teacher-made question sets ("Bina Set"). A set plays in every mode.
// Items with wrong options become multiple choice; items without them are answered aloud
// and the teacher reveals the answer, then marks it right or wrong.
import { h, shuffle, store, speak } from '../core.js';
import { choices } from '../shell.js';

/** Unicode-safe base64url so a set can travel inside a share link. Contains no pupil data. */
export function encodeSet(set) {
  const { title, subject, year, sp, tp, items } = set;
  const bytes = new TextEncoder().encode(JSON.stringify({ title, subject, year, sp, tp, items }));
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeSet(str) {
  try {
    const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
    const set = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
    return sanitizeSet(set);
  } catch { return null; }
}

/** Keep only the fields we expect, with sane limits, since shared links are untrusted input. */
export function sanitizeSet(raw) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) return null;
  const str = (v, n) => String(v ?? '').slice(0, n).trim();
  const items = raw.items.slice(0, 60).map((it) => ({
    e: str(it.e, 8), q: str(it.q, 300), a: str(it.a, 120),
    wrong: Array.isArray(it.wrong) ? it.wrong.map((w) => str(w, 120)).filter(Boolean).slice(0, 3) : [],
  })).filter((it) => it.q && it.a);
  if (!items.length) return null;
  const tp = Math.min(4, Math.max(1, Number(raw.tp) || 1));
  return {
    id: str(raw.id, 40) || 'kongsi', title: str(raw.title, 80) || 'Set soalan', subject: str(raw.subject, 60) || 'Lain-lain',
    year: str(raw.year, 20) || 'Tahun 1', sp: Array.isArray(raw.sp) ? raw.sp.map((s) => str(s, 20)).filter(Boolean).slice(0, 10) : [],
    tp, items,
  };
}

/** Load the set named in the URL: ?g=set&id=... (saved) or #s=... (shared link). */
export function loadSet() {
  const m = location.hash.match(/[#&]s=([^&]+)/);
  if (m) { const s = decodeSet(m[1]); if (s) return { ...s, shared: true }; }
  const id = new URLSearchParams(location.search).get('id');
  return store.get('sets', []).find((s) => s.id === id) || null;
}

function deck(items) {
  let pile = [];
  return () => { if (!pile.length) pile = shuffle(items); return pile.pop(); };
}

export function buildSetGame(set) {
  const next = deck(set.items);
  const make = () => {
    const it = next();
    const oral = !it.wrong.length;
    return {
      prompt: it.q, say: it.q,
      sub: oral ? 'Jawab secara lisan, kemudian guru tekan Tunjuk Jawapan.' : '',
      render(area, done) {
        if (it.e) area.append(h('div', { class: 'big-emoji' }, it.e));
        if (!oral) {
          choices(area, shuffle([{ label: it.a, correct: true }, ...it.wrong.map((w) => ({ label: w, correct: false }))]), done);
          return;
        }
        const answerBox = h('div', { class: 'scenario', style: { display: 'none' } }, h('p', {}, it.a));
        const reveal = h('button', { class: 'btn', type: 'button', id: 'revealBtn' }, '👁️ Tunjuk jawapan');
        reveal.addEventListener('click', () => {
          reveal.remove();
          answerBox.style.display = '';
          speak(it.a);
          choices(area, [{ label: '✅ Betul', text: it.a, correct: true }, { label: '❌ Salah', text: it.a, correct: false }],
            (ok) => done(ok, it.a));
        });
        area.append(answerBox, reveal);
      },
    };
  };
  return { levels: { [set.tp]: { title: set.title, sp: set.sp, make } } };
}
