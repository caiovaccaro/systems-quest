import type { ComponentDef } from "../engine/types";

export const COMPONENTS: ComponentDef[] = [
  {
    id: "users",
    name: "Users",
    blurb: "Real people. They open the page, get bored if it is slow, and leave.",
    category: "client",
    role: "source",
    shape: "cluster",
    placeable: false,
    requiresStore: false,
    cost: 0,
    color: 0xf2a65a,
    maxRps: 10_000,
    baseLatencyMs: 0,
    queueSize: 10_000,
    config: [],
  },
  {
    id: "laptop",
    name: "The Laptop",
    blurb: "One computer on a desk. Fine for a demo. Also the only thing that can break.",
    category: "compute",
    role: "compute",
    shape: "box",
    placeable: true,
    requiresStore: false,
    cost: 12,
    color: 0x6ee7dc,
    maxRps: 64,
    baseLatencyMs: 10,
    queueSize: 80,
    config: [],
  },
  {
    id: "app",
    name: "App process",
    blurb: "The program people talk to. It should ask the database once, not twelve times.",
    category: "compute",
    role: "compute",
    shape: "tower",
    placeable: true,
    requiresStore: true,
    cost: 18,
    color: 0x5b8cff,
    maxRps: 140,
    baseLatencyMs: 8,
    queueSize: 220,
    config: [
      {
        key: "query",
        label: "Query shape",
        type: "enum",
        value: "nplusone",
        options: [
          { label: "N+1 loop (the intern special)", value: "nplusone" },
          { label: "Single join / batch", value: "batch" },
        ],
        hint: "N+1 means one click quietly asks the database again and again. A single join asks once.",
      },
    ],
  },
  {
    id: "db",
    name: "Postgres",
    blurb: "The notebook that remembers signups. It only has so many phone lines.",
    category: "data",
    role: "store",
    shape: "cyl",
    placeable: true,
    requiresStore: false,
    cost: 28,
    color: 0xd57cff,
    maxRps: 500,
    baseLatencyMs: 12,
    queueSize: 250,
    maxConnections: 20,
    config: [
      {
        key: "indexed",
        label: "Index on email",
        type: "bool",
        value: false,
        hint: "An index is a bookmark. Without it, every lookup reads the whole table.",
      },
      {
        key: "pool",
        label: "Connection pool",
        type: "number",
        value: 20,
        min: 5,
        max: 50,
        hint: "A pool is a limited set of phone lines into the database. More lines do not fix chatty questions.",
      },
    ],
  },
];

const byId = new Map(COMPONENTS.map((c) => [c.id, c]));

export function getComponent(id: string): ComponentDef {
  const c = byId.get(id);
  if (!c) throw new Error(`unknown component ${id}`);
  return c;
}

export function defaultConfig(def: ComponentDef): Record<string, boolean | string | number> {
  const out: Record<string, boolean | string | number> = {};
  for (const field of def.config) out[field.key] = field.value;
  return out;
}
