import { getCable } from "../catalog/cables";
import { getComponent } from "../catalog/components";
import { accepts, fitName, lessonFits, SERVICE_KINDS } from "../catalog/wire";
import type { Diagnosis, HudSnapshot, LevelDef, Link, LinkKind, PlacedNode } from "../engine/types";

export interface CoachNote {
  tone: "good" | "bad" | "wait";
  title: string;
  body: string;
}

function httpReachable(nodes: PlacedNode[], links: Link[], startId: string): Set<string> {
  const seen = new Set<string>();
  const found = new Set<string>();
  const queue = [startId];
  while (queue.length > 0) {
    const id = queue.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = nodes.find((n) => n.id === id);
    if (node) found.add(node.defId);
    for (const link of links) {
      if (link.from === id && SERVICE_KINDS.includes(link.kind)) queue.push(link.to);
    }
  }
  return found;
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
        `This page reads and writes ${owners.map((id) => getComponent(id).name).join(" and ")}. Place each one. Each keeps a database of its own.`,
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
        "Those services are sharing one database. Give each house its own book. A backend for frontend calls the houses. Kafka carries a write so the other house can save it.",
      );
    }
    const door = nodes.some((n) => getComponent(n.defId).aggregates && wired(links, n.id));
    const bus = nodes.some((n) => getComponent(n.defId).broadcast && wired(links, n.id));
    if (houses.length >= 2 && !door && !bus) {
      problems.push(
        "Each service can see only its own book. For the page, put a backend for frontend in front and call every service. For the write, that same door can call them, or you can cable the services to Kafka and let the log deliver the change.",
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
        ? `${name} sends every guest to a single backend. Place a second one, cable ${name} to it, and set it to share the line.`
        : `${name} is still sending everyone to the first backend. Open it and choose share the line.`,
    );
  }
  if (nodes.some((n) => n.config.freshness === "stale")) {
    problems.push(
      "The echo pond is a moment behind the pen. Open it and choose read your own ink, or the writer cannot see the sentence they just wrote.",
    );
  }
  if (nodes.some((n) => n.config.ttl === "flush")) {
    problems.push(
      "Every lantern goes dark on the same minute. When the rush returns, the cache is empty all at once. Open it and let each jar expire on its own.",
    );
  }
  if (nodes.some((n) => n.defId === "cdn" && n.config.cache === "none")) {
    problems.push(
      "The postcard loft is reprinting every card. Open it and keep a public copy, or the little press will catch fire.",
    );
  }
  if (nodes.some((n) => n.defId === "gate" && n.config.limit === "open")) {
    problems.push(
      "The garden gate is wide open, so the pigeons walk in with the people. Open the gate and set the latch to be fair to people and rude to pigeons.",
    );
  }
  if (nodes.some((n) => n.config.sync === "dual")) {
    problems.push(
      "The booth writes the ledger and the card catalog as two separate hopes. Open the catalog and let the ledger publish through an outbox, so the drawers cannot miss a book.",
    );
  }
  if (nodes.some((n) => n.config.order === "orphan")) {
    problems.push(
      "The glass plate is saved before the album hears about it. Open the plate and write the row first, or the picture becomes an orphan.",
    );
  }
  if (nodes.some((n) => n.config.sessions === "desk")) {
    problems.push(
      "Every traveler must wake the stamp. Open the customs house and share the key, so the doors can answer alone.",
    );
  }
  const stall = nodes.find((n) => n.defId === "stall");
  if (stall) {
    const bins = nodes.filter((n) => n.defId === "bin").length;
    if (stall.config.shard === "celebrity") {
      problems.push(
        "Famous names all fall in the first bin. Open the stall and spread the names across every bin you cabled.",
      );
    } else if (bins < 2) {
      problems.push("One bin is still the whole market. Place a second bin and SQL-cable the stall to it.");
    }
  }
  if (nodes.some((n) => n.config.quorum === "both")) {
    problems.push(
      "The ferry waits for both shores before anyone steps off. Open the far shore and keep the promise to this shore only.",
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
      "One loaf phones the mixer, the oven, and the till. Open the counter and serve from the one bench.",
    );
  }
  if (nodes.some((n) => n.config.breaker === "wait")) {
    problems.push(
      "The boathouse is still waiting on a boat that will not answer. Open it and trip the breaker.",
    );
  }
  if (nodes.some((n) => n.config.window === "shuttered")) {
    problems.push(
      "The inn is guessing in the dark and retrying. Open the shutters so you can see which visits are slow.",
    );
  }
  if (nodes.some((n) => n.config.delivery === "blind")) {
    problems.push(
      "A retried letter is written again. Open the desk and require the idempotency key, so a repeat is the same letter.",
    );
  }
  if (nodes.some((n) => n.config.migration === "lock")) {
    problems.push(
      "The shelf locks the whole cupboard while it moves one jar. Open it and expand first: add the new shape, then move, then drop the old one.",
    );
  }
  if (nodes.some((n) => n.config.fan === "write")) {
    problems.push(
      "Every new note is pushed to every follower. Open the board and let people pull the feed when they arrive.",
    );
  }
  if (nodes.some((n) => n.config.route === "old")) {
    problems.push(
      "The lane still sends the town through the old mill. Open it and strangle: new visits go to the barn, the mill keeps the rest until it is empty.",
    );
  }
  if (nodes.some((n) => n.config.ship === "committee")) {
    problems.push(
      "Both houses must agree before a boat leaves. Open the span and give the crossing one owner.",
    );
  }
  if (nodes.some((n) => n.config.tenant === "shared")) {
    problems.push(
      "A neighbor's sale is reading your table. Open the ward and put a wall between tenants.",
    );
  }
  if (nodes.some((n) => n.config.charter === "nines")) {
    problems.push(
      "The charter promises five nines and every shore at once. This island cannot pay for that. Open it and write the promise you can keep.",
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
        `${def.name} is a ${fitName(def.fit)}. This island keeps its promise with a ${fits.map(fitName).join(" or ")}. The wrong notebook makes every lookup slow.`,
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
      title: other ? "People do not speak that" : "Clicks have nowhere to go",
      body: other
        ? `Browsers speak HTTP. ${getCable(other.kind)?.name ?? "That cable"} is for machines talking to machines. Pick HTTP, then drag People onto the front door.${extra}`
        : hasPiece
          ? `Pick the HTTP cable in the tray, then drag People onto a piece. HTTP is how a browser asks for a page. Until that cable exists, every visit fails.${extra}`
          : "Drag a piece from the tray onto the table. Then pick the HTTP cable and drag People onto it. People are already clicking.",
    };
  }

  const targets = out(users.id, "http").map(node).filter((n): n is PlacedNode => !!n);
  if (targets.some((n) => getComponent(n.defId).role === "store")) {
    return {
      tone: "bad",
      title: "People are talking to the database",
      body: "A database stores rows. It does not serve a page. Pick HTTP again, drag People onto the database to unplug, then cable them to the app instead.",
    };
  }

  const mustHttp = input.level.mustHttp ?? [];
  if (mustHttp.length > 0) {
    const found = httpReachable(input.nodes, input.links, users.id);
    const missing = mustHttp.filter((id) => !found.has(id)).map((id) => getComponent(id).name);
    if (missing.length > 0) {
      return {
        tone: "bad",
        title: "The path skips a building",
        body: `People's clicks still never reach ${missing.join(" and ")}. Pick HTTP, then drag the piece closer to the crowd onto the piece farther along. The cable has to point that way.`,
      };
    }
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
        title: "Nothing is remembering signups",
        body: hasHttpOnly
          ? `HTTP cannot ask a database for rows. Pick the SQL cable, then drag the app onto Postgres.${settingNotes.length ? ` ${settingNotes.join(" ")}` : ""}`
          : `The stall can greet a visitor, but it has nowhere to write. Pick the SQL cable, then drag it onto the notebook.${settingNotes.length ? ` ${settingNotes.join(" ")}` : ""}`,
      };
    }
  }

  const mustStores = input.level.mustStores ?? [];
  if (mustStores.length > 0) {
    const apps = input.nodes.filter((n) => getComponent(n.defId).requiresStore);
    const missing = mustStores.filter(
      (defId) =>
        !apps.some((app) =>
          input.links.some((l) => l.from === app.id && speaksStore(l.kind) && node(l.to)?.defId === defId),
        ),
    );
    if (missing.length > 0) {
      return {
        tone: "bad",
        title: "One book is not the whole library",
        body: `SQL-cable the booth to ${missing.map((id) => getComponent(id).name).join(" and ")}. A catalog that never hears about new books is a second, wrong library.`,
      };
    }
  }

  const problems = settingNotes;
  if (problems.length > 0) {
    const title =
      choiceNotes.length > 0 && knobNotes.length === 0
        ? "Wrong piece for this island"
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
