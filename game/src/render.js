// Pasar Malam Rush — semua gambar digambar dari kode (Canvas 2D, tanpa aset
// luar). Satu frame harus memuat keenam elemen kriteria 1: dapur, order board,
// bahan di counter, hidangan mid-assembly, timer, dan piring siap saji.
import { W, H, STATIONS, STATION_ORDER, INGREDIENTS, recipeById } from './config.js';
import { SCREEN_TITLE, SCREEN_PAUSED, SCREEN_OVER, drawTitle, drawPaused, drawOver } from './screens.js';

export { SCREEN_TITLE, SCREEN_PLAY, SCREEN_PAUSED, SCREEN_OVER } from './screens.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, font, color, align) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// Ikon tiap bahan, digambar dari bentuk dasar. Dipakai di tiket, di counter,
// di tangan koki, dan di piring.
export function drawIngredient(ctx, ing, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (ing === 'nasi') {
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r * 0.8, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#58b368';
    ctx.fillRect(-r * 0.5, -r * 0.55, r * 0.35, r * 0.18);
    ctx.fillStyle = '#e8915a';
    ctx.fillRect(r * 0.1, -r * 0.5, r * 0.3, r * 0.16);
  } else if (ing === 'telur') {
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb52e';
    ctx.beginPath();
    ctx.arc(r * 0.1, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else if (ing === 'mie') {
    ctx.strokeStyle = '#f2b544';
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.arc(0, i * r * 0.45, r * 0.5, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  } else if (ing === 'ayam') {
    ctx.fillStyle = '#e8915a';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.1, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff3e0';
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.3);
    ctx.lineTo(r * 0.8, r * 0.8);
    ctx.stroke();
    ctx.fillStyle = '#fff3e0';
    ctx.beginPath();
    ctx.arc(r * 0.85, r * 0.85, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (ing === 'daging') {
    ctx.fillStyle = '#c65a4a';
    roundRect(ctx, -r * 0.9, -r * 0.55, r * 1.8, r * 1.1, r * 0.4);
    ctx.fill();
    ctx.fillStyle = '#e8a08f';
    ctx.fillRect(-r * 0.6, -r * 0.2, r * 1.2, r * 0.22);
  } else if (ing === 'sayur') {
    ctx.fillStyle = '#58b368';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse((i - 1) * r * 0.5, (i % 2) * r * 0.3 - r * 0.1, r * 0.42, r * 0.6, (i - 1) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2e7d3a';
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(0, r * 0.6);
    ctx.stroke();
  } else if (ing === 'kecap') {
    ctx.fillStyle = '#3a1e10';
    roundRect(ctx, -r * 0.35, -r * 0.4, r * 0.7, r * 1.1, r * 0.15);
    ctx.fill();
    ctx.fillStyle = '#5a3220';
    ctx.fillRect(-r * 0.18, -r * 0.95, r * 0.36, r * 0.6);
    ctx.fillStyle = '#ffd94d';
    ctx.fillRect(-r * 0.35, -r * 0.1, r * 0.7, r * 0.4);
  } else if (ing === 'bambu') {
    ctx.strokeStyle = '#d9b380';
    ctx.lineWidth = r * 0.2;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.4, -r * 0.9);
      ctx.lineTo(i * r * 0.4 + r * 0.15, r * 0.9);
      ctx.stroke();
    }
  } else if (ing === 'teh') {
    ctx.fillStyle = '#c97b2d';
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.7);
    ctx.lineTo(r * 0.6, -r * 0.7);
    ctx.lineTo(r * 0.4, r * 0.85);
    ctx.lineTo(-r * 0.4, r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ff5a3c';
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 0.6);
    ctx.lineTo(r * 0.35, -r * 1.05);
    ctx.stroke();
  } else if (ing === 'es') {
    ctx.fillStyle = '#bfe6f5';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.save();
    ctx.rotate(0.3);
    ctx.fillRect(-r * 0.7, -r * 0.7, r * 0.8, r * 0.8);
    ctx.strokeRect(-r * 0.7, -r * 0.7, r * 0.8, r * 0.8);
    ctx.restore();
    ctx.save();
    ctx.rotate(-0.25);
    ctx.fillRect(-r * 0.1, -r * 0.1, r * 0.8, r * 0.8);
    ctx.strokeRect(-r * 0.1, -r * 0.1, r * 0.8, r * 0.8);
    ctx.restore();
  }
  ctx.restore();
}

// Hidangan jadi di atas piring putih, digambar per resep supaya tiap menu
// terlihat berbeda dan "layak disajikan".
function drawDish(ctx, recipeId, x, y, r) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.15, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (recipeId === 'nasgor' || recipeId === 'nasgor-ayam') {
    drawIngredient(ctx, 'nasi', x - r * 0.2, y - r * 0.1, r * 0.55);
    drawIngredient(ctx, 'telur', x + r * 0.45, y - r * 0.3, r * 0.4);
    if (recipeId === 'nasgor-ayam') drawIngredient(ctx, 'ayam', x + r * 0.35, y + r * 0.35, r * 0.4);
    ctx.fillStyle = '#58b368';
    ctx.fillRect(x - r * 0.7, y + r * 0.35, r * 0.5, r * 0.14);
  } else if (recipeId === 'mie-goreng') {
    drawIngredient(ctx, 'mie', x, y, r * 0.6);
    drawIngredient(ctx, 'telur', x + r * 0.45, y - r * 0.35, r * 0.35);
    drawIngredient(ctx, 'sayur', x - r * 0.5, y + r * 0.3, r * 0.35);
  } else if (recipeId === 'sate') {
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x - r * 0.8, y + i * r * 0.35);
      ctx.lineTo(x + r * 0.8, y + i * r * 0.35);
      ctx.stroke();
    }
    drawIngredient(ctx, 'daging', x - r * 0.4, y - r * 0.3, r * 0.32);
    drawIngredient(ctx, 'daging', x + r * 0.2, y, r * 0.32);
    drawIngredient(ctx, 'daging', x - r * 0.1, y + r * 0.35, r * 0.32);
    ctx.fillStyle = '#5a3220';
    ctx.beginPath();
    ctx.ellipse(x + r * 0.45, y + r * 0.4, r * 0.35, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (recipeId === 'gado') {
    drawIngredient(ctx, 'sayur', x - r * 0.3, y - r * 0.15, r * 0.55);
    drawIngredient(ctx, 'telur', x + r * 0.4, y - r * 0.3, r * 0.35);
    ctx.fillStyle = '#c97b2d';
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.4, r * 0.6, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (recipeId === 'esteh') {
    drawIngredient(ctx, 'teh', x - r * 0.25, y, r * 0.6);
    drawIngredient(ctx, 'es', x + r * 0.45, y + r * 0.2, r * 0.35);
  }
}

function drawSkyAndLights(ctx, elapsed) {
  const g = ctx.createLinearGradient(0, 0, 0, 150);
  g.addColorStop(0, '#2b1a4d');
  g.addColorStop(0.55, '#7a2d5e');
  g.addColorStop(1, '#e86a3c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 150);
  // Matahari senja.
  ctx.fillStyle = '#ffb52e';
  ctx.beginPath();
  ctx.arc(1180, 96, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffdf8a';
  ctx.beginPath();
  ctx.arc(1180, 96, 24, 0, Math.PI * 2);
  ctx.fill();
  // Lampion.
  const lampColors = ['#ff5a3c', '#ffd94d', '#ff8a5a'];
  for (let i = 0; i < 3; i += 1) {
    const lx = 60 + i * 46;
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, 26);
    ctx.stroke();
    ctx.fillStyle = lampColors[i];
    ctx.beginPath();
    ctx.ellipse(lx, 44, 17, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(lx - 3, 22, 6, 5);
  }
  // String lights melengkung.
  const bulbColors = ['#ffd94d', '#ff5a3c', '#7fd4e8', '#bfe6a8'];
  for (let s = 0; s < 2; s += 1) {
    const x0 = 200 + s * 420;
    const x1 = x0 + 400;
    ctx.strokeStyle = '#1a1026';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, 6);
    ctx.quadraticCurveTo((x0 + x1) / 2, 44, x1, 6);
    ctx.stroke();
    for (let i = 0; i <= 8; i += 1) {
      const t = i / 8;
      const bx = x0 + (x1 - x0) * t;
      const yy = 6 + Math.sin(t * Math.PI) * 30;
      const glow = 0.75 + 0.25 * Math.sin(elapsed * 3 + i * 1.3 + s * 2);
      ctx.globalAlpha = glow;
      ctx.fillStyle = bulbColors[i % 4];
      ctx.beginPath();
      ctx.arc(bx, yy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

function drawFloor(ctx) {
  ctx.fillStyle = '#9c6a38';
  ctx.fillRect(0, 150, W, H - 150);
  ctx.fillStyle = '#8a5a2e';
  for (let y = 150; y < H; y += 48) ctx.fillRect(0, y, W, 24);
  ctx.strokeStyle = 'rgba(60,30,10,0.35)';
  ctx.lineWidth = 2;
  for (let y = 150; y < H; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let x = 0; x < W; x += 96) {
    ctx.beginPath();
    ctx.moveTo(x, 150);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  // Karpet merah jalur tengah.
  ctx.fillStyle = '#a83232';
  ctx.fillRect(0, 396, W, 74);
  ctx.fillStyle = '#c94f4f';
  ctx.fillRect(0, 396, W, 6);
  ctx.fillRect(0, 464, W, 6);
  ctx.fillStyle = '#ffd94d';
  for (let x = 40; x < W; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, 433);
    ctx.lineTo(x + 14, 419);
    ctx.lineTo(x + 28, 433);
    ctx.lineTo(x + 14, 447);
    ctx.closePath();
    ctx.fill();
  }
}

// Counter bawah dengan 10 bak bahan berlabel — "bahan di counter".
function drawCounter(ctx) {
  const ids = Object.keys(INGREDIENTS);
  const bw = 124;
  const gap = 4;
  ctx.fillStyle = '#5a3a1e';
  ctx.fillRect(0, 606, W, 114);
  ctx.fillStyle = '#7a4e28';
  ctx.fillRect(0, 606, W, 10);
  text(ctx, 'BAHAN', 14, 640, 'bold 17px Georgia, serif', '#ffe9a8');
  ids.forEach((id, i) => {
    const x = 76 + i * (bw + gap);
    roundRect(ctx, x, 622, bw, 82, 10);
    ctx.fillStyle = '#fff3d6';
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawIngredient(ctx, id, x + bw / 2, 654, 20);
    text(ctx, INGREDIENTS[id].name.toUpperCase(), x + bw / 2, 690, 'bold 14px Georgia, serif', '#5a3a1e', 'center');
  });
}

function drawStations(ctx, state) {
  for (const id of STATION_ORDER) {
    const s = STATIONS[id];
    const isNext = state.route[0] === id;
    // Meja stasiun.
    roundRect(ctx, s.x, s.y, s.w, s.h, 14);
    ctx.fillStyle = isNext ? '#fff3d6' : '#e8dcc0';
    ctx.fill();
    ctx.lineWidth = isNext ? 5 : 3;
    ctx.strokeStyle = isNext ? '#ff5a3c' : s.accent;
    ctx.stroke();
    // Label besar di atas meja.
    roundRect(ctx, s.x + 6, s.y + 6, s.w - 12, 34, 8);
    ctx.fillStyle = s.color;
    ctx.fill();
    text(ctx, s.name, s.x + s.w / 2, s.y + 24, 'bold 21px Georgia, serif', '#241a10', 'center');
    text(ctx, s.sub, s.x + s.w / 2, s.y + 128, '15px Georgia, serif', '#6a5a3a', 'center');

    if (id === 'fridge') {
      roundRect(ctx, s.x + 28, s.y + 48, 114, 66, 8);
      ctx.fillStyle = '#a8e2f0';
      ctx.fill();
      ctx.strokeStyle = '#2b7f9e';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s.x + 85, s.y + 48);
      ctx.lineTo(s.x + 85, s.y + 114);
      ctx.stroke();
      ctx.fillStyle = '#2b7f9e';
      ctx.fillRect(s.x + 74, s.y + 66, 5, 18);
      ctx.fillRect(s.x + 92, s.y + 66, 5, 18);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x + 52, s.y + 66, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (id === 'board') {
      roundRect(ctx, s.x + 22, s.y + 52, 126, 58, 10);
      ctx.fillStyle = '#c98f4e';
      ctx.fill();
      ctx.strokeStyle = '#8a5a2b';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (state.board.item) {
        drawIngredient(ctx, state.board.item.ing, s.x + 75, s.y + 80, 22);
        for (let i = 0; i < 3; i += 1) {
          ctx.fillStyle = i < state.board.hits ? '#e63b1e' : '#d9c9a8';
          ctx.beginPath();
          ctx.arc(s.x + 52 + i * 22, s.y + 100, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        text(ctx, 'POTONG ' + state.board.hits + '/3', s.x + s.w / 2, s.y + 118, 'bold 13px Georgia, serif', '#8a3b1e', 'center');
      } else {
        text(ctx, 'taruh bahan di sini', s.x + s.w / 2, s.y + 82, '15px Georgia, serif', '#8a6a3a', 'center');
      }
      // Pisau.
      ctx.fillStyle = '#d9d9d9';
      ctx.fillRect(s.x + 138, s.y + 56, 20, 8);
      ctx.fillStyle = '#5a3220';
      ctx.fillRect(s.x + 156, s.y + 56, 10, 8);
    } else if (id === 'wok') {
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(s.x + 20, s.y + 96, s.w - 40, 16);
      ctx.fillStyle = '#e63b1e';
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.arc(s.x + 44 + i * 34, s.y + 94, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.arc(s.x + s.w / 2, s.y + 78, 52, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      ctx.ellipse(s.x + s.w / 2, s.y + 78, 52, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      if (state.wok.item) {
        drawIngredient(ctx, state.wok.item.ing, s.x + s.w / 2, s.y + 74, 22);
        const frac = state.wok.done ? 1 : state.wok.t / 3.5;
        ctx.fillStyle = '#d9d9d9';
        ctx.fillRect(s.x + 30, s.y + 116, s.w - 60, 8);
        ctx.fillStyle = state.wok.done ? '#2e9e4f' : '#ff8a2a';
        ctx.fillRect(s.x + 30, s.y + 116, (s.w - 60) * frac, 8);
        if (!state.wok.done) {
          text(ctx, 'SIZZLE!', s.x + s.w / 2, s.y + 46, 'bold 22px Georgia, serif', '#ff5a3c', 'center');
        } else {
          text(ctx, 'MATANG! Ambil!', s.x + s.w / 2, s.y + 46, 'bold 18px Georgia, serif', '#2e9e4f', 'center');
        }
      } else {
        text(ctx, 'taruh bahan di sini', s.x + s.w / 2, s.y + 66, '15px Georgia, serif', '#8a6a3a', 'center');
      }
    } else if (id === 'plate') {
      if (state.plate.dish) {
        drawDish(ctx, state.plate.dish, s.x + s.w / 2, s.y + 84, 44);
        text(ctx, recipeById(state.plate.dish).name.toUpperCase() + ' SIAP!', s.x + s.w / 2, s.y + 46, 'bold 17px Georgia, serif', '#2e9e4f', 'center');
      } else if (state.plate.items.length > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(s.x + s.w / 2, s.y + 84, 50, 36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c9c9c9';
        ctx.lineWidth = 2;
        ctx.stroke();
        state.plate.items.forEach((ing, i) => {
          drawIngredient(ctx, ing, s.x + 48 + i * 38, s.y + 84, 16);
        });
        if (state.plate.wrong) {
          text(ctx, 'SALAH! Tekan E buang', s.x + s.w / 2, s.y + 46, 'bold 15px Georgia, serif', '#e63b1e', 'center');
        } else {
          text(ctx, 'di piring: ' + state.plate.items.length + ' bahan', s.x + s.w / 2, s.y + 46, '15px Georgia, serif', '#6a5a3a', 'center');
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(s.x + s.w / 2, s.y + 84, 50, 36, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c9c9c9';
        ctx.lineWidth = 2;
        ctx.stroke();
        text(ctx, 'piring kosong', s.x + s.w / 2, s.y + 84, '15px Georgia, serif', '#9a9a9a', 'center');
      }
    } else if (id === 'serve') {
      ctx.fillStyle = '#7a4e28';
      ctx.fillRect(s.x + 10, s.y + 44, s.w - 20, 10);
      ctx.fillStyle = '#fff3d6';
      ctx.fillRect(s.x + 10, s.y + 54, s.w - 20, 62);
      if (state.servedPlates.length === 0) {
        text(ctx, 'antar hidangan jadi ke sini', s.x + s.w / 2, s.y + 84, '16px Georgia, serif', '#8a6a3a', 'center');
      } else {
        state.servedPlates.forEach((dish, i) => {
          drawDish(ctx, dish, s.x + 60 + i * 120, s.y + 84, 30);
        });
        text(ctx, 'TERSAJI: ' + state.servedPlates.length + ' piring', s.x + s.w / 2, s.y + 46, 'bold 15px Georgia, serif', '#2e9e4f', 'center');
      }
    }
  }
}

// "Rute Terlihat": garis putus-putus bercahaya dari koki melewati stasiun
// sesuai urutan, dengan nomor besar di tiap pemberhentian + jejak langkah.
function drawRoute(ctx, state) {
  const route = state.route;
  if (!route || route.length === 0) return;
  for (const t of state.trail) {
    ctx.globalAlpha = Math.max(0, t.life / 1.4) * 0.5;
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.ellipse(t.x, t.y, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const points = [{ x: state.chef.x, y: state.chef.y + 18 }];
  for (const id of route) {
    const s = STATIONS[id];
    points.push({ x: s.standX, y: s.standY });
  }
  ctx.save();
  ctx.setLineDash([16, 12]);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ffe94d';
  ctx.shadowColor = '#ff9a2a';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
  ctx.restore();
  text(ctx, 'RUTE', points[0].x + 26, points[0].y - 8, 'bold 15px Georgia, serif', '#ffe94d');
  route.forEach((id, i) => {
    const s = STATIONS[id];
    const bx = s.standX;
    const by = s.standY + 30;
    ctx.fillStyle = '#ff5a3c';
    ctx.beginPath();
    ctx.arc(bx, by, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    text(ctx, String(i + 1), bx, by + 1, 'bold 20px Georgia, serif', '#ffffff', 'center');
  });
}

function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

// Order board: 3 tiket + timer besar + skor. Semua teks ≥2x ukuran normal
// supaya terbaca di contact sheet 768px.
function drawOrderBoard(ctx, state) {
  ctx.fillStyle = 'rgba(20, 8, 32, 0.55)';
  ctx.fillRect(0, 52, W, 96);
  const ticketW = 306;
  for (let i = 0; i < 3; i += 1) {
    const x = 16 + i * (ticketW + 10);
    const o = state.orders[i];
    roundRect(ctx, x, 58, ticketW, 84, 10);
    ctx.fillStyle = o ? '#fff8e6' : 'rgba(255, 248, 230, 0.25)';
    ctx.fill();
    if (!o) {
      text(ctx, '— menunggu pesanan —', x + ticketW / 2, 100, '18px Georgia, serif', '#ffe9a8', 'center');
      continue;
    }
    const recipe = recipeById(o.recipe);
    const frac = Math.max(0, o.patience / o.max);
    const urgent = o.patience < 10;
    const pulse = urgent ? 1 + 0.12 * Math.sin(state.elapsed * 10) : 1;
    text(ctx, '#' + o.id + '  ' + recipe.name.toUpperCase(), x + 12, 76, 'bold 21px Georgia, serif', '#2b1a4d');
    recipe.needs.forEach((ing, j) => {
      drawIngredient(ctx, ing, x + 26 + j * 44, 104, 13);
    });
    text(ctx, recipe.needs.map((id) => INGREDIENTS[id].name).join(' + '), x + 12, 126, '15px Georgia, serif', '#6a5a3a');
    ctx.fillStyle = '#d9d9d9';
    ctx.fillRect(x + 12, 136, ticketW - 24, 10);
    ctx.fillStyle = frac > 0.5 ? '#2e9e4f' : frac > 0.25 ? '#ff8a2a' : '#e63b1e';
    ctx.fillRect(x + 12, 136, (ticketW - 24) * frac, 10);
    ctx.save();
    ctx.translate(x + ticketW - 14, 100);
    ctx.scale(pulse, pulse);
    text(ctx, Math.ceil(o.patience) + ' dtk', 0, 0, 'bold 22px Georgia, serif', urgent ? '#e63b1e' : '#2b1a4d', 'right');
    ctx.restore();
  }
  // Timer besar di tengah atas + skor di kanan.
  text(ctx, 'PASAR MALAM RUSH', 16, 28, 'bold 26px Georgia, serif', '#ffe9a8');
  const lowTime = state.timeLeft < 30;
  ctx.save();
  if (lowTime) ctx.translate(640, 28);
  text(ctx, '⏱ ' + fmtTime(state.timeLeft), lowTime ? 0 : 640, lowTime ? 0 : 28, 'bold 44px Georgia, serif', lowTime ? '#ff6a5a' : '#ffffff', 'center');
  ctx.restore();
  text(ctx, 'SKOR ' + state.score, 1264, 22, 'bold 32px Georgia, serif', '#ffffff', 'right');
  const comboText = state.combo >= 2 ? 'KOMBO x' + (state.combo >= 3 ? 3 : 2) + '  •  ' : '';
  text(ctx, comboText + 'SAJI ' + state.served + '/' + 8, 1264, 48, 'bold 20px Georgia, serif', state.combo >= 2 ? '#ffd94d' : '#ffe9a8', 'right');
}

function drawChef(ctx, state) {
  const c = state.chef;
  ctx.save();
  ctx.translate(c.x, c.y);
  // Bayangan.
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Badan (jas koki putih + celemek merah).
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, -17, -6, 34, 30, 10);
  ctx.fill();
  ctx.fillStyle = '#e63b1e';
  ctx.fillRect(-12, 4, 24, 20);
  // Kepala + topi koki.
  ctx.fillStyle = '#f2c09a';
  ctx.beginPath();
  ctx.arc(0, -16, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, -14, -38, 28, 16, 7);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-8, -36, 8, 0, Math.PI * 2);
  ctx.arc(0, -40, 9, 0, Math.PI * 2);
  ctx.arc(8, -36, 8, 0, Math.PI * 2);
  ctx.fill();
  // Mata ke arah hadap.
  ctx.fillStyle = '#241a10';
  ctx.beginPath();
  ctx.arc(c.face * 4 - 4, -16, 2, 0, Math.PI * 2);
  ctx.arc(c.face * 4 + 4, -16, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Barang bawaan di atas kepala.
  c.carrying.forEach((it, i) => {
    const bx = c.x - (c.carrying.length - 1) * 18 + i * 36;
    const by = c.y - 56;
    ctx.fillStyle = 'rgba(255, 248, 230, 0.95)';
    ctx.beginPath();
    ctx.arc(bx, by, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (it.dish) drawDish(ctx, it.dish, bx, by, 13);
    else drawIngredient(ctx, it.ing, bx, by, 12);
  });
  text(ctx, 'KOKI — bawa ' + c.carrying.length + '/2', c.x, c.y + 38, 'bold 14px Georgia, serif', '#ffe9a8', 'center');
}

export function createRenderer(canvas) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  function draw(state, screen, best) {
    ctx.clearRect(0, 0, W, H);
    drawSkyAndLights(ctx, state.elapsed);
    drawFloor(ctx);
    drawRoute(ctx, state);
    drawStations(ctx, state);
    drawCounter(ctx);
    drawChef(ctx, state);
    for (const p of state.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const f of state.floats) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      text(ctx, f.text, f.x, f.y, 'bold 20px Georgia, serif', f.color, 'center');
    }
    ctx.globalAlpha = 1;
    drawOrderBoard(ctx, state);
    if (state.rushBanner > 0) {
      const a = Math.min(1, state.rushBanner);
      ctx.globalAlpha = a;
      roundRect(ctx, 440, 158, 400, 52, 12);
      ctx.fillStyle = '#e63b1e';
      ctx.fill();
      text(ctx, '⚡ RUSH HOUR! Pesanan makin cepat! ⚡', 640, 185, 'bold 24px Georgia, serif', '#ffffff', 'center');
      ctx.globalAlpha = 1;
    } else if (state.rush) {
      roundRect(ctx, 1064, 158, 200, 30, 8);
      ctx.fillStyle = '#e63b1e';
      ctx.fill();
      text(ctx, '⚡ RUSH HOUR', 1164, 174, 'bold 18px Georgia, serif', '#ffffff', 'center');
    }
    if (screen === SCREEN_TITLE) drawTitle(ctx, state, best);
    else if (screen === SCREEN_PAUSED) drawPaused(ctx);
    else if (screen === SCREEN_OVER) drawOver(ctx, state, best);
  }

  return { draw };
}
