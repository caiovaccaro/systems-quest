export const COLS = 12;
export const ROWS = 8;
export const CELL = 1.42;
export const HOP_HTTP = 0.08;
export const HOP_QUERY = 0.04;
export const WAIT_TIMEOUT = 2;
export const MAX_VISUAL_PACKETS = 140;
export const SIM_STEP = 1 / 30;
export const PROGRESS_KEY = "systems_quest.cleared";

export function gridToWorld(gx: number, gz: number): { x: number; z: number } {
  return {
    x: (gx - (COLS - 1) / 2) * CELL,
    z: (gz - (ROWS - 1) / 2) * CELL,
  };
}

export function worldToGrid(x: number, z: number): { gx: number; gz: number } {
  return {
    gx: Math.round(x / CELL + (COLS - 1) / 2),
    gz: Math.round(z / CELL + (ROWS - 1) / 2),
  };
}
