// Input pemain: WASD/panah untuk jalan, E atau Spasi untuk memakai stasiun,
// klik untuk jalan ke titik itu (klik stasiun = jalan lalu pakai otomatis),
// P jeda, Q buang isi piring, Enter mulai/ulang.
import { STATIONS } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_INTERACT = 4;
export const ACTION_DUMP = 8;

export function createInput(canvas, world) {
  const keys = new Set();
  let actions = 0;
  let pendingStation = null;

  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (k === ' ' || k === 'enter') actions |= ACTION_CONFIRM;
    if (k === 'e' || k === ' ') actions |= ACTION_INTERACT;
    if (k === 'p' || k === 'escape') actions |= ACTION_PAUSE;
    if (k === 'q') actions |= ACTION_DUMP;
    keys.add(k);
  }
  function onKeyUp(e) {
    keys.delete(e.key.toLowerCase());
  }
  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
  }
  function onPointer(e) {
    const p = canvasPoint(e);
    const chef = world.state.chef;
    chef.tx = p.x;
    chef.ty = p.y;
    pendingStation = null;
    for (const id of Object.keys(STATIONS)) {
      const s = STATIONS[id];
      if (p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h) {
        pendingStation = id;
        chef.tx = s.standX;
        chef.ty = s.standY;
        break;
      }
    }
    actions |= ACTION_CONFIRM;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointer);

  function direction() {
    let x = 0;
    let y = 0;
    if (keys.has('a') || keys.has('arrowleft')) x -= 1;
    if (keys.has('d') || keys.has('arrowright')) x += 1;
    if (keys.has('w') || keys.has('arrowup')) y -= 1;
    if (keys.has('s') || keys.has('arrowdown')) y += 1;
    return { x, y };
  }

  function takeActions() {
    const out = actions;
    actions = 0;
    return out;
  }

  // Bila pemain mengklik stasiun dan koki sudah sampai, pakai stasiun itu.
  function arrivedStation() {
    if (!pendingStation) return null;
    const s = STATIONS[pendingStation];
    const chef = world.state.chef;
    if (Math.hypot(chef.x - s.standX, chef.y - s.standY) < 46) {
      const id = pendingStation;
      pendingStation = null;
      return id;
    }
    return null;
  }

  return { direction, takeActions, arrivedStation };
}
