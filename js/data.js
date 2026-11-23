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
    howto: [{ e: '💵', t: 'Kenal wang', d: 'Wang kertas RM1, RM5 dan RM10, serta duit syiling 5, 10, 20 dan 50 sen. Lihat warna dan nilainya.' }, { e: '🙋', t: 'Jawab bersama pasukan', d: 'Bincang dengan rakan sepasukan. Wakil pasukan menyebut jawapan, kemudian guru menekan butang.' }, { e: '🛒', t: 'TP3: bayar di kedai', d: 'Tekan wang untuk membayar harga barang dengan tepat. Tersilap? Tekan ↶ Undur. Tekan Semak ✔ apabila selesai.' }],
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
    howto: [{ e: '🔟', t: 'Petak sepuluh', d: 'Kira bulatan berwarna. Berapa lagi bulatan diperlukan supaya penuh 10?' }, { e: '✋', t: 'Tunjuk jari dahulu', d: 'Semua murid tunjuk jawapan dengan jari. Kemudian wakil pasukan menyebut jawapan.' }, { e: '📖', t: 'TP3: masalah cerita', d: 'Tekan 🔈 Dengar untuk mendengar cerita. Cari jumlahnya dengan menambah.' }],
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
    howto: [{ e: '🔈', t: 'Dengar perkataan', d: 'Tekan 🔈 Dengar untuk mendengar sebutan perkataan.' }, { e: '🧩', t: 'TP1: suku kata hilang', d: 'Lihat gambar dan perkataan. Pilih suku kata yang hilang.' }, { e: '🚂', t: 'TP2 dan TP3: bina kereta api', d: 'Tekan gerabak suku kata mengikut urutan untuk membina perkataan. Baca setiap suku kata dengan kuat bersama-sama.' }],
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
    howto: [{ e: '🖼️', t: 'Lihat situasi', d: 'Guru membaca situasi atau tekan 🔈 Dengar. Lihat gambarnya.' }, { e: '👍', t: 'Selamat atau tidak?', d: 'Pilih sama ada situasi itu selamat, atau sama ada maklumat itu boleh dikongsi dengan orang yang tidak dikenali.' }, { e: '🛡️', t: 'TP3: apa patut aku buat?', d: 'Pilih tindakan yang betul: bertenang, beritahu orang yang dipercayai atau menjerit meminta pertolongan.' }],
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
  {
    id: 'banjir',
    howto: [{ e: '🔢', t: 'Faktor dan gandaan', d: 'Faktor membahagi sesuatu nombor dengan tepat. Gandaan ialah hasil darab nombor itu.' }, { e: '✏️', t: 'Guna kertas', d: 'Lukis pokok faktor atau buat pembahagian berulang di atas kertas sebelum menjawab.' }, { e: '🚤', t: 'TP3 dan TP4: FSTB dan GSTK', d: 'FSTB untuk mengagih barang sama rata (bilangan kit paling banyak). GSTK untuk mencari bila dua perkara berlaku serentak (bas bertolak bersama).' }],
    notes: { how: ['Benarkan pasukan menggunakan kertas sebelum menjawab. Minta wakil menunjukkan pokok faktor atau pembahagian berulang di papan putih.', 'TP4 mengikut Nota dokumen: agihan bantuan banjir yang adil tanpa pembaziran (FSTB) dan jadual pengangkutan awam (GSTK).', 'Bincangkan kenapa FSTB memberi bilangan kit maksimum, dan GSTK memberi masa menunggu paling singkat.'], extend: 'Projek kecil: murid merancang agihan barang sumbangan sekolah sebenar menggunakan FSTB.' },
    title: 'Misi Bantuan Banjir',
    emoji: '🚤',
    subject: 'Matematik',
    level: 'Tingkatan 1',
    topic: '2.0 Faktor dan Gandaan',
    sp: ['2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.2.1', '2.2.2', '2.2.3'],
    desc: 'Faktor, faktor perdana, koperdana, FSTB dan GSTK. Misi akhir: agihkan kit bantuan banjir dan selaraskan jadual bas.',
    ready: true,
  },
  {
    id: 'neraca',
    howto: [{ e: '⚖️', t: 'Neraca seimbang', d: 'Persamaan seperti neraca: kedua-dua belah sama berat.' }, { e: '➖', t: 'Buat perkara yang sama', d: 'Tambah, tolak, darab atau bahagi kedua-dua belah dengan nombor yang sama untuk mencari nilai pemboleh ubah.' }, { e: '📝', t: 'TP4: masalah harian', d: 'Tulis persamaan daripada cerita, selesaikan, kemudian semak dengan menggantikan jawapan ke dalam persamaan.' }],
    notes: { how: ['Gunakan gambar neraca untuk menerangkan: apa yang dibuat pada sebelah kiri mesti dibuat pada sebelah kanan.', 'Minta pasukan menulis langkah penyelesaian sebelum memilih jawapan. Semak dengan menggantikan nilai ke dalam persamaan.', 'TP4: minta pasukan menyatakan pemboleh ubah dan membentuk persamaan dahulu.'], extend: 'Pasukan mencipta masalah harian sendiri (kewangan, sukan, kejuruteraan) dan bertukar dengan pasukan lain.' },
    title: 'Neraca Persamaan',
    emoji: '⚖️',
    subject: 'Matematik',
    level: 'Tingkatan 1',
    topic: '5.1 Persamaan Linear',
    sp: ['5.1.1', '5.1.2', '5.1.3', '5.1.4'],
    desc: 'Kenal persamaan linear, bentuk persamaan daripada situasi, imbangkan neraca dan selesaikan masalah harian.',
    ready: true,
  },
  {
    id: 'irama',
    howto: [{ e: '🎵', t: 'Kenal simbol', d: 'Not dan tanda rehat mempunyai nilai detik. Krocet bernilai 1 detik.' }, { e: '📏', t: 'Meter dan bar', d: 'Meter 2/4, 3/4 dan 4/4 memberitahu bilangan detik krocet dalam satu bar.' }, { e: '👏', t: 'TP3: dengar dan tepuk', d: 'Tekan ▶ untuk mendengar. Kiraan 1, 2, 3, 4 dimainkan dahulu. Pilih corak yang didengar, atau tepuk semula. Guru menanda Tepat atau Belum tepat. Pastikan pembesar suara dihidupkan.' }],
    notes: { how: ['Pastikan pembesar suara dihidupkan. Setiap corak dimulakan dengan kiraan 1, 2, 3, 4.', 'TP3 Tiru dan Baca: pasukan menepuk corak, guru menanda Tepat atau Belum tepat.', 'Ajar cara menepuk: krocet satu tepukan, dua kuaver dua tepukan pantas, minim ditahan dua detik.'], extend: 'Panggil dan sahut (SP 3.1.2): satu pasukan menepuk corak 4 detik, pasukan lain menjawab dengan corak ciptaan sendiri (SP 3.1.3).' },
    title: 'Irama Gema',
    emoji: '🥁',
    subject: 'Pendidikan Muzik',
    level: 'Tingkatan 1',
    topic: '1.1 Teori Muzik · 3.1 Corak Irama',
    sp: ['1.1.1', '1.1.2', '3.1.1', '3.1.2'],
    desc: 'Kenal not dan tanda rehat, lengkapkan bar, kemudian dengar, tiru dan tepuk corak irama.',
    ready: true,
  },
  {
    id: 'tatabahasa',
    howto: [{ e: '🔍', t: 'Perkataan berwarna kuning', d: 'Perkataan yang ditanda kuning ialah perkataan yang disoal.' }, { e: '🏷️', t: 'Kenal bentuk kata', d: 'Kenal pasti golongan kata, imbuhan, kata majmuk dan kata ganda.' }, { e: '✍️', t: 'TP3 dan TP4: ayat', d: 'Kenal pasti ragam, jenis dan susunan ayat. Pilih ayat yang betul tatabahasanya.' }],
    notes: { how: ['Dokumen Kurikulum BM Tingkatan 1 tiada kod SP atau Standard Prestasi khusus untuk tatabahasa. Tahap dalam permainan ini ialah urutan pengajaran dan boleh disesuaikan.', 'Selepas setiap soalan, minta pasukan membina ayat sendiri menggunakan perkataan atau struktur yang sama.', 'TP4 sesuai sebagai latihan sebelum menulis karangan.'], extend: 'Detektif ayat: pasukan mencari contoh golongan kata dan ragam ayat dalam keratan akhbar atau novel KOMSAS.' },
    title: 'Detektif Tatabahasa',
    emoji: '🕵️',
    subject: 'Bahasa Melayu',
    level: 'Tingkatan 1',
    topic: 'Aspek Tatabahasa',
    sp: ['Golongan Kata', 'Pembentukan Kata', 'Ayat'],
    desc: 'Golongan kata, imbuhan, kata majmuk dan kata ganda, ragam dan susunan ayat, serta pembetulan kesalahan lazim.',
    ready: true,
  },
  {
    id: 'detektif-berita',
    howto: [{ e: '📰', t: 'Imbas berita', d: 'Baca tajuk dahulu, kemudian imbas untuk mencari siapa, apa, bila, di mana dan mengapa.' }, { e: '💭', t: 'Fakta atau pendapat', d: 'Fakta boleh dibuktikan. Pendapat ialah pandangan atau perasaan seseorang.' }, { e: '🚩', t: 'TP4: jadi detektif', d: 'Tanya: Siapa sumbernya? Adakah maklumatnya lengkap? Adakah satu pihak sahaja yang didengar? Semak sumber rasmi sebelum berkongsi.' }],
    notes: { how: ['Baca berita bersama dahulu. Minta satu wakil pasukan membaca dengan sebutan dan intonasi yang betul (SP 3.1.1) sebelum soalan dijawab.', 'TP1 dan TP2 melatih teknik luncuran dan imbasan seperti yang dicadangkan dalam Nota. Beri masa 30 saat untuk mengimbas.', 'TP4 ialah respons kritis. Selepas setiap jawapan, minta pasukan menerangkan bukti dalam teks yang menyokong pilihan mereka.', 'Semua berita, tempat dan watak ialah rekaan. Tema mengikut Nota: PKJR, Pendidikan Kewangan dan ESD.'], extend: 'Bawa keratan akhbar atau mesej tular sebenar (tanpa maklumat peribadi). Pasukan menilai sumber, kelengkapan 5W1H dan berat sebelah, kemudian menulis semula berita itu supaya lengkap.' },
    title: 'Detektif Berita',
    emoji: '🔎',
    subject: 'Bahasa Melayu',
    level: 'Tingkatan 1',
    topic: '3.0 Membaca',
    sp: ['3.1.2', '3.1.3', '3.2.1', '3.2.2'],
    desc: 'Cari maklumat dalam berita, kenal fakta dan pendapat, buat inferens, kemudian nilai mesej tular: palsu, berat sebelah atau tidak lengkap?',
    ready: true,
  },
  {
    id: 'bot-banjir',
    howto: [{ e: '🛥️', t: 'Pandu bot penyelamat', d: 'Tekan ← → (atau A dan D) untuk memilih lorong. Tekan ↑ atau Spasi untuk pergi. Di skrin sentuh, tekan sahaja kotak yang dipilih.' }, { e: '🪵', t: 'Elak kayu balak', d: 'Kayu balak hanyut merentasi sungai. Tunggu ruang kosong sebelum pergi. Terlanggar? Bot berpatah balik dan boleh cuba lagi tanpa kehilangan mata.' }, { e: '📦', t: 'Kutip kotak yang betul', d: 'Kira dahulu bersama pasukan. Kotak yang bot sampai dahulu ialah jawapan pasukan. Kekunci 1 hingga 4 terus menghantar bot ke kotak itu.' }],
    notes: { how: ['Prototaip permainan aksi 2D. Soalan dan tahap sama seperti Misi Bantuan Banjir, tetapi jawapan dipilih dengan memandu bot.', 'Biarkan pasukan berbincang dan mengira dahulu. Kotak bantuan tidak bergerak, jadi tiada tekanan masa untuk berfikir.', 'Seorang wakil pasukan memandu menggunakan papan kekunci, tetikus atau skrin sentuh. Tukar pemandu setiap giliran.', 'Kemahiran memandu tidak menjejaskan markah: terlanggar kayu balak hanya membuat bot berpatah balik.'], extend: 'Minta murid mencipta peraturan permainan sendiri yang menggunakan FSTB atau GSTK, contohnya agihan kotak bantuan kepada beberapa kampung.' },
    title: 'Bot Penyelamat Banjir',
    emoji: '🛥️',
    subject: 'Matematik',
    level: 'Tingkatan 1',
    topic: '2.0 Faktor dan Gandaan · aksi 2D',
    sp: ['2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.2.1', '2.2.2', '2.2.3'],
    desc: 'Permainan aksi 2D (prototaip): pandu bot penyelamat, elak kayu balak dan kutip kotak bantuan dengan jawapan faktor, gandaan, FSTB atau GSTK yang betul.',
    ready: true,
  },
  { id: 'kampung-sejahtera', title: 'Kampung Sejahtera', emoji: '🏡', subject: 'Pembentukan Karakter', level: 'Semua', topic: 'Slot Pembentukan Karakter', sp: [], desc: 'Simulasi kelas: setiap pilihan memberi kesan kepada seluruh kampung.', ready: false },
];

/** SP codes start with a digit; grammar areas and other labels are shown as they are. */
export const spLabel = (s) => (/^\d/.test(s) ? 'SP ' + s : s);

export const gameById = (id) => GAMES.find((g) => g.id === id);
