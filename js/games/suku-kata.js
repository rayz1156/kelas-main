// Bahasa Melayu Tahun 1 (SK dan SJK) · SP 3.1.2 Membaca suku kata dan perkataan melalui lagu dan permainan
// SP 4.2.1 Menggabungkan dan membentuk suku kata, perkataan dan frasa.
import { h, pick, shuffle, sample, sfx, speak } from '../core.js';
import { choices } from '../shell.js';

const TWO = [
  ['🐴', 'ku', 'da'], ['⚽', 'bo', 'la'], ['📕', 'bu', 'ku'], ['🦶', 'ka', 'ki'], ['👁️', 'ma', 'ta'], ['🍞', 'ro', 'ti'],
  ['🥛', 'su', 'su'], ['🦷', 'gi', 'gi'], ['🧢', 'to', 'pi'], ['👕', 'ba', 'ju'], ['🐟', 'i', 'kan'], ['🐔', 'a', 'yam'],
  ['🏠', 'ru', 'mah'], ['🌙', 'bu', 'lan'], ['🌸', 'bu', 'nga'], ['🐱', 'ku', 'cing'], ['🍌', 'pi', 'sang'], ['☂️', 'pa', 'yung'],
  ['🐘', 'ga', 'jah'], ['🍍', 'na', 'nas'], ['🚚', 'lo', 'ri'], ['🚢', 'ka', 'pal'], ['🍎', 'e', 'pal'], ['🥄', 'su', 'du'],
  ['🌳', 'po', 'kok'], ['🐰', 'ar', 'nab'],
];
const THREE = [
  ['🚗', 'ke', 're', 'ta'], ['🥥', 'ke', 'la', 'pa'], ['🏫', 'se', 'ko', 'lah'], ['🚲', 'ba', 'si', 'kal'], ['🐯', 'ha', 'ri', 'mau'],
  ['🦗', 'be', 'la', 'lang'], ['🍉', 'tem', 'bi', 'kai'], ['🌈', 'pe', 'la', 'ngi'], ['🦇', 'ke', 'la', 'war'], ['🚩', 'ben', 'de', 'ra'],
  ['📱', 'te', 'le', 'fon'], ['🪑', 'ke', 'ru', 'si'],
];
const word = (w) => w.slice(1).join('');
const SYLLABLES = [...new Set([...TWO, ...THREE].flatMap((w) => w.slice(1)))];

function deck(items) {
  let pile = [];
  return () => { if (!pile.length) pile = shuffle(items); return pile.pop(); };
}
const nextTwo = deck(TWO);
const nextThree = deck(THREE);

// ---------- TP1: suku kata yang hilang ----------
function missing() {
  const w = nextTwo();
  const syl = w.slice(1);
  const gap = Math.random() < 0.5 ? 0 : 1;
  const answer = syl[gap];
  return {
    prompt: 'Pilih suku kata yang hilang.', sp: '3.1.2', say: word(w),
    onRight: () => speak(word(w)),
    explain: `${syl.join(' + ')} = ${word(w)}`,
    render(area, done) {
      area.append(h('div', { class: 'big-emoji' }, w[0]),
        h('div', { class: 'word-gap' }, syl.map((s, i) => (i === gap ? h('span', { class: 'blank' }, '__') : s))));
      const opts = [answer, ...sample(SYLLABLES, 3, [answer])].map((s) => ({ label: s, correct: s === answer }));
      choices(area, shuffle(opts), done);
    },
  };
}

// ---------- TP2 & TP3: bina kereta api perkataan ----------
function train(w, extra, sp) {
  const syl = w.slice(1);
  const pool = shuffle([...syl, ...sample(SYLLABLES, extra, syl)]);
  return {
    prompt: 'Bina perkataan dengan gerabak suku kata.', sub: 'Tekan suku kata mengikut urutan.', sp,
    onRight: () => speak(word(w)),
    explain: `${syl.join(' + ')} = ${word(w)}`,
    render(area, done) {
      const picked = [];
      const wagons = h('div', { class: 'train', 'aria-live': 'polite' });
      const check = h('button', { class: 'btn green', type: 'button', disabled: true }, 'Semak ✔');
      const buttons = pool.map((s) => {
        const b = h('button', { class: 'syl', type: 'button' }, s);
        b.addEventListener('click', () => {
          if (picked.length >= syl.length) return;
          picked.push({ s, b }); b.disabled = true; sfx('tap'); speak(s); draw();
        });
        return b;
      });
      const draw = () => {
        wagons.replaceChildren(h('span', { class: 'engine', 'aria-hidden': 'true' }, '🚂'),
          ...syl.map((_, i) => h('div', { class: 'wagon' + (picked[i] ? '' : ' empty') }, picked[i] ? picked[i].s : '?')));
        check.disabled = picked.length !== syl.length;
      };
      check.addEventListener('click', () => { check.disabled = true; buttons.forEach((b) => (b.disabled = true)); done(picked.map((p) => p.s).join('') === word(w), word(w)); });
      draw();
      area.append(h('div', { class: 'big-emoji' }, w[0]), wagons, h('div', { class: 'syl-pool' }, buttons),
        h('div', { class: 'row' },
          h('button', { class: 'btn secondary', type: 'button', onclick: () => { const p = picked.pop(); if (p) { p.b.disabled = false; draw(); } } }, '↶ Undur'),
          check));
    },
  };
}

export default {
  levels: {
    1: { title: 'Suku Kata Hilang', sp: ['3.1.2'], make: missing },
    2: { title: 'Kereta Api Dua Gerabak', sp: ['3.1.2', '4.2.1'], make: () => train(nextTwo(), 2, '4.2.1') },
    3: { title: 'Kereta Api Tiga Gerabak', sp: ['4.2.1'], make: () => train(nextThree(), 3, '4.2.1') },
  },
};
