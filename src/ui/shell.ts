import type { CableDef } from "../catalog/cables";
import { getComponent } from "../catalog/components";
import { offeredCables, offeredPieces } from "../catalog/wire";
import { gridToWorld } from "../engine/const";
import type {
  ComponentDef,
  ConfigField,
  HudSnapshot,
  LevelDef,
  LinkKind,
  NodeView,
  PlacedNode,
} from "../engine/types";
import { CAMPAIGN } from "../levels/campaign";
import { honkStops } from "../levels/island";
import type { CoachNote } from "../game/coach";
import { iconURL } from "../render/icons";

export interface UI {
  root: HTMLElement;
  boot: HTMLElement;
  select: HTMLElement;
  game: HTMLElement;
  modal: HTMLElement;
  palette: HTMLElement;
  inspect: HTMLElement;
  hud: HTMLElement;
  coach: HTMLElement;
  controls: HTMLElement;
  labels: HTMLElement;
  ghost: HTMLElement;
  dockNote: HTMLElement;
}

export function mountShell(app: HTMLElement): UI {
  app.innerHTML = `
    <canvas id="board"></canvas>
    <div id="ui">
      <div class="world-labels" id="labels"></div>
      <section class="layer boot" id="boot">
        <h1>systemsquest</h1>
        <p>A little island of machines. Place the pieces, cable them, and watch real traffic cross the grid. The numbers tell you whether you kept your promise.</p>
        <div class="boot-actions">
          <button class="btn primary" data-act="enter">Start learning</button>
        </div>
      </section>
      <section class="layer select hidden" id="select"></section>
      <section class="layer hidden" id="gameui">
        <div class="hud-top" id="hud"></div>
        <aside class="palette" id="palette"></aside>
        <aside class="inspect" id="inspect"></aside>
        <div class="coach wait" id="coach"></div>
        <div class="dock" id="dock">
          <p class="dock-note" id="docknote"></p>
          <button class="btn dock-btn" data-act="sheet" data-sheet="palette" type="button">Pieces</button>
          <button class="btn dock-btn" data-act="sheet" data-sheet="inspect" type="button">This piece</button>
          <div class="controls" id="controls"></div>
        </div>
      </section>
      <div class="modal-back hidden" id="modal"></div>
      <img id="ghost" class="ghost hidden" alt="" />
    </div>
  `;
  return {
    root: app,
    boot: must(app, "#boot"),
    select: must(app, "#select"),
    game: must(app, "#gameui"),
    modal: must(app, "#modal"),
    palette: must(app, "#palette"),
    inspect: must(app, "#inspect"),
    hud: must(app, "#hud"),
    coach: must(app, "#coach"),
    controls: must(app, "#controls"),
    labels: must(app, "#labels"),
    ghost: must(app, "#ghost"),
    dockNote: must(app, "#docknote"),
  };
}

function must(root: HTMLElement, sel: string): HTMLElement {
  const el = root.querySelector(sel);
  if (!(el instanceof HTMLElement)) throw new Error(sel);
  return el;
}

function countLabel(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function installLevelPalettes(): void {
  let style = document.getElementById("level-palettes");
  if (!(style instanceof HTMLStyleElement)) {
    style = document.createElement("style");
    style.id = "level-palettes";
    document.head.appendChild(style);
  }
  style.textContent = CAMPAIGN.map((level) => {
    const stops = honkStops(level.scene).map((color, i) => `${i} ${color}`).join(", ");
    return `@font-palette-values --honk-${level.id} { font-family: Honk; base-palette: 0; override-colors: ${stops}; }`;
  }).join("\n");
}

export function renderSelect(el: HTMLElement, cleared: Set<string>): void {
  installLevelPalettes();
  el.innerHTML = `
    <div class="select-head">
      <div>
        <div class="kicker wordmark">systemsquest</div>
        <h1>Start small.</h1>
      </div>
      <div class="kicker">${cleared.size} done</div>
    </div>
    <div class="levels">
      ${CAMPAIGN.map((l) => {
        const locked = !l.playable;
        const done = cleared.has(l.id);
        return `
          <button class="card ${done ? "cleared" : ""}" data-level="${l.id}" style="font-palette: --honk-${l.id}" ${locked ? "disabled" : ""}>
            <div class="meta"><span>Lesson ${l.num} · ${l.rank}</span><span>${locked ? "Later" : done ? "Done" : "Open"}</span></div>
            <h3>${l.title}</h3>
            <p>${l.tease}</p>
            <p class="count">${countLabel(offeredPieces(l).length, "piece")} · ${countLabel(offeredCables(l).length, "cable")}</p>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

export function renderBrief(el: HTMLElement, level: LevelDef, playing: boolean): void {
  installLevelPalettes();
  el.classList.remove("hidden");
  const lessons = level.teach.map((p) => `<p>${p}</p>`).join("");
  const gloss = level.glossary
    .map((g) => `<div class="gloss"><b>${g.term}</b><span>${g.means}</span></div>`)
    .join("");
  el.innerHTML = `
    <div class="modal lesson" style="font-palette: --honk-${level.id}">
      <div class="rank">${level.rank} · Lesson ${level.num}</div>
      <h2>${level.title}</h2>
      <p class="lead">${level.brief}</p>
      <div class="facts">
        <div><span>The island</span><b>${level.scene.place}</b></div>
        <div><span>What you're building</span><b>${level.product}</b></div>
        <div><span>DAU · people per day</span><b>${level.dau}</b></div>
        <div><span>QPS · clicks per second</span><b>${level.qps}</b></div>
        <div><span>R/W · reads / writes</span><b>${level.readWrite}</b></div>
        <div><span>p99 · slowest 1%</span><b>under ${level.latencySloMs}ms</b></div>
        <div><span>SLO · must succeed</span><b>${(level.availabilitySlo * 100).toFixed(1)}%</b></div>
        <div><span>Budget · per month</span><b>$${level.budget}</b></div>
        <div><span>Where it runs</span><b>${level.region}</b></div>
      </div>
      ${lessons}
      <div class="glossary">${gloss}</div>
      <p class="war">You can ignore: ${level.nonGoals}</p>
      <div class="modal-actions">
        <button class="btn primary" data-act="design">${playing ? "Back to the board" : "Start building"}</button>
        ${playing ? "" : `<button class="btn" data-act="levels">All lessons</button>`}
      </div>
    </div>
  `;
}

export function renderSuccess(el: HTMLElement, level: LevelDef, bullets: [string, string, string]): void {
  installLevelPalettes();
  el.classList.remove("hidden");
  el.innerHTML = `
    <div class="modal success" style="font-palette: --honk-${level.id}">
      <div class="success-mark">✓</div>
      <div class="rank">Promise kept</div>
      <h2 class="pass">${level.title}</h2>
      <ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      ${level.copy.warStory ? `<p class="war">${level.copy.warStory}</p>` : ""}
      <div class="modal-actions">
        <button class="btn primary" data-act="next">Next lesson</button>
        <button class="btn" data-act="retry">Play again</button>
        <button class="btn" data-act="levels">All lessons</button>
      </div>
    </div>
  `;
}

export function hideModal(el: HTMLElement): void {
  el.classList.add("hidden");
  el.innerHTML = "";
}

export function renderPalette(
  el: HTMLElement,
  defs: ComponentDef[],
  cables: CableDef[],
  cost: number,
  budget: number,
  activeCable: LinkKind | "",
): void {
  const over = cost > budget;
  const groups: { title: string; items: ComponentDef[] }[] = [
    { title: "Services", items: defs.filter((d) => d.category === "compute") },
    { title: "Databases", items: defs.filter((d) => d.category === "data") },
    { title: "Caches", items: defs.filter((d) => d.category === "cache") },
    { title: "Queues and logs", items: defs.filter((d) => d.category === "queue") },
    { title: "Proxies and edges", items: defs.filter((d) => d.category === "network") },
  ].filter((group) => group.items.length > 0);
  const button = (d: ComponentDef) => `
      <button class="tool" data-tool="${d.id}">
        <img src="${iconURL(d.id)}" alt="" />
        <div>${d.name}<small>$${d.cost} / mo</small></div>
      </button>`;
  el.innerHTML = `
    <button class="btn sheet-done" data-act="sheet" data-sheet="" type="button">Done</button>
    <h2>Pieces · ${defs.length}</h2>
    <div class="metric">
      <b class="${over ? "budget-over" : ""}">$${cost} / $${budget}</b>
      <span>monthly cost</span>
    </div>
    ${groups
      .map(
        (group) => `
      <h3 class="tray-group">${group.title}</h3>
      <div class="tray-items">${group.items.map(button).join("")}</div>
    `,
      )
      .join("")}
    ${
      cables.length
        ? `<h2 class="cables-head">Cables</h2>
    <p class="cable-lead">Pick one, then drag a piece onto another.</p>
    <div class="tray-items">${cables
      .map(
        (c) => `
      <button class="tool cable ${activeCable === c.id ? "active" : ""}" data-tool="${c.id}">
        <img src="${iconURL(c.id)}" alt="" />
        <div>${c.name}<small>${c.hint}</small></div>
      </button>
    `,
      )
      .join("")}</div>`
        : ""
    }
    <p class="tray-foot">Space pauses. Z undoes. Delete removes.</p>
  `;
}

export function renderInspect(el: HTMLElement, node: PlacedNode | null, view: NodeView | null): void {
  if (!node) {
    el.innerHTML = `<button class="btn sheet-done" data-act="sheet" data-sheet="" type="button">Done</button><h2>This piece</h2><p class="empty">Select a piece to read it. Drag it to move it. Pick a cable in the tray, then drag one piece onto another. On a small screen, tap a piece, close this tray, then tap a tile. Later lessons add databases, caches, queues, proxies, and protocols. The budget only pays for a design that fits.</p>`;
    return;
  }
  const def = getComponent(node.defId);
  const fields = def.config
    .map((field) => configField(field, node.config[field.key], node.locked))
    .join("");
  el.innerHTML = `
    <button class="btn sheet-done" data-act="sheet" data-sheet="" type="button">Done</button>
    <h2>This piece</h2>
    <img class="inspect-icon" src="${iconURL(node.defId)}" alt="" />
    <div class="name">${def.name}</div>
    <p class="blurb">${def.blurb}</p>
    <div class="statgrid">
      <div><span>clicks in / out</span><b data-stat="io">${view ? `${view.rpsIn} / ${view.rpsOut}` : "—"}</b></div>
      <div><span>failed</span><b data-stat="err">${view?.errors ?? 0}</b></div>
      <div><span>waiting</span><b data-stat="queue">${view?.queue ?? 0}</b></div>
      <div><span>${def.role === "store" ? "phone lines" : "how busy"}</span><b data-stat="sat">${
        def.role === "store" ? `${view?.conns ?? 0}/${view?.pool ?? 0}` : pct(view?.sat ?? 0)
      }</b></div>
    </div>
    ${fields}
    ${node.locked ? `<p class="hint">The crowd stays where it is. Drag it onto a piece to connect.</p>` : `<button class="btn" data-act="delete">Remove</button>`}
  `;
}

export function patchStats(el: HTMLElement, node: PlacedNode | null, view: NodeView | null): void {
  if (!node || !el.querySelector("[data-stat=io]")) return;
  const def = getComponent(node.defId);
  const io = el.querySelector("[data-stat=io]");
  const err = el.querySelector("[data-stat=err]");
  const queue = el.querySelector("[data-stat=queue]");
  const sat = el.querySelector("[data-stat=sat]");
  if (io) io.textContent = view ? `${view.rpsIn} / ${view.rpsOut}` : "—";
  if (err) err.textContent = String(view?.errors ?? 0);
  if (queue) queue.textContent = String(view?.queue ?? 0);
  if (sat) {
    sat.textContent =
      def.role === "store" ? `${view?.conns ?? 0}/${view?.pool ?? 0}` : pct(view?.sat ?? 0);
  }
}

function configField(
  field: ConfigField,
  value: boolean | string | number | undefined,
  frozen: boolean,
): string {
  const v = value ?? field.value;
  const disabled = frozen ? "disabled" : "";
  let control = "";
  if (field.type === "bool") {
    control = `<select data-cfg="${field.key}" ${disabled}>
      <option value="false" ${v === false ? "selected" : ""}>off</option>
      <option value="true" ${v === true ? "selected" : ""}>on</option>
    </select>`;
  } else if (field.type === "enum") {
    control = `<select data-cfg="${field.key}" ${disabled}>
      ${field.options
        .map((o) => `<option value="${o.value}" ${v === o.value ? "selected" : ""}>${o.label}</option>`)
        .join("")}
    </select>`;
  } else {
    control = `<input data-cfg="${field.key}" type="number" min="${field.min}" max="${field.max}" value="${v}" ${disabled} />`;
  }
  return `<div class="field"><label>${field.label}</label>${control}<div class="hint">${field.hint}</div></div>`;
}

export function renderHud(
  el: HTMLElement,
  hud: HudSnapshot | null,
  level: LevelDef | null,
  mode: "live" | "paused" | "won",
): void {
  const p99 = hud?.p99 ?? 0;
  const err = hud?.errorRate ?? 0;
  const p99Goal = level?.latencySloMs ?? 0;
  const errGoal = level ? 1 - level.availabilitySlo : 1;
  const p99Bad = !!hud && hud.t > 1.2 && p99 > p99Goal;
  const errBad = !!hud && hud.t > 1.2 && err > errGoal;
  const healthy = !!hud && hud.t > 1.2 && !p99Bad && !errBad && hud.burn < 0.45;
  const held = hud ? Math.min(1, hud.t / Math.max(1, hud.duration)) : 0;
  const meter = healthy ? held : hud?.burn ?? 0;
  const meterLabel = mode === "won" ? "Promise kept" : healthy ? "Holding the promise" : hud && hud.t > 1.2 ? "Promise slipping" : "Promise";
  el.innerHTML = `
    <div class="live ${mode === "won" ? "won" : mode === "live" ? "on" : ""}">${mode === "won" ? "Done" : mode === "paused" ? "Paused" : "Live"}</div>
    <div class="metric"><b>${hud?.users ?? 0}</b><span>people</span></div>
    <div class="metric"><b>${(hud?.rps ?? 0).toFixed(0)}</b><span>clicks / sec</span></div>
    <div class="metric ${p99Bad ? "bad" : healthy ? "good" : ""}"><b>${p99.toFixed(0)}ms</b><span>slowest 1% · ${p99Goal || "—"}ms</span></div>
    <div class="metric ${errBad ? "bad" : healthy ? "good" : ""}"><b>${(err * 100).toFixed(1)}%</b><span>failing · max ${level ? (errGoal * 100).toFixed(1) : "—"}%</span></div>
    <div class="metric"><b>$${hud?.cost ?? 0}</b><span>a month</span></div>
    <div class="slo ${healthy ? "good" : p99Bad || errBad ? "bad" : ""}"><span>${meterLabel}</span><div class="bar"><i style="width:${Math.round(meter * 100)}%"></i></div></div>
  `;
}

export function renderControls(el: HTMLElement, paused: boolean): void {
  el.innerHTML = `
    <button class="btn" data-act="lesson">Lesson</button>
    <button class="btn" data-act="pause">${paused ? "Resume" : "Pause"}</button>
    <button class="btn" data-act="x1">1x</button>
    <button class="btn" data-act="x4">4x</button>
  `;
}

export function renderCoach(el: HTMLElement, note: CoachNote): void {
  el.className = `coach ${note.tone}`;
  el.innerHTML = `<b>${note.title}</b><p>${note.body}</p>`;
}

export function renderLabels(
  el: HTMLElement,
  project: (x: number, z: number) => { x: number; y: number } | null,
  nodes: PlacedNode[],
  views: NodeView[],
): void {
  const vmap = new Map(views.map((v) => [v.id, v]));
  el.innerHTML = nodes
    .map((n) => {
      const def = getComponent(n.defId);
      const view = vmap.get(n.id);
      const pos = gridToWorld(n.x, n.z);
      const w = project(pos.x, pos.z);
      if (!w || !view) return "";
      let extra = "";
      if (view.crashed) extra = "gave up";
      else if (def.role === "store" && view.conns >= view.pool && view.pool > 0 && view.waiters > 0) extra = "lines full";
      else if (view.sat > 0.85) extra = "too busy";
      if (!extra) return "";
      return `<div class="tag hot" style="left:${w.x}px;top:${w.y}px">${extra}</div>`;
    })
    .join("");
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
