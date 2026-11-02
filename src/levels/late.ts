import type { IslandShape, LevelDef, SceneDef } from "../engine/types";
import { anchor } from "./island";

function crowd(shape: IslandShape): LevelDef["preplaced"] {
  const spot = anchor(shape);
  return [{ defId: "users", x: spot.x, z: spot.z, locked: true }];
}

function told(pass: [string, string, string], warStory: string): LevelDef["copy"] {
  const blank: [string, string, string] = ["", "", ""];
  return {
    pass,
    warStory,
    failUnwired: blank,
    failProtocol: blank,
    failNostore: blank,
    failNoindex: blank,
    failNplusone: blank,
    failPool: blank,
    failSaturated: blank,
    failSlo: blank,
  };
}

const darkroom: SceneDef = {
  place: "The darkroom bay",
  shape: "bay",
  water: 0x243044,
  cliff: 0x5c6b73,
  tileA: 0xc5d0d8,
  tileB: 0x8aa0b4,
  accent: 0xf0c14a,
};
const harbor: SceneDef = {
  place: "Customs harbor",
  shape: "causeway",
  water: 0x2a6a78,
  cliff: 0xc4a484,
  tileA: 0xf3e6cf,
  tileB: 0xe7c9a0,
  accent: 0xc46a45,
};
const market: SceneDef = {
  place: "The name market",
  shape: "fork",
  water: 0x3e7a6a,
  cliff: 0xd08a62,
  tileA: 0xf6e2a8,
  tileB: 0xe7c49a,
  accent: 0xe07a3c,
};
const strait: SceneDef = {
  place: "Two-shore strait",
  shape: "twin",
  water: 0x3a6ea5,
  cliff: 0x8aa0b4,
  tileA: 0xe7eef2,
  tileB: 0xb7c9d6,
  accent: 0xf0c14a,
};
const bakery: SceneDef = {
  place: "One-bench bakery",
  shape: "blob",
  water: 0xc47a4a,
  cliff: 0x8d6246,
  tileA: 0xf6e2a8,
  tileB: 0xf3c98a,
  accent: 0xe07a3c,
};
const skiff: SceneDef = {
  place: "Breaker cove",
  shape: "crescent",
  water: 0x1e3a5f,
  cliff: 0x3d4a66,
  tileA: 0x6a7594,
  tileB: 0x8d97b0,
  accent: 0xe07a5f,
};
const fog: SceneDef = {
  place: "Fog inn",
  shape: "ridge",
  water: 0x6a7a84,
  cliff: 0x8d97b0,
  tileA: 0xd5dde2,
  tileB: 0xb7c4cc,
  accent: 0xf0c14a,
};
const letters: SceneDef = {
  place: "Second-letter pier",
  shape: "pier",
  water: 0x24324a,
  cliff: 0x6a5344,
  tileA: 0xe7d3b1,
  tileB: 0xc4a484,
  accent: 0xf0c14a,
};
const cupboard: SceneDef = {
  place: "The moving cupboard",
  shape: "comb",
  water: 0x2f6b55,
  cliff: 0x6a8f62,
  tileA: 0xd5e2b8,
  tileB: 0xb7c98a,
  accent: 0xf2c14e,
};
const notices: SceneDef = {
  place: "Notice green",
  shape: "atoll",
  water: 0x1f6a62,
  cliff: 0xc46a45,
  tileA: 0xf6c9a2,
  tileB: 0xf0e0c0,
  accent: 0xe07a5f,
};
const town: SceneDef = {
  place: "A town that can pay",
  shape: "block",
  water: 0x4a7a62,
  cliff: 0x7d9a78,
  tileA: 0xe7e6c8,
  tileB: 0xc9d4a8,
  accent: 0xc4894f,
};
const mill: SceneDef = {
  place: "The old mill lane",
  shape: "steps",
  water: 0x6a5344,
  cliff: 0x8d6246,
  tileA: 0xe4c89a,
  tileB: 0xc4a484,
  accent: 0xf0c14a,
};
const houses: SceneDef = {
  place: "Two houses",
  shape: "lobes",
  water: 0x5a5370,
  cliff: 0x6e5a78,
  tileA: 0xe4d4e8,
  tileB: 0xc9c4d4,
  accent: 0xf0a05a,
};
const wards: SceneDef = {
  place: "The warded court",
  shape: "courtyard",
  water: 0x1e4a3c,
  cliff: 0x3d6b4f,
  tileA: 0xc9d6b8,
  tileB: 0x8faf86,
  accent: 0xf0c14a,
};
const stone: SceneDef = {
  place: "Charter stone",
  shape: "bay",
  water: 0x3a4d56,
  cliff: 0xd9d3c5,
  tileA: 0xf7f4ee,
  tileB: 0xe7e0d4,
  accent: 0xc46a45,
};

export const l11: LevelDef = {
  id: "l11",
  num: 11,
  title: "Write order",
  rank: "Senior",
  playable: true,
  tease: "An object without a metadata row cannot be found.",
  product: "Upload",
  brief:
    "An upload is an object and a row that names it. Saving the object first leaves an orphan if the row never lands.",
  teach: [
    "Write the metadata row first, then the object. If the object fails, retry it. If you only have the object, you cannot name what is missing.",
    "Users reach the upload service over HTTP. SQL reaches object storage and the metadata database, in any order you cable them.",
    "Object-first adds latency. p99 under 450ms. The setting is the feedback, not a required sequence of pieces.",
  ],
  glossary: [
    { term: "Orphan", means: "An object with no row, or a row pointing at an object that never arrived." },
    { term: "SQL", means: "Upload service to object storage and the metadata database." },
    { term: "p99", means: "The slowest 1%. Under 450ms." },
  ],
  dau: "14,000",
  qps: 36,
  readWrite: "40 / 60",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 62,
  region: "Single region",
  nonGoals: "A second upload service, a cache",
  duration: 30,
  seed: 1111,
  chaos: [{ at: 12, duration: 8, mult: 1.5, label: "Upload spike." }],
  palette: ["darkroom", "plate", "album"],
  cables: ["http", "sql"],
  mustStores: ["plate", "album"],
  scene: darkroom,
  preplaced: crowd("bay"),
  copy: told(
    [
      "The metadata row is written before the object.",
      "A blob without a row cannot be found.",
      "Write the record first, then the blob it points at.",
    ],
    "",
  ),
};

export const l12: LevelDef = {
  id: "l12",
  num: 12,
  title: "Shared session",
  rank: "Senior",
  playable: true,
  tease: "Calling auth on every request makes auth the outage.",
  product: "Authenticated API",
  brief:
    "Every request needs a yes. If that yes can only come from one auth service, that service is the system.",
  teach: [
    "A shared signing key lets the proxy check the token locally. Asking the auth service every time puts that service on the critical path.",
    "The auth service does about 36 rps. The spike is louder. A shared key means most requests never reach it.",
    "Place the proxy and the auth service in any order. The latency shows whether every request still waits on auth.",
  ],
  glossary: [
    { term: "Session", means: "State that says this client was already allowed in." },
    { term: "Shared key", means: "Any proxy can check the token, so one process is not the whole system." },
    { term: "SPOF", means: "Single point of failure. The one thing whose death fails everyone." },
  ],
  dau: "50,000",
  qps: 60,
  readWrite: "90 / 10",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 40,
  region: "Single region",
  nonGoals: "A second product, a database",
  duration: 32,
  seed: 1212,
  chaos: [{ at: 12, duration: 10, mult: 2.2, label: "Auth spike." }],
  palette: ["customs", "stamp"],
  cables: ["http"],
  mustHttp: ["customs", "stamp"],
  scene: harbor,
  preplaced: crowd("causeway"),
  copy: told(
    [
      "The proxy can authorize without calling auth.",
      "A check that must be asked every time becomes the outage.",
      "Check auth at the edge. Do not make the signer the queue.",
    ],
    "",
  ),
};

export const l13: LevelDef = {
  id: "l13",
  num: 13,
  title: "Sharding",
  rank: "Staff",
  playable: true,
  tease: "A hot shard key puts every request on one partition.",
  product: "Directory",
  brief:
    "A shard key chooses the partition. A hot key fills one shard and leaves the others idle.",
  teach: [
    "A useful key spreads the work. Fame, a default tenant, or one hot id makes one partition the system.",
    "The budget fits two shards. One shard does about 80 rps. QPS is 60, then higher.",
    "Place as many shards as you want to try and cable the router to them. Even hash versus hot key is the feedback.",
  ],
  glossary: [
    { term: "Shard", means: "A slice of the data in one place, chosen by a key." },
    { term: "Hot key", means: "The one value everyone shares, so one shard does the work." },
    { term: "SQL", means: "Shard router to each shard." },
  ],
  dau: "30,000",
  qps: 60,
  readWrite: "80 / 20",
  latencySloMs: 500,
  availabilitySlo: 0.99,
  budget: 60,
  region: "Single region",
  nonGoals: "A cache, a third shard",
  duration: 32,
  seed: 1313,
  chaos: [{ at: 12, duration: 8, mult: 1.7, label: "Hot key spike." }],
  palette: ["stall", "bin"],
  cables: ["http", "sql"],
  mustStores: ["bin"],
  scene: market,
  preplaced: crowd("fork"),
  copy: told(
    [
      "The shards share the work.",
      "A shard key is a load balancer you cannot move later without a migration.",
      "Pick a key that spreads. A hot value, and 'default', do not.",
    ],
    "",
  ),
};

export const l14: LevelDef = {
  id: "l14",
  num: 14,
  title: "Local quorum",
  rank: "Staff",
  playable: true,
  tease: "Waiting for the other region does not fit the SLO.",
  product: "Write API",
  brief:
    "A write can commit locally, or wait until the remote replica agrees. The latency SLO does not include that wait.",
  teach: [
    "When the regions cannot talk, you wait or you answer with local data. You do not get both.",
    "Users reach the write service over HTTP. SQL reaches the remote replica. Waiting for both regions costs about half a second. p99 is 450ms.",
    "Local quorum is a setting. The p99 chart is the feedback.",
  ],
  glossary: [
    { term: "Local quorum", means: "Answer with local data. The other region may lag." },
    { term: "Both regions", means: "Wait until every copy agrees. Often too slow." },
    { term: "p99", means: "The slowest 1%. Under 450ms. The remote wait does not fit." },
  ],
  dau: "11,000",
  qps: 32,
  readWrite: "70 / 30",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 48,
  region: "Two regions",
  nonGoals: "A second write service, five nines",
  duration: 30,
  seed: 1414,
  chaos: [{ at: 14, duration: 8, mult: 1.5, label: "Cross-region delay." }],
  palette: ["ferry", "farshore"],
  cables: ["http", "sql"],
  scene: strait,
  preplaced: crowd("twin"),
  copy: told(
    [
      "This region answers. The other region catches up.",
      "The promise matches the latency you can pay.",
      "Name the failure you accept. Waiting is a failure if you sold speed.",
    ],
    "",
  ),
};

export const l15: LevelDef = {
  id: "l15",
  num: 15,
  title: "One service",
  rank: "Staff",
  playable: true,
  tease: "A call chain adds every hop and still fails together.",
  product: "Read API",
  brief:
    "The monolith can answer in process, or call a chain of services for one request. The chain is extra latency with the same failure domain.",
  teach: [
    "A distributed monolith is several services that still fail together, because each request needs all of them.",
    "Users reach the monolith over HTTP. In-process keeps p99 under 450ms. There is no database.",
    "The call-style setting is the choice. You are not required to add more services.",
  ],
  glossary: [
    { term: "Chain", means: "One request that must call every service before it finishes." },
    { term: "In process", means: "The work happens in one service, so one failure is one failure." },
    { term: "p99", means: "The slowest 1%. Under 450ms." },
  ],
  dau: "9,000",
  qps: 40,
  readWrite: "100 / 0",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 24,
  region: "Single region",
  nonGoals: "Extra services, a queue",
  duration: 30,
  seed: 1515,
  chaos: [{ at: 14, duration: 6, mult: 1.4, label: "Traffic spike." }],
  palette: ["counter"],
  cables: ["http"],
  scene: bakery,
  preplaced: crowd("blob"),
  copy: told(
    [
      "The request stayed in one process.",
      "Splitting a process without splitting the failure domain adds latency.",
      "Add a network call when a team or a scale forces it.",
    ],
    "",
  ),
};

export const l16: LevelDef = {
  id: "l16",
  num: 16,
  title: "Circuit breaker",
  rank: "Staff",
  playable: true,
  tease: "A timeout longer than the SLO spends the SLO.",
  product: "Read API",
  brief:
    "The client calls a dependency it can skip. Waiting out a dead dependency spends the latency budget.",
  teach: [
    "A timeout is how long you agree to wait. If it is longer than the SLO, the dependency's failure becomes yours.",
    "A circuit breaker stops calling a dependency that is already failing and answers without it.",
    "Users reach the client over HTTP. p99 under 500ms, including the minutes the dependency does not answer.",
  ],
  glossary: [
    { term: "Timeout", means: "How long you will wait before you give up on a call." },
    { term: "Breaker", means: "Stop calling a dependency that is failing." },
    { term: "SLO", means: "A wait longer than the promise is already a failure." },
  ],
  dau: "16,000",
  qps: 36,
  readWrite: "100 / 0",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 24,
  region: "Single region",
  nonGoals: "A second client, a database",
  duration: 32,
  seed: 1616,
  chaos: [{ at: 10, duration: 12, mult: 1.5, label: "Dependency timeout." }],
  palette: ["boathouse"],
  cables: ["http"],
  scene: skiff,
  preplaced: crowd("crescent"),
  copy: told(
    [
      "The API answers without the dead dependency.",
      "The SLO is not spent on a call that cannot succeed.",
      "Fail the part that is dead.",
    ],
    "",
  ),
};

export const l17: LevelDef = {
  id: "l17",
  num: 17,
  title: "Tracing",
  rank: "Staff",
  playable: true,
  tease: "Retries without a trace make the tail heavier.",
  product: "Read API",
  brief:
    "Slow requests are retried because nothing records them. The average stays fine. p99 does not.",
  teach: [
    "If you cannot see the slow request, you tune the average and retry the tail. Retries without a trace add load.",
    "Users reach the service over HTTP. Tracing keeps p99 under 450ms.",
    "The charts are the signal. The tracing setting is the change.",
  ],
  glossary: [
    { term: "Trace", means: "One request, followed through each hop, with the time it spent." },
    { term: "p99", means: "The slowest 1%. The average can look fine while this does not." },
    { term: "Retry", means: "Asking again. Without a trace, retries turn a small delay into a pile." },
  ],
  dau: "8,000",
  qps: 28,
  readWrite: "100 / 0",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 24,
  region: "Single region",
  nonGoals: "A second service, a cache",
  duration: 30,
  seed: 1717,
  chaos: [{ at: 12, duration: 8, mult: 1.4, label: "Retry spike." }],
  palette: ["inn"],
  cables: ["http"],
  scene: fog,
  preplaced: crowd("ridge"),
  copy: told(
    [
      "Slow requests are visible.",
      "Retries are not hiding the tail.",
      "Measure the tail before you add a retry.",
    ],
    "",
  ),
};

export const l18: LevelDef = {
  id: "l18",
  num: 18,
  title: "Idempotent writes",
  rank: "Principal",
  playable: true,
  tease: "A retry without a key writes a second record.",
  product: "Write API",
  brief:
    "Clients retry when they are not sure the write landed. Writing every arrival as new multiplies the work.",
  teach: [
    "At-least-once delivery means a request may arrive twice. An idempotency key makes the second write a no-op.",
    "Users reach the API over HTTP. The API does about 70 rps once. Three writes per request will not fit.",
    "Turn the key on and watch the error rate during the retry spike.",
  ],
  glossary: [
    { term: "At least once", means: "The request may arrive again. Plan for that, or you write it twice." },
    { term: "Idempotency key", means: "An id for this request. Repeating the id does not repeat the work." },
    { term: "Retry", means: "Sending again because the first success was not seen." },
  ],
  dau: "7,000",
  qps: 18,
  readWrite: "10 / 90",
  latencySloMs: 900,
  availabilitySlo: 0.99,
  budget: 24,
  region: "Single region",
  nonGoals: "A second API, a database",
  duration: 34,
  seed: 1818,
  chaos: [{ at: 12, duration: 6, mult: 2.4, label: "Retry storm." }],
  palette: ["keydesk"],
  cables: ["http"],
  scene: letters,
  preplaced: crowd("pier"),
  copy: told(
    [
      "The second arrival found the first write and stopped.",
      "Retries are safe when the write has an id.",
      "An idempotency key makes at-least-once usable.",
    ],
    "",
  ),
};

export const l19: LevelDef = {
  id: "l19",
  num: 19,
  title: "Schema migration",
  rank: "Principal",
  playable: true,
  tease: "A table lock is a scheduled outage.",
  product: "Read/write API",
  brief:
    "The schema is changing. Locking the table blocks writes that do not touch the column you are moving.",
  teach: [
    "Expand, backfill, then contract. Add the new column while the old one still serves. Copy the rows. Drop the old column only after readers use the new one.",
    "Users reach the application over HTTP. SQL reaches the database. p99 under 450ms while traffic is high.",
    "Lock versus expand-backfill-contract is a setting. The latency during the spike is the feedback.",
  ],
  glossary: [
    { term: "Expand", means: "Add the new shape beside the old one. Readers still work." },
    { term: "Contract", means: "Remove the old shape only after nothing needs it." },
    { term: "Lock", means: "Block writers so the change can pretend it is alone." },
  ],
  dau: "13,000",
  qps: 36,
  readWrite: "70 / 30",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 46,
  region: "Single region",
  nonGoals: "A new database, a cache",
  duration: 32,
  seed: 1919,
  chaos: [{ at: 12, duration: 10, mult: 1.6, label: "Write spike during migration." }],
  palette: ["booth", "shelf"],
  cables: ["http", "sql"],
  scene: cupboard,
  preplaced: crowd("comb"),
  copy: told(
    [
      "The new column arrived beside the old one.",
      "A migration that needs a lock needs a smaller step.",
      "Expand, backfill, switch readers, then drop.",
    ],
    "",
  ),
};

export const l20: LevelDef = {
  id: "l20",
  num: 20,
  title: "Fan-out on read",
  rank: "Principal",
  playable: true,
  tease: "Fan-out on write multiplies one post by the follower count.",
  product: "Feed",
  brief:
    "A new post can be pushed to every follower, or assembled when someone reads. Pushing multiplies one write by the audience.",
  teach: [
    "Fan-out on write turns one post into N deliveries. Fan-out on read stores the post once and builds the view on read.",
    "Users reach the feed service over HTTP. SQL reaches the feed store. p99 under 500ms.",
    "Switch the fan-out setting. The latency of a write is the feedback.",
  ],
  glossary: [
    { term: "Fan-out on write", means: "On post, also touch every follower. The audience is the cost." },
    { term: "Fan-out on read", means: "Store the post once. Assemble the view when someone reads." },
    { term: "p99", means: "The slowest 1%. Under 500ms." },
  ],
  dau: "22,000",
  qps: 22,
  readWrite: "50 / 50",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 46,
  region: "Single region",
  nonGoals: "A second feed service, a cache",
  duration: 32,
  seed: 2020,
  chaos: [{ at: 14, duration: 8, mult: 1.6, label: "Popular post." }],
  palette: ["notice", "feed"],
  cables: ["http", "sql"],
  scene: notices,
  preplaced: crowd("atoll"),
  copy: told(
    [
      "The post is stored once.",
      "The write is not multiplied by the follower count.",
      "Fan out on read until a write-time fan-out is measured.",
    ],
    "",
  ),
};

export const l21: LevelDef = {
  id: "l21",
  num: 21,
  title: "Cost",
  rank: "Principal",
  playable: true,
  tease: "A message bus costs more than this workload needs.",
  product: "Small API",
  brief:
    "The message bus costs more than the monthly budget. The app server meets the SLO without it.",
  teach: [
    "A bus, a cluster, or a platform team is a cost you pay before the problem exists. This budget is $22. The bus is $64.",
    "Place the app server and cable Users to it with HTTP. The bus can sit in the tray. Placing it fails the budget.",
    "QPS is small, then a modest spike. p99 under 500ms.",
  ],
  glossary: [
    { term: "Budget", means: "Monthly spend. Here, $22. The bus is $64." },
    { term: "App server", means: "The smallest machine that meets the SLO." },
    { term: "Message bus", means: "Infrastructure for a problem this workload does not have yet." },
  ],
  dau: "4,000",
  qps: 40,
  readWrite: "80 / 20",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 22,
  region: "Single region",
  nonGoals: "A message bus, a platform team",
  duration: 30,
  seed: 2121,
  chaos: [{ at: 12, duration: 8, mult: 1.6, label: "Small spike." }],
  palette: ["till", "bus"],
  cables: ["http"],
  scene: town,
  preplaced: crowd("block"),
  copy: told(
    [
      "The app server held the traffic.",
      "The budget went to the SLO, not to unused infrastructure.",
      "The architecture you cannot afford is the wrong one.",
    ],
    "",
  ),
};

export const l22: LevelDef = {
  id: "l22",
  num: 22,
  title: "Strangler",
  rank: "Principal",
  playable: true,
  tease: "New traffic can move before the legacy service is deleted.",
  product: "Migration",
  brief:
    "The legacy service is still on the path. The replacement is ready. New requests should go to the replacement while the legacy service finishes what it already has.",
  teach: [
    "A strangler keeps the old path and sends new work to the new one, a slice at a time. Delete the old service when it is empty.",
    "Cable Users, the router, and the new service in any order. Sending every request to legacy pays the legacy delay.",
    "p99 under 600ms once new traffic reaches the replacement.",
  ],
  glossary: [
    { term: "Strangler", means: "Replace a system by routing new work away from it, one route at a time." },
    { term: "Legacy", means: "The path you cannot delete until nothing important still uses it." },
    { term: "HTTP", means: "Users to the router, router to the new service." },
  ],
  dau: "18,000",
  qps: 36,
  readWrite: "80 / 20",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 40,
  region: "Single region",
  nonGoals: "Deleting the legacy service today, a database",
  duration: 32,
  seed: 2222,
  chaos: [{ at: 12, duration: 8, mult: 1.5, label: "Legacy traffic." }],
  palette: ["lane", "barn"],
  cables: ["http"],
  mustHttp: ["lane", "barn"],
  scene: mill,
  preplaced: crowd("steps"),
  copy: told(
    [
      "New requests reach the replacement.",
      "The legacy path is still there for what remains.",
      "Strangle by route, not by a cutover.",
    ],
    "",
  ),
};

export const l23: LevelDef = {
  id: "l23",
  num: 23,
  title: "One owner",
  rank: "Chief Architect",
  playable: true,
  tease: "Two approvers on one path make every request wait.",
  product: "Request path",
  brief:
    "Two teams must approve every request. The wait is the org chart, and it misses the latency SLO.",
  teach: [
    "The system will resemble the teams that ship it. Two owners of one path produce a queue of people. One owner can be wrong, and you will see it.",
    "Cable Users, the gateway, and the service in any order. Single owner versus every-team approval is the setting.",
    "p99 under 600ms once one team can let the request through.",
  ],
  glossary: [
    { term: "One owner", means: "A single team can ship the path without a meeting." },
    { term: "Committee", means: "Every team must agree. The latency is the org chart." },
    { term: "HTTP", means: "Users to the gateway, gateway to the service." },
  ],
  dau: "10,000",
  qps: 32,
  readWrite: "70 / 30",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 36,
  region: "Single region",
  nonGoals: "A third team, a platform",
  duration: 32,
  seed: 2323,
  chaos: [{ at: 14, duration: 8, mult: 1.4, label: "Approval delay." }],
  palette: ["span", "hall"],
  cables: ["http"],
  mustHttp: ["span", "hall"],
  scene: houses,
  preplaced: crowd("lobes"),
  copy: told(
    [
      "One team lets the request through.",
      "The path is not waiting on a meeting.",
      "One path should have one owner, or it waits for all of them.",
    ],
    "",
  ),
};

export const l24: LevelDef = {
  id: "l24",
  num: 24,
  title: "Tenant isolation",
  rank: "Chief Architect",
  playable: true,
  tease: "A shared table makes one tenant's spike everyone's p99.",
  product: "Multi-tenant API",
  brief:
    "Two tenants share a table. One tenant's spike spends the connections and the latency budget.",
  teach: [
    "Isolation is a separate budget for data, connections, and failure. A shared table means a noisy neighbor, a bad query, or a leaked row is everyone's incident.",
    "Users reach the application over HTTP. SQL reaches the database. p99 under 450ms during the other tenant's spike.",
    "Shared versus isolated is a setting. The p99 during the spike is the feedback.",
  ],
  glossary: [
    { term: "Tenant", means: "A customer who shares the system and must not share its failures." },
    { term: "Noisy neighbor", means: "Their load spends your connections, disk, or p99." },
    { term: "Isolation", means: "A boundary in data and failure, not only in the contract." },
  ],
  dau: "20,000",
  qps: 40,
  readWrite: "75 / 25",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 48,
  region: "Single region",
  nonGoals: "A second region, a cache",
  duration: 32,
  seed: 2424,
  chaos: [{ at: 12, duration: 10, mult: 2, label: "Noisy neighbor." }],
  palette: ["booth", "ward"],
  cables: ["http", "sql"],
  scene: wards,
  preplaced: crowd("courtyard"),
  copy: told(
    [
      "The other tenant's spike stays on their side.",
      "Your p99 no longer moves with their load.",
      "Isolation limits connections, data, and failure.",
    ],
    "",
  ),
};

export const l25: LevelDef = {
  id: "l25",
  num: 25,
  title: "The SLO you can keep",
  rank: "Chief Architect",
  playable: true,
  tease: "Five nines in every region does not fit this budget.",
  product: "SLO",
  brief:
    "The service currently promises five nines, every region, and no loss. One machine and a small budget cannot pay for that.",
  teach: [
    "Write down what you will not promise. Five nines, cross-region agreement, and a tiny budget cannot all be true.",
    "Users reach the service over HTTP. The honest SLO finishes inside 500ms. The five-nines setting waits on regions you do not have.",
    "Change the SLO setting. p99 is the feedback.",
  ],
  glossary: [
    { term: "SLO", means: "The promise, including what you refuse to promise." },
    { term: "Five nines", means: "99.999% up. Minutes a year. Not this budget." },
    { term: "p99", means: "The slowest 1%. The honest SLO keeps it under 500ms." },
  ],
  dau: "6,000",
  qps: 24,
  readWrite: "90 / 10",
  latencySloMs: 500,
  availabilitySlo: 0.99,
  budget: 18,
  region: "Single region",
  nonGoals: "Five nines, every region, a second machine",
  duration: 30,
  seed: 2525,
  chaos: [{ at: 12, duration: 8, mult: 1.5, label: "Traffic spike." }],
  palette: ["charter"],
  cables: ["http"],
  scene: stone,
  preplaced: crowd("bay"),
  copy: told(
    [
      "The SLO matches this region and this budget.",
      "The promises you cannot pay for are declined.",
      "An SLO you cannot pay for is a false dashboard.",
    ],
    "",
  ),
};

const books: SceneDef = {
  place: "Two ledgers",
  shape: "twin",
  water: 0x243044,
  cliff: 0x6b4f8a,
  tileA: 0xe4d8c4,
  tileB: 0xc9b79c,
  accent: 0x5b8fd6,
};

export const l26: LevelDef = {
  id: "l26",
  num: 26,
  title: "Database per service",
  rank: "Chief Architect",
  playable: true,
  tease: "Each service owns its database. There is no join across them.",
  product: "Profile and timeline",
  brief:
    "Profile data and timeline data live in different services. A page reads both. A write has to reach both without either service querying the other's database.",
  teach: [
    "Database per service means profile is the only reader and writer of the profile database, and timeline is the only reader and writer of the post database.",
    "A backend for frontend can call both services. Each service uses SQL to its own database. Scatter waits on the slower call, not the sum. You can also try other pieces. The latency and errors say what happened.",
    "Kafka is one way to carry a write: the service saves its own database, then publishes. The other service consumes and writes its own copy. A queue that wakes only one worker leaves the other database unchanged.",
    "Index each database you use. A shared database is slow to stay consistent and the coach will say so. p99 under 900ms. Nothing is locked until another piece is placed.",
  ],
  glossary: [
    {
      term: "Database per service",
      means: "Each service owns its database. The other service does not query it. There is no cross-service join.",
    },
    {
      term: "Backend for frontend",
      means: "One API for one screen. It calls each service. It does not hold the rows.",
    },
    {
      term: "Event",
      means: "A fact on a log. The writer saves its database, then publishes. Subscribers save their own copy.",
    },
  ],
  dau: "18,000",
  qps: 14,
  readWrite: "60 / 40",
  latencySloMs: 900,
  availabilitySlo: 0.995,
  budget: 140,
  region: "Single region",
  nonGoals: "One shared database, a query that skips the services",
  duration: 32,
  seed: 2626,
  chaos: [{ at: 14, duration: 8, mult: 1.4, label: "Read spike." }],
  palette: ["bff", "profile", "timeline", "kafkalog"],
  cables: ["http", "sql", "kafka"],
  owners: ["profile", "timeline"],
  scene: books,
  preplaced: crowd("twin"),
  copy: told(
    [
      "Each service kept its own database.",
      "A write reached the other service without querying its database.",
      "Own the data. Compose reads in front, or carry writes on a log.",
    ],
    "",
  ),
};

export const LATE: LevelDef[] = [
  l11, l12, l13, l14, l15, l16, l17, l18, l19, l20, l21, l22, l23, l24, l25, l26,
];
