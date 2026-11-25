// Pasar Malam Rush: Dapur Gerobak — entri make.fun untuk bounty
// best-cooking-game-20261125-0137 ("Make the best cooking game").
// Game masak top-down satu layar di dapur gerobak pasar malam: koki berjalan
// (WASD/panah atau klik) melewati Kulkas, Talenan, Wajan, Piring, dan Jendela
// Saji, merakit 6 resep kombinasi sebelum patience pesanan habis. Terobosan
// entri ini adalah "Rute Terlihat": begitu pemain mengambil pesanan, lantai
// dapur menampilkan rute optimal sebagai garis putus-putus bercahaya dengan
// nomor urutan stasiun, jadi perencanaan rute — yang diminta kriteria 2 —
// terlihat langsung di satu frame, bukan hanya tertulis di aturan.
//
// Program ini (Node 22, stdlib saja) menyerahkan entrinya: ia menyalin
// folder game/ dan screenshots/ di samping file ini ke /output lalu menulis
// /output/dossier.json, ringkasan yang dibaca juri, memakai pustaka make.fun
// yang di-vendor. Di luar container grader, MAKEFUN_OUTPUT_DIR menggantikan
// /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Batas dari scorer (reference/gate.json): hanya text_max_bytes yang membentuk
// byte dossier; sisanya menolak entri yang scorer akan tolak (lebih dari 4
// screenshot atau satu di atas 256 KiB; lebih dari 993 file di game/ atau
// 48 MiB file game, atau path di bawah game/ lebih dari 1000 byte).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
