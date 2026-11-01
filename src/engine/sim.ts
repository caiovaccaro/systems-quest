import { getComponent } from "../catalog/components";
import { gridToWorld, HOP_HTTP, HOP_QUERY, MAX_VISUAL_PACKETS, WAIT_TIMEOUT } from "./const";
import { Metrics } from "./metrics";
import { Rng } from "./rng";
import type {
  Diagnosis,
  HudSnapshot,
  LevelDef,
  Link,
  LinkKind,
  NodeView,
  PacketView,
  PlacedNode,
  TickResult,
} from "./types";

type Kind = "http" | "query";
type Phase = "move" | "wait" | "proc" | "child";

interface Req {
  id: number;
  kind: Kind;
  phase: Phase;
  fromId: string;
  toId: string;
  atId: string;
  u: number;
  hopT: number;
  left: number;
  waited: number;
  created: number;
  history: string[];
  parentId: number | null;
  qLeft: number;
  waitLimit: number;
  holding: boolean;
  returning: boolean;
  visual: boolean;
  ok: boolean;
}

interface RuntimeNode {
  placed: PlacedNode;
  defId: string;
  queue: Req[];
  tokens: number;
  conns: number;
  concurrent: number;
  crashed: boolean;
  sat: number;
  inCount: number;
  outCount: number;
  errCount: number;
  waiters: number;
  latencies: number[];
}

export class Simulation {
  t = 0;
  ended = false;
  won = false;
  diagnosis: Diagnosis = "slo";
  ticker: string | null = null;
  private nodes = new Map<string, RuntimeNode>();
  private outgoing = new Map<string, { to: string; kind: LinkKind }[]>();
  private reqs: Req[] = [];
  private nextId = 1;
  private emitAcc = 0;
  private visuals = 0;
  private rng: Rng;
  private metrics = new Metrics();
  private totalOk = 0;
  private totalFail = 0;
  private burn = 0;
  private trafficMult = 1;
  private chaos: string | null = null;
  private announced = new Set<string>();
  private flags = {
    unwired: 0,
    protocol: 0,
    nostore: 0,
    poolTimeouts: 0,
    poolWaits: 0,
    saturated: 0,
    n1: false,
    noindex: false,
  };
  private cost: number;
  private readonly parentOf = new Map<number, Req>();

  constructor(
    private readonly level: LevelDef,
    placed: PlacedNode[],
    links: Link[],
  ) {
    this.rng = new Rng(level.seed);
    this.cost = placed.reduce((sum, n) => sum + getComponent(n.defId).cost, 0);
    for (const p of placed) {
      const def = getComponent(p.defId);
      this.nodes.set(p.id, {
        placed: p,
        defId: p.defId,
        queue: [],
        tokens: def.maxRps,
        conns: 0,
        concurrent: 0,
        crashed: false,
        sat: 0,
        inCount: 0,
        outCount: 0,
        errCount: 0,
        waiters: 0,
        latencies: [],
      });
      this.outgoing.set(p.id, []);
    }
    for (const link of links) {
      const list = this.outgoing.get(link.from);
      if (list) list.push({ to: link.to, kind: link.kind });
    }
  }

  private targets(from: string, kind: LinkKind): string[] {
    return (this.outgoing.get(from) ?? []).filter((l) => l.kind === kind).map((l) => l.to);
  }

  tick(dt: number): TickResult {
    if (!this.ended) {
      this.t += dt;
      this.updateChaos();
      this.emit(dt);
      this.stepMoves(dt);
      this.stepQueues(dt);
      this.stepProcs(dt);
      this.updateSat();
      this.updateBurn(dt);
      this.maybeEnd();
    }
    return this.snapshot();
  }

  private currentRps(): number {
    const ramp = Math.min(1, this.t / 2.5);
    return this.level.qps * this.trafficMult * ramp;
  }

  private updateChaos(): void {
    this.trafficMult = 1;
    this.chaos = null;
    for (const event of this.level.chaos) {
      if (this.t < event.at || this.t > event.at + event.duration) continue;
      const local = this.t - event.at;
      const fade = 0.9;
      let m = event.mult;
      if (local < fade) m = 1 + (event.mult - 1) * (local / fade);
      const tail = event.duration - local;
      if (tail < fade) m = 1 + (event.mult - 1) * (tail / fade);
      this.trafficMult = Math.max(this.trafficMult, m);
      this.chaos = event.label;
      if (!this.announced.has(event.label)) {
        this.announced.add(event.label);
        this.ticker = event.label;
      }
    }
  }

  private emit(dt: number): void {
    this.emitAcc += this.currentRps() * dt;
    while (this.emitAcc >= 1) {
      this.emitAcc -= 1;
      this.spawnHttp();
    }
  }

  private spawnHttp(): void {
    const users = this.findSource();
    if (!users) return;
    if (!this.covers()) {
      this.flags.unwired += 1;
      this.failStat(users, 400);
      this.metrics.push(this.t, 400, false);
      this.totalFail += 1;
      return;
    }
    const dests = this.targets(users.placed.id, "http");
    if (dests.length === 0) {
      this.flags.unwired += 1;
      this.failStat(users, 400);
      this.metrics.push(this.t, 400, false);
      this.totalFail += 1;
      return;
    }
    const dest = this.rng.pick(dests);
    const req = this.makeReq("http", users.placed.id, dest, null);
    req.history = [users.placed.id];
    this.reqs.push(req);
  }

  private makeReq(kind: Kind, from: string, to: string, parent: number | null): Req {
    const visual = this.visuals < MAX_VISUAL_PACKETS;
    if (visual) this.visuals += 1;
    const req: Req = {
      id: this.nextId++,
      kind,
      phase: "move",
      fromId: from,
      toId: to,
      atId: from,
      u: 0,
      hopT: kind === "query" ? HOP_QUERY : HOP_HTTP,
      left: 0,
      waited: 0,
      created: this.t,
      history: [],
      parentId: parent,
      qLeft: 0,
      waitLimit: WAIT_TIMEOUT,
      holding: false,
      returning: false,
      visual,
      ok: true,
    };
    return req;
  }

  private stepMoves(dt: number): void {
    for (const req of this.reqs) {
      if (req.phase !== "move") continue;
      req.u += dt / req.hopT;
      if (req.u >= 1) {
        req.u = 1;
        req.atId = req.toId;
        this.arrive(req);
      }
    }
  }

  private arrive(req: Req): void {
    const node = this.nodes.get(req.atId);
    if (!node) return this.kill(req, false);
    node.inCount += 1;
    const def = getComponent(node.defId);
    if (!req.history.includes(req.atId)) req.history.push(req.atId);

    if (def.role === "source" && (req.kind === "http" || req.parentId === null)) {
      this.complete(req, true);
      return;
    }

    if (req.kind === "query" && def.role === "compute" && req.parentId !== null) {
      this.onQueryReturn(req);
      return;
    }

    if (
      req.returning &&
      (def.machine === "forward" || def.machine === "cdn" || def.machine === "queue" || def.machine === "gate")
    ) {
      this.sendBack(req);
      return;
    }

    if (node.crashed) {
      this.fail(req, node, "down");
      return;
    }

    if (def.role === "store" && req.kind === "http") {
      this.flags.protocol += 1;
      this.fail(req, node, "protocol");
      return;
    }

    if (def.machine === "gate" && node.placed.config.limit === "fair" && this.trafficMult > 1.25) {
      const keep = 1.25 / this.trafficMult;
      if (this.rng.next() > keep) {
        this.dropReq(req);
        return;
      }
    }

    if (def.machine === "queue") req.waitLimit = 8;

    if (node.queue.length >= def.queueSize) {
      this.flags.saturated += 1;
      this.fail(req, node, "saturated");
      return;
    }

    req.phase = "wait";
    req.waited = 0;
    node.queue.push(req);
  }

  private onQueryReturn(req: Req): void {
    const parent = this.parentOf.get(req.parentId!);
    this.dropReq(req);
    if (!parent) return;
    parent.qLeft -= 1;
    if (parent.qLeft <= 0) {
      this.parentOf.delete(parent.id);
      this.sendBack(parent);
    } else {
      this.spawnQuery(parent);
    }
  }

  private stepQueues(dt: number): void {
    for (const node of this.nodes.values()) {
      const def = getComponent(node.defId);
      node.tokens = Math.min(def.maxRps, node.tokens + def.maxRps * dt);
      node.waiters = node.queue.length;

      const still: Req[] = [];
      for (const req of node.queue) {
        req.waited += dt;
        if (req.waited > req.waitLimit) {
          if (def.role === "store") this.flags.poolTimeouts += 1;
          else this.flags.saturated += 1;
          this.fail(req, node, def.role === "store" ? "pool" : "timeout");
          continue;
        }
        still.push(req);
      }
      node.queue = still;

      while (node.queue.length > 0) {
        if (node.tokens < 1) break;
        if (def.role === "store" && node.conns >= this.poolSize(node)) {
          this.flags.poolWaits += 1;
          break;
        }
        const req = node.queue.shift()!;
        node.tokens -= 1;
        if (def.role === "store") {
          node.conns += 1;
          req.holding = true;
          if (!this.isIndexed(node)) this.flags.noindex = true;
        }
        node.concurrent += 1;
        req.phase = "proc";
        req.left = this.procTime(node, req);
      }
    }
  }

  private stepProcs(dt: number): void {
    for (const req of [...this.reqs]) {
      if (req.phase !== "proc") continue;
      req.left -= dt;
      if (req.left > 0) continue;
      this.finishProc(req);
    }
  }

  private finishProc(req: Req): void {
    const node = this.nodes.get(req.atId);
    if (!node) return this.kill(req, false);
    const def = getComponent(node.defId);
    if (req.holding) {
      node.conns = Math.max(0, node.conns - 1);
      req.holding = false;
    }
    node.concurrent = Math.max(0, node.concurrent - 1);
    node.outCount += 1;

    if (req.returning) {
      this.sendBack(req);
      return;
    }

    if (req.kind === "query") {
      const parent = this.parentOf.get(req.parentId!);
      const backTo = parent?.atId ?? req.history[req.history.length - 2];
      if (!backTo) return this.kill(req, false);
      this.launch(req, req.atId, backTo, "query");
      return;
    }

    if (def.machine === "cdn" || def.machine === "forward" || def.machine === "queue" || def.machine === "gate") {
      const absorb = def.machine === "cdn" && node.placed.config.cache === "public" && this.rng.next() < 0.9;
      if (!absorb && this.forward(req, node)) return;
      this.sendBack(req);
      return;
    }

    if (def.role === "compute" && def.requiresStore) {
      const stores = this.targets(node.placed.id, "sql").filter((id) => {
        const n = this.nodes.get(id);
        return n && getComponent(n.defId).role === "store";
      });
      if (stores.length === 0) {
        this.flags.nostore += 1;
        this.fail(req, node, "nostore");
        return;
      }
      const must = this.level.mustStores ?? [];
      for (const defId of must) {
        if (!stores.some((id) => this.nodes.get(id)?.defId === defId)) {
          this.flags.nostore += 1;
          this.fail(req, node, "nostore");
          return;
        }
      }
      const nPlus = node.placed.config.query === "nplusone";
      if (nPlus) this.flags.n1 = true;
      req.qLeft = nPlus ? 12 : 1;
      req.phase = "child";
      this.parentOf.set(req.id, req);
      this.spawnQuery(req);
      return;
    }

    this.sendBack(req);
  }

  private spawnQuery(parent: Req): void {
    const node = this.nodes.get(parent.atId);
    if (!node) return;
    const stores = this.targets(node.placed.id, "sql").filter((id) => {
      const n = this.nodes.get(id);
      return n && getComponent(n.defId).role === "store";
    });
    if (stores.length === 0) {
      this.flags.nostore += 1;
      this.fail(parent, node, "nostore");
      return;
    }
    const dest = this.rng.pick(stores);
    const q = this.makeReq("query", parent.atId, dest, parent.id);
    q.history = [parent.atId];
    this.reqs.push(q);
  }

  private sendBack(req: Req): void {
    const prev = req.history[req.history.length - 2];
    if (!prev) {
      this.complete(req, true);
      return;
    }
    req.history.pop();
    this.launch(req, req.atId, prev, "http", true);
  }

  private launch(req: Req, from: string, to: string, kind: Kind, back = false): void {
    req.kind = kind;
    req.returning = back;
    req.phase = "move";
    req.fromId = from;
    req.toId = to;
    req.atId = from;
    req.u = 0;
    req.hopT = kind === "query" ? HOP_QUERY : HOP_HTTP;
    if (!req.history.includes(from)) req.history.push(from);
  }

  private complete(req: Req, ok: boolean): void {
    const ms = Math.max(1, (this.t - req.created) * 1000);
    this.metrics.push(this.t, ms, ok);
    if (ok) this.totalOk += 1;
    else this.totalFail += 1;
    const src = this.findSource();
    if (src && ok) src.latencies.push(ms);
    this.dropReq(req);
  }

  private fail(req: Req, node: RuntimeNode, _why: string): void {
    node.errCount += 1;
    if (req.kind === "http") {
      const ms = Math.max(40, (this.t - req.created) * 1000);
      this.metrics.push(this.t, ms, false);
      this.totalFail += 1;
    }
    if (req.parentId !== null) {
      const parent = this.parentOf.get(req.parentId);
      this.dropReq(req);
      if (parent) this.fail(parent, this.nodes.get(parent.atId) ?? node, _why);
      return;
    }
    this.dropReq(req);
  }

  private failStat(node: RuntimeNode, ms: number): void {
    node.errCount += 1;
    this.metrics.push(this.t, ms, false);
  }

  private kill(req: Req, ok: boolean): void {
    this.complete(req, ok);
  }

  private dropReq(req: Req): void {
    if (req.visual) this.visuals = Math.max(0, this.visuals - 1);
    if (req.holding) {
      const n = this.nodes.get(req.atId);
      if (n) n.conns = Math.max(0, n.conns - 1);
      req.holding = false;
    }
    this.reqs = this.reqs.filter((r) => r.id !== req.id);
    this.parentOf.delete(req.id);
  }

  private forward(req: Req, node: RuntimeNode): boolean {
    const backs = this.targets(node.placed.id, "http").filter((id) => {
      const n = this.nodes.get(id);
      return n && getComponent(n.defId).role === "compute";
    });
    if (backs.length === 0) return false;
    const sticky = node.placed.config.balance === "sticky";
    const dest = sticky ? backs[0]! : this.rng.pick(backs);
    this.launch(req, node.placed.id, dest, "http");
    return true;
  }

  private covers(): boolean {
    const need = this.level.mustHttp;
    if (!need || need.length === 0) return true;
    const users = this.findSource();
    if (!users) return false;
    const seen = new Set<string>();
    const found = new Set<string>();
    const queue = [users.placed.id];
    while (queue.length > 0) {
      const id = queue.pop()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const node = this.nodes.get(id);
      if (node) found.add(node.defId);
      for (const hop of this.targets(id, "http")) queue.push(hop);
    }
    return need.every((id) => found.has(id));
  }

  private procTime(node: RuntimeNode, _req: Req): number {
    const def = getComponent(node.defId);
    if (def.role === "store") {
      const cfg = node.placed.config;
      if (cfg.freshness === "stale") return 0.4;
      if (cfg.sync === "dual") return 0.36;
      if (cfg.ttl === "flush" && this.trafficMult > 1.15) return 0.32;
      if (cfg.freshness === "current" || cfg.sync === "outbox" || cfg.ttl === "jitter") return 0.012;
      return this.isIndexed(node) ? 0.012 : 0.17;
    }
    return def.baseLatencyMs / 1000;
  }

  private isIndexed(node: RuntimeNode): boolean {
    if (!("indexed" in node.placed.config)) return true;
    return node.placed.config.indexed === true;
  }

  private poolSize(node: RuntimeNode): number {
    const n = node.placed.config.pool;
    if (typeof n === "number") return n;
    return getComponent(node.defId).maxConnections ?? 20;
  }

  private findSource(): RuntimeNode | undefined {
    for (const n of this.nodes.values()) {
      if (getComponent(n.defId).role === "source") return n;
    }
    return undefined;
  }

  private updateSat(): void {
    for (const node of this.nodes.values()) {
      const def = getComponent(node.defId);
      const tokenSat = 1 - node.tokens / Math.max(1, def.maxRps);
      const qSat = node.queue.length / Math.max(1, def.queueSize);
      const connSat =
        def.role === "store" ? node.conns / Math.max(1, this.poolSize(node)) : 0;
      node.sat = Math.max(0, Math.min(1, Math.max(tokenSat, qSat, connSat)));
      if (qSat > 0.9 && this.t > 8) node.crashed = def.role !== "source";
    }
  }

  private updateBurn(dt: number): void {
    this.metrics.prune(this.t);
    const err = this.metrics.errorRate;
    const budget = 1 - this.level.availabilitySlo;
    const p99 = this.metrics.p99;
    let heat = 0;
    if (err > budget) heat += (err - budget) * 8;
    if (p99 > this.level.latencySloMs && this.totalOk + this.totalFail > 20) {
      heat += Math.min(2, (p99 / this.level.latencySloMs - 1) * 1.4);
    }
    if (heat > 0) this.burn = Math.min(1, this.burn + heat * dt * 0.25);
    else this.burn = Math.max(0, this.burn - dt * 0.08);
  }

  private maybeEnd(): void {
    const total = this.totalOk + this.totalFail;
    const avail = total === 0 ? 1 : this.totalOk / total;
    if (this.t > 8 && total > 30 && avail < 0.2) {
      this.finish(false);
      return;
    }
    if (this.burn >= 1 && this.t > 6) {
      this.finish(false);
      return;
    }
    if (this.t >= this.level.duration) {
      const p99 = this.wholeP99();
      const ok =
        avail >= this.level.availabilitySlo && p99 <= this.level.latencySloMs * 1.08 && this.burn < 0.85;
      this.finish(ok);
    }
  }

  private wholeP99(): number {
    return this.metrics.p99;
  }

  private finish(won: boolean): void {
    this.ended = true;
    this.won = won;
    this.diagnosis = won ? "pass" : this.diagnose();
    if (won) this.ticker = "SLOs held. Nobody paged. Suspicious.";
    else this.ticker = "You are the incident now.";
  }

  liveDiagnosis(): Diagnosis | "warming" {
    if (this.won) return "pass";
    const total = this.totalOk + this.totalFail;
    if (this.ended) return this.diagnosis;
    if (total < 12) return "warming";
    const found = this.diagnose();
    if (found !== "slo") return found;
    const avail = this.totalOk / Math.max(1, total);
    if (
      avail >= this.level.availabilitySlo &&
      this.metrics.p99 <= this.level.latencySloMs * 1.08 &&
      this.burn < 0.45
    ) {
      return "pass";
    }
    return "slo";
  }

  private diagnose(): Diagnosis {
    const total = Math.max(1, this.totalOk + this.totalFail);
    if (this.flags.unwired / total > 0.4) return "unwired";
    if (this.flags.protocol > 10) return "protocol";
    if (this.flags.nostore > 10) return "nostore";
    if (this.flags.noindex) return "noindex";
    if (this.flags.n1) return "nplusone";
    if (this.flags.poolTimeouts > 5 || this.flags.poolWaits > 40) return "pool";
    if (this.flags.saturated > 10) return "saturated";
    return "slo";
  }

  private snapshot(): TickResult {
    const total = this.totalOk + this.totalFail;
    const packets: PacketView[] = [];
    for (const req of this.reqs) {
      if (!req.visual || req.phase !== "move") continue;
      const a = this.nodes.get(req.fromId);
      const b = this.nodes.get(req.toId);
      if (!a || !b) continue;
      const aw = gridToWorld(a.placed.x, a.placed.z);
      const bw = gridToWorld(b.placed.x, b.placed.z);
      packets.push({
        id: req.id,
        ax: aw.x,
        az: aw.z,
        bx: bw.x,
        bz: bw.z,
        u: req.u,
        kind: req.kind,
        ok: req.ok,
      });
    }

    const nodes: NodeView[] = [];
    for (const n of this.nodes.values()) {
      nodes.push({
        id: n.placed.id,
        defId: n.defId,
        x: n.placed.x,
        z: n.placed.z,
        sat: n.sat,
        queue: n.queue.length,
        conns: n.conns,
        pool: this.poolSize(n),
        rpsIn: n.inCount,
        rpsOut: n.outCount,
        errors: n.errCount,
        crashed: n.crashed,
        waiters: n.waiters,
        p99: n.latencies.length ? n.latencies[Math.floor(n.latencies.length * 0.99)] ?? 0 : 0,
      });
    }

    const hud: HudSnapshot = {
      t: this.t,
      duration: this.level.duration,
      rps: this.metrics.rps,
      users: Math.round(this.currentRps() * 12),
      p50: this.metrics.p50,
      p99: this.metrics.p99,
      errors: this.totalFail,
      errorRate: this.metrics.errorRate,
      availability: total === 0 ? 1 : this.totalOk / total,
      burn: this.burn,
      cost: this.cost,
      budget: this.level.budget,
      trafficMult: this.trafficMult,
      chaos: this.chaos,
      ended: this.ended,
      won: this.won,
    };

    const ticker = this.ticker;
    this.ticker = null;

    return {
      hud,
      nodes,
      packets,
      ticker,
      ended: this.ended,
      won: this.won,
      diagnosis: this.diagnosis,
    };
  }
}
