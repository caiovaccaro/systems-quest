import * as THREE from "three";
import { CELL, COLS, ROWS, gridToWorld, worldToGrid } from "../engine/const";
import { getCable } from "../catalog/cables";
import { islandMask } from "../levels/island";
import type { Link, NodeView, PacketView, PlacedNode, SceneDef } from "../engine/types";
import { cableLabelCanvas } from "./icons";
import { buildModel } from "./models";

export type PickResult =
  | { type: "tile"; x: number; z: number }
  | { type: "node"; id: string };

export class Board {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera: THREE.OrthographicCamera;
  private readonly scene = new THREE.Scene();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly ground: THREE.Mesh;
  private readonly hover: THREE.Mesh;
  private readonly water: THREE.Mesh;
  private readonly island = new THREE.Group();
  private mask: boolean[][] = [];
  private accent = 0xf08a3c;
  private time = 0;
  private pressed: string | null = null;
  private readonly tiles = new Map<string, THREE.Mesh>();
  private readonly motes: { mesh: THREE.Mesh; v: THREE.Vector3; life: number }[] = [];
  private readonly moteGeo = new THREE.BoxGeometry(0.07, 0.07, 0.07);
  onImpact: (() => void) | null = null;
  private readonly nodes = new Map<string, THREE.Group>();
  private readonly links = new Map<string, THREE.Group>();
  private readonly packetPool: THREE.Mesh[] = [];
  private readonly nodeByMesh = new Map<THREE.Object3D, string>();
  private selected: string | null = null;
  private draggingId: string | null = null;
  private readonly cardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.15);
  private readonly hitV = new THREE.Vector3();
  private readonly yAxis = new THREE.Vector3(0, 1, 0);
  private readonly tmp = new THREE.Vector3();
  private readonly tmp2 = new THREE.Vector3();
  private readonly quat = new THREE.Quaternion();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.setClearColor(0x2f6f78, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    const aspect = 1;
    const view = 9.4;
    this.camera = new THREE.OrthographicCamera(
      -view * aspect,
      view * aspect,
      view,
      -view,
      0.1,
      80,
    );
    this.camera.position.set(18, 13.5, 18);
    this.camera.lookAt(0, 0, 0);

    this.scene.fog = new THREE.Fog(0x2f6f78, 26, 46);
    this.scene.add(new THREE.AmbientLight(0xb7e4e0, 0.55));
    const sun = new THREE.DirectionalLight(0xfff3d8, 1.25);
    sun.position.set(10, 18, 6);
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0x6ec4c8, 0.45);
    fill.position.set(-8, 8, -6);
    this.scene.add(fill);

    this.water = this.makeWater();
    this.scene.add(this.water);
    this.scene.add(this.island);
    this.setScene({
      place: "The stoop",
      shape: "block",
      water: 0x2f6f78,
      cliff: 0xc46a45,
      tileA: 0xf0d8b4,
      tileB: 0xe4c89a,
      accent: 0xf08a3c,
    });
    this.ground = this.makeGround();
    this.scene.add(this.ground);

    const hoverGeo = new THREE.PlaneGeometry(CELL * 0.92, CELL * 0.92);
    hoverGeo.rotateX(-Math.PI / 2);
    this.hover = new THREE.Mesh(
      hoverGeo,
      new THREE.MeshBasicMaterial({
        color: 0xf08a3c,
        transparent: true,
        opacity: 0.55,
      }),
    );
    this.hover.position.y = 0.34;
    this.hover.visible = false;
    this.scene.add(this.hover);

    const packetGeo = new THREE.SphereGeometry(0.12, 10, 8);
    for (let i = 0; i < 140; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: 0xe07a5f });
      const m = new THREE.Mesh(packetGeo, mat);
      m.visible = false;
      this.packetPool.push(m);
      this.scene.add(m);
    }

    this.resize();
  }

  resize(): void {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.fitCamera();
  }

  /** Keep the whole island on screen, including tall phones where the width is the tight edge. */
  private fitCamera(): void {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (w < 2 || h < 2) return;
    const aspect = w / h;
    this.camera.updateMatrixWorld();
    let minGx = 0;
    let maxGx = COLS - 1;
    let minGz = 0;
    let maxGz = ROWS - 1;
    let any = false;
    let landMinX = COLS;
    let landMaxX = 0;
    let landMinZ = ROWS;
    let landMaxZ = 0;
    for (let z = 0; z < ROWS; z++) {
      for (let x = 0; x < COLS; x++) {
        if (!this.mask[z]?.[x]) continue;
        any = true;
        landMinX = Math.min(landMinX, x);
        landMaxX = Math.max(landMaxX, x);
        landMinZ = Math.min(landMinZ, z);
        landMaxZ = Math.max(landMaxZ, z);
      }
    }
    if (any) {
      minGx = landMinX;
      maxGx = landMaxX;
      minGz = landMinZ;
      maxGz = landMaxZ;
    }
    const corners: [number, number][] = [
      [minGx - 1.1, minGz - 1.1],
      [maxGx + 1.1, minGz - 1.1],
      [minGx - 1.1, maxGz + 1.1],
      [maxGx + 1.1, maxGz + 1.1],
    ];
    let maxX = 0.01;
    let maxY = 0.01;
    for (const [gx, gz] of corners) {
      const spot = gridToWorld(gx, gz);
      for (const y of [0, 2.6]) {
        this.tmp.set(spot.x, y, spot.z);
        this.tmp.applyMatrix4(this.camera.matrixWorldInverse);
        maxX = Math.max(maxX, Math.abs(this.tmp.x));
        maxY = Math.max(maxY, Math.abs(this.tmp.y));
      }
    }
    const compact = window.matchMedia("(max-width: 1200px), (max-height: 760px)").matches;
    const short = window.matchMedia("(max-height: 520px)").matches;
    const pad = short ? 1.55 : compact ? 1.2 : 1.05;
    const needed = Math.max(maxY * pad, (maxX * pad) / aspect);
    const view = Math.max(9.4, needed);
    this.camera.left = -view * aspect;
    this.camera.right = view * aspect;
    this.camera.top = view;
    this.camera.bottom = -view;
    this.camera.updateProjectionMatrix();
  }

  setHoverTile(tile: { x: number; z: number } | null): void {
    if (!tile) {
      this.hover.visible = false;
      this.pressed = null;
      return;
    }
    if (!this.cellLand(tile.x, tile.z)) {
      this.hover.visible = false;
      this.pressed = null;
      return;
    }
    const w = gridToWorld(tile.x, tile.z);
    this.hover.visible = true;
    this.pressed = `${tile.x},${tile.z}`;
    this.hover.position.set(w.x, 0.34, w.z);
    (this.hover.material as THREE.MeshBasicMaterial).color.setHex(this.accent);
  }

  setSelected(id: string | null): void {
    this.selected = id;
    for (const [nid, group] of this.nodes) {
      const ring = group.userData.ring as THREE.Mesh;
      ring.visible = nid === id;
    }
  }

  syncPlaced(placed: PlacedNode[], links: Link[]): void {
    const keep = new Set(placed.map((n) => n.id));
    for (const [id, group] of this.nodes) {
      if (keep.has(id)) continue;
      this.scene.remove(group);
      this.nodes.delete(id);
    }
    for (const node of placed) {
      let group = this.nodes.get(node.id);
      if (!group) {
        group = this.makeNode(node.defId);
        this.nodes.set(node.id, group);
        this.scene.add(group);
        group.traverse((obj) => this.nodeByMesh.set(obj, node.id));
      }
      const w = gridToWorld(node.x, node.z);
      group.position.x = w.x;
      group.position.z = w.z;
      let body = group.userData.body as { y: number; vy: number; squash: number } | undefined;
      if (!body) {
        body = { y: 2.5, vy: 0, squash: 0 };
        group.userData.body = body;
        group.position.y = body.y;
      }
      const prev = group.userData.cell as { x: number; z: number } | undefined;
      if (prev && (prev.x !== node.x || prev.z !== node.z) && this.draggingId !== node.id) {
        body.vy = Math.max(body.vy, 5);
      }
      group.userData.cell = { x: node.x, z: node.z };
    }
    this.setSelected(this.selected);

    const live = new Set(links.map((l) => l.id));
    for (const [id, g] of this.links) {
      if (live.has(id)) continue;
      this.scene.remove(g);
      this.links.delete(id);
    }
    for (const link of links) {
      const from = placed.find((n) => n.id === link.from);
      const to = placed.find((n) => n.id === link.to);
      if (!from || !to) continue;
      let g = this.links.get(link.id);
      if (!g || g.userData.kind !== link.kind) {
        if (g) this.scene.remove(g);
        g = this.makeLink(link.kind);
        this.links.set(link.id, g);
        this.scene.add(g);
        g.userData.twang = 1;
      }
      this.layoutLink(g, from, to);
    }
  }

  beginDrag(id: string): void {
    this.draggingId = id;
  }

  dragTo(id: string, x: number, z: number): void {
    const group = this.nodes.get(id);
    if (!group) return;
    group.position.x = x;
    group.position.z = z;
  }

  /** Grid cell under the piece being dragged, where it will snap. */
  dragCell(id: string): { x: number; z: number } | null {
    const group = this.nodes.get(id);
    if (!group) return null;
    const { gx, gz } = worldToGrid(group.position.x, group.position.z);
    if (!this.cellLand(gx, gz)) return null;
    return { x: gx, z: gz };
  }

  /** World point at card height, so the icon stays under the cursor. */
  cursorOnBoard(clientX: number, clientY: number): { x: number; z: number } | null {
    this.aim(clientX, clientY);
    const hit = this.raycaster.ray.intersectPlane(this.cardPlane, this.hitV);
    if (!hit) return null;
    return { x: this.hitV.x, z: this.hitV.z };
  }

  /** Closest other piece whose icon is under the cursor, in screen pixels. */
  nearestNode(clientX: number, clientY: number, ignoreId: string | null): string | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    let best: { id: string; d: number } | null = null;
    for (const [id, group] of this.nodes) {
      if (id === ignoreId) continue;
      group.updateWorldMatrix(true, false);
      const center = group.localToWorld(new THREE.Vector3(0, 1.15, 0));
      center.project(this.camera);
      const sx = (center.x * 0.5 + 0.5) * rect.width + rect.left;
      const sy = (-center.y * 0.5 + 0.5) * rect.height + rect.top;
      const d = Math.hypot(sx - clientX, sy - clientY);
      if (d < 110 && (!best || d < best.d)) best = { id, d };
    }
    return best?.id ?? null;
  }

  endDrag(): void {
    this.draggingId = null;
  }

  applySim(nodes: NodeView[], packets: PacketView[]): void {
    for (const n of nodes) {
      const group = this.nodes.get(n.id);
      if (!group || n.id === this.draggingId) continue;
      const led = group.userData.led as THREE.Mesh;
      const heat = n.crashed ? 1 : n.sat;
      (led.material as THREE.MeshBasicMaterial).color.setHex(heat > 0.72 ? 0xe07a5f : 0x7d9a78);
      led.scale.setScalar(0.7 + heat * 0.8);
    }

    for (const p of this.packetPool) p.visible = false;
    packets.forEach((pkt, i) => {
      const mesh = this.packetPool[i];
      if (!mesh) return;
      mesh.visible = true;
      const x = pkt.ax + (pkt.bx - pkt.ax) * pkt.u;
      const z = pkt.az + (pkt.bz - pkt.az) * pkt.u;
      const span = Math.hypot(pkt.bx - pkt.ax, pkt.bz - pkt.az);
      const arch = Math.min(1.15, Math.max(0.45, span * 0.22));
      mesh.position.set(x, 0.72 + Math.sin(pkt.u * Math.PI) * arch, z);
      (mesh.material as THREE.MeshBasicMaterial).color.setHex(
        pkt.kind === "query" ? 0x8d74b8 : 0xe07a5f,
      );
    });
  }

  pick(clientX: number, clientY: number): PickResult | null {
    this.aim(clientX, clientY);

    const nodeHits = this.raycaster.intersectObjects(
      [...this.nodes.values()].flatMap((g) => {
        const body = g.userData.pick as THREE.Object3D;
        return body ? [body] : [];
      }),
      false,
    );
    for (const nodeHit of nodeHits) {
      const id = this.nodeByMesh.get(nodeHit.object) ?? this.nodeByMesh.get(nodeHit.object.parent!);
      if (id && id !== this.draggingId) return { type: "node", id };
    }

    const groundHits = this.raycaster.intersectObject(this.ground);
    const hit = groundHits[0];
    if (!hit) return null;
    const { gx, gz } = {
      gx: Math.round(hit.point.x / CELL + (COLS - 1) / 2),
      gz: Math.round(hit.point.z / CELL + (ROWS - 1) / 2),
    };
    if (!this.cellLand(gx, gz)) return null;
    return { type: "tile", x: gx, z: gz };
  }

  project(x: number, z: number, y = 1.35): { x: number; y: number } | null {
    this.tmp.set(x, y, z).project(this.camera);
    const canvas = this.renderer.domElement;
    return {
      x: (this.tmp.x * 0.5 + 0.5) * canvas.clientWidth,
      y: (-this.tmp.y * 0.5 + 0.5) * canvas.clientHeight,
    };
  }

  render(dt = 0.016): void {
    this.time += dt;
    this.water.position.y = -0.45 + Math.sin(this.time * 0.8) * 0.03;
    this.stepBodies(dt);
    this.stepMotes(dt);
    for (const [key, tile] of this.tiles) {
      const sink = key === this.pressed ? 0.07 : 0;
      tile.position.y += (0.2 - sink - tile.position.y) * Math.min(1, dt * 10);
    }
    for (const group of this.links.values()) {
      const badge = group.userData.badge as THREE.Object3D | undefined;
      if (badge) badge.quaternion.copy(this.camera.quaternion);
      const twang = (group.userData.twang as number) ?? 0;
      if (twang > 0) {
        group.userData.twang = Math.max(0, twang - dt * 1.6);
        if (badge) badge.position.y += Math.sin(twang * 18) * twang * 0.12;
      }
    }
    this.renderer.render(this.scene, this.camera);
  }

  private aim(clientX: number, clientY: number): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private makeWater(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(80, 80);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0x2a7f88, roughness: 0.72, metalness: 0.08 }),
    );
    mesh.position.y = -0.45;
    return mesh;
  }

  setScene(scene: SceneDef): void {
    this.mask = islandMask(scene.shape);
    this.accent = scene.accent;
    (this.water.material as THREE.MeshStandardMaterial).color.setHex(scene.water);
    this.renderer.setClearColor(scene.water, 1);
    const fog = this.scene.fog;
    if (fog instanceof THREE.Fog) fog.color.setHex(scene.water);

    for (const child of [...this.island.children]) {
      this.island.remove(child);
      child.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
      });
    }
    this.tiles.clear();

    const cliffMat = new THREE.MeshStandardMaterial({ color: scene.cliff, roughness: 0.92 });
    const side = new THREE.MeshStandardMaterial({ color: scene.cliff, roughness: 0.9 });
    const topA = new THREE.MeshStandardMaterial({ color: scene.tileA, roughness: 0.78 });
    const topB = new THREE.MeshStandardMaterial({ color: scene.tileB, roughness: 0.78 });
    const bottom = new THREE.MeshStandardMaterial({ color: scene.cliff, roughness: 1 });
    const tileGeo = new THREE.BoxGeometry(CELL * 0.92, 0.16, CELL * 0.92);
    const pebbleMat = new THREE.MeshStandardMaterial({ color: scene.tileA, roughness: 0.8 });
    let sx = 0;
    let sz = 0;
    let n = 0;

    for (let x = 0; x < COLS; x++) {
      for (let z = 0; z < ROWS; z++) {
        if (!this.mask[z]?.[x]) continue;
        const w = gridToWorld(x, z);
        const depth = 0.58 + ((x * 5 + z * 3) % 4) * 0.1;
        const cliff = new THREE.Mesh(
          new THREE.BoxGeometry(CELL * 0.98, depth, CELL * 0.98),
          cliffMat,
        );
        cliff.position.set(w.x, 0.12 - depth / 2, w.z);
        this.island.add(cliff);

        const top = (x + z) % 2 === 0 ? topA : topB;
        const tile = new THREE.Mesh(tileGeo, [side, side, top, bottom, side, side]);
        tile.position.set(w.x, 0.2, w.z);
        this.island.add(tile);
        this.tiles.set(`${x},${z}`, tile);
        sx += w.x;
        sz += w.z;
        n += 1;

        const waterNeighbor =
          !this.cellLand(x - 1, z) || !this.cellLand(x + 1, z) || !this.cellLand(x, z - 1) || !this.cellLand(x, z + 1);
        if (waterNeighbor && (x * 3 + z * 5) % 4 === 0) {
          const pebble = new THREE.Mesh(new THREE.SphereGeometry(0.12 + (x % 3) * 0.04, 10, 8), pebbleMat);
          const ox = this.cellLand(x - 1, z) ? 0.55 : -0.55;
          pebble.position.set(w.x + ox * 0.5, -0.28, w.z + ((z % 2) - 0.5) * 0.4);
          this.island.add(pebble);
        }
      }
    }
    if (n > 0) this.camera.lookAt(sx / n, 0, sz / n);
    this.fitCamera();
  }

  private cellLand(x: number, z: number): boolean {
    if (x < 0 || z < 0 || x >= COLS || z >= ROWS) return false;
    return this.mask[z]?.[x] === true;
  }

  private stepBodies(dt: number): void {
    for (const [id, group] of this.nodes) {
      const body = group.userData.body as { y: number; vy: number; squash: number } | undefined;
      const model = group.userData.model as THREE.Object3D | undefined;
      if (!body) continue;
      if (id === this.draggingId) {
        body.y += (0.55 - body.y) * Math.min(1, dt * 8);
        body.vy = 0;
        group.position.y = body.y;
        if (model) model.rotation.z = Math.sin(this.time * 10) * 0.05;
        continue;
      }
      if (model) model.rotation.z *= 0.86;
      body.vy -= 22 * dt;
      body.y += body.vy * dt;
      if (body.y <= 0) {
        if (body.vy < -2.2) {
          body.squash = 0.16;
          this.burst(group.position.x, group.position.z);
          this.onImpact?.();
        }
        body.y = 0;
        body.vy = body.vy < -0.8 ? -body.vy * 0.28 : 0;
      }
      body.squash = Math.max(0, body.squash - dt * 1.8);
      group.position.y = body.y;
      if (model) {
        const s = 2.15;
        const q = body.squash;
        model.scale.set(s * (1 + q), s * (1 - q * 1.5), s * (1 + q));
      }
    }
  }

  private burst(x: number, z: number): void {
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(
        this.moteGeo,
        new THREE.MeshStandardMaterial({ color: this.accent, roughness: 0.6 }),
      );
      mesh.position.set(x + (Math.random() - 0.5) * 0.5, 0.36, z + (Math.random() - 0.5) * 0.5);
      this.scene.add(mesh);
      this.motes.push({
        mesh,
        v: new THREE.Vector3((Math.random() - 0.5) * 1.6, 1.4 + Math.random() * 1.2, (Math.random() - 0.5) * 1.6),
        life: 0.55,
      });
    }
  }

  private stepMotes(dt: number): void {
    for (let i = this.motes.length - 1; i >= 0; i--) {
      const mote = this.motes[i]!;
      mote.life -= dt;
      mote.v.y -= 6 * dt;
      mote.mesh.position.addScaledVector(mote.v, dt);
      mote.mesh.rotation.x += dt * 4;
      if (mote.life <= 0 || mote.mesh.position.y < 0.2) {
        this.scene.remove(mote.mesh);
        this.motes.splice(i, 1);
      }
    }
  }

  private makeGround(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(COLS * CELL + 1.2, ROWS * CELL + 1.2);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ visible: false }));
    mesh.position.y = 0.3;
    return mesh;
  }

  private makeNode(defId: string): THREE.Group {
    const g = new THREE.Group();
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 20),
      new THREE.MeshBasicMaterial({ color: 0x3a2a22, transparent: true, opacity: 0.35 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.3;
    g.add(shadow);

    const model = buildModel(defId);
    const scale = 2.15;
    model.root.scale.setScalar(scale);
    model.root.position.y = 0.29 - 0.3 * scale;
    g.add(model.root);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.6, 28),
      new THREE.MeshBasicMaterial({
        color: 0xf08a3c,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.31;
    ring.visible = false;
    g.add(ring);

    const pick = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 2.1, 1.35),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    pick.position.y = 1.25;
    g.add(pick);

    g.userData.model = model.root;
    g.userData.led = model.led;
    g.userData.ring = ring;
    g.userData.pick = pick;
    return g;
  }

  private makeLink(kind: Link["kind"]): THREE.Group {
    const g = new THREE.Group();
    const color = getCable(kind)?.color ?? 0xc4a484;
    const pipeMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.38,
      metalness: 0.28,
    });
    const cable = new THREE.Mesh(new THREE.BufferGeometry(), pipeMat);
    const collarGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.22, 14);
    const collarA = new THREE.Mesh(collarGeo, pipeMat);
    const collarB = new THREE.Mesh(collarGeo, pipeMat);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.38, 10), pipeMat);
    const tex = new THREE.CanvasTexture(cableLabelCanvas(kind));
    tex.colorSpace = THREE.SRGBColorSpace;
    const badge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.36),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false }),
    );
    g.add(cable);
    g.add(collarA);
    g.add(collarB);
    g.add(arrow);
    g.add(badge);
    g.userData.cable = cable;
    g.userData.collarA = collarA;
    g.userData.collarB = collarB;
    g.userData.arrow = arrow;
    g.userData.badge = badge;
    g.userData.kind = kind;
    return g;
  }

  private layoutLink(g: THREE.Group, from: PlacedNode, to: PlacedNode): void {
    const a = gridToWorld(from.x, from.z);
    const b = gridToWorld(to.x, to.z);
    const start = new THREE.Vector3(a.x, 0.58, a.z);
    const end = new THREE.Vector3(b.x, 0.58, b.z);
    const span = start.distanceTo(end);
    const arch = Math.min(1.15, Math.max(0.45, span * 0.22));
    const mid = start.clone().lerp(end, 0.5);
    mid.y = 0.58 + arch;
    const curve = new THREE.CatmullRomCurve3([start, mid, end]);

    const cable = g.userData.cable as THREE.Mesh;
    cable.geometry.dispose();
    cable.geometry = new THREE.TubeGeometry(curve, 28, 0.1, 14, false);
    cable.position.set(0, 0, 0);
    cable.rotation.set(0, 0, 0);
    cable.scale.set(1, 1, 1);

    const aim = (mesh: THREE.Mesh, at: THREE.Vector3, toward: THREE.Vector3) => {
      mesh.position.copy(at);
      this.tmp2.copy(toward).sub(at);
      if (this.tmp2.lengthSq() < 1e-6) return;
      this.quat.setFromUnitVectors(this.yAxis, this.tmp2.normalize());
      mesh.quaternion.copy(this.quat);
    };
    aim(g.userData.collarA as THREE.Mesh, start, mid);
    aim(g.userData.collarB as THREE.Mesh, end, mid);

    const arrowAt = curve.getPoint(0.68);
    const arrowTo = curve.getPoint(0.8);
    aim(g.userData.arrow as THREE.Mesh, arrowAt, arrowTo);

    const badge = g.userData.badge as THREE.Mesh;
    badge.position.set(mid.x, mid.y + 0.38, mid.z);
  }
}
