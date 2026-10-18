import {
  sections,
  type Leaf,
  type Section,
  type SectionId,
} from "@/lib/content";

/**
 * The whole site is one map. Each page is a room on a grid; one unit is one viewport.
 * Sections sit two steps from the hub in their direction and their leaves one step around
 * them on the free arms of the same cross, so the map repeats the pattern every page draws.
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

const sectionPos: Record<SectionId, Vec> = {
  events: { x: 0, y: -2 },
  about: { x: 0, y: 2 },
  education: { x: -2, y: 0 },
  product: { x: 2, y: 0 },
};

/** One step from the section on an arm of its cross that does not lead back to the hub. */
const leafPos: Record<string, Vec> = {
  "events/hoosh": { x: 1, y: -2 },
  "events/next": { x: -1, y: -2 },
  "about/intro": { x: 1, y: 2 },
  "about/fields": { x: 0, y: 3 },
  "about/contact": { x: -1, y: 2 },
  "education/vr": { x: -2, y: -1 },
  "education/gamification": { x: -3, y: 0 },
  "education/partners": { x: -2, y: 1 },
  "product/neurotopia": { x: 2, y: -1 },
  "product/anavia": { x: 3, y: 0 },
  "product/media": { x: 2, y: 1 },
};

const shortLabels: Record<string, string> = {
  "events/hoosh": "نشست هوش",
};

export const hubRoom: Room = {
  kind: "hub",
  path: "/",
  pos: { x: 0, y: 0 },
  label: "خانه",
  short: "خانه",
};

/** On the hub's diagonal, so opening the map is a pan like any other step. */
export const mapRoom: Room = {
  kind: "map",
  path: "/map",
  pos: { x: -1, y: -1 },
  label: "نقشه",
  short: "نقشه",
};

export const rooms: Room[] = [
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
      pos: leafPos[`${section.id}/${leaf.slug}`] ?? { x: 0, y: 0 },
      label: leaf.label,
      short: shortLabels[`${section.id}/${leaf.slug}`] ?? leaf.label,
      section,
      leaf,
    })),
  ]),
];

export const mapBounds = rooms.reduce(
  (b, room) => ({
    minX: Math.min(b.minX, room.pos.x),
    maxX: Math.max(b.maxX, room.pos.x),
    minY: Math.min(b.minY, room.pos.y),
    maxY: Math.max(b.maxY, room.pos.y),
  }),
  { minX: 0, maxX: 0, minY: 0, maxY: 0 },
);

export function normalizePath(path: string): string {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function roomForPath(path: string): Room | undefined {
  const clean = normalizePath(path);
  return rooms.find((room) => room.path === clean);
}

export type Neighbor = {
  room: Room;
  role: "home" | "parent" | "child" | "sibling";
};

export function neighborsOf(room: Room): Neighbor[] {
  if (room.kind === "hub") {
    return rooms
      .filter((r) => r.kind === "section" || r.kind === "map")
      .map((r): Neighbor => ({ room: r, role: "child" }));
  }
  if (room.kind === "map") return [];
  if (room.kind === "section") {
    return [
      { room: hubRoom, role: "home" },
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
    { room: hubRoom, role: "home" },
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
export function arrange(room: Room, extra = 0): Arrangement {
  const neighbors = neighborsOf(room);
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
