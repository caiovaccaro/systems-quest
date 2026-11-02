import type { GlossaryItem, IslandShape, LevelDef, SceneDef } from "../engine/types";
import { anchor } from "./island";
import { LATE } from "./late";

function crowd(shape: IslandShape): LevelDef["preplaced"] {
  const spot = anchor(shape);
  return [{ defId: "users", x: spot.x, z: spot.z, locked: true }];
}

const stoop: SceneDef = {
  place: "The stoop",
  shape: "block",
  water: 0x2f6f78,
  cliff: 0xc46a45,
  tileA: 0xf0d8b4,
  tileB: 0xe4c89a,
  accent: 0xf08a3c,
};
const quay: SceneDef = {
  place: "Fishmarket quay",
  shape: "blob",
  water: 0x217e86,
  cliff: 0xd08a62,
  tileA: 0xf3e2c4,
  tileB: 0xc9d6b8,
  accent: 0xe07a5f,
};
const crescent: SceneDef = {
  place: "Lighthouse crescent",
  shape: "crescent",
  water: 0x3a4d86,
  cliff: 0x6e5a78,
  tileA: 0xd5d0e0,
  tileB: 0xe7d3b1,
  accent: 0xf0a05a,
};
const bridge: SceneDef = {
  place: "Butter bridge",
  shape: "twin",
  water: 0x3e8c9a,
  cliff: 0xe0a15a,
  tileA: 0xf6e2a8,
  tileB: 0xf3c98a,
  accent: 0xe07a3c,
};
const pier: SceneDef = {
  place: "Ink pier",
  shape: "pier",
  water: 0x6ea4b8,
  cliff: 0x8aa0b4,
  tileA: 0xe7eef2,
  tileB: 0xc5d5e0,
  accent: 0x5b8fd6,
};
const atoll: SceneDef = {
  place: "Lantern atoll",
  shape: "atoll",
  water: 0x1a6e68,
  cliff: 0xd46a4a,
  tileA: 0xf6c9a2,
  tileB: 0xf0e0c0,
  accent: 0xf2c14e,
};
const ridge: SceneDef = {
  place: "Postcard ridge",
  shape: "ridge",
  water: 0x4aa3c7,
  cliff: 0xf2f0ea,
  tileA: 0xf7f4ee,
  tileB: 0xd5e4ea,
  accent: 0xe07a5f,
};
const steps: SceneDef = {
  place: "Night steps",
  shape: "steps",
  water: 0x24324a,
  cliff: 0x3d4a66,
  tileA: 0x6a7594,
  tileB: 0x8d97b0,
  accent: 0xf0c14a,
};
const moss: SceneDef = {
  place: "Moss courtyard",
  shape: "courtyard",
  water: 0x2f6b55,
  cliff: 0x6a8f62,
  tileA: 0xd5e2b8,
  tileB: 0xb7c98a,
  accent: 0xe07a5f,
};
const library: SceneDef = {
  place: "Twin reading rooms",
  shape: "lobes",
  water: 0x6e6280,
  cliff: 0xc49a8c,
  tileA: 0xf0d0c8,
  tileB: 0xc9d4c4,
  accent: 0x8d74b8,
};

const emptyCopy = {
  pass: ["", "", ""] as [string, string, string],
  warStory: "",
  failUnwired: [
    "Nothing is cabled to the users.",
    "Requests have no route.",
    "A server with no path to it does not receive traffic.",
  ] as [string, string, string],
  failProtocol: [
    "Users sent HTTP to a database.",
    "A database does not serve the page.",
    "Put a service between clients and storage.",
  ] as [string, string, string],
  failNostore: [
    "The service had nowhere to write a row.",
    "A write with no database fails.",
    "If it has to remember, it needs a store.",
  ] as [string, string, string],
  failNoindex: [
    "Missing index. Every lookup scanned the table.",
    "The pool filled with queries that should have been seeks.",
    "If you filter on a column, index it.",
  ] as [string, string, string],
  failNplusone: [
    "N+1 queries. One request, a dozen round trips.",
    "The service queried the database once per row.",
    "Fetch the rows in one query.",
  ] as [string, string, string],
  failPool: [
    "The connection pool is exhausted.",
    "Every query held a connection until new queries failed.",
    "Connections are limited. Do not hold them for chatty queries.",
  ] as [string, string, string],
  failSaturated: [
    "The server saturated, queued, then shed requests.",
    "Arrival rate passed capacity.",
    "When input beats capacity, you drop, delay, or add capacity.",
  ] as [string, string, string],
  failSlo: [
    "The SLO missed.",
    "The average can look fine while p99 does not.",
    "The slowest 1% is part of the promise.",
  ] as [string, string, string],
};

const l1: LevelDef = {
  id: "l1",
  num: 1,
  title: "Single server",
  rank: "Junior",
  playable: true,
  tease: "One machine, one page, a traffic spike.",
  product: "Read-only page",
  brief:
    "Serve a page from one server. Users are already sending HTTP. Meet the SLO through the spike.",
  scene: stoop,
  teach: [
    "DAU is distinct users per day. QPS is requests per second right now. R/W 100/0 means reads only, so there is no database.",
    "Availability 99% means at least 99 of 100 requests succeed. p99 under 800ms means 99 of 100 finish in under 0.8 seconds. p99 is the slow tail, not the average.",
    "Pick the HTTP cable, place the server, and drag Users onto it. Any piece in the tray can be placed. The numbers say whether it holds.",
  ],
  glossary: [
    { term: "DAU", means: "Daily active users. Here: 200." },
    { term: "QPS", means: "Requests per second. Here: 16." },
    { term: "R/W", means: "Reads / writes. 100/0 means only reads." },
    { term: "SLO", means: "99% of requests succeed." },
    { term: "p99", means: "The slowest 1% of requests. Under 800ms." },
    { term: "Budget", means: "Monthly cost of placed pieces. Max $16." },
    { term: "HTTP", means: "The cable from Users to the server." },
  ],
  dau: "200",
  qps: 16,
  readWrite: "100 / 0",
  latencySloMs: 800,
  availabilitySlo: 0.99,
  budget: 16,
  region: "Single region",
  nonGoals: "High availability, backups",
  duration: 28,
  seed: 1101,
  chaos: [
    {
      at: 12,
      duration: 8,
      mult: 1.7,
      label: "Traffic spike.",
    },
  ],
  palette: ["laptop"],
  cables: ["http"],
  preplaced: crowd("block"),
  copy: {
    ...emptyCopy,
    pass: [
      "The single server held this load.",
      "One host is one failure domain.",
      "If it exists once, it fails once.",
    ],
    warStory: "",
    failSaturated: [
      "The server saturated.",
      "One machine has no spare.",
      "One box is a demo, not a system.",
    ],
  },
};

const l2: LevelDef = {
  id: "l2",
  num: 2,
  title: "App and database",
  rank: "Junior",
  playable: true,
  tease: "Clients talk HTTP. The database talks SQL.",
  product: "Signup service",
  brief:
    "Writes have to land in a database. Users reach the application over HTTP. The application reaches Postgres over SQL.",
  scene: quay,
  teach: [
    "R/W is 80/20. p99 under 500ms. Availability 99.5%.",
    "N+1 turns one request into a dozen queries. A join asks once. Without an index on email, every lookup scans the table.",
    "The pool is a limited set of connections. Chatty queries hold them until new queries fail. Place the pieces in any order and change the settings. The metrics are the feedback.",
  ],
  glossary: [
    { term: "DAU", means: "Daily active users. Here: 8,000." },
    { term: "QPS", means: "Requests per second. Here: 70." },
    { term: "R/W", means: "Reads / writes. 80/20." },
    { term: "p99", means: "Slowest 1% of requests. Under 500ms." },
    { term: "SLO", means: "99.5% succeed, and p99 stays under 500ms." },
    { term: "HTTP", means: "Users to the application." },
    { term: "SQL", means: "Application to Postgres. Not for users." },
    { term: "Index", means: "Lets the database seek a row instead of scanning the table." },
    { term: "N+1", means: "One request that queries once per row." },
    { term: "Pool", means: "The limited number of database connections." },
  ],
  dau: "8,000",
  qps: 70,
  readWrite: "80 / 20",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 50,
  region: "Single region",
  nonGoals: "Cache, queue, extra services",
  duration: 32,
  seed: 2202,
  chaos: [
    {
      at: 14,
      duration: 10,
      mult: 2.1,
      label: "Signup spike.",
    },
  ],
  palette: ["app", "db"],
  cables: ["http", "sql"],
  preplaced: crowd("blob"),
  copy: {
    ...emptyCopy,
    pass: [
      "The application sits in front of the database.",
      "The index and the join keep the pool free.",
      "Ask for the rows once.",
    ],
    warStory: "",
  },
};

const l3: LevelDef = {
  id: "l3",
  num: 3,
  title: "Vertical scale",
  rank: "Junior",
  playable: true,
  tease: "One bigger machine, still one machine.",
  product: "Read-only page",
  brief:
    "Arrival rate passes the small server. A larger server is the same service with more capacity. It is still a single point of failure.",
  teach: [
    "QPS is 110, then about double. R/W is 100/0. No database.",
    "The small server does about 64 rps. The larger server does about 260. The budget fits the larger one, not both plus a spare.",
    "Place either server and cable Users to it with HTTP. If the small one queues, that is the feedback.",
  ],
  glossary: [
    { term: "DAU", means: "Daily active users. Here: 40,000." },
    { term: "QPS", means: "Requests per second. Here: 110, then a spike." },
    { term: "Vertical scale", means: "A bigger single machine, not a second one." },
    { term: "HTTP", means: "Users to the server." },
  ],
  dau: "40,000",
  qps: 110,
  readWrite: "100 / 0",
  latencySloMs: 700,
  availabilitySlo: 0.99,
  budget: 30,
  region: "Single region",
  nonGoals: "A second server, a database",
  duration: 30,
  seed: 3303,
  chaos: [{ at: 12, duration: 10, mult: 2, label: "Traffic spike." }],
  palette: ["laptop", "beacon"],
  cables: ["http"],
  scene: crescent,
  preplaced: crowd("crescent"),
  copy: {
    ...emptyCopy,
    pass: [
      "The larger server held the spike.",
      "Capacity came from one bigger machine. The ceiling came with it.",
      "Vertical scale is a bigger single point of failure.",
    ],
    warStory: "",
  },
};

const l4: LevelDef = {
  id: "l4",
  num: 4,
  title: "Load balancing",
  rank: "Mid",
  playable: true,
  tease: "Sticky sends every request to the first backend.",
  product: "Stateless reads",
  brief:
    "One app server saturates on the spike. A load balancer can spread traffic. Sticky does not.",
  teach: [
    "No database. HTTP only. QPS is 80, then almost double. One app server does about 100 rps.",
    "Sticky pins every request to the first backend you cable. Round robin uses the others.",
    "Place the load balancer and any number of app servers the budget allows. Cable them in any order. The saturation numbers show whether the balancer is actually balancing.",
  ],
  glossary: [
    { term: "QPS", means: "Requests per second. Here: 80, then a spike." },
    { term: "Load balancer", means: "Chooses which backend gets the next request." },
    { term: "Sticky", means: "Always the first backend. The spare stays idle." },
    { term: "HTTP", means: "Users to the balancer, balancer to each server." },
  ],
  dau: "25,000",
  qps: 80,
  readWrite: "100 / 0",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 48,
  region: "Single region",
  nonGoals: "A database, a cache",
  duration: 32,
  seed: 4404,
  chaos: [{ at: 12, duration: 8, mult: 1.8, label: "Traffic spike." }],
  palette: ["porch", "oven"],
  cables: ["http"],
  mustHttp: ["porch", "oven"],
  scene: bridge,
  preplaced: crowd("twin"),
  copy: {
    ...emptyCopy,
    pass: [
      "Traffic reached more than one server.",
      "A spare that receives nothing is idle capacity.",
      "A load balancer only helps if it balances.",
    ],
    warStory: "",
  },
};

const l5: LevelDef = {
  id: "l5",
  num: 5,
  title: "Read-your-writes",
  rank: "Mid",
  playable: true,
  tease: "A replica lags the primary.",
  product: "Read-after-write",
  brief:
    "Clients write, then immediately read. A stale replica does not contain that write, and the lag shows up as p99.",
  teach: [
    "Users reach the application over HTTP. The application reaches the replica over SQL.",
    "Read-your-writes serves the client its own save. A stale replica misses the SLO: p99 under 450ms.",
    "QPS is 40. Change the replica setting and watch p99. Nothing forces a particular piece order.",
  ],
  glossary: [
    { term: "Replica", means: "A copy that applies writes after the primary." },
    { term: "p99", means: "The slowest 1%. Under 450ms." },
    { term: "HTTP", means: "Users to the application." },
    { term: "SQL", means: "Application to the read replica." },
  ],
  dau: "12,000",
  qps: 40,
  readWrite: "70 / 30",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 48,
  region: "Single region",
  nonGoals: "A second application, a cache",
  duration: 30,
  seed: 5505,
  chaos: [{ at: 14, duration: 8, mult: 1.6, label: "Read spike." }],
  palette: ["booth", "echo"],
  cables: ["http", "sql"],
  scene: pier,
  preplaced: crowd("pier"),
  copy: {
    ...emptyCopy,
    pass: [
      "The client can read its own write.",
      "Replicas spread reads. They do not hide the latest write.",
      "Read-your-writes means the writer is not shown a stale copy.",
    ],
    warStory: "",
  },
};

const l6: LevelDef = {
  id: "l6",
  num: 6,
  title: "Cache stampede",
  rank: "Mid",
  playable: true,
  tease: "One shared TTL expires every key together.",
  product: "Cached read",
  brief:
    "A cache is fast until expiry. If every key expires at once, every client misses together and the application takes the full QPS.",
  teach: [
    "TTL is how long a cached value stays. Jitter gives each key its own expiry so some hits remain.",
    "Users use HTTP to the application. The application uses SQL to the cache. p99 stays under 450ms, including the spike.",
    "QPS is 45, then more than double. Change the TTL. The error and latency charts are the feedback.",
  ],
  glossary: [
    { term: "Cache", means: "A stored answer, so the next request can skip the source." },
    { term: "TTL", means: "How long that copy is allowed to stay." },
    { term: "Stampede", means: "Every key expires together, and every client misses at once." },
    { term: "p99", means: "The slowest 1%. Under 450ms." },
  ],
  dau: "18,000",
  qps: 45,
  readWrite: "95 / 5",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 46,
  region: "Single region",
  nonGoals: "A second application",
  duration: 32,
  seed: 6606,
  chaos: [{ at: 12, duration: 10, mult: 2.1, label: "Cache miss spike." }],
  palette: ["booth", "cache"],
  cables: ["http", "sql"],
  scene: atoll,
  preplaced: crowd("atoll"),
  copy: {
    ...emptyCopy,
    pass: [
      "Expiries are staggered.",
      "One shared TTL turns a quiet cache into a cliff.",
      "Expire keys at different times, or they miss together.",
    ],
    warStory: "",
  },
};

const l7: LevelDef = {
  id: "l7",
  num: 7,
  title: "CDN",
  rank: "Mid",
  playable: true,
  tease: "The origin is sized for misses, not for every client.",
  product: "Cached static response",
  brief:
    "Clients want the same response. The origin does about 36 rps. A CDN can store a public copy and absorb the rest.",
  teach: [
    "If the CDN stores nothing, every request hits the origin. Public cache-control lets it keep the response.",
    "QPS is 60, then more than double. No database. The response does not change during the lesson.",
    "Cable Users, the CDN, and the origin in any order. The origin's saturation shows whether the cache is on.",
  ],
  glossary: [
    { term: "CDN", means: "Stores responses near the client so the origin stays quiet." },
    { term: "Origin", means: "The server that produces the response." },
    { term: "Cache-Control", means: "Whether a response may be stored. Public means the CDN may keep it." },
    { term: "QPS", means: "Requests per second. Here: 60, then more." },
  ],
  dau: "60,000",
  qps: 60,
  readWrite: "100 / 0",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 40,
  region: "Single region",
  nonGoals: "A database, a second origin",
  duration: 32,
  seed: 7707,
  chaos: [{ at: 12, duration: 10, mult: 2.2, label: "Traffic spike." }],
  palette: ["cdn", "origin"],
  cables: ["http"],
  mustHttp: ["cdn", "origin"],
  scene: ridge,
  preplaced: crowd("ridge"),
  copy: {
    ...emptyCopy,
    pass: [
      "The CDN stored the response.",
      "Most clients should not reach the origin.",
      "Cache what does not change, close to the clients.",
    ],
    warStory: "",
  },
};

const l8: LevelDef = {
  id: "l8",
  num: 8,
  title: "Queue",
  rank: "Senior",
  playable: true,
  tease: "A burst can wait in a queue, or it can be dropped.",
  product: "Async work",
  brief:
    "The worker and the queue process at the same rate. The queue can hold a burst. The worker cannot.",
  teach: [
    "p99 may rise while the queue drains. It has to come back under 5 seconds, and almost no request may be lost.",
    "QPS is 22, then nearly triple for a short window. Waiting is inside the SLO. Dropping is not.",
    "Cable Users to either piece. Sending the burst straight to the worker drops the overflow. That drop is the feedback.",
  ],
  glossary: [
    { term: "Queue", means: "Holds work so a worker is not also the front door." },
    { term: "p99", means: "The slowest 1%. Here, up to 5 seconds." },
    { term: "SLO", means: "99% are delivered. Waiting is allowed. Dropping is not." },
    { term: "HTTP", means: "Users to the queue, and the queue to the worker." },
  ],
  dau: "9,000",
  qps: 22,
  readWrite: "20 / 80",
  latencySloMs: 5000,
  availabilitySlo: 0.99,
  budget: 40,
  region: "Single region",
  nonGoals: "A second worker, a database",
  duration: 40,
  seed: 8808,
  chaos: [{ at: 12, duration: 4, mult: 2.8, label: "Burst." }],
  palette: ["slot", "clerk"],
  cables: ["http"],
  mustHttp: ["slot", "clerk"],
  scene: steps,
  preplaced: crowd("steps"),
  copy: {
    ...emptyCopy,
    pass: [
      "The queue held the burst.",
      "A queue turns a spike into a wait.",
      "Absorb bursts in front of the worker.",
    ],
    warStory: "",
  },
};

const l9: LevelDef = {
  id: "l9",
  num: 9,
  title: "Rate limit",
  rank: "Senior",
  playable: true,
  tease: "Unlimited traffic spends the server on the spike.",
  product: "Read API",
  brief:
    "The app server does about 36 rps. A spike more than triples 20 QPS. A rate limiter can refuse the excess so accepted requests still succeed.",
  teach: [
    "Unlimited treats every caller the same, so the spike owns the server.",
    "Limiting the extra callers keeps accepted requests inside the SLO: 99.5% succeed, p99 under 600ms.",
    "Place the limiter and the server in any order. Leave the limiter open and the errors are the feedback.",
  ],
  glossary: [
    { term: "Rate limit", means: "A cap on accepted traffic so one caller cannot spend the server." },
    { term: "QPS", means: "Requests per second. Here: 20, then a spike." },
    { term: "SLO", means: "99.5% of accepted requests succeed, p99 under 600ms." },
    { term: "HTTP", means: "Users to the limiter, limiter to the server." },
  ],
  dau: "15,000",
  qps: 20,
  readWrite: "100 / 0",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 36,
  region: "Single region",
  nonGoals: "A database, a second server",
  duration: 32,
  seed: 9909,
  chaos: [{ at: 12, duration: 10, mult: 3.2, label: "Unwanted spike." }],
  palette: ["gate", "path"],
  cables: ["http"],
  mustHttp: ["gate", "path"],
  scene: moss,
  preplaced: crowd("courtyard"),
  copy: {
    ...emptyCopy,
    pass: [
      "Excess callers were refused.",
      "A limit helps when it refuses the extra traffic.",
      "Shed abusive traffic on purpose, or it sheds real users.",
    ],
    warStory: "",
  },
};

const l10: LevelDef = {
  id: "l10",
  num: 10,
  title: "Dual write",
  rank: "Senior",
  playable: true,
  tease: "Two stores updated independently will drift.",
  product: "Primary plus search",
  brief:
    "The primary is the source of truth. The search index is how clients look things up. Dual write can update one and miss the other, and it is slow.",
  teach: [
    "An outbox writes the primary once, then publishes that record to the index.",
    "Users reach the application over HTTP. SQL reaches whichever stores you cable. p99 under 300ms. QPS is 40.",
    "You do not have to cable both stores. Dual write on the index you do cable is what adds latency. The coach names the setting. The SLO says if it is too slow.",
  ],
  glossary: [
    { term: "Dual write", means: "Saving the same fact in two places and hoping both succeed." },
    { term: "Outbox", means: "Write once. A later step copies that record to the other store." },
    { term: "SQL", means: "Application to the primary and the search index." },
    { term: "p99", means: "The slowest 1%. Under 300ms." },
  ],
  dau: "20,000",
  qps: 40,
  readWrite: "80 / 20",
  latencySloMs: 300,
  availabilitySlo: 0.995,
  budget: 70,
  region: "Single region",
  nonGoals: "A cache, a second application",
  duration: 32,
  seed: 1010,
  chaos: [{ at: 14, duration: 8, mult: 1.7, label: "Read spike." }],
  palette: ["booth", "ledger", "search"],
  cables: ["http", "sql"],
  mustStores: ["ledger", "search"],
  scene: library,
  preplaced: crowd("lobes"),
  copy: {
    ...emptyCopy,
    pass: [
      "The index follows the primary.",
      "One write, then a copy.",
      "If two stores must match, one publishes and the other follows.",
    ],
    warStory: "",
  },
};

export const CAMPAIGN: LevelDef[] = [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, ...LATE].map((level) => {
  const budgeted = level.num < 11 ? level : { ...level, budget: Math.max(level.budget, 40 + level.num * 5) };
  const extra: GlossaryItem[] = [];
  if (budgeted.num >= 10) {
    extra.push(
      {
        term: "Several databases",
        means: "One service may query more than one database. Together is parallel. Chain adds every hop. Primary asks only the first.",
      },
      {
        term: "Gateway",
        means: "The front door. It routes. It does not store. Direct plus a facade and a leaf skips the facade.",
      },
      {
        term: "Facade",
        means: "One service in front of the others. Callers see one API. Behind it are services, databases, or both.",
      },
    );
  }
  if (budgeted.num >= 15) {
    extra.push({
      term: "Aggregator",
      means: "One API for several services. Scatter waits on the slowest. Chain adds every hop. First uses only the first response.",
    });
  }
  if (extra.length === 0) return budgeted;
  return { ...budgeted, glossary: [...budgeted.glossary, ...extra] };
});

export function getLevel(id: string): LevelDef {
  const level = CAMPAIGN.find((l) => l.id === id);
  if (!level) throw new Error(`unknown level ${id}`);
  return level;
}
