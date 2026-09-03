// Deterministic seeded random number generator (Mulberry32)
function createRng(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function pickWeighted(rng, items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randomFloat(rng, min, max, decimals = 1) {
  return parseFloat((rng() * (max - min) + min).toFixed(decimals));
}

function generateId(prefix, index) {
  return `${prefix}${String(index).padStart(5, '0')}`;
}

function generateDate(rng, daysAgo = 30) {
  const now = new Date();
  const offset = Math.floor(rng() * daysAgo * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - offset);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addSeconds(date, seconds) {
  return new Date(date.getTime() + seconds * 1000);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

module.exports = {
  createRng,
  pick,
  pickWeighted,
  randomInt,
  randomFloat,
  generateId,
  generateDate,
  addMinutes,
  addSeconds,
  addDays,
};
