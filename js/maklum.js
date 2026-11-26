// Maklum balas (feedback) from teachers and pupils, for DIMENSI members only.
// The form posts to dtconnect.org with the member's signed ticket; the server checks it again
// and emails the developer, with Reply-To set to the member. Nothing is stored on this device.
import { h, store } from './core.js';
import { GAMES } from './data.js';
import { isMember, gate } from './ahli.js';

const API = 'https://dtconnect.org/wp-json/dimensi/v1/jommain/maklum-balas';
const JENIS = [
  ['🐞', 'Masalah teknikal'],
  ['❌', 'Soalan atau jawapan salah'],
  ['💡', 'Cadangan penambahbaikan'],
  ['🎮', 'Idea permainan baharu'],
  ['❤️', 'Pujian'],
];

const TIP_GURU = 'Contoh: Di TP3, soalan nombor 4 ada dua jawapan yang betul. Murid keliru.';
const TIP_MURID = 'Contoh: Seronok! Saya mahu lebih banyak soalan. Butang merah susah ditekan.';

/** Small button that opens the form. `ctx` = {game, level, mode} for the current screen. */
export const feedbackButton = (ctx = {}, cls = 'chip') =>
  h('button', { class: cls, type: 'button', onclick: () => openFeedback(ctx) }, isMember() ? '💬 Maklum balas' : '🔒 Maklum balas');

export function openFeedback(ctx = {}) {
  if (!isMember()) { gate('Maklum balas kepada pembangun'); return; }
  document.querySelector('.gate-back')?.remove();

  let jenis = '', daripada = 'Guru', bintang = 0;
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey, true); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };

  const game = h('select', { 'aria-label': 'Permainan' },
    h('option', { value: '' }, 'Umum (seluruh JomMain)'),
    GAMES.map((g) => h('option', { value: g.id, selected: g.id === ctx.game }, `${g.title} · ${g.level}`)));

  const chips = (items, get, set) => {
    const wrap = h('div', { class: 'fb-chips' });
    const draw = () => wrap.replaceChildren(...items.map(([e, t]) => h('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(get() === t),
      onclick: () => { set(get() === t ? '' : t); draw(); },
    }, `${e} ${t}`)));
    draw();
    return wrap;
  };

  const stars = h('div', { class: 'fb-stars', 'aria-label': 'Penilaian' });
  const drawStars = () => stars.replaceChildren(...[1, 2, 3, 4, 5].map((n) => h('button', {
    type: 'button', class: n <= bintang ? 'on' : '', 'aria-label': `${n} bintang`, 'aria-pressed': String(n === bintang),
    onclick: () => { bintang = bintang === n ? 0 : n; drawStars(); },
  }, n <= bintang ? '★' : '☆')));
  drawStars();

  const text = h('textarea', { rows: 5, maxlength: 3000, required: true, placeholder: TIP_GURU });
  const msg = h('p', { class: 'form-msg', role: 'status' });
  const send = h('button', { class: 'btn green', type: 'submit' }, '📨 Hantar maklum balas');

  const form = h('form', { class: 'fb-form', onsubmit: async (e) => {
    e.preventDefault();
    if (text.value.trim().length < 3) { msg.className = 'form-msg no'; msg.textContent = 'Tulis sedikit maklum balas dahulu, contohnya "Seronok!" atau apa yang perlu dibaiki.'; text.focus(); return; }
    const g = GAMES.find((x) => x.id === game.value);
    const konteks = [ctx.level ? `TP${ctx.level}` : '', ctx.mode || '', location.pathname + location.search, `${innerWidth}x${innerHeight}`, navigator.userAgent.slice(0, 160)].filter(Boolean).join(' · ');
    send.disabled = true; msg.className = 'form-msg'; msg.textContent = 'Sedang dihantar…';
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        t: store.get('ahli', {})?.t || '', permainan: game.value, tajuk: g ? `${g.title} (${g.level})` : '',
        jenis, daripada, bintang, mesej: text.value.trim(), konteks,
      }) });
      const j = await r.json().catch(() => ({}));
      msg.className = 'form-msg ' + (j.ok ? 'ok' : 'no');
      msg.textContent = j.mesej || (j.ok ? 'Terima kasih! Maklum balas dihantar.' : 'Tidak dapat menghantar. Cuba lagi.');
      if (j.ok) { form.replaceChildren(msg, h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: close }, 'Tutup'))); return; }
    } catch {
      msg.className = 'form-msg no'; msg.textContent = 'Masalah sambungan internet. Cuba lagi.';
    }
    send.disabled = false;
  } },
    h('label', { class: 'fb-label' }, 'Permainan', game),
    h('div', { class: 'fb-label' }, 'Jenis maklum balas', chips(JENIS, () => jenis, (v) => (jenis = v))),
    h('div', { class: 'fb-label' }, 'Daripada', chips([['🧑‍🏫', 'Guru'], ['🧒', 'Murid']], () => daripada, (v) => {
      daripada = v || 'Guru';
      text.placeholder = daripada === 'Murid' ? TIP_MURID : TIP_GURU;
    })),
    h('div', { class: 'fb-label' }, 'Penilaian (pilihan)', stars),
    h('label', { class: 'fb-label' }, 'Maklum balas anda', text),
    h('p', { class: 'note' }, 'Jangan tulis nama penuh murid. Pembangun boleh membalas terus ke e-mel ahli anda.'),
    msg,
    h('div', { class: 'row' }, send, h('button', { class: 'btn secondary', type: 'button', onclick: close }, 'Batal')));

  const back = h('div', { class: 'overlay gate-back', onclick: (e) => { if (e.target === back) close(); } },
    h('div', { class: 'gate fb', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Maklum balas' },
      h('button', { class: 'icon-btn gate-x', type: 'button', 'aria-label': 'Tutup', onclick: close }, '✕'),
      h('h2', {}, '💬 Maklum balas untuk JomMain'),
      h('p', {}, 'Bantu kami menambah baik permainan. Guru dan murid boleh menulis di sini. Maklum balas dihantar terus kepada pembangun.'),
      form));
  document.addEventListener('keydown', onKey, true);
  document.body.append(back);
  text.focus();
}
