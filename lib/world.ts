import { sections, type Leaf, type Section, type SectionId } from "@/lib/content";

/**
 * The whole site is one map. Each page is a room on a grid; one unit is one viewport.
 * Sections sit one step from the hub in their direction, leaves one step further out.
 */
export type Vec = { x: number; y: number };

export type Room =
  | { kind: "hub"; path: "/"; pos: Vec; label: string; short: string }
  | { kind: "section"; path: string; pos: Vec; label: string; short: string; section: Section }
  | { kind: "leaf"; path: string; pos: Vec; label: string; short: string; section: Section; leaf: Leaf };

const sectionPos: Record<SectionId, Vec> = {
  events: { x: 0, y: -1 },
  about: { x: 0, y: 1 },
  education: { x: -1, y: 0 },
  product: { x: 1, y: 0 },
};

/** Physical grid cells, chosen so no two rooms overlap. */
const leafPos: Record<string, Vec> = {
  "events/hoosh": { x: 1, y: -2 },
  "events/next": { x: -1, y: -2 },
  "about/intro": { x: 1, y: 2 },
  "about/fields": { x: 0, y: 2 },
  "about/contact": { x: -1, y: 2 },
  "education/vr": { x: -2, y: -1 },
  "education/gamification": { x: -2, y: 0 },
  "education/partners": { x: -2, y: 1 },
  "product/neurotopia": { x: 2, y: -1 },
  "product/anavia": { x: 2, y: 0 },
  "product/media": { x: 2, y: 1 },
};

const shortLabels: Record<string, string> = {
  "events/hoosh": "نشست هوش",
};

export const hubRoom: Room = { kind: "hub", path: "/", pos: { x: 0, y: 0 }, label: "خانه", short: "خانه" };

export const rooms: Room[] = [
  hubRoom,
  ...sections.flatMap((section): Room[] => [
    {
      kind: "section",
      path: `/${section.id}`,
      pos: sectionPos[section.id],
      label: section.label,
      short: section.label,
      section,
    },
    ...section.leaves.map(
      (leaf): Room => ({
        kind: "leaf",
        path: `/${section.id}/${leaf.slug}`,
        pos: leafPos[`${section.id}/${leaf.slug}`] ?? { x: 0, y: 0 },
        label: leaf.label,
        short: shortLabels[`${section.id}/${leaf.slug}`] ?? leaf.label,
        section,
        leaf,
      }),
    ),
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

export type Neighbor = { room: Room; role: "home" | "parent" | "child" | "sibling" };

export function neighborsOf(room: Room): Neighbor[] {
  if (room.kind === "hub") return [];
  if (room.kind === "section") {
    return [
      { room: hubRoom, role: "home" },
      ...rooms
        .filter((r) => r.kind === "leaf" && r.section.id === room.section.id)
        .map((r): Neighbor => ({ room: r, role: "child" })),
    ];
  }
  const parent = rooms.find((r) => r.kind === "section" && r.section.id === room.section.id)!;
  return [
    { room: parent, role: "parent" },
    { room: hubRoom, role: "home" },
    ...rooms
      .filter((r) => r.kind === "leaf" && r.section.id === room.section.id && r.path !== room.path)
      .map((r): Neighbor => ({ room: r, role: "sibling" })),
  ];
}

/** Links of the map: hub to sections, sections to their leaves. */
export const mapLinks: [Room, Room][] = rooms.flatMap((room): [Room, Room][] => {
  if (room.kind === "section") return [[hubRoom, room]];
  if (room.kind === "leaf") {
    const parent = rooms.find((r) => r.kind === "section" && r.section.id === room.section.id)!;
    return [[parent, room]];
  }
  return [];
});
