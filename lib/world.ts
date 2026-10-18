import {
  sections as defaultSections,
  type Leaf,
  type Section,
  type SectionId,
} from "@/lib/content";

/**
 * The whole site is one map. Each page is a room on a grid; one unit is one viewport.
 * Sections sit two steps from the hub in their direction and their leaves one step around
 * them on the free arms of the same cross, so the map repeats the pattern every page draws.
 * The tree comes from `lib/content.ts` or from the admin's override (see `content-store`).
 */
export type Vec = { x: number; y: number };

export type Room =
  | { kind: "hub"; path: "/"; pos: Vec; label: string; short: string }
  | { kind: "map"; path: "/map"; pos: Vec; label: string; short: string }
  | {
      kind: "section";
      path: string;
      pos: Vec;
      label: string;
      short: string;
      section: Section;
    }
  | {
      kind: "leaf";
      path: string;
      pos: Vec;
      label: string;
      short: string;
      section: Section;
      leaf: Leaf;
    };

export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

export type WorldModel = {
  rooms: Room[];
  hub: Room;
  map: Room;
  bounds: Bounds;
};

export const MAX_CHILDREN = 6;

const sectionPos: Record<SectionId, Vec> = {
  events: { x: 0, y: -2 },
  about: { x: 0, y: 2 },
  education: { x: -2, y: 0 },
  product: { x: 2, y: 0 },
};

/**
 * Arms of each section's cross that do not lead back to the hub, in child order: the first
 * child takes the first arm. Reordering children in the admin moves them round the fan.
 */
const arms: Record<SectionId, Vec[]> = {
  events: [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ],
  about: [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ],
  education: [
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
  ],
  product: [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ],
};

const hubRoom: Room = {
  kind: "hub",
  path: "/",
  pos: { x: 0, y: 0 },
  label: "خانه",
  short: "خانه",
};

/** On the hub's diagonal, so opening the map is a pan like any other step. */
const mapRoom: Room = {
  kind: "map",
  path: "/map",
  pos: { x: -1, y: -1 },
  label: "نقشه",
  short: "نقشه",
};

const key = (p: Vec) => `${p.x},${p.y}`;

/** Children past the three arms take the nearest free cells around their section, outward first. */
function extraCells(at: Vec, taken: Set<string>): Vec[] {
  const cells: Vec[] = [];
  for (let dx = -2; dx <= 2; dx += 1) {
    for (let dy = -2; dy <= 2; dy += 1) {
      const p = { x: at.x + dx, y: at.y + dy };
      if (
        (dx === 0 && dy === 0) ||
        taken.has(key(p)) ||
        Math.abs(p.x) + Math.abs(p.y) <= 1
      )
        continue;
      cells.push(p);
    }
  }
  return cells.sort(
    (a, b) =>
      Math.hypot(a.x - at.x, a.y - at.y) - Math.hypot(b.x - at.x, b.y - at.y) ||
      Math.hypot(b.x, b.y) - Math.hypot(a.x, a.y),
  );
}

export function buildWorld(sections: Section[]): WorldModel {
  const taken = new Set<string>([
    key(hubRoom.pos),
    key(mapRoom.pos),
    ...Object.values(sectionPos).map(key),
  ]);
  const leafAt = new Map<string, Vec>();
  for (const section of sections) {
    section.leaves.slice(0, arms[section.id].length).forEach((leaf, i) => {
      const p = {
        x: sectionPos[section.id].x + arms[section.id][i].x,
        y: sectionPos[section.id].y + arms[section.id][i].y,
      };
      leafAt.set(`${section.id}/${leaf.slug}`, p);
      taken.add(key(p));
    });
  }
  for (const section of sections) {
    for (const leaf of section.leaves.slice(arms[section.id].length)) {
      const p = extraCells(sectionPos[section.id], taken)[0] ?? {
        x: sectionPos[section.id].x * 2,
        y: sectionPos[section.id].y * 2,
      };
      leafAt.set(`${section.id}/${leaf.slug}`, p);
      taken.add(key(p));
    }
  }

  const rooms: Room[] = [
    hubRoom,
    mapRoom,
    ...sections.flatMap((section): Room[] => [
      {
        kind: "section",
        path: `/${section.id}`,
        pos: sectionPos[section.id],
        label: section.label,
        short: section.label,
        section,
      },
      ...section.leaves.map((leaf): Room => ({
        kind: "leaf",
        path: `/${section.id}/${leaf.slug}`,
        pos: leafAt.get(`${section.id}/${leaf.slug}`)!,
        label: leaf.label,
        short: leaf.label,
        section,
        leaf,
      })),
    ]),
  ];

  const bounds = rooms.reduce(
    (b, room) => ({
      minX: Math.min(b.minX, room.pos.x),
      maxX: Math.max(b.maxX, room.pos.x),
      minY: Math.min(b.minY, room.pos.y),
      maxY: Math.max(b.maxY, room.pos.y),
    }),
    { minX: 0, maxX: 0, minY: 0, maxY: 0 },
  );

  return { rooms, hub: hubRoom, map: mapRoom, bounds };
}

/** The tree shipped in `lib/content.ts`; its paths are the ones prerendered by the static export. */
export const defaultWorld = buildWorld(defaultSections);

const staticPaths = new Set(defaultWorld.rooms.map((room) => room.path));

/** Rooms the admin added exist only in this browser, so there is no prerendered page to fetch. */
export function isPrerendered(path: string) {
  return staticPaths.has(normalizePath(path));
}

export function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function roomForPath(world: WorldModel, path: string): Room | undefined {
  const clean = normalizePath(path);
  return world.rooms.find((room) => room.path === clean);
}

export type Neighbor = {
  room: Room;
  role: "home" | "parent" | "child" | "sibling";
};

export function neighborsOf(world: WorldModel, room: Room): Neighbor[] {
  const { rooms, hub } = world;
  if (room.kind === "hub") {
    return rooms
      .filter((r) => r.kind === "section" || r.kind === "map")
      .map((r): Neighbor => ({ room: r, role: "child" }));
  }
  if (room.kind === "map") return [];
  if (room.kind === "section") {
    return [
      { room: hub, role: "home" },
      ...rooms
        .filter((r) => r.kind === "leaf" && r.section.id === room.section.id)
        .map((r): Neighbor => ({ room: r, role: "child" })),
    ];
  }
  const parent = rooms.find(
    (r) => r.kind === "section" && r.section.id === room.section.id,
  )!;
  return [
    { room: parent, role: "parent" },
    { room: hub, role: "home" },
    ...rooms
      .filter(
        (r) =>
          r.kind === "leaf" &&
          r.section.id === room.section.id &&
          r.path !== room.path,
      )
      .map((r): Neighbor => ({ room: r, role: "sibling" })),
  ];
}

export type Placed = Neighbor & { slot: number };

/**
 * Even fan around a page's centre: never fewer than the four arms of a cross, slot 0 on top,
 * clockwise (eight on the hub). `free` lists the slots no neighbour took, for a leaf's link circles.
 */
export type Arrangement = { slots: number; placed: Placed[]; free: number[] };

const weight: Record<Neighbor["role"], number> = {
  parent: 4,
  home: 2,
  child: 1,
  sibling: 1,
};

/** Clockwise angle from straight up, in screen coordinates (y grows downward). */
function bearing(from: Vec, to: Vec) {
  return Math.atan2(to.x - from.x, -(to.y - from.y));
}

function gap(a: number, b: number) {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

/**
 * Every page uses the same geometry: neighbours take the fan slots that point closest to where
 * they lead on the map, return dots (parent, then «خانه») first, so a click pans the camera the
 * way the dot points wherever the cross allows it.
 */
export function arrange(world: WorldModel, room: Room, extra = 0): Arrangement {
  const neighbors = neighborsOf(world, room);
  // The hub keeps its four sections on the cross; «نقشه» takes a diagonal of the doubled fan.
  const slots = room.kind === "hub" ? 8 : Math.max(4, neighbors.length + extra);
  const step = (Math.PI * 2) / slots;
  const cost = neighbors.map((n) =>
    Array.from(
      { length: slots },
      (_, k) => weight[n.role] * gap(bearing(room.pos, n.room.pos), k * step),
    ),
  );

  let best: number[] = [];
  let bestCost = Infinity;
  const pick: number[] = [];
  const used = new Set<number>();
  const walk = (i: number, total: number) => {
    if (total >= bestCost - 1e-9) return;
    if (i === neighbors.length) {
      best = [...pick];
      bestCost = total;
      return;
    }
    for (let k = 0; k < slots; k += 1) {
      if (used.has(k)) continue;
      used.add(k);
      pick.push(k);
      walk(i + 1, total + cost[i][k]);
      pick.pop();
      used.delete(k);
    }
  };
  walk(0, 0);

  const free = Array.from({ length: slots }, (_, k) => k).filter(
    (k) => !best.includes(k),
  );
  return {
    slots,
    placed: neighbors.map((n, i) => ({ ...n, slot: best[i] })),
    free,
  };
}
