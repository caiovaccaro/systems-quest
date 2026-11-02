import { getCable } from "../catalog/cables";
import { getComponent } from "../catalog/components";
import { accepts, fitName, lessonFits, SERVICE_KINDS } from "../catalog/wire";
import type { Diagnosis, HudSnapshot, LevelDef, Link, LinkKind, PlacedNode } from "../engine/types";

export interface CoachNote {
  tone: "good" | "bad" | "wait";
  title: string;
  body: string;
}

function wired(links: Link[], id: string): boolean {
  return links.some((link) => link.from === id || link.to === id);
}

function settingProblems(level: LevelDef, nodes: PlacedNode[], links: Link[]): string[] {
  const problems: string[] = [];
  const owners = level.owners ?? [];
  if (owners.length >= 2) {
    const houses = nodes.filter((n) => owners.includes(n.defId));
    const missing = owners.filter((id) => !houses.some((n) => n.defId === id));
    if (missing.length > 0) {
      problems.push(
        `This page reads ${owners.map((id) => getComponent(id).name).join(" and ")}. Each service needs its own database. Place the ones you want to try.`,
      );
    }
    const shelf = new Map<string, string>();
    let shared = false;
    for (const house of houses) {
      for (const link of links) {
        if (link.from !== house.id || (link.kind !== "sql" && link.kind !== "redis")) continue;
        const store = nodes.find((n) => n.id === link.to);
        if (!store || getComponent(store.defId).role !== "store") continue;
        const prev = shelf.get(store.id);
        if (prev && prev !== house.defId) shared = true;
        shelf.set(store.id, house.defId);
      }
    }
    if (shared) {
      problems.push(
        "Those services share one database. Give each its own database, or publish the write on Kafka so the other service can save it.",
      );
    }
    const door = nodes.some((n) => getComponent(n.defId).aggregates && wired(links, n.id));
    const bus = nodes.some((n) => getComponent(n.defId).broadcast && wired(links, n.id));
    if (houses.length >= 2 && !door && !bus) {
      problems.push(
        "Each service can read only its own database. A backend for frontend can call every service. A service can also publish to Kafka so the other service writes its own copy.",
      );
    }
  }
  if (nodes.some((n) => n.config.query === "nplusone" && wired(links, n.id))) {
    problems.push(
      "A service is set to N+1: one click asks the database a dozen times. Open it and switch Query shape to a single join.",
    );
  }
  if (nodes.some((n) => "indexed" in n.config && n.config.indexed !== true && wired(links, n.id))) {
    problems.push(
      "A database has no index on the lookup, so every question reads the whole table. That is a table scan. Open it and turn the index on.",
    );
  }
  const sticky = nodes.find((n) => n.config.balance === "sticky" && wired(links, n.id));
  if (sticky) {
    const backs = links.filter(
      (l) => l.from === sticky.id && (l.kind === "http" || l.kind === "grpc"),
    ).length;
    const name = getComponent(sticky.defId).name;
    problems.push(
      backs < 2
        ? `${name} sends every request to one backend. Add another backend and set balancing to round robin.`
        : `${name} is still pinned to the first backend. Set balancing to round robin.`,
    );
  }
  if (nodes.some((n) => n.config.freshness === "stale")) {
    problems.push(
      "The read replica is serving a stale copy. Turn on read-your-writes, or the client that just saved will not see its own write.",
    );
  }
  if (nodes.some((n) => n.config.ttl === "flush")) {
    problems.push(
      "Every cache entry expires at the same time. That is a stampede. Jitter the TTLs.",
    );
  }
  if (nodes.some((n) => n.defId === "cdn" && n.config.cache === "none")) {
    problems.push(
      "The CDN is not storing responses, so every request hits the origin.",
    );
  }
  if (nodes.some((n) => n.defId === "gate" && n.config.limit === "open")) {
    problems.push(
      "The rate limiter is open, so the spike reaches the app. Limit the extra callers.",
    );
  }
  if (nodes.some((n) => n.config.sync === "dual")) {
    problems.push(
      "Dual write can update one store and miss the other. Use an outbox so the primary publishes the change.",
    );
  }
  if (nodes.some((n) => n.config.order === "orphan")) {
    problems.push(
      "The object is saved before the metadata row. Write the row first, or the object is an orphan.",
    );
  }
  if (nodes.some((n) => n.config.sessions === "desk")) {
    problems.push(
      "Every request calls the auth service. Share a key so the proxy can authorize locally.",
    );
  }
  const stall = nodes.find((n) => n.defId === "stall");
  if (stall) {
    const bins = nodes.filter((n) => n.defId === "bin").length;
    if (stall.config.shard === "celebrity") {
      problems.push(
        "The shard key follows a hot value, so one shard takes the traffic. Hash across the shards you cabled.",
      );
    } else if (bins < 2) {
      problems.push("One shard is still the whole dataset. Place another shard and SQL-cable the router to it.");
    }
  }
  if (nodes.some((n) => n.config.quorum === "both")) {
    problems.push(
      "The write waits for the remote replica. Local quorum is enough for this latency SLO.",
    );
  }
  for (const agg of nodes) {
    const def = getComponent(agg.defId);
    if (!def.aggregates || !wired(links, agg.id)) continue;
    const downs = links.filter((link) => {
      if (link.from !== agg.id || !SERVICE_KINDS.includes(link.kind)) return false;
      const to = nodes.find((n) => n.id === link.to);
      return !!to && getComponent(to.defId).role === "compute";
    });
    const stores = links.filter((link) => {
      if (link.from !== agg.id || (link.kind !== "sql" && link.kind !== "redis")) return false;
      const to = nodes.find((n) => n.id === link.to);
      return !!to && getComponent(to.defId).role === "store";
    });
    const strategy = String(agg.config.compose ?? "scatter");
    if (downs.length === 0 && stores.length === 0) {
      problems.push(
        `${def.name} is an aggregator with nothing behind it. Cable the services or databases that build the page.`,
      );
    } else if (strategy === "chain" && downs.length > 1) {
      problems.push(
        `${def.name} calls ${downs.length} services one after another, so the page is as slow as the sum. Open it and choose scatter-gather.`,
      );
    } else if (strategy === "first" && downs.length > 1) {
      problems.push(
        `${def.name} only puts the first service on the screen. The others are cabled and silent. Choose scatter-gather if the page needs all of them.`,
      );
    } else if (strategy === "queue") {
      problems.push(
        `${def.name} answers before those services finish. This promise is about the visit itself. Choose scatter-gather, or chain the steps that depend on each other.`,
      );
    }
  }
  for (const keeper of nodes) {
    const stores = links.filter((link) => {
      if (link.from !== keeper.id || (link.kind !== "sql" && link.kind !== "redis")) return false;
      const to = nodes.find((n) => n.id === link.to);
      return !!to && getComponent(to.defId).role === "store";
    });
    if (stores.length < 2 || keeper.config.shard) continue;
    const how = String(keeper.config.records ?? "all");
    const name = getComponent(keeper.defId).name;
    if (how === "primary") {
      problems.push(
        `${name} is cabled to ${stores.length} databases and only asks the first. The other books never hear the question. Ask every database together.`,
      );
    } else if (how === "chain") {
      problems.push(
        `${name} asks its databases one after another, so the page pays every hop. Ask them together.`,
      );
    }
  }
  for (const gate of nodes) {
    if (gate.config.route == null || !wired(links, gate.id)) continue;
    const backs = links.filter((link) => {
      if (link.from !== gate.id || !SERVICE_KINDS.includes(link.kind)) return false;
      const to = nodes.find((n) => n.id === link.to);
      return !!to && getComponent(to.defId).role === "compute";
    });
    const doors = backs.filter((link) => getComponent(nodes.find((n) => n.id === link.to)!.defId).aggregates);
    const leaves = backs.filter((link) => !getComponent(nodes.find((n) => n.id === link.to)!.defId).aggregates);
    const name = getComponent(gate.defId).name;
    if (gate.config.route === "facade" && doors.length === 0) {
      problems.push(
        `${name} is set to open only through a facade, and there is no facade behind it. Place a facade, or open the door straight to the services.`,
      );
    } else if (gate.config.route === "direct" && doors.length > 0 && leaves.length > 0) {
      problems.push(
        `${name} is walking past the facade and into individual services. Set the door to open only through the facade.`,
      );
    }
  }
  if (nodes.some((n) => n.config.call === "chain")) {
    problems.push(
      "One request calls several services in series. Serve it in process.",
    );
  }
  if (nodes.some((n) => n.config.breaker === "wait")) {
    problems.push(
      "The client waits out a dead dependency. Open the circuit breaker.",
    );
  }
  if (nodes.some((n) => n.config.window === "shuttered")) {
    problems.push(
      "Slow requests are not traced, so retries hide the tail. Turn tracing on.",
    );
  }
  if (nodes.some((n) => n.config.delivery === "blind")) {
    problems.push(
      "A retry writes the record again. Require an idempotency key.",
    );
  }
  if (nodes.some((n) => n.config.migration === "lock")) {
    problems.push(
      "The migration locks the table. Expand the schema, backfill, then drop the old column.",
    );
  }
  if (nodes.some((n) => n.config.fan === "write")) {
    problems.push(
      "Fan-out on write touches every follower for each post. Fan-out on read when someone loads the feed.",
    );
  }
  if (nodes.some((n) => n.config.route === "old")) {
    problems.push(
      "The router still sends new traffic to the legacy service. Send new traffic to the replacement.",
    );
  }
  if (nodes.some((n) => n.config.ship === "committee")) {
    problems.push(
      "Two owners must approve every request. Give the path a single owner.",
    );
  }
  if (nodes.some((n) => n.config.tenant === "shared")) {
    problems.push(
      "Tenants share one table, so one tenant's load is everyone's outage. Isolate them.",
    );
  }
  if (nodes.some((n) => n.config.charter === "nines")) {
    problems.push(
      "The SLO promises five nines in every region. This budget cannot pay for that. Write the SLO you can keep.",
    );
  }
  return problems;
}

function choiceProblems(level: LevelDef, nodes: PlacedNode[], links: Link[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();
  const fits = lessonFits(level);
  const push = (line: string) => {
    if (seen.has(line)) return;
    seen.add(line);
    problems.push(line);
  };
  for (const link of links) {
    const to = nodes.find((n) => n.id === link.to);
    if (!to) continue;
    const def = getComponent(to.defId);
    if (!accepts(def, link.kind)) {
      const cable = getCable(link.kind)?.short ?? link.kind.toUpperCase();
      push(`${def.name} does not speak ${cable}. Pick a cable that piece actually understands.`);
      continue;
    }
    if (def.role === "store" && def.fit && fits.length > 0 && !fits.includes(def.fit)) {
      push(
        `${def.name} is a ${fitName(def.fit)}. This lesson's data fits a ${fits.map(fitName).join(" or ")}. The mismatch makes every lookup slow.`,
      );
    }
  }
  return problems;
}

function speaksStore(kind: LinkKind): boolean {
  return kind === "sql" || kind === "redis";
}

export function explain(input: {
  level: LevelDef;
  nodes: PlacedNode[];
  links: Link[];
  hud: HudSnapshot | null;
  diagnosis: Diagnosis | "warming" | null;
  won: boolean;
}): CoachNote {
  if (input.won) {
    return {
      tone: "good",
      title: "You kept the promise",
      body: "The slowest visits stayed fast enough, and almost nobody saw an error. That is the whole job.",
    };
  }

  const users = input.nodes.find((n) => getComponent(n.defId).role === "source");
  const out = (id: string, kind?: Link["kind"]) =>
    input.links.filter((l) => l.from === id && (kind ? l.kind === kind : true)).map((l) => l.to);
  const node = (id: string) => input.nodes.find((n) => n.id === id);
  const needsSql = input.level.cables.includes("sql");

  const choiceNotes = choiceProblems(input.level, input.nodes, input.links);
  const knobNotes = settingProblems(input.level, input.nodes, input.links);
  const settingNotes = [...choiceNotes, ...knobNotes];
  if (!users || out(users.id, "http").length === 0) {
    const hasPiece = input.nodes.some((n) => getComponent(n.defId).placeable);
    const extra = settingNotes.length ? ` ${settingNotes.join(" ")}` : "";
    const other = users ? input.links.find((l) => l.from === users.id && l.kind !== "http") : undefined;
    return {
      tone: "bad",
      title: other ? "Users do not speak that" : "Requests have nowhere to go",
      body: other
        ? `Browsers speak HTTP. ${getCable(other.kind)?.name ?? "That cable"} is for machines talking to machines. Pick HTTP, then drag Users onto the service.${extra}`
        : hasPiece
          ? `Pick the HTTP cable, then drag Users onto a piece. Until that cable exists, every request fails.${extra}`
          : "Drag a piece onto the board. Then pick the HTTP cable and drag Users onto it.",
    };
  }

  const targets = out(users.id, "http").map(node).filter((n): n is PlacedNode => !!n);
  if (targets.some((n) => getComponent(n.defId).role === "store")) {
    return {
      tone: "bad",
      title: "Users are talking to the database",
      body: "A database stores rows. It does not serve the response. Pick HTTP, drag Users onto the database to unplug, then cable them to a service.",
    };
  }

  if (needsSql) {
    const apps = input.nodes.filter((n) => getComponent(n.defId).requiresStore);
    const lonely = apps.find(
      (app) =>
        !input.links.some(
          (l) =>
            l.from === app.id &&
            speaksStore(l.kind) &&
            node(l.to) &&
            getComponent(node(l.to)!.defId).role === "store",
        ),
    );
    if (lonely) {
      const hasHttpOnly = out(lonely.id, "http").some(
        (id) => node(id) && getComponent(node(id)!.defId).role === "store",
      );
      return {
        tone: "bad",
        title: "Nothing is storing the write",
        body: hasHttpOnly
          ? `HTTP cannot query a database. Pick the SQL cable, then drag the service onto the database.${settingNotes.length ? ` ${settingNotes.join(" ")}` : ""}`
          : `The service has nowhere to write. Pick the SQL cable, then drag it onto a database.${settingNotes.length ? ` ${settingNotes.join(" ")}` : ""}`,
      };
    }
  }

  const problems = settingNotes;
  if (problems.length > 0) {
    const title =
      choiceNotes.length > 0 && knobNotes.length === 0
        ? "Wrong piece for this lesson"
        : problems.length > 1
          ? "A few habits are breaking this"
          : "This setting will not hold";
    return {
      tone: "bad",
      title,
      body: problems.join(" "),
    };
  }

  const hud = input.hud;
  const chaos = hud?.chaos ? ` ${hud.chaos}` : "";
  const p99 = hud ? Math.round(hud.p99) : 0;
  const failPct = hud ? (hud.errorRate * 100).toFixed(1) : "0";

  if (input.diagnosis === "saturated") {
    return {
      tone: "bad",
      title: "A piece is out of breath",
      body: `More clicks are arriving than it can finish, so they pile up and fail. ${failPct}% are failing. You promised under ${((1 - input.level.availabilitySlo) * 100).toFixed(1)}%.${chaos}`,
    };
  }
  if (input.diagnosis === "pool") {
    return {
      tone: "bad",
      title: "The phone lines are full",
      body: "Every question to the database is holding a connection. New ones wait, then give up. Asking less does more than buying more lines.",
    };
  }
  if (input.diagnosis === "slo" || (hud && hud.t > 2 && (hud.p99 > input.level.latencySloMs || hud.errorRate > 1 - input.level.availabilitySlo))) {
    return {
      tone: "bad",
      title: "The promise is slipping",
      body: `The slowest 1% (p99) is ${p99}ms. You promised under ${input.level.latencySloMs}ms. Failures are ${failPct}%. Averages can look fine while this tail does not.${chaos}`,
    };
  }
  if (input.diagnosis === "pass" || (hud && hud.t > 2)) {
    const held = hud ? Math.floor(hud.t) : 0;
    return {
      tone: "good",
      title: "You are inside the promise",
      body: `p99 is ${p99}ms (goal ${input.level.latencySloMs}ms) and failures are ${failPct}%. Hold this for ${held}s of ${input.level.duration}s, including the spike.${chaos}`,
    };
  }
  return {
    tone: "wait",
    title: "Traffic just started",
    body: `Watch two numbers. p99 is the slowest 1% of visits and must stay under ${input.level.latencySloMs}ms. Failures must stay under ${((1 - input.level.availabilitySlo) * 100).toFixed(1)}%.`,
  };
}
