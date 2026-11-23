// Game catalogue and KP2027 reference data.

/** Mastery levels (Tahap Penguasaan). Tahap I (Tahun 1-2) uses TP1-TP3; Tahap II onward adds TP4. */
export const TP = {
  1: { label: 'TAHU', desc: 'Menyatakan perkara asas dengan beradab' },
  2: { label: 'FAHAM', desc: 'Menerangkan dengan beradab' },
  3: { label: 'BUAT', desc: 'Mengaplikasikan pengetahuan dan kemahiran dengan beradab' },
  4: { label: 'AMAL', desc: 'Mengamalkan secara kreatif dan inovatif dengan beradab' },
};

export const ADAB = ['Bergilir-gilir', 'Menghormati rakan', 'Bekerjasama'];

export const GAMES = [
  {
    id: 'kedai-runcit',
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
