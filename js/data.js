// Game catalogue and KP2027 reference data.

/** Mastery levels (Tahap Penguasaan). Tahap I (Tahun 1-2) uses TP1-TP3; Tahap II onward adds TP4. */
export const TP = {
  1: { label: 'TAHU', desc: 'Menyatakan perkara asas dengan beradab' },
  2: { label: 'FAHAM', desc: 'Menerangkan dengan beradab' },
  3: { label: 'BUAT', desc: 'Mengaplikasikan pengetahuan dan kemahiran dengan beradab' },
  4: { label: 'AMAL', desc: 'Mengamalkan secara kreatif dan inovatif dengan beradab' },
};

export const ADAB = ['Bergilir-gilir', 'Menghormati rakan', 'Bekerjasama'];

/** Tahap I (Tahun 1-2) stops at TP3; everything else uses TP1-TP4. */
export const maxTPFor = (year) => (/^Tahun [12]$/.test(year || '') ? 3 : 4);

export const YEARS = ['Tahun 1', 'Tahun 2', 'Tahun 3', 'Tahun 4', 'Tahun 5', 'Tahun 6', 'Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'];
export const SUBJECTS = ['Bahasa Melayu', 'Bahasa Inggeris', 'Matematik', 'Alam dan Manusia', 'Sains', 'Pendidikan Islam', 'Pendidikan Moral', 'Sejarah', 'Geografi', 'Pendidikan Jasmani', 'Pendidikan Jasmani dan Pendidikan Kesihatan', 'Pendidikan Seni Visual', 'Pendidikan Muzik', 'Bahasa Cina', 'Bahasa Tamil', 'Pembentukan Karakter', 'Lain-lain'];

/** Game modes: the same questions, wrapped in different play styles. */
export const MODES = {
  klasik: { label: '🎯 Klasik', small: 'Pasukan bergilir menjawab satu demi satu' },
  papan: { label: '🎁 Papan Kejutan', small: 'Pilih nombor. Ada kad kejutan: curi, tukar, bonus!' },
  lumba: { label: '⏱️ Lumba Masa', small: 'Jawab sebanyak mungkin. Jawapan betul tambah masa' },
};

/** Sample teacher-made set, used to show what the set builder can do. */
export const SAMPLE_SET = {
  title: 'Deria Saya', subject: 'Alam dan Manusia', year: 'Tahun 1', sp: ['1.1.4'], tp: 1,
  items: [
    { e: '👁️', q: 'Bahagian tubuh ini digunakan untuk melihat. Apakah namanya?', a: 'Mata', wrong: ['Telinga', 'Hidung'] },
    { e: '👂', q: 'Bahagian tubuh ini digunakan untuk mendengar. Apakah namanya?', a: 'Telinga', wrong: ['Lidah', 'Mata'] },
    { e: '👃', q: 'Bahagian tubuh ini digunakan untuk menghidu. Apakah namanya?', a: 'Hidung', wrong: ['Kulit', 'Telinga'] },
    { e: '👅', q: 'Bahagian tubuh ini digunakan untuk merasa. Apakah namanya?', a: 'Lidah', wrong: ['Hidung', 'Mata'] },
    { e: '✋', q: 'Kita menyentuh dan merasa sejuk atau panas dengan bahagian tubuh apa?', a: 'Kulit', wrong: ['Lidah', 'Telinga'] },
    { e: '🌸', q: 'Deria apakah yang kita gunakan untuk mengetahui bunga itu wangi?', a: 'Deria bau (hidung)', wrong: ['Deria rasa (lidah)', 'Deria dengar (telinga)'] },
  ],
};

export const GAMES = [
  {
    id: 'kedai-runcit',
    notes: { how: ['Guru tayangkan permainan. Pasukan berbincang dan wakil menyebut jawapan.', 'TP3: wakil pasukan ke hadapan untuk menekan wang dan membayar sendiri.', 'Gunakan wang contoh sebenar di meja sebelum bermain.'], extend: 'Lakonan kedai runcit di kelas dengan wang contoh. Murid bergilir menjadi penjual dan pembeli.' },
    title: 'Kedai Runcit RM10',
    emoji: '🛒',
    subject: 'Matematik',
    level: 'Tahun 1',
    topic: '3.0 Wang',
    sp: ['3.1.1', '3.2.1', '3.2.2', '3.2.3'],
    desc: 'Kenali wang, bandingkan nilai, tukar wang dan bayar harga yang tepat. Ada soalan keperluan atau kehendak.',
    ready: true,
  },
  {
    id: 'ikatan-nombor',
    notes: { how: ['Mulakan dengan bahan maujud (guli, penyedut minuman) sebelum petak sepuluh.', 'Minta murid menunjuk jari untuk jawapan sebelum guru menekan.', 'TP3: minta pasukan membina ayat matematik di papan putih.'], extend: 'Permainan kad ikatan nombor berpasangan: cari pasangan yang menjadi 10.' },
    title: 'Ikatan Nombor',
    emoji: '🔢',
    subject: 'Matematik',
    level: 'Tahun 1',
    topic: '1.2 Ikatan Nombor · 2.1 Tambah',
    sp: ['1.2.1', '2.1.2', '2.1.3'],
    desc: 'Petak sepuluh, ikatan nombor dalam lingkungan 18 dan masalah tambah satu langkah hingga 30.',
    ready: true,
  },
  {
    id: 'suku-kata',
    notes: { how: ['Tekan Dengar untuk sebutan perkataan.', 'Minta seluruh kelas membaca setiap suku kata dengan kuat semasa gerabak dicantum.', 'Sesuai untuk SK dan SJK.'], extend: 'Murid memegang kad suku kata dan beratur membentuk kereta api perkataan.' },
    title: 'Kereta Api Suku Kata',
    emoji: '🚂',
    subject: 'Bahasa Melayu',
    level: 'Tahun 1',
    topic: '3.0 Membaca · 4.0 Menulis',
    sp: ['3.1.2', '4.2.1'],
    desc: 'Cantumkan gerabak suku kata untuk membina perkataan. Sesuai untuk SK dan SJK.',
    ready: true,
  },
  {
    id: 'selamat',
    notes: { how: ['Bincangkan setiap situasi selepas jawapan: kenapa selamat atau tidak?', 'SP 3.1.4 hingga 3.1.6 (sentuhan tidak selamat) tidak dimasukkan. Ajar melalui sesi bimbingan guru.', 'Nombor kecemasan dan pasukan keselamatan boleh disambung dengan lawatan atau ceramah.'], extend: 'Murid melukis poster situasi tidak selamat (SP 3.1.9).' },
    title: 'Selamat atau Tidak?',
    emoji: '🛡️',
    subject: 'Alam dan Manusia',
    level: 'Tahun 1',
    topic: '3.0 Kekal Selamat',
    sp: ['3.1.1', '3.1.2', '3.1.3', '3.1.7', '3.1.10'],
    desc: 'Kenal pasti situasi selamat, maklumat diri yang mesti dirahsiakan dan tindakan yang betul.',
    ready: true,
  },
  { id: 'banjir', title: 'Misi Bantuan Banjir', emoji: '🚤', subject: 'Matematik', level: 'Tingkatan 1', topic: '2.0 Faktor dan Gandaan', sp: ['2.1', '2.2'], desc: 'Agihkan kit bantuan banjir dengan sama rata menggunakan FSTB dan GSTK.', ready: false },
  { id: 'detektif-berita', title: 'Detektif Berita', emoji: '🔎', subject: 'Bahasa Melayu', level: 'Tingkatan 1', topic: '3.0 Membaca', sp: ['3.1', '3.2'], desc: 'Kenal pasti berita palsu, berat sebelah atau tidak lengkap.', ready: false },
  { id: 'irama-gema', title: 'Irama Gema', emoji: '🥁', subject: 'Pendidikan Muzik', level: 'Tingkatan 1', topic: '3.0 Kreativiti Muzik', sp: ['3.1'], desc: 'Panggil dan sahut corak irama yang semakin mencabar.', ready: false },
  { id: 'kampung-sejahtera', title: 'Kampung Sejahtera', emoji: '🏡', subject: 'Pembentukan Karakter', level: 'Semua', topic: 'Slot Pembentukan Karakter', sp: [], desc: 'Simulasi kelas: setiap pilihan memberi kesan kepada seluruh kampung.', ready: false },
];

export const gameById = (id) => GAMES.find((g) => g.id === id);
