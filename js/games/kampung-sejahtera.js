// Kampung Sejahtera · Slot Pembentukan Karakter (semua tahap)
// KP2027: "empat elemen teras karakter iaitu penyayang, berdaya tahan, berupaya memimpin dan warganegara aktif",
// built on socio-emotional learning (Perkembangan Diri: kesedaran kendiri, pengurusan kendiri, kesedaran sosial,
// pengurusan sosial). The whole class shares one village: every answer moves the four meters, and the village
// visibly grows or declines. Teams still score for the better choice, so modes and PBD work as in every game.
// TP1 kenal perasaan dan elemen karakter, TP2 terangkan sebab dan kesan, TP3 pilih tindakan dalam dilema,
// TP4 amalkan secara kreatif: selesaikan masalah kampung sebagai ketua belia.
// Every person and place is fictional.
import { h, shuffle } from '../core.js';
import { choices } from '../shell.js';

const EL = {
  sayang: { e: '❤️', n: 'Penyayang' },
  tahan: { e: '💪', n: 'Berdaya tahan' },
  pimpin: { e: '🧭', n: 'Berupaya memimpin' },
  aktif: { e: '🤝', n: 'Warganegara aktif' },
};
const KEYS = Object.keys(EL);
/** Draw items in shuffled order and only repeat once every item has been used. */
function deck(arr) { let d = []; return () => { if (!d.length) d = shuffle(arr); return d.pop(); }; }

// ---------- The shared village ----------
const START = 4, MAX = 10;
const village = Object.fromEntries(KEYS.map((k) => [k, START]));
const STAGES = {
  sayang: ['🏚️', '🏠', '🏡', '💞'],
  tahan: ['🍂', '🌱', '🌿', '🌳'],
  pimpin: ['⛺', '🛖', '🏫', '🏛️'],
  aktif: ['🚮', '🧹', '🌼', '🎡'],
};
const stage = (v) => (v <= 2 ? 0 : v <= 5 ? 1 : v <= 8 ? 2 : 3);

function applyFx(fx) {
  const out = [];
  for (const [k, d] of Object.entries(fx || {})) {
    if (!d) continue;
    const before = village[k];
    village[k] = Math.max(0, Math.min(MAX, before + d));
    out.push([k, d]);
  }
  return out;
}

function scene() {
  const total = KEYS.reduce((s, k) => s + village[k], 0);
  const sky = total >= 30 ? '☀️🌈' : total >= 18 ? '⛅' : '🌧️';
  // Three plots per element; later plots need a higher meter, so the village fills in gradually.
  const plots = [];
  for (let i = 0; i < 3; i++) for (const k of KEYS) plots.push(h('span', { class: 'plot', title: EL[k].n }, STAGES[k][stage(village[k] - i)]));
  return h('div', { class: 'kampung', role: 'img', 'aria-label': `Kampung Sejahtera: ${KEYS.map((k) => `${EL[k].n} ${village[k]} daripada ${MAX}`).join(', ')}` },
    h('span', { class: 'sky' }, sky),
    h('div', { class: 'plots' }, plots),
    h('div', { class: 'meters' }, KEYS.map((k) => h('span', { class: 'meter', title: EL[k].n },
      EL[k].e, h('i', { style: { '--v': village[k] / MAX } }), h('b', {}, village[k])))));
}

function fxChips(list) {
  if (!list.length) return null;
  return h('div', { class: 'fx-row' }, list.map(([k, d]) => h('span', { class: 'fx ' + (d > 0 ? 'up' : 'down') }, `${d > 0 ? '+' : ''}${d} ${EL[k].e} ${EL[k].n}`)));
}

function card(e, text) {
  return h('div', { class: 'k-card' }, h('span', { class: 'k-emoji', 'aria-hidden': 'true' }, e), h('p', {}, text));
}

/**
 * Shared render: village + scenario card + options. Each option: { label, correct, fx, why }.
 * The consequence is written into q.explain before the shell shows its feedback.
 */
function round(q, e, text, opts, long) {
  q.render = (area, done) => {
    const practice = () => !!area.closest('.tut');
    area.append(scene(), card(e, text));
    const shown = shuffle(opts);
    const wrap = choices(area, shown.map((o) => ({ label: o.label, text: o.label, correct: o.correct })), (ok, reveal) => {
      const btns = [...wrap.children];
      const picked = btns.findIndex((b) => b.classList.contains('wrong'));
      const o = shown[picked >= 0 ? picked : btns.findIndex((b) => b.classList.contains('right'))];
      const changes = practice() ? Object.entries(o.fx || {}).filter(([, d]) => d) : applyFx(o.fx);
      q.explain = h('span', { class: 'k-explain' },
        h('span', {}, o.why),
        fxChips(changes),
        practice() ? h('small', {}, 'Soalan latihan: kampung tidak berubah.') : scene());
      done(ok, reveal);
    });
    if (long) wrap.classList.add('long', 'k-opts');
  };
  return q;
}

// ---------- TP1: kenal perasaan dan elemen karakter ----------
const ACTS = [
  ['sayang', '🧓', 'Mei Ling membantu nenek jirannya membawa barang dari kedai.'],
  ['sayang', '🐱', 'Arif memberi makan dan minum kepada kucing yang kelaparan.'],
  ['sayang', '🍱', 'Kumar berkongsi bekal makanannya dengan rakan yang tidak membawa bekal.'],
  ['sayang', '🤒', 'Siti melawat rakannya yang sakit dan membawakan nota pelajaran.'],
  ['tahan', '🚲', 'Daniel jatuh basikal berkali-kali, tetapi dia terus berlatih sehingga pandai.'],
  ['tahan', '📝', 'Aina mendapat markah rendah. Dia tidak putus asa dan belajar dengan lebih bersungguh-sungguh.'],
  ['tahan', '🏃', 'Ravi kalah dalam larian. Dia mengucapkan tahniah kepada pemenang dan terus berlatih.'],
  ['tahan', '😮‍💨', 'Ming berasa marah, lalu dia menarik nafas panjang dan bertenang dahulu.'],
  ['pimpin', '📋', 'Farah membahagikan tugas kepada ahli kumpulan supaya semua dapat menyumbang.'],
  ['pimpin', '📣', 'Hakim memberi semangat kepada pasukannya yang sedang ketinggalan.'],
  ['pimpin', '🙋', 'Nurul menawarkan diri untuk mengetuai projek kelas dan mendengar idea semua ahli.'],
  ['pimpin', '⏰', 'Ketua kelas menunjukkan contoh yang baik dengan sentiasa menepati masa.'],
  ['aktif', '🧹', 'Penduduk kampung bergotong-royong membersihkan longkang.'],
  ['aktif', '♻️', 'Murid menyertai kempen kitar semula di taman perumahan.'],
  ['aktif', '🚸', 'Ah Kow mematuhi peraturan dan melintas jalan di lintasan pejalan kaki.'],
  ['aktif', '🗳️', 'Murid mengundi ketua kelas dengan jujur dan menghormati keputusan majoriti.'],
];
const FEELINGS = ['😢 Sedih', '😊 Gembira', '😨 Takut', '😡 Marah', '🤩 Bangga'];
const MOODS = [
  ['🍦', 'Aiskrim Adik terjatuh ke lantai sebelum sempat dimakan.', '😢 Sedih'],
  ['🎁', 'Lina menerima hadiah hari jadi daripada kawan-kawannya.', '😊 Gembira'],
  ['⛈️', 'Guruh berdentum kuat ketika Amir seorang diri di rumah.', '😨 Takut'],
  ['🏆', 'Pasukan Kavitha menjadi johan selepas berlatih bersungguh-sungguh.', '🤩 Bangga'],
  ['✏️', 'Pensel Zul dipatahkan oleh rakannya tanpa meminta maaf.', '😡 Marah'],
  ['🧸', 'Patung mainan kesayangan Alya hilang di taman.', '😢 Sedih'],
];
const nextMood = deck(MOODS), nextAct = deck(ACTS);
function tp1() {
  if (Math.random() < 0.35) {
    const [e, t, a] = nextMood();
    return round({ prompt: 'Bagaimanakah perasaannya?', sp: 'Kesedaran Sosial', say: t }, e, t,
      shuffle(FEELINGS.filter((f) => f !== a)).slice(0, 3).concat(a).map((f) => ({
        label: f, correct: f === a, fx: f === a ? { sayang: 1 } : {},
        why: `Perasaannya: ${a}. Mengenal perasaan diri dan orang lain membantu kita bertindak dengan penyayang.`,
      })));
  }
  const [k, e, t] = nextAct();
  return round({ prompt: 'Elemen karakter manakah yang ditunjukkan?', sp: EL[k].n, say: t }, e, t,
    KEYS.map((x) => ({
      label: `${EL[x].e} ${EL[x].n}`, correct: x === k, fx: x === k ? { [k]: 1 } : {},
      why: `${EL[k].e} ${EL[k].n}. ${({ sayang: 'Mengambil berat tentang orang lain dan makhluk lain.', tahan: 'Tidak mudah putus asa dan dapat mengawal emosi.', pimpin: 'Membimbing, memberi semangat dan melibatkan semua orang.', aktif: 'Menyumbang kepada masyarakat dan mematuhi peraturan.' })[k]}`,
    })));
}

// ---------- TP2: terangkan sebab dan kesan ----------
const WHY = [
  { k: 'aktif', e: '🧹', s: 'Penduduk bergotong-royong membersihkan kampung.', q: 'Apakah kesan baik gotong-royong kepada kampung?', a: 'Kampung menjadi bersih dan penduduk lebih rapat', w: ['Penduduk menjadi penat dan bergaduh', 'Kampung menjadi lebih sunyi', 'Hanya ketua kampung yang untung'] },
  { k: 'sayang', e: '🍱', s: 'Kumar berkongsi bekal dengan rakan yang tidak membawa makanan.', q: 'Mengapakah tindakan Kumar menunjukkan sikap penyayang?', a: 'Dia mengambil berat tentang keperluan rakannya', w: ['Dia mahu dipuji oleh guru', 'Dia tidak suka akan makanannya', 'Dia mahu rakannya berhutang'] },
  { k: 'tahan', e: '📝', s: 'Aina gagal dalam ujian tetapi terus mencuba.', q: 'Mengapakah sikap tidak mudah putus asa penting?', a: 'Kita dapat belajar daripada kesilapan dan menjadi lebih baik', w: ['Supaya kita tidak perlu belajar lagi', 'Supaya orang lain berasa kasihan', 'Kerana gagal itu memalukan'] },
  { k: 'pimpin', e: '📋', s: 'Farah membahagikan tugas kumpulan dengan adil.', q: 'Mengapakah pemimpin yang baik membahagikan tugas dengan adil?', a: 'Supaya semua ahli menyumbang dan kerja cepat siap', w: ['Supaya pemimpin tidak perlu bekerja', 'Supaya ahli yang rajin membuat semua kerja', 'Supaya ada ahli yang tidak perlu datang'] },
  { k: 'aktif', e: '🗑️', s: 'Ada orang membuang sampah ke dalam sungai kampung.', q: 'Apakah kesannya kepada kampung?', a: 'Sungai tercemar dan ikan mati', w: ['Sungai menjadi lebih bersih', 'Air sungai menjadi lebih sejuk', 'Tiada apa-apa kesan'] },
  { k: 'tahan', e: '😡', s: 'Danish memarahi rakannya kerana kalah dalam permainan.', q: 'Apakah kesan perbuatan Danish?', a: 'Rakannya sedih dan tidak mahu bermain bersamanya lagi', w: ['Rakannya akan lebih gembira', 'Danish akan dipuji', 'Permainan menjadi lebih seronok'] },
  { k: 'sayang', e: '🧓', s: 'Penduduk melawat warga emas yang tinggal seorang diri.', q: 'Mengapakah lawatan ini penting?', a: 'Warga emas berasa disayangi dan tidak kesunyian', w: ['Supaya mereka dapat meminta duit', 'Supaya warga emas berpindah', 'Kerana lawatan itu satu pertandingan'] },
  { k: 'pimpin', e: '🙋', s: 'Nurul mendengar idea semua ahli sebelum membuat keputusan.', q: 'Apakah kebaikan sikap Nurul sebagai ketua?', a: 'Ahli berasa dihargai dan keputusan lebih baik', w: ['Keputusan menjadi lambat dan tidak berguna', 'Ahli berasa bosan', 'Hanya idea Nurul yang dipilih'] },
];
const nextWhy = deck(WHY);
function tp2() {
  const it = nextWhy();
  return round({ prompt: it.q, sp: EL[it.k].n, say: `${it.s} ${it.q}` }, it.e, it.s,
    [it.a, ...it.w].map((t) => ({
      label: t, correct: t === it.a, fx: t === it.a ? { [it.k]: 1 } : {},
      why: `${it.a}. Elemen: ${EL[it.k].e} ${EL[it.k].n}.`,
    })), true);
}

// ---------- TP3: dilema, pilih tindakan ----------
const G = (label, fx, why) => ({ label, correct: true, fx, why });
const B = (label, fx, why) => ({ label, correct: false, fx, why });
const DILEMMAS = [
  { e: '⚽', s: 'Bola kamu memecahkan cermin tingkap rumah jiran. Tiada sesiapa yang nampak.', o: [
    G('Mengaku, meminta maaf dan berbincang cara menggantinya', { aktif: 2, sayang: 1 }, 'Jujur dan bertanggungjawab membina kepercayaan jiran.'),
    G('Beritahu ibu bapa, kemudian berjumpa jiran bersama-sama', { aktif: 2 }, 'Meminta bantuan orang dewasa untuk bertanggungjawab ialah tindakan yang bijak.'),
    B('Lari dan berpura-pura tidak tahu', { aktif: -2 }, 'Jiran menanggung kerugian dan kepercayaan dalam kampung berkurang.'),
    B('Menuduh kawan yang lain', { aktif: -2, sayang: -1 }, 'Menuduh orang lain tidak jujur dan menyakitkan hati kawan.') ] },
  { e: '🧒', s: 'Seorang murid baharu duduk seorang diri ketika rehat.', o: [
    G('Ajak dia makan bersama dan kenalkan dia kepada rakan lain', { sayang: 2, pimpin: 1 }, 'Murid baharu berasa diterima, dan kamu menunjukkan contoh kepada rakan lain.'),
    B('Biarkan sahaja kerana itu bukan urusan saya', { sayang: -1 }, 'Murid itu terus berasa sunyi dan terasing.'),
    B('Ketawakan loghatnya yang berbeza', { sayang: -2, aktif: -1 }, 'Mengejek perbezaan menyakitkan hati dan memecahbelahkan masyarakat.') ] },
  { e: '📱', s: 'Seorang rakan sekelas dihina dalam kumpulan WhatsApp kelas.', o: [
    G('Jangan sertai, beri sokongan kepadanya dan beritahu guru', { sayang: 2, aktif: 1 }, 'Rakan itu berasa dilindungi, dan buli siber dapat dihentikan.'),
    B('Tambah emoji ketawa supaya tidak dikata membosankan', { sayang: -2 }, 'Emoji ketawa juga menyakitkan dan menggalakkan pembuli.'),
    B('Kongsi tangkap layar ke kumpulan lain', { sayang: -2, aktif: -1 }, 'Menyebarkan hinaan memburukkan lagi keadaan.') ] },
  { e: '🏆', s: 'Pasukan kamu kalah dalam pertandingan bercerita.', o: [
    G('Ucap tahniah kepada pemenang dan bincang cara memperbaiki persembahan', { tahan: 2, pimpin: 1 }, 'Kekalahan menjadi pelajaran, dan semangat pasukan kekal kuat.'),
    B('Salahkan ahli pasukan yang tersilap', { tahan: -1, pimpin: -2 }, 'Menyalahkan orang lain memecahkan pasukan.'),
    B('Berhenti menyertai pertandingan selama-lamanya', { tahan: -2 }, 'Berputus asa menghalang kita menjadi lebih baik.') ] },
  { e: '🌊', s: 'Banjir kecil melanda kampung. Rumah Pak Abu dimasuki air.', o: [
    G('Bantu mengangkat barang Pak Abu ke tempat tinggi bersama orang dewasa', { sayang: 2, aktif: 1 }, 'Bantuan bersama orang dewasa adalah selamat dan meringankan beban Pak Abu.'),
    G('Kumpul pakaian dan makanan untuk didermakan', { sayang: 1, aktif: 2 }, 'Sumbangan membantu mangsa banjir tanpa membahayakan diri.'),
    B('Bermain air banjir bersama kawan', { tahan: -1, aktif: -1 }, 'Air banjir kotor dan berbahaya, dan penduduk lain bimbang.') ] },
  { e: '📚', s: 'Dua ahli kumpulan kamu tidak membuat bahagian projek mereka.', o: [
    G('Bercakap dengan baik, tanya masalah mereka dan bahagikan semula tugas', { pimpin: 2, sayang: 1 }, 'Mungkin mereka ada masalah. Berbincang menyelesaikan masalah tanpa bergaduh.'),
    B('Buat semua kerja sendiri sambil merungut', { tahan: -1, pimpin: -1 }, 'Kamu keletihan dan mereka tidak belajar apa-apa.'),
    B('Laporkan kepada guru tanpa bertanya mereka dahulu', { pimpin: -1, sayang: -1 }, 'Lebih baik memahami masalah mereka dahulu sebelum melapor.') ] },
  { e: '🗑️', s: 'Kamu nampak sampah bertaburan di padang permainan kampung.', o: [
    G('Kutip sampah itu dan ajak rakan menyertai', { aktif: 2, pimpin: 1 }, 'Padang menjadi bersih, dan rakan terdorong untuk menjaga kebersihan.'),
    B('Tunggu pekerja majlis membersihkannya', { aktif: -1 }, 'Kebersihan kampung ialah tanggungjawab bersama.'),
    B('Tambah sampah kerana sudah kotor', { aktif: -2 }, 'Padang menjadi lebih kotor dan berbahaya untuk kanak-kanak.') ] },
  { e: '📒', s: 'Adik kamu terkoyakkan buku latihan kamu secara tidak sengaja.', o: [
    G('Tarik nafas, bertenang dan terangkan kepada adik cara menjaga buku', { tahan: 2, sayang: 1 }, 'Mengawal marah dan mengajar dengan lembut membuatkan adik belajar.'),
    B('Memukul adik', { sayang: -2, tahan: -2 }, 'Memukul menyakitkan adik dan tidak menyelesaikan masalah.'),
    B('Koyakkan buku adik pula', { sayang: -2 }, 'Membalas dendam menambah masalah.') ] },
  { e: '👛', s: 'Kamu terjumpa dompet berisi wang di tepi jalan.', o: [
    G('Serahkan kepada balai polis atau guru bersama ibu bapa', { aktif: 2 }, 'Pemiliknya dapat menerima semula dompetnya. Itulah amanah.'),
    B('Ambil wangnya dan buang dompet itu', { aktif: -2 }, 'Mengambil hak orang lain ialah perbuatan tidak amanah.'),
    B('Biarkan sahaja di situ', { aktif: -1 }, 'Dompet itu mungkin diambil orang lain dan pemiliknya rugi.') ] },
  { e: '📲', s: 'Warga emas di kampung tidak tahu menggunakan telefon untuk membuat temu janji klinik.', o: [
    G('Tawarkan diri untuk mengajar mereka langkah demi langkah', { sayang: 2, pimpin: 1 }, 'Warga emas menjadi lebih yakin dan berdikari.'),
    B('Ketawakan mereka kerana ketinggalan zaman', { sayang: -2 }, 'Mengejek warga emas tidak beradab.'),
    B('Suruh mereka bertanya kepada orang lain', { sayang: -1 }, 'Peluang untuk membantu terlepas.') ] },
];
const nextDilemma = deck(DILEMMAS);
function tp3() {
  const d = nextDilemma();
  return round({ prompt: 'Apakah tindakan yang paling baik?', sp: 'Dilema', say: d.s }, d.e, d.s, d.o, true);
}

// ---------- TP4: amalkan, selesaikan masalah kampung sebagai ketua belia ----------
const PROJECTS = [
  { e: '🚮', s: 'Sungai kampung semakin tercemar oleh sampah plastik.', o: [
    G('Anjurkan gotong-royong bulanan, pasang tong kitar semula dan buat poster kesedaran bersama murid', { aktif: 3, pimpin: 2 }, 'Penyelesaian berterusan yang melibatkan seluruh komuniti.'),
    B('Bersihkan sungai sendiri pada hujung minggu ini, kemudian tunggu orang lain mencontohi', { aktif: 1 }, 'Usaha yang baik, tetapi tidak berterusan dan tidak melibatkan komuniti.'),
    B('Tulis aduan di media sosial dan tunggu pihak berkuasa datang menyelesaikannya', { aktif: -1 }, 'Aduan boleh membantu, tetapi warganegara aktif turut bertindak.'),
    B('Upah lori untuk mengangkut sampah sungai dan membuangnya di hutan berhampiran', { aktif: -3, sayang: -1 }, 'Masalah hanya berpindah dan merosakkan alam sekitar.') ] },
  { e: '👴', s: 'Ramai warga emas tinggal seorang diri dan jarang keluar rumah.', o: [
    G('Wujudkan program "Cucu Angkat": belia melawat dan membantu warga emas setiap minggu', { sayang: 3, pimpin: 2 }, 'Hubungan berterusan merapatkan generasi muda dan warga emas.'),
    B('Kumpul derma dan hantar bakul hadiah kepada warga emas pada Hari Warga Emas sahaja', { sayang: 1 }, 'Baik, tetapi kesunyian mereka berlaku sepanjang tahun.'),
    B('Biarkan, kerana menjaga warga emas ialah tanggungjawab anak-anak mereka sendiri', { sayang: -2 }, 'Masyarakat penyayang menjaga satu sama lain.'),
    B('Cadangkan supaya semua warga emas yang tinggal seorang diri dihantar ke rumah orang tua', { sayang: -2 }, 'Keputusan dibuat tanpa bertanya kehendak warga emas sendiri.') ] },
  { e: '📵', s: 'Remaja kampung terlalu lama bermain telefon dan jarang bersukan.', o: [
    G('Bincang dengan remaja, kemudian anjurkan liga futsal dan badminton yang mereka pilih sendiri', { pimpin: 3, tahan: 1, aktif: 1 }, 'Remaja terlibat dalam keputusan, jadi mereka lebih bersemangat menyertainya.'),
    B('Minta ibu bapa merampas telefon semua remaja kampung sehingga cuti sekolah tamat', { pimpin: -2 }, 'Paksaan menimbulkan marah, bukan perubahan.'),
    B('Anjurkan ceramah dua jam tentang bahaya telefon tanpa sebarang aktiviti susulan', { pimpin: -1 }, 'Remaja bosan dan tabiat tidak berubah.'),
    B('Biarkan sahaja, kerana remaja akan berubah sendiri apabila mereka dewasa', { tahan: -1 }, 'Kesihatan remaja terus terjejas.') ] },
  { e: '🌧️', s: 'Kampung kerap dilanda banjir kilat ketika musim hujan.', o: [
    G('Bersama penduduk, bina pelan kecemasan: senarai rumah warga emas, laluan pemindahan dan latihan kecemasan', { tahan: 3, pimpin: 2, sayang: 1 }, 'Kampung bersedia, jadi semua orang lebih selamat ketika banjir.'),
    B('Beli sebuah bot dan pelampung untuk keluarga sendiri supaya kami selamat ketika banjir', { sayang: -2 }, 'Hanya satu keluarga selamat; jiran yang lemah tertinggal.'),
    B('Berdoa agar banjir tidak berlaku lagi, tetapi tidak membuat sebarang persediaan', { tahan: -2 }, 'Kampung tidak bersedia apabila banjir datang lagi.'),
    B('Kongsi video banjir lama di kumpulan WhatsApp kampung supaya semua orang berwaspada', { aktif: -2 }, 'Video lama mengelirukan dan menimbulkan panik.') ] },
  { e: '🧑‍🤝‍🧑', s: 'Penduduk pelbagai kaum di kampung jarang bergaul antara satu sama lain.', o: [
    G('Anjurkan hari rumah terbuka dan pertandingan masakan pelbagai budaya di dewan kampung', { sayang: 2, aktif: 2, pimpin: 1 }, 'Penduduk saling mengenali budaya masing-masing dan perpaduan menjadi kukuh.'),
    B('Anjurkan majlis besar di dewan kampung, tetapi hanya untuk penduduk satu kaum', { aktif: -2, sayang: -1 }, 'Penduduk lain berasa tersisih.'),
    B('Hantar mesej ucapan perayaan kepada semua penduduk melalui kumpulan WhatsApp kampung', { sayang: 1 }, 'Baik, tetapi penduduk masih jarang bertemu.'),
    B('Tiada apa yang perlu dibuat kerana setiap kaum lebih selesa bersama kaum sendiri', { aktif: -1 }, 'Jurang antara penduduk kekal.') ] },
  { e: '📖', s: 'Ramai murid di kampung tidak menyiapkan kerja rumah kerana tiada tempat belajar yang tenang.', o: [
    G('Jadikan dewan kampung pusat belajar petang dengan belia sebagai pembimbing sukarela', { pimpin: 2, sayang: 2, tahan: 1 }, 'Murid mendapat tempat dan bimbingan, dan belia belajar memimpin.'),
    B('Tegur murid di hadapan ibu bapa mereka kerana malas menyiapkan kerja rumah', { sayang: -2 }, 'Punca sebenar masalah tidak diselesaikan.'),
    B('Belia kampung secara sukarela menyiapkan kerja rumah murid setiap petang', { tahan: -2 }, 'Murid tidak belajar apa-apa.'),
    B('Minta guru di sekolah supaya memberi kurang kerja rumah kepada murid kampung', { tahan: -1 }, 'Masalah tempat belajar masih wujud.') ] },
];
const nextProject = deck(PROJECTS);
function tp4() {
  const p = nextProject();
  return round({ prompt: 'Sebagai Ketua Belia, apakah rancangan terbaik?', sp: 'Projek Komuniti', say: p.s }, p.e, p.s, p.o, true);
}

export default {
  levels: {
    1: { title: 'Kenal Perasaan dan Karakter', sp: ['Kesedaran Kendiri', 'Kesedaran Sosial'], make: tp1 },
    2: { title: 'Sebab dan Kesan', sp: ['Penyayang', 'Berdaya tahan', 'Berupaya memimpin', 'Warganegara aktif'], make: tp2 },
    3: { title: 'Dilema Harian', sp: ['Pengurusan Kendiri', 'Pengurusan Sosial'], make: tp3 },
    4: { title: 'Ketua Belia Kampung', sp: ['Berupaya memimpin', 'Warganegara aktif'], make: tp4 },
  },
};
