import type { ComponentDef, LevelDef, LinkKind } from "../engine/types";
import { CAMPAIGN } from "../levels/campaign";
import { getCable } from "./cables";
import { getComponent } from "./components";
import { CABLE_UNLOCK, TOOLBOX } from "./toolbox";

export const SERVICE_KINDS: LinkKind[] = ["http", "grpc", "amqp", "kafka"];

export function accepts(def: ComponentDef, kind: LinkKind): boolean {
  if (def.accepts) return def.accepts.includes(kind);
  if (def.role === "store") return kind === "sql";
  if (def.role === "source") return kind === "http";
  return kind === "http" || kind === "grpc";
}

/** Fits of the stores this lesson actually packed. */
export function lessonFits(level: LevelDef): string[] {
  const fits = new Set<string>();
  for (const id of level.palette) {
    const def = getComponent(id);
    if (def.role === "store" && def.fit) fits.add(def.fit);
  }
  return [...fits];
}

/** A substitute store is missing a knob the lesson's own stores have. */
export function missingLessonKnob(def: ComponentDef, level: LevelDef): boolean {
  const keys = new Set<string>();
  for (const id of level.palette) {
    const lesson = getComponent(id);
    if (lesson.role !== "store") continue;
    for (const field of lesson.config) keys.add(field.key);
  }
  if (keys.size === 0) return false;
  const have = new Set(def.config.map((field) => field.key));
  for (const key of keys) if (!have.has(key)) return true;
  return false;
}

export function offeredPieces(level: LevelDef): ComponentDef[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  const add = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  };
  for (const id of level.palette) add(id);
  const extras = TOOLBOX.filter((item) => item.minLevel <= level.num).sort(
    (a, b) => a.minLevel - b.minLevel || a.name.localeCompare(b.name),
  );
  for (const item of extras) add(item.id);
  return ids.map((id) => getComponent(id));
}

export function offeredCables(level: LevelDef) {
  const ids: LinkKind[] = [];
  const add = (id: LinkKind) => {
    if (!ids.includes(id)) ids.push(id);
  };
  for (const earlier of CAMPAIGN) {
    if (earlier.num > level.num) continue;
    for (const id of earlier.cables) add(id);
  }
  for (const cable of CABLE_UNLOCK) {
    if (cable.minLevel <= level.num) add(cable.id);
  }
  return ids.map((id) => getCable(id)!);
}

export function fitName(fit: string): string {
  const names: Record<string, string> = {
    relational: "relational database",
    document: "document database",
    cache: "cache",
    kv: "key-value store",
    wide: "wide-column store",
    search: "search index",
    object: "object store",
    graph: "graph database",
    tsdb: "time-series database",
    log: "append-only log",
  };
  return names[fit] ?? fit;
}
