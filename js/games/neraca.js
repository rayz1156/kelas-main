// Matematik Tingkatan 1 · 5.1 Persamaan Linear dalam Satu Pemboleh Ubah (SP 5.1.1-5.1.4)
// TP wording follows the 5.0 Standard Prestasi: TP1 state the letter/symbol, TP2 explain the features and form equations,
// TP3 compute the solution, TP4 solve daily-life problems (Nota: finance, engineering, sport).
import { h, pick, rand, shuffle } from '../core.js';
import { choices } from '../shell.js';

const LETTERS = ['x', 'y', 'p', 'k', 'm', 'n', 't'];
const MINUS = '−';
const opts = (correct, wrong) => shuffle([correct, ...wrong.filter((w) => w !== correct).slice(0, 3)]).map((t) => ({ label: t, correct: t === correct }));
const numOpts = (correct, cands, unit = '') => {
  const set = new Set([correct]);
  for (const c of shuffle(cands)) { if (set.size >= 4) break; if (Number.isInteger(c) && c > 0) set.add(c); }
  for (const d of [1, -1, 2, -2, 3, 5]) { if (set.size >= 4) break; if (correct + d > 0) set.add(correct + d); }
  return shuffle([...set]).map((v) => ({ label: unit ? `${unit.startsWith('RM') ? 'RM' + v : v + ' ' + unit}` : String(v), correct: v === correct }));
};
const coef = (n, v) => (n === 1 ? v : `${n}${v}`);
const eqBox = (text) => h('div', { class: 'equation alg' }, text);

/** Balance scale: left pan holds `a` unknown boxes and weight b, right pan holds weight c. */
function balance(v, a, b, c) {
  const pan = (kids) => h('div', { class: 'pan' }, kids);
  const left = [...Array.from({ length: a }, () => h('span', { class: 'xbox' }, v)), b ? h('span', { class: 'wt' }, b) : null];
  return h('div', { class: 'balance', role: 'img', 'aria-label': `Neraca: ${a} ${v}${b ? ' dan ' + b : ''} sama berat dengan ${c}` },
    pan(left), h('span', { class: 'fulcrum' }, '⚖️'), pan([h('span', { class: 'wt' }, c)]));
}

// ---------- TP1: kenal persamaan linear dan pemboleh ubah ----------
function tp1() {
  const v = pick(LETTERS); const w = pick(LETTERS.filter((x) => x !== v));
  const a = rand(2, 9); let b; do { b = rand(2, 9); } while (b === a); const c = rand(12, 40);
  const kind = pick(['mana', 'bukan', 'pemboleh']);
  if (kind === 'pemboleh') {
    return {
      prompt: `Dalam persamaan ${a}${v} ${MINUS} ${b} = ${c}, yang manakah pemboleh ubah?`, sp: '5.1.1',
      say: `Dalam persamaan ini, yang manakah pemboleh ubah?`,
      explain: `${v} ialah pemboleh ubah (nilai yang belum diketahui). ${a} ialah pekali bagi ${v}; ${b} dan ${c} ialah pemalar.`,
      render(area, done) { area.append(eqBox(`${a}${v} ${MINUS} ${b} = ${c}`)); choices(area, opts(v, [String(a), String(b), String(c)]), done); },
    };
  }
  const linear = [`${a}${v} + ${b} = ${c}`, `${v}/${a} = ${b}`, `${c} = ${a}(${v} ${MINUS} ${b})`, `${a + 1}${v} = ${a}${v} + ${c}`];
  const notLinear = [`${v}² + ${b} = ${c}`, `${a}${v} + ${b}${w} = ${c}`, `${a}${v} + ${b}`, `${v}${w} = ${c}`];
  if (kind === 'mana') {
    const correct = pick(linear);
    return {
      prompt: 'Yang manakah persamaan linear dalam satu pemboleh ubah?', sp: '5.1.1',
      explain: `${correct}: ada tanda =, hanya satu pemboleh ubah (${v}) dan kuasa ${v} ialah 1.`,
      render(area, done) { choices(area, opts(correct, shuffle(notLinear)), done); },
    };
  }
  const correct = pick(notLinear);
  const why = correct.includes('²') ? 'kuasa pemboleh ubah ialah 2' : !correct.includes('=') ? 'tiada tanda =, ini ungkapan algebra' : 'ada dua pemboleh ubah';
  return {
    prompt: 'Yang manakah BUKAN persamaan linear dalam satu pemboleh ubah?', sp: '5.1.1',
    explain: `${correct} bukan persamaan linear dalam satu pemboleh ubah kerana ${why}.`,
    render(area, done) { choices(area, opts(correct, shuffle(linear)), done); },
  };
}

// ---------- TP2: bentuk persamaan daripada pernyataan atau situasi, dan sebaliknya ----------
function tp2() {
  const v = pick(LETTERS);
  let a; let b;
  do { a = rand(2, 6); b = rand(2, 9); } while (a === b);
  const c = rand(15, 50);
  const T = [
    { s: `Suatu nombor, ${v}, didarab dengan ${a}, kemudian ditambah ${b}. Hasilnya ${c}.`, e: `${a}${v} + ${b} = ${c}`, w: [`${a}(${v} + ${b}) = ${c}`, `${b}${v} + ${a} = ${c}`, `${a}${v} ${MINUS} ${b} = ${c}`] },
    { s: `${b} ditolak daripada ${a} kali suatu nombor, ${v}. Hasilnya ${c}.`, e: `${a}${v} ${MINUS} ${b} = ${c}`, w: [`${b} ${MINUS} ${a}${v} = ${c}`, `${a}(${v} ${MINUS} ${b}) = ${c}`, `${a}${v} + ${b} = ${c}`] },
    { s: `Suatu nombor, ${v}, ditambah ${b}, kemudian didarab dengan ${a}. Hasilnya ${c}.`, e: `${a}(${v} + ${b}) = ${c}`, w: [`${a}${v} + ${b} = ${c}`, `${v} + ${a * b} + ${a} = ${c}`, `${b}(${v} + ${a}) = ${c}`] },
    { s: `Suatu nombor, ${v}, dibahagi dengan ${a}, kemudian ditambah ${b}. Hasilnya ${c}.`, e: `${v}/${a} + ${b} = ${c}`, w: [`(${v} + ${b})/${a} = ${c}`, `${a}${v} + ${b} = ${c}`, `${v}/${b} + ${a} = ${c}`] },
  ];
  const t = pick(T);
  const kind = pick(['bentuk', 'bentuk', 'sebaliknya', 'neraca']);
  if (kind === 'neraca') {
    const c2 = a * rand(2, 6) + b;
    const correct = `${a}${v} + ${b} = ${c2}`;
    return {
      prompt: 'Tulis persamaan linear bagi neraca yang seimbang ini.', sp: '5.1.2',
      sub: `Setiap kotak ${v} mempunyai jisim yang sama.`,
      explain: `${a} kotak ${v} dan pemberat ${b} sama berat dengan ${c2}: ${correct}.`,
      render(area, done) { area.append(balance(v, a, b, c2)); choices(area, opts(correct, [`${v} + ${a} + ${b} = ${c2}`, `${a}${v} = ${b} + ${c2}`, `${b}${v} + ${a} = ${c2}`]), done); },
    };
  }
  if (kind === 'sebaliknya') {
    const others = T.filter((x) => x !== t).map((x) => x.s);
    return {
      prompt: 'Pernyataan manakah yang sepadan dengan persamaan ini?', sp: '5.1.2',
      explain: `${t.e}: ${t.s}`,
      render(area, done) { area.append(eqBox(t.e)); const w = choices(area, opts(t.s, others), done); w.classList.add('long'); },
    };
  }
  return {
    prompt: t.s, sub: 'Pilih persamaan linear yang betul.', sp: '5.1.2', say: t.s,
    explain: `Persamaan: ${t.e}`,
    render(area, done) { choices(area, opts(t.e, t.w), done); },
  };
}

// ---------- TP3: selesaikan persamaan linear ----------
function tp3() {
  const v = pick(LETTERS);
  const x = rand(2, 12);
  const kind = pick(['tambah', 'tolak', 'kurung', 'bahagi', 'duaBelah']);
  let eq; let steps; let wrong = []; let visual = null;
  if (kind === 'tambah') {
    const a = rand(2, 5); const b = rand(1, 12); const c = a * x + b;
    eq = `${a}${v} + ${b} = ${c}`; steps = `${a}${v} = ${c} ${MINUS} ${b} = ${c - b}, maka ${v} = ${c - b} ÷ ${a} = ${x}`;
    wrong = [c - b, Math.round(c / a), x + b];
    if (c <= 60) visual = balance(v, a, b, c);
  } else if (kind === 'tolak') {
    const a = rand(2, 9); const b = rand(1, 15); const c = a * x - b;
    if (c <= 0) return tp3();
    eq = `${a}${v} ${MINUS} ${b} = ${c}`; steps = `${a}${v} = ${c} + ${b} = ${c + b}, maka ${v} = ${c + b} ÷ ${a} = ${x}`;
    wrong = [c + b, Math.round((c - b) / a), x + 2];
  } else if (kind === 'kurung') {
    const a = rand(2, 6); const b = rand(1, 9); const c = a * (x + b);
    eq = `${a}(${v} + ${b}) = ${c}`; steps = `${v} + ${b} = ${c} ÷ ${a} = ${c / a}, maka ${v} = ${c / a} ${MINUS} ${b} = ${x}`;
    wrong = [c / a, Math.round((c - b) / a), c / a + b];
  } else if (kind === 'bahagi') {
    const a = rand(2, 5); const X = a * x; const b = rand(1, 9); const c = x + b;
    eq = `${v}/${a} + ${b} = ${c}`; steps = `${v}/${a} = ${c} ${MINUS} ${b} = ${x}, maka ${v} = ${x} × ${a} = ${X}`;
    return {
      prompt: `Selesaikan: cari nilai ${v}.`, sp: '5.1.3', explain: steps,
      render(area, done) { area.append(eqBox(eq)); choices(area, numOpts(X, [x, (c + b) * a, X + a, c * a]), done); },
    };
  } else {
    const d = rand(1, 4); const a = d + rand(1, 4); const b = rand(1, 10); const e = (a - d) * x + b;
    eq = `${a}${v} + ${b} = ${coef(d, v)} + ${e}`; steps = `${a}${v} ${MINUS} ${coef(d, v)} = ${e} ${MINUS} ${b}, iaitu ${coef(a - d, v)} = ${e - b}, maka ${v} = ${x}`;
    wrong = [e - b, Math.round((e + b) / (a + d)), x + d];
  }
  return {
    prompt: `Selesaikan: cari nilai ${v}.`, sp: '5.1.3', explain: steps,
    render(area, done) { if (visual) area.append(visual); area.append(eqBox(eq)); choices(area, numOpts(x, wrong), done); },
  };
}

// ---------- TP4: masalah kehidupan harian ----------
const NAMES = ['Aina', 'Kavitha', 'Daniel', 'Mei Ling', 'Haziq', 'Arjun', 'Nurul', 'Jason'];
function tp4() {
  const p = pick(NAMES);
  const kind = pick(['buku', 'mata', 'tapak', 'simpan', 'tambang', 'umur']);
  if (kind === 'buku') {
    const n = rand(2, 5); const x = rand(4, 15); const pen = rand(2, 6); const T = n * x + pen;
    return {
      prompt: `${p} membeli ${n} buah buku latihan yang sama harga dan sebatang pen berharga RM${pen}. Jumlah bayaran ialah RM${T}. Berapakah harga sebuah buku?`, sp: '5.1.4',
      explain: `Katakan harga sebuah buku = RMx. ${n}x + ${pen} = ${T}, ${n}x = ${T - pen}, x = ${x}. Harga sebuah buku RM${x}.`,
      render(area, done) { area.append(h('div', { class: 'big-emoji' }, '📚 ✏️')); choices(area, numOpts(x, [T - pen, Math.round(T / n), x + pen], 'RM'), done); },
    };
  }
  if (kind === 'mata') {
    const w = rand(3, 9); const s = rand(1, 5); const T = 3 * w + s;
    return {
      prompt: `Dalam liga bola sepak, pasukan mendapat 3 mata bagi setiap kemenangan dan 1 mata bagi setiap keputusan seri. Pasukan sekolah ${p} seri ${s} kali dan mengumpul ${T} mata. Berapa kali pasukan itu menang?`, sp: '5.1.4',
      explain: `Katakan bilangan menang = w. 3w + ${s} = ${T}, 3w = ${T - s}, w = ${w}.`,
      render(area, done) { area.append(h('div', { class: 'big-emoji' }, '⚽ 🏆')); choices(area, numOpts(w, [T - s, Math.round(T / 3), w + s], 'kali'), done); },
    };
  }
  if (kind === 'tapak') {
    const x = rand(4, 15); const a = rand(2, 8); const P = 4 * x + 2 * a;
    return {
      prompt: `Seorang jurutera mereka bentuk tapak segi empat tepat. Panjangnya (x + ${a}) m dan lebarnya x m. Perimeter tapak itu ialah ${P} m. Cari nilai x.`, sp: '5.1.4',
      explain: `2(x + ${a}) + 2x = ${P}, 4x + ${2 * a} = ${P}, 4x = ${P - 2 * a}, x = ${x}.`,
      render(area, done) { area.append(h('div', { class: 'big-emoji' }, '📐 🏗️')); choices(area, numOpts(x, [Math.round((P - a) / 2), Math.round(P / 4), x + a], 'm'), done); },
    };
  }
  if (kind === 'simpan') {
    const wk = rand(4, 8); const x = rand(5, 20); const g = rand(2, 6) * 5; const T = wk * x + g;
    return {
      prompt: `${p} menyimpan jumlah wang yang sama setiap minggu. Selepas ${wk} minggu, ibunya menambah RM${g}. Jumlah simpanan ${p} menjadi RM${T}. Berapakah wang yang disimpan setiap minggu?`, sp: '5.1.4',
      explain: `${wk}x + ${g} = ${T}, ${wk}x = ${T - g}, x = ${x}. ${p} menyimpan RM${x} seminggu.`,
      render(area, done) { area.append(h('div', { class: 'big-emoji' }, '🐷 💰')); choices(area, numOpts(x, [T - g, Math.round(T / wk), x + 5], 'RM'), done); },
    };
  }
  if (kind === 'tambang') {
    const base = rand(3, 5); const per = rand(1, 2); const k = rand(4, 15); const T = base + per * k;
    return {
      prompt: `Tambang e-hailing terdiri daripada caj asas RM${base} dan RM${per} bagi setiap kilometer. ${p} membayar RM${T}. Berapakah jarak perjalanan itu?`, sp: '5.1.4',
      explain: `Katakan jarak = k km. ${coef(per, 'k')} + ${base} = ${T}, ${coef(per, 'k')} = ${T - base}, k = ${k}.`,
      render(area, done) { area.append(h('div', { class: 'big-emoji' }, '🚗 📍')); choices(area, numOpts(k, [T, Math.round(T / per), k + base], 'km'), done); },
    };
  }
  const m = rand(3, 4); const x = rand(8, 13); const add = rand(1, 6); const F = m * x + add;
  return {
    prompt: `Umur ayah ${p} ialah ${add} tahun lebih daripada ${m} kali umur ${p}. Umur ayahnya ${F} tahun. Berapakah umur ${p}?`, sp: '5.1.4',
    explain: `Katakan umur ${p} = u. ${m}u + ${add} = ${F}, ${m}u = ${F - add}, u = ${x} tahun.`,
    render(area, done) { area.append(h('div', { class: 'big-emoji' }, '👨 🧒')); choices(area, numOpts(x, [F - add, Math.round(F / m), x + add], 'tahun'), done); },
  };
}

export default {
  levels: {
    1: { title: 'Kenal Persamaan Linear', sp: ['5.1.1'], make: tp1 },
    2: { title: 'Bentuk Persamaan', sp: ['5.1.1', '5.1.2'], make: tp2 },
    3: { title: 'Selesaikan Persamaan', sp: ['5.1.3'], make: tp3 },
    4: { title: 'Masalah Harian', sp: ['5.1.4'], make: tp4 },
  },
};
