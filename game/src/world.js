// Pasar Malam Rush — state dan aturan. Tidak ada gambar atau suara di sini:
// file ini hanya menjawab "apa yang terjadi bila koki melakukan X", supaya
// permainan asli, autopilot screenshot, dan playtest semuanya memakai aturan
// yang sama persis.
import {
  W, H, STEP, GAME_TIME, WIN_SERVES, MAX_FAILS, CARRY_MAX, ORDER_MAX,
  PATIENCE, RUSH_AT, COOK_TIME, CHOP_HITS, CHEF_SPEED, STATIONS,
  INGREDIENTS, RECIPES, recipeById, RECIPE_CYCLE,
} from './config.js';

export const EVENT_NONE = 0;
export const EVENT_SCORE = 1;
export const EVENT_FAIL = 2;
export const EVENT_WIN = 4;
export const EVENT_LOSE = 8;
export const EVENT_CHOP = 16;
export const EVENT_COOK_DONE = 32;
export const EVENT_WRONG = 64;
export const EVENT_TAKE = 128;
export const EVENT_SIZZLE = 256;

const SPAWN_EASY = 14;
const SPAWN_RUSH = 8;

function newItem(ing) {
  return { ing, doneSteps: 0 };
}

function itemDone(item) {
  return item.doneSteps >= INGREDIENTS[item.ing].steps.length;
}

function itemNextStep(item) {
  return INGREDIENTS[item.ing].steps[item.doneSteps] || null;
}

function sortedIds(ids) {
  return [...ids].sort().join(',');
}

function matchRecipe(ids) {
  const key = sortedIds(ids);
  return RECIPES.find((r) => sortedIds(r.needs) === key) || null;
}

function isSubsetOfSomeRecipe(ids) {
  return RECIPES.some((r) => {
    const rest = [...r.needs];
    return ids.every((id) => {
      const i = rest.indexOf(id);
      if (i === -1) return false;
      rest.splice(i, 1);
      return true;
    });
  });
}

export function createWorld(rng) {
  const state = {
    rng,
    chef: { x: 640, y: 500, tx: 640, ty: 500, carrying: [], face: 1 },
    plate: { items: [], dish: null, wrong: false },
    wok: { item: null, t: 0, done: false },
    board: { item: null, hits: 0 },
    orders: [],
    orderSeq: 0,
    spawnIn: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    failed: 0,
    timeLeft: GAME_TIME,
    elapsed: 0,
    rush: false,
    rushBanner: 0,
    won: false,
    over: false,
    overReason: '',
    particles: [],
    trail: [],
    trailIn: 0,
    floats: [],
    servedPlates: [],
    cooldown: 0,
    sizzle: 0,
    route: [],
  };

  function spawnOrder() {
    if (state.orders.length >= ORDER_MAX) return;
    const recipe = RECIPE_CYCLE[state.orderSeq % RECIPE_CYCLE.length];
    state.orderSeq += 1;
    const patience = state.rush ? PATIENCE - 10 : PATIENCE;
    state.orders.push({ id: state.orderSeq, recipe, patience, max: patience });
  }

  function reset() {
    state.chef = { x: 640, y: 500, tx: 640, ty: 500, carrying: [], face: 1 };
    state.plate = { items: [], dish: null, wrong: false };
    state.wok = { item: null, t: 0, done: false };
    state.board = { item: null, hits: 0 };
    state.orders = [];
    state.orderSeq = 0;
    state.spawnIn = 0;
    state.score = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.served = 0;
    state.failed = 0;
    state.timeLeft = GAME_TIME;
    state.elapsed = 0;
    state.rush = false;
    state.rushBanner = 0;
    state.won = false;
    state.over = false;
    state.overReason = '';
    state.particles = [];
    state.trail = [];
    state.trailIn = 0;
    state.floats = [];
    state.servedPlates = [];
    state.cooldown = 0;
    state.sizzle = 0;
    state.route = [];
    spawnOrder();
  }

  function burst(x, y, color, n, speed) {
    for (let i = 0; i < n; i += 1) {
      const a = state.rng.next() * Math.PI * 2;
      const v = speed * (0.4 + state.rng.next() * 0.8);
      state.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, life: 0.5 + state.rng.next() * 0.4, max: 0.9, color, size: 3 + state.rng.next() * 4 });
    }
  }

  function floatText(x, y, text, color) {
    state.floats.push({ x, y, text, color, life: 1.2 });
  }

  // Bahan mentah yang masih kurang untuk order tertua, setelah dikurangi
  // semua yang sudah ada di piring, dibawa, atau sedang diolah.
  function missingFor(order) {
    const need = [...recipeById(order.recipe).needs];
    const covered = [];
    for (const id of state.plate.items) covered.push(id);
    for (const it of state.chef.carrying) if (it.ing) covered.push(it.ing);
    if (state.wok.item) covered.push(state.wok.item.ing);
    if (state.board.item) covered.push(state.board.item.ing);
    for (const id of covered) {
      const i = need.indexOf(id);
      if (i !== -1) need.splice(i, 1);
    }
    return need;
  }

  // Rute optimal untuk order tertua: urutan stasiun yang harus dikunjungi.
  // Inilah "Rute Terlihat": daftar ini yang digambar bernomor di lantai.
  function planRoute() {
    const chef = state.chef;
    const dish = chef.carrying.find((it) => it.dish);
    if (dish) return ['serve'];
    if (state.plate.wrong) return ['plate'];
    if (state.plate.dish) return ['plate', 'serve'];
    const order = state.orders[0];
    if (!order) return ['fridge'];
    const missing = missingFor(order);
    if (missing.length === 0) return ['plate', 'serve'];
    const ing = missing[0];
    const carried = chef.carrying.find((it) => it.ing === ing);
    const chain = [];
    if (!carried) chain.push('fridge');
    else {
      const next = itemNextStep(carried);
      if (next === 'chop') chain.push('board');
      if (next === 'cook' || (next === null && false)) chain.push('wok');
      if (carried && itemNextStep(carried) === 'chop') chain.push('wok');
    }
    if (!carried) {
      const steps = INGREDIENTS[ing].steps;
      if (steps.includes('chop')) chain.push('board');
      if (steps.includes('cook')) chain.push('wok');
    }
    chain.push('plate', 'serve');
    return [...new Set(chain)];
  }

  function nearestStation(x, y) {
    let best = null;
    let bestD = 1e9;
    for (const id of Object.keys(STATIONS)) {
      const s = STATIONS[id];
      const cx = s.x + s.w / 2;
      const cy = s.y + s.h / 2;
      const d = Math.hypot(x - cx, y - cy);
      if (d < bestD) {
        bestD = d;
        best = id;
      }
    }
    return bestD < 170 ? best : null;
  }

  // Satu aksi di stasiun. Dipanggil pemain (tombol E / klik stasiun) dan
  // autopilot dengan cara yang sama — tidak ada jalan pintas.
  function interact(stationId) {
    if (state.over || state.cooldown > 0) return EVENT_NONE;
    const chef = state.chef;
    const s = STATIONS[stationId];
    if (!s) return EVENT_NONE;
    if (Math.hypot(chef.x - s.standX, chef.y - s.standY) > 130) return EVENT_NONE;
    let ev = EVENT_NONE;
    state.cooldown = 0.3;

    if (stationId === 'fridge') {
      if (chef.carrying.length >= CARRY_MAX) return EVENT_NONE;
      const order = state.orders[0];
      let ing = 'nasi';
      if (order) {
        const missing = missingFor(order);
        if (missing.length > 0) ing = missing[0];
      }
      chef.carrying.push(newItem(ing));
      floatText(chef.x, chef.y - 46, '+' + INGREDIENTS[ing].name, '#ffe9a8');
      return EVENT_TAKE;
    }

    if (stationId === 'board') {
      if (state.board.item) {
        state.board.hits += 1;
        const b = STATIONS.board;
        burst(b.x + b.w / 2, b.y + b.h / 2, '#bfe6a8', 8, 90);
        floatText(b.x + b.w / 2, b.y - 8, 'TOK! ' + state.board.hits + '/' + CHOP_HITS, '#ffffff');
        ev = EVENT_CHOP;
        if (state.board.hits >= CHOP_HITS) {
          const done = state.board.item;
          done.doneSteps += 1;
          state.board.item = null;
          state.board.hits = 0;
          if (chef.carrying.length < CARRY_MAX) {
            chef.carrying.push(done);
            floatText(chef.x, chef.y - 46, INGREDIENTS[done.ing].name + ' dipotong', '#bfe6a8');
          }
        }
        return ev;
      }
      const idx = chef.carrying.findIndex((it) => it.ing && itemNextStep(it) === 'chop');
      if (idx !== -1) {
        state.board.item = chef.carrying.splice(idx, 1)[0];
        state.board.hits = 0;
        return EVENT_TAKE;
      }
      return EVENT_NONE;
    }

    if (stationId === 'wok') {
      if (state.wok.item && state.wok.done) {
        const done = state.wok.item;
        state.wok.item = null;
        state.wok.done = false;
        if (chef.carrying.length < CARRY_MAX) {
          chef.carrying.push(done);
          floatText(chef.x, chef.y - 46, INGREDIENTS[done.ing].name + ' matang!', '#ffd94d');
          return EVENT_TAKE;
        }
        state.wok.item = done;
        state.wok.done = true;
        return EVENT_NONE;
      }
      if (!state.wok.item) {
        const idx = chef.carrying.findIndex((it) => it.ing && itemNextStep(it) === 'cook');
        if (idx !== -1) {
          state.wok.item = chef.carrying.splice(idx, 1)[0];
          state.wok.t = 0;
          state.wok.done = false;
          state.sizzle = 1;
          return EVENT_SIZZLE;
        }
      }
      return EVENT_NONE;
    }

    if (stationId === 'plate') {
      if (state.plate.wrong) {
        state.plate.items = [];
        state.plate.wrong = false;
        floatText(STATIONS.plate.x + 85, STATIONS.plate.y - 8, 'Dibuang!', '#ff9a9a');
        return EVENT_WRONG;
      }
      if (state.plate.dish) {
        if (chef.carrying.length < CARRY_MAX) {
          chef.carrying.push({ dish: state.plate.dish });
          state.plate.dish = null;
          state.plate.items = [];
          floatText(chef.x, chef.y - 46, 'Hidangan siap!', '#ffe9a8');
          return EVENT_TAKE;
        }
        return EVENT_NONE;
      }
      const idx = chef.carrying.findIndex((it) => it.ing && itemDone(it));
      if (idx !== -1) {
        const it = chef.carrying.splice(idx, 1)[0];
        state.plate.items.push(it.ing);
        const recipe = matchRecipe(state.plate.items);
        if (recipe) {
          state.plate.dish = recipe.id;
          floatText(STATIONS.plate.x + 85, STATIONS.plate.y - 8, recipe.name + ' jadi!', '#ffe9a8');
          burst(STATIONS.plate.x + 85, STATIONS.plate.y + 60, '#ffd94d', 14, 120);
        } else if (!isSubsetOfSomeRecipe(state.plate.items)) {
          state.plate.wrong = true;
          floatText(STATIONS.plate.x + 85, STATIONS.plate.y - 8, 'Kombinasi salah!', '#ff9a9a');
          return EVENT_WRONG;
        }
        return EVENT_TAKE;
      }
      return EVENT_NONE;
    }

    if (stationId === 'serve') {
      const idx = chef.carrying.findIndex((it) => it.dish);
      if (idx === -1) return EVENT_NONE;
      const dish = chef.carrying[idx].dish;
      const orderIdx = state.orders.findIndex((o) => o.recipe === dish);
      if (orderIdx === -1) {
        state.combo = 0;
        floatText(STATIONS.serve.x + 194, STATIONS.serve.y - 8, 'Tidak ada yang pesan ini!', '#ff9a9a');
        return EVENT_WRONG;
      }
      chef.carrying.splice(idx, 1);
      const order = state.orders.splice(orderIdx, 1)[0];
      const recipe = recipeById(dish);
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      const mult = state.combo >= 3 ? 3 : state.combo >= 2 ? 2 : 1;
      const points = recipe.price * mult;
      state.score += points;
      state.served += 1;
      state.servedPlates.unshift(dish);
      if (state.servedPlates.length > 3) state.servedPlates.pop();
      const w = STATIONS.serve;
      burst(w.x + w.w / 2, w.y + w.h / 2, '#ffd94d', 18, 150);
      floatText(w.x + w.w / 2, w.y - 8, '+' + points + (mult > 1 ? '  KOMBO x' + mult + '!' : ''), '#ffe9a8');
      if (state.served >= WIN_SERVES) {
        state.won = true;
        state.over = true;
        state.overReason = 'win';
        return EVENT_SCORE | EVENT_WIN;
      }
      return EVENT_SCORE;
    }
    return ev;
  }

  function step(dt, move, interactId, dump) {
    if (state.over) return EVENT_NONE;
    let ev = EVENT_NONE;
    state.elapsed += dt;
    state.timeLeft = Math.max(0, GAME_TIME - state.elapsed);
    state.cooldown = Math.max(0, state.cooldown - dt);
    if (!state.rush && state.elapsed >= RUSH_AT) {
      state.rush = true;
      state.rushBanner = 3;
    }
    state.rushBanner = Math.max(0, state.rushBanner - dt);
    state.sizzle = Math.max(0, state.sizzle - dt);

    // Gerakan koki: tombol arah, atau klik-ke-tujuan bila tidak ada tombol.
    const chef = state.chef;
    let mx = 0;
    let my = 0;
    if (move && (move.x !== 0 || move.y !== 0)) {
      mx = move.x;
      my = move.y;
      chef.tx = chef.x;
      chef.ty = chef.y;
    } else {
      const dx = chef.tx - chef.x;
      const dy = chef.ty - chef.y;
      const d = Math.hypot(dx, dy);
      if (d > 6) {
        mx = dx / d;
        my = dy / d;
      }
    }
    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my) || 1;
      chef.x = Math.min(W - 24, Math.max(24, chef.x + (mx / len) * CHEF_SPEED * dt));
      chef.y = Math.min(596, Math.max(168, chef.y + (my / len) * CHEF_SPEED * dt));
      if (mx < -0.1) chef.face = -1;
      else if (mx > 0.1) chef.face = 1;
      state.trailIn -= dt;
      if (state.trailIn <= 0) {
        state.trailIn = 0.12;
        state.trail.push({ x: chef.x, y: chef.y + 16, life: 1.4 });
        if (state.trail.length > 46) state.trail.shift();
      }
    }
    for (const t of state.trail) t.life -= dt;
    state.trail = state.trail.filter((t) => t.life > 0);

    if (interactId) ev |= interact(interactId);
    if (dump && state.plate.items.length > 0 && !state.plate.dish) {
      state.plate.items = [];
      state.plate.wrong = false;
      ev |= EVENT_WRONG;
    }

    // Wajan memasak: uap naik, lalu matang.
    if (state.wok.item && !state.wok.done) {
      state.wok.t += dt;
      if (state.rng.next() < 0.35) {
        const w = STATIONS.wok;
        state.particles.push({ x: w.x + w.w / 2 + (state.rng.next() - 0.5) * 70, y: w.y + 50, vx: (state.rng.next() - 0.5) * 12, vy: -55 - state.rng.next() * 30, life: 0.9, max: 0.9, color: '#e8e8e8', size: 5 + state.rng.next() * 6 });
      }
      if (state.wok.t >= COOK_TIME) {
        state.wok.done = true;
        state.wok.item.doneSteps += 1;
        floatText(STATIONS.wok.x + 95, STATIONS.wok.y - 8, 'SIZZLE! Matang!', '#ffd94d');
        ev |= EVENT_COOK_DONE;
      }
    }
    for (const p of state.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 12 * dt;
      p.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
    for (const f of state.floats) {
      f.y -= 26 * dt;
      f.life -= dt;
    }
    state.floats = state.floats.filter((f) => f.life > 0);

    // Order baru, makin cepat saat rush hour.
    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      spawnOrder();
      state.spawnIn = state.rush ? SPAWN_RUSH : SPAWN_EASY;
    }
    for (const o of state.orders) o.patience -= dt;
    const expired = state.orders.filter((o) => o.patience <= 0);
    if (expired.length > 0) {
      state.orders = state.orders.filter((o) => o.patience > 0);
      state.failed += expired.length;
      state.combo = 0;
      floatText(640, 170, 'Pesanan hangus! -' + expired.length, '#ff9a9a');
      ev |= EVENT_FAIL;
      if (state.failed >= MAX_FAILS) {
        state.won = false;
        state.over = true;
        state.overReason = 'fails';
        return ev | EVENT_LOSE;
      }
    }

    if (state.timeLeft <= 0) {
      state.won = state.served >= WIN_SERVES;
      state.over = true;
      state.overReason = state.won ? 'win' : 'time';
      return ev | (state.won ? EVENT_WIN : EVENT_LOSE);
    }

    state.route = planRoute();
    return ev;
  }

  return { state, reset, step, interact, planRoute, nearestStation, missingFor };
}
