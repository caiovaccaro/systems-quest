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
  tease: "One lamp on a square of sand. Then the street finds it.",
  product: "A page on the stoop",
  brief:
    "The stoop is a square little island, warm as a kitchen tile. Put the landing page on the laptop by the door. People are already on the shore, clicking. Keep the promise until the meter fills.",
  scene: stoop,
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
  region: "The stoop, east shore",
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
  preplaced: crowd("block"),
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
  tease: "A round market island. The stall talks. The book remembers.",
  product: "A signup book",
  brief:
    "Fishmarket quay is a soft round island in greener water. People want their names in a book. The stall talks to them. The book is a different building, and it speaks a different language.",
  scene: quay,
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
  region: "Fishmarket quay",
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
  preplaced: crowd("blob"),
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

const l3: LevelDef = {
  id: "l3",
  num: 3,
  title: "A taller lamp",
  rank: "Junior",
  playable: true,
  tease: "The tour boat is coming. The desk lamp will not do.",
  product: "The lighthouse page",
  brief:
    "Lighthouse crescent is a bitten moon of slate and sand, in water the color of dusk. A tour boat has the link. The laptop on the desk is a lovely small flame. The beacon is the same cottage with a taller lamp.",
  teach: [
    "This island is only a curve of rock. One building still answers everyone. That is vertical scale: you make the one box bigger, you do not yet add a second.",
    "DAU is 40,000. A tour boat, not the whole coast. QPS is 110 clicks each second, and for a while the boat's horn makes it about twice that.",
    "R/W is 100/0. They only look. Nothing is saved, so there is still no notebook and no SQL cable.",
    "The laptop finishes about 64 visits a second. The beacon finishes about 260. The budget fits the beacon, not the beacon and a spare. One taller lamp still goes dark if the bulb dies. You are buying time, and you should feel that.",
    "Place the beacon, pick HTTP, and drag People onto it. If you leave them on the laptop, the queue becomes the lesson.",
  ],
  glossary: [
    { term: "DAU", means: "Different people in a day. Here: 40,000, a full tour boat." },
    { term: "QPS", means: "Clicks per second. Here: 110, then a spike." },
    { term: "Vertical scale", means: "A bigger single machine, instead of a second one." },
    { term: "HTTP", means: "The cable from People to the lamp that serves the page." },
  ],
  dau: "40,000",
  qps: 110,
  readWrite: "100 / 0",
  latencySloMs: 700,
  availabilitySlo: 0.99,
  budget: 30,
  region: "Lighthouse crescent",
  nonGoals: "a second lamp, a database",
  duration: 30,
  seed: 3303,
  chaos: [{ at: 12, duration: 10, mult: 2, label: "The tour boat blew its horn." }],
  palette: ["laptop", "beacon"],
  cables: ["http"],
  scene: crescent,
  preplaced: crowd("crescent"),
  copy: {
    ...emptyCopy,
    pass: [
      "The taller lamp held the boat.",
      "You bought capacity by making one thing bigger. The receipt is the ceiling.",
      "Principle: vertical scale is a bigger single point of failure.",
    ],
    warStory: "A lot of first launches are one larger server and a promise to split it later. Later arrives on a Tuesday.",
  },
};

const l4: LevelDef = {
  id: "l4",
  num: 4,
  title: "Two kitchens",
  rank: "Mid",
  playable: true,
  tease: "A bridge between two bakeries. Do not send the town to one door.",
  product: "Saturday bread",
  brief:
    "Butter bridge is two honey-colored islets with a short span between them. Saturday wants bread from both kitchens. A porch can share the line. If it remembers the first door and never lets go, one oven smokes and the other stays cold.",
  teach: [
    "One oven can feed a morning. The spike is the whole town crossing the bridge at once. You need two ovens, and a porch that actually uses both.",
    "HTTP still carries the people. There is no database on this island. Bread is baked, not stored.",
    "Sticky means every guest is sent to the first oven they would have touched, which here is simply the first one you cabled. Share the line means the porch alternates.",
    "Place the porch and two ovens. The budget is enough for that and not for a third. Cable People to the porch with HTTP, then the porch to each oven with HTTP. Open the porch and share the line.",
    "QPS is 80, and the Saturday bell almost doubles it. One oven finishes about 100 loaves a second. Split the town and each oven has room.",
  ],
  glossary: [
    { term: "QPS", means: "Clicks per second. Here: 80, then the Saturday bell." },
    { term: "Porch", means: "A load balancer. It chooses which kitchen gets the next guest." },
    { term: "Sticky", means: "Always the same kitchen. A rush then ignores the spare." },
    { term: "HTTP", means: "People → porch, and porch → each oven." },
  ],
  dau: "25,000",
  qps: 80,
  readWrite: "100 / 0",
  latencySloMs: 500,
  availabilitySlo: 0.995,
  budget: 48,
  region: "Butter bridge",
  nonGoals: "a database, a cache",
  duration: 32,
  seed: 4404,
  chaos: [{ at: 12, duration: 8, mult: 1.8, label: "The Saturday bell. Both shores at once." }],
  palette: ["porch", "oven"],
  cables: ["http"],
  mustHttp: ["porch", "oven"],
  scene: bridge,
  preplaced: crowd("twin"),
  copy: {
    ...emptyCopy,
    pass: [
      "Both ovens worked. The bridge earned its name.",
      "A spare that never receives traffic is furniture.",
      "Principle: a load balancer only helps if it balances.",
    ],
    warStory: "Sticky sessions feel polite until one instance owns the celebrity and the other instances watch.",
  },
};

const l5: LevelDef = {
  id: "l5",
  num: 5,
  title: "I just wrote that",
  rank: "Mid",
  playable: true,
  tease: "The ink pier copies the book. The copy is a breath behind.",
  product: "A guestbook",
  brief:
    "Ink pier is a pale dock over bright water. Visitors write a line and immediately look for it. The echo pond repeats the book, beautifully, a moment late. Their own sentence is the one they cannot find.",
  teach: [
    "A replica is a second notebook that copies the first. It is wonderful for sharing the reading. It is a bad place to look if you just wrote, unless you ask it to serve the fresh line.",
    "People reach the booth over HTTP. The booth reaches the pond over SQL. A browser still does not speak SQL.",
    "The pond starts a moment behind. That delay shows up as p99: the slowest visits are the ones staring at a page that does not contain their sentence yet. Open the pond and choose read your own ink.",
    "DAU is 12,000. QPS is 40. The SLO wants the slowest 1% under 450ms. A pond that lags by a third of a second cannot keep that promise.",
  ],
  glossary: [
    { term: "Replica", means: "A copy of the book, filled in after the original write." },
    { term: "p99", means: "The slowest 1% of visits. Here they must finish under 450ms." },
    { term: "HTTP", means: "People → the booth." },
    { term: "SQL", means: "The booth → the echo pond." },
  ],
  dau: "12,000",
  qps: 40,
  readWrite: "70 / 30",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 48,
  region: "Ink pier",
  nonGoals: "a second booth, a cache",
  duration: 30,
  seed: 5505,
  chaos: [{ at: 14, duration: 8, mult: 1.6, label: "A school group found the guestbook." }],
  palette: ["booth", "echo"],
  cables: ["http", "sql"],
  scene: pier,
  preplaced: crowd("pier"),
  copy: {
    ...emptyCopy,
    pass: [
      "The writer can see their own ink.",
      "Copies are for sharing reads, not for hiding the last write.",
      "Principle: read-your-writes means the person who just saved is not shown a stale copy.",
    ],
    warStory: "The classic bug is a user refreshing and deciding the save failed, because the replica had not caught up.",
  },
};

const l6: LevelDef = {
  id: "l6",
  num: 6,
  title: "The jars go dark",
  rank: "Mid",
  playable: true,
  tease: "An atoll of lanterns. They must not expire together.",
  product: "The fireworks card",
  brief:
    "Lantern atoll is a ring of coral around a pool of deep green. The card that says when the fireworks start is hung in jars along the path. If every jar goes dark on the same minute, the whole ring asks the booth again, together.",
  teach: [
    "A cache is a remembered answer. It is fast until it expires. TTL is how long a jar stays lit.",
    "If every jar shares one expiry, the moment they go dark is a stampede. The booth, which was resting, suddenly meets the entire atoll.",
    "Jitter means each jar picks its own minute. Some are always still lit, so the booth only meets a trickle.",
    "People use HTTP to the booth. The booth uses SQL to the jars. Open the cache and let each jar expire on its own. p99 has to stay under 450ms, including the minute the sky fills.",
  ],
  glossary: [
    { term: "Cache", means: "A copy of an answer, kept so you do not ask again." },
    { term: "TTL", means: "Time to live. How long that copy is allowed to stay." },
    { term: "Stampede", means: "Every copy dies together, and every visitor asks at once." },
    { term: "p99", means: "The slowest 1%. Here, under 450ms." },
  ],
  dau: "18,000",
  qps: 45,
  readWrite: "95 / 5",
  latencySloMs: 450,
  availabilitySlo: 0.995,
  budget: 46,
  region: "Lantern atoll",
  nonGoals: "a second booth",
  duration: 32,
  seed: 6606,
  chaos: [{ at: 12, duration: 10, mult: 2.1, label: "The first firework. Everyone refreshes." }],
  palette: ["booth", "cache"],
  cables: ["http", "sql"],
  scene: atoll,
  preplaced: crowd("atoll"),
  copy: {
    ...emptyCopy,
    pass: [
      "The jars stayed staggered. The booth kept its breath.",
      "A cache with one shared clock is a bell that rings the whole town.",
      "Principle: expire copies at different times, or they all miss together.",
    ],
    warStory: "A cache stampede is often just a round TTL and a popular key. The database never sees the quiet minutes, only the cliff.",
  },
};

const l7: LevelDef = {
  id: "l7",
  num: 7,
  title: "Postcards",
  rank: "Mid",
  playable: true,
  tease: "A white ridge. The press is small. The loft should keep the copies.",
  product: "A printed card",
  brief:
    "Postcard ridge is a pale diagonal of stone in bright water. Visitors want the same card. The press at the far end can only print a few at a time. The loft above the path can keep a stack of finished ones.",
  teach: [
    "A CDN is a shed of copies closer to the visitors. The origin is the press that makes the original. If the loft keeps nothing, every person walks the whole ridge.",
    "Cable People to the loft with HTTP, and the loft to the press with HTTP. Then open the loft and keep a public copy. About nine of ten visitors take a card from the shelf. The press only meets the rest.",
    "QPS is 60, and a clear afternoon doubles it. The press finishes about 36 cards a second. It cannot be the whole plan.",
    "There is no database. The card does not change while you watch.",
  ],
  glossary: [
    { term: "CDN", means: "Copies kept near the visitors, so the origin stays quiet." },
    { term: "Origin", means: "The one machine that actually produces the page. Here, the press." },
    { term: "Cache-Control", means: "The note that says a copy may be reused. Public means the loft may keep it." },
    { term: "QPS", means: "Cards asked for each second. Here: 60, then more." },
  ],
  dau: "60,000",
  qps: 60,
  readWrite: "100 / 0",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 40,
  region: "Postcard ridge",
  nonGoals: "a database, a second press",
  duration: 32,
  seed: 7707,
  chaos: [{ at: 12, duration: 10, mult: 2.2, label: "The ridge is in someone else's photograph." }],
  palette: ["cdn", "origin"],
  cables: ["http"],
  mustHttp: ["cdn", "origin"],
  scene: ridge,
  preplaced: crowd("ridge"),
  copy: {
    ...emptyCopy,
    pass: [
      "The loft kept the cards. The press stayed a press.",
      "Most visitors should never meet the origin.",
      "Principle: cache what does not change, close to the people who ask.",
    ],
    warStory: "Origin overload is what happens when a CDN is in the diagram and cache-control still says not to keep anything.",
  },
};

const l8: LevelDef = {
  id: "l8",
  num: 8,
  title: "Night mail",
  rank: "Senior",
  playable: true,
  tease: "Indigo steps. The slot can hold what the clerk cannot catch.",
  product: "Letters home",
  brief:
    "Night steps drop through dark water toward a single lit desk. A handful of letters is a pleasant job. The midnight boat is not. A brass slot can hold the pile. A clerk with letters shoved into their hands will drop them.",
  teach: [
    "A queue is a place to wait on purpose. The worker then takes one letter at a time, at their own pace. The promise is that letters are not dropped, even if a few of them wait.",
    "The slot and the clerk finish letters at the same calm speed. The difference is the slot's patience. Hand the boat straight to the clerk and the ones at the back hit the floor. Give them to the slot and they wait in the brass mouth until the desk is free.",
    "Cable People to the slot with HTTP, and the slot to the clerk with HTTP. p99 may climb while the boat is unloading. It has to come back down before the level ends, and almost no letter may be lost.",
    "QPS is 22 in the quiet, and the boat is nearly three times that for a short while. The SLO allows the slow tail to reach 5 seconds. Dropped letters do not get that kindness.",
  ],
  glossary: [
    { term: "Queue", means: "A line that holds work so a busy worker is not also the front door." },
    { term: "p99", means: "The slowest 1% of letters. Here they may take up to 5 seconds." },
    { term: "SLO", means: "99% of letters are delivered. Waiting is allowed. Dropping is not." },
    { term: "HTTP", means: "People → the slot, and the slot → the clerk." },
  ],
  dau: "9,000",
  qps: 22,
  readWrite: "20 / 80",
  latencySloMs: 5000,
  availabilitySlo: 0.99,
  budget: 40,
  region: "Night steps",
  nonGoals: "a second clerk, a database",
  duration: 40,
  seed: 8808,
  chaos: [{ at: 12, duration: 4, mult: 2.8, label: "The midnight boat, all at once." }],
  palette: ["slot", "clerk"],
  cables: ["http"],
  mustHttp: ["slot", "clerk"],
  scene: steps,
  preplaced: crowd("steps"),
  copy: {
    ...emptyCopy,
    pass: [
      "The slot held the boat. The clerk kept their pace.",
      "A queue turns a spike into a wait. That is a choice, and it is kinder than a drop.",
      "Principle: absorb bursts in front of the worker, not in the worker's hands.",
    ],
    warStory: "Retries on a failing worker make a queue louder. This desk is the quieter lesson: hold the work, do not throw it.",
  },
};

const l9: LevelDef = {
  id: "l9",
  num: 9,
  title: "Pigeons",
  rank: "Senior",
  playable: true,
  tease: "A moss court with a pond in the middle. The gate has to learn manners.",
  product: "A garden walk",
  brief:
    "Moss courtyard is a green square with a still pond in the middle, so you walk around the water. People come to see the ferns. Pigeons come to ask for the same path a thousand times. The gravel is narrow. The latch on the gate is the whole design.",
  teach: [
    "A rate limit decides who is allowed to spend the path. Wide open treats a pigeon and a person as the same guest. The path then belongs to whoever shouts.",
    "Fair means the gate keeps enough of the path for real visitors and turns the extra pigeons around without counting them as broken visits. The people who came for the ferns still get through.",
    "Cable People to the gate with HTTP, and the gate to the footpath with HTTP. Open the gate and set the latch. QPS is only 20 until the flock arrives and more than triples it. The path can carry about 36 walkers a second.",
  ],
  glossary: [
    { term: "Rate limit", means: "A cap on how much traffic you accept, so one caller cannot spend the whole budget." },
    { term: "QPS", means: "Walkers per second. Here: 20, then a flock." },
    { term: "SLO", means: "99.5% of the visits you accepted should succeed, under 600ms at the slow end." },
    { term: "HTTP", means: "People → the gate → the footpath." },
  ],
  dau: "15,000",
  qps: 20,
  readWrite: "100 / 0",
  latencySloMs: 600,
  availabilitySlo: 0.995,
  budget: 36,
  region: "Moss courtyard",
  nonGoals: "a database, a second path",
  duration: 32,
  seed: 9909,
  chaos: [{ at: 12, duration: 10, mult: 3.2, label: "The pigeons found the path." }],
  palette: ["gate", "path"],
  cables: ["http"],
  mustHttp: ["gate", "path"],
  scene: moss,
  preplaced: crowd("courtyard"),
  copy: {
    ...emptyCopy,
    pass: [
      "The ferns stayed walkable. The pigeons took the hint.",
      "A limit is a kindness if it refuses the right callers.",
      "Principle: shed abusive traffic on purpose, or it sheds your real users by accident.",
    ],
    warStory: "Scrapers do not feel your SLO. If you do not name them, they spend it.",
  },
};

const l10: LevelDef = {
  id: "l10",
  num: 10,
  title: "Two reading rooms",
  rank: "Senior",
  playable: true,
  tease: "Two lobes of an island. The book and the drawers must agree.",
  product: "A catalog of books",
  brief:
    "Twin reading rooms are two soft hills that touch, one the color of a cloth cover and one the color of a card. The ledger is what happened. The card catalog is how a visitor finds it. If the booth writes them as two separate hopes, a book can exist in one room and be missing from the other.",
  teach: [
    "Two sources of truth means two places that both claim to know. Dual write means the booth tries to update both itself. One can succeed while the other fails, and now the island disagrees with itself.",
    "An outbox is a promise kept by the ledger: the change is recorded once, and the catalog is told afterwards from that record. The drawers cannot miss a book the ledger has agreed to publish.",
    "People reach the booth over HTTP. The booth must reach both the ledger and the card catalog over SQL. A browser still does not speak SQL.",
    "The catalog starts in dual-write mode, which is slow and wrong. Open it and choose the outbox. p99 has to stay under 300ms. DAU is 20,000. QPS is 40.",
  ],
  glossary: [
    { term: "Dual write", means: "Saving the same fact in two places and hoping both land." },
    { term: "Outbox", means: "Write the fact once. A later step copies it to the other room." },
    { term: "SQL", means: "The booth → the ledger, and the booth → the card catalog." },
    { term: "p99", means: "The slowest 1% of lookups. Under 300ms." },
  ],
  dau: "20,000",
  qps: 40,
  readWrite: "80 / 20",
  latencySloMs: 300,
  availabilitySlo: 0.995,
  budget: 70,
  region: "Twin reading rooms",
  nonGoals: "a cache, a second booth",
  duration: 32,
  seed: 1010,
  chaos: [{ at: 14, duration: 8, mult: 1.7, label: "A class arrives with a reading list." }],
  palette: ["booth", "ledger", "search"],
  cables: ["http", "sql"],
  mustStores: ["ledger", "search"],
  scene: library,
  preplaced: crowd("lobes"),
  copy: {
    ...emptyCopy,
    pass: [
      "The drawers agree with the ledger.",
      "One write, then a copy. Not two writes and a wish.",
      "Principle: if two places must match, one of them publishes and the other follows.",
    ],
    warStory: "Search drift is the quiet outage: the row is saved, the index never heard, and the user is told the book does not exist.",
  },
};

export const CAMPAIGN: LevelDef[] = [l1, l2, l3, l4, l5, l6, l7, l8, l9, l10, ...LATE].map((level) => {
  const budgeted = level.num < 11 ? level : { ...level, budget: Math.max(level.budget, 40 + level.num * 5) };
  const extra: GlossaryItem[] = [];
  if (budgeted.num >= 10) {
    extra.push(
      {
        term: "Several databases",
        means: "One service may keep more than one notebook. Ask them together. A chain adds every hop. Asking only the first leaves a book unread.",
      },
      {
        term: "Gateway",
        means: "The front door. It routes. It does not store. If a facade sits behind it, people should meet the facade rather than each service.",
      },
      {
        term: "Facade",
        means: "One service that hides the others. Callers see a single door. Behind it are services, databases, or both.",
      },
    );
  }
  if (budgeted.num >= 15) {
    extra.push({
      term: "Aggregator",
      means: "One door for several services. Scatter-gather waits on the slowest. A chain adds every hop. The first service alone leaves the others off the page.",
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
