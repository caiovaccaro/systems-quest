import { defaultConfig, getComponent } from "../catalog/components";
import { nid } from "../engine/ids";
import type { LevelDef, Link, LinkKind, PlacedNode } from "../engine/types";
import { anchor, isLand } from "../levels/island";

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
      { key: "db", def: "echo", cfg: { freshness: "current" } },
    ],
    [["users", "app", http], ["app", "db", sql]],
  ),
  l6: answer(
    [
      { key: "app", def: "booth" },
      { key: "cache", def: "cache", cfg: { ttl: "jitter" } },
    ],
    [["users", "app", http], ["app", "cache", sql]],
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

function spareLand(level: LevelDef, users: PlacedNode): { x: number; z: number }[] {
  const spot = anchor(level.scene.shape);
  const cells: { x: number; z: number }[] = [];
  for (let z = 0; z < 8; z++) {
    for (let x = 0; x < 12; x++) {
      if ((x === users.x && z === users.z) || (x === spot.x && z === spot.z)) continue;
      if (!isLand(level.scene.shape, x, z)) continue;
      cells.push({ x, z });
    }
  }
  cells.sort((a, b) => a.x - b.x || a.z - b.z);
  return cells;
}

/** Place the lesson's answer on free land, keeping the Users piece where it is. */
export function layoutAnswer(level: LevelDef, users: PlacedNode): { nodes: PlacedNode[]; links: Link[] } {
  const spec = ANSWERS[level.id];
  if (!spec) throw new Error(`no answer for ${level.id}`);
  const cells = spareLand(level, users);
  if (cells.length < spec.pieces.length) {
    throw new Error(`${level.id} needs ${spec.pieces.length} tiles and has ${cells.length}`);
  }
  const ids = new Map<string, string>([["users", users.id]]);
  const nodes: PlacedNode[] = [{ ...users }];
  spec.pieces.forEach((piece, i) => {
    const cell = cells[i];
    if (!cell) throw new Error("tile");
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
  });
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
