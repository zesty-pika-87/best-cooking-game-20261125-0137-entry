// Adegan screenshot: tiap adegan memainkan ATURAN ASLI maju dari world baru
// dengan seed tetap, digerakkan autopilot yang membaca rute optimal — jadi
// frame-nya adalah permainan sungguhan, dan seed yang sama selalu memberi
// frame yang sama.
import { STEP, STATIONS } from './config.js';
import { EVENT_WIN, EVENT_LOSE } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 62;
const COMBO_SECONDS = 110;
const END_LIMIT_SECONDS = 240;

// Autopilot: ikuti rute optimal. Berdiri di titik stasiun pertama rute,
// lalu pakai stasiun itu sampai langkah berikutnya berubah. Di wajan, tunggu
// sampai matang; di talenan, ketuk sampai 3/3.
function autopilot(state, world) {
  const route = world.planRoute();
  const first = route[0];
  if (!first) return { x: 0, y: 0, interact: null };
  const s = STATIONS[first];
  const chef = state.chef;
  const dx = s.standX - chef.x;
  const dy = s.standY - chef.y;
  const d = Math.hypot(dx, dy);
  if (d > 40) return { x: dx / d, y: dy / d, interact: null };
  return { x: 0, y: 0, interact: first };
}

function playFor(world, seconds, pilot) {
  let events = 0;
  const steps = Math.floor(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    const move = pilot ? pilot(world.state, world) : { x: 0, y: 0, interact: null };
    events = world.step(STEP, { x: move.x, y: move.y }, move.interact, false);
    if (events & (EVENT_WIN | EVENT_LOSE)) break;
  }
  return events;
}

// Atur world ke adegan bernama dan kembalikan layar + skor terbaik untuk digambar.
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'combo' && name !== 'end') {
    playFor(world, START_SECONDS, null);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'end') {
    // Koki diam di tempat: pesanan hangus satu demi satu sampai kalah.
    playFor(world, END_LIMIT_SECONDS, null);
    return { screen: SCREEN_OVER, best: world.state.score };
  }
  const seconds = name === 'combo' ? COMBO_SECONDS : PLAY_SECONDS;
  playFor(world, seconds, autopilot);
  const over = world.state.over;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.score };
}
