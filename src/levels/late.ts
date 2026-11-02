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
  title: "Orphan plates",
  rank: "Senior",
  playable: true,
  tease: "A bay the color of a closed darkroom. Save the name before the glass.",
  product: "A portrait album",
  brief:
    "The darkroom bay is a U of pale stone in night water. A portrait is two things: a glass plate, and a row that says whose face it is. If the plate lands and the row does not, you own a picture nobody can find.",
  teach: [
    "An orphan is a file with no row, or a row with no file. The safe order is the album first, then the plate. If the plate fails, you retry it. If you only have the plate, you cannot even say who is missing.",
    "People reach the darkroom over HTTP. The darkroom reaches both the glass plate and the album over SQL.",
    "The plate starts by saving itself first. Open it and write the row first. p99 has to stay under 450ms.",
  ],
  glossary: [
    { term: "Orphan", means: "A picture with no row, or a row pointing at a picture that never arrived." },
    { term: "SQL", means: "Darkroom → glass plate, and darkroom → album." },
    { term: "p99", means: "The slowest 1% of portraits. Under 450ms." },
  ],
  dau: "14,000",
  qps: 36,
  readWrite: "40 / 60",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 62,
  region: "The darkroom bay",
  nonGoals: "a second darkroom, a cache",
  duration: 30,
  seed: 1111,
  chaos: [{ at: 12, duration: 8, mult: 1.5, label: "A wedding party wants every face." }],
  palette: ["darkroom", "plate", "album"],
  cables: ["http", "sql"],
  mustStores: ["plate", "album"],
  scene: darkroom,
  preplaced: crowd("bay"),
  copy: told(
    [
      "The album hears about the face before the glass is trusted.",
      "A file without a row is a junk drawer with better lighting.",
      "Principle: write the record first, then the blob it points at.",
    ],
    "The usual bug is the upload succeeding and the database insert never running. The object store fills with strangers.",
  ),
};

export const l12: LevelDef = {
  id: "l12",
  num: 12,
  title: "One stamp",
  rank: "Senior",
  playable: true,
  tease: "A long causeway. Every traveler should not wake the same desk.",
  product: "A landing permit",
  brief:
    "Customs harbor is a causeway to a round dock. Every traveler needs a yes. If that yes can only come from one stamp, the stamp is the harbor.",
  teach: [
    "Auth is a single point of failure when every request must ask one process that keeps the sessions in its own memory. A shared key lets any door check the traveler without waking the stamp.",
    "Cable People to the customs house with HTTP, and the customs house to the stamp with HTTP. Then open the customs house and share the key.",
    "The stamp can finish about 36 permits a second. The afternoon boat is much louder than that. A shared key means most travelers never touch it.",
  ],
  glossary: [
    { term: "Session", means: "The memory that a traveler was already allowed in." },
    { term: "Shared key", means: "Any door can check the permit, so one desk is not the whole harbor." },
    { term: "SPOF", means: "Single point of failure. The one thing whose death is everyone's." },
  ],
  dau: "50,000",
  qps: 60,
  readWrite: "90 / 10",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 40,
  region: "Customs harbor",
  nonGoals: "a second product, a database",
  duration: 32,
  seed: 1212,
  chaos: [{ at: 12, duration: 10, mult: 2.2, label: "The afternoon boat, all at the gate." }],
  palette: ["customs", "stamp"],
  cables: ["http"],
  mustHttp: ["customs", "stamp"],
  scene: harbor,
  preplaced: crowd("causeway"),
  copy: told(
    [
      "The doors can say yes without waking the stamp.",
      "A secret that must be asked, every time, becomes the outage.",
      "Principle: check auth close to the door. Do not make the signer the queue.",
    ],
    "Session stores that live in one process die with that process, and every other process waits.",
  ),
};

export const l13: LevelDef = {
  id: "l13",
  num: 13,
  title: "Famous names",
  rank: "Staff",
  playable: true,
  tease: "Three lanes of a market. Do not file the town under one celebrity.",
  product: "A directory",
  brief:
    "The name market is a fork of three lanes in green water. Names are filed in bins. If the bin is chosen by how famous the name is, one cupboard holds the crowd and the others hold dust.",
  teach: [
    "A shard key decides which bin stores a row. A good key spreads the work. A bad key — fame, a default tenant, a single hot id — makes one partition the whole system.",
    "Place two bins. The budget allows two, not a warehouse. SQL-cable the stall to both. People reach the stall over HTTP.",
    "Open the stall and spread the names. QPS is 60, and the market bell pushes it higher. One bin finishes about 80 lookups a second. Split, and each bin has room.",
  ],
  glossary: [
    { term: "Shard", means: "A slice of the data that lives in one place, chosen by a key." },
    { term: "Hot key", means: "The one value everyone shares, so one shard does all the work." },
    { term: "SQL", means: "The stall → each name bin." },
  ],
  dau: "30,000",
  qps: 60,
  readWrite: "80 / 20",
  latencySloMs: 500,
  availabilitySlo: 0.99,
  budget: 60,
  region: "The name market",
  nonGoals: "a cache, a third bin",
  duration: 32,
  seed: 1313,
  chaos: [{ at: 12, duration: 8, mult: 1.7, label: "Someone famous walked through the market." }],
  palette: ["stall", "bin"],
  cables: ["http", "sql"],
  mustStores: ["bin"],
  scene: market,
  preplaced: crowd("fork"),
  copy: told(
    [
      "The famous name is just another name. The bins share the work.",
      "A shard key is a load balancer you cannot move later without pain.",
      "Principle: pick a key that spreads. Fame, and 'default', do not.",
    ],
    "Celebrity partitions show up as one database on fire and several bored replicas of the wrong slice.",
  ),
};

export const l14: LevelDef = {
  id: "l14",
  num: 14,
  title: "This shore",
  rank: "Staff",
  playable: true,
  tease: "Two islets. You do not get to wait for both.",
  product: "A ferry booking",
  brief:
    "Two-shore strait is a pair of islands in deep blue water. A booking can be agreed on this shore now, or it can wait until the far shore has said the same thing. The promise you already sold does not include that wait.",
  teach: [
    "CAP, said plainly: when the shores cannot talk, you either stop and wait, or you answer with what this shore knows. You do not get both, and a slide that says you do is a future incident.",
    "People reach the ferry over HTTP. The ferry reaches the far shore's book over SQL. Open that book and choose this shore.",
    "Waiting for both shores costs about half a second. Your p99 budget is 450ms. The choice is the design.",
  ],
  glossary: [
    { term: "This shore", means: "Answer with local data. The other shore may be a moment behind." },
    { term: "Both shores", means: "Wait until every copy agrees. Correct, and often too slow." },
    { term: "p99", means: "The slowest 1%. Here, under 450ms. The wait does not fit." },
  ],
  dau: "11,000",
  qps: 32,
  readWrite: "70 / 30",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 48,
  region: "Two-shore strait",
  nonGoals: "a second ferry, five nines",
  duration: 30,
  seed: 1414,
  chaos: [{ at: 14, duration: 8, mult: 1.5, label: "Fog. The shores can barely see each other." }],
  palette: ["ferry", "farshore"],
  cables: ["http", "sql"],
  scene: strait,
  preplaced: crowd("twin"),
  copy: told(
    [
      "This shore answers. The far shore will catch up.",
      "You picked a promise that fits the water between the islands.",
      "Principle: write down which failure you accept. Waiting is also a failure if you sold speed.",
    ],
    "Multi-region 'strong consistency' is often a timeout waiting on a link that is having a bad day.",
  ),
};

export const l15: LevelDef = {
  id: "l15",
  num: 15,
  title: "One bench",
  rank: "Staff",
  playable: true,
  tease: "A round bakery. Do not turn one loaf into three phone calls.",
  product: "Saturday bread",
  brief:
    "One-bench bakery is a warm round island. The counter can bake the loaf itself, or it can phone the mixer, then the oven, then the till, and call that a architecture. One outage then has extra stairs.",
  teach: [
    "A distributed monolith is several services that still fail together, because each request needs all of them. You paid for the stairs and kept the single fate.",
    "Place the counter. People reach it over HTTP. Open it and serve from this bench.",
    "There is no database and no second building. The lesson is the call you do not make. p99 under 450ms.",
  ],
  glossary: [
    { term: "Chain", means: "One request that must visit every room before it may finish." },
    { term: "One bench", means: "The work happens in one place, so one failure is one failure." },
    { term: "p99", means: "The slowest 1% of loaves. Under 450ms." },
  ],
  dau: "9,000",
  qps: 40,
  readWrite: "100 / 0",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 24,
  region: "One-bench bakery",
  nonGoals: "microservices, a queue",
  duration: 30,
  seed: 1515,
  chaos: [{ at: 14, duration: 6, mult: 1.4, label: "The noon rush, still just bread." }],
  palette: ["counter"],
  cables: ["http"],
  scene: bakery,
  preplaced: crowd("blob"),
  copy: told(
    [
      "The loaf never left the bench.",
      "Splitting a process without splitting the fate is just latency with a pager rotation.",
      "Principle: a network call is not an architecture. Add one when a team or a scale forces it.",
    ],
    "The distributed monolith pages five teams for one failed request, and none of them can fix it alone.",
  ),
};

export const l16: LevelDef = {
  id: "l16",
  num: 16,
  title: "Trip the breaker",
  rank: "Staff",
  playable: true,
  tease: "A dusk cove. Stop waiting on a skiff that has already sunk.",
  product: "A tide table",
  brief:
    "Breaker cove is a bitten moon of dark water. The boathouse asks a little skiff for a number nobody urgently needs. When the skiff is silent, waiting the whole half-minute spends a promise you made to people who only wanted the tide.",
  teach: [
    "A timeout is how long you agree to wait. If it is longer than your SLO, the dependency's bad day becomes yours. A circuit breaker stops calling a thing that is already failing, and answers without it.",
    "Place the boathouse. People reach it over HTTP. When the water gets loud, open the boathouse and trip the breaker.",
    "The quiet minutes look fine either way. The spike is the exam. p99 under 500ms, including the minutes the skiff does not answer.",
  ],
  glossary: [
    { term: "Timeout", means: "How long you will wait before you give up on a call." },
    { term: "Breaker", means: "Stop calling a dependency that is failing, so your queue does not fill with hope." },
    { term: "SLO", means: "The promise. A wait longer than the promise is already a failure." },
  ],
  dau: "16,000",
  qps: 36,
  readWrite: "100 / 0",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 24,
  region: "Breaker cove",
  nonGoals: "a second boathouse, a database",
  duration: 32,
  seed: 1616,
  chaos: [{ at: 10, duration: 12, mult: 1.5, label: "The skiff is under the swell and not answering." }],
  palette: ["boathouse"],
  cables: ["http"],
  scene: skiff,
  preplaced: crowd("crescent"),
  copy: told(
    [
      "The tide table answers without the skiff.",
      "You stopped spending the promise on a call that could not succeed.",
      "Principle: fail fast, and fail the part that is actually dead.",
    ],
    "A 30 second timeout behind a 300ms promise is how a small dependency takes the site with it.",
  ),
};

export const l17: LevelDef = {
  id: "l17",
  num: 17,
  title: "Open the shutters",
  rank: "Staff",
  playable: true,
  tease: "A gray ridge in fog. You cannot fix a slowness you refuse to see.",
  product: "A room for the night",
  brief:
    "Fog inn sits on a pale ridge. The house is fine. The shutters are closed, so every slow visit is met with another try, and another, until the promise is gone and nobody can say which room was dark.",
  teach: [
    "If you cannot see the slow request, you will optimize the average and retry the tail. Retries without a trace make the tail heavier. A window — a trace, a p99, a single request you can follow — is the tool.",
    "Place the inn. People reach it over HTTP. Open the shutters. The inn stops guessing and the slow visits stay inside 450ms.",
    "There is nothing else to buy. The lesson is that the board's numbers are the window. Closed, they are a story you tell yourself.",
  ],
  glossary: [
    { term: "Trace", means: "One visit, followed through every room it entered, with the time it spent." },
    { term: "p99", means: "The slowest 1%. The average will look kind while this does not." },
    { term: "Retry", means: "Asking again. Without a view, retries are how a small slowness becomes a pile." },
  ],
  dau: "8,000",
  qps: 28,
  readWrite: "100 / 0",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 24,
  region: "Fog inn",
  nonGoals: "a second inn, a cache",
  duration: 30,
  seed: 1717,
  chaos: [{ at: 12, duration: 8, mult: 1.4, label: "A coach party in the fog, all asking for rooms." }],
  palette: ["inn"],
  cables: ["http"],
  scene: fog,
  preplaced: crowd("ridge"),
  copy: told(
    [
      "The shutters are open. The slow room is a room, not a rumor.",
      "You stopped retrying a thing you could not see.",
      "Principle: measure the tail before you add a retry.",
    ],
    "Alert fatigue is what happens when every average pages you and the one graph that mattered was never drawn.",
  ),
};

export const l18: LevelDef = {
  id: "l18",
  num: 18,
  title: "The same letter",
  rank: "Principal",
  playable: true,
  tease: "A night pier. A retried letter must not become a second letter.",
  product: "Letters that can be retried",
  brief:
    "Second-letter pier runs out over dark water. The boat retries anything it is not sure you kept. If the desk writes every arrival as new, one letter becomes three, and the desk drowns in its own caution.",
  teach: [
    "At least once means a message may arrive twice. Exactly once, in practice, is at least once plus an idempotency key: the same key is the same letter, and the second write does nothing.",
    "Place the key desk. People reach it over HTTP. Open it and require the key. A spike of retries should not multiply the work.",
    "QPS is quiet until the boat doubts itself. The desk can finish about 70 letters a second, once. Three writes per letter will not fit.",
  ],
  glossary: [
    { term: "At least once", means: "The letter may arrive again. Plan for that, or you will write it twice." },
    { term: "Idempotency key", means: "A name for this letter. Repeating the name does not repeat the work." },
    { term: "Retry", means: "Sending again because you did not see the first success." },
  ],
  dau: "7,000",
  qps: 18,
  readWrite: "10 / 90",
  latencySloMs: 900,
  availabilitySlo: 0.99,
  budget: 24,
  region: "Second-letter pier",
  nonGoals: "a second desk, a database",
  duration: 34,
  seed: 1818,
  chaos: [{ at: 12, duration: 6, mult: 2.4, label: "The boat retries every letter it cannot see." }],
  palette: ["keydesk"],
  cables: ["http"],
  scene: letters,
  preplaced: crowd("pier"),
  copy: told(
    [
      "The second arrival found the first letter and stopped.",
      "Retries are safe when the work knows its own name.",
      "Principle: idempotency keys turn at-least-once into something you can live with.",
    ],
    "Exactly-once is usually a slide. The working version is a key, a unique constraint, and a worker that can see a duplicate.",
  ),
};

export const l19: LevelDef = {
  id: "l19",
  num: 19,
  title: "Move the jars",
  rank: "Principal",
  playable: true,
  tease: "A green comb of shelves. Do not lock the cupboard to change its shape.",
  product: "A cupboard that is changing",
  brief:
    "The moving cupboard is a comb of green shelves. The jars need a new shape. Locking the whole cupboard while you move one jar means the town cannot put anything down, including the jars you are not touching.",
  teach: [
    "Expand, then migrate, then contract. Add the new column or table while the old one still serves. Copy the rows. Only when every reader uses the new shape do you drop the old one. A lock is the outage you scheduled.",
    "People reach the booth over HTTP. The booth reaches the shelf over SQL. Open the shelf and expand first.",
    "The quiet hour looks fine. The rush, while the lock is held, does not. p99 under 450ms.",
  ],
  glossary: [
    { term: "Expand", means: "Add the new shape beside the old one. Readers still work." },
    { term: "Contract", means: "Remove the old shape, only after nothing needs it." },
    { term: "Lock", means: "Stop the cupboard so a change can pretend it is alone. The town feels it." },
  ],
  dau: "13,000",
  qps: 36,
  readWrite: "70 / 30",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 46,
  region: "The moving cupboard",
  nonGoals: "a new database, a cache",
  duration: 32,
  seed: 1919,
  chaos: [{ at: 12, duration: 10, mult: 1.6, label: "Moving day, and the town still wants its jars." }],
  palette: ["booth", "shelf"],
  cables: ["http", "sql"],
  scene: cupboard,
  preplaced: crowd("comb"),
  copy: told(
    [
      "The new shape arrived beside the old one. Nobody was locked out.",
      "A migration that needs a lock is a migration that needs a smaller step.",
      "Principle: expand, backfill, switch readers, then drop.",
    ],
    "The long lock is often a single ALTER on a hot table, done at the hour someone called quiet.",
  ),
};

export const l20: LevelDef = {
  id: "l20",
  num: 20,
  title: "Let them look",
  rank: "Principal",
  playable: true,
  tease: "A ring of coral. Do not carry each note to every reader.",
  product: "A town notice",
  brief:
    "Notice green is a ring around still water. A new note can be carried to every follower, or the followers can walk up and read the board. Carrying multiplies one note by the size of the town.",
  teach: [
    "Fan-out on write does the work when the note is posted: one write becomes N deliveries. Fan-out on read does the work when someone looks, which is less than N if not everyone looks at once, and it stays one write.",
    "People reach the notice board over HTTP. The board reaches the feed over SQL. Open the board and let them read.",
    "Pushing to every follower turns one click into a handful of trips. p99 will not survive it. Pulling keeps one trip.",
  ],
  glossary: [
    { term: "Fan-out on write", means: "When you post, you also touch every follower. The crowd is the cost." },
    { term: "Fan-out on read", means: "The note is stored once. A reader assembles their view when they arrive." },
    { term: "p99", means: "The slowest 1% of notices. Under 500ms." },
  ],
  dau: "22,000",
  qps: 22,
  readWrite: "50 / 50",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 46,
  region: "Notice green",
  nonGoals: "a second board, a cache",
  duration: 32,
  seed: 2020,
  chaos: [{ at: 14, duration: 8, mult: 1.6, label: "A notice about the weather. Everyone cares." }],
  palette: ["notice", "feed"],
  cables: ["http", "sql"],
  scene: notices,
  preplaced: crowd("atoll"),
  copy: told(
    [
      "The note stays on the board. People come to it.",
      "You stopped multiplying the write by the size of the crowd.",
      "Principle: fan out on read until a write-time fan-out is a measured choice.",
    ],
    "Feed fan-out is how a single celebrity post becomes a queue of millions, unless the read assembles the page instead.",
  ),
};

export const l21: LevelDef = {
  id: "l21",
  num: 21,
  title: "The town can pay",
  rank: "Principal",
  playable: true,
  tease: "A small green square. The brass bus is magnificent and unaffordable.",
  product: "A till for the square",
  brief:
    "A town that can pay is a modest square of grass-colored tiles. The brass bus would move letters between buildings you do not have, and it costs more than the whole month. The till rings, and that is the system.",
  teach: [
    "The correct architecture for a company you are not is a kind of failure. A bus, a cluster, a platform team: each is a cost you pay before the problem exists. This town's budget is the till.",
    "Place the town till. People reach it over HTTP. Leave the brass bus in the tray. It will not fit the budget, and it does not need to.",
    "QPS is a square's worth of clicks, then a small rush. The till can hold it. p99 under 500ms.",
  ],
  glossary: [
    { term: "Budget", means: "What the town can pay per month. Here, $22. The bus is $64." },
    { term: "Till", means: "The smallest machine that meets the promise." },
    { term: "Bus", means: "A piece of infrastructure for a problem this town does not have yet." },
  ],
  dau: "4,000",
  qps: 40,
  readWrite: "80 / 20",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 22,
  region: "A town that can pay",
  nonGoals: "the brass bus, a platform team",
  duration: 30,
  seed: 2121,
  chaos: [{ at: 12, duration: 8, mult: 1.6, label: "Market morning. Still one square." }],
  palette: ["till", "bus"],
  cables: ["http"],
  scene: town,
  preplaced: crowd("block"),
  copy: told(
    [
      "The till rang. The bus stayed a drawing.",
      "You spent the budget on the promise, not on a future company.",
      "Principle: the architecture you cannot afford is the wrong architecture.",
    ],
    "Premature Kafka is a small team operating a distributed log for a workload a database would have finished.",
  ),
};

export const l22: LevelDef = {
  id: "l22",
  num: 22,
  title: "The old lane",
  rank: "Principal",
  playable: true,
  tease: "Steps down to an old mill. New visits peel off. The mill stays until it is quiet.",
  product: "A barn replacing a mill",
  brief:
    "The old mill lane is a staircase of worn stone. You do not get a green field. The mill is still the way into town. The barn is ready. New visits should go to the barn while the mill finishes what it already started.",
  teach: [
    "A strangler keeps the old path and sends new work to the new one, a slice at a time. You do not rewrite the town in a night. You peel routes until the old building is empty, and only then do you take it down.",
    "Cable People to the lane with HTTP, and the lane to the barn with HTTP. Open the lane and send new work to the barn.",
    "Leaving the lane on the old mill makes every visit pay the mill's delay. p99 under 600ms once the barn is actually receiving people.",
  ],
  glossary: [
    { term: "Strangler", means: "Replace a system by routing new work away from it, piece by piece." },
    { term: "Old lane", means: "The path you cannot delete until nothing important still uses it." },
    { term: "HTTP", means: "People → the lane → the barn." },
  ],
  dau: "18,000",
  qps: 36,
  readWrite: "80 / 20",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 40,
  region: "The old mill lane",
  nonGoals: "deleting the mill today, a database",
  duration: 32,
  seed: 2222,
  chaos: [{ at: 12, duration: 8, mult: 1.5, label: "A tour still follows the old signs." }],
  palette: ["lane", "barn"],
  cables: ["http"],
  mustHttp: ["lane", "barn"],
  scene: mill,
  preplaced: crowd("steps"),
  copy: told(
    [
      "New visits find the barn. The lane is still there for what remains.",
      "You replaced a building without closing the road.",
      "Principle: strangle by route, not by a weekend rewrite.",
    ],
    "Big-bang cutovers fail in the hour when both systems are half true and nobody owns the difference.",
  ),
};

export const l23: LevelDef = {
  id: "l23",
  num: 23,
  title: "One owner",
  rank: "Chief Architect",
  playable: true,
  tease: "Two houses that touch. A committee on the bridge is the architecture.",
  product: "A crossing",
  brief:
    "Two houses are two soft hills that share a span. Each house wants a vote before a boat leaves. The span waits for the meeting. The meeting is why the crossing is late.",
  teach: [
    "Conway's observation, in the water: the system will resemble the teams that ship it. Two owners of one crossing produce a queue made of people. One owner can be wrong, and you will see it. A committee is wrong more slowly.",
    "Cable People to the span with HTTP, and the span to the boat hall with HTTP. Open the span and give the crossing one owner.",
    "The hall is fast. The meeting is not. p99 under 600ms once a single house may let the boat go.",
  ],
  glossary: [
    { term: "One owner", means: "A single team may ship the crossing without a meeting." },
    { term: "Committee", means: "Every house must agree. The latency is the org chart." },
    { term: "HTTP", means: "People → the span → the boat hall." },
  ],
  dau: "10,000",
  qps: 32,
  readWrite: "70 / 30",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 36,
  region: "Two houses",
  nonGoals: "a third house, a platform",
  duration: 32,
  seed: 2323,
  chaos: [{ at: 14, duration: 8, mult: 1.4, label: "Both houses scheduled a review at the same hour." }],
  palette: ["span", "hall"],
  cables: ["http"],
  mustHttp: ["span", "hall"],
  scene: houses,
  preplaced: crowd("lobes"),
  copy: told(
    [
      "One house lets the boat go.",
      "The span stopped waiting for a meeting that was the outage.",
      "Principle: the owner of a path should be one team, or the path will wait for all of them.",
    ],
    "Conway's law is not a joke about diagrams. It is why a simple change needs six teams and still ships late.",
  ),
};

export const l24: LevelDef = {
  id: "l24",
  num: 24,
  title: "A wall",
  rank: "Chief Architect",
  playable: true,
  tease: "A court with a garden and a neighbor. Their sale must not be your outage.",
  product: "Rooms for more than one tenant",
  brief:
    "The warded court is a green square with a garden in the middle. You share it with another tenant. Their market day reads the same table you do. When they rush, your promise moves with them, because there is no wall.",
  teach: [
    "Isolation is the product when more than one tenant shares a system. A shared table means a noisy neighbor, a bad query, or a leaked row is everyone's incident. A wall is a separate budget: data, connections, and failure.",
    "People reach the booth over HTTP. The booth reaches the ward over SQL. Open the ward and put a wall between tenants.",
    "The neighbor's sale is the spike. Without a wall it becomes your p99. Under 450ms, even then.",
  ],
  glossary: [
    { term: "Tenant", means: "Someone who shares your system and must not share your fate." },
    { term: "Noisy neighbor", means: "Their load spends your connections, your disk, or your p99." },
    { term: "Wall", means: "A boundary in data and failure, not only in the contract." },
  ],
  dau: "20,000",
  qps: 40,
  readWrite: "75 / 25",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 48,
  region: "The warded court",
  nonGoals: "a second region, a cache",
  duration: 32,
  seed: 2424,
  chaos: [{ at: 12, duration: 10, mult: 2, label: "The neighbor's market day, on your table." }],
  palette: ["booth", "ward"],
  cables: ["http", "sql"],
  scene: wards,
  preplaced: crowd("courtyard"),
  copy: told(
    [
      "The neighbor's sale stays on their side of the wall.",
      "Your promise no longer moves when they rush.",
      "Principle: isolation is a limit on connections, data, and failure. A logo on the login page is not a wall.",
    ],
    "Tenant zero is you. If you would not share a production table with a stranger, do not share it with a customer.",
  ),
};

export const l25: LevelDef = {
  id: "l25",
  num: 25,
  title: "The promise you can keep",
  rank: "Chief Architect",
  playable: true,
  tease: "A pale bay and one stone. Write the promise this budget can pay.",
  product: "A charter",
  brief:
    "Charter stone is a quiet bay of pale rock. The stone currently promises five nines, every shore, and no lost letter. This island has one machine and a small budget. The honest promise is the one the stone can keep.",
  teach: [
    "The last job is to write down what you will not do. Five nines, strict agreement across the water, and a tiny budget cannot all be true. Name the one you are selling. Put the others on the stone as declined, so nobody rediscovers them in an incident.",
    "Place the charter. People reach it over HTTP. Open it and write the honest promise: this shore, this budget.",
    "The poem of five nines makes every visit wait for shores you do not have. The honest line finishes inside 500ms. That is the game, and it was the job the whole time.",
  ],
  glossary: [
    { term: "Charter", means: "The promise, including what you refuse to promise." },
    { term: "Five nines", means: "99.999% up. Minutes a year. Not this island, not this budget." },
    { term: "p99", means: "The slowest 1%. The honest charter keeps it under 500ms." },
  ],
  dau: "6,000",
  qps: 24,
  readWrite: "90 / 10",
  latencySloMs: 500,
  availabilitySlo: 0.99,
  budget: 18,
  region: "Charter stone",
  nonGoals: "five nines, every shore, a second machine",
  duration: 30,
  seed: 2525,
  chaos: [{ at: 12, duration: 8, mult: 1.5, label: "A quiet spike. The stone still has to mean it." }],
  palette: ["charter"],
  cables: ["http"],
  scene: stone,
  preplaced: crowd("bay"),
  copy: told(
    [
      "The stone says what this island will do, and what it will not.",
      "You declined the promises that were poems.",
      "Principle: an SLO you cannot pay for is a lie with a dashboard.",
    ],
    "The architect's last artifact is the list of guarantees the company agreed not to sell.",
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
  title: "Two books",
  rank: "Chief Architect",
  playable: true,
  tease: "A person and their posts live in different houses. Each house keeps its own book.",
  product: "A page across two services",
  brief:
    "Two ledgers sit on facing islets. The profile house remembers the person. The timeline house remembers the posts. A page has to read both, and a new post has to be written so both books agree. Neither house opens the other's book.",
  teach: [
    "Database per service means the profile service is the only thing that reads and writes the profile book, and the timeline service is the only thing that reads and writes the post book. A join across them does not exist.",
    "A backend for frontend is the read and the synchronous write. People reach it over HTTP. It calls both services, and each service uses SQL to its own database. Scatter-gather: the page waits on the slower house, not the sum.",
    "Kafka is the other write. The service that accepts the change writes its own book, then publishes. Cable both services to Kafka with the Kafka cable. The log delivers the event, and the other service writes it into its own book. A work queue that wakes only one worker leaves a book blank.",
    "Turn the index on for each database. One shared database, a facade that queries the books itself, or a door that calls only one house will not keep this promise. p99 under 900ms.",
  ],
  glossary: [
    {
      term: "Database per service",
      means: "Each service owns its book. The other service does not query it. There is no join across the water.",
    },
    {
      term: "Backend for frontend",
      means: "One door for one screen. It calls each service for the read, and it can call each service for the write. It does not hold the rows.",
    },
    {
      term: "Event",
      means: "A fact on a log. The writer saves its book, then publishes. Every other house on the log saves the fact into its own book.",
    },
  ],
  dau: "18,000",
  qps: 14,
  readWrite: "60 / 40",
  latencySloMs: 900,
  availabilitySlo: 0.995,
  budget: 140,
  region: "Two ledgers",
  nonGoals: "one shared database, a query that skips the services",
  duration: 32,
  seed: 2626,
  chaos: [{ at: 14, duration: 8, mult: 1.4, label: "A post, and everyone opens the person who wrote it." }],
  palette: ["bff", "profile", "timeline", "kafkalog"],
  cables: ["http", "sql", "kafka"],
  owners: ["profile", "timeline"],
  scene: books,
  preplaced: crowd("twin"),
  copy: told(
    [
      "Each house kept its own book. The page still showed both.",
      "A write reached the other house without opening its cupboard.",
      "Principle: own your data. Compose reads at the door, or carry writes on a log.",
    ],
    "The shared database is how a microservice diagram quietly becomes one database with extra network hops.",
  ),
};

export const LATE: LevelDef[] = [
  l11, l12, l13, l14, l15, l16, l17, l18, l19, l20, l21, l22, l23, l24, l25, l26,
];
