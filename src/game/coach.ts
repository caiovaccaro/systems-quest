import { getComponent } from "../catalog/components";
import type { Diagnosis, HudSnapshot, LevelDef, Link, PlacedNode } from "../engine/types";

export interface CoachNote {
  tone: "good" | "bad" | "wait";
  title: string;
  body: string;
}

function settingProblems(nodes: PlacedNode[]): string[] {
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

  const settingNotes = settingProblems(input.nodes);
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
          : `The app can answer a click, but it has nowhere to save a person. Pick the SQL cable, then drag the app onto the database.${settingNotes.length ? ` ${settingNotes.join(" ")}` : ""}`,
      };
    }
  }

  const problems = settingNotes;
  if (problems.length > 0) {
    return {
      tone: "bad",
      title: problems.length > 1 ? "Two habits are breaking this" : "This setting will not hold",
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
