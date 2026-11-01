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

function ellipse(x: number, z: number, cx: number, cz: number, rx: number, rz: number): boolean {
  const dx = (x - cx) / rx;
  const dz = (z - cz) / rz;
  return dx * dx + dz * dz <= 1;
}
