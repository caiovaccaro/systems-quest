const cache = new Map<string, HTMLCanvasElement>();
const urls = new Map<string, string>();

export function iconCanvas(id: string): HTMLCanvasElement {
  const hit = cache.get(id);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  drawCard(ctx);
  if (id === "users") drawPeople(ctx);
  else if (id === "laptop") drawLaptop(ctx);
  else if (id === "db") drawDatabase(ctx);
  else if (id === "http") drawHttp(ctx);
  else if (id === "sql") drawSql(ctx);
  else if (id === "grpc" || id === "redis" || id === "amqp" || id === "kafka") drawCable(ctx, id);
  else drawApp(ctx);
  const labels: Record<string, string> = {
    users: "PEOPLE",
    laptop: "LAPTOP",
    db: "DATABASE",
    http: "HTTP",
    sql: "SQL",
    app: "APP",
    beacon: "BEACON",
    porch: "PORCH",
    oven: "OVEN",
    booth: "BOOTH",
    echo: "ECHO",
    cache: "JARS",
    cdn: "LOFT",
    origin: "PRESS",
    slot: "SLOT",
    clerk: "CLERK",
    gate: "GATE",
    path: "PATH",
    ledger: "LEDGER",
    search: "CARDS",
    darkroom: "DARKROOM",
    plate: "PLATE",
    album: "ALBUM",
    customs: "CUSTOMS",
    stamp: "STAMP",
    stall: "STALL",
    bin: "BIN",
    ferry: "FERRY",
    farshore: "SHORE",
    counter: "COUNTER",
    boathouse: "BOAT",
    inn: "INN",
    keydesk: "KEYS",
    shelf: "SHELF",
    notice: "NOTICE",
    feed: "FEED",
    till: "TILL",
    bus: "BUS",
    lane: "LANE",
    barn: "BARN",
    span: "SPAN",
    hall: "HALL",
    ward: "WARD",
    charter: "CHARTER",
    redisbox: "REDIS",
    kafkalog: "KAFKA",
    mysql: "MYSQL",
    mongo: "MONGO",
    lambda: "LAMBDA",
    nginx: "NGINX",
    haproxy: "HAPROXY",
    cassandra: "CASSANDRA",
    dynamo: "DYNAMO",
    elastic: "ELASTIC",
    neo4j: "NEO4J",
    graphql: "GRAPHQL",
    facade: "FACADE",
    bff: "BFF",
    profile: "PROFILE",
    timeline: "TIMELINE",
    stepfn: "STEPS",
    saga: "SAGA",
  };
  const label = labels[id] ?? id.replace(/[^a-z0-9]/gi, "").slice(0, 10).toUpperCase();
  ctx.fillStyle = "#3d342b";
  ctx.font = "800 26px Outfit, Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, 128, 286);
  cache.set(id, canvas);
  return canvas;
}

export function iconURL(id: string): string {
  const hit = urls.get(id);
  if (hit) return hit;
  const url = iconCanvas(id).toDataURL();
  urls.set(id, url);
  return url;
}

function drawCard(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, 256, 320);
  round(ctx, 18, 16, 220, 288, 36);
  ctx.fillStyle = "#fff8ee";
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#243038";
  ctx.stroke();
}

function drawPeople(ctx: CanvasRenderingContext2D): void {
  person(ctx, 58, 168, "#f0b429", "#5b4636", false);
  person(ctx, 128, 150, "#e07a5f", "#2f2a28", true);
  person(ctx, 196, 172, "#7d9a78", "#3d342b", false);
}

function person(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  shirt: string,
  hair: string,
  wave: boolean,
): void {
  ctx.fillStyle = shirt;
  round(ctx, x - 22, y + 8, 44, 46, 16);
  ctx.fill();
  ctx.fillStyle = "#ffd7b5";
  ctx.beginPath();
  ctx.arc(x, y - 8, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(x, y - 16, 18, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3d342b";
  ctx.beginPath();
  ctx.arc(x - 7, y - 8, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 7, y - 8, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#c47b62";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y + 2, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  if (wave) {
    ctx.strokeStyle = "#ffd7b5";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 22);
    ctx.quadraticCurveTo(x + 48, y - 6, x + 36, y - 28);
    ctx.stroke();
  }
}

function drawLaptop(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#d7efe9";
  round(ctx, 58, 78, 140, 96, 12);
  ctx.fill();
  ctx.strokeStyle = "#3d342b";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  round(ctx, 70, 90, 116, 72, 8);
  ctx.fill();
  ctx.fillStyle = "#3d342b";
  ctx.beginPath();
  ctx.arc(116, 118, 3, 0, Math.PI * 2);
  ctx.arc(140, 118, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e07a5f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(128, 128, 10, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#f2c14e";
  ctx.save();
  ctx.translate(168, 86);
  ctx.rotate(0.3);
  round(ctx, 0, 0, 42, 36, 4);
  ctx.fill();
  ctx.fillStyle = "#3d342b";
  ctx.font = "700 12px Outfit, sans-serif";
  ctx.fillText("it", 8, 16);
  ctx.fillText("works", 4, 30);
  ctx.restore();
  ctx.fillStyle = "#8d6b52";
  round(ctx, 42, 182, 172, 16, 6);
  ctx.fill();
  ctx.fillStyle = "#c4a484";
  round(ctx, 36, 196, 184, 14, 6);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(188, 214, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e07a5f";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#6b4b36";
  ctx.fillRect(182, 196, 12, 8);
}

function drawApp(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#d9e4ff";
  round(ctx, 78, 70, 100, 120, 28);
  ctx.fill();
  ctx.strokeStyle = "#3d4e86";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.fillStyle = "#3d342b";
  ctx.beginPath();
  ctx.arc(110, 112, 5, 0, Math.PI * 2);
  ctx.arc(146, 112, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e07a5f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(128, 124, 16, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#fffaf3";
  round(ctx, 48, 168, 36, 44, 6);
  ctx.fill();
  ctx.strokeStyle = "#efd8c4";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#7d9a78";
  ctx.fillRect(56, 180, 20, 4);
  ctx.fillRect(56, 190, 16, 4);
  ctx.fillStyle = "#e07a5f";
  round(ctx, 176, 150, 28, 36, 6);
  ctx.fill();
  ctx.fillStyle = "#fffaf3";
  ctx.font = "800 16px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ok", 190, 174);
}

function drawDatabase(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = "#efe4ff";
  ctx.beginPath();
  ctx.ellipse(78, 132, 28, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6d5b8a";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "#d7c6f5";
  ctx.beginPath();
  ctx.arc(132, 118, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#3d342b";
  ctx.beginPath();
  ctx.arc(118, 112, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6d5b8a";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(168, 124);
  ctx.quadraticCurveTo(210, 150, 176, 196);
  ctx.quadraticCurveTo(150, 214, 168, 188);
  ctx.stroke();
  ctx.fillStyle = "#fffaf3";
  round(ctx, 70, 186, 116, 18, 6);
  ctx.fill();
  ctx.strokeStyle = "#d7c6f5";
  ctx.lineWidth = 4;
  ctx.stroke();
  round(ctx, 78, 204, 100, 16, 6);
  ctx.fillStyle = "#f7f1ff";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#6d5b8a";
  ctx.font = "700 11px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("email A–Z", 128, 200);
}

function drawHttp(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "#e07a5f";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(48, 180);
  ctx.quadraticCurveTo(128, 60, 208, 140);
  ctx.stroke();
  ctx.fillStyle = "#e07a5f";
  ctx.beginPath();
  ctx.moveTo(208, 140);
  ctx.lineTo(178, 118);
  ctx.lineTo(190, 156);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fffaf3";
  round(ctx, 78, 112, 100, 42, 14);
  ctx.fill();
  ctx.strokeStyle = "#efd8c4";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#e07a5f";
  ctx.font = "800 22px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GET", 128, 140);
  ctx.fillStyle = "#6d5c4d";
  ctx.font = "700 13px Outfit, sans-serif";
  ctx.fillText("browser → page", 128, 198);
}

function drawSql(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "#8d74b8";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(48, 150);
  ctx.quadraticCurveTo(128, 210, 208, 120);
  ctx.stroke();
  ctx.fillStyle = "#8d74b8";
  ctx.beginPath();
  ctx.moveTo(208, 120);
  ctx.lineTo(176, 112);
  ctx.lineTo(188, 148);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#fffaf3";
  round(ctx, 70, 98, 116, 48, 14);
  ctx.fill();
  ctx.strokeStyle = "#d7c6f5";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#8d74b8";
  ctx.font = "800 18px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SELECT", 128, 128);
  ctx.fillStyle = "#6d5c4d";
  ctx.font = "700 13px Outfit, sans-serif";
  ctx.fillText("app → database", 128, 198);
}

const CABLE_INK: Record<string, string> = {
  http: "#e07a5f",
  sql: "#8d74b8",
  grpc: "#3d9a6a",
  redis: "#d64545",
  amqp: "#f08a3c",
  kafka: "#2f2a28",
};

function drawCable(ctx: CanvasRenderingContext2D, id: string): void {
  const ink = CABLE_INK[id] ?? "#e07a5f";
  ctx.strokeStyle = ink;
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(48, 150);
  ctx.quadraticCurveTo(128, 40, 208, 150);
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.font = "800 28px Outfit, Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(id.toUpperCase(), 128, 118);
}

/** Tiny billboard texture for a live cable on the board. */
export function cableLabelCanvas(kind: string): HTMLCanvasElement {
  const key = `label:${kind}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const fill = CABLE_INK[kind] ?? "#e07a5f";
  round(ctx, 8, 8, 144, 48, 18);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.fillStyle = kind === "kafka" ? "#f6e2a8" : "#fffaf3";
  ctx.font = "800 26px Outfit, Trebuchet MS, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(kind.toUpperCase(), 80, 32);
  cache.set(key, canvas);
  return canvas;
}

function round(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
