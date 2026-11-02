import { sfx } from "../audio/sfx";
import { isCable } from "../catalog/cables";
import { offeredCables, offeredPieces } from "../catalog/wire";
import { defaultConfig, getComponent } from "../catalog/components";
import { SIM_STEP } from "../engine/const";
import { nid, resetIds } from "../engine/ids";
import { Simulation } from "../engine/sim";
import type { HudSnapshot, LevelDef, Link, LinkKind, NodeView, PlacedNode } from "../engine/types";
import { CAMPAIGN, getLevel } from "../levels/campaign";
import { cssColor } from "../levels/island";
import { iconURL } from "../render/icons";
import { Board } from "../render/Board";
import { explain } from "./coach";
import { loadCleared, saveCleared } from "./progress";
import {
  hideModal,
  mountShell,
  patchStats,
  renderBrief,
  renderCoach,
  renderControls,
  renderHud,
  renderInspect,
  renderLabels,
  renderPalette,
  installLevelPalettes,
  renderSelect,
  renderSuccess,
  type UI,
} from "../ui/shell";

type Screen = "boot" | "select" | "play";
type PlayMode = "live" | "paused";

export class Game {
  private ui: UI;
  private board: Board;
  private screen: Screen = "boot";
  private play: PlayMode = "live";
  private level: LevelDef | null = null;
  private nodes: PlacedNode[] = [];
  private links: Link[] = [];
  private tool = "";
  private cableTool: LinkKind | "" = "";
  private selected: string | null = null;
  private sim: Simulation | null = null;
  private hud: HudSnapshot | null = null;
  private views: NodeView[] = [];
  private timeScale = 1;
  private acc = 0;
  private last = 0;
  private undo: { nodes: PlacedNode[]; links: Link[] }[] = [];
  private cleared = loadCleared();
  private labelTimer = 0;
  private celebrating = false;
  private briefing = false;
  private pieceDrag: { id: string; sx: number; sy: number; moved: boolean } | null = null;
  private trayDrag: { id: string; sx: number; sy: number; moved: boolean } | null = null;
  private sheet: "" | "palette" | "inspect" = "";

  constructor(app: HTMLElement) {
    this.ui = mountShell(app);
    const canvas = app.querySelector("#board");
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("canvas");
    this.board = new Board(canvas);
    this.board.onImpact = () => sfx.drop();
    this.bind();
    requestAnimationFrame((t) => this.loop(t));
  }

  private bind(): void {
    window.addEventListener("resize", () => this.board.resize());
    window.visualViewport?.addEventListener("resize", () => this.board.resize());
    window.addEventListener("keydown", (e) => this.onKey(e));
    window.addEventListener("pointermove", (e) => this.onMove(e));
    window.addEventListener("pointerup", (e) => this.onUp(e));
    this.ui.root.addEventListener("pointerdown", (e) => {
      sfx.unlock();
      this.onDown(e);
    });
    this.ui.root.addEventListener("click", (e) => this.onClick(e));
    this.ui.root.addEventListener("change", (e) => this.onChange(e));
    this.ui.root.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  private onClick(e: Event): void {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const act = t.closest("[data-act]")?.getAttribute("data-act");
    const levelId = t.closest("[data-level]")?.getAttribute("data-level");
    const picked = t.closest("[data-tool]");
    if (picked && this.sheet) this.setSheet("");
    if (levelId) {
      this.openLevel(levelId);
      return;
    }
    if (!act) return;
    if (act === "enter") this.showSelect();
    if (act === "design") {
      if (this.briefing) {
        this.briefing = false;
        this.enterLevel();
      } else hideModal(this.ui.modal);
    }
    if (act === "levels") this.showSelect();
    if (act === "lesson" && this.level) renderBrief(this.ui.modal, this.level, true);
    if (act === "pause") this.onPause();
    if (act === "x1") this.timeScale = 1;
    if (act === "x4") this.timeScale = 4;
    if (act === "retry") this.enterLevel();
    if (act === "next") this.nextLevel();
    if (act === "delete") this.deleteSelected();
    if (act === "sheet") {
      const which = t.closest("[data-sheet]")?.getAttribute("data-sheet") ?? "";
      if (which === "palette" || which === "inspect") this.setSheet(which);
      else this.setSheet("");
    }
  }

  private onChange(e: Event): void {
    const t = e.target;
    if (!(t instanceof HTMLSelectElement || t instanceof HTMLInputElement)) return;
    const key = t.getAttribute("data-cfg");
    if (!key || !this.selected || this.celebrating) return;
    const node = this.nodes.find((n) => n.id === this.selected);
    if (!node || node.locked) return;
    this.pushUndo();
    const field = getComponent(node.defId).config.find((f) => f.key === key);
    if (!field) return;
    if (field.type === "bool") node.config[key] = t.value === "true";
    else if (field.type === "number") node.config[key] = Number(t.value);
    else node.config[key] = t.value;
    this.commit();
  }

  private onKey(e: KeyboardEvent): void {
    const tag = e.target instanceof HTMLElement ? e.target.tagName : "";
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (e.key === "Enter" && this.screen === "boot") this.showSelect();
    if (e.key === " ") {
      e.preventDefault();
      this.onPause();
    }
    if (e.key === "1") this.timeScale = 1;
    if (e.key === "4") this.timeScale = 4;
    if ((e.key === "z" || e.key === "Z") && !e.repeat) {
      e.preventDefault();
      this.popUndo();
    }
    if (e.key === "Backspace" || e.key === "Delete") this.deleteSelected();
    if (e.key === "Escape") {
      if (!this.ui.modal.classList.contains("hidden") && this.screen === "play" && !this.celebrating) {
        hideModal(this.ui.modal);
        return;
      }
      if (this.sheet) {
        this.setSheet("");
        return;
      }
      this.selected = null;
      this.board.setSelected(null);
      this.refreshInspect();
    }
  }

  private onDown(e: PointerEvent): void {
    if (this.celebrating || this.screen !== "play") return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t === this.board.renderer.domElement && this.sheet) {
      this.setSheet("");
      return;
    }
    const tool = t.closest("[data-tool]")?.getAttribute("data-tool");
    if (tool) {
      if (isCable(tool)) {
        sfx.tick();
        this.cableTool = this.cableTool === tool ? "" : tool;
        this.tool = "";
        this.trayDrag = { id: tool, sx: e.clientX, sy: e.clientY, moved: false };
        this.refreshAll();
        return;
      }
      this.tool = tool;
      this.cableTool = "";
      this.trayDrag = { id: tool, sx: e.clientX, sy: e.clientY, moved: false };
      this.refreshAll();
      return;
    }
    if (t !== this.board.renderer.domElement) return;
    const hit = this.board.pick(e.clientX, e.clientY);
    if (hit?.type === "node") {
      this.selected = hit.id;
      this.board.setSelected(hit.id);
      this.refreshInspect();
      this.refreshDock();
      this.pieceDrag = { id: hit.id, sx: e.clientX, sy: e.clientY, moved: false };
      try {
        this.board.renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer can already be gone */
      }
      return;
    }
    if (hit?.type === "tile" && this.tool && !isCable(this.tool)) {
      const placing = this.tool;
      this.tool = "";
      this.place(placing, hit.x, hit.z);
      this.refreshDock();
      return;
    }
    this.selected = null;
    this.board.setSelected(null);
    this.refreshInspect();
  }

  private onMove(e: PointerEvent): void {
    if (this.trayDrag) {
      if (Math.hypot(e.clientX - this.trayDrag.sx, e.clientY - this.trayDrag.sy) > 6) {
        this.trayDrag.moved = true;
        if (this.sheet) this.setSheet("");
        document.body.classList.add("dragging");
        this.ui.ghost.classList.remove("hidden");
        this.ui.ghost.setAttribute("src", iconURL(this.trayDrag.id));
        this.ui.ghost.style.left = `${e.clientX}px`;
        this.ui.ghost.style.top = `${e.clientY}px`;
      }
      const hit = this.board.pick(e.clientX, e.clientY);
      this.board.setHoverTile(hit?.type === "tile" ? hit : null);
      return;
    }
    if (this.pieceDrag) {
      if (Math.hypot(e.clientX - this.pieceDrag.sx, e.clientY - this.pieceDrag.sy) > 6) {
        if (!this.pieceDrag.moved) {
          this.board.beginDrag(this.pieceDrag.id);
          sfx.lift();
        }
        this.pieceDrag.moved = true;
        document.body.classList.add("dragging");
      }
      if (this.pieceDrag.moved) {
        const point = this.board.cursorOnBoard(e.clientX, e.clientY);
        if (point) this.board.dragTo(this.pieceDrag.id, point.x, point.z);
        const near = this.board.nearestNode(e.clientX, e.clientY, this.pieceDrag.id);
        const hit = this.board.pick(e.clientX, e.clientY);
        const targetId = near ?? (hit?.type === "node" ? hit.id : null);
        if (targetId) {
          const other = this.nodes.find((n) => n.id === targetId);
          this.board.setHoverTile(other ? { x: other.x, z: other.z } : null);
        } else {
          this.board.setHoverTile(this.board.dragCell(this.pieceDrag.id));
        }
      }
      return;
    }
    if (this.screen === "play" && !this.celebrating) {
      const hit = this.board.pick(e.clientX, e.clientY);
      this.board.setHoverTile(hit?.type === "tile" ? hit : null);
    }
  }

  private onUp(e: PointerEvent): void {
    document.body.classList.remove("dragging");
    this.ui.ghost.classList.add("hidden");
    this.board.setHoverTile(null);
    const overUi =
      e.target instanceof Element &&
      !!e.target.closest(".palette, .inspect, .hud-top, .controls, .coach, .modal-back, .dock");

    if (this.trayDrag) {
      const drag = this.trayDrag;
      this.trayDrag = null;
      if (!drag.moved) this.setSheet("");
      if (isCable(drag.id)) {
        this.cableTool = drag.id;
        this.tool = "";
        this.refreshAll();
        return;
      }
      if (drag.moved) this.tool = "";
      if (drag.moved && !overUi) {
        const hit = this.board.pick(e.clientX, e.clientY);
        if (hit?.type === "tile") this.place(drag.id, hit.x, hit.z);
      }
      return;
    }

    if (!this.pieceDrag) return;
    const drag = this.pieceDrag;
    this.pieceDrag = null;
    try {
      if (this.board.renderer.domElement.hasPointerCapture(e.pointerId)) {
        this.board.renderer.domElement.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* the pointer can already be gone */
    }
    if (!drag.moved) {
      this.board.endDrag();
      this.syncBoard();
      return;
    }
    const near = overUi ? null : this.board.nearestNode(e.clientX, e.clientY, drag.id);
    const hit = overUi ? null : this.board.pick(e.clientX, e.clientY);
    const cell = this.board.dragCell(drag.id);
    this.board.endDrag();
    const node = this.nodes.find((n) => n.id === drag.id);
    if (!node) {
      this.syncBoard();
      return;
    }
    const aimed =
      near ?? (hit?.type === "node" && hit.id !== drag.id ? hit.id : null);
    const occupant = cell
      ? this.nodes.find((n) => n.id !== drag.id && n.x === cell.x && n.z === cell.z)
      : undefined;
    const otherId = aimed ?? occupant?.id;
    if (otherId) {
      if (!this.cableTool) {
        this.syncBoard();
        const cables = this.level ? offeredCables(this.level) : [];
        renderCoach(this.ui.coach, {
          tone: "wait",
          title: "Pick a cable first",
          body:
            cables.length > 2
              ? "Every cable is a different language. HTTP is how people arrive. SQL, gRPC, Redis, AMQP, and Kafka are how machines talk. Pick one, then drag a piece onto another."
              : cables.some((c) => c.id === "sql")
                ? "Connections have a language. Pick HTTP for People → app, or SQL for app → database, then drag one piece onto the other."
                : "People reach the laptop over HTTP. Pick the HTTP cable in the tray, then drag People onto the laptop.",
        });
        return;
      }
      this.pushUndo();
      const plugged = this.toggleLink(drag.id, otherId, this.cableTool);
      if (plugged === "add") sfx.plug();
      else sfx.unplug();
      this.commit();
      return;
    }
    if (cell && !node.locked) {
      const occupied = this.nodes.some((n) => n.id !== node.id && n.x === cell.x && n.z === cell.z);
      if (!occupied && (node.x !== cell.x || node.z !== cell.z)) {
        this.pushUndo();
        node.x = cell.x;
        node.z = cell.z;
        this.commit();
        return;
      }
    }
    this.syncBoard();
  }

  private showSelect(): void {
    this.screen = "select";
    this.celebrating = false;
    this.sim = null;
    this.ui.boot.classList.add("hidden");
    this.ui.game.classList.add("hidden");
    hideModal(this.ui.modal);
    this.ui.select.classList.remove("hidden");
    renderSelect(this.ui.select, this.cleared);
  }

  private openLevel(id: string): void {
    const level = getLevel(id);
    if (!level.playable) return;
    this.level = level;
    this.briefing = true;
    this.ui.select.classList.add("hidden");
    renderBrief(this.ui.modal, level, false);
  }

  private enterLevel(): void {
    if (!this.level) return;
    this.screen = "play";
    this.play = "live";
    this.celebrating = false;
    this.tool = "";
    this.cableTool = "";
    resetIds();
    this.nodes = this.level.preplaced.map((p) => ({
      id: nid(p.defId),
      defId: p.defId,
      x: p.x,
      z: p.z,
      locked: p.locked,
      config: defaultConfig(getComponent(p.defId)),
    }));
    this.links = [];
    this.undo = [];
    this.board.setScene(this.level.scene);
    document.documentElement.style.setProperty("--bg", cssColor(this.level.scene.water));
    installLevelPalettes();
    this.ui.game.style.fontPalette = `--honk-${this.level.id}`;
    this.selected = this.nodes[0]?.id ?? null;
    hideModal(this.ui.modal);
    this.ui.boot.classList.add("hidden");
    this.ui.select.classList.add("hidden");
    this.ui.game.classList.remove("hidden");
    this.syncBoard();
    this.restartSim();
    this.refreshAll();
  }

  private onPause(): void {
    if (this.screen !== "play" || this.celebrating) return;
    this.play = this.play === "live" ? "paused" : "live";
    this.refreshAll();
  }

  private place(defId: string, x: number, z: number): void {
    if (!this.level || this.celebrating) return;
    if (this.nodes.some((n) => n.x === x && n.z === z)) return;
    const def = getComponent(defId);
    if (!def.placeable) return;
    if (this.cost() + def.cost > this.level.budget) {
      sfx.no();
      renderCoach(this.ui.coach, {
        tone: "bad",
        title: "That costs too much",
        body: `This piece is $${def.cost} a month. You have $${this.level.budget - this.cost()} left of a $${this.level.budget} budget.`,
      });
      return;
    }
    this.pushUndo();
    const node: PlacedNode = {
      id: nid(def.id),
      defId: def.id,
      x,
      z,
      locked: false,
      config: defaultConfig(def),
    };
    this.nodes.push(node);
    this.selected = node.id;
    this.commit();
  }

  private toggleLink(a: string, b: string, kind: LinkKind): "add" | "remove" {
    const existing = this.links.find(
      (l) => (l.from === a && l.to === b) || (l.from === b && l.to === a),
    );
    if (existing) {
      if (existing.kind === kind) {
        this.links = this.links.filter((l) => l.id !== existing.id);
        return "remove";
      }
      existing.kind = kind;
      return "add";
    }
    const from = this.nodes.find((n) => n.id === a);
    const to = this.nodes.find((n) => n.id === b);
    if (!from || !to) return "remove";
    const tierA = getComponent(from.defId).tier;
    const tierB = getComponent(to.defId).tier;
    const src = tierA <= tierB ? a : b;
    const dst = src === a ? b : a;
    this.links.push({ id: nid("link"), from: src, to: dst, kind });
    return "add";
  }

  private deleteSelected(): void {
    if (this.celebrating || this.screen !== "play" || !this.selected) return;
    const node = this.nodes.find((n) => n.id === this.selected);
    if (!node || node.locked) return;
    sfx.unplug();
    this.pushUndo();
    this.nodes = this.nodes.filter((n) => n.id !== node.id);
    this.links = this.links.filter((l) => l.from !== node.id && l.to !== node.id);
    this.selected = null;
    this.commit();
  }

  private pushUndo(): void {
    this.undo.push({ nodes: clone(this.nodes), links: clone(this.links) });
    if (this.undo.length > 40) this.undo.shift();
  }

  private popUndo(): void {
    if (this.celebrating || this.screen !== "play") return;
    const snap = this.undo.pop();
    if (!snap) return;
    this.nodes = snap.nodes;
    this.links = snap.links;
    this.selected = null;
    this.commit();
  }

  private commit(): void {
    this.syncBoard();
    this.restartSim();
    this.refreshAll();
  }

  private restartSim(): void {
    if (!this.level || this.celebrating) return;
    this.sim = new Simulation(this.level, clone(this.nodes), clone(this.links));
    this.hud = null;
    this.views = [];
    this.acc = 0;
    this.play = "live";
  }

  private nextLevel(): void {
    if (!this.level) return;
    const i = CAMPAIGN.findIndex((l) => l.id === this.level?.id);
    const next = CAMPAIGN.slice(i + 1).find((l) => l.playable);
    if (!next) {
      this.showSelect();
      return;
    }
    this.openLevel(next.id);
  }

  private celebrate(): void {
    if (!this.level || this.celebrating) return;
    this.celebrating = true;
    this.play = "paused";
    sfx.win();
    this.cleared.add(this.level.id);
    saveCleared(this.cleared);
    renderSuccess(this.ui.modal, this.level, this.level.copy.pass);
    this.refreshAll();
  }

  private cost(): number {
    return this.nodes.reduce((s, n) => s + getComponent(n.defId).cost, 0);
  }

  private syncBoard(): void {
    this.board.syncPlaced(this.nodes, this.links);
    this.board.setSelected(this.selected);
  }

  private refreshAll(): void {
    if (!this.level) return;
    renderPalette(
      this.ui.palette,
      offeredPieces(this.level),
      offeredCables(this.level),
      this.cost(),
      this.level.budget,
      this.cableTool,
    );
    this.refreshInspect();
    const mode = this.celebrating ? "won" : this.play === "paused" ? "paused" : "live";
    renderHud(this.ui.hud, this.hud, this.level, mode);
    renderControls(this.ui.controls, this.play === "paused");
    this.refreshDock();
    this.updateCoach();
  }

  private setSheet(next: "" | "palette" | "inspect"): void {
    this.sheet = next && next === this.sheet ? "" : next;
    this.ui.game.classList.toggle("sheet-palette", this.sheet === "palette");
    this.ui.game.classList.toggle("sheet-inspect", this.sheet === "inspect");
    for (const button of this.ui.game.querySelectorAll<HTMLElement>(".dock-btn")) {
      button.classList.toggle("active", button.getAttribute("data-sheet") === this.sheet);
    }
  }

  private refreshDock(): void {
    const armed = this.tool ? getComponent(this.tool).name : "";
    const selected = this.nodes.find((n) => n.id === this.selected);
    const selectedName = selected ? getComponent(selected.defId).name : "";
    if (armed) this.ui.dockNote.textContent = `Tap a tile to place ${armed}.`;
    else if (this.cableTool) this.ui.dockNote.textContent = `${this.cableTool.toUpperCase()} cable. Drag one piece onto another.`;
    else if (selectedName) this.ui.dockNote.textContent = `${selectedName}. Open This piece to change it.`;
    else this.ui.dockNote.textContent = "Open Pieces, tap one, then tap the island.";
    this.ui.game.classList.toggle("sheet-palette", this.sheet === "palette");
    this.ui.game.classList.toggle("sheet-inspect", this.sheet === "inspect");
  }

  private refreshInspect(): void {
    const node = this.nodes.find((n) => n.id === this.selected) ?? null;
    const view = this.views.find((v) => v.id === this.selected) ?? null;
    renderInspect(this.ui.inspect, node, view);
  }

  private updateCoach(): void {
    if (!this.level) return;
    renderCoach(
      this.ui.coach,
      explain({
        level: this.level,
        nodes: this.nodes,
        links: this.links,
        hud: this.hud,
        diagnosis: this.sim ? this.sim.liveDiagnosis() : "warming",
        won: this.celebrating,
      }),
    );
  }

  private loop = (t: number): void => {
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (t - this.last) / 1000 || 0);
    this.last = t;
    if (this.screen === "play" && this.play === "live" && this.sim && !this.celebrating) {
      this.acc += dt * this.timeScale;
      while (this.acc >= SIM_STEP) {
        const result = this.sim.tick(SIM_STEP);
        this.acc -= SIM_STEP;
        this.hud = result.hud;
        this.views = result.nodes;
        this.board.applySim(result.nodes, result.packets);
        if (result.ended && result.won) {
          this.celebrate();
          break;
        }
      }
      this.labelTimer += dt;
      if (this.labelTimer > 0.3) {
        this.labelTimer = 0;
        if (this.level) {
          renderHud(this.ui.hud, this.hud, this.level, "live");
        }
        const focused = document.activeElement instanceof Element && !!document.activeElement.closest("#inspect");
        if (!focused) {
          const node = this.nodes.find((n) => n.id === this.selected) ?? null;
          patchStats(this.ui.inspect, node, this.views.find((v) => v.id === this.selected) ?? null);
        }
        this.updateCoach();
        this.drawLabels();
      }
    } else if (this.screen === "play") {
      this.drawLabels();
    }
    this.board.render(dt);
  };

  private drawLabels(): void {
    renderLabels(this.ui.labels, (x, z) => this.board.project(x, z), this.nodes, this.views);
  }
}

function clone<T>(v: T): T {
  return structuredClone(v);
}
