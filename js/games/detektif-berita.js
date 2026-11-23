// Bahasa Melayu Tingkatan 1 · 3.0 Membaca (SP 3.1.2, 3.1.3, 3.2.1, 3.2.2)
// TP1 kenal pasti maklumat (5W1H), TP2 jelaskan dan klasifikasikan (isi utama, tajuk, fakta atau pendapat),
// TP3 hubungkaitkan maklumat dan buat inferens, TP4 respons kritis: nilai kebolehpercayaan berita dan mesej tular.
// Every article, place, school and person is fictional. Themes follow the Nota: PKJR, Pendidikan Kewangan and ESD.
import { h, pick, shuffle } from '../core.js';
import { choices } from '../shell.js';

const ask = (a, w) => shuffle([a, ...w]).map((t) => ({ label: t, correct: t === a }));

function news(a, { hideTitle = false } = {}) {
  return h('article', { class: 'news' }, [
    h('div', { class: 'news-src' }, `📰 ${a.src} · ${a.date}`),
    h('h3', {}, hideTitle ? '[ Tajuk disembunyikan ]' : a.title),
    h('p', {}, a.body),
  ]);
}

function post(p) {
  return h('div', { class: 'post' }, [h('div', { class: 'post-from' }, p.from), h('p', {}, p.text)]);
}

/** Article beside the answers on wide screens, above them on narrow ones. Returns the column for choices(). */
function beside(area, card) {
  const col = h('div', { class: 'news-answers' });
  area.append(h('div', { class: 'news-row' }, [card, col]));
  return col;
}

// ---------- Articles ----------
const ARTICLES = [
  {
    src: 'Berita Wilayah', date: 'Isnin, 3 Mac', theme: 'PKJR',
    title: 'Lintasan Berlampu Isyarat Dibina di Hadapan SMK Bukit Kenanga',
    body: 'BUKIT KENANGA – Majlis Perbandaran membina sebuah lintasan pejalan kaki berlampu isyarat di hadapan SMK Bukit Kenanga minggu lalu. Lintasan itu dibina selepas tiga murid hampir dilanggar kenderaan ketika melintas jalan pada bulan Januari. Pengetua sekolah, Puan Rohani Ismail, berkata kenderaan kini wajib berhenti apabila lampu merah menyala. Polis trafik juga akan meronda setiap pagi pada hari persekolahan.',
    find: [
      { q: 'Siapakah yang membina lintasan itu?', a: 'Majlis Perbandaran', w: ['Polis trafik', 'Puan Rohani Ismail', 'Murid sekolah'] },
      { q: 'Bilakah lintasan itu dibina?', a: 'Minggu lalu', w: ['Pada bulan Januari', 'Setiap pagi', 'Tahun hadapan'] },
      { q: 'Berapakah bilangan murid yang hampir dilanggar kenderaan?', a: 'Tiga orang', w: ['Dua orang', 'Lima orang', 'Tiada'] },
      { q: 'Siapakah Puan Rohani Ismail?', a: 'Pengetua sekolah', w: ['Pegawai polis trafik', 'Pegawai Majlis Perbandaran', 'Ibu kepada murid'] },
    ],
    main: { a: 'Lintasan berlampu isyarat dibina untuk keselamatan murid.', w: ['Polis trafik menyaman pemandu setiap pagi.', 'Tiga murid cedera parah dalam kemalangan.', 'Pengetua sekolah meminta jalan itu ditutup.'] },
    titleW: ['Jalan Sesak pada Waktu Petang', 'Pengetua Baharu SMK Bukit Kenanga', 'Murid Dilarang Berjalan Kaki ke Sekolah'],
    link: [
      { type: 'hubung', q: 'Apakah punca lintasan itu dibina?', a: 'Tiga murid hampir dilanggar ketika melintas jalan.', w: ['Polis trafik mahu meronda setiap pagi.', 'Lampu isyarat lama telah rosak.', 'Sekolah itu baru dibuka.'] },
      { type: 'inferens', q: 'Mengapakah polis trafik meronda pada waktu pagi?', a: 'Ramai murid melintas jalan ketika datang ke sekolah.', w: ['Jalan itu sesak pada waktu malam.', 'Lintasan itu belum siap dibina.', 'Pengetua mahu murid disaman.'] },
    ],
  },
  {
    src: 'Suara Komuniti', date: 'Selasa, 15 April', theme: 'Pendidikan Kewangan',
    title: 'Murid Tingkatan 1 Kumpul RM2,400 Melalui Jualan Barang Terpakai',
    body: 'SERI MELATI – Seramai 120 murid Tingkatan 1 SMK Seri Melati mengumpul RM2,400 melalui jualan barang terpakai pada hari Sabtu lalu. Mereka menjual buku, pakaian dan alat permainan yang didermakan oleh keluarga masing-masing. Separuh daripada wang itu akan digunakan untuk membeli buku perpustakaan, manakala bakinya disimpan dalam akaun koperasi sekolah. Guru Penasihat Kelab Ekonomi, Encik Ravi Kumar, berkata murid belajar merekod jualan dan mengira keuntungan.',
    find: [
      { q: 'Berapakah jumlah wang yang dikumpul?', a: 'RM2,400', w: ['RM1,200', 'RM240', 'RM120'] },
      { q: 'Siapakah yang mendermakan barang untuk dijual?', a: 'Keluarga murid', w: ['Encik Ravi Kumar', 'Koperasi sekolah', 'Perpustakaan sekolah'] },
      { q: 'Bilakah jualan itu diadakan?', a: 'Hari Sabtu lalu', w: ['Hari Selasa, 15 April', 'Semasa cuti sekolah', 'Bulan hadapan'] },
      { q: 'Apakah barang yang dijual?', a: 'Buku, pakaian dan alat permainan', w: ['Makanan dan minuman', 'Alat tulis baharu', 'Pokok bunga dan baja'] },
    ],
    main: { a: 'Murid mengumpul wang untuk sekolah melalui jualan barang terpakai.', w: ['Koperasi sekolah menjual pakaian baharu.', 'Keluarga murid membeli buku perpustakaan.', 'Kelab Ekonomi menganjurkan pertandingan mengira.'] },
    titleW: ['Koperasi Sekolah Ditutup Sementara', 'Harga Buku Semakin Mahal', 'Kelab Ekonomi Menang Pertandingan Kebangsaan'],
    link: [
      { type: 'hubung', q: 'Berapakah wang yang akan digunakan untuk membeli buku perpustakaan?', a: 'RM1,200', w: ['RM2,400', 'RM600', 'RM120'] },
      { type: 'inferens', q: 'Mengapakah jualan barang terpakai baik untuk alam sekitar?', a: 'Barang lama digunakan semula dan tidak dibuang.', w: ['Lebih banyak barang baharu dibeli.', 'Murid tidak perlu ke sekolah.', 'Barang itu dijual dengan harga mahal.'] },
    ],
  },
  {
    src: 'Berita Wilayah', date: 'Khamis, 8 Mei', theme: 'ESD',
    title: 'Kampung Sungai Teja Kurangkan Sampah Sebanyak 40 Peratus',
    body: 'SUNGAI TEJA – Penduduk Kampung Sungai Teja berjaya mengurangkan sampah yang dihantar ke tapak pelupusan sebanyak 40 peratus dalam tempoh enam bulan. Kejayaan itu tercapai selepas setiap rumah diberikan tiga tong untuk mengasingkan kertas, plastik dan sisa makanan. Sisa makanan dijadikan baja kompos untuk kebun komuniti. Ketua kampung, Encik Lim Ah Seng, berharap kampung lain akan mencontohi usaha tersebut.',
    find: [
      { q: 'Berapa peratuskah sampah berjaya dikurangkan?', a: '40 peratus', w: ['14 peratus', '60 peratus', '4 peratus'] },
      { q: 'Apakah yang dijadikan baja kompos?', a: 'Sisa makanan', w: ['Kertas', 'Plastik', 'Daun kering'] },
      { q: 'Berapakah bilangan tong yang diberikan kepada setiap rumah?', a: 'Tiga', w: ['Dua', 'Empat', 'Enam'] },
      { q: 'Berapa lamakah masa yang diambil untuk mencapai kejayaan itu?', a: 'Enam bulan', w: ['Tiga bulan', 'Satu tahun', 'Empat puluh hari'] },
    ],
    main: { a: 'Penduduk berjaya mengurangkan sampah dengan mengasingkannya.', w: ['Tapak pelupusan sampah kampung itu ditutup.', 'Kebun komuniti dibuka kepada pelancong.', 'Ketua kampung baharu telah dilantik.'] },
    titleW: ['Tapak Pelupusan Baharu Dibina', 'Harga Baja Kompos Meningkat', 'Ketua Kampung Bersara'],
    link: [
      { type: 'hubung', q: 'Bagaimanakah sisa makanan membantu kebun komuniti?', a: 'Sisa makanan dijadikan baja kompos untuk kebun itu.', w: ['Sisa makanan dijual untuk membeli benih.', 'Sisa makanan dibuang ke dalam sungai.', 'Sisa makanan dihantar ke tapak pelupusan.'] },
      { type: 'inferens', q: 'Apakah sikap penduduk Kampung Sungai Teja?', a: 'Bekerjasama dan prihatin terhadap alam sekitar.', w: ['Malas dan suka membazir.', 'Mementingkan diri sendiri.', 'Tidak peduli akan kebersihan.'] },
    ],
  },
  {
    src: 'Suara Komuniti', date: 'Jumaat, 19 Disember', theme: 'ESD',
    title: 'Pelajar Jadi Sukarelawan di Pusat Pemindahan Banjir',
    body: 'PEKAN LALANG – Lebih 50 pelajar sekolah menengah menjadi sukarelawan di pusat pemindahan sementara Dewan Orang Ramai Pekan Lalang sejak Selasa. Mereka membantu membungkus makanan dan melayan kanak-kanak yang terpaksa meninggalkan rumah akibat banjir. Paras air dilaporkan mula surut pagi ini. Namun begitu, penduduk dinasihati supaya tidak pulang ke rumah sehingga diarahkan oleh pihak berkuasa.',
    find: [
      { q: 'Di manakah pusat pemindahan sementara itu?', a: 'Dewan Orang Ramai Pekan Lalang', w: ['Sekolah menengah Pekan Lalang', 'Balai bomba Pekan Lalang', 'Rumah ketua kampung'] },
      { q: 'Sejak bilakah pelajar menjadi sukarelawan?', a: 'Sejak Selasa', w: ['Sejak pagi ini', 'Sejak bulan lalu', 'Sejak Jumaat'] },
      { q: 'Apakah yang dilakukan oleh pelajar?', a: 'Membungkus makanan dan melayan kanak-kanak', w: ['Membaiki rumah penduduk', 'Mengepam air banjir', 'Memandu bot penyelamat'] },
    ],
    main: { a: 'Pelajar membantu mangsa banjir sebagai sukarelawan.', w: ['Semua penduduk sudah pulang ke rumah.', 'Dewan Orang Ramai rosak akibat banjir.', 'Sekolah dibuka semula pagi ini.'] },
    titleW: ['Banjir Sudah Tamat, Penduduk Pulang', 'Dewan Orang Ramai Ditutup', 'Pertandingan Memasak di Pekan Lalang'],
    link: [
      { type: 'inferens', q: 'Mengapakah penduduk dinasihati supaya belum pulang ke rumah?', a: 'Keadaan belum selamat walaupun air mula surut.', w: ['Rumah mereka sudah dijual.', 'Pelajar mahu terus membantu mereka.', 'Makanan di dewan lebih sedap.'] },
      { type: 'inferens', q: 'Apakah nilai yang ditunjukkan oleh pelajar dalam berita ini?', a: 'Prihatin dan suka membantu', w: ['Berani menentang arahan', 'Berjimat cermat', 'Bersaing untuk menang'] },
    ],
  },
  {
    src: 'Berita Wilayah', date: 'Rabu, 23 Julai', theme: 'Pendidikan Kewangan',
    title: 'Pelajar Ajar Warga Emas Guna Telefon Pintar',
    body: 'TAMAN SERI MURNI – Seramai 30 warga emas menyertai kelas literasi digital anjuran Kelab Teknologi SMK Seri Murni setiap petang Khamis. Pelajar mengajar warga emas cara membuat panggilan video, menggunakan aplikasi perbankan dan mengenal pasti mesej penipuan. Puan Lakshmi, 68 tahun, berkata beliau kini dapat berbual dengan cucunya yang belajar di luar negara.',
    find: [
      { q: 'Siapakah yang menganjurkan kelas itu?', a: 'Kelab Teknologi SMK Seri Murni', w: ['Warga emas Taman Seri Murni', 'Puan Lakshmi', 'Sebuah bank'] },
      { q: 'Bilakah kelas itu diadakan?', a: 'Setiap petang Khamis', w: ['Setiap pagi Rabu', 'Setiap hujung minggu', 'Sekali setahun'] },
      { q: 'Berapakah umur Puan Lakshmi?', a: '68 tahun', w: ['86 tahun', '30 tahun', '60 tahun'] },
      { q: 'Berapakah bilangan warga emas yang menyertai kelas itu?', a: '30 orang', w: ['68 orang', '13 orang', '300 orang'] },
    ],
    main: { a: 'Pelajar mengajar warga emas menggunakan teknologi digital.', w: ['Warga emas menjual telefon pintar.', 'Puan Lakshmi melawat cucunya di luar negara.', 'Kelab Teknologi memenangi anugerah.'] },
    titleW: ['Warga Emas Dilarang Guna Telefon', 'Kedai Telefon Baharu Dibuka', 'Cucu Puan Lakshmi Pulang ke Tanah Air'],
    link: [
      { type: 'inferens', q: 'Mengapakah warga emas perlu belajar mengenal pasti mesej penipuan?', a: 'Supaya mereka tidak ditipu dan kehilangan wang.', w: ['Supaya mereka boleh menghantar lebih banyak mesej.', 'Supaya telefon mereka lebih laju.', 'Supaya mereka tidak perlu ke bank.'] },
      { type: 'hubung', q: 'Kemahiran manakah yang membantu Puan Lakshmi berbual dengan cucunya?', a: 'Membuat panggilan video', w: ['Menggunakan aplikasi perbankan', 'Mengenal pasti mesej penipuan', 'Menulis surat'] },
    ],
  },
  {
    src: 'Suara Komuniti', date: 'Sabtu, 6 September', theme: 'PKJR',
    title: '200 Topi Keledar Basikal Diedarkan Percuma',
    body: 'PAYA INDAH – Sebanyak 200 topi keledar basikal diedarkan secara percuma kepada murid di Kampung Paya Indah semalam. Kempen itu dianjurkan oleh pihak polis bersama persatuan penduduk selepas beberapa kemalangan melibatkan penunggang basikal berlaku tahun lalu. Murid juga diajar memakai topi keledar dengan betul dan memasang lampu pada basikal sebelum menunggang pada waktu senja.',
    find: [
      { q: 'Berapakah bilangan topi keledar yang diedarkan?', a: '200', w: ['20', '100', '2,000'] },
      { q: 'Siapakah yang menganjurkan kempen itu?', a: 'Polis dan persatuan penduduk', w: ['Murid sekolah', 'Kedai basikal', 'Majlis Perbandaran'] },
      { q: 'Bilakah topi keledar itu diedarkan?', a: 'Semalam', w: ['Tahun lalu', 'Waktu senja', 'Minggu hadapan'] },
    ],
    main: { a: 'Kempen diadakan untuk keselamatan penunggang basikal.', w: ['Kedai basikal baharu dibuka di kampung.', 'Murid dilarang menunggang basikal.', 'Pertandingan berbasikal diadakan semalam.'] },
    titleW: ['Pertandingan Basikal Peringkat Daerah', 'Harga Basikal Turun', 'Jalan Kampung Ditutup Sementara'],
    link: [
      { type: 'inferens', q: 'Mengapakah lampu perlu dipasang pada basikal pada waktu senja?', a: 'Supaya penunggang mudah dilihat oleh pemandu lain.', w: ['Supaya basikal kelihatan cantik.', 'Supaya basikal bergerak lebih laju.', 'Supaya polis tidak menahan mereka.'] },
      { type: 'hubung', q: 'Apakah yang mendorong pihak polis menganjurkan kempen itu?', a: 'Beberapa kemalangan penunggang basikal tahun lalu.', w: ['Murid meminta topi keledar baharu.', 'Kedai basikal mahu menjual topi keledar.', 'Jalan kampung baru diturap.'] },
    ],
  },
];

// ---------- TP1: kenal pasti maklumat (3.1.2) ----------
function tp1() {
  const art = pick(ARTICLES);
  const f = pick(art.find);
  return {
    prompt: f.q, sub: 'Imbas berita untuk mencari jawapan.', sp: '3.1.2',
    explain: `Jawapan: ${f.a}.`,
    render(area, done) { choices(beside(area, news(art)), ask(f.a, f.w), done); },
  };
}

// ---------- TP2: jelaskan dan klasifikasikan (3.2.1) ----------
const FACTS = [
  'Sekolah itu mempunyai 850 orang murid.',
  'Pertandingan pidato itu diadakan pada 12 Ogos.',
  'Tambang bas dari pekan ke sekolah ialah RM2.50.',
  'Sungai itu melimpah selepas hujan lebat selama dua hari.',
  'Seramai 30 peserta menyertai kelas memasak itu.',
  'Pusat sukan itu dibuka pada pukul 8.00 pagi.',
  'Jambatan baharu itu sepanjang 120 meter.',
  'Perpustakaan desa itu menerima 500 buah buku sumbangan.',
];
const OPINIONS = [
  'Nasi lemak ialah sarapan yang paling sedap.',
  'Saya rasa pertandingan itu terlalu sukar.',
  'Tentu semua murid suka akan program itu.',
  'Filem itu sangat membosankan.',
  'Pada pendapat saya, taman ini paling cantik di negeri kita.',
  'Guru yang tegas ialah guru yang terbaik.',
  'Pasar malam lebih seronok daripada pasar raya.',
  'Saya yakin pasukan kita akan menjadi juara.',
];
function tp2() {
  const kind = pick(['isi', 'tajuk', 'fp', 'fp']);
  if (kind === 'fp') {
    const isFact = Math.random() < 0.5;
    const s = pick(isFact ? FACTS : OPINIONS);
    return {
      prompt: 'Fakta atau pendapat?', sp: '3.2.1',
      explain: isFact ? 'Fakta: maklumat ini boleh dibuktikan, misalnya dengan angka, tarikh atau rekod.' : 'Pendapat: ini pandangan atau perasaan seseorang. Kata seperti "saya rasa", "tentu", "paling" dan "sangat" ialah petanda.',
      render(area, done) {
        area.append(h('div', { class: 'sentence' }, `“${s}”`));
        choices(area, [{ label: '📏 Fakta', text: 'Fakta', correct: isFact }, { label: '💭 Pendapat', text: 'Pendapat', correct: !isFact }], done);
      },
    };
  }
  const art = pick(ARTICLES);
  if (kind === 'isi') {
    return {
      prompt: 'Apakah isi utama berita ini?', sp: '3.2.1',
      explain: `Isi utama: ${art.main.a}`,
      render(area, done) { choices(beside(area, news(art)), ask(art.main.a, art.main.w), done).classList.add('long'); },
    };
  }
  return {
    prompt: 'Pilih tajuk yang paling sesuai untuk berita ini.', sp: '3.2.1',
    explain: `Tajuk asal: "${art.title}". Tajuk yang baik merumuskan isi utama berita.`,
    render(area, done) { choices(beside(area, news(art, { hideTitle: true })), ask(art.title, art.titleW), done).classList.add('long'); },
  };
}

// ---------- TP3: hubungkaitkan maklumat dan buat inferens (3.1.3, 3.2.2) ----------
function tp3() {
  const art = pick(ARTICLES);
  const l = pick(art.link);
  return {
    prompt: l.q, sub: l.type === 'inferens' ? 'Jawapannya tidak tertulis terus. Fikir berdasarkan bukti dalam berita.' : 'Gabungkan dua maklumat dalam berita.',
    sp: l.type === 'inferens' ? '3.2.2' : '3.1.3',
    explain: `Jawapan: ${l.a}`,
    render(area, done) { choices(beside(area, news(art)), ask(l.a, l.w), done).classList.add('long'); },
  };
}

// ---------- TP4: respons kritis (3.2.2) ----------
const KINDS = ['✅ Boleh dipercayai', '🚩 Berkemungkinan palsu', '⚖️ Berat sebelah', '🧩 Tidak lengkap'];
const [OK, FAKE, BIAS, PART] = KINDS;
const POSTS = [
  { kind: FAKE, from: '💬 Mesej tular dalam kumpulan WhatsApp', text: 'TULAR!!! Minum air kelapa dengan garam boleh menyembuhkan SEMUA jenis demam dalam satu jam. Doktor tidak mahu anda tahu rahsia ini. SEBARKAN SEGERA kepada 10 kumpulan!', clue: 'Tuntutan melampau tanpa sumber dan desakan supaya disebarkan', clueW: ['Mesej itu terlalu pendek', 'Air kelapa memang tidak sihat', 'Mesej itu ditulis dalam bahasa Melayu'] },
  { kind: FAKE, from: '💬 Mesej daripada rakan', text: 'Semua sekolah di seluruh negara akan cuti seminggu mulai esok. Saya dengar daripada kawan abang saya yang bekerja di pejabat kerajaan.', clue: 'Sumbernya cerita dengar-dengar, bukan kenyataan rasmi', clueW: ['Cuti seminggu terlalu lama', 'Mesej itu tidak menyebut nama sekolah', 'Abang kawannya tidak bekerja'] },
  { kind: FAKE, from: '📱 SMS daripada nombor tidak dikenali', text: 'Tahniah! Nombor telefon anda memenangi RM5,000. Klik pautan ini dan masukkan nombor akaun bank anda dalam masa 10 minit sebelum hadiah dibatalkan.', clue: 'Meminta maklumat bank dan memberi tekanan masa', clueW: ['Jumlah hadiah terlalu kecil', 'SMS itu menggunakan perkataan tahniah', 'Pautan itu terlalu panjang'] },
  { kind: FAKE, from: '📷 Hantaran media sosial', text: 'Gambar ini menunjukkan banjir besar di bandar kita PAGI TADI! (Semakan carian imej menunjukkan gambar yang sama pernah diterbitkan lima tahun lalu di negara lain.)', clue: 'Gambar lama digunakan semula seolah-olah peristiwa baharu', clueW: ['Banjir tidak pernah berlaku di bandar', 'Gambar itu tidak berwarna', 'Hantaran itu tiada tanda pagar'] },
  { kind: BIAS, from: '📰 Laporan blog komuniti', text: 'Projek taman permainan baharu perlu dibatalkan. Encik Zaki, seorang penduduk, berkata projek itu membazir dan bising. Oleh itu, semua penduduk tentu tidak mahu taman itu dibina.', clue: 'Hanya pandangan seorang penduduk dilaporkan, tetapi dianggap pandangan semua', clueW: ['Tiada tarikh projek', 'Encik Zaki bukan nama sebenar', 'Taman permainan tidak penting'] },
  { kind: BIAS, from: '💬 Hantaran penyokong pasukan', text: 'Pasukan bola sepak sekolah kita kalah kerana pengadil berat sebelah. Semua penyokong kita bersetuju! Kami tidak perlu dengar penjelasan pengadil atau pasukan lawan.', clue: 'Menolak penjelasan pihak lain dan hanya mendengar penyokong sendiri', clueW: ['Keputusan perlawanan tidak dinyatakan', 'Pasukan itu memang lemah', 'Hantaran itu menggunakan tanda seru'] },
  { kind: BIAS, from: '📢 Iklan kedai', text: 'Kasut Jenama Kilat ialah satu-satunya kasut yang selamat untuk murid. Semua kasut lain cepat rosak dan berbahaya. Hanya RM199!', clue: 'Penjual memuji barangnya sendiri tanpa bukti perbandingan', clueW: ['Harga kasut tidak dinyatakan', 'Kasut tidak perlu untuk murid', 'Iklan itu terlalu panjang'] },
  { kind: PART, from: '📄 Notis di papan kenyataan', text: 'Pertandingan pidato peringkat daerah akan diadakan tidak lama lagi. Semua murid digalakkan menyertainya.', clue: 'Tarikh, tempat dan cara menyertai tidak dinyatakan', clueW: ['Tajuk pidato terlalu sukar', 'Notis itu ditulis oleh murid', 'Pidato tidak sesuai untuk murid'] },
  { kind: PART, from: '💬 Mesej dalam kumpulan penduduk', text: 'Bekalan air akan terputus di beberapa kawasan. Simpan air secukupnya.', clue: 'Kawasan, tarikh, masa dan punca tidak dinyatakan', clueW: ['Penduduk tidak perlu menyimpan air', 'Mesej itu terlalu panjang', 'Bekalan air tidak pernah terputus'] },
  { kind: PART, from: '📰 Tajuk berita dalam talian', text: 'Seorang pelajar cedera dalam kemalangan jalan raya.', clue: 'Bila, di mana dan bagaimana kemalangan berlaku tidak dinyatakan', clueW: ['Nama pelajar mesti disiarkan', 'Kemalangan jalan raya jarang berlaku', 'Tajuk itu menggunakan huruf besar'] },
  { kind: OK, from: '🏛️ Kenyataan di laman rasmi Jabatan Bekalan Air, 14 Mei', text: 'Bekalan air di Taman Seri Murni akan terputus pada 16 Mei, dari pukul 9.00 pagi hingga 5.00 petang, kerana kerja membaiki paip utama. Lori air akan disediakan di dewan orang ramai.' },
  { kind: OK, from: '🏫 Notis rasmi SMK Bukit Kenanga, ditandatangani Pengetua, 2 April', text: 'Hari Sukan Tahunan akan diadakan pada 20 April, pukul 7.30 pagi, di padang sekolah. Murid dikehendaki memakai baju rumah sukan masing-masing.' },
  { kind: OK, from: '📰 Berita akhbar, 1 Jun', text: 'Hospital Daerah Pekan Lalang membuka klinik tambahan setiap Sabtu mulai 5 Jun, pukul 8.00 pagi hingga 1.00 petang. Pengarah hospital berkata orang ramai boleh membuat temu janji melalui talian rasmi hospital.' },
];
const WHY = {
  [OK]: 'Sumber rasmi dinyatakan, dan maklumat penting (siapa, apa, bila, di mana, mengapa) lengkap.',
  [FAKE]: 'Tanda berita palsu: tiada sumber sahih, tuntutan melampau, desakan supaya disebarkan atau meminta maklumat peribadi.',
  [BIAS]: 'Berat sebelah: hanya satu pihak didengar, atau penulis mendapat untung daripada pandangannya.',
  [PART]: 'Tidak lengkap: maklumat penting seperti bila, di mana atau mengapa tidak dinyatakan.',
};
const ACTIONS = {
  a: 'Semak dengan sumber rasmi sebelum mempercayai atau berkongsi',
  w: ['Kongsi segera supaya orang lain tahu', 'Percaya kerana ramai orang sudah berkongsi', 'Tambah komen sendiri dan hantar semula'],
};
function tp4() {
  const p = pick(POSTS);
  const mode = p.kind === OK ? 'jenis' : pick(['jenis', 'jenis', 'tanda', p.kind === FAKE ? 'tindakan' : 'tanda']);
  if (mode === 'jenis') {
    return {
      prompt: 'Nilai bahan ini. Apakah kategorinya?', sp: '3.2.2',
      explain: `${p.kind}. ${p.clue ? p.clue + '. ' : ''}${WHY[p.kind]}`,
      render(area, done) { choices(beside(area, post(p)), KINDS.map((k) => ({ label: k, correct: k === p.kind })), done); },
    };
  }
  if (mode === 'tanda') {
    const q = { [FAKE]: 'Apakah tanda paling jelas bahawa mesej ini berkemungkinan palsu?', [BIAS]: 'Mengapakah bahan ini berat sebelah?', [PART]: 'Apakah maklumat yang tiada?' }[p.kind];
    return {
      prompt: q, sp: '3.2.2',
      explain: `${p.clue}. ${WHY[p.kind]}`,
      render(area, done) { choices(beside(area, post(p)), ask(p.clue, p.clueW), done).classList.add('long'); },
    };
  }
  return {
    prompt: 'Kamu menerima mesej ini. Apakah tindakan yang paling bijak?', sp: '3.2.2',
    explain: `${ACTIONS.a}, contohnya laman web atau akaun media sosial rasmi agensi berkenaan. Jangan sebarkan berita yang belum disahkan.`,
    render(area, done) { choices(beside(area, post(p)), ask(ACTIONS.a, ACTIONS.w), done).classList.add('long'); },
  };
}

export default {
  levels: {
    1: { title: 'Cari Maklumat', sp: ['3.1.2'], make: tp1 },
    2: { title: 'Isi Utama, Tajuk, Fakta atau Pendapat', sp: ['3.2.1'], make: tp2 },
    3: { title: 'Hubung Kait dan Inferens', sp: ['3.1.3', '3.2.2'], make: tp3 },
    4: { title: 'Nilai Kebolehpercayaan', sp: ['3.2.2'], make: tp4 },
  },
};
