# Kelas Main

Free classroom games for Malaysian teachers, aligned to the Kurikulum Persekolahan 2027 (KP2027) Dokumen Kurikulum published by BPK in 2026.

## What it does
- Whole-class play from one projector, with 1 to 4 teams.
- Every game level maps to a mastery level (TP1 TAHU, TP2 FAHAM, TP3 BUAT, and TP4 AMAL from Tahap II and secondary) and to Standard Pembelajaran codes.
- The results screen suggests a TP per team, the teacher confirms it and ticks observed adab, and the record is saved for the PBD report.
- Class lists and records stay in the browser (localStorage). No pupil data leaves the device.
- Works offline after the first visit (service worker).

## Play modes
Every game, including teacher-made sets, plays in three modes:
- **Klasik**: teams take turns, one question each.
- **Papan Kejutan**: teams pick numbered tiles. Some tiles hide surprise cards (bonus, steal, swap, share, lose points, extra turn). Inspired by Baamboozle's board.
- **Lumba Masa**: each team answers as many as it can against a timer. Correct answers add 3 seconds.

TP suggestions use only real answers, never surprise-card points.

## Bina Set (teacher-made sets)
`bina.html` lets a teacher write questions for any subject, year and SP. Items with wrong options become multiple choice. Items without them are answered aloud: the teacher reveals the answer and marks it right or wrong. Sets are stored locally and can be shared as a link (`game.html?g=set#s=...`, the set encoded in the URL fragment, never sent to a server) or as a JSON file.

## Games in this version
### Tahun 1
| Game | Subject | Standards |
|---|---|---|
| Kedai Runcit RM10 | Matematik | 3.1.1, 3.2.1, 3.2.2, 3.2.3 |
| Ikatan Nombor | Matematik | 1.2.1, 2.1.2, 2.1.3 |
| Kereta Api Suku Kata | Bahasa Melayu (SK dan SJK) | 3.1.2, 4.2.1 |
| Selamat atau Tidak? | Alam dan Manusia | 3.1.1, 3.1.2, 3.1.3, 3.1.7, 3.1.10 |

Standards 3.1.4 to 3.1.6 of Alam dan Manusia (unsafe touch) are left out on purpose. They need a teacher-led lesson.

### Semua tahap
| Game | Subject | Basis | Levels |
|---|---|---|---|
| Kampung Sejahtera | Pembentukan Karakter | Four core character elements (penyayang, berdaya tahan, berupaya memimpin, warganegara aktif) and socio-emotional learning | TP1 to TP4 |

- The whole class shares one village per page session. Every choice moves four character meters and the village scene grows or declines. Teams still score for the better choice. Some dilemmas have more than one good choice. People and places are fictional.

### Tingkatan 1
| Game | Subject | Standards | Levels |
|---|---|---|---|
| Misi Bantuan Banjir | Matematik | 2.1.1 to 2.1.4, 2.2.1 to 2.2.3 | TP1 to TP4 |
| Neraca Persamaan | Matematik | 5.1.1 to 5.1.4 | TP1 to TP4 |
| Irama Gema | Pendidikan Muzik | 1.1.1, 1.1.2, 3.1.1, 3.1.2 | TP1 to TP3 |
| Detektif Tatabahasa | Bahasa Melayu | Aspek Tatabahasa (golongan kata, pembentukan kata, ayat) | TP1 to TP4 |
| Detektif Berita | Bahasa Melayu | 3.1.2, 3.1.3, 3.2.1, 3.2.2 | TP1 to TP4 |
| Bot Penyelamat Banjir (2D prototype) | Matematik | 2.1.1 to 2.1.4, 2.2.1 to 2.2.3 | TP1 to TP4 |

- Misi Bantuan Banjir and Neraca Persamaan follow the topic Standard Prestasi; TP4 is a daily-life problem, using the contexts named in the Nota (flood-aid distribution, bus timetables, finance, sport, engineering).
- Irama Gema draws notation as SVG and plays rhythms with the Web Audio API after a 4-beat count-in. TP3 includes clap-back items that the teacher marks.
- Bot Penyelamat Banjir is the first 2D action prototype. It reuses the Misi Bantuan Banjir questions unchanged: each question is rendered off-screen and its answer buttons become crates on a canvas river. Reaching a crate presses the matching hidden button, so scoring, modes and PBD work as in every other game. Logs only bounce the boat back; driving skill never changes the score.
- Detektif Berita follows the Membaca Standard Prestasi: TP1 find information, TP2 explain and classify it, TP3 link it and infer, TP4 respond critically (judge whether a news item or viral message is reliable, fake, one-sided or incomplete). All articles, places and people are fictional.
- The BM document has no SP codes or Standard Prestasi for Tatabahasa, so the game's levels are a teaching progression. Grammar areas appear in the report instead of SP codes.

## Architecture
Plain HTML, CSS and JavaScript modules. There is no build step and no server code, so the whole site can be served from any static host or CDN.

- `js/core.js`: helpers (DOM, storage, sound, speech, confetti).
- `js/shell.js`: the game engine (setup, turns, feedback, results, saving).
- `js/data.js`: game catalogue and TP labels.
- `js/games/*.js`: one module per game. A module only defines levels and a `make()` function that returns questions.

### Adding a game
1. Create `js/games/<id>.js` exporting `{ levels: { 1: { title, sp, make }, 2: ..., 3: ... } }`.
2. `make()` returns `{ prompt, sub?, say?, sp?, explain?, render(area, done) }`. Call `done(isCorrect, correctAnswerText)` once.
3. Add an entry to `GAMES` in `js/data.js` with `ready: true`. Give it `howto`: three pupil steps `{ e, t, d }` shown in the game's tutorial. The teacher steps and a practice question from the lowest level are added by the shell.
4. Add the file to `CORE` in `sw.js` and bump `VERSION`.

## Run locally
```
python -m http.server 8080
```
Then open http://localhost:8080.

## Hosting
GitHub Pages from the `main` branch root. To move to Cloudflare Pages later, connect this repository there with no build command and output directory `/`.
