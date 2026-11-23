// Matematik Tahun 1 · 1.2 Ikatan Nombor (SP 1.2.1) · 2.1 Tambah hingga 30 (SP 2.1.2, 2.1.3)
// Scope: number bonds of one digit with one digit, result within 18; problem solving is one step only.
import { h, pick, rand, shuffle } from '../core.js';
import { choices } from '../shell.js';

function tenframe(a, b = 0) {
  return h('div', { class: 'tenframe', role: 'img', 'aria-label': `${a + b} titik` },
    Array.from({ length: 10 }, (_, i) => h('i', { class: i < a ? 'on' : i < a + b ? 'on b' : '' })));
}
/** Show a + b dots across one or two ten frames. */
function frames(a, b) {
  const first = Math.min(a, 10);
  const secondA = a - first;
  const firstB = Math.min(b, 10 - first);
  const secondB = b - firstB;
  const out = [tenframe(first, firstB)];
  if (secondA + secondB > 0) out.push(tenframe(secondA, secondB));
  return h('div', { class: 'frames' }, out);
}

function numberOpts(correct, lo, hi) {
  const set = new Set([correct]);
  for (const d of shuffle([1, -1, 2, -2, 3, -3])) {
    if (set.size >= 4) break;
    const v = correct + d;
    if (v >= lo && v <= hi) set.add(v);
  }
  return shuffle([...set]).map((v) => ({ label: String(v), correct: v === correct }));
}

const eq = (...parts) => h('div', { class: 'equation' }, parts.map((p) => (p === '?' ? h('span', { class: 'blank' }, '?') : ` ${p} `)));

// ---------- TP1: ikatan nombor dalam lingkungan 10 ----------
function bondTen() {
  if (Math.random() < 0.5) {
    const a = rand(1, 9);
    return {
      prompt: `Berapa lagi untuk menjadi 10?`, sp: '1.2.1', say: `${a} tambah berapa menjadi sepuluh?`,
      explain: `${a} + ${10 - a} = 10`,
      render(area, done) { area.append(tenframe(a), eq(a, '+', '?', '=', 10)); choices(area, numberOpts(10 - a, 0, 10), done); },
    };
  }
  const total = rand(3, 10);
  const a = rand(1, total - 1);
  return {
    prompt: `${a} dan berapa menjadi ${total}?`, sp: '1.2.1', say: `${a} dan berapa menjadi ${total}?`,
    explain: `${a} + ${total - a} = ${total}`,
    render(area, done) { area.append(tenframe(a, total - a), eq(a, '+', '?', '=', total)); choices(area, numberOpts(total - a, 0, 10), done); },
  };
}

// ---------- TP2: ikatan nombor dalam lingkungan 18 (congak) ----------
function bondEighteen() {
  const a = rand(2, 9);
  const b = rand(Math.max(2, 11 - a), 9); // crosses 10 so the second frame is used
  const sum = a + b;
  if (Math.random() < 0.55) {
    return {
      prompt: 'Congak!', sp: '1.2.1', say: `${a} tambah ${b} sama dengan berapa?`,
      explain: `Lengkapkan 10 dahulu: ${a} + ${10 - a} = 10, kemudian tambah ${b - (10 - a)} lagi.`,
      render(area, done) { area.append(frames(a, b), eq(a, '+', b, '=', '?')); choices(area, numberOpts(sum, 2, 18), done); },
    };
  }
  return {
    prompt: 'Cari nombor yang hilang.', sp: '1.2.1', say: `${a} tambah berapa sama dengan ${sum}?`,
    explain: `${a} + ${b} = ${sum}`,
    render(area, done) { area.append(frames(a, b), eq(a, '+', '?', '=', sum)); choices(area, numberOpts(b, 1, 9), done); },
  };
}

// ---------- TP3: masalah tambah satu langkah hingga 30 ----------
const NAMES = ['Aminah', 'Mei Ling', 'Kavitha', 'Daniel', 'Farid', 'Siti', 'Ravi', 'Wei Jie', 'Aisyah', 'Arjun', 'Nurul', 'Jason'];
const THINGS = [
  { n: 'guli', u: 'biji', e: '🔵' }, { n: 'pensel', u: 'batang', e: '✏️' }, { n: 'buku', u: 'buah', e: '📘' },
  { n: 'bunga', u: 'kuntum', e: '🌼' }, { n: 'ikan', u: 'ekor', e: '🐟' }, { n: 'epal', u: 'biji', e: '🍎' }, { n: 'belon', u: 'biji', e: '🎈' },
];
const STORIES = [
  (p, t, a, b) => `${p} ada ${a} ${t.u} ${t.n}. Ibunya memberi ${b} ${t.u} lagi. Berapakah jumlah ${t.n} ${p} sekarang?`,
  (p, t, a, b) => `Ada ${a} ${t.u} ${t.n} di dalam bakul dan ${b} ${t.u} di atas meja. Berapakah jumlah semuanya?`,
  (p, t, a, b) => `${p} mengumpul ${a} ${t.u} ${t.n} pada hari Isnin dan ${b} ${t.u} pada hari Selasa. Berapakah jumlah ${t.n} yang dikumpul?`,
  (p, t, a, b) => `Kelas 1 Bestari ada ${a} ${t.u} ${t.n}. Kelas 1 Cemerlang ada ${b} ${t.u}. Berapakah jumlah ${t.n} kedua-dua kelas?`,
];

function addThirty() {
  const a = rand(6, 19);
  const b = rand(3, Math.min(11, 30 - a));
  const sum = a + b;
  if (Math.random() < 0.65) {
    const p = pick(NAMES); const t = pick(THINGS);
    const text = pick(STORIES)(p, t, a, b);
    return {
      prompt: text, sp: '2.1.3', say: text,
      explain: `Ayat matematik: ${a} + ${b} = ${sum}`,
      render(area, done) {
        area.append(h('div', { style: { fontSize: '44px' } }, `${t.e} ${a}  +  ${t.e} ${b}`));
        choices(area, numberOpts(sum, 1, 30).map((o) => ({ ...o, label: `${o.label} ${t.u}`, text: `${sum} ${t.u}` })), done);
      },
    };
  }
  return {
    prompt: 'Tambah.', sp: '2.1.2', say: `${a} tambah ${b} sama dengan berapa?`,
    explain: `${a} + ${b} = ${sum}`,
    render(area, done) { area.append(eq(a, '+', b, '=', '?')); choices(area, numberOpts(sum, 1, 30), done); },
  };
}

export default {
  levels: {
    1: { title: 'Jadikan 10', sp: ['1.2.1'], make: bondTen },
    2: { title: 'Congak hingga 18', sp: ['1.2.1'], make: bondEighteen },
    3: { title: 'Masalah Tambah hingga 30', sp: ['2.1.2', '2.1.3'], make: addThirty },
  },
};
