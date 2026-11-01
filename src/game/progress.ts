import { PROGRESS_KEY } from "../engine/const";

export function loadCleared(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function saveCleared(ids: Set<string>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...ids]));
}
