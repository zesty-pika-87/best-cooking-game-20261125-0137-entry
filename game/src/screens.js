// Layar permainan: judul, jeda, dan akhir. Overlay digambar di atas dapur
// yang sama, supaya judul pun sudah memperlihatkan dapurnya.
import { W, H, RECIPES, WIN_SERVES } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function centerText(ctx, text, x, y, font, color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

export function drawTitle(ctx, state, best) {
  ctx.fillStyle = 'rgba(20, 8, 32, 0.72)';
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 190, 96, 900, 528, 26);
  ctx.fillStyle = '#fff8e6';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ff5a3c';
  ctx.stroke();
  centerText(ctx, '★ PASAR MALAM ★', 640, 150, 'bold 30px Georgia, serif', '#c96a1e');
  centerText(ctx, 'RUSH', 640, 236, 'bold 110px Georgia, serif', '#e63b1e');
  ctx.fillStyle = '#e63b1e';
  ctx.fillRect(340, 292, 600, 6);
  centerText(ctx, 'Dapur Gerobak', 640, 336, 'bold 52px Georgia, serif', '#2b1a4d');
  centerText(ctx, 'Masak cepat, antar tepat waktu — ikuti rute bernomor di lantai!', 640, 384, '20px Georgia, serif', '#4a3a6a');
  const recipes = RECIPES.map((r) => r.name).join('  •  ');
  centerText(ctx, recipes, 640, 420, 'bold 19px Georgia, serif', '#8a5a00');
  centerText(ctx, 'WASD / panah atau klik untuk jalan  •  E / Spasi pakai stasiun  •  Q buang piring', 640, 458, '19px Georgia, serif', '#4a3a6a');
  centerText(ctx, 'Sajikan ' + WIN_SERVES + ' hidangan sebelum waktu habis. 3 pesanan hangus = kalah.', 640, 488, '19px Georgia, serif', '#4a3a6a');
  roundRect(ctx, 490, 516, 300, 62, 14);
  ctx.fillStyle = '#e63b1e';
  ctx.fill();
  centerText(ctx, '▶  MAIN', 640, 548, 'bold 32px Georgia, serif', '#ffffff');
  if (best > 0) centerText(ctx, 'Skor terbaik: ' + best, 640, 598, '19px Georgia, serif', '#8a5a00');
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20, 8, 32, 0.66)';
  ctx.fillRect(0, 0, W, H);
  centerText(ctx, 'JEDA', 640, 320, 'bold 72px Georgia, serif', '#ffffff');
  centerText(ctx, 'Tekan P atau Enter untuk lanjut', 640, 390, '24px Georgia, serif', '#ffe9a8');
}

export function drawOver(ctx, state, best) {
  ctx.fillStyle = 'rgba(20, 8, 32, 0.78)';
  ctx.fillRect(0, 0, W, H);
  roundRect(ctx, 290, 130, 700, 460, 26);
  ctx.fillStyle = '#fff8e6';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = state.won ? '#2e9e4f' : '#e63b1e';
  ctx.stroke();
  const title = state.won ? '★ MENANG! ★' : state.overReason === 'fails' ? 'PESANAN HANGUS!' : 'WAKTU HABIS';
  centerText(ctx, title, 640, 200, 'bold 64px Georgia, serif', state.won ? '#2e9e4f' : '#e63b1e');
  centerText(ctx, state.won ? 'Gerobakmu jadi primadona pasar malam!' : state.overReason === 'fails' ? 'Tiga pesanan hangus — pelanggan kecewa dan pulang.' : 'Gerobak tutup — pelanggan pulang lapar.', 640, 258, '22px Georgia, serif', '#4a3a6a');
  centerText(ctx, 'SKOR  ' + state.score, 640, 330, 'bold 54px Georgia, serif', '#2b1a4d');
  centerText(ctx, 'Hidangan disajikan: ' + state.served + '    •    Kombo terbaik: x' + Math.max(1, state.bestCombo) + '    •    Pesanan hangus: ' + state.failed, 640, 392, '22px Georgia, serif', '#4a3a6a');
  centerText(ctx, 'Skor terbaik: ' + Math.max(best, state.score), 640, 430, '20px Georgia, serif', '#8a5a00');
  roundRect(ctx, 490, 470, 300, 62, 14);
  ctx.fillStyle = '#e63b1e';
  ctx.fill();
  centerText(ctx, '↻  MAIN LAGI', 640, 502, 'bold 30px Georgia, serif', '#ffffff');
  centerText(ctx, 'Tekan Enter atau klik untuk main lagi', 640, 562, '18px Georgia, serif', '#8a5a00');
}
