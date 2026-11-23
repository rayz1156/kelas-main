// Game shell: setup -> turns -> feedback -> results -> save to PBD report.
// Each game module only has to produce questions; the shell does everything else.
import { $, h, shuffle, store, sfx, speak, confetti, toggleFullscreen, isMuted, setMuted, uid, applyTheme, registerSW } from './core.js';
import { TP, ADAB, gameById } from './data.js';

const TEAM_PRESETS = [
  { name: 'Harimau', icon: '🐯', color: '#e08a00' },
  { name: 'Gajah', icon: '🐘', color: '#5b5fd6' },
  { name: 'Kancil', icon: '🦌', color: '#13896a' },
  { name: 'Penyu', icon: '🐢', color: '#d63d84' },
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
  const id = new URLSearchParams(location.search).get('g');
  const meta = gameById(id);
  if (!meta || !meta.ready) { location.replace('./'); return; }
  const mod = await import(`./games/${id}.js`);
  new Shell(meta, mod.default).setup();
}

class Shell {
  constructor(meta, game) {
    this.meta = meta;
    this.game = game;
    this.root = $('#app');
    this.cfg = Object.assign({ level: 1, nTeams: 2, perTeam: 3, classId: '' }, store.get('cfg:' + meta.id, {}));
    if (!game.levels[this.cfg.level]) this.cfg.level = 1;
    document.title = `${meta.title} · Kelas Main`;
    document.addEventListener('keydown', (e) => this.onKey(e));
  }

  // ---------- header ----------
  head() {
    const muteBtn = h('button', { class: 'icon-btn', type: 'button', title: 'Bunyi', 'aria-label': 'Hidup atau matikan bunyi' }, isMuted() ? '🔇' : '🔊');
    muteBtn.addEventListener('click', () => { setMuted(!isMuted()); muteBtn.textContent = isMuted() ? '🔇' : '🔊'; });
    return h('header', { class: 'game-head' },
      h('a', { class: 'icon-btn', href: './', style: { textDecoration: 'none' } }, '← Utama'),
      h('span', { style: { fontSize: '30px' } }, this.meta.emoji),
      h('h1', {}, this.meta.title),
      h('div', { class: 'scoreboard', id: 'sb' }),
      muteBtn,
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
    this.teams = null;
    const classes = store.get('classes', []);
    if (this.cfg.classId && !classes.find((c) => c.id === this.cfg.classId)) this.cfg.classId = '';
    const levels = Object.entries(this.game.levels);

    const pressGroup = (items, current, onPick) => h('div', { class: 'row' }, items.map((it) => {
      const b = h('button', { class: 'opt', type: 'button', 'aria-pressed': String(it.value === current) }, it.label, it.small ? h('small', {}, it.small) : null);
      b.addEventListener('click', () => { onPick(it.value); this.setup(); });
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

    this.root.replaceChildren(
      this.head(),
      h('main', { class: 'stage' },
        h('p', { class: 'tags', style: { marginTop: 0 } },
          h('span', { class: 'tag' }, `${this.meta.subject} · ${this.meta.level}`),
          h('span', { class: 'tag' }, this.meta.topic)),
        h('section', { class: 'panel' },
          h('h2', {}, '1. Pilih tahap'),
          pressGroup(levels.map(([n, lv]) => ({
            value: Number(n),
            label: `TP${n} ${TP[n].label}: ${lv.title}`,
            small: `SP ${lv.sp.join(', ')}`,
          })), this.cfg.level, (v) => (this.cfg.level = v))),
        h('section', { class: 'panel' },
          h('h2', {}, '2. Bilangan pasukan'),
          pressGroup([1, 2, 3, 4].map((n) => ({ value: n, label: n === 1 ? '1 (seluruh kelas)' : String(n) })), this.cfg.nTeams, (v) => (this.cfg.nTeams = v)),
          h('h2', { style: { marginTop: '18px' } }, '3. Senarai nama (pilihan)'),
          h('div', { class: 'row' }, classSel,
            h('button', { class: 'icon-btn', type: 'button', onclick: drawPreview }, '🔀 Kocok semula'),
            h('a', { href: './laporan.html#kelas' }, '+ Tambah kelas')),
          preview),
        h('section', { class: 'panel' },
          h('h2', {}, '4. Soalan bagi setiap pasukan'),
          pressGroup([2, 3, 4, 5].map((n) => ({ value: n, label: String(n) })), this.cfg.perTeam, (v) => (this.cfg.perTeam = v))),
        h('button', { class: 'btn green', type: 'button', style: { fontSize: '26px', padding: '18px 34px' }, onclick: () => this.play() }, 'Mula main ▶'),
        h('p', { class: 'note', style: { marginTop: '18px' } },
          'Tip: tayangkan skrin ini di projektor. Murid menjawab secara lisan atau ke hadapan, dan guru menekan jawapan. Kekunci 1 hingga 4 memilih jawapan dan Enter untuk soalan seterusnya.'),
      ),
    );
  }

  makeTeams(classes) {
    const n = this.cfg.nTeams;
    const cls = classes.find((c) => c.id === this.cfg.classId);
    const pupils = cls ? shuffle(cls.pupils) : [];
    const teams = TEAM_PRESETS.slice(0, n).map((p) => ({ ...p, members: [], score: 0, right: 0, asked: 0 }));
    pupils.forEach((name, i) => teams[i % n].members.push(name));
    return teams;
  }

  // ---------- play ----------
  play() {
    store.set('cfg:' + this.meta.id, this.cfg);
    this.teams = (this.draft || this.makeTeams(store.get('classes', []))).map((t) => ({ ...t, score: 0, right: 0, asked: 0 }));
    this.level = this.game.levels[this.cfg.level];
    this.total = this.teams.length * this.cfg.perTeam;
    this.q = 0;
    sfx('start');
    this.next();
  }

  next() {
    this.closeOverlay();
    if (this.q >= this.total) return this.end();
    this.turn = this.q % this.teams.length;
    const team = this.teams[this.turn];
    const question = this.level.make();
    this.answered = false;
    const area = h('div', { class: 'play-area' });
    const sayBtn = question.say ? h('button', { class: 'icon-btn', type: 'button', onclick: () => speak(question.say) }, '🔈 Dengar') : null;

    this.root.replaceChildren(
      this.head(),
      h('main', { class: 'stage' },
        h('div', { class: 'progress' }, h('i', { style: { width: `${(this.q / this.total) * 100}%` } })),
        h('div', { class: 'row' },
          h('span', { class: 'turn-banner', style: { background: team.color } }, `${team.icon} Giliran Pasukan ${team.name}`),
          h('span', { class: 'tag' }, `Soalan ${this.q + 1} / ${this.total}`),
          h('span', { class: 'tag sp' }, `TP${this.cfg.level} ${TP[this.cfg.level].label} · SP ${question.sp || this.level.sp.join(', ')}`),
          sayBtn),
        h('div', { class: 'prompt' }, question.prompt, question.sub ? h('small', {}, question.sub) : null),
        area),
    );
    this.renderScore();
    question.render(area, (ok, reveal) => this.answer(ok, reveal, question));
  }

  answer(ok, reveal, question) {
    if (this.answered) return;
    this.answered = true;
    const team = this.teams[this.turn];
    team.asked++;
    if (ok) { team.right++; team.score += 10; sfx('ok'); } else { sfx('no'); }
    this.renderScore();
    if (ok && question.onRight) question.onRight();
    setTimeout(() => this.feedback(ok, reveal, question, team), 650);
  }

  feedback(ok, reveal, question, team) {
    const last = this.q + 1 >= this.total;
    const box = h('div', { class: 'feedback ' + (ok ? 'ok' : 'no'), role: 'dialog', 'aria-live': 'assertive' },
      h('div', { class: 'big' }, ok ? '🎉' : '💪'),
      h('h2', {}, ok ? 'Betul!' : 'Hampir!'),
      h('p', {}, ok ? `+10 mata untuk Pasukan ${team.name}` : `Jawapan yang betul: ${reveal}`),
      question.explain ? h('p', { style: { fontSize: '19px' } }, question.explain) : null,
      h('button', { class: 'btn', type: 'button', id: 'nextBtn', onclick: () => { this.q++; this.next(); } }, last ? 'Lihat keputusan 🏆' : 'Seterusnya ➜'));
    this.overlay = h('div', { class: 'overlay' }, box);
    document.body.append(this.overlay);
    $('#nextBtn').focus();
  }

  closeOverlay() { this.overlay?.remove(); this.overlay = null; }

  onKey(e) {
    if (e.target.matches?.('input, textarea, select')) return;
    if (this.overlay && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); $('#nextBtn')?.click(); return; }
    if (!this.overlay && /^[1-9]$/.test(e.key)) $(`.choice[data-key="${e.key}"]`)?.click();
  }

  // ---------- results ----------
  suggestTP(t) {
    const acc = t.asked ? t.right / t.asked : 0;
    return acc >= 0.7 ? this.cfg.level : Math.max(this.cfg.level - 1, 0);
  }

  end() {
    this.turn = -1;
    const ranked = this.teams.slice().sort((a, b) => b.score - a.score);
    const top = ranked.filter((t) => t.score === ranked[0].score);
    const title = this.teams.length === 1 ? `Tahniah, kelas! ${this.teams[0].right} / ${this.teams[0].asked} betul`
      : top.length > 1 ? `Seri! ${top.map((t) => t.icon + ' ' + t.name).join(' dan ')}`
        : `${top[0].icon} Pasukan ${top[0].name} menang!`;
    confetti(); sfx('win');

    const maxTP = 3; // Tahap I scale
    const rows = this.teams.map((t) => {
      t.tp = this.suggestTP(t);
      t.adab = [];
      const sel = h('select', { 'aria-label': `TP Pasukan ${t.name}` },
        h('option', { value: '0', selected: t.tp === 0 }, 'Belum menguasai'),
        Array.from({ length: maxTP }, (_, i) => i + 1).map((n) => h('option', { value: String(n), selected: t.tp === n }, `TP${n} ${TP[n].label}`)));
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
    saveBtn.addEventListener('click', () => {
      const ok = this.save();
      saveBtn.disabled = true;
      saveBtn.textContent = ok ? '✅ Disimpan dalam peranti ini' : '⚠️ Tidak dapat menyimpan (storan pelayar disekat)';
    });
    const nextLevel = this.game.levels[this.cfg.level + 1] ? this.cfg.level + 1 : null;

    this.root.replaceChildren(
      this.head(),
      h('main', { class: 'stage' },
        h('p', { class: 'winner' }, title),
        h('p', { style: { color: 'var(--ink-soft)', marginTop: 0 } }, `${this.meta.title} · TP${this.cfg.level} ${TP[this.cfg.level].label}: ${this.level.title} · SP ${this.level.sp.join(', ')}`),
        h('section', { class: 'panel', style: { overflowX: 'auto' } },
          h('table', { class: 'results' },
            h('thead', {}, h('tr', {}, ['Pasukan', 'Mata', 'Betul', 'TP (cadangan)', 'Adab'].map((x) => h('th', {}, x)))),
            h('tbody', {}, rows)),
          h('p', { style: { fontSize: '15px', color: 'var(--ink-soft)', marginBottom: 0 } },
            'TP dicadangkan berdasarkan prestasi pasukan (70% betul = mencapai tahap ini). Guru membuat penentuan akhir dan boleh menukarnya. Tandakan adab yang diperhatikan.')),
        h('div', { class: 'row' },
          saveBtn,
          h('button', { class: 'btn secondary', type: 'button', onclick: () => this.play() }, '🔁 Main lagi'),
          nextLevel ? h('button', { class: 'btn secondary', type: 'button', onclick: () => { this.cfg.level = nextLevel; this.play(); } }, `⬆️ TP${nextLevel} seterusnya`) : null,
          h('button', { class: 'btn secondary', type: 'button', onclick: () => this.setup() }, '⚙️ Tetapan'),
          h('a', { class: 'btn secondary', href: './laporan.html', style: { textDecoration: 'none' } }, '📊 Laporan')),
      ),
    );
    this.renderScore();
  }

  save() {
    const records = store.get('records', []);
    const at = new Date().toISOString();
    for (const t of this.teams) {
      records.push({
        id: uid(), at, classId: this.cfg.classId || '',
        game: this.meta.id, title: this.meta.title, subject: this.meta.subject, year: this.meta.level,
        level: this.cfg.level, levelTitle: this.level.title, sp: this.level.sp,
        team: t.name, members: t.members, right: t.right, asked: t.asked, tp: t.tp, adab: t.adab,
      });
    }
    return store.set('records', records);
  }
}
