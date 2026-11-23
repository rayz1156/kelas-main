// Matematik Tingkatan 1 · 2.0 Faktor dan Gandaan (SP 2.1.1-2.1.4, 2.2.1-2.2.3)
// Scope from the document: positive factors only; coprime pairs use two numbers only; common multiples and GSTK use two or three numbers.
// TP4 contexts follow the Nota: flood-aid distribution (FSTB), public transport timetables (GSTK), agriculture, sport and finance.
import { h, pick, rand, shuffle } from '../core.js';
import { choices } from '../shell.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;
const gcdAll = (xs) => xs.reduce(gcd);
const lcmAll = (xs) => xs.reduce(lcm);
const factors = (n) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
const isPrime = (n) => n > 1 && factors(n).length === 2;
const primeFactors = (n) => { const out = []; let m = n; for (let p = 2; m > 1; p++) while (m % p === 0) { out.push(p); m /= p; } return out; };
const COMPOSITES = Array.from({ length: 89 }, (_, i) => i + 12).filter((n) => factors(n).length >= 6);

/** Four numeric options: the answer plus plausible distractors, topped up with near values. */
function numOpts(correct, distractors, unit = '', alsoRight = () => false) {
  const set = new Set([correct]);
  const okWrong = (d) => Number.isInteger(d) && d > 0 && !alsoRight(d);
  for (const d of shuffle(distractors)) { if (set.size >= 4) break; if (okWrong(d)) set.add(d); }
  for (const d of shuffle([1, -1, 2, -2, 3, 4, -3, 5, -5, 7])) { if (set.size >= 4) break; if (okWrong(correct + d)) set.add(correct + d); }
  const lab = (v) => (unit ? `${v} ${unit}` : String(v));
  return shuffle([...set]).map((v) => ({ label: lab(v), correct: v === correct }));
}
const textOpts = (correct, wrong) => shuffle([correct, ...wrong]).map((t) => ({ label: t, correct: t === correct }));

const numberBox = (...nums) => h('div', { class: 'num-row' }, nums.map((n) => h('span', { class: 'num-chip' }, n)));

// ---------- TP1: menyatakan faktor dan gandaan ----------
function tp1() {
  const kind = pick(['faktor', 'bukan', 'gandaan']);
  if (kind === 'gandaan') {
    const n = rand(3, 12);
    const answer = n * rand(3, 9);
    const wrong = shuffle([answer + 1, answer - 1, answer + 2, answer - 2, n * rand(2, 9) + 1, answer + n - 1]).filter((v) => v % n !== 0);
    return {
      prompt: `Yang manakah gandaan bagi ${n}?`, sp: '2.2.1', say: `Yang manakah gandaan bagi ${n}?`,
      explain: `${answer} = ${n} × ${answer / n}, maka ${answer} ialah gandaan bagi ${n}.`,
      render(area, done) { area.append(numberBox(n)); choices(area, numOpts(answer, wrong, '', (v) => v % n === 0), done); },
    };
  }
  const n = pick(COMPOSITES);
  const fs = factors(n).filter((d) => d > 1 && d < n);
  const non = Array.from({ length: n - 2 }, (_, i) => i + 2).filter((d) => n % d !== 0);
  if (kind === 'faktor') {
    const answer = pick(fs);
    return {
      prompt: `Yang manakah faktor bagi ${n}?`, sp: '2.1.1', say: `Yang manakah faktor bagi ${n}?`,
      explain: `Faktor bagi ${n}: ${factors(n).join(', ')}.`,
      render(area, done) { area.append(numberBox(n)); choices(area, numOpts(answer, shuffle(non).slice(0, 6), '', (v) => n % v === 0), done); },
    };
  }
  const answer = pick(non.filter((d) => d < 13 || d > n / 2));
  return {
    prompt: `Yang manakah BUKAN faktor bagi ${n}?`, sp: '2.1.1', say: `Yang manakah bukan faktor bagi ${n}?`,
    explain: `Faktor bagi ${n}: ${factors(n).join(', ')}. ${answer} tidak membahagi ${n} tanpa baki.`,
    render(area, done) {
      area.append(numberBox(n));
      const opts = shuffle([answer, ...shuffle(fs).slice(0, 3)]).map((v) => ({ label: String(v), correct: v === answer }));
      choices(area, opts, done);
    },
  };
}

// ---------- TP2: faktor perdana, pemfaktoran perdana, gandaan sepunya, koperdana ----------
function tp2() {
  const kind = pick(['perdana', 'pemfaktoran', 'sepunya', 'koperdana']);
  if (kind === 'perdana') {
    const n = pick(COMPOSITES.filter((x) => new Set(primeFactors(x)).size >= 2));
    const ps = [...new Set(primeFactors(n))];
    const answer = pick(ps);
    const wrong = factors(n).filter((d) => !isPrime(d) && d < n);
    return {
      prompt: `Yang manakah faktor perdana bagi ${n}?`, sp: '2.1.1', say: `Yang manakah faktor perdana bagi ${n}?`,
      explain: `Faktor perdana bagi ${n}: ${ps.join(', ')}. Nombor perdana hanya ada dua faktor, iaitu 1 dan nombor itu sendiri.`,
      render(area, done) { area.append(numberBox(n)); choices(area, numOpts(answer, wrong.length >= 3 ? wrong : [...wrong, 9, 15, 21], '', (v) => isPrime(v) && n % v === 0), done); },
    };
  }
  if (kind === 'pemfaktoran') {
    const n = pick(COMPOSITES.filter((x) => primeFactors(x).length >= 3));
    const pf = primeFactors(n);
    const show = (xs) => xs.join(' × ');
    const correct = show(pf);
    const wrong = new Set();
    // Not fully prime: merge the first two primes into a composite.
    wrong.add(show([pf[0] * pf[1], ...pf.slice(2)]));
    // Missing one prime factor (product is wrong).
    wrong.add(show(pf.slice(1)));
    // One prime replaced.
    const swapIdx = rand(0, pf.length - 1);
    const other = [2, 3, 5, 7].find((p) => p !== pf[swapIdx]);
    wrong.add(show(pf.map((p, i) => (i === swapIdx ? other : p)).sort((a, b) => a - b)));
    wrong.delete(correct);
    return {
      prompt: `Ungkapkan ${n} dalam bentuk pemfaktoran perdana.`, sp: '2.1.2', say: `Ungkapkan ${n} dalam bentuk pemfaktoran perdana.`,
      explain: `${n} = ${correct}. Semua faktor mesti nombor perdana dan hasil darabnya mesti ${n}.`,
      render(area, done) { area.append(numberBox(n)); choices(area, textOpts(correct, [...wrong].slice(0, 3)), done); },
    };
  }
  if (kind === 'sepunya') {
    let a; let b;
    do { a = rand(2, 9); b = rand(2, 12); } while (a === b || lcm(a, b) > 72);
    const L = lcm(a, b);
    const answer = L * pick([1, 1, 2]);
    const wrong = [a * rand(2, 9), b * rand(2, 9), a * b + a, L + a, L + b, L - a].filter((v) => v % a !== 0 || v % b !== 0);
    return {
      prompt: `Yang manakah gandaan sepunya bagi ${a} dan ${b}?`, sp: '2.2.1', say: `Yang manakah gandaan sepunya bagi ${a} dan ${b}?`,
      explain: `${answer} boleh dibahagi tepat dengan ${a} dan ${b}. Gandaan sepunya: ${L}, ${2 * L}, ${3 * L}, ...`,
      render(area, done) { area.append(numberBox(a, b)); choices(area, numOpts(answer, wrong, '', (v) => v % a === 0 && v % b === 0), done); },
    };
  }
  let a; let b;
  do { a = rand(4, 30); b = rand(4, 30); } while (a === b);
  const g = gcd(a, b);
  const yes = g === 1;
  return {
    prompt: `Adakah ${a} dan ${b} nombor koperdana?`, sp: '2.1.3', say: `Adakah ${a} dan ${b} nombor koperdana?`,
    explain: yes ? `Faktor sepunya ${a} dan ${b} hanyalah 1, maka koperdana.` : `${a} dan ${b} mempunyai faktor sepunya ${g}, maka bukan koperdana.`,
    render(area, done) {
      area.append(numberBox(a, b));
      choices(area, [{ label: '✅ Ya, koperdana', correct: yes }, { label: '❌ Bukan koperdana', correct: !yes }], done);
    },
  };
}

// ---------- TP3: mengira FSTB dan GSTK ----------
function hcfSet() {
  for (;;) {
    const g = rand(2, 12);
    const count = Math.random() < 0.35 ? 3 : 2;
    const ms = shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, count);
    if (gcdAll(ms) !== 1) continue;
    const nums = ms.map((m) => g * m).sort((x, y) => x - y);
    if (nums[nums.length - 1] <= 96) return nums;
  }
}
function lcmSet() {
  for (;;) {
    const count = Math.random() < 0.35 ? 3 : 2;
    const nums = shuffle([2, 3, 4, 5, 6, 8, 9, 10, 12, 15]).slice(0, count).sort((x, y) => x - y);
    const L = lcmAll(nums);
    if (L <= 120 && L !== nums[nums.length - 1]) return nums;
  }
}
function tp3() {
  if (Math.random() < 0.5) {
    const nums = hcfSet();
    const g = gcdAll(nums);
    const common = factors(g).filter((d) => d < g);
    return {
      prompt: `Tentukan FSTB bagi ${nums.join(', ')}.`, sp: '2.1.3', say: `Tentukan faktor sepunya terbesar bagi ${nums.join(', ')}.`,
      explain: `${nums.map((n) => `${n} = ${primeFactors(n).join(' × ')}`).join('; ')}. FSTB = ${g}.`,
      render(area, done) { area.append(numberBox(...nums)); choices(area, numOpts(g, [...common, 2 * g, nums[0], g + 1]), done); },
    };
  }
  const nums = lcmSet();
  const L = lcmAll(nums);
  const product = nums.reduce((x, y) => x * y, 1);
  return {
    prompt: `Tentukan GSTK bagi ${nums.join(', ')}.`, sp: '2.2.2', say: `Tentukan gandaan sepunya terkecil bagi ${nums.join(', ')}.`,
    explain: `Gandaan sepunya yang pertama ialah ${L}. Semak: ${nums.map((n) => `${L} ÷ ${n} = ${L / n}`).join(', ')}.`,
    render(area, done) { area.append(numberBox(...nums)); choices(area, numOpts(L, [2 * L, product, L / 2, nums[nums.length - 1] * 2, L + nums[0]]), done); },
  };
}

// ---------- TP4: masalah kehidupan harian ----------
const SUPPLIES = [
  { n: 'botol air mineral', e: '💧' }, { n: 'bungkus roti', e: '🍞' }, { n: 'tin sardin', e: '🥫' },
  { n: 'helai selimut', e: '🧣' }, { n: 'paket biskut', e: '🍪' }, { n: 'tuala', e: '🧺' },
];
const pad = (n) => String(n).padStart(2, '0');
const clock = (mins) => { const hh = Math.floor(mins / 60); const mm = mins % 60; const h12 = ((hh + 11) % 12) + 1; return `${h12}:${pad(mm)} ${hh < 12 ? 'pagi' : hh < 14 ? 'tengah hari' : 'petang'}`; };

function tp4() {
  const kind = pick(['kit', 'kitIsi', 'bas', 'kebun', 'sukan', 'lampu']);
  if (kind === 'kit' || kind === 'kitIsi') {
    const nums = hcfSet().map((x) => x * (x < 30 ? 2 : 1));
    const g = gcdAll(nums);
    const items = shuffle(SUPPLIES).slice(0, nums.length);
    const list = nums.map((n, i) => `${n} ${items[i].n}`);
    const listText = list.length === 3 ? `${list[0]}, ${list[1]} dan ${list[2]}` : `${list[0]} dan ${list[1]}`;
    const base = `Pusat pemindahan banjir menerima ${listText}. Semua barang dibahagikan sama rata ke dalam kit bantuan tanpa baki.`;
    if (kind === 'kit') {
      return {
        prompt: `${base} Berapakah bilangan maksimum kit yang boleh disediakan?`, sp: '2.1.4',
        explain: `Bilangan maksimum kit = FSTB bagi ${nums.join(', ')} = ${g} kit.`,
        render(area, done) { area.append(h('div', { class: 'big-emoji' }, '🚤 ' + items.map((x) => x.e).join(' '))); choices(area, numOpts(g, [...factors(g).filter((d) => d > 1 && d < g), 2 * g, g + 2], 'kit'), done); },
      };
    }
    const per = nums[0] / g;
    return {
      prompt: `${base} Jika bilangan kit adalah maksimum, berapakah ${items[0].n} dalam setiap kit?`, sp: '2.1.4',
      explain: `Bilangan kit maksimum = FSTB = ${g}. ${nums[0]} ÷ ${g} = ${per} ${items[0].n} setiap kit.`,
      render(area, done) { area.append(h('div', { class: 'big-emoji' }, '🚤 ' + items.map((x) => x.e).join(' '))); choices(area, numOpts(per, [g, nums[0] / factors(g)[1] || per + 1, per * 2, per + 1]), done); },
    };
  }
  if (kind === 'bas' || kind === 'lampu') {
    let a; let b;
    do { a = pick([8, 10, 12, 15, 18, 20, 25, 30]); b = pick([6, 9, 10, 12, 15, 16, 20, 24]); } while (a === b || lcm(a, b) === Math.max(a, b) || lcm(a, b) > 120);
    const L = lcm(a, b);
    if (kind === 'lampu') {
      return {
        prompt: `Lampu isyarat di dua simpang berkelip setiap ${a} saat dan ${b} saat. Kedua-duanya baru sahaja berkelip serentak. Selepas berapa saat lampu itu akan berkelip serentak semula?`, sp: '2.2.3',
        explain: `GSTK bagi ${a} dan ${b} = ${L} saat.`,
        render(area, done) { area.append(h('div', { class: 'big-emoji' }, '🚦 🚦')); choices(area, numOpts(L, [a * b, 2 * L, a + b, L / 2], 'saat'), done); },
      };
    }
    const start = 7 * 60;
    return {
      prompt: `Bas ke Pekan bertolak setiap ${a} minit dan bas ke Taman bertolak setiap ${b} minit dari terminal yang sama. Kedua-dua bas bertolak serentak pada jam 7:00 pagi. Bilakah kali seterusnya kedua-dua bas bertolak serentak?`, sp: '2.2.3',
      explain: `GSTK bagi ${a} dan ${b} = ${L} minit. 7:00 pagi + ${L} minit = ${clock(start + L)}.`,
      render(area, done) {
        area.append(h('div', { class: 'big-emoji' }, '🚌 🚌'));
        const cands = [...new Set([L, a * b, 2 * L, a + b].filter((m) => m > 0 && m <= 300))];
        while (cands.length < 4) cands.push(L + 5 * cands.length);
        const opts = shuffle(cands.slice(0, 4)).map((m) => ({ label: clock(start + m), correct: m === L }));
        choices(area, opts, done);
      },
    };
  }
  if (kind === 'kebun') {
    const [x, y] = hcfSet().slice(0, 2);
    const g = gcd(x, y);
    return {
      prompt: `Pak Hamid ada ${x} anak pokok cili dan ${y} anak pokok terung. Dia mahu menanamnya dalam beberapa batas. Setiap batas mesti ada bilangan pokok cili yang sama dan bilangan pokok terung yang sama, tanpa baki. Berapakah bilangan maksimum batas?`, sp: '2.1.4',
      explain: `FSTB bagi ${x} dan ${y} = ${g} batas.`,
      render(area, done) { area.append(h('div', { class: 'big-emoji' }, '🌶️ 🍆')); choices(area, numOpts(g, [...factors(g).filter((d) => d > 1 && d < g), 2 * g, x / g], 'batas'), done); },
    };
  }
  let a; let b;
  do { a = pick([4, 6, 8, 9, 10, 12]); b = pick([5, 6, 8, 10, 12, 15]); } while (a === b || lcm(a, b) === Math.max(a, b) || lcm(a, b) > 60);
  const L = lcm(a, b);
  return {
    prompt: `Jurulatih mahu membahagikan semua murid kepada kumpulan ${a} orang atau kumpulan ${b} orang tanpa baki. Berapakah bilangan murid yang paling sedikit diperlukan?`, sp: '2.2.3',
    explain: `GSTK bagi ${a} dan ${b} = ${L} orang murid.`,
    render(area, done) { area.append(h('div', { class: 'big-emoji' }, '⚽ 🏃')); choices(area, numOpts(L, [a * b === L ? 2 * L : a * b, a + b, 2 * L, L - a], 'orang'), done); },
  };
}

export default {
  levels: {
    1: { title: 'Faktor dan Gandaan', sp: ['2.1.1', '2.2.1'], make: tp1 },
    2: { title: 'Faktor Perdana dan Gandaan Sepunya', sp: ['2.1.1', '2.1.2', '2.1.3', '2.2.1'], make: tp2 },
    3: { title: 'Kira FSTB dan GSTK', sp: ['2.1.3', '2.2.2'], make: tp3 },
    4: { title: 'Misi Bantuan dan Jadual Bas', sp: ['2.1.4', '2.2.3'], make: tp4 },
  },
};
