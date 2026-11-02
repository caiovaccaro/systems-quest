export type Rank =
  | "Junior"
  | "Mid"
  | "Senior"
  | "Staff"
  | "Principal"
  | "Chief Architect";

export type Category = "client" | "compute" | "data" | "cache" | "queue" | "network";
export type Role = "source" | "compute" | "store";
/** How a piece behaves once a request arrives. */
export type Machine = "person" | "box" | "app" | "store" | "forward" | "cdn" | "queue" | "gate";
export type IslandShape =
  | "block"
  | "blob"
  | "crescent"
  | "twin"
  | "pier"
  | "atoll"
  | "ridge"
  | "steps"
  | "courtyard"
  | "lobes"
  | "bay"
  | "fork"
  | "causeway"
  | "comb";
export type Shape = "cluster" | "box" | "tower" | "cyl";
/** How two pieces talk. Browsers speak HTTP. Everything else is a choice. */
export type LinkKind = "http" | "sql" | "grpc" | "redis" | "amqp" | "kafka";
export type Diagnosis =
  | "pass"
  | "unwired"
  | "protocol"
  | "nostore"
  | "noindex"
  | "nplusone"
  | "pool"
  | "saturated"
  | "slo";

export type EnumOption = { label: string; value: string };

export type ConfigField =
  | {
      key: string;
      label: string;
      type: "bool";
      value: boolean;
      hint: string;
    }
  | {
      key: string;
      label: string;
      type: "enum";
      value: string;
      options: EnumOption[];
      hint: string;
    }
  | {
      key: string;
      label: string;
      type: "number";
      value: number;
      min: number;
      max: number;
      hint: string;
    };

export interface ComponentDef {
  id: string;
  name: string;
  blurb: string;
  category: Category;
  role: Role;
  shape: Shape;
  placeable: boolean;
  requiresStore: boolean;
  /** Lower tiers send traffic toward higher tiers. People are 0, stores are 3. */
  tier: number;
  machine: Machine;
  cost: number;
  color: number;
  maxRps: number;
  baseLatencyMs: number;
  queueSize: number;
  maxConnections?: number;
  /** Data family. A document store used as a relational notebook is slow. */
  fit?: string;
  /** Cables this piece actually speaks. Defaults: stores speak SQL, services speak HTTP and gRPC. */
  accepts?: LinkKind[];
  /** Wakes, answers, and keeps nothing. Writes on a write-heavy lesson are lost. */
  forgets?: boolean;
  /** Builds one response by calling the services cabled behind it. */
  aggregates?: boolean;
  /** A log. Every service cabled to it hears the event, not just one worker. */
  broadcast?: boolean;
  config: ConfigField[];
}

export interface PlacedNode {
  id: string;
  defId: string;
  x: number;
  z: number;
  locked: boolean;
  config: Record<string, boolean | string | number>;
}

export interface Link {
  id: string;
  from: string;
  to: string;
  kind: LinkKind;
}

export interface ChaosEvent {
  at: number;
  duration: number;
  mult: number;
  label: string;
}

export interface GlossaryItem {
  term: string;
  means: string;
}

export interface SceneDef {
  place: string;
  shape: IslandShape;
  water: number;
  cliff: number;
  tileA: number;
  tileB: number;
  accent: number;
}

export interface LevelDef {
  id: string;
  num: number;
  title: string;
  rank: Rank;
  playable: boolean;
  tease: string;
  product: string;
  brief: string;
  teach: string[];
  glossary: GlossaryItem[];
  dau: string;
  qps: number;
  readWrite: string;
  latencySloMs: number;
  availabilitySlo: number;
  budget: number;
  region: string;
  nonGoals: string;
  duration: number;
  seed: number;
  chaos: ChaosEvent[];
  palette: string[];
  /** Cables the player may pick for this lesson. */
  cables: LinkKind[];
  /** Kept for lesson notes. Traffic is not failed for skipping these ids. */
  mustHttp?: string[];
  /** Kept for lesson notes. A missing store does not fail the visit by itself. */
  mustStores?: string[];
  /** Each of these services must read and write a database of its own. */
  owners?: string[];
  scene: SceneDef;
  preplaced: { defId: string; x: number; z: number; locked: boolean }[];
  copy: {
    pass: [string, string, string];
    warStory: string;
    failUnwired: [string, string, string];
    failProtocol: [string, string, string];
    failNostore: [string, string, string];
    failNoindex: [string, string, string];
    failNplusone: [string, string, string];
    failPool: [string, string, string];
    failSaturated: [string, string, string];
    failSlo: [string, string, string];
  };
}

export interface PacketView {
  id: number;
  ax: number;
  az: number;
  bx: number;
  bz: number;
  u: number;
  kind: "http" | "query";
  ok: boolean;
}

export interface NodeView {
  id: string;
  defId: string;
  x: number;
  z: number;
  sat: number;
  queue: number;
  conns: number;
  pool: number;
  rpsIn: number;
  rpsOut: number;
  errors: number;
  crashed: boolean;
  waiters: number;
  p99: number;
}

export interface HudSnapshot {
  t: number;
  duration: number;
  rps: number;
  users: number;
  p50: number;
  p99: number;
  errors: number;
  errorRate: number;
  availability: number;
  burn: number;
  cost: number;
  budget: number;
  trafficMult: number;
  chaos: string | null;
  ended: boolean;
  won: boolean;
}

export interface TickResult {
  hud: HudSnapshot;
  nodes: NodeView[];
  packets: PacketView[];
  ticker: string | null;
  ended: boolean;
  won: boolean;
  diagnosis: Diagnosis;
}
