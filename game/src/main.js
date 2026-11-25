// Pasar Malam Rush: Dapur Gerobak — boot dan loop utama. Dunia maju dalam
// langkah tetap 1/60 detik; input dibaca tiap frame; renderer melukis apa
// yang ada. Layar: judul, main, jeda, akhir.
//
// ?seed=N menetapkan urutan pesanan. ?shot=start|play|combo|end (dengan
// &seed=N) memanggung adegan itu, melukisnya dua kali, lalu menandai
// window.__shotReady untuk screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_WIN, EVENT_LOSE, EVENT_SCORE, EVENT_FAIL, EVENT_CHOP, EVENT_SIZZLE, EVENT_WRONG, EVENT_COOK_DONE } from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, ACTION_INTERACT, ACTION_DUMP, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
// Diekspos untuk playtest otomatis (CDP): membaca state, bukan mengubah aturan.
window.__world = world;
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Penyimpanan bisa mati (jendela privat): skor terbaik lalu hanya seumur kunjungan.
  }
}

function shotInfo() {
  const s = world.state;
  return 'shot=' + (shot || 'none') + ' seed=' + seed + ' score=' + s.score + ' served=' + s.served + ' combo=' + s.combo + ' bestCombo=' + s.bestCombo + ' failed=' + s.failed + ' over=' + s.over + ' won=' + s.won + ' orders=' + s.orders.length + ' timeLeft=' + Math.round(s.timeLeft);
}

function runShot(name) {
  const scene = stageShot(name, world);
  status.textContent = shotInfo();
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, world);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    audio.unlock();
    announce('Main. Sajikan 6 hidangan sebelum waktu habis.');
  }

  function endGame(won) {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    if (won) audio.win();
    else audio.lose();
    announce((won ? 'Menang. ' : 'Kalah. ') + 'Skor ' + world.state.score + '. Terbaik ' + best + '.');
  }

  // Aksi dibaca sekali per frame di frame() lalu diteruskan ke step(),
  // supaya satu tekanan tombol tidak hilang tertelan dua kali baca.
  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) startGame();
    else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Main.');
    }
    return actions;
  }

  function step(actions) {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, { x: 0, y: 0 }, null, false);
      return;
    }
    const dir = input.direction();
    const arrived = input.arrivedStation();
    let interactId = arrived;
    if (actions & ACTION_INTERACT) {
      interactId = world.nearestStation(world.state.chef.x, world.state.chef.y);
    }
    const events = world.step(STEP, dir, interactId, Boolean(actions & ACTION_DUMP));
    if (events & EVENT_SCORE) audio.serve();
    if (events & EVENT_CHOP) audio.chop();
    if (events & EVENT_SIZZLE) audio.sizzleStart();
    if (events & EVENT_WRONG) audio.wrong();
    if (events & EVENT_COOK_DONE) audio.take();
    if (events & EVENT_WIN) endGame(true);
    else if (events & EVENT_LOSE) endGame(false);
    else if (events & EVENT_FAIL) announce('Satu pesanan hangus. ' + world.state.failed + ' gagal.');
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const actions = handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      let first = true;
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step(first ? actions : 0);
        first = false;
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    }
  });

  announce('Pasar Malam Rush. Tekan Spasi atau klik untuk mulai.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
