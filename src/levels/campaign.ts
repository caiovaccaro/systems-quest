import type { LevelDef, Rank } from "../engine/types";

const emptyCopy = {
  pass: ["", "", ""] as [string, string, string],
  warStory: "",
  failUnwired: [
    "Nothing is cabled to the users.",
    "Traffic fell on the floor. The internet is not telepathic.",
    "Principle: a server nobody can route to is modern art.",
  ] as [string, string, string],
  failProtocol: [
    "Users spoke HTTP at a database.",
    "Postgres does not serve landing pages. HR would like a word.",
    "Principle: put a process between humans and storage.",
  ] as [string, string, string],
  failNostore: [
    "The app had nowhere to put a row.",
    "Signup without a database is a very confident 500.",
    "Principle: if it has to remember, it needs a store.",
  ] as [string, string, string],
  failNoindex: [
    "Missing index. Every signup scanned the whole table.",
    "The pool filled up with queries that should have been seeks.",
    "Principle: if you filter it, index it, or enjoy the table scan.",
  ] as [string, string, string],
  failNplusone: [
    "N+1 queries. One click, a dozen round trips.",
    "The app chatted up the DB like a first date that would not end.",
    "Principle: fetch what you need in one shot. Loops over queries are outages.",
  ] as [string, string, string],
  failPool: [
    "Connection pool exhaustion. Math is undefeated.",
    "Twenty connections, hundreds of queries, all of them polite, all of them stuck.",
    "Principle: connections are a scarce lock. Don't hold them. Don't stampede them.",
  ] as [string, string, string],
  failSaturated: [
    "The box ran hot, queued, then started shedding 503s.",
    "Saturation is not a vibe. It is a queue that grew a personality.",
    "Principle: when input beats capacity, you drop, delay, or die. Pick on purpose.",
  ] as [string, string, string],
  failSlo: [
    "SLOs burned. Users felt it before you did.",
    "Averages looked fine. p99 did not. That is the usual murder weapon.",
    "Principle: you do not get to average away the slowest 1%.",
  ] as [string, string, string],
};

const l1: LevelDef = {
  id: "l1",
  num: 1,
  title: "Works on my machine",
  rank: "Junior",
  playable: true,
  tease: "One box. Then traffic.",
  product: "Marketing page",
  brief:
    "Ship a small landing page from the laptop on your desk. People are already clicking. Keep the promise until the meter fills.",
  teach: [
    "You are putting a tiny page on the internet. Real people will open it. Your job is a promise you can measure: almost every visit works, and even a slow visit is still quick.",
    "DAU means daily active users: how many different people show up in a day. 200 DAU is a small launch, a crowded cafe, not the whole planet.",
    "QPS means queries per second: how many clicks arrive every second. 16 QPS means about sixteen people hit the page each second. DAU is the crowd across a day. QPS is how hard they push right now.",
    "R/W means reads versus writes. A read looks something up, like opening the page. A write saves something, like a signup. 100/0 means this page is only looked at. Nothing is saved yet, so you do not need a database.",
    "An SLO is that promise. Availability 99% means at least 99 of every 100 visits succeed. p99 under 800ms means 99 of every 100 visits finish in under 0.8 seconds. p99 is the slow tail, not the average. Averages hide the person who is waiting.",
    "Budget is what the pieces cost per month. Region is the city where the computer sits. Non-goals are things you are allowed to skip on purpose.",
    "People do not magically reach the laptop. A browser talks to a page over HTTP: a short message that says “give me this page.” In the tray you will see an HTTP cable. Pick it, then drag People onto the laptop. That cable is the path a click takes.",
    "Drag the laptop onto the table, pick the HTTP cable, then drag the crowd onto the laptop. Traffic is already running. If the promise meter stays green and fills up, you pass.",
  ],
  glossary: [
    { term: "DAU", means: "Daily active users. Different people in a day. Here: 200." },
    { term: "QPS", means: "Queries per second. Clicks arriving each second. Here: 16." },
    { term: "R/W", means: "Reads / writes. Lookups versus saves. 100/0 means only lookups." },
    { term: "SLO", means: "The promise: 99% of visits succeed." },
    { term: "p99", means: "The slowest 1% of visits. Must finish under 800ms." },
    { term: "Budget", means: "Monthly cost of the pieces you place. Max $16." },
    { term: "HTTP", means: "How a browser asks a page for a response. The cable from People to the laptop." },
  ],
  dau: "200",
  qps: 16,
  readWrite: "100 / 0",
  latencySloMs: 800,
  availabilitySlo: 0.99,
  budget: 16,
  region: "us-east-1 (your apartment)",
  nonGoals: "HA, backups, dignity",
  duration: 28,
  seed: 1101,
  chaos: [
    {
      at: 12,
      duration: 8,
      mult: 1.7,
      label: "A sales guy tweeted the link. Brave.",
    },
  ],
  palette: ["laptop"],
  cables: ["http"],
  preplaced: [{ defId: "users", x: 1, z: 4, locked: true }],
  copy: {
    ...emptyCopy,
    pass: [
      "Traffic was polite. Your laptop held. Cute.",
      "A single host is a single point of failure with extra confidence.",
      "Principle: if it only exists once, it will die once.",
    ],
    warStory:
      "GitHub’s early hostname was, essentially, one box. Charming. Then it became a company.",
    failSaturated: [
      "The laptop melted. Blocking I/O plus a hug from the internet.",
      "No health check, no spare, no backup. Just a fan that sounded expensive.",
      "Principle: one box is a demo, not a system.",
    ],
  },
};

const l2: LevelDef = {
  id: "l2",
  num: 2,
  title: "Split the process",
  rank: "Junior",
  playable: true,
  tease: "App + DB. Now it can forget on purpose.",
  product: "Signup",
  brief:
    "People need to sign up, so something has to remember them. Split the work: an app talks to people, a database stores the row.",
  teach: [
    "A laptop with no notebook forgets everyone. Signup is a write: the page has to save a person and then find them again.",
    "DAU is 8,000: eight thousand different people in a day. That is a real Tuesday, not a demo. QPS is 70: seventy clicks every second while you watch.",
    "R/W is 80/20. About 80% of clicks are reads (looking someone up) and 20% are writes (saving a new signup). Writes have to land somewhere that keeps them.",
    "The SLO is stricter now. p99 under 500ms means the slowest 1% of signups still finish in half a second. Availability 99.5% means fewer than 1 in 200 requests may fail.",
    "The app is the program people talk to. Postgres is the database, the notebook. People should reach the app over HTTP. The app should reach the database over SQL. People should not talk to the database directly — a browser does not speak SQL.",
    "Two cables, two jobs. HTTP is the browser path. SQL is the database path. Pick the cable from the tray, then drag one piece onto the other. The label on the wire tells you which language is flowing.",
    "Two settings start out wrong, on purpose. N+1 means one click becomes a dozen questions. A single join asks once. An index is a bookmark on email. Without it, the database reads every row to find one person. That is called a table scan.",
    "A connection pool is a handful of phone lines into the database. If every little question holds a line, new questions wait and then fail. Fix the questions first. Drag pieces, change the settings, and watch the numbers. Red means the promise is already breaking.",
  ],
  glossary: [
    { term: "DAU", means: "Daily active users. Here: 8,000 different people a day." },
    { term: "QPS", means: "Clicks per second. Here: 70." },
    { term: "R/W", means: "Reads / writes. 80/20 means mostly lookups, some saves." },
    { term: "p99", means: "Slowest 1% of requests. Must stay under 500ms." },
    { term: "SLO", means: "The promise: 99.5% of requests succeed, and p99 stays under 500ms." },
    { term: "HTTP", means: "Browser language. People → app." },
    { term: "SQL", means: "Database language. App → Postgres. Not for people." },
    { term: "Index", means: "A bookmark so the database can jump to a row instead of reading all of them." },
    { term: "N+1", means: "One click that secretly asks the database once per item." },
    { term: "Pool", means: "The limited number of open lines into the database." },
  ],
  dau: "8,000",
  qps: 70,
  readWrite: "80 / 20",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 50,
  region: "us-east-1",
  nonGoals: "cache, queue, microservices",
  duration: 32,
  seed: 2202,
  chaos: [
    {
      at: 14,
      duration: 10,
      mult: 2.1,
      label: "Launch email landed. Everyone clicked signup.",
    },
  ],
  palette: ["app", "db"],
  cables: ["http", "sql"],
  preplaced: [{ defId: "users", x: 1, z: 4, locked: true }],
  copy: {
    ...emptyCopy,
    pass: [
      "You put a process in front of the data. Grown-up stuff.",
      "The index and the join are why the pool still has chairs.",
      "Principle: chatty APIs kill databases. Ask for what you need, once.",
    ],
    warStory:
      "Twitter’s early fail whale was, in part, a database drowning in web processes that would not shut up.",
  },
};

interface Stub {
  id: string;
  num: number;
  title: string;
  rank: Rank;
  tease: string;
}

const stubs: Stub[] = [
  { id: "l3", num: 3, title: "Buy a bigger laptop", rank: "Junior", tease: "Vertical scale has a ceiling. Finance finds it." },
  { id: "l4", num: 4, title: "Sticky and sorry", rank: "Mid", tease: "Load balancer. Sessions in memory. You will page." },
  { id: "l5", num: 5, title: "I just wrote that", rank: "Mid", tease: "Read replica lag. The user cannot see their own post." },
  { id: "l6", num: 6, title: "Just flush Redis", rank: "Mid", tease: "Cache stampede. TTL as a loaded gun." },
  { id: "l7", num: 7, title: "The origin is on fire", rank: "Mid", tease: "CDN. Cache-control. Geo. Origin overload." },
  { id: "l8", num: 8, title: "At least once", rank: "Senior", tease: "Queues, poison pills, retry storms." },
  { id: "l9", num: 9, title: "Please stop scraping", rank: "Senior", tease: "Rate limits: per IP, per user, unfairness." },
  { id: "l10", num: 10, title: "Two sources of truth", rank: "Senior", tease: "Search drift. Dual writes. Outbox is the adult move." },
  { id: "l11", num: 11, title: "Orphan blobs", rank: "Senior", tease: "Upload then write the row. Or don't." },
  { id: "l12", num: 12, title: "Auth is a SPOF", rank: "Senior", tease: "Sessions, JWTs, secret rotation, blast radius." },
  { id: "l13", num: 13, title: "Celebrity key", rank: "Staff", tease: "Bad shard key. One partition eats the world." },
  { id: "l14", num: 14, title: "Pick two", rank: "Staff", tease: "Multi-region. CAP in production, not on a slide." },
  { id: "l15", num: 15, title: "Distributed monolith", rank: "Staff", tease: "Twelve services, one outage, twelve rotations." },
  { id: "l16", num: 16, title: "The 30s timeout", rank: "Staff", tease: "Circuit breakers, bulkheads, backpressure." },
  { id: "l17", num: 17, title: "You can't see it", rank: "Staff", tease: "Metrics, traces, alert fatigue, SLOs vs symptoms." },
  { id: "l18", num: 18, title: "Exactly once, allegedly", rank: "Principal", tease: "Sagas, outbox, idempotency keys." },
  { id: "l19", num: 19, title: "Expand / contract", rank: "Principal", tease: "Migrations that lock tables. GDPR vs backups." },
  { id: "l20", num: 20, title: "Fan-out", rank: "Principal", tease: "Feeds, presence, thundering herds." },
  { id: "l21", num: 21, title: "Premature Kafka", rank: "Principal", tease: "The correct architecture bankrupts the company." },
  { id: "l22", num: 22, title: "No green field", rank: "Principal", tease: "Strangler fig. Dual-running. Feature flags." },
  { id: "l23", num: 23, title: "Conway called", rank: "Chief Architect", tease: "Org chart is the architecture. Always was." },
  { id: "l24", num: 24, title: "Tenant zero", rank: "Chief Architect", tease: "Threat model, isolation, supply chain." },
  { id: "l25", num: 25, title: "Write down what you'll break", rank: "Chief Architect", tease: "Five nines, strict consistency, tiny budget. Choose." },
];

function stubLevel(s: Stub): LevelDef {
  return {
    id: s.id,
    num: s.num,
    title: s.title,
    rank: s.rank,
    playable: false,
    tease: s.tease,
    product: "",
    brief: s.tease,
    teach: [],
    glossary: [],
    dau: "—",
    qps: 0,
    readWrite: "—",
    latencySloMs: 0,
    availabilitySlo: 0,
    budget: 0,
    region: "—",
    nonGoals: "—",
    duration: 0,
    seed: 0,
    chaos: [],
    palette: [],
    cables: [],
    preplaced: [],
    copy: emptyCopy,
  };
}

export const CAMPAIGN: LevelDef[] = [l1, l2, ...stubs.map(stubLevel)];

export function getLevel(id: string): LevelDef {
  const level = CAMPAIGN.find((l) => l.id === id);
  if (!level) throw new Error(`unknown level ${id}`);
  return level;
}
