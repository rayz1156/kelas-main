// Matematik Tahun 1 · 3.0 Wang (SP 3.1.1, 3.2.1, 3.2.2, 3.2.3)
// Scope from the Dokumen Kurikulum: notes RM1, RM5, RM10; coins 5, 10, 20, 50 sen.
// Features limited to colour and value. Changing and comparing: notes with notes, coins with coins only.
import { h, pick, rand, shuffle, sample, sfx, speak } from '../core.js';
import { choices } from '../shell.js';

const NOTES = [
  { v: 100, label: 'RM1', cls: 'rm1', colour: 'biru' },
  { v: 500, label: 'RM5', cls: 'rm5', colour: 'hijau' },
  { v: 1000, label: 'RM10', cls: 'rm10', colour: 'merah' },
];
const COINS = [
  { v: 5, label: '5 sen', cls: 'silver c5' },
  { v: 10, label: '10 sen', cls: 'silver' },
  { v: 20, label: '20 sen', cls: 'gold' },
  { v: 50, label: '50 sen', cls: 'gold' },
];
const ALL = [...NOTES, ...COINS];

const fmt = (sen) => (sen < 100 ? `${sen} sen` : sen % 100 ? `RM${(sen / 100).toFixed(2)}` : `RM${sen / 100}`);

function money(m) {
  if (m.v >= 100) return h('div', { class: `note-m ${m.cls}`, role: 'img', 'aria-label': m.label }, m.label);
  return h('div', { class: `coin-m ${m.cls}`, role: 'img', 'aria-label': m.label, style: { flexDirection: 'column' } },
    h('span', {}, m.v), h('small', { style: { fontSize: '13px' } }, 'sen'));
}

/** Random handful of notes or coins whose total stays within the scope limit. */
function handful(pool, max, minCount = 1, maxCount = 3) {
  for (let tries = 0; tries < 200; tries++) {
    const items = Array.from({ length: rand(minCount, maxCount) }, () => pick(pool));
    const total = items.reduce((s, m) => s + m.v, 0);
    if (total <= max) return { items: items.sort((a, b) => b.v - a.v), total };
  }
  return { items: [pool[0]], total: pool[0].v };
}

function numberChoices(correct, unit, spread = [1, 2, 3]) {
  const set = new Set([correct]);
  for (const d of shuffle(spread.flatMap((s) => [s, -s]))) { if (set.size >= 4) break; const v = correct + d; if (v > 0) set.add(v); }
  return shuffle([...set]).map((v) => ({ label: unit(v), text: unit(v), correct: v === correct }));
}

function deck(items) {
  let pile = [];
  return () => { if (!pile.length) pile = shuffle(items); return pile.pop(); };
}

const NEEDS = [
  { e: '🍞', n: 'Roti' }, { e: '🥛', n: 'Susu' }, { e: '📒', n: 'Buku latihan' }, { e: '✏️', n: 'Pensel' },
  { e: '🍚', n: 'Beras' }, { e: '🥚', n: 'Telur' }, { e: '🧼', n: 'Sabun' }, { e: '💧', n: 'Air minuman' },
];
const WANTS = [
  { e: '🧸', n: 'Anak patung' }, { e: '🍭', n: 'Gula-gula' }, { e: '🎈', n: 'Belon' }, { e: '🍦', n: 'Aiskrim' },
  { e: '🎮', n: 'Permainan video' }, { e: '⚽', n: 'Bola baharu' }, { e: '🧁', n: 'Kek cawan' },
];
const SHOP_RM = [
  { e: '📒', n: 'Buku latihan', p: [2, 3] }, { e: '🍞', n: 'Roti', p: [2, 3, 4] }, { e: '🥛', n: 'Susu', p: [4, 5, 6] },
  { e: '🧸', n: 'Anak patung', p: [7, 8, 9, 10] }, { e: '🖍️', n: 'Krayon', p: [3, 4, 6] }, { e: '⚽', n: 'Bola', p: [6, 7, 8] },
  { e: '🍉', n: 'Tembikai', p: [5, 6, 7] }, { e: '🧢', n: 'Topi', p: [8, 9, 10] },
];
const SHOP_SEN = [
  { e: '🍭', n: 'Gula-gula', p: [10, 20, 30] }, { e: '🍌', n: 'Pisang', p: [40, 50, 60] }, { e: '✏️', n: 'Pensel', p: [50, 70, 80] },
  { e: '🎈', n: 'Belon', p: [25, 30, 35] }, { e: '🍪', n: 'Biskut', p: [45, 55, 65] }, { e: '🧃', n: 'Air kotak', p: [75, 85, 95] },
];
const EXCHANGES = [
  { from: NOTES[2], to: NOTES[1] }, { from: NOTES[2], to: NOTES[0] }, { from: NOTES[1], to: NOTES[0] },
  { from: COINS[3], to: COINS[1] }, { from: COINS[3], to: COINS[0] }, { from: COINS[2], to: COINS[1] },
  { from: COINS[2], to: COINS[0] }, { from: COINS[1], to: COINS[0] },
];
const NAMES = ['Aminah', 'Mei Ling', 'Kavitha', 'Daniel', 'Farid', 'Siti', 'Ravi', 'Wei Jie', 'Aisyah', 'Arjun'];

// ---------- TP1: Kenali wang (3.1.1) ----------
function recognise() {
  const r = Math.random();
  if (r < 0.55) {
    const m = pick(ALL);
    return {
      prompt: 'Berapakah nilai wang ini?', sp: '3.1.1',
      render(area, done) {
        area.append(h('div', { class: 'money-row' }, money(m)));
        const opts = [m, ...sample(ALL, 3, [m])].map((x) => ({ label: x.label, correct: x === m }));
        choices(area, shuffle(opts), done);
      },
    };
  }
  if (r < 0.8) {
    const wantNote = Math.random() < 0.5;
    const right = pick(wantNote ? NOTES : COINS);
    const others = sample(wantNote ? COINS : NOTES, 2);
    return {
      prompt: wantNote ? 'Yang manakah wang kertas?' : 'Yang manakah duit syiling?', sp: '3.1.1',
      explain: 'Nilai duit syiling lebih kecil daripada nilai wang kertas.',
      render(area, done) {
        choices(area, shuffle([right, ...others]).map((x) => ({ label: money(x), text: x.label, correct: x === right })), done);
      },
    };
  }
  const n = pick(NOTES);
  return {
    prompt: `Wang kertas berwarna ${n.colour} bernilai berapa?`, sp: '3.1.1',
    render(area, done) { choices(area, NOTES.map((x) => ({ label: x.label, correct: x === n })), done); },
  };
}

// ---------- TP2: Nilai dan bandingkan (3.2.1, 3.2.3) ----------
function compare() {
  const notes = Math.random() < 0.5;
  const pool = notes ? NOTES : COINS;
  const max = notes ? 1000 : 100;
  if (Math.random() < 0.5) {
    const g = handful(pool, max, 2, 4);
    return {
      prompt: 'Berapakah jumlah nilai wang ini?', sp: '3.2.1',
      render(area, done) {
        area.append(h('div', { class: 'money-row' }, g.items.map(money)));
        const step = notes ? 100 : 5;
        choices(area, numberChoices(g.total / step, (v) => fmt(v * step), notes ? [1, 4, 5] : [1, 2, 4]), done);
      },
    };
  }
  const a = handful(pool, max);
  let b = handful(pool, max);
  if (Math.random() < 0.25) b = { items: a.items.slice().reverse(), total: a.total };
  const verdict = a.total > b.total ? 'A' : a.total < b.total ? 'B' : '=';
  return {
    prompt: 'Kumpulan manakah yang lebih banyak nilainya?', sp: '3.2.3',
    explain: `Kumpulan A = ${fmt(a.total)}, Kumpulan B = ${fmt(b.total)}.`,
    render(area, done) {
      area.append(h('div', { class: 'row', style: { justifyContent: 'center', width: '100%' } },
        h('div', { class: 'group' }, h('h3', {}, 'Kumpulan A'), h('div', { class: 'money-row' }, a.items.map(money))),
        h('div', { class: 'group' }, h('h3', {}, 'Kumpulan B'), h('div', { class: 'money-row' }, b.items.map(money)))));
      choices(area, [
        { label: 'A lebih banyak', correct: verdict === 'A' },
        { label: 'B lebih banyak', correct: verdict === 'B' },
        { label: 'Sama nilai', correct: verdict === '=' },
      ], done);
    },
  };
}

// ---------- TP3: Kedai, tukar wang, keperluan atau kehendak (3.2.1, 3.2.2) ----------
function shop() {
  const notes = Math.random() < 0.55;
  const item = pick(notes ? SHOP_RM : SHOP_SEN);
  const price = notes ? pick(item.p) * 100 : pick(item.p);
  const pool = notes ? NOTES : COINS;
  return {
    prompt: `Bayar dengan tepat untuk ${item.n}.`, sub: 'Tekan wang untuk membayar. Tekan "Semak" apabila selesai.', sp: '3.2.1',
    render(area, done) {
      let paid = [];
      const tray = h('div', { class: 'tray', 'aria-live': 'polite' });
      const total = h('span', {}, fmt(0));
      const redraw = () => {
        tray.replaceChildren(...(paid.length ? paid.map(money) : [h('span', { style: { color: 'var(--ink-soft)', alignSelf: 'center' } }, 'Belum ada bayaran')]));
        const sum = paid.reduce((s, m) => s + m.v, 0);
        total.textContent = sum === 0 && notes ? 'RM0' : fmt(sum);
      };
      redraw();
      area.append(
        h('div', { class: 'price-tag' }, h('span', { style: { fontSize: '64px' } }, item.e), item.n, ' · ', fmt(price)),
        h('div', { class: 'money-row' }, pool.map((m) => h('button', { class: 'money-btn', type: 'button', 'aria-label': `Tambah ${m.label}`, onclick: () => { paid.push(m); sfx('tap'); redraw(); } }, money(m)))),
        tray,
        h('div', { class: 'paybar' }, 'Dibayar: ', total,
          h('button', { class: 'btn secondary', type: 'button', onclick: () => { paid.pop(); redraw(); } }, '↶ Undur'),
          h('button', { class: 'btn green', type: 'button', onclick: (e) => { e.currentTarget.disabled = true; done(paid.reduce((s, m) => s + m.v, 0) === price, fmt(price)); } }, 'Semak ✔')));
    },
  };
}

function exchange() {
  const x = pick(EXCHANGES);
  const count = x.from.v / x.to.v;
  const kind = x.from.v >= 100 ? 'wang kertas' : 'duit syiling';
  return {
    prompt: `Satu keping ${x.from.label} boleh ditukar dengan berapa keping ${x.to.label}?`, sp: '3.2.2',
    sub: `Tukar ${kind} dengan ${kind}.`,
    render(area, done) {
      area.append(h('div', { class: 'money-row' }, money(x.from), h('span', { style: { fontSize: '48px', fontWeight: 900 } }, '= ? ×'), money(x.to)));
      choices(area, numberChoices(count, (v) => `${v} keping`, [1, 2, 3]), done);
    },
  };
}

function needOrWant() {
  const askNeed = Math.random() < 0.6;
  const name = pick(NAMES);
  const right = pick(askNeed ? NEEDS : WANTS);
  const others = sample(askNeed ? WANTS : NEEDS, 2);
  return {
    prompt: askNeed ? `${name} ada RM5. Yang manakah KEPERLUAN?` : `Yang manakah KEHENDAK (bukan keperluan)?`, sp: '3.2.1',
    sub: 'Keperluan ialah barang yang kita mesti ada. Kehendak ialah barang yang kita ingin.',
    explain: askNeed ? 'Belanjakan wang untuk keperluan dahulu, kemudian simpan bakinya.' : 'Kehendak boleh ditunda. Simpan wang dahulu!',
    render(area, done) {
      choices(area, shuffle([right, ...others]).map((x) => ({ label: h('span', {}, h('span', { style: { fontSize: '56px', display: 'block' } }, x.e), x.n), text: x.n, correct: x === right })), done);
    },
  };
}

export default {
  levels: {
    1: { title: 'Kenali Wang', sp: ['3.1.1'], make: recognise },
    2: { title: 'Kira dan Bandingkan', sp: ['3.2.1', '3.2.3'], make: compare },
    3: {
      title: 'Kedai Runcit', sp: ['3.2.1', '3.2.2'],
      make: (() => { const kinds = deck([shop, shop, exchange, needOrWant]); return () => kinds()(); })(),
    },
  },
};
