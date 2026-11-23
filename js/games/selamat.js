// Alam dan Manusia Tahun 1 · Tema 3.0 Kekal Selamat · Tajuk 3.1 Jaga Diri, Jaga Kita
// SP 3.1.1, 3.1.2 situasi selamat; 3.1.3 maklumat diri; 3.1.7 tindakan; 3.1.10 pasukan keselamatan.
// SP 3.1.4-3.1.6 (sentuhan tidak selamat) are left to teacher-led lessons on purpose.
import { h, pick, shuffle } from '../core.js';
import { choices } from '../shell.js';

function deck(items) {
  let pile = [];
  return () => { if (!pile.length) pile = shuffle(items); return pile.pop(); };
}

// Examples marked * come straight from the Dokumen Kurikulum (SP 3.1.2 table).
const SITUATIONS = [
  { e: '📺', t: 'Menonton televisyen bersama-sama ahli keluarga di rumah', safe: true }, // *
  { e: '🏃', t: 'Bermain di padang sekolah dengan pengawasan guru', safe: true }, // *
  { e: '🚸', t: 'Melintas jalan menggunakan lintasan pejalan kaki', safe: true }, // *
  { e: '🔪', t: 'Bermain dengan benda tajam', safe: false }, // *
  { e: '🪜', t: 'Berlari di tangga', safe: false }, // *
  { e: '🌑', t: 'Berjalan seorang diri di tempat gelap atau sunyi', safe: false }, // *
  { e: '🚗', t: 'Memakai tali pinggang keledar di dalam kereta', safe: true },
  { e: '🚲', t: 'Memakai topi keledar ketika menunggang basikal', safe: true },
  { e: '🏫', t: 'Menunggu ibu bapa di dalam kawasan sekolah', safe: true },
  { e: '🔥', t: 'Bermain mancis', safe: false },
  { e: '🔌', t: 'Menyentuh suis elektrik dengan tangan basah', safe: false },
  { e: '🌊', t: 'Bermain di tepi longkang yang dalam', safe: false },
  { e: '🍬', t: 'Menerima gula-gula daripada orang yang tidak dikenali', safe: false },
];

const INFO = [
  { e: '📞', t: 'Nombor telefon', share: false }, // *
  { e: '🏠', t: 'Alamat rumah', share: false }, // *
  { e: '🔑', t: 'Kata laluan', share: false }, // *
  { e: '📍', t: 'Lokasi kamu sekarang', share: false },
  { e: '🎂', t: 'Tarikh lahir dan nama penuh', share: false },
  { e: '🎨', t: 'Warna kegemaran', share: true },
  { e: '🐱', t: 'Haiwan kegemaran', share: true },
  { e: '🍜', t: 'Makanan kegemaran', share: true },
  { e: '🎵', t: 'Lagu kegemaran', share: true },
];

// Actions follow SP 3.1.7: bertenang, memberitahu orang yang dipercayai, menjerit meminta pertolongan.
const ACTIONS = [
  { e: '🚘', t: 'Orang yang tidak dikenali mengajak kamu masuk ke dalam keretanya.', right: 'Katakan TIDAK, lari dan beritahu orang yang dipercayai', wrong: ['Ikut kerana dia nampak baik', 'Diam dan tunggu di situ'] },
  { e: '🛒', t: 'Kamu terpisah daripada ibu di pasar raya.', right: 'Bertenang dan minta bantuan juruwang atau pengawal keselamatan', wrong: ['Keluar dari pasar raya seorang diri', 'Ikut orang yang tidak dikenali'] },
  { e: '🚪', t: 'Orang yang tidak dikenali mengetuk pintu ketika kamu seorang diri di rumah.', right: 'Jangan buka pintu dan hubungi ibu bapa', wrong: ['Buka pintu dan jemput dia masuk', 'Beritahu dia kamu seorang diri'] },
  { e: '💻', t: 'Seseorang di internet meminta alamat rumah kamu.', right: 'Jangan beri, dan beritahu ibu bapa atau guru', wrong: ['Beri kerana dia kawan dalam talian', 'Beri nombor telefon sahaja'] },
  { e: '🔥', t: 'Kamu nampak asap dan api di dapur.', right: 'Keluar segera dan menjerit meminta pertolongan', wrong: ['Bersembunyi di dalam bilik', 'Cuba padam api seorang diri'] },
  { e: '😟', t: 'Seseorang membuat kamu rasa takut dan tidak selesa.', right: 'Bertenang dan beritahu orang yang dipercayai', wrong: ['Rahsiakan daripada semua orang', 'Salahkan diri sendiri'] },
];

// SP 3.1.10, using the duties listed in the Dokumen Kurikulum.
const TEAMS = [
  { q: 'Siapakah yang memadam dan mengawal kebakaran?', a: 'Bomba' },
  { q: 'Siapakah yang mencegah jenayah dan menjaga keselamatan?', a: 'Polis' },
  { q: 'Siapakah yang melindungi negara?', a: 'Tentera' },
];
const TEAM_ICONS = { Bomba: '🚒', Polis: '🚓', Tentera: '🎖️' };

const card = (e, t) => h('div', { class: 'scenario' }, h('div', { class: 'big-emoji' }, e), h('p', {}, t));

const nextSituation = deck(SITUATIONS);
function situation() {
  const s = nextSituation();
  return {
    prompt: 'Selamat atau tidak selamat?', sp: '3.1.1, 3.1.2', say: s.t,
    explain: s.safe ? 'Situasi selamat tidak membawa risiko atau bahaya.' : 'Situasi tidak selamat boleh mendatangkan bahaya kepada diri atau orang lain.',
    render(area, done) {
      area.append(card(s.e, s.t));
      choices(area, [
        { label: '✅ Selamat', text: 'Selamat', correct: s.safe },
        { label: '⚠️ Tidak selamat', text: 'Tidak selamat', correct: !s.safe },
      ], done);
    },
  };
}

const nextInfo = deck(INFO);
function info() {
  const i = nextInfo();
  return {
    prompt: 'Bolehkah maklumat ini dikongsi dengan orang yang tidak dikenali?', sp: '3.1.3', say: i.t,
    explain: 'Nombor telefon, alamat rumah dan kata laluan tidak boleh didedahkan kepada orang yang tidak dikenali.',
    render(area, done) {
      area.append(card(i.e, i.t));
      choices(area, [
        { label: '✅ Boleh dikongsi', text: 'Boleh dikongsi', correct: i.share },
        { label: '🚫 Rahsiakan', text: 'Rahsiakan', correct: !i.share },
      ], done);
    },
  };
}

const nextAct = deck([...ACTIONS.map((a) => ({ kind: 'act', a })), ...TEAMS.map((t) => ({ kind: 'team', t }))]);
function action() {
  const item = nextAct();
  if (item.kind === 'team') {
    const t = item.t;
    return {
      prompt: t.q, sp: '3.1.10', say: t.q,
      render(area, done) {
        choices(area, shuffle(Object.keys(TEAM_ICONS)).map((k) => ({ label: h('span', {}, h('span', { style: { fontSize: '56px', display: 'block' } }, TEAM_ICONS[k]), k), text: k, correct: k === t.a })), done);
      },
    };
  }
  const a = item.a;
  return {
    prompt: 'Apakah tindakan yang betul?', sp: '3.1.7', say: a.t,
    explain: 'Bertenang, beritahu orang yang dipercayai atau menjerit meminta pertolongan.',
    render(area, done) {
      area.append(card(a.e, a.t));
      const opt = (text, correct) => ({ label: h('span', { style: { fontSize: '24px', lineHeight: 1.25 } }, text), text, correct });
      choices(area, shuffle([opt(a.right, true), ...a.wrong.map((w) => opt(w, false))]), done);
    },
  };
}

export default {
  levels: {
    1: { title: 'Selamat atau Tidak', sp: ['3.1.1', '3.1.2'], make: situation },
    2: { title: 'Rahsiakan Maklumat Diri', sp: ['3.1.3'], make: info },
    3: { title: 'Apa Patut Aku Buat?', sp: ['3.1.7', '3.1.10'], make: action },
  },
};
