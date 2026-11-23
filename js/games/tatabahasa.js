// Bahasa Melayu Tingkatan 1 · Aspek Tatabahasa (Perincian: golongan kata, pembentukan kata, frasa, ayat)
// The document gives no SP codes or Standard Prestasi for Tatabahasa; it is assessed through the four language skills.
// Levels here are a teaching progression: TP1 name word classes, TP2 explain word formation, TP3 classify sentences,
// TP4 use grammar correctly (transform and correct sentences).
import { h, pick, shuffle } from '../core.js';
import { choices } from '../shell.js';

const opts = (correct, pool) => shuffle([correct, ...shuffle(pool.filter((x) => x !== correct)).slice(0, 3)]).map((t) => ({ label: t, correct: t === correct }));
/** Sentence with one word marked as [[word]]. */
function sentence(text) {
  const parts = text.split(/\[\[|\]\]/);
  return h('div', { class: 'sentence' }, parts.map((p, i) => (i % 2 ? h('mark', {}, p) : p)));
}

// ---------- TP1: golongan kata ----------
const CLASSES = ['Kata nama', 'Kata kerja', 'Kata adjektif', 'Kata tugas'];
const WORDS = [
  ['Ibu membeli [[sayur]] di pasar tani.', 'Kata nama', 'Kata nama am'],
  ['[[Pulau Pinang]] terkenal dengan makanannya.', 'Kata nama', 'Kata nama khas'],
  ['[[Kami]] akan bergotong-royong pada hari Sabtu.', 'Kata nama', 'Kata ganti nama diri pertama'],
  ['[[Awak]] sudah menyiapkan kerja rumah?', 'Kata nama', 'Kata ganti nama diri kedua'],
  ['[[Mereka]] menang dalam pertandingan pidato.', 'Kata nama', 'Kata ganti nama diri ketiga'],
  ['[[Itu]] beg sekolah Mei Ling.', 'Kata nama', 'Kata ganti nama tunjuk'],
  ['[[Siapakah]] ketua kelas tahun ini?', 'Kata nama', 'Kata ganti nama tanya'],
  ['Adik sedang bermain di [[sini]].', 'Kata nama', 'Kata ganti nama tempat'],
  ['Farid [[menendang]] bola ke arah gol.', 'Kata kerja', 'Kata kerja transitif'],
  ['Bayi itu sedang [[tidur]].', 'Kata kerja', 'Kata kerja tak transitif'],
  ['Surat itu [[ditulis]] oleh Kavitha.', 'Kata kerja', 'Kata kerja pasif'],
  ['Mereka [[berlari]] di padang sekolah.', 'Kata kerja', 'Kata kerja tak transitif'],
  ['Bunga raya itu berwarna [[merah]].', 'Kata adjektif', 'Kata adjektif warna'],
  ['Bangunan itu sangat [[tinggi]].', 'Kata adjektif', 'Kata adjektif ukuran'],
  ['Meja di kantin itu [[bulat]].', 'Kata adjektif', 'Kata adjektif bentuk'],
  ['Durian itu sangat [[harum]].', 'Kata adjektif', 'Kata adjektif pancaindera'],
  ['Ayah pulang [[lewat]] semalam.', 'Kata adjektif', 'Kata adjektif waktu'],
  ['Kereta itu bergerak [[laju]].', 'Kata adjektif', 'Kata adjektif cara'],
  ['Aina berasa [[gembira]] apabila menerima hadiah.', 'Kata adjektif', 'Kata adjektif perasaan'],
  ['Rumah nenek [[jauh]] dari bandar.', 'Kata adjektif', 'Kata adjektif jarak'],
  ['Murid itu [[rajin]] membantu guru.', 'Kata adjektif', 'Kata adjektif sifat atau keadaan'],
  ['Saya suka membaca [[dan]] melukis.', 'Kata tugas', 'Kata hubung'],
  ['[[Wah]], cantiknya pemandangan di Cameron Highlands!', 'Kata tugas', 'Kata seru'],
  ['[[Bilakah]] bas sekolah akan tiba?', 'Kata tugas', 'Kata tanya'],
  ['[[Sila]] beratur dengan tertib.', 'Kata tugas', 'Kata perintah'],
  ['[[Ya]], saya sudah membaca novel itu.', 'Kata tugas', 'Kata pembenar'],
  ['[[Maka]] bersukarialah seluruh rakyat jelata.', 'Kata tugas', 'Kata pangkal ayat'],
];
function tp1() {
  const [text, cls, sub] = pick(WORDS);
  const word = text.match(/\[\[(.+?)\]\]/)[1];
  if (Math.random() < 0.55) {
    return {
      prompt: 'Apakah golongan kata bagi perkataan yang bertanda?', say: text.replace(/\[\[|\]\]/g, ''),
      explain: `"${word}" ialah ${sub.toLowerCase()} (golongan ${cls.toLowerCase()}).`,
      render(area, done) { area.append(sentence(text)); choices(area, CLASSES.map((c) => ({ label: c, correct: c === cls })), done); },
    };
  }
  const pool = WORDS.filter((w) => w[1] === cls).map((w) => w[2]);
  return {
    prompt: `Perkataan bertanda ialah ${cls.toLowerCase()}. Apakah jenisnya?`, say: text.replace(/\[\[|\]\]/g, ''),
    explain: `"${word}" ialah ${sub.toLowerCase()}.`,
    render(area, done) { area.append(sentence(text)); choices(area, opts(sub, [...new Set(pool)]), done); },
  };
}

// ---------- TP2: pembentukan kata ----------
const FORMS = [
  ['menulis', 'Kata berimbuhan awalan'], ['berjalan', 'Kata berimbuhan awalan'], ['penulis', 'Kata berimbuhan awalan'], ['terjatuh', 'Kata berimbuhan awalan'],
  ['makanan', 'Kata berimbuhan akhiran'], ['minuman', 'Kata berimbuhan akhiran'], ['lukisan', 'Kata berimbuhan akhiran'], ['manisan', 'Kata berimbuhan akhiran'],
  ['kebersihan', 'Kata berimbuhan apitan'], ['perpaduan', 'Kata berimbuhan apitan'], ['pendidikan', 'Kata berimbuhan apitan'], ['berpakaian', 'Kata berimbuhan apitan'],
  ['telunjuk', 'Kata berimbuhan sisipan'], ['gerigi', 'Kata berimbuhan sisipan'], ['gemuruh', 'Kata berimbuhan sisipan'], ['seruling', 'Kata berimbuhan sisipan'],
  ['kapal terbang', 'Kata majmuk bebas'], ['jalan raya', 'Kata majmuk bebas'], ['bilik darjah', 'Kata majmuk bebas'], ['kereta api', 'Kata majmuk bebas'], ['air terjun', 'Kata majmuk bebas'],
  ['kerjasama', 'Kata majmuk mantap'], ['olahraga', 'Kata majmuk mantap'], ['setiausaha', 'Kata majmuk mantap'], ['tanggungjawab', 'Kata majmuk mantap'], ['warganegara', 'Kata majmuk mantap'],
  ['rumah-rumah', 'Kata ganda penuh'], ['buku-buku', 'Kata ganda penuh'], ['murid-murid', 'Kata ganda penuh'],
  ['dedaun', 'Kata ganda separa'], ['pepohon', 'Kata ganda separa'], ['jejari', 'Kata ganda separa'],
  ['sayur-mayur', 'Kata ganda berentak'], ['lauk-pauk', 'Kata ganda berentak'], ['gunung-ganang', 'Kata ganda berentak'], ['kuih-muih', 'Kata ganda berentak'],
  ['tadika', 'Akronim'], ['pawagam', 'Akronim'], ['cerpen', 'Akronim'],
];
const GROUPS = {
  imbuhan: ['Kata berimbuhan awalan', 'Kata berimbuhan akhiran', 'Kata berimbuhan apitan', 'Kata berimbuhan sisipan'],
  majmuk: ['Kata majmuk bebas', 'Kata majmuk mantap', 'Kata ganda penuh', 'Akronim'],
  ganda: ['Kata ganda penuh', 'Kata ganda separa', 'Kata ganda berentak', 'Kata majmuk bebas'],
};
const WHY = {
  'Kata berimbuhan awalan': 'imbuhan ditambah di hadapan kata dasar',
  'Kata berimbuhan akhiran': 'imbuhan ditambah di belakang kata dasar',
  'Kata berimbuhan apitan': 'imbuhan ditambah serentak di hadapan dan di belakang kata dasar',
  'Kata berimbuhan sisipan': 'imbuhan (-el-, -em-, -er-) diselitkan di dalam kata dasar',
  'Kata majmuk bebas': 'dua kata dasar dieja terpisah',
  'Kata majmuk mantap': 'dua kata dasar yang sudah mantap dieja bercantum',
  'Kata ganda penuh': 'seluruh kata dasar diulang',
  'Kata ganda separa': 'hanya suku kata pertama diulang',
  'Kata ganda berentak': 'kata dasar diulang dengan perubahan bunyi yang berentak',
  Akronim: 'singkatan gabungan huruf atau suku kata yang disebut sebagai satu perkataan',
};
function tp2() {
  const [word, type] = pick(FORMS);
  const group = Object.values(GROUPS).find((g) => g.includes(type) && (type !== 'Kata ganda penuh' || Math.random() < 0.5)) || GROUPS.ganda;
  return {
    prompt: `Apakah bentuk kata bagi "${word}"?`, say: word,
    explain: `"${word}": ${type.toLowerCase()}, kerana ${WHY[type]}.`,
    render(area, done) { area.append(h('div', { class: 'word-gap' }, word)); choices(area, group.map((g) => ({ label: g, correct: g === type })), done); },
  };
}

// ---------- TP3: ragam, jenis dan susunan ayat ----------
const SENTENCES = [
  ['Ali menendang bola itu.', 'ragam', 'Ayat aktif'], ['Pengawas mengutip sampah di padang.', 'ragam', 'Ayat aktif'],
  ['Bola itu ditendang oleh Ali.', 'ragam', 'Ayat pasif'], ['Kerja rumah itu sudah saya siapkan.', 'ragam', 'Ayat pasif'], ['Sampah di padang dikutip oleh pengawas.', 'ragam', 'Ayat pasif'],
  ['Kakak menyapu sampah di halaman rumah.', 'jenis', 'Ayat penyata'], ['Adakah kamu sudah makan?', 'jenis', 'Ayat tanya'],
  ['Wah, besarnya kapal itu!', 'jenis', 'Ayat seru'], ['Tolong tutup tingkap itu.', 'jenis', 'Ayat perintah'], ['Jangan membuang sampah merata-rata.', 'jenis', 'Ayat perintah'],
  ['Murid-murid itu sedang membaca di perpustakaan.', 'susunan', 'Ayat susunan biasa'], ['Sedang membaca di perpustakaan murid-murid itu.', 'susunan', 'Ayat susunan songsang'],
  ['Cantik sungguh baju kurung Siti.', 'susunan', 'Ayat susunan songsang'], ['Baju kurung Siti cantik sungguh.', 'susunan', 'Ayat susunan biasa'],
  ['Adik menangis.', 'binaan', 'Ayat tunggal'], ['Adik menangis kerana mainannya rosak.', 'binaan', 'Ayat majmuk'],
  ['Ayah memandu kereta dan ibu membaca peta.', 'binaan', 'Ayat majmuk'], ['Pokok rambutan itu berbuah lebat.', 'binaan', 'Ayat tunggal'],
];
const KIND = {
  ragam: { q: 'Apakah ragam ayat ini?', o: ['Ayat aktif', 'Ayat pasif'] },
  jenis: { q: 'Apakah jenis ayat ini?', o: ['Ayat penyata', 'Ayat tanya', 'Ayat seru', 'Ayat perintah'] },
  susunan: { q: 'Apakah susunan ayat ini?', o: ['Ayat susunan biasa', 'Ayat susunan songsang'] },
  binaan: { q: 'Ayat tunggal atau ayat majmuk?', o: ['Ayat tunggal', 'Ayat majmuk'] },
};
function tp3() {
  const [text, k, answer] = pick(SENTENCES);
  return {
    prompt: KIND[k].q, say: text,
    explain: `"${text}" ialah ${answer.toLowerCase()}.`,
    render(area, done) { area.append(sentence(text)); choices(area, KIND[k].o.map((o) => ({ label: o, correct: o === answer })), done); },
  };
}

// ---------- TP4: gunakan tatabahasa dengan betul ----------
const TRANSFORMS = [
  { q: 'Pilih ayat pasif bagi: "Ali menendang bola itu."', a: 'Bola itu ditendang oleh Ali.', w: ['Bola itu ditendang Ali oleh.', 'Ali ditendang oleh bola itu.', 'Bola itu menendang oleh Ali.'] },
  { q: 'Pilih ayat pasif bagi: "Saya membaca buku itu."', a: 'Buku itu saya baca.', w: ['Buku itu dibaca oleh saya.', 'Buku itu dibaca saya.', 'Saya dibaca buku itu.'], note: 'Bagi kata ganti nama diri pertama dan kedua, ayat pasif tidak menggunakan imbuhan di- dan "oleh".' },
  { q: 'Pilih ayat aktif bagi: "Kek itu dibuat oleh ibu."', a: 'Ibu membuat kek itu.', w: ['Ibu dibuat kek itu.', 'Kek itu membuat ibu.', 'Ibu kek itu membuat.'] },
  { q: 'Pilih susunan songsang bagi: "Pemandangan di pantai itu indah sekali."', a: 'Indah sekali pemandangan di pantai itu.', w: ['Pantai itu pemandangan indah sekali.', 'Pemandangan indah sekali di pantai itu.', 'Sekali indah pemandangan di pantai itu.'] },
  { q: 'Pilih ayat yang betul tatabahasanya.', a: 'Para guru menghadiri mesyuarat.', w: ['Para guru-guru menghadiri mesyuarat.', 'Guru-guru-guru menghadiri mesyuarat.', 'Para-para guru menghadiri mesyuarat.'], note: '"Para" sudah menunjukkan jamak, jadi kata nama selepasnya tidak digandakan.' },
  { q: 'Pilih ayat yang betul tatabahasanya.', a: 'Banyak murid menyertai larian amal.', w: ['Banyak murid-murid menyertai larian amal.', 'Ramai murid-murid menyertai larian amal.', 'Semua murid-murid menyertai larian amal.'], note: 'Penanda jamak seperti "banyak", "ramai" dan "semua" tidak diikuti kata ganda.' },
  { q: 'Pilih ayat yang betul tatabahasanya.', a: 'Mereka pergi ke perpustakaan.', w: ['Mereka-mereka pergi ke perpustakaan.', 'Mereka pergi di perpustakaan.', 'Mereka-mereka pergi di perpustakaan.'], note: 'Kata ganti nama "mereka" tidak digandakan. "Ke" digunakan untuk arah tujuan.' },
  { q: 'Pilih ayat yang betul tatabahasanya.', a: 'Buku saya tertinggal di kelas.', w: ['Saya punya buku tertinggal di kelas.', 'Saya buku tertinggal di kelas.', 'Buku punya saya tertinggal di kelas.'], note: 'Frasa nama milik ditulis "buku saya", bukan "saya punya buku".' },
  { q: 'Pilih ayat yang betul tatabahasanya.', a: 'Hadiah itu diberikan kepada Daniel.', w: ['Hadiah itu diberikan pada Daniel.', 'Hadiah itu diberikan ke Daniel.', 'Hadiah itu diberikan dari Daniel.'], note: '"Kepada" digunakan di hadapan manusia sebagai penerima.' },
  { q: 'Pilih ayat yang betul tatabahasanya.', a: 'Kami belajar di bilik darjah.', w: ['Kami belajar di bilikdarjah.', 'Kami belajar dibilik darjah.', 'Kami belajar dibilikdarjah.'], note: 'Kata sendi nama "di" dieja terpisah, dan "bilik darjah" ialah kata majmuk bebas.' },
  { q: 'Pilih ayat yang betul tatabahasanya.', a: 'Guru memberitahu kami tentang lawatan itu.', w: ['Guru memberi tahu kami tentang lawatan itu.', 'Guru memberi-tahu kami tentang lawatan itu.', 'Guru memberitahu kepada kami tentang lawatan itu.'], note: '"Beritahu" ialah kata majmuk mantap, jadi dieja bercantum. Kata kerja transitif tidak diikuti "kepada" sebelum objeknya.' },
];
function tp4() {
  const t = pick(TRANSFORMS);
  return {
    prompt: t.q,
    explain: `Jawapan: "${t.a}"${t.note ? ' ' + t.note : ''}`,
    render(area, done) { const w = choices(area, shuffle([t.a, ...t.w]).map((x) => ({ label: x, correct: x === t.a })), done); w.classList.add('long'); },
  };
}

export default {
  levels: {
    1: { title: 'Golongan Kata', sp: ['Golongan Kata'], make: tp1 },
    2: { title: 'Pembentukan Kata', sp: ['Pembentukan Kata'], make: tp2 },
    3: { title: 'Ragam, Jenis dan Susunan Ayat', sp: ['Ayat'], make: tp3 },
    4: { title: 'Ayat Gramatis', sp: ['Ayat', 'Frasa'], make: tp4 },
  },
};
