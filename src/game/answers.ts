import { defaultConfig, getComponent } from "../catalog/components";
import { nid } from "../engine/ids";
import type { LevelDef, Link, LinkKind, PlacedNode } from "../engine/types";
import { isLand } from "../levels/island";

type Cfg = Record<string, string | number | boolean>;

interface Piece {
  key: string;
  def: string;
  cfg?: Cfg;
}

interface Answer {
  pieces: Piece[];
  links: [string, string, LinkKind][];
}

const http = "http" as const;
const sql = "sql" as const;
const kafka = "kafka" as const;
const redis = "redis" as const;

function answer(pieces: Piece[], links: [string, string, LinkKind][]): Answer {
  return { pieces, links };
}

/** One layout per lesson that holds the SLO. Keys are local names used by the cables. */
const ANSWERS: Record<string, Answer> = {
  l1: answer([{ key: "server", def: "laptop" }], [["users", "server", http]]),
  l2: answer(
    [
      { key: "app", def: "app", cfg: { query: "batch" } },
      { key: "db", def: "db", cfg: { indexed: true } },
    ],
    [["users", "app", http], ["app", "db", sql]],
  ),
  l3: answer([{ key: "server", def: "beacon" }], [["users", "server", http]]),
  l4: answer(
    [
      { key: "lb", def: "porch", cfg: { balance: "spread" } },
      { key: "a", def: "oven" },
      { key: "b", def: "oven" },
    ],
    [["users", "lb", http], ["lb", "a", http], ["lb", "b", http]],
  ),
  l5: answer(
    [
      { key: "app", def: "booth" },
      { key: "primary", def: "mysql", cfg: { indexed: true } },
      { key: "replica", def: "echo", cfg: { freshness: "current" } },
    ],
    [["users", "app", http], ["app", "primary", sql], ["app", "replica", sql]],
  ),
  l6: answer(
    [
      { key: "app", def: "booth" },
      { key: "cache", def: "redisbox", cfg: { ttl: "jitter" } },
    ],
    [["users", "app", http], ["app", "cache", redis]],
  ),
  l7: answer(
    [
      { key: "cdn", def: "cdn", cfg: { cache: "public" } },
      { key: "origin", def: "origin" },
    ],
    [["users", "cdn", http], ["cdn", "origin", http]],
  ),
  l8: answer(
    [
      { key: "queue", def: "slot" },
      { key: "worker", def: "clerk" },
    ],
    [["users", "queue", http], ["queue", "worker", http]],
  ),
  l9: answer(
    [
      { key: "limit", def: "gate", cfg: { limit: "fair" } },
      { key: "app", def: "path" },
    ],
    [["users", "limit", http], ["limit", "app", http]],
  ),
  l10: answer(
    [
      { key: "app", def: "booth" },
      { key: "primary", def: "ledger" },
      { key: "search", def: "search", cfg: { sync: "outbox" } },
    ],
    [["users", "app", http], ["app", "primary", sql], ["app", "search", sql]],
  ),
  l11: answer(
    [
      { key: "upload", def: "darkroom" },
      { key: "object", def: "plate", cfg: { order: "row" } },
      { key: "meta", def: "album" },
    ],
    [["users", "upload", http], ["upload", "meta", sql], ["upload", "object", sql]],
  ),
  l12: answer(
    [
      { key: "proxy", def: "customs", cfg: { sessions: "shared" } },
      { key: "auth", def: "stamp" },
    ],
    [["users", "proxy", http], ["proxy", "auth", http]],
  ),
  l13: answer(
    [
      { key: "router", def: "stall", cfg: { shard: "even" } },
      { key: "a", def: "bin" },
      { key: "b", def: "bin" },
    ],
    [["users", "router", http], ["router", "a", sql], ["router", "b", sql]],
  ),
  l14: answer(
    [
      { key: "writer", def: "ferry" },
      { key: "remote", def: "farshore", cfg: { quorum: "local" } },
    ],
    [["users", "writer", http], ["writer", "remote", sql]],
  ),
  l15: answer([{ key: "service", def: "counter", cfg: { call: "counter" } }], [["users", "service", http]]),
  l16: answer([{ key: "client", def: "boathouse", cfg: { breaker: "open" } }], [["users", "client", http]]),
  l17: answer([{ key: "service", def: "inn", cfg: { window: "open" } }], [["users", "service", http]]),
  l18: answer([{ key: "api", def: "keydesk", cfg: { delivery: "key" } }], [["users", "api", http]]),
  l19: answer(
    [
      { key: "app", def: "booth" },
      { key: "db", def: "shelf", cfg: { migration: "expand" } },
    ],
    [["users", "app", http], ["app", "db", sql]],
  ),
  l20: answer(
    [
      { key: "feed", def: "notice", cfg: { fan: "read" } },
      { key: "store", def: "feed" },
    ],
    [["users", "feed", http], ["feed", "store", sql]],
  ),
  l21: answer([{ key: "app", def: "till" }], [["users", "app", http]]),
  l22: answer(
    [
      { key: "router", def: "lane", cfg: { route: "strangler" } },
      { key: "next", def: "barn" },
    ],
    [["users", "router", http], ["router", "next", http]],
  ),
  l23: answer(
    [
      { key: "gateway", def: "span", cfg: { ship: "owner" } },
      { key: "service", def: "hall" },
    ],
    [["users", "gateway", http], ["gateway", "service", http]],
  ),
  l24: answer(
    [
      { key: "app", def: "booth" },
      { key: "db", def: "ward", cfg: { tenant: "wall" } },
    ],
    [["users", "app", http], ["app", "db", sql]],
  ),
  l25: answer([{ key: "service", def: "charter", cfg: { charter: "honest" } }], [["users", "service", http]]),
  l26: answer(
    [
      { key: "bff", def: "bff", cfg: { compose: "scatter" } },
      { key: "profile", def: "profile" },
      { key: "timeline", def: "timeline" },
      { key: "pdb", def: "mysql", cfg: { indexed: true } },
      { key: "tdb", def: "mysql", cfg: { indexed: true } },
    ],
    [
      ["users", "bff", http],
      ["bff", "profile", http],
      ["bff", "timeline", http],
      ["profile", "pdb", sql],
      ["timeline", "tdb", sql],
    ],
  ),
  l27: answer(
    [
      { key: "page", def: "pageui", cfg: { stack: "layered" } },
      { key: "domain", def: "domain" },
      { key: "db", def: "layerdb" },
    ],
    [["users", "page", http], ["page", "domain", http], ["domain", "db", sql]],
  ),
  l28: answer(
    [
      { key: "proc", def: "modulith", cfg: { modules: "bounded" } },
      { key: "db", def: "moduledb" },
    ],
    [["users", "proc", http], ["proc", "db", sql]],
  ),
  l29: answer(
    [
      { key: "pipe", def: "pipe", cfg: { pipe: "filters" } },
      { key: "a", def: "filter" },
      { key: "b", def: "filter" },
      { key: "c", def: "filter" },
    ],
    [["users", "pipe", http], ["pipe", "a", http], ["pipe", "b", http], ["pipe", "c", http]],
  ),
  l30: answer(
    [
      { key: "core", def: "kernel", cfg: { plugins: "contract" } },
      { key: "p1", def: "plugin" },
      { key: "p2", def: "plugin" },
    ],
    [["users", "core", http]],
  ),
  l31: answer(
    [
      { key: "api", def: "coarseapi", cfg: { cut: "coarse" } },
      { key: "svc", def: "coarsesvc" },
      { key: "db", def: "shareddb" },
    ],
    [["users", "api", http], ["api", "svc", http], ["svc", "db", sql]],
  ),
  l32: answer(
    [
      { key: "edge", def: "edgecut", cfg: { split: "bounded" } },
      { key: "svc", def: "leafsvc" },
      { key: "db", def: "leafdb" },
    ],
    [["users", "edge", http], ["edge", "svc", http], ["svc", "db", sql]],
  ),
  l33: answer(
    [
      { key: "pub", def: "intake", cfg: { busmode: "log" } },
      { key: "log", def: "eventlog" },
      { key: "c1", def: "consumer" },
      { key: "c2", def: "consumer" },
      { key: "db", def: "intakedb" },
    ],
    [
      ["users", "pub", http],
      ["pub", "db", sql],
      ["pub", "log", kafka],
      ["c1", "log", kafka],
      ["c2", "log", kafka],
    ],
  ),
  l34: answer(
    [
      { key: "front", def: "workflow", cfg: { workflow: "durable" } },
      { key: "log", def: "worklog" },
      { key: "a", def: "step" },
      { key: "b", def: "step" },
      { key: "c", def: "step" },
    ],
    [
      ["users", "front", http],
      ["front", "log", kafka],
      ["a", "log", kafka],
      ["b", "log", kafka],
      ["c", "log", kafka],
    ],
  ),
  l35: answer(
    [
      { key: "cmd", def: "command", cfg: { model: "cqrs" } },
      { key: "write", def: "writedb" },
      { key: "read", def: "readdb" },
    ],
    [["users", "cmd", http], ["cmd", "write", sql], ["cmd", "read", sql]],
  ),
  l36: answer(
    [
      { key: "unit", def: "gridunit", cfg: { data: "grid" } },
      { key: "pump", def: "pumpdb" },
    ],
    [["users", "unit", http], ["unit", "pump", sql]],
  ),
  l37: answer(
    [
      { key: "domain", def: "soadomain", cfg: { taxonomy: "collapsed" } },
      { key: "enter", def: "soaenter" },
      { key: "infra", def: "soainfra" },
    ],
    [["users", "domain", http]],
  ),
  l38: answer(
    [
      { key: "orders", def: "orderspub", cfg: { brokers: "split" } },
      { key: "billing", def: "billingpub" },
      { key: "ob", def: "ordersbus" },
      { key: "bb", def: "billingbus" },
    ],
    [["users", "orders", http], ["orders", "ob", kafka], ["billing", "bb", kafka]],
  ),
  l39: answer(
    [
      { key: "svc", def: "opssvc", cfg: { ops: "sidecar" } },
      { key: "side", def: "opside" },
    ],
    [["users", "svc", http]],
  ),
};

type Cell = { x: number; z: number };

function landCells(level: LevelDef): Cell[] {
  const cells: Cell[] = [];
  for (let z = 0; z < 8; z++) {
    for (let x = 0; x < 12; x++) {
      if (isLand(level.scene.shape, x, z)) cells.push({ x, z });
    }
  }
  return cells;
}

function hypot(x: number, z: number): number {
  return Math.hypot(x, z);
}

/** Walk the cables from Users so each hop sits further along the island, with side pieces off that line. */
function seatPieces(level: LevelDef, users: PlacedNode, spec: Answer): Map<string, Cell> {
  const land = landCells(level);
  const byKey = (x: number, z: number) => `${x},${z}`;
  const taken = new Set<string>([byKey(users.x, users.z)]);
  const seats = new Map<string, Cell>([["users", { x: users.x, z: users.z }]]);

  let far = { x: users.x, z: users.z };
  for (const cell of land) {
    if (hypot(cell.x - users.x, cell.z - users.z) > hypot(far.x - users.x, far.z - users.z)) far = cell;
  }
  const span = hypot(far.x - users.x, far.z - users.z) || 1;
  const axis = { x: (far.x - users.x) / span, z: (far.z - users.z) / span };
  const side = { x: -axis.z, z: axis.x };

  const next = new Map<string, string[]>();
  const linked = new Set<string>();
  const add = (from: string, to: string) => {
    const list = next.get(from) ?? [];
    if (!list.includes(to)) list.push(to);
    next.set(from, list);
    linked.add(from);
    linked.add(to);
  };
  for (const [from, to] of spec.links) {
    add(from, to);
    add(to, from);
  }
  const pieceOrder = new Map(spec.pieces.map((piece, index) => [piece.key, index]));
  const seen = new Set<string>(["users"]);
  const kids = new Map<string, string[]>();
  const queue = ["users"];
  while (queue.length) {
    const key = queue.shift()!;
    const children: string[] = [];
    for (const other of next.get(key) ?? []) {
      if (seen.has(other)) continue;
      seen.add(other);
      children.push(other);
      queue.push(other);
    }
    children.sort((a, b) => (pieceOrder.get(a) ?? 0) - (pieceOrder.get(b) ?? 0));
    kids.set(key, children);
  }
  const extraRoots: string[] = [];
  for (const piece of spec.pieces) {
    if (seen.has(piece.key) || !linked.has(piece.key)) continue;
    extraRoots.push(piece.key);
    seen.add(piece.key);
    const pending = [piece.key];
    while (pending.length) {
      const key = pending.shift()!;
      const children: string[] = [];
      for (const other of next.get(key) ?? []) {
        if (seen.has(other)) continue;
        seen.add(other);
        children.push(other);
        pending.push(other);
      }
      children.sort((a, b) => (pieceOrder.get(a) ?? 0) - (pieceOrder.get(b) ?? 0));
      kids.set(key, children);
    }
  }
  if (extraRoots.length) kids.set("users", [...(kids.get("users") ?? []), ...extraRoots]);
  const door = (kids.get("users") ?? [])[0];

  const claim = (ideal: Cell): Cell => {
    const free = land.filter((cell) => !taken.has(byKey(cell.x, cell.z)));
    if (free.length === 0) throw new Error(`${level.id} ran out of land`);
    const spaced = free.filter((cell) => {
      for (const seat of seats.values()) {
        if (hypot(cell.x - seat.x, cell.z - seat.z) < 1.7) return false;
      }
      return true;
    });
    const pool = spaced.length > 0 ? spaced : free;
    const gap = (cell: Cell) => {
      let best = 99;
      for (const seat of seats.values()) best = Math.min(best, hypot(cell.x - seat.x, cell.z - seat.z));
      return best;
    };
    pool.sort((a, b) => {
      const da = hypot(a.x - ideal.x, a.z - ideal.z);
      const db = hypot(b.x - ideal.x, b.z - ideal.z);
      if (Math.abs(da - db) > 0.75) return da - db;
      return gap(b) - gap(a);
    });
    const cell = pool[0]!;
    taken.add(byKey(cell.x, cell.z));
    return cell;
  };

  const stride = 2.2;
  const placeChildren = (key: string) => {
    const parent = seats.get(key);
    if (!parent) return;
    const children = kids.get(key) ?? [];
    const branches = children.filter((child) => (kids.get(child) ?? []).length > 0);
    const leaves = children.filter((child) => (kids.get(child) ?? []).length === 0);
    if (branches.length === 0) {
      const count = leaves.length;
      leaves.forEach((child, index) => {
        const lane = index - (count - 1) / 2;
        const cell = claim({
          x: parent.x + axis.x * stride + side.x * lane * stride,
          z: parent.z + axis.z * stride + side.z * lane * stride,
        });
        seats.set(child, cell);
      });
      return;
    }
    branches.forEach((child, index) => {
      const lane = index === 0 ? 0 : (index % 2 === 1 ? 1 : -1) * Math.ceil(index / 2);
      const cell = claim({
        x: parent.x + axis.x * stride + side.x * lane * stride,
        z: parent.z + axis.z * stride + side.z * lane * stride,
      });
      seats.set(child, cell);
      placeChildren(child);
    });
    leaves.forEach((child, index) => {
      const sign = index % 2 === 0 ? 1 : -1;
      const mag = Math.ceil((index + 1) / 2);
      const cell = claim({
        x: parent.x + side.x * sign * mag * stride,
        z: parent.z + side.z * sign * mag * stride,
      });
      seats.set(child, cell);
    });
  };
  placeChildren("users");

  const host = (door && seats.get(door)) || seats.get("users")!;
  spec.pieces
    .filter((piece) => !linked.has(piece.key))
    .forEach((piece, index) => {
      const sign = index % 2 === 0 ? 1 : -1;
      const mag = Math.ceil((index + 1) / 2);
      const cell = claim({
        x: host.x + side.x * sign * mag * stride,
        z: host.z + side.z * sign * mag * stride,
      });
      seats.set(piece.key, cell);
    });

  for (const piece of spec.pieces) {
    if (seats.has(piece.key)) continue;
    const cell = claim({ x: users.x + axis.x * stride, z: users.z + axis.z * stride });
    seats.set(piece.key, cell);
  }
  return seats;
}

/** Place the lesson's answer along the island, in cable order, keeping Users where they are. */
export function layoutAnswer(level: LevelDef, users: PlacedNode): { nodes: PlacedNode[]; links: Link[] } {
  const spec = ANSWERS[level.id];
  if (!spec) throw new Error(`no answer for ${level.id}`);
  const seats = seatPieces(level, users, spec);
  const ids = new Map<string, string>([["users", users.id]]);
  const nodes: PlacedNode[] = [{ ...users }];
  for (const piece of spec.pieces) {
    const cell = seats.get(piece.key);
    if (!cell) throw new Error(`no tile for ${piece.key}`);
    const id = nid(piece.def);
    ids.set(piece.key, id);
    nodes.push({
      id,
      defId: piece.def,
      x: cell.x,
      z: cell.z,
      locked: false,
      config: { ...defaultConfig(getComponent(piece.def)), ...piece.cfg },
    });
  }
  const links: Link[] = spec.links.map(([from, to, kind]) => {
    const a = ids.get(from);
    const b = ids.get(to);
    if (!a || !b) throw new Error(`missing cable end ${from} or ${to}`);
    const left = nodes.find((n) => n.id === a);
    const right = nodes.find((n) => n.id === b);
    if (!left || !right) throw new Error("cable node");
    const tierA = getComponent(left.defId).tier;
    const tierB = getComponent(right.defId).tier;
    const src = tierA <= tierB ? a : b;
    const dst = src === a ? b : a;
    return { id: nid("link"), from: src, to: dst, kind };
  });
  return { nodes, links };
}
