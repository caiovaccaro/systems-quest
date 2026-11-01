import * as THREE from "three";
import { CELL, COLS, ROWS, gridToWorld, worldToGrid } from "../engine/const";
import { getCable } from "../catalog/cables";
import type { Link, NodeView, PacketView, PlacedNode } from "../engine/types";
import { cableLabelCanvas, iconCanvas } from "./icons";

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
  private readonly nodes = new Map<string, THREE.Group>();
  private readonly links = new Map<string, THREE.Group>();
  private readonly packetPool: THREE.Mesh[] = [];
  private readonly nodeByMesh = new Map<THREE.Object3D, string>();
  private selected: string | null = null;
  private draggingId: string | null = null;
  private readonly cardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.78);
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
    this.renderer.setClearColor(0xf6efe4, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    const aspect = 1;
    const view = 10.4;
    this.camera = new THREE.OrthographicCamera(
      -view * aspect,
      view * aspect,
      view,
      -view,
      0.1,
      80,
    );
    this.camera.position.set(16, 18.5, 16);
    this.camera.lookAt(0, 0, 0);

    this.scene.fog = new THREE.Fog(0xf6efe4, 28, 48);
    this.scene.add(new THREE.AmbientLight(0xfff4e8, 0.95));
    const sun = new THREE.DirectionalLight(0xfff6ea, 0.85);
    sun.position.set(8, 14, 6);
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffe0c2, 0.35);
    fill.position.set(-6, 6, -8);
    this.scene.add(fill);

    this.ground = this.makeGround();
    this.scene.add(this.ground);
    this.scene.add(this.makeGrid());

    const hoverGeo = new THREE.PlaneGeometry(CELL * 0.92, CELL * 0.92);
    hoverGeo.rotateX(-Math.PI / 2);
    this.hover = new THREE.Mesh(
      hoverGeo,
      new THREE.MeshBasicMaterial({
        color: 0x7d9a78,
        transparent: true,
        opacity: 0.35,
      }),
    );
    this.hover.position.y = 0.03;
    this.hover.visible = false;
    this.scene.add(this.hover);

    const packetGeo = new THREE.SphereGeometry(0.07, 8, 8);
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
    const view = 10.4;
    const aspect = w / Math.max(1, h);
    this.camera.left = -view * aspect;
    this.camera.right = view * aspect;
    this.camera.top = view;
    this.camera.bottom = -view;
    this.camera.updateProjectionMatrix();
  }

  setHoverTile(tile: { x: number; z: number } | null): void {
    if (!tile) {
      this.hover.visible = false;
      return;
    }
    const w = gridToWorld(tile.x, tile.z);
    this.hover.visible = true;
    this.hover.position.set(w.x, 0.03, w.z);
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
      group.position.set(w.x, 0, w.z);
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
    group.position.set(x, 0, z);
  }

  /** Grid cell under the piece being dragged, where it will snap. */
  dragCell(id: string): { x: number; z: number } | null {
    const group = this.nodes.get(id);
    if (!group) return null;
    const { gx, gz } = worldToGrid(group.position.x, group.position.z);
    if (gx < 0 || gz < 0 || gx >= COLS || gz >= ROWS) return null;
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
      const center = group.localToWorld(new THREE.Vector3(0, 0.78, 0));
      center.project(this.camera);
      const sx = (center.x * 0.5 + 0.5) * rect.width + rect.left;
      const sy = (-center.y * 0.5 + 0.5) * rect.height + rect.top;
      const d = Math.hypot(sx - clientX, sy - clientY);
      if (d < 78 && (!best || d < best.d)) best = { id, d };
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
      mesh.position.set(x, 0.62 + Math.sin(pkt.u * Math.PI) * 0.16, z);
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
    if (gx < 0 || gz < 0 || gx >= COLS || gz >= ROWS) return null;
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

  render(): void {
    for (const group of this.nodes.values()) {
      const card = group.userData.card as THREE.Object3D | undefined;
      const pick = group.userData.pick as THREE.Object3D | undefined;
      if (card) card.quaternion.copy(this.camera.quaternion);
      if (pick) pick.quaternion.copy(this.camera.quaternion);
    }
    for (const group of this.links.values()) {
      const badge = group.userData.badge as THREE.Object3D | undefined;
      if (badge) badge.quaternion.copy(this.camera.quaternion);
    }
    this.renderer.render(this.scene, this.camera);
  }

  private aim(clientX: number, clientY: number): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private makeGround(): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(COLS * CELL + 2.4, ROWS * CELL + 2.4);
    geo.rotateX(-Math.PI / 2);
    const tex = this.gridTexture();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf3e6d4,
      map: tex,
      roughness: 0.95,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0;
    return mesh;
  }

  private makeGrid(): THREE.Group {
    const g = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: 0xe0cbb6, transparent: true, opacity: 0.95 });
    for (let x = 0; x < COLS; x++) {
      for (let z = 0; z < ROWS; z++) {
        const w = gridToWorld(x, z);
        const s = CELL * 0.9;
        const pts = [
          new THREE.Vector3(w.x - s / 2, 0.012, w.z - s / 2),
          new THREE.Vector3(w.x + s / 2, 0.012, w.z - s / 2),
          new THREE.Vector3(w.x + s / 2, 0.012, w.z + s / 2),
          new THREE.Vector3(w.x - s / 2, 0.012, w.z + s / 2),
          new THREE.Vector3(w.x - s / 2, 0.012, w.z - s / 2),
        ];
        g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
      }
    }
    return g;
  }

  private gridTexture(): THREE.CanvasTexture {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#f6ecdf";
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = "#ead9c6";
    for (let i = 0; i < 512; i += 16) {
      for (let j = 0; j < 512; j += 16) {
        ctx.fillRect(i, j, 2, 2);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 4);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private makeNode(defId: string): THREE.Group {
    const g = new THREE.Group();
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.46, 20),
      new THREE.MeshBasicMaterial({ color: 0xd9c2aa, transparent: true, opacity: 0.55 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    g.add(shadow);

    const tex = new THREE.CanvasTexture(iconCanvas(defId));
    tex.colorSpace = THREE.SRGBColorSpace;
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(1.28, 1.6),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
    );
    card.position.y = 0.78;
    card.quaternion.copy(this.camera.quaternion);
    g.add(card);

    const led = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0x7d9a78 }),
    );
    led.position.set(0.42, 1.35, 0);
    g.add(led);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.66, 28),
      new THREE.MeshBasicMaterial({
        color: 0xe07a5f,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    ring.visible = false;
    g.add(ring);

    const pick = new THREE.Mesh(
      new THREE.PlaneGeometry(1.35, 1.7),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
    );
    pick.position.y = 0.78;
    pick.quaternion.copy(this.camera.quaternion);
    g.add(pick);

    g.userData.card = card;
    g.userData.led = led;
    g.userData.ring = ring;
    g.userData.pick = pick;
    return g;
  }

  private makeLink(kind: Link["kind"]): THREE.Group {
    const g = new THREE.Group();
    const color = getCable(kind)?.color ?? 0xc4a484;
    const mat = new THREE.MeshBasicMaterial({ color });
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 8), mat);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 8), mat);
    const tex = new THREE.CanvasTexture(cableLabelCanvas(kind));
    tex.colorSpace = THREE.SRGBColorSpace;
    const badge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.36),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false }),
    );
    badge.position.y = 0.55;
    badge.quaternion.copy(this.camera.quaternion);
    g.add(cable);
    g.add(arrow);
    g.add(badge);
    g.userData.cable = cable;
    g.userData.arrow = arrow;
    g.userData.badge = badge;
    g.userData.kind = kind;
    return g;
  }

  private layoutLink(g: THREE.Group, from: PlacedNode, to: PlacedNode): void {
    const a = gridToWorld(from.x, from.z);
    const b = gridToWorld(to.x, to.z);
    this.tmp.set(a.x, 0.22, a.z);
    this.tmp2.set(b.x, 0.22, b.z);
    const dir = this.tmp2.clone().sub(this.tmp);
    const len = dir.length();
    const mid = this.tmp.clone().add(this.tmp2).multiplyScalar(0.5);
    const cable = g.userData.cable as THREE.Mesh;
    cable.position.copy(mid);
    cable.scale.set(1, len, 1);
    this.quat.setFromUnitVectors(this.yAxis, dir.clone().normalize());
    cable.setRotationFromQuaternion(this.quat);
    const arrow = g.userData.arrow as THREE.Mesh;
    const along = this.tmp.clone().lerp(this.tmp2, 0.78);
    arrow.position.copy(along);
    arrow.setRotationFromQuaternion(this.quat);
    const badge = g.userData.badge as THREE.Mesh;
    badge.position.set(mid.x, 0.62, mid.z);
  }
}
