import { COLS, ROWS } from "../engine/const";
import type { IslandShape } from "../engine/types";

export function islandMask(shape: IslandShape): boolean[][] {
  const land = (x: number, z: number): boolean => {
    const nx = x + 0.5;
    const nz = z + 0.5;
    if (shape === "block") return true;
    if (shape === "blob") return ellipse(nx, nz, 5.6, 3.6, 5.3, 3.35);
    if (shape === "crescent") {
      return ellipse(nx, nz, 5.4, 3.5, 5.5, 3.3) && !ellipse(nx, nz, 8.6, 5.6, 3.4, 2.5);
    }
    if (shape === "twin") {
      const left = ellipse(nx, nz, 3.1, 3.6, 2.55, 2.7);
      const right = ellipse(nx, nz, 8.9, 3.5, 2.55, 2.7);
      const bridge = nx >= 4.6 && nx <= 7.4 && nz >= 3.1 && nz <= 4.6;
      return left || right || bridge;
    }
    if (shape === "pier") {
      const spine = nx >= 5.1 && nx <= 6.9;
      const cross = nz >= 2.6 && nz <= 4.6 && nx >= 1.4 && nx <= 10.6;
      const dock = nz >= 5.6 && nz <= 7.2 && nx >= 3.2 && nx <= 8.8;
      return spine || cross || dock;
    }
    if (shape === "atoll") {
      return ellipse(nx, nz, 5.7, 3.6, 5.4, 3.4) && !ellipse(nx, nz, 5.7, 3.6, 2.5, 1.45);
    }
    if (shape === "ridge") {
      const along = Math.abs(nx - 2.2 - nz * 1.05);
      return along < 2.15 && nx > 0.8 && nx < 11.2 && nz > 0.4 && nz < 7.4;
    }
    if (shape === "steps") {
      const left = 1.2 + nz * 0.55;
      return nx >= left && nx <= left + 4.3 && nz > 0.3 && nz < 7.6;
    }
    if (shape === "courtyard") {
      const yard = nx >= 1.3 && nx <= 10.6 && nz >= 0.8 && nz <= 6.8;
      const pond = nx >= 4.2 && nx <= 7.6 && nz >= 2.2 && nz <= 4.8;
      return yard && !pond;
    }
    if (shape === "bay") {
      const shore = nx >= 1.2 && nx <= 10.6 && nz >= 0.6 && nz <= 6.9;
      const mouth = nx >= 3.4 && nx <= 8.4 && nz >= 3.1;
      return shore && !mouth;
    }
    if (shape === "fork") {
      const spine = nx >= 0.8 && nx <= 2.8;
      const finger = (z0: number) => nz >= z0 && nz < z0 + 1.35 && nx >= 1.2 && nx <= 10.6;
      return spine || finger(0.4) || finger(3.05) || finger(5.6);
    }
    if (shape === "causeway") {
      const road = nz >= 3.05 && nz <= 4.7 && nx >= 0.6 && nx <= 11.2;
      const bulb = ellipse(nx, nz, 9.2, 3.8, 2.4, 2.5);
      return road || bulb;
    }
    if (shape === "comb") {
      const spine = nx >= 1.1 && nx <= 3.1 && nz >= 0.5 && nz <= 7.2;
      const tooth = (z0: number) => nz >= z0 && nz < z0 + 1.05 && nx >= 2.4 && nx <= 10.2;
      return spine || tooth(0.7) || tooth(2.6) || tooth(4.5) || tooth(6.2);
    }
    const west = ellipse(nx, nz, 3.3, 4.1, 2.9, 2.9);
    const east = ellipse(nx, nz, 8.4, 3.0, 3.1, 2.7);
    return west || east;
  };

  return Array.from({ length: ROWS }, (_, z) =>
    Array.from({ length: COLS }, (_, x) => land(x, z)),
  );
}

export function isLand(shape: IslandShape, x: number, z: number): boolean {
  if (x < 0 || z < 0 || x >= COLS || z >= ROWS) return false;
  return islandMask(shape)[z]![x]!;
}

/** A shore cell on the west side, used for the crowd. */
export function anchor(shape: IslandShape): { x: number; z: number } {
  const mask = islandMask(shape);
  let best = { x: 1, z: 3, score: 999 };
  for (let z = 0; z < ROWS; z++) {
    for (let x = 0; x < COLS; x++) {
      if (!mask[z]![x]) continue;
      const score = x * 3 + Math.abs(z - 3.5);
      if (score < best.score) best = { x, z, score };
    }
  }
  return { x: best.x, z: best.z };
}

export function cssColor(hex: number): string {
  return `#${hex.toString(16).padStart(6, "0")}`;
}

type RGB = [number, number, number];

function rgbOf(hex: number): RGB {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function cssRgb(c: RGB): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${h(c[0])}${h(c[1])}${h(c[2])}`;
}

function hsl(c: RGB): [number, number, number] {
  const r = c[0] / 255;
  const g = c[1] / 255;
  const b = c[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

function fromHsl(h: number, s: number, l: number): RGB {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

/** Bright face from the island accent and water, with a near-black edge from the cliff. */
export function honkStops(scene: { accent: number; water: number; cliff: number }): string[] {
  const tint = mix(rgbOf(scene.accent), rgbOf(scene.water), 0.2);
  const [hue, sat] = hsl(tint);
  const face = fromHsl(hue, Math.min(0.82, Math.max(sat, 0.62)), 0.64);
  const top = fromHsl(hue, Math.min(0.7, Math.max(sat, 0.5)), 0.78);
  const ink: RGB = [7, 8, 10];
  const edge = mix(rgbOf(scene.cliff), ink, 0.88);
  const lip = mix(rgbOf(scene.cliff), ink, 0.74);
  return [edge, lip, top, top, face, face, face, face].map(cssRgb);
}

function ellipse(x: number, z: number, cx: number, cz: number, rx: number, rz: number): boolean {
  const dx = (x - cx) / rx;
  const dz = (z - cz) / rz;
  return dx * dx + dz * dz <= 1;
}
