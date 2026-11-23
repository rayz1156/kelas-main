// Bot Penyelamat Banjir: 2D action prototype on the Misi Bantuan Banjir questions (Matematik Tingkatan 1, 2.1-2.2).
// The question logic is reused unchanged: each banjir question is rendered off-screen, its answer buttons become
// floating aid crates, and reaching a crate presses the matching hidden button. Scoring, TP and PBD stay in the shell.
// Controls: left/right (or A/D) choose a lane, Up/Space launches the boat, 1-4 pick a lane and launch,
// tap or click a lane on touch screens. Logs drifting across the river bounce the boat back (no score penalty).
import { h, sfx } from '../core.js';
import banjir from './banjir.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function wrapLines(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width <= maxW || !line) line = t;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

function river(labels, pick, onState) {
  const wrap = h('div', { class: 'bot-wrap' });
  const canvas = h('canvas', { class: 'bot-canvas', role: 'application', 'aria-label': `Sungai banjir dengan ${labels.length} kotak bantuan: ${labels.map((l, i) => `${i + 1}: ${l}`).join(', ')}. Anak panah kiri dan kanan untuk memilih lorong, Spasi untuk pergi.` });
  const status = h('div', { class: 'bot-status', 'aria-live': 'polite' }, '← → pilih lorong · ↑ atau Spasi untuk pergi · atau tekan kotak');
  const btn = (txt, label, fn) => h('button', { class: 'btn secondary', type: 'button', 'aria-label': label, onclick: fn }, txt);
  const pad = h('div', { class: 'bot-pad' },
    btn('◀', 'Lorong kiri', () => move(-1)),
    h('button', { class: 'btn green', type: 'button', onclick: () => launch() }, '🚀 Pergi!'),
    btn('▶', 'Lorong kanan', () => move(1)));
  wrap.append(canvas, pad, status);

  const ctx = canvas.getContext('2d');
  const n = labels.length;
  let W = 0, H = 0, dpr = 1;
  const boat = { lane: Math.floor((n - 1) / 2), x: 0, y: 0, mode: 'idle', t: 0 };
  let logs = [];
  const crates = labels.map((label, i) => ({ label, i, state: '' }));
  const splashes = [];
  const rain = Array.from({ length: reduced ? 0 : 70 }, () => ({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 0.6 }));
  let time = 0, last = 0, raf = 0, shake = 0, finished = false;

  const bank = () => Math.max(18, W * 0.045);
  const laneW = () => (W - 2 * bank()) / n;
  const laneX = (i) => bank() + laneW() * (i + 0.5);
  const crateY = () => H * 0.2;
  const baseY = () => H * 0.86;
  const rows = () => [H * 0.44, H * 0.63];

  function resize() {
    const w = Math.min(wrap.clientWidth || 800, 1100);
    // Fit the river between its top edge and the bottom of the screen (minus the control pad), so a projector shows it all.
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    const room = window.innerHeight - top - 110;
    const hgt = Math.round(Math.max(260, Math.min(w * 0.5, 460, room)));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(hgt * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = hgt + 'px';
    const first = !W;
    W = w; H = hgt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (first) { boat.x = laneX(boat.lane); boat.y = baseY(); }
    else if (boat.mode === 'idle') boat.y = baseY();
    // Two rows of logs, each with a wide gap so every lane can be crossed with timing.
    const speedA = (reduced ? 0.06 : 0.11) * W, speedB = -(reduced ? 0.08 : 0.15) * W;
    const lw = Math.max(60, W * 0.17);
    logs = [
      { row: 0, x: 0, w: lw, v: speedA }, { row: 0, x: W * 0.55, w: lw * 0.8, v: speedA },
      { row: 1, x: W * 0.25, w: lw, v: speedB }, { row: 1, x: W * 0.85, w: lw * 0.7, v: speedB },
    ];
  }

  function move(d) {
    if (boat.mode !== 'idle' || finished) return;
    boat.lane = Math.max(0, Math.min(n - 1, boat.lane + d));
    sfx('tap');
  }
  function launch(lane) {
    if (finished || boat.mode === 'bump') return;
    if (lane != null) { if (boat.mode !== 'idle') return; boat.lane = lane; }
    if (boat.mode !== 'idle') return;
    boat.mode = 'go';
    status.textContent = `Bot menuju kotak ${boat.lane + 1}: ${labels[boat.lane]}`;
  }

  function onKey(e) {
    if (!canvas.isConnected) return stop();
    const ov = document.querySelector('.overlay');
    if (finished || (ov && !ov.contains(canvas))) return;
    if (e.target.matches?.('input, textarea, select')) return;
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { e.preventDefault(); move(-1); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { e.preventDefault(); move(1); }
    else if (k === 'ArrowUp' || k === ' ' || k === 'w' || k === 'W') { e.preventDefault(); launch(); }
    else if (/^[1-9]$/.test(k) && Number(k) <= n) { e.preventDefault(); launch(Number(k) - 1); }
  }
  document.addEventListener('keydown', onKey);
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const lane = Math.max(0, Math.min(n - 1, Math.floor((x - bank()) / laneW())));
    launch(lane);
  });
  const ro = new ResizeObserver(() => resize());
  ro.observe(wrap);

  function stop() { cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey); ro.disconnect(); }

  function boatRect() { const bw = Math.min(laneW() * 0.42, 70, H * 0.16); return { x: boat.x - bw / 2, y: boat.y - bw * 0.7, w: bw, h: bw * 1.4 }; }

  function step(dt) {
    time += dt;
    for (const l of logs) {
      l.x += l.v * dt;
      if (l.v > 0 && l.x > W) l.x = -l.w;
      if (l.v < 0 && l.x + l.w < 0) l.x = W;
    }
    for (const r of rain) { r.y += dt * 0.9 * r.s; r.x -= dt * 0.08; if (r.y > 1) { r.y = 0; r.x = Math.random() * 1.1; } }
    for (const s of splashes) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 300 * dt; }
    while (splashes.length && splashes[0].t > 0.8) splashes.shift();
    shake = Math.max(0, shake - dt * 3);
    boat.x += (laneX(boat.lane) - boat.x) * Math.min(1, dt * 12);
    const speed = H * (reduced ? 0.55 : 0.8);
    if (boat.mode === 'go') {
      boat.y -= speed * dt;
      const b = boatRect();
      for (const l of logs) {
        const ly = rows()[l.row], lh = Math.max(16, H * 0.055);
        if (b.x < l.x + l.w && b.x + b.w > l.x && b.y < ly + lh / 2 && b.y + b.h > ly - lh / 2) {
          boat.mode = 'bump'; shake = 1; sfx('no');
          for (let k = 0; k < 14; k++) splashes.push({ x: boat.x, y: ly, vx: (Math.random() - 0.5) * 260, vy: -Math.random() * 220, t: 0 });
          status.textContent = 'Alamak, terlanggar kayu balak! Cuba lagi, tunggu ruang kosong.';
          break;
        }
      }
      if (boat.mode === 'go' && boat.y - boatRect().h * 0.3 <= crateY() + 26) {
        finished = true; boat.mode = 'done';
        const res = pick(boat.lane);
        res.forEach((st, i) => { crates[i].state = st; });
        onState?.();
        status.textContent = res[boat.lane] === 'right' ? '✅ Bantuan sampai!' : '❌ Kotak yang salah.';
        for (let k = 0; k < 20; k++) splashes.push({ x: boat.x, y: crateY(), vx: (Math.random() - 0.5) * 300, vy: -Math.random() * 250, t: 0 });
      }
    } else if (boat.mode === 'bump') {
      boat.y += speed * 1.6 * dt;
      if (boat.y >= baseY()) { boat.y = baseY(); boat.mode = 'idle'; status.textContent = '← → pilih lorong · ↑ atau Spasi untuk pergi · atau tekan kotak'; }
    } else if (boat.mode === 'idle') boat.y = baseY();
  }

  function draw() {
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    if (shake) ctx.translate((Math.random() - 0.5) * 8 * shake, (Math.random() - 0.5) * 6 * shake);
    // Flood water
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#8a6a3c'); g.addColorStop(1, '#5d7f8f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 2;
    for (let y = -20; y < H + 20; y += 26) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 12) {
        const yy = y + ((time * 30) % 26) + Math.sin(x / 40 + time * 2 + y) * 3;
        x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy);
      }
      ctx.stroke();
    }
    // Banks with half-submerged houses and trees
    const bk = bank();
    ctx.fillStyle = '#3f7d3a'; ctx.fillRect(0, 0, bk, H); ctx.fillRect(W - bk, 0, bk, H);
    ctx.font = `${Math.round(bk * 0.9)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let y = 30; y < H; y += 70) { ctx.fillText(y % 140 ? '🌴' : '🏠', bk / 2, y); ctx.fillText(y % 140 ? '🏠' : '🌳', W - bk / 2, y + 30); }
    // Lane guides
    ctx.setLineDash([10, 12]); ctx.strokeStyle = 'rgba(255,255,255,.22)';
    for (let i = 1; i < n; i++) { const x = bk + laneW() * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.setLineDash([]);
    const sel = boat.lane;
    ctx.fillStyle = 'rgba(255,224,138,.13)'; ctx.fillRect(bk + laneW() * sel, 0, laneW(), H);
    // Crates
    const cw = Math.min(laneW() * 0.86, 230), ch = Math.max(56, Math.min(H * 0.2, 96));
    const fs = Math.max(13, Math.min(28, laneW() / 6.5));
    crates.forEach((c, i) => {
      const x = laneX(i), y = crateY() + Math.sin(time * 2 + i) * 4;
      ctx.fillStyle = c.state === 'right' ? '#1f9d55' : c.state === 'wrong' ? '#d64545' : '#c8873a';
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(x - cw / 2, y - ch / 2, cw, ch, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(x - cw / 2 + 4, y - ch / 2 + 5, cw - 8, 5); ctx.fillRect(x - cw / 2 + 4, y + ch / 2 - 10, cw - 8, 5);
      ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.round(fs * 0.7)}px system-ui, sans-serif`;
      ctx.fillText(String(i + 1), x - cw / 2 + 14, y - ch / 2 + 13);
      ctx.font = `900 ${Math.round(fs)}px system-ui, sans-serif`;
      const lines = wrapLines(ctx, c.label, cw - 16).slice(0, 3);
      lines.forEach((ln, k) => ctx.fillText(ln, x, y + (k - (lines.length - 1) / 2) * fs * 1.1 + 2));
    });
    // Logs
    const lh = Math.max(16, H * 0.055);
    for (const l of logs) {
      const y = rows()[l.row];
      ctx.fillStyle = '#6b4423'; ctx.beginPath(); ctx.roundRect(l.x, y - lh / 2, l.w, lh, lh / 2); ctx.fill();
      ctx.fillStyle = '#8b5a2b'; ctx.beginPath(); ctx.ellipse(l.x + l.w - lh / 2, y, lh * 0.35, lh * 0.42, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
      for (let x = l.x + lh; x < l.x + l.w - lh; x += 18) { ctx.beginPath(); ctx.moveTo(x, y - lh / 4); ctx.lineTo(x + 10, y - lh / 4); ctx.stroke(); }
    }
    // Boat
    const b = boatRect();
    ctx.save(); ctx.translate(boat.x, boat.y);
    if (boat.mode === 'go') { ctx.fillStyle = 'rgba(255,255,255,.5)'; for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.arc((k % 2 ? -1 : 1) * b.w * 0.3, b.h * 0.3 + k * 9, 4 + k, 0, 7); ctx.fill(); } }
    ctx.fillStyle = '#f4f1ea'; ctx.strokeStyle = '#1f2430'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -b.h / 2); ctx.quadraticCurveTo(b.w / 2, -b.h * 0.15, b.w / 2, b.h / 2); ctx.lineTo(-b.w / 2, b.h / 2); ctx.quadraticCurveTo(-b.w / 2, -b.h * 0.15, 0, -b.h / 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8553d'; ctx.fillRect(-b.w / 2 + 3, b.h * 0.18, b.w - 6, b.h * 0.12);
    ctx.font = `${Math.round(b.w * 0.55)}px serif`; ctx.fillText('🧑‍🚒', 0, b.h * 0.02);
    ctx.restore();
    // Splashes and rain
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    for (const s of splashes) { ctx.globalAlpha = 1 - s.t / 0.8; ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(220,235,255,.45)'; ctx.lineWidth = 1.5;
    for (const r of rain) { ctx.beginPath(); ctx.moveTo(r.x * W, r.y * H); ctx.lineTo(r.x * W - 4, r.y * H + 12); ctx.stroke(); }
    ctx.restore();
  }

  function frame(t) {
    if (!canvas.isConnected && last) return stop();
    const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
    last = t;
    if (W) { step(dt); draw(); }
    raf = requestAnimationFrame(frame);
  }
  requestAnimationFrame(() => { resize(); raf = requestAnimationFrame(frame); });
  return wrap;
}

/** Turn one banjir question into a river round. Falls back to the normal buttons if a question has none. */
function toRiver(q) {
  return {
    ...q,
    render(area, done) {
      const hidden = h('div');
      q.render(hidden, done);
      const box = hidden.querySelector('.choices');
      const btns = box ? [...box.querySelectorAll('.choice')] : [];
      if (!btns.length) { area.append(...hidden.childNodes); return; }
      box.remove();
      // The number chips and emoji above banjir's buttons repeat what the prompt says; the river needs the height.
      const labels = btns.map((b) => [...b.childNodes].filter((c) => !c.classList?.contains('k')).map((c) => c.textContent).join('').trim());
      area.append(river(labels, (i) => {
        btns[i].click();
        return btns.map((b) => (b.classList.contains('right') ? 'right' : b.classList.contains('wrong') ? 'wrong' : ''));
      }));
    },
  };
}

const levels = {};
for (const [n, lv] of Object.entries(banjir.levels)) levels[n] = { ...lv, make: () => toRiver(lv.make()) };
export default { levels };
