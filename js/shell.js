// Game shell: setup -> play (Klasik, Papan Kejutan or Lumba Masa) -> results -> save to PBD report.
// A game module only produces questions; the shell wraps them in a play mode.
import { $, h, shuffle, store, sfx, speak, confetti, toggleFullscreen, isMuted, setMuted, uid, applyTheme, registerSW } from './core.js';
import { TP, ADAB, MODES, gameById, maxTPFor, spLabel } from './data.js';
import { loadSet, buildSetGame } from './games/set.js';
import { ready as memberReady, isMember, gate, badge, FREE_MAX_TP, FREE_MAX_TEAMS } from './ahli.js';
import { feedbackButton } from './maklum.js';

const TEAM_PRESETS = [
  { name: 'Harimau', icon: '🐯', color: '#e08a00' },
  { name: 'Gajah', icon: '🐘', color: '#5b5fd6' },
  { name: 'Kancil', icon: '🦌', color: '#13896a' },
  { name: 'Penyu', icon: '🐢', color: '#d63d84' },
];

// Surprise cards for Papan Kejutan. `pick` cards ask the team to choose another team.
const SURPRISES = [
  { id: 'bonus', e: '⭐', t: 'Mata bonus!', d: '+20 mata', solo: true, run: (me) => { me.score += 20; } },
  { id: 'gift', e: '🎈', t: 'Hadiah kecil', d: '+5 mata', solo: true, run: (me) => { me.score += 5; } },
  { id: 'again', e: '🔁', t: 'Giliran lagi!', d: 'Pasukan ini pilih satu nombor lagi', solo: true, again: true, run: () => {} },
  { id: 'swap', e: '🔄', t: 'Tukar mata!', d: 'Pilih pasukan untuk bertukar mata', pick: true, run: (me, o) => { [me.score, o.score] = [o.score, me.score]; } },
  { id: 'steal', e: '🦊', t: 'Curi 10 mata!', d: 'Pilih pasukan untuk dicuri matanya', pick: true, run: (me, o) => { const x = Math.min(10, o.score); o.score -= x; me.score += x; } },
  { id: 'share', e: '🤝', t: 'Bermurah hati', d: 'Beri 10 mata kepada pasukan pilihan', pick: true, run: (me, o) => { const x = Math.min(10, me.score); me.score -= x; o.score += x; } },
  { id: 'oops', e: '💥', t: 'Alamak!', d: 'Hilang 10 mata', run: (me) => { me.score = Math.max(0, me.score - 10); } },
];

// Tutorial steps shared by every game. Pupil steps specific to a game come from `howto` in data.js.
const TEACHER_STEPS = [
  { e: '📽️', t: 'Sediakan kelas', d: 'Tayangkan permainan di projektor atau TV. Tekan 🔍 untuk paparan besar dan ⛶ untuk skrin penuh. Satu komputer guru sudah memadai; murid tidak perlu peranti.' },
  { e: '🎮', t: 'Pilih mod permainan', d: '🎯 Klasik: pasukan bergilir menjawab. 🎁 Papan Kejutan: pasukan memilih nombor di papan, dan ada kad kejutan (bonus, curi, tukar mata). ⏱️ Lumba Masa: setiap pasukan menjawab sebanyak mungkin dalam masa yang ditetapkan.' },
  { e: '📊', t: 'Pilih tahap (TP)', d: 'TP1 TAHU, TP2 FAHAM, TP3 BUAT dan TP4 AMAL (Tahap II dan sekolah menengah). Mulakan dengan TP yang rendah, kemudian naikkan tahap.' },
  { e: '👥', t: 'Bahagikan pasukan', d: 'Pilih 1 hingga 4 pasukan. Jika senarai nama kelas sudah dimasukkan di Laporan PBD, murid diagihkan secara rawak. Tekan 🔀 Kocok semula untuk mengagih semula.' },
  { e: '🙋', t: 'Semasa bermain', d: 'Pasukan berbincang, wakil menyebut jawapan, dan guru menekan butang jawapan (atau kekunci 1 hingga 4). Penerangan muncul selepas setiap jawapan: bincangkan, kemudian tekan Enter untuk soalan seterusnya.' },
  { e: '📝', t: 'Selepas bermain', d: 'Tandakan adab setiap pasukan, semak TP yang dicadangkan, kemudian simpan ke Laporan PBD. Rekod disimpan dalam peranti ini sahaja dan tidak dihantar ke mana-mana.' },
];
const PUPIL_DEFAULT = [
  { e: '👀', t: 'Baca soalan', d: 'Baca soalan di skrin bersama pasukan. Tekan 🔈 Dengar jika ada.' },
  { e: '🙋', t: 'Bincang dan jawab', d: 'Bincang dengan rakan sepasukan. Wakil pasukan menyebut jawapan, kemudian guru menekan butang.' },
  { e: '💡', t: 'Belajar daripada jawapan', d: 'Betul atau salah, baca penerangan yang muncul. Setiap jawapan betul memberi mata kepada pasukan.' },
];

/** Big answer buttons. opts: [{ label, text?, correct }]. Keys 1-9 also work. */
export function choices(area, opts, done) {
  const wrap = h('div', { class: 'choices' });
  const answer = opts.find((o) => o.correct);
  opts.forEach((o, i) => {
    const b = h('button', { class: 'choice', 'data-key': String(i + 1), type: 'button' }, h('span', { class: 'k' }, i + 1), o.label);
    b.addEventListener('click', () => {
      if (wrap.dataset.done) return;
      wrap.dataset.done = '1';
      b.classList.add(o.correct ? 'right' : 'wrong');
      if (!o.correct) wrap.children[opts.indexOf(answer)]?.classList.add('right');
      done(!!o.correct, answer ? (answer.text ?? String(answer.label)) : '');
    });
    wrap.append(b);
  });
  area.append(wrap);
  return wrap;
}

export async function boot() {
  applyTheme();
  registerSW();
  if (store.get('big', false)) document.documentElement.classList.add('big');
  await memberReady;
  const id = new URLSearchParams(location.search).get('g');
  if (id === 'set') {
    const set = loadSet();
    if (!set) { location.replace('./bina.html'); return; }
    const meta = {
      id: 'set-' + set.id, title: set.title, emoji: '📝', subject: set.subject, level: set.year,
      topic: 'Set soalan guru', sp: set.sp, ready: true, shared: set.shared,
      notes: { how: ['Set ini dibina oleh guru menggunakan Bina Set.', 'Soalan tanpa pilihan jawapan: murid menjawab secara lisan, guru tekan Tunjuk Jawapan, kemudian Betul atau Salah.'], extend: '' },
    };
    new Shell(meta, buildSetGame(set), set).setup();
    return;
  }
  const meta = gameById(id);
  if (!meta || !meta.ready) { location.replace('./'); return; }
  const mod = await import(`./games/${id}.js`);
  const shell = new Shell(meta, mod.default);
  shell.setup();
  if (!store.get('tut:' + id, false)) shell.tutorial();
}

class Shell {
  constructor(meta, game, set = null) {
    this.meta = meta;
    this.game = game;
    this.set = set;
    this.maxTP = maxTPFor(meta.level);
    this.root = $('#app');
    this.cfg = Object.assign({ mode: 'klasik', level: Number(Object.keys(game.levels)[0]), nTeams: 2, perTeam: 3, seconds: 60, classId: '' }, store.get('cfg:' + meta.id, {}));
    if (!game.levels[this.cfg.level]) this.cfg.level = Number(Object.keys(game.levels)[0]);
    if (!MODES[this.cfg.mode]) this.cfg.mode = 'klasik';
    this.limit();
    document.title = `${meta.title} · JomMain`;
    document.addEventListener('keydown', (e) => this.onKey(e));
  }

  // ---------- membership ----------
  /** Free use: Klasik mode, TP1 and TP2, up to 2 teams. A teacher's own set keeps its level. */
  locked(kind, value) {
    if (isMember()) return false;
    if (kind === 'mode') return value !== 'klasik';
    if (kind === 'level') return !this.set && value > FREE_MAX_TP;
    if (kind === 'teams') return value > FREE_MAX_TEAMS;
    return false;
  }

  limit() {
    if (this.locked('mode', this.cfg.mode)) this.cfg.mode = 'klasik';
    if (this.locked('level', this.cfg.level)) this.cfg.level = Math.max(...Object.keys(this.game.levels).map(Number).filter((n) => !this.locked('level', n)));
    if (this.locked('teams', this.cfg.nTeams)) this.cfg.nTeams = FREE_MAX_TEAMS;
  }

  // ---------- header ----------
  head() {
    const muteBtn = h('button', { class: 'icon-btn', type: 'button', title: 'Bunyi', 'aria-label': 'Hidup atau matikan bunyi' }, isMuted() ? '🔇' : '🔊');
    muteBtn.addEventListener('click', () => { setMuted(!isMuted()); muteBtn.textContent = isMuted() ? '🔇' : '🔊'; });
    const bigBtn = h('button', { class: 'icon-btn', type: 'button', title: 'Paparan besar untuk projektor', 'aria-pressed': String(document.documentElement.classList.contains('big')) }, '🔍');
    bigBtn.addEventListener('click', () => {
      const on = document.documentElement.classList.toggle('big');
      store.set('big', on); bigBtn.setAttribute('aria-pressed', String(on));
    });
    return h('header', { class: 'game-head' },
      h('a', { class: 'icon-btn', href: this.set ? './bina.html' : './', style: { textDecoration: 'none' } }, '← Utama'),
      h('span', { style: { fontSize: '30px' } }, this.meta.emoji),
      h('h1', {}, this.meta.title),
      h('div', { class: 'scoreboard', id: 'sb' }),
      h('button', { class: 'icon-btn', type: 'button', title: 'Cara bermain', 'aria-label': 'Buka tutorial cara bermain', onclick: () => this.tutorial() }, '❓'),
      bigBtn, muteBtn,
      h('button', { class: 'icon-btn', type: 'button', title: 'Skrin penuh', onclick: toggleFullscreen }, '⛶'),
    );
  }

  renderScore() {
    const sb = $('#sb');
    if (!sb || !this.teams) return;
    sb.replaceChildren(...this.teams.map((t, i) =>
      h('span', { class: 'team-pill' + (i === this.turn ? ' active' : ''), style: { '--team': t.color } },
        t.icon, ' ', t.name, ' ', h('b', { class: 'pts' }, t.score))));
  }

  // ---------- setup ----------
  setup() {
    this.stopTimer();
    this.teams = null;
    this.turn = -1;
    const classes = store.get('classes', []);
    if (this.cfg.classId && !classes.find((c) => c.id === this.cfg.classId)) this.cfg.classId = '';
    const levels = Object.entries(this.game.levels);

    const pressGroup = (items, current, onPick) => h('div', { class: 'row' }, items.map((it) => {
      const b = h('button', { class: 'opt' + (it.locked ? ' locked' : ''), type: 'button', 'aria-pressed': String(it.value === current) },
        it.locked ? h('span', { class: 'lock', 'aria-label': 'Untuk ahli' }, '🔒 ') : null, it.label, it.small ? h('small', {}, it.small) : null);
      b.addEventListener('click', () => { if (it.locked) { gate(it.lockName); return; } onPick(it.value); this.setup(); });
      return b;
    }));

    const preview = h('div', { class: 'teams-preview' });
    const drawPreview = () => {
      this.draft = this.makeTeams(classes);
      preview.replaceChildren(...this.draft.map((t) => h('div', { class: 'team-box', style: { '--team': t.color } },
        h('b', {}, `${t.icon} Pasukan ${t.name}`),
        h('span', {}, t.members.length ? t.members.join(', ') : 'Tiada senarai nama'))));
    };
    drawPreview();

    const classSel = h('select', { 'aria-label': 'Pilih kelas' },
      h('option', { value: '' }, 'Tanpa senarai nama'),
      classes.map((c) => h('option', { value: c.id, selected: c.id === this.cfg.classId }, `${c.name} (${c.pupils.length} murid)`)));
    classSel.addEventListener('change', () => { this.cfg.classId = classSel.value; drawPreview(); });

    const notes = this.meta.notes;
    const isLumba = this.cfg.mode === 'lumba';

    this.root.replaceChildren(
      this.head(),
      h('main', { class: 'stage' },
        h('p', { class: 'tags', style: { marginTop: 0 } },
          h('span', { class: 'tag' }, `${this.meta.subject} · ${this.meta.level}`),
          h('span', { class: 'tag' }, this.meta.topic),
          this.set?.shared ? h('button', { class: 'chip', type: 'button', onclick: (e) => this.saveShared(e.currentTarget) }, '💾 Simpan ke Set Saya') : null,
          h('span', { class: 'spacer' }), feedbackButton({ game: this.meta.id }), badge()),
        h('button', { class: 'btn tut-open', type: 'button', onclick: () => this.tutorial() }, '🎓 Tutorial: cara bermain (guru dan murid)'),
        notes ? h('details', { class: 'panel notes' },
          h('summary', {}, '📘 Nota guru'),
          h('ul', {}, notes.how.map((x) => h('li', {}, x))),
          notes.extend ? h('p', {}, h('b', {}, 'Aktiviti susulan tanpa skrin: '), notes.extend) : null) : null,
        h('section', { class: 'panel' },
          h('h2', {}, '1. Pilih mod permainan'),
          pressGroup(Object.entries(MODES).map(([k, m]) => ({ value: k, label: m.label, small: m.small, locked: this.locked('mode', k), lockName: `Mod ${m.label}` })), this.cfg.mode, (v) => (this.cfg.mode = v))),
        h('section', { class: 'panel' },
          h('h2', {}, '2. Pilih tahap'),
          pressGroup(levels.map(([n, lv]) => ({
            value: Number(n),
            label: `TP${n} ${TP[n].label}: ${lv.title}`,
            small: lv.sp.map(spLabel).join(', '),
            locked: this.locked('level', Number(n)),
            lockName: `TP${n} ${TP[n].label}`,
          })), this.cfg.level, (v) => (this.cfg.level = v))),
        h('section', { class: 'panel' },
          h('h2', {}, '3. Bilangan pasukan'),
          pressGroup([1, 2, 3, 4].map((n) => ({ value: n, label: n === 1 ? '1 (seluruh kelas)' : String(n), locked: this.locked('teams', n), lockName: `${n} pasukan` })), this.cfg.nTeams, (v) => (this.cfg.nTeams = v)),
          h('h2', { style: { marginTop: '18px' } }, 'Senarai nama (pilihan)'),
          h('div', { class: 'row' }, classSel,
            h('button', { class: 'icon-btn', type: 'button', onclick: drawPreview }, '🔀 Kocok semula'),
            h('a', { href: './laporan.html#kelas' }, '+ Tambah kelas')),
          preview),
        h('section', { class: 'panel' },
          isLumba
            ? [h('h2', {}, '4. Masa bagi setiap pasukan'),
              pressGroup([30, 45, 60, 90].map((n) => ({ value: n, label: `${n} saat` })), this.cfg.seconds, (v) => (this.cfg.seconds = v))]
            : [h('h2', {}, '4. Soalan bagi setiap pasukan'),
              pressGroup([2, 3, 4, 5].map((n) => ({ value: n, label: String(n) })), this.cfg.perTeam, (v) => (this.cfg.perTeam = v))]),
        h('button', { class: 'btn green', type: 'button', style: { fontSize: '26px', padding: '18px 34px' }, onclick: () => this.play() }, 'Mula main ▶'),
        h('p', { class: 'note', style: { marginTop: '18px' } },
          'Tip: tayangkan di projektor dan tekan 🔍 untuk paparan besar. Murid menjawab secara lisan, guru menekan jawapan. Kekunci 1 hingga 4 memilih jawapan, Enter untuk seterusnya.'),
      ),
    );
  }

  // ---------- tutorial ----------
  tutorial(tab = 'guru') {
    this.closeTutorial();
    const steps = {
      guru: TEACHER_STEPS,
      murid: [...(this.meta.howto || PUPIL_DEFAULT), { practice: true, e: '🎯', t: 'Cuba satu soalan', d: 'Soalan latihan ini tidak dikira dalam markah.' }],
    };
    let i = 0;
    const body = h('div', { class: 'tut-body' });
    const dots = h('div', { class: 'tut-dots' });
    const back = h('button', { class: 'btn secondary', type: 'button' }, '← Kembali');
    const next = h('button', { class: 'btn green', type: 'button' });
    const tabs = h('div', { class: 'tut-tabs', role: 'tablist' });
    const draw = () => {
      const list = steps[tab];
      const st = list[i];
      tabs.replaceChildren(...[['guru', '👩‍🏫 Untuk guru'], ['murid', '🧒 Untuk murid']].map(([k, label]) =>
        h('button', { class: 'chip', type: 'button', role: 'tab', 'aria-selected': String(k === tab), onclick: () => { tab = k; i = 0; draw(); } }, label)));
      body.replaceChildren(...[
        h('div', { class: 'tut-step' },
          h('div', { class: 'tut-emoji', 'aria-hidden': 'true' }, st.e),
          h('div', {}, h('small', {}, `Langkah ${i + 1} daripada ${list.length}`), h('h3', {}, st.t), h('p', {}, st.d))),
        st.practice ? this.practice() : null,
        tab === 'guru' && i === list.length - 1 && this.meta.notes ? h('p', { class: 'note' }, '📘 Cadangan khusus untuk permainan ini ada dalam Nota guru di skrin persediaan.') : null].filter(Boolean));
      dots.replaceChildren(...list.map((_, k) => h('button', { class: 'tut-dot' + (k === i ? ' on' : ''), type: 'button', 'aria-label': `Langkah ${k + 1}`, onclick: () => { i = k; draw(); } })));
      back.disabled = i === 0;
      const last = i === list.length - 1;
      next.textContent = last ? (tab === 'guru' ? 'Seterusnya: untuk murid ➜' : 'Mula bermain ✔') : 'Seterusnya ➜';
    };
    back.onclick = () => { if (i > 0) { i--; draw(); } };
    next.onclick = () => {
      if (i < steps[tab].length - 1) { i++; draw(); }
      else if (tab === 'guru') { tab = 'murid'; i = 0; draw(); }
      else this.closeTutorial();
    };
    this.tut = h('div', { class: 'overlay tut-back', onclick: (e) => { if (e.target === this.tut) this.closeTutorial(); } },
      h('div', { class: 'tut', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Tutorial cara bermain' },
        h('div', { class: 'tut-head' },
          h('h2', {}, `🎓 Cara bermain: ${this.meta.emoji} ${this.meta.title}`),
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Tutup tutorial', onclick: () => this.closeTutorial() }, '✕')),
        tabs, body,
        h('div', { class: 'tut-foot' }, back, dots, next)));
    document.body.append(this.tut);
    draw();
    next.focus();
  }

  closeTutorial() {
    if (!this.tut) return;
    this.tut.remove(); this.tut = null;
    store.set('tut:' + this.meta.id, true);
  }

  /** One unscored question from the easiest level, so pupils see how answering works. */
  practice() {
    const box = h('div', { class: 'tut-practice' });
    const run = () => {
      const lv = this.game.levels[Object.keys(this.game.levels)[0]];
      const q = lv.make();
      const area = h('div', { class: 'play-area' });
      const fb = h('div', { class: 'tut-fb', 'aria-live': 'polite' });
      box.replaceChildren(
        h('div', { class: 'prompt' }, ...[q.prompt, q.sub ? h('small', {}, q.sub) : null,
          q.say ? h('button', { class: 'icon-btn', type: 'button', onclick: () => speak(q.say) }, '🔈 Dengar') : null].filter(Boolean)),
        area, fb);
      let answered = false;
      q.render(area, (ok, reveal) => {
        if (answered) return;
        answered = true;
        sfx(ok ? 'ok' : 'no');
        fb.replaceChildren(...[
          h('b', {}, ok ? '✅ Betul! ' : `💡 Hampir! Jawapan: ${reveal}. `),
          q.explain ? h('span', {}, q.explain) : null,
          h('button', { class: 'btn secondary', type: 'button', onclick: run }, '🔁 Cuba soalan lain')].filter(Boolean));
      });
    };
    run();
    return box;
  }

  saveShared(btn) {
    const sets = store.get('sets', []);
    const copy = { ...this.set, id: uid(), shared: false };
    delete copy.shared;
    btn.disabled = true;
    btn.textContent = store.set('sets', [...sets, copy]) ? '✅ Disimpan dalam Set Saya' : '⚠️ Tidak dapat menyimpan';
  }

  makeTeams(classes) {
    const n = this.cfg.nTeams;
    const cls = classes.find((c) => c.id === this.cfg.classId);
    const pupils = cls ? shuffle(cls.pupils) : [];
    const teams = TEAM_PRESETS.slice(0, n).map((p) => ({ ...p, members: [], score: 0, right: 0, asked: 0 }));
    pupils.forEach((name, i) => teams[i % n].members.push(name));
    return teams;
  }

  // ---------- shared play pieces ----------
  play() {
    this.limit();
    store.set('cfg:' + this.meta.id, this.cfg);
    this.teams = (this.draft || this.makeTeams(store.get('classes', []))).map((t) => ({ ...t, score: 0, right: 0, asked: 0 }));
    this.level = this.game.levels[this.cfg.level];
    this.turn = 0;
    sfx('start');
    if (this.cfg.mode === 'papan') return this.startBoard();
    if (this.cfg.mode === 'lumba') return this.raceIntro();
    this.total = this.teams.length * this.cfg.perTeam;
    this.q = 0;
    this.nextClassic();
  }

  /** Render a question screen and wire up its answer callback. */
  showQuestion(question, { banner = [], top = null, onAnswer }) {
    const team = this.teams[this.turn];
    const area = h('div', { class: 'play-area' });
    const sayBtn = question.say ? h('button', { class: 'icon-btn', type: 'button', onclick: () => speak(question.say) }, '🔈 Dengar') : null;
    this.root.replaceChildren(
      this.head(),
      h('main', { class: 'stage' },
        top,
        h('div', { class: 'row' },
          h('span', { class: 'turn-banner', style: { background: team.color } }, `${team.icon} Giliran Pasukan ${team.name}`),
          ...banner,
          h('span', { class: 'tag sp' }, `TP${this.cfg.level} ${TP[this.cfg.level].label}${(question.sp || this.level.sp.length) ? ' · ' + (question.sp ? spLabel(question.sp) : this.level.sp.map(spLabel).join(', ')) : ''}`),
          sayBtn),
        h('div', { class: 'prompt' }, question.prompt, question.sub ? h('small', {}, question.sub) : null),
        area),
    );
    this.renderScore();
    let answered = false;
    question.render(area, (ok, reveal) => {
      if (answered) return;
      answered = true;
      onAnswer(ok, reveal);
    });
  }

  /** Score one answer for the team whose turn it is. */
  scoreAnswer(ok, question, points = 10) {
    const team = this.teams[this.turn];
    team.asked++;
    if (ok) { team.right++; team.score += points; sfx('ok'); if (question.onRight) question.onRight(); } else { sfx('no'); }
    this.renderScore();
  }

  feedback(ok, reveal, question, nextLabel, onNext) {
    const team = this.teams[this.turn];
    const box = h('div', { class: 'feedback ' + (ok ? 'ok' : 'no'), role: 'dialog', 'aria-live': 'assertive' },
      h('div', { class: 'big' }, ok ? '🎉' : '💪'),
      h('h2', {}, ok ? 'Betul!' : 'Hampir!'),
      h('p', {}, ok ? `+10 mata untuk Pasukan ${team.name}` : `Jawapan yang betul: ${reveal}`),
      question.explain ? h('p', { style: { fontSize: '19px' } }, question.explain) : null,
      h('button', { class: 'btn', type: 'button', id: 'nextBtn', onclick: () => { this.closeOverlay(); onNext(); } }, nextLabel));
    this.openOverlay(box);
  }

  openOverlay(box) {
    this.closeOverlay();
    this.overlay = h('div', { class: 'overlay' }, box);
    document.body.append(this.overlay);
    $('#nextBtn', this.overlay)?.focus();
  }
  closeOverlay() { this.overlay?.remove(); this.overlay = null; }

  onKey(e) {
    if (this.tut) { if (e.key === 'Escape') this.closeTutorial(); return; }
    if (e.target.matches?.('input, textarea, select')) return;
    if (this.overlay && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); $('#nextBtn', this.overlay)?.click(); return; }
    if (this.overlay) return;
    if (/^[1-9]$/.test(e.key)) $(`.choice[data-key="${e.key}"]`)?.click();
    else if (e.key === ' ' && $('#revealBtn')) { e.preventDefault(); $('#revealBtn').click(); }
  }

  // ---------- mode 1: Klasik ----------
  nextClassic() {
    if (this.q >= this.total) return this.end();
    this.turn = this.q % this.teams.length;
    const question = this.level.make();
    this.showQuestion(question, {
      top: h('div', { class: 'progress' }, h('i', { style: { width: `${(this.q / this.total) * 100}%` } })),
      banner: [h('span', { class: 'tag' }, `Soalan ${this.q + 1} / ${this.total}`)],
      onAnswer: (ok, reveal) => {
        this.scoreAnswer(ok, question);
        const last = this.q + 1 >= this.total;
        setTimeout(() => this.feedback(ok, reveal, question, last ? 'Lihat keputusan 🏆' : 'Seterusnya ➜', () => { this.q++; this.nextClassic(); }), 650);
      },
    });
  }

  // ---------- mode 2: Papan Kejutan ----------
  startBoard() {
    const nq = this.teams.length * this.cfg.perTeam;
    const ns = Math.max(2, Math.round(nq / 3));
    const pool = SURPRISES.filter((s) => this.teams.length > 1 || s.solo);
    const tiles = shuffle([
      ...Array.from({ length: nq }, () => ({ kind: 'q' })),
      ...Array.from({ length: ns }, (_, i) => ({ kind: 's', card: pool[(i + Math.floor(Math.random() * pool.length)) % pool.length] })),
    ]).map((t, i) => ({ ...t, n: i + 1, state: '' }));
    this.tiles = tiles;
    this.board();
  }

  board() {
    if (this.tiles.every((t) => t.state)) return this.end();
    const team = this.teams[this.turn];
    const left = this.tiles.filter((t) => !t.state).length;
    const cols = this.tiles.length <= 12 ? 4 : this.tiles.length <= 20 ? 5 : 6;
    this.root.replaceChildren(
      this.head(),
      h('main', { class: 'stage' },
        h('div', { class: 'row' },
          h('span', { class: 'turn-banner', style: { background: team.color } }, `${team.icon} Pasukan ${team.name}, pilih satu nombor!`),
          h('span', { class: 'tag' }, `${left} petak lagi`)),
        h('div', { class: 'board', style: { gridTemplateColumns: `repeat(${cols}, 1fr)` } },
          this.tiles.map((t) => h('button', {
            class: 'tile' + (t.state ? ' done ' + t.state : ''), type: 'button', disabled: !!t.state,
            'aria-label': t.state ? `Petak ${t.n} sudah dibuka` : `Petak ${t.n}`,
            onclick: () => this.openTile(t),
          }, t.state === 'right' ? '✓' : t.state === 'wrong' ? '✗' : t.state === 'surprise' ? t.card.e : t.n)))),
    );
    this.renderScore();
  }

  openTile(tile) {
    sfx('tap');
    if (tile.kind === 's') return this.surprise(tile);
    const question = this.level.make();
    this.showQuestion(question, {
      banner: [h('span', { class: 'tag' }, `Petak ${tile.n}`)],
      onAnswer: (ok, reveal) => {
        this.scoreAnswer(ok, question);
        tile.state = ok ? 'right' : 'wrong';
        setTimeout(() => this.feedback(ok, reveal, question, 'Kembali ke papan ➜', () => this.advanceBoard()), 650);
      },
    });
  }

  advanceBoard(again = false) {
    if (!again) this.turn = (this.turn + 1) % this.teams.length;
    this.board();
  }

  surprise(tile) {
    tile.state = 'surprise';
    const card = tile.card;
    const me = this.teams[this.turn];
    const others = this.teams.filter((t) => t !== me);
    sfx(card.id === 'oops' ? 'no' : 'win');
    const finish = (other) => {
      card.run(me, other);
      this.renderScore();
      this.closeOverlay();
      this.advanceBoard(!!card.again);
    };
    const actions = card.pick
      ? h('div', { class: 'row', style: { justifyContent: 'center' } }, others.map((o) =>
        h('button', { class: 'btn', type: 'button', style: { background: o.color }, onclick: () => finish(o) }, `${o.icon} ${o.name} (${o.score})`)))
      : h('button', { class: 'btn', type: 'button', id: 'nextBtn', onclick: () => finish(null) }, 'Teruskan ➜');
    this.openOverlay(h('div', { class: 'feedback surprise-card', role: 'dialog' },
      h('div', { class: 'big', style: { fontSize: '96px' } }, card.e),
      h('h2', {}, card.t),
      h('p', {}, `Pasukan ${me.name}: ${card.d}`),
      actions));
  }

  // ---------- mode 3: Lumba Masa ----------
  raceIntro() {
    this.stopTimer();
    const team = this.teams[this.turn];
    this.root.replaceChildren(
      this.head(),
      h('main', { class: 'stage', style: { textAlign: 'center' } },
        h('div', { class: 'big-emoji', style: { marginTop: '20px' } }, team.icon),
        h('p', { class: 'winner' }, `Pasukan ${team.name}, sedia?`),
        h('p', { style: { fontSize: '22px', color: 'var(--ink-soft)' } }, `Jawab sebanyak mungkin dalam ${this.cfg.seconds} saat. Setiap jawapan betul: +10 mata dan +3 saat.`),
        h('button', { class: 'btn green', type: 'button', id: 'nextBtn', style: { fontSize: '30px', padding: '20px 40px' }, onclick: () => this.raceStart() }, '⏱️ Mula!')),
    );
    this.renderScore();
    $('#nextBtn').focus();
  }

  raceStart() {
    this.timeLeft = this.cfg.seconds;
    this.raceGen = (this.raceGen || 0) + 1;
    const gen = this.raceGen;
    this.timer = setInterval(() => {
      this.timeLeft--;
      const el = $('#clock');
      if (el) { el.textContent = `⏱️ ${Math.max(0, this.timeLeft)}`; el.classList.toggle('low', this.timeLeft <= 10); }
      if (this.timeLeft <= 5 && this.timeLeft > 0) sfx('tick');
      if (this.timeLeft <= 0 && gen === this.raceGen) this.raceStop();
    }, 1000);
    this.raceNext(gen);
  }

  raceNext(gen) {
    if (gen !== this.raceGen || this.timeLeft <= 0) return;
    const question = this.level.make();
    const team = this.teams[this.turn];
    this.showQuestion(question, {
      top: h('div', { class: 'clock-row' },
        h('span', { class: 'clock' + (this.timeLeft <= 10 ? ' low' : ''), id: 'clock' }, `⏱️ ${this.timeLeft}`),
        h('span', { class: 'tag' }, `Betul: ${team.right} / ${team.asked}`)),
      onAnswer: (ok) => {
        if (gen !== this.raceGen || this.timeLeft <= 0) return;
        this.scoreAnswer(ok, question);
        if (ok) this.timeLeft += 3;
        this.flash(ok);
        setTimeout(() => this.raceNext(gen), ok ? 450 : 900);
      },
    });
  }

  flash(ok) {
    const f = h('div', { class: 'flash ' + (ok ? 'ok' : 'no') }, ok ? '+10 ✓  +3s' : '✗');
    document.body.append(f);
    setTimeout(() => f.remove(), 800);
  }

  stopTimer() { clearInterval(this.timer); this.timer = null; }

  raceStop() {
    this.stopTimer();
    this.raceGen++;
    const team = this.teams[this.turn];
    const last = this.turn + 1 >= this.teams.length;
    sfx('win');
    this.openOverlay(h('div', { class: 'feedback ok', role: 'dialog' },
      h('div', { class: 'big' }, '⏰'),
      h('h2', {}, 'Masa tamat!'),
      h('p', {}, `Pasukan ${team.name}: ${team.right} betul daripada ${team.asked} soalan, ${team.score} mata.`),
      h('button', { class: 'btn', type: 'button', id: 'nextBtn', onclick: () => {
        this.closeOverlay();
        if (last) this.end(); else { this.turn++; this.raceIntro(); }
      } }, last ? 'Lihat keputusan 🏆' : 'Pasukan seterusnya ➜')));
  }

  // ---------- results ----------
  suggestTP(t) {
    const acc = t.asked ? t.right / t.asked : 0;
    return acc >= 0.7 ? this.cfg.level : Math.max(this.cfg.level - 1, 0);
  }

  end() {
    this.stopTimer();
    this.closeOverlay();
    this.turn = -1;
    const ranked = this.teams.slice().sort((a, b) => b.score - a.score);
    const top = ranked.filter((t) => t.score === ranked[0].score);
    const title = this.teams.length === 1 ? `Tahniah, kelas! ${this.teams[0].right} / ${this.teams[0].asked} betul`
      : top.length > 1 ? `Seri! ${top.map((t) => t.icon + ' ' + t.name).join(' dan ')}`
        : `${top[0].icon} Pasukan ${top[0].name} menang!`;
    confetti(); sfx('win');

    const rows = this.teams.map((t) => {
      t.tp = t.asked ? this.suggestTP(t) : 0;
      t.adab = [];
      const sel = h('select', { 'aria-label': `TP Pasukan ${t.name}` },
        h('option', { value: '0', selected: t.tp === 0 }, 'Belum menguasai'),
        Array.from({ length: this.maxTP }, (_, i) => i + 1).map((n) => h('option', { value: String(n), selected: t.tp === n }, `TP${n} ${TP[n].label}`)));
      sel.addEventListener('change', () => (t.tp = Number(sel.value)));
      const adab = h('div', { class: 'adab' }, ADAB.map((a) => {
        const cb = h('input', { type: 'checkbox' });
        cb.addEventListener('change', () => { t.adab = cb.checked ? [...t.adab, a] : t.adab.filter((x) => x !== a); });
        return h('label', { class: 'inline' }, cb, a);
      }));
      return h('tr', {},
        h('td', {}, h('b', {}, `${t.icon} ${t.name}`), h('div', { style: { fontSize: '14px', color: 'var(--ink-soft)' } }, t.members.join(', '))),
        h('td', {}, h('b', {}, `${t.score}`), ' mata'),
        h('td', {}, `${t.right} / ${t.asked}`),
        h('td', {}, sel),
        h('td', {}, adab));
    });

    const saveBtn = h('button', { class: 'btn green', type: 'button' }, '💾 Simpan ke Laporan PBD');
    if (!isMember()) saveBtn.prepend('🔒 ');
    saveBtn.addEventListener('click', () => {
      if (!isMember()) { gate('Simpan ke Laporan PBD'); return; }
      const ok = this.save();
      saveBtn.disabled = true;
      saveBtn.textContent = ok ? '✅ Disimpan dalam peranti ini' : '⚠️ Tidak dapat menyimpan (storan pelayar disekat)';
    });
    const levelKeys = Object.keys(this.game.levels).map(Number);
    const nextLevel = levelKeys.find((k) => k > this.cfg.level) || null;

    this.root.replaceChildren(
      this.head(),
      h('main', { class: 'stage' },
        h('p', { class: 'winner' }, title),
        h('p', { style: { color: 'var(--ink-soft)', marginTop: 0 } }, `${this.meta.title} · ${MODES[this.cfg.mode].label} · TP${this.cfg.level} ${TP[this.cfg.level].label}: ${this.level.title}${this.level.sp.length ? ' · ' + this.level.sp.map(spLabel).join(', ') : ''}`),
        h('section', { class: 'panel', style: { overflowX: 'auto' } },
          h('table', { class: 'results' },
            h('thead', {}, h('tr', {}, ['Pasukan', 'Mata', 'Betul', 'TP (cadangan)', 'Adab'].map((x) => h('th', {}, x)))),
            h('tbody', {}, rows)),
          h('p', { style: { fontSize: '15px', color: 'var(--ink-soft)', marginBottom: 0 } },
            'TP dicadangkan daripada jawapan pasukan sahaja (70% betul = mencapai tahap ini). Mata kad kejutan tidak dikira. Guru membuat penentuan akhir. Tandakan adab yang diperhatikan.')),
        h('div', { class: 'row' },
          saveBtn,
          h('button', { class: 'btn secondary', type: 'button', onclick: () => this.play() }, '🔁 Main lagi'),
          nextLevel ? h('button', { class: 'btn secondary', type: 'button', onclick: () => { if (this.locked('level', nextLevel)) { gate(`TP${nextLevel} ${TP[nextLevel].label}`); return; } this.cfg.level = nextLevel; this.play(); } }, `${this.locked('level', nextLevel) ? '🔒' : '⬆️'} TP${nextLevel} seterusnya`) : null,
          h('button', { class: 'btn secondary', type: 'button', onclick: () => this.setup() }, '⚙️ Tetapan'),
          h('a', { class: 'btn secondary', href: './laporan.html', style: { textDecoration: 'none' } }, '📊 Laporan'),
          feedbackButton({ game: this.meta.id, level: this.cfg.level, mode: this.cfg.mode }, 'btn secondary')),
      ),
    );
    this.renderScore();
  }

  save() {
    const records = store.get('records', []);
    const at = new Date().toISOString();
    for (const t of this.teams) {
      if (!t.asked) continue;
      records.push({
        id: uid(), at, classId: this.cfg.classId || '',
        game: this.meta.id, title: this.meta.title, subject: this.meta.subject, year: this.meta.level, mode: this.cfg.mode,
        level: this.cfg.level, levelTitle: this.level.title, sp: this.level.sp,
        team: t.name, members: t.members, right: t.right, asked: t.asked, tp: t.tp, adab: t.adab,
      });
    }
    return store.set('records', records);
  }
}
