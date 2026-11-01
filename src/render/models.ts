import * as THREE from "three";

/** Tile top sits near here. Models stand on it. */
const BASE = 0.3;

function mat(color: number, roughness = 0.58): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 });
}

function box(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function sphere(
  parent: THREE.Object3D,
  r: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function lamp(parent: THREE.Object3D, x: number, y: number, z: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0x7dcea0,
      emissive: 0x2d6a45,
      emissiveIntensity: 0.6,
      roughness: 0.4,
    }),
  );
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function person(
  parent: THREE.Object3D,
  x: number,
  shirt: number,
  hair: number,
  wave: boolean,
): void {
  const skin = mat(0xffd7b5, 0.7);
  const cloth = mat(shirt, 0.62);
  const hairMat = mat(hair, 0.7);
  const pants = mat(0x3d342b, 0.75);
  const foot = BASE;
  box(parent, 0.09, 0.16, 0.09, x - 0.06, foot + 0.08, 0.02, pants);
  box(parent, 0.09, 0.16, 0.09, x + 0.06, foot + 0.08, 0.02, pants);
  box(parent, 0.28, 0.3, 0.18, x, foot + 0.32, 0, cloth);
  sphere(parent, 0.13, x, foot + 0.58, 0, skin);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
  cap.position.set(x, foot + 0.6, 0);
  parent.add(cap);
  sphere(parent, 0.018, x - 0.045, foot + 0.59, 0.1, mat(0x2a2420, 0.4));
  sphere(parent, 0.018, x + 0.045, foot + 0.59, 0.1, mat(0x2a2420, 0.4));
  if (wave) {
    const arm = box(parent, 0.07, 0.22, 0.07, x + 0.2, foot + 0.48, 0, skin);
    arm.rotation.z = -0.9;
  } else {
    box(parent, 0.07, 0.2, 0.07, x - 0.18, foot + 0.28, 0, skin);
    box(parent, 0.07, 0.2, 0.07, x + 0.18, foot + 0.28, 0, skin);
  }
}

function buildPeople(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  person(root, -0.28, 0xf0b429, 0x5b4636, false);
  person(root, 0, 0xe07a5f, 0x2f2a28, true);
  person(root, 0.28, 0x7d9a78, 0x3d342b, false);
  const led = lamp(root, 0, BASE + 0.86, 0);
  return { root, led };
}

function buildLaptop(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const wood = mat(0xc4894f, 0.72);
  const dark = mat(0x3d342b, 0.55);
  const bezel = mat(0x2c3338, 0.45);
  const glass = mat(0x7ec8c4, 0.25);
  box(root, 0.16, 0.22, 0.16, -0.32, BASE + 0.11, 0.18, wood);
  box(root, 0.16, 0.22, 0.16, 0.32, BASE + 0.11, 0.18, wood);
  box(root, 0.16, 0.22, 0.16, -0.32, BASE + 0.11, -0.18, wood);
  box(root, 0.16, 0.22, 0.16, 0.32, BASE + 0.11, -0.18, wood);
  box(root, 0.92, 0.08, 0.62, 0, BASE + 0.26, 0, wood);

  box(root, 0.62, 0.04, 0.4, 0, BASE + 0.32, 0.04, dark);
  const screen = new THREE.Group();
  screen.position.set(0, BASE + 0.34, -0.14);
  screen.rotation.x = -0.42;
  root.add(screen);
  box(screen, 0.58, 0.4, 0.04, 0, 0.2, 0, bezel);
  box(screen, 0.46, 0.28, 0.012, 0, 0.2, 0.026, glass);
  sphere(screen, 0.02, -0.08, 0.24, 0.04, mat(0x1c2428, 0.3));
  sphere(screen, 0.02, 0.08, 0.24, 0.04, mat(0x1c2428, 0.3));
  box(screen, 0.12, 0.025, 0.012, 0, 0.14, 0.04, mat(0xe07a5f, 0.4));

  const note = box(root, 0.18, 0.02, 0.16, 0.3, BASE + 0.32, 0.16, mat(0xf2c14e, 0.6));
  note.rotation.y = 0.4;
  const led = lamp(root, 0.42, BASE + 0.4, -0.2);
  return { root, led };
}

function buildApp(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const wall = mat(0x5b8fd6, 0.55);
  const roof = mat(0xe07a3c, 0.62);
  const trim = mat(0xfff6ea, 0.5);
  const glass = mat(0xd7f4f2, 0.2);
  box(root, 0.74, 0.72, 0.74, 0, BASE + 0.36, 0, wall);
  box(root, 0.88, 0.08, 0.88, 0, BASE + 0.76, 0, roof);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.28, 4), roof);
  cap.position.set(0, BASE + 0.94, 0);
  cap.rotation.y = Math.PI / 4;
  root.add(cap);
  box(root, 0.16, 0.28, 0.04, 0, BASE + 0.2, 0.38, mat(0x3d342b, 0.7));
  box(root, 0.16, 0.14, 0.03, -0.18, BASE + 0.48, 0.38, glass);
  box(root, 0.16, 0.14, 0.03, 0.18, BASE + 0.48, 0.38, glass);
  box(root, 0.03, 0.14, 0.16, 0.38, BASE + 0.48, -0.1, glass);
  box(root, 0.03, 0.14, 0.16, 0.38, BASE + 0.48, 0.16, glass);
  box(root, 0.22, 0.04, 0.22, 0, BASE + 0.82, 0, trim);
  const led = lamp(root, 0, BASE + 1.14, 0);
  return { root, led };
}

function buildDatabase(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const drum = mat(0x8d74b8, 0.48);
  const band = mat(0xfff6ea, 0.45);
  const dark = mat(0x3a2d52, 0.5);
  for (let i = 0; i < 3; i++) {
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.18, 20), drum);
    disk.position.set(0, BASE + 0.14 + i * 0.2, 0);
    root.add(disk);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.025, 8, 20), band);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, BASE + 0.22 + i * 0.2, 0);
    root.add(ring);
  }
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), drum);
  dome.position.set(0, BASE + 0.64, 0);
  root.add(dome);
  sphere(root, 0.045, -0.1, BASE + 0.58, 0.24, dark);
  sphere(root, 0.045, 0.12, BASE + 0.58, 0.22, dark);
  const trunk = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 8, 14, Math.PI * 0.85), drum);
  trunk.position.set(0.22, BASE + 0.42, 0.22);
  trunk.rotation.z = -0.6;
  trunk.rotation.y = 0.4;
  root.add(trunk);
  box(root, 0.28, 0.08, 0.04, 0, BASE + 0.2, 0.36, band);
  const led = lamp(root, 0, BASE + 0.98, 0);
  return { root, led };
}

function buildHouse(wallColor: number, roofColor: number): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const wall = mat(wallColor, 0.55);
  const roof = mat(roofColor, 0.62);
  box(root, 0.74, 0.72, 0.74, 0, BASE + 0.36, 0, wall);
  box(root, 0.88, 0.08, 0.88, 0, BASE + 0.76, 0, roof);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.28, 4), roof);
  cap.position.set(0, BASE + 0.94, 0);
  cap.rotation.y = Math.PI / 4;
  root.add(cap);
  box(root, 0.16, 0.28, 0.04, 0, BASE + 0.2, 0.38, mat(0x3d342b, 0.7));
  const led = lamp(root, 0, BASE + 1.14, 0);
  return { root, led };
}

function buildBeacon(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const stone = mat(0xd9d3c5, 0.7);
  const band = mat(0xc46a45, 0.6);
  box(root, 0.46, 0.9, 0.46, 0, BASE + 0.45, 0, stone);
  box(root, 0.5, 0.08, 0.5, 0, BASE + 0.7, 0, band);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.28, 12), mat(0xf6d98a, 0.3));
  glass.position.set(0, BASE + 1.02, 0);
  root.add(glass);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.22, 12), mat(0xe07a3c, 0.5));
  cap.position.set(0, BASE + 1.26, 0);
  root.add(cap);
  const led = lamp(root, 0, BASE + 1.02, 0.24);
  return { root, led };
}

function buildPorch(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const wood = mat(0xc4894f, 0.7);
  box(root, 0.12, 0.7, 0.12, -0.32, BASE + 0.35, 0, wood);
  box(root, 0.12, 0.7, 0.12, 0.32, BASE + 0.35, 0, wood);
  box(root, 0.86, 0.1, 0.36, 0, BASE + 0.74, 0, mat(0xe07a3c, 0.6));
  const bell = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.14, 10), mat(0xf2c14e, 0.4));
  bell.position.set(0, BASE + 0.58, 0);
  root.add(bell);
  const led = lamp(root, 0, BASE + 0.9, 0);
  return { root, led };
}

function buildOven(): { root: THREE.Group; led: THREE.Mesh } {
  const built = buildHouse(0xf3d2a4, 0xe07a3c);
  box(built.root, 0.16, 0.28, 0.16, 0.22, BASE + 0.9, -0.1, mat(0x8d6246, 0.7));
  return built;
}

function buildBooth(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const cloth = mat(0xf2c14e, 0.6);
  box(root, 0.7, 0.5, 0.5, 0, BASE + 0.4, 0, mat(0xfff6ea, 0.55));
  box(root, 0.86, 0.06, 0.7, 0, BASE + 0.7, 0, cloth);
  box(root, 0.08, 0.7, 0.08, -0.36, BASE + 0.4, 0.28, mat(0x8d6246, 0.7));
  box(root, 0.08, 0.7, 0.08, 0.36, BASE + 0.4, 0.28, mat(0x8d6246, 0.7));
  const led = lamp(root, 0, BASE + 0.86, 0);
  return { root, led };
}

function buildLanterns(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const glass = mat(0xf6d98a, 0.35);
  for (let i = 0; i < 3; i++) {
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.22, 10), glass);
    jar.position.set((i - 1) * 0.28, BASE + 0.28 + (i % 2) * 0.16, 0);
    root.add(jar);
  }
  const led = lamp(root, 0, BASE + 0.7, 0);
  return { root, led };
}

function buildLoft(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  box(root, 0.9, 0.36, 0.55, 0, BASE + 0.4, 0, mat(0xf7f4ee, 0.55));
  box(root, 1.05, 0.08, 0.7, 0, BASE + 0.64, 0, mat(0xe07a5f, 0.55));
  box(root, 0.22, 0.16, 0.02, -0.2, BASE + 0.42, 0.28, mat(0x7ec8c4, 0.3));
  box(root, 0.22, 0.16, 0.02, 0.2, BASE + 0.42, 0.28, mat(0xf2c14e, 0.4));
  const led = lamp(root, 0.42, BASE + 0.78, 0);
  return { root, led };
}

function buildPress(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  box(root, 0.7, 0.4, 0.5, 0, BASE + 0.28, 0, mat(0x5c6b73, 0.55));
  const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.62, 12), mat(0x2c3338, 0.4));
  roller.rotation.z = Math.PI / 2;
  roller.position.set(0, BASE + 0.56, 0);
  root.add(roller);
  const led = lamp(root, 0.32, BASE + 0.56, 0.2);
  return { root, led };
}

function buildSlot(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  box(root, 0.46, 0.7, 0.28, 0, BASE + 0.4, 0, mat(0x3d4a66, 0.5));
  box(root, 0.28, 0.06, 0.04, 0, BASE + 0.55, 0.16, mat(0xf0c14a, 0.4));
  const flag = box(root, 0.04, 0.22, 0.16, 0.28, BASE + 0.7, 0, mat(0xe07a5f, 0.5));
  flag.rotation.z = 0.4;
  const led = lamp(root, 0, BASE + 0.86, 0);
  return { root, led };
}

function buildClerk(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  box(root, 0.8, 0.12, 0.46, 0, BASE + 0.32, 0, mat(0x6a5344, 0.65));
  for (let i = 0; i < 3; i++) {
    box(root, 0.18, 0.22, 0.16, -0.24 + i * 0.24, BASE + 0.5, -0.08, mat(0xc9b79c, 0.6));
  }
  const led = lamp(root, 0.34, BASE + 0.7, 0.12);
  return { root, led };
}

function buildGate(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const hedge = mat(0x6a8f62, 0.7);
  const iron = mat(0x3d342b, 0.45);
  box(root, 0.22, 0.55, 0.28, -0.4, BASE + 0.28, 0, hedge);
  box(root, 0.22, 0.55, 0.28, 0.4, BASE + 0.28, 0, hedge);
  box(root, 0.08, 0.62, 0.08, -0.22, BASE + 0.34, 0, iron);
  box(root, 0.08, 0.62, 0.08, 0.22, BASE + 0.34, 0, iron);
  box(root, 0.5, 0.08, 0.08, 0, BASE + 0.62, 0, iron);
  const led = lamp(root, 0, BASE + 0.78, 0);
  return { root, led };
}

function buildPath(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const stone = mat(0xd7d0b8, 0.8);
  box(root, 0.28, 0.08, 0.28, -0.16, BASE + 0.1, 0.05, stone);
  box(root, 0.28, 0.08, 0.28, 0.14, BASE + 0.1, -0.08, stone);
  box(root, 0.22, 0.08, 0.22, 0, BASE + 0.1, 0.22, stone);
  box(root, 0.08, 0.42, 0.08, 0.28, BASE + 0.28, -0.16, mat(0x8d6246, 0.7));
  box(root, 0.22, 0.16, 0.04, 0.28, BASE + 0.52, -0.16, mat(0xfff6ea, 0.5));
  const led = lamp(root, 0.28, BASE + 0.66, -0.16);
  return { root, led };
}

function buildLedger(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const covers = [0x3d6b4f, 0x2f5d4a, 0x6a8f62];
  for (let i = 0; i < 3; i++) {
    const book = box(root, 0.46, 0.12, 0.34, 0, BASE + 0.12 + i * 0.14, 0, mat(covers[i]!, 0.55));
    book.rotation.y = (i - 1) * 0.08;
  }
  const led = lamp(root, 0.22, BASE + 0.62, 0);
  return { root, led };
}

function buildCatalog(): { root: THREE.Group; led: THREE.Mesh } {
  const root = new THREE.Group();
  const wood = mat(0xc49a8c, 0.6);
  box(root, 0.7, 0.7, 0.4, 0, BASE + 0.4, 0, wood);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      box(root, 0.16, 0.1, 0.04, -0.2 + col * 0.2, BASE + 0.22 + row * 0.2, 0.2, mat(0xfff6ea, 0.45));
    }
  }
  const led = lamp(root, 0, BASE + 0.86, 0);
  return { root, led };
}

export function buildModel(defId: string): { root: THREE.Group; led: THREE.Mesh } {
  if (defId === "users") return buildPeople();
  if (defId === "laptop") return buildLaptop();
  if (defId === "db" || defId === "echo") return buildDatabase();
  if (defId === "beacon") return buildBeacon();
  if (defId === "porch") return buildPorch();
  if (defId === "oven") return buildOven();
  if (defId === "booth") return buildBooth();
  if (defId === "cache") return buildLanterns();
  if (defId === "cdn") return buildLoft();
  if (defId === "origin") return buildPress();
  if (defId === "slot") return buildSlot();
  if (defId === "clerk") return buildClerk();
  if (defId === "gate") return buildGate();
  if (defId === "path") return buildPath();
  if (defId === "ledger") return buildLedger();
  if (defId === "search") return buildCatalog();
  return buildApp();
}
