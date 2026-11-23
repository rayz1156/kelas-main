# Kelas Main

Free classroom games for Malaysian teachers, aligned to the Kurikulum Persekolahan 2027 (KP2027) Dokumen Kurikulum published by BPK in 2026.

## What it does
- Whole-class play from one projector, with 1 to 4 teams.
- Every game level maps to a mastery level (TP1 TAHU, TP2 FAHAM, TP3 BUAT) and to Standard Pembelajaran codes.
- The results screen suggests a TP per team, the teacher confirms it and ticks observed adab, and the record is saved for the PBD report.
- Class lists and records stay in the browser (localStorage). No pupil data leaves the device.
- Works offline after the first visit (service worker).

## Games in this version (Tahun 1)
| Game | Subject | Standards |
|---|---|---|
| Kedai Runcit RM10 | Matematik | 3.1.1, 3.2.1, 3.2.2, 3.2.3 |
| Ikatan Nombor | Matematik | 1.2.1, 2.1.2, 2.1.3 |
| Kereta Api Suku Kata | Bahasa Melayu (SK dan SJK) | 3.1.2, 4.2.1 |
| Selamat atau Tidak? | Alam dan Manusia | 3.1.1, 3.1.2, 3.1.3, 3.1.7, 3.1.10 |

Standards 3.1.4 to 3.1.6 of Alam dan Manusia (unsafe touch) are left out on purpose. They need a teacher-led lesson.

## Architecture
Plain HTML, CSS and JavaScript modules. There is no build step and no server code, so the whole site can be served from any static host or CDN.

- `js/core.js`: helpers (DOM, storage, sound, speech, confetti).
- `js/shell.js`: the game engine (setup, turns, feedback, results, saving).
- `js/data.js`: game catalogue and TP labels.
- `js/games/*.js`: one module per game. A module only defines levels and a `make()` function that returns questions.

### Adding a game
1. Create `js/games/<id>.js` exporting `{ levels: { 1: { title, sp, make }, 2: ..., 3: ... } }`.
2. `make()` returns `{ prompt, sub?, say?, sp?, explain?, render(area, done) }`. Call `done(isCorrect, correctAnswerText)` once.
3. Add an entry to `GAMES` in `js/data.js` with `ready: true`.
4. Add the file to `CORE` in `sw.js` and bump `VERSION`.

## Run locally
```
python -m http.server 8080
```
Then open http://localhost:8080.

## Hosting
GitHub Pages from the `main` branch root. To move to Cloudflare Pages later, connect this repository there with no build command and output directory `/`.
