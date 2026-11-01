import { getComponent } from "../catalog/components";
import type { Diagnosis, HudSnapshot, LevelDef, Link, PlacedNode } from "../engine/types";

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
      if (link.from === id && link.kind === "http") queue.push(link.to);
    }
  }
  return found;
}

function settingProblems(nodes: PlacedNode[], links: Link[]): string[] {
  const problems: string[] = [];
  if (nodes.some((n) => n.defId === "app" && n.config.query === "nplusone")) {
    problems.push(
      "The app is set to N+1: one click asks the database a dozen times. Open it and switch Query shape to a single join.",
    );
  }
  if (nodes.some((n) => n.defId === "db" && n.config.indexed !== true)) {
    problems.push(
      "The database has no index on email, so every lookup reads the whole table. That is a table scan. Open it and turn the index on.",
    );
  }
  const porch = nodes.find((n) => n.defId === "porch");
  if (porch && porch.config.balance === "sticky") {
    const ovens = links.filter((l) => l.from === porch.id && l.kind === "http").length;
    problems.push(
      ovens < 2
        ? "The porch sends every guest to a single oven. Place a second oven, cable the porch to it with HTTP, and set the porch to share the line."
        : "The porch is still sending everyone to the first oven. Open it and choose share the line.",
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
  return problems;
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

  const settingNotes = settingProblems(input.nodes, input.links);
  if (!users || out(users.id, "http").length === 0) {
    const hasPiece = input.nodes.some((n) => getComponent(n.defId).placeable);
    const extra = settingNotes.length ? ` ${settingNotes.join(" ")}` : "";
    return {
      tone: "bad",
      title: "Clicks have nowhere to go",
      body: hasPiece
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
        !out(app.id, "sql").some((id) => node(id) && getComponent(node(id)!.defId).role === "store"),
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
          out(app.id, "sql").some((id) => node(id)?.defId === defId),
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
    return {
      tone: "bad",
      title: problems.length > 1 ? "A few habits are breaking this" : "This setting will not hold",
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
