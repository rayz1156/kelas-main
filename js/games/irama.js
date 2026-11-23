// Pendidikan Muzik Tingkatan 1 · 1.1 Teori Muzik (SP 1.1.1, 1.1.2) · 3.1 Kreativiti Muzik: corak irama (SP 3.1.1, 3.1.2)
// TP follows the Teori Muzik / Kemahiran Muzik Standard Prestasi: TP1 state basic notation, TP2 explain it,
// TP3 apply notation reading while performing (clapping). Notation is drawn as SVG so it renders on every device.
import { h, pick, shuffle, isMuted } from '../core.js';
import { choices } from '../shell.js';

const VAL = { w: 4, hd: 3, h: 2, q: 1, ee: 1, e: 0.5, Rw: 4, Rh: 2, Rq: 1, Re: 0.5 };
const NAME = {
  w: 'Semibrif', hd: 'Minim bertitik', h: 'Minim', q: 'Krocet', e: 'Kuaver',
  Rw: 'Tanda rehat semibrif', Rh: 'Tanda rehat minim', Rq: 'Tanda rehat krocet', Re: 'Tanda rehat kuaver',
};
const NOTES = ['w', 'hd', 'h', 'q', 'e'];
const RESTS = ['Rw', 'Rh', 'Rq', 'Re'];
const beats = (v) => (v === 0.5 ? '½' : String(v));

// ---------- SVG notation (single-line staff) ----------
const Y = 62; // staff line
const S = 'stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"';
const head = (x, filled) => `<ellipse cx="${x}" cy="${Y}" rx="9.5" ry="6.8" transform="rotate(-20 ${x} ${Y})" ${filled ? 'fill="currentColor"' : `${S}`}/>`;
const stem = (x) => `<line x1="${x + 8.5}" y1="${Y - 2}" x2="${x + 8.5}" y2="${Y - 44}" ${S}/>`;
const WIDTH = { w: 64, hd: 60, h: 52, q: 40, ee: 66, e: 44, Rw: 64, Rh: 52, Rq: 40, Re: 40 };

function glyph(t, x) {
  switch (t) {
    case 'w': return head(x, false);
    case 'h': return head(x, false) + stem(x);
    case 'hd': return head(x, false) + stem(x) + `<circle cx="${x + 18}" cy="${Y - 3}" r="3.2" fill="currentColor"/>`;
    case 'q': return head(x, true) + stem(x);
    case 'e': return head(x, true) + stem(x) + `<path d="M${x + 8.5} ${Y - 44} c 3 9 15 12 11 27" ${S}/>`;
    case 'ee': return head(x, true) + stem(x) + head(x + 32, true) + stem(x + 32) + `<rect x="${x + 7}" y="${Y - 46}" width="35" height="7" fill="currentColor"/>`;
    case 'Rw': return `<rect x="${x - 11}" y="${Y}" width="22" height="9" fill="currentColor"/>`;
    case 'Rh': return `<rect x="${x - 11}" y="${Y - 9}" width="22" height="9" fill="currentColor"/>`;
    case 'Rq': return `<path d="M${x - 4} ${Y - 34} l 9 11 l -8 9 l 9 11 c -8 -4 -13 1 -6 9" stroke="currentColor" stroke-width="3.6" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
    case 'Re': return `<circle cx="${x - 4}" cy="${Y - 24}" r="4" fill="currentColor"/><path d="M${x - 4} ${Y - 21} q 7 2 11 -5 l -9 28" ${S}/>`;
    default: return '';
  }
}

/** Draw a bar of rhythm tokens. opts: { meter: 4 | 3 | 2, barline: true, blank: true (adds a ? slot at the end) }. */
function notation(tokens, opts = {}) {
  const { meter, barline = true, blank = false } = opts;
  let x = meter ? 50 : 24;
  let body = meter ? `<text x="20" y="${Y - 4}" font-size="27" font-weight="900" text-anchor="middle" fill="currentColor">${meter}</text><text x="20" y="${Y + 22}" font-size="27" font-weight="900" text-anchor="middle" fill="currentColor">4</text>` : '';
  for (const t of tokens) { body += glyph(t, x + 10); x += WIDTH[t]; }
  if (blank) { body += `<rect x="${x - 2}" y="${Y - 40}" width="40" height="52" rx="8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="6 5"/><text x="${x + 18}" y="${Y - 6}" font-size="26" font-weight="900" text-anchor="middle" fill="currentColor">?</text>`; x += 52; }
  const w = x + (barline ? 10 : 4);
  const line = `<line x1="${meter ? 36 : 4}" y1="${Y}" x2="${w - 2}" y2="${Y}" stroke="currentColor" stroke-width="1.6"/>`;
  const bar = barline ? `<line x1="${w - 4}" y1="${Y - 18}" x2="${w - 4}" y2="${Y + 18}" stroke="currentColor" stroke-width="2.4"/>` : '';
  const label = tokens.map((t) => NAME[t === 'ee' ? 'e' : t] + (t === 'ee' ? ' (2)' : '')).join(', ');
  return h('span', { class: 'notation', role: 'img', 'aria-label': label, html: `<svg viewBox="0 0 ${w} 96" width="${w * 1.25}" height="${96 * 1.25}" xmlns="http://www.w3.org/2000/svg">${line}${body}${bar}</svg>` });
}

// ---------- Audio ----------
let ctx;
let playing = false;
/** Play tokens at a tempo, with a 4-beat count-in. Returns the duration in ms, or 0 when sound is off. */
function play(tokens, bpm = 80) {
  if (isMuted() || playing) return 0;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch { return 0; }
  const beat = 60 / bpm;
  const tone = (at, dur, freq, vol) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.012);
    g.gain.setValueAtTime(vol, at + Math.max(0.03, dur * 0.8 - 0.05));
    g.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.06, dur * 0.85));
    o.connect(g).connect(ctx.destination); o.start(at); o.stop(at + dur);
  };
  let t = ctx.currentTime + 0.15;
  for (let i = 0; i < 4; i++) { tone(t, 0.08, i === 0 ? 1000 : 700, 0.18); t += beat; }
  for (const tok of tokens) {
    const parts = tok === 'ee' ? ['e', 'e'] : [tok];
    for (const p of parts) {
      const d = VAL[p] * beat;
      if (!p.startsWith('R')) tone(t, d, 784, 0.35);
      t += d;
    }
  }
  const ms = (t - ctx.currentTime) * 1000 + 100;
  playing = true; setTimeout(() => { playing = false; }, ms);
  return ms;
}

function player(tokens, { auto = true } = {}) {
  const status = h('span', { class: 'play-status' });
  const btn = h('button', { class: 'btn secondary', type: 'button' }, '▶ Main corak irama');
  const go = () => {
    if (isMuted()) { status.textContent = 'Bunyi dimatikan. Tekan 🔊 di bahagian atas.'; return; }
    const ms = play(tokens);
    if (!ms) return;
    btn.disabled = true; status.textContent = '1, 2, 3, 4 ... dengar!';
    setTimeout(() => { btn.disabled = false; btn.textContent = '🔁 Main semula'; status.textContent = ''; }, ms);
  };
  btn.addEventListener('click', go);
  if (auto) setTimeout(go, 450);
  return h('div', { class: 'row', style: { justifyContent: 'center', alignItems: 'center' } }, btn, status);
}

// ---------- Rhythm patterns ----------
const CELLS = [['q', 1], ['q', 1], ['ee', 1], ['ee', 1], ['h', 2], ['Rq', 1], ['hd', 3]];
function pattern(total = 4) {
  for (;;) {
    const out = []; let left = total;
    while (left > 0) { const [t, v] = pick(CELLS.filter(([, v]) => v <= left)); out.push(t); left -= v; }
    if (!out[0].startsWith('R') && out.length >= 2) return out;
  }
}
function distinctPatterns(n, total = 4) {
  const seen = new Map();
  let guard = 0;
  while (seen.size < n && guard++ < 400) { const p = pattern(total); seen.set(p.join(' '), p); }
  return [...seen.values()];
}

// ---------- TP1: kenal not dan tanda rehat ----------
function tp1() {
  const isRest = Math.random() < 0.35;
  const t = pick(isRest ? RESTS : NOTES);
  const family = isRest ? RESTS : NOTES;
  const kind = pick(['nama', 'nilai', 'simbol']);
  const val = `${NAME[t]} bernilai ${beats(VAL[t])} detik.`;
  if (kind === 'nama') {
    return {
      prompt: 'Apakah nama simbol ini?', sp: '1.1.1', explain: val,
      render(area, done) { area.append(notation([t], { barline: false })); choices(area, shuffle([t, ...shuffle(family.filter((x) => x !== t)).slice(0, 3)]).map((x) => ({ label: NAME[x], correct: x === t })), done); },
    };
  }
  if (kind === 'nilai') {
    const vals = [...new Set(family.map((x) => VAL[x]))];
    return {
      prompt: 'Berapakah nilai detik simbol ini?', sp: '1.1.1', sub: 'Krocet = 1 detik', explain: val,
      render(area, done) {
        area.append(notation([t], { barline: false }));
        const pickVals = shuffle([VAL[t], ...shuffle(vals.filter((v) => v !== VAL[t])).slice(0, 3)]);
        choices(area, pickVals.map((v) => ({ label: `${beats(v)} detik`, correct: v === VAL[t] })), done);
      },
    };
  }
  const others = shuffle(family.filter((x) => x !== t)).slice(0, 3);
  return {
    prompt: `Pilih simbol ${NAME[t].toLowerCase()}.`, sp: '1.1.1', say: `Pilih simbol ${NAME[t]}`, explain: val,
    render(area, done) { const w = choices(area, shuffle([t, ...others]).map((x) => ({ label: notation([x], { barline: false }), text: NAME[t], correct: x === t })), done); w.classList.add('notes'); },
  };
}

// ---------- TP2: meter lazim dan bar ----------
function fill(total) {
  // Tokens summing exactly to `total` (whole beats), notes and crotchet rests only.
  const out = []; let left = total;
  while (left > 0) { const opts = [['q', 1], ['ee', 1], ['h', 2], ['Rq', 1]].filter(([, v]) => v <= left); const [t, v] = pick(opts); out.push(t); left -= v; }
  return out;
}
const sum = (ts) => ts.reduce((s, t) => s + VAL[t], 0);

function tp2() {
  const m = pick([2, 3, 4]);
  const kind = pick(['meter', 'lengkap', 'lengkap', 'mana']);
  if (kind === 'meter') {
    return {
      prompt: `Meter ${m}/4: berapakah bilangan detik krocet dalam satu bar?`, sp: '1.1.2',
      explain: `Angka atas (${m}) ialah bilangan detik dalam satu bar. Angka bawah (4) bermaksud setiap detik bernilai satu krocet.`,
      render(area, done) { area.append(notation(fill(m), { meter: m })); choices(area, shuffle([2, 3, 4, 6]).map((v) => ({ label: `${v} detik`, correct: v === m })), done); },
    };
  }
  if (kind === 'lengkap') {
    const missing = pick([1, 2, 3].filter((v) => v < m));
    const answer = { 1: 'q', 2: 'h', 3: 'hd' }[missing];
    const given = fill(m - missing);
    const opts = shuffle(['w', 'hd', 'h', 'q', 'e'].filter((x) => x !== answer)).slice(0, 3).concat(answer);
    return {
      prompt: `Not manakah yang melengkapkan bar ini dalam meter ${m}/4?`, sp: '1.1.2',
      explain: `Bar ${m}/4 perlu ${m} detik. Sudah ada ${sum(given)} detik, jadi perlu ${missing} detik lagi: ${NAME[answer].toLowerCase()}.`,
      render(area, done) { area.append(notation(given, { meter: m, blank: true })); const w = choices(area, shuffle(opts).map((x) => ({ label: notation([x], { barline: false }), text: NAME[answer], correct: x === answer })), done); w.classList.add('notes'); },
    };
  }
  const right = fill(m);
  const wrongs = [fill(m - 1), [...fill(m), 'q'], fill(m + 1)].filter((ts) => sum(ts) !== m);
  return {
    prompt: `Bar manakah yang lengkap dalam meter ${m}/4?`, sp: '1.1.2',
    explain: `Jumlah nilai not dan tanda rehat dalam bar mesti ${m} detik.`,
    render(area, done) { const w = choices(area, shuffle([right, ...wrongs.slice(0, 2)]).map((ts) => ({ label: notation(ts, { meter: m }), text: `Bar ${sum(ts)} detik`, correct: ts === right })), done); w.classList.add('notes', 'wide'); },
  };
}

// ---------- TP3: dengar, tiru dan baca corak irama ----------
const MARK = [{ label: '✅ Tepat', correct: true }, { label: '🔁 Belum tepat', correct: false }];
function tp3() {
  const kind = pick(['dengar', 'dengar', 'tiru', 'baca']);
  if (kind === 'dengar') {
    const [right, ...wrongs] = distinctPatterns(3);
    return {
      prompt: 'Dengar. Corak irama manakah yang dimainkan?', sp: '3.1.1', sub: 'Kiraan 1, 2, 3, 4 dahulu, kemudian corak irama.',
      explain: 'Corak irama yang betul ditanda hijau. Tepuk bersama sekali lagi.',
      render(area, done) { area.append(player(right)); const w = choices(area, shuffle([right, ...wrongs]).map((ts) => ({ label: notation(ts, { meter: 4 }), text: 'Corak yang dimainkan', correct: ts === right })), done); w.classList.add('notes', 'wide'); },
    };
  }
  const p = pattern(4);
  if (kind === 'tiru') {
    return {
      prompt: 'Tiru: dengar, kemudian pasukan tepuk semula corak irama ini.', sp: '3.1.2', sub: 'Guru menanda sama ada tepukan pasukan tepat.',
      explain: 'Meniru (imitate) corak irama yang didengar. Tukar peranan: pasukan lain cipta corak untuk ditiru.',
      render(area, done) {
        const hidden = h('div', { hidden: true }, notation(p, { meter: 4 }));
        area.append(player(p), h('button', { class: 'icon-btn', type: 'button', onclick: (e) => { hidden.hidden = false; e.currentTarget.remove(); } }, '👁️ Tunjuk notasi'), hidden);
        choices(area, MARK, done);
      },
    };
  }
  return {
    prompt: 'Baca dan tepuk corak irama ini.', sp: '3.1.2', sub: 'Pasukan tepuk dahulu. Kemudian tekan ▶ untuk menyemak.',
    explain: 'Membaca notasi semasa bermain: setiap krocet satu tepukan, dua kuaver dua tepukan pantas dalam satu detik, minim ditahan dua detik.',
    render(area, done) { area.append(notation(p, { meter: 4 }), player(p, { auto: false })); choices(area, MARK, done); },
  };
}

export default {
  levels: {
    1: { title: 'Kenal Not dan Tanda Rehat', sp: ['1.1.1'], make: tp1 },
    2: { title: 'Meter dan Bar', sp: ['1.1.2'], make: tp2 },
    3: { title: 'Dengar, Tiru dan Tepuk', sp: ['3.1.1', '3.1.2'], make: tp3 },
  },
};
