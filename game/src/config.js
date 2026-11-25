// Pasar Malam Rush: Dapur Gerobak — angka dan data statis permainan.
// Satu-satunya tempat ukuran layar, stasiun, bahan, dan resep didefinisikan,
// supaya world.js, render.js, dan shots.js semuanya membaca tabel yang sama.

export const W = 1280;
export const H = 720;
export const STEP = 1 / 60;
export const BEST_KEY = 'pasar-malam-rush-best';

export const GAME_TIME = 180;
export const WIN_SERVES = 6;
export const MAX_FAILS = 3;
export const CARRY_MAX = 2;
export const ORDER_MAX = 3;
export const PATIENCE = 55;
export const RUSH_AT = 60;
export const COOK_TIME = 2.5;
export const CHOP_HITS = 3;
export const CHEF_SPEED = 380;

// Stasiun dapur, satu baris di tengah layar. standX/standY adalah titik tempat
// koki berdiri saat memakai stasiun itu (tepat di bawah meja stasiun).
export const STATIONS = {
  fridge: { id: 'fridge', name: 'KULKAS', sub: 'ambil bahan', x: 36, y: 196, w: 170, h: 148, standX: 121, standY: 372, color: '#7fd4e8', accent: '#2b7f9e' },
  board: { id: 'board', name: 'TALENAN', sub: 'potong 3x', x: 236, y: 196, w: 170, h: 148, standX: 321, standY: 372, color: '#e8c07f', accent: '#9e6b2b' },
  wok: { id: 'wok', name: 'WAJAN', sub: 'masak 2,5 dtk', x: 436, y: 196, w: 190, h: 148, standX: 531, standY: 372, color: '#e88a5a', accent: '#9e3d1e' },
  plate: { id: 'plate', name: 'PIRING', sub: 'rakit hidangan', x: 656, y: 196, w: 170, h: 148, standX: 741, standY: 372, color: '#f2f2f2', accent: '#7a7a7a' },
  serve: { id: 'serve', name: 'JENDELA SAJI', sub: 'antar pesanan', x: 856, y: 196, w: 388, h: 148, standX: 1050, standY: 372, color: '#ffd94d', accent: '#9e7b00' },
};
export const STATION_ORDER = ['fridge', 'board', 'wok', 'plate', 'serve'];

// Bahan. steps adalah urutan pengolahan yang wajib dilalui sebelum bahan
// boleh masuk piring: chop dulu di talenan, lalu cook di wajan. Bahan tanpa
// steps langsung siap (kecap, bambu, teh, es).
export const INGREDIENTS = {
  nasi: { name: 'Nasi', color: '#ffd94d', steps: ['cook'] },
  telur: { name: 'Telur', color: '#fff3c4', steps: ['cook'] },
  mie: { name: 'Mie', color: '#f2b544', steps: ['cook'] },
  ayam: { name: 'Ayam', color: '#e8915a', steps: ['chop', 'cook'] },
  daging: { name: 'Daging', color: '#c65a4a', steps: ['chop', 'cook'] },
  sayur: { name: 'Sayur', color: '#58b368', steps: ['chop'] },
  kecap: { name: 'Kecap', color: '#5a3220', steps: [] },
  bambu: { name: 'Bambu', color: '#d9b380', steps: [] },
  teh: { name: 'Teh', color: '#c97b2d', steps: [] },
  es: { name: 'Es', color: '#bfe6f5', steps: [] },
};

// Enam resep kombinasi. Harga dasar dikali multiplier kombo saat disajikan.
export const RECIPES = [
  { id: 'nasgor', name: 'Nasi Goreng', needs: ['nasi', 'telur', 'kecap'], price: 120 },
  { id: 'nasgor-ayam', name: 'Nasi Goreng Ayam', needs: ['nasi', 'telur', 'kecap', 'ayam'], price: 180 },
  { id: 'mie-goreng', name: 'Mie Goreng', needs: ['mie', 'telur', 'sayur'], price: 150 },
  { id: 'sate', name: 'Sate Ayam', needs: ['daging', 'bambu', 'kecap'], price: 170 },
  { id: 'gado', name: 'Gado-Gado', needs: ['sayur', 'telur', 'kecap'], price: 140 },
  { id: 'esteh', name: 'Es Teh', needs: ['teh', 'es'], price: 60 },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

// Urutan resep yang dipakai pemuncul order: diacak dengan seed, jadi tiap
// permainan (dan tiap screenshot dengan seed yang sama) memesan menu yang sama.
export const RECIPE_CYCLE = ['nasgor', 'mie-goreng', 'sate', 'nasgor-ayam', 'gado', 'esteh'];
