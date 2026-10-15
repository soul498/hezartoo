"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { LogoMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";
import {
  hubRoom,
  mapBounds,
  mapLinks,
  rooms,
  type Room,
  type Vec,
} from "@/lib/world";

/**
 * Space the overview keeps clear of: its title bar on top (shorter on short screens, matching
 * the `short` variant), a gutter below and at the sides. Header and footer hide while it is open.
 */
const SHORT = 512;
const SIDE = 16;
const top = (h: number) => (h <= SHORT ? 48 : 96);
const BOTTOM = 32;

export const mapCols = mapBounds.maxX - mapBounds.minX + 1;
export const mapRows = mapBounds.maxY - mapBounds.minY + 1;
export const mapCenter: Vec = {
  x: (mapBounds.minX + mapBounds.maxX) / 2,
  y: (mapBounds.minY + mapBounds.maxY) / 2,
};

/** Scale at which the whole map (one viewport per room) fits the free part of the screen. */
export function fitMap(w: number, h: number) {
  const s = Math.min(
    (w - SIDE * 2) / (mapCols * w),
    (h - top(h) - BOTTOM - SIDE) / (mapRows * h),
  );
  return { s, dy: (top(h) - BOTTOM) / 2 };
}

/** Nodes spread to the full free width even when height limits the camera scale (phones). */
function screenPos(room: Room, w: number, h: number): Vec {
  const { s, dy } = fitMap(w, h);
  const cellW = Math.min((w - SIDE * 2) / mapCols, w * s * 1.4);
  return {
    x: w / 2 + (room.pos.x - mapCenter.x) * cellW,
    y: h / 2 + dy + (room.pos.y - mapCenter.y) * h * s,
  };
}

type Side = "above" | "below" | "left" | "right";

const labelStyle: Record<Side, CSSProperties> = {
  above: { bottom: "100%", left: "50%", transform: "translateX(-50%)" },
  below: { top: "100%", left: "50%", transform: "translateX(-50%)" },
  right: { left: "100%", top: "50%", transform: "translateY(-50%)" },
  left: { right: "100%", top: "50%", transform: "translateY(-50%)" },
};

const DOT = 22;

function parentOf(room: Room): Room | null {
  if (room.kind === "hub") return null;
  if (room.kind === "section") return hubRoom;
  return (
    rooms.find(
      (r) => r.kind === "section" && r.section.id === room.section.id,
    ) ?? null
  );
}

/**
 * Same label rule as every page: a node above its parent is labelled above, every other node
 * below. A label that would hit a dot, another label or the screen edge tries the sides next.
 */
function preference(room: Room): Side[] {
  const parent = parentOf(room);
  if (!parent) return ["below", "above", "right", "left"];
  const dx = room.pos.x - parent.pos.x;
  const dy = room.pos.y - parent.pos.y;
  if (dy < 0 && Math.abs(dy) >= Math.abs(dx))
    return ["above", "right", "left", "below"];
  if (dx < 0 && Math.abs(dx) > Math.abs(dy))
    return ["below", "above", "left", "right"];
  if (dx > 0 && Math.abs(dx) > Math.abs(dy))
    return ["below", "above", "right", "left"];
  return ["below", "right", "left", "above"];
}

type Rect = { l: number; t: number; r: number; b: number };

function labelRect(p: Vec, side: Side, lw: number, lh: number): Rect {
  if (side === "above")
    return {
      l: p.x - lw / 2,
      r: p.x + lw / 2,
      t: p.y - DOT - lh,
      b: p.y - DOT,
    };
  if (side === "below")
    return {
      l: p.x - lw / 2,
      r: p.x + lw / 2,
      t: p.y + DOT,
      b: p.y + DOT + lh,
    };
  if (side === "right")
    return {
      l: p.x + DOT,
      r: p.x + DOT + lw,
      t: p.y - lh / 2,
      b: p.y + lh / 2,
    };
  return { l: p.x - DOT - lw, r: p.x - DOT, t: p.y - lh / 2, b: p.y + lh / 2 };
}

function hits(a: Rect, b: Rect) {
  return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
}

export function MapOverview({
  open,
  w,
  h,
  currentPath,
  onClose,
}: {
  open: boolean;
  w: number;
  h: number;
  currentPath: string;
  onClose: (restoreFocus: boolean) => void;
}) {
  const at = new Map(rooms.map((room) => [room.path, screenPos(room, w, h)]));
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [sides, setSides] = useState<Side[] | null>(null);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => placeLabels());
    return () => cancelAnimationFrame(frame);

    function placeLabels() {
      const points = rooms.map((room) => screenPos(room, w, h));
      const dots = points.map((p) => ({
        l: p.x - DOT,
        r: p.x + DOT,
        t: p.y - DOT,
        b: p.y + DOT,
      }));
      const bounds = { l: 4, r: w - 4, t: top(h) - 8, b: h - 4 };
      const taken: Rect[] = [];
      const order = rooms
        .map((_, i) => i)
        .sort((a, b) => rank(rooms[a]) - rank(rooms[b]));
      const chosen: Side[] = rooms.map(() => "below");
      for (const i of order) {
        const el = labelRefs.current[i];
        const lw = el?.offsetWidth ?? 0;
        const lh = el?.offsetHeight ?? 0;
        const prefs = preference(rooms[i]);
        const free = prefs.find((side) => {
          const r = labelRect(points[i], side, lw, lh);
          const inside =
            r.l >= bounds.l &&
            r.r <= bounds.r &&
            r.t >= bounds.t &&
            r.b <= bounds.b;
          return (
            inside &&
            !dots.some((d, j) => j !== i && hits(r, d)) &&
            !taken.some((t) => hits(r, t))
          );
        });
        chosen[i] = free ?? prefs[0];
        taken.push(labelRect(points[i], chosen[i], lw, lh));
      }
      setSides(chosen);
    }
  }, [w, h]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="نقشه‌ی کامل هزارتو"
      data-open={open ? "" : undefined}
      className="map-overview fixed inset-0 z-30"
    >
      <div className="absolute inset-x-0 top-4 mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 short:top-0 short:h-12">
        <div className="flex min-w-0 flex-col">
          <p className="wordmark text-xl short:text-lg">نقشه‌ی کامل هزارتو</p>
          <p className="truncate text-sm text-foreground/80 short:sr-only">
            روی هر گره بزنید تا دوربین به آن‌جا برود.
          </p>
        </div>
        <button
          type="button"
          data-map-close=""
          onClick={() => onClose(true)}
          aria-label="بستن نقشه و بازگشت"
          className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-brand text-brand transition-colors duration-(--motion) hover:bg-brand hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X aria-hidden="true" strokeWidth={2} className="size-5" />
        </button>
      </div>

      <svg
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      >
        {mapLinks.map(([a, b]) => {
          const p = at.get(a.path)!;
          const q = at.get(b.path)!;
          const mx = (p.x + q.x) / 2;
          const my = (p.y + q.y) / 2;
          const bow = b.kind === "leaf" ? 0.12 : 0;
          const cx = mx - (q.y - p.y) * bow;
          const cy = my + (q.x - p.x) * bow;
          return (
            <path
              key={b.path}
              d={`M${p.x} ${p.y} Q${cx} ${cy} ${q.x} ${q.y}`}
              fill="none"
              strokeWidth={b.kind === "leaf" ? 1.5 : 2}
              strokeLinecap="round"
              className={b.kind === "leaf" ? "stroke-brand/50" : "stroke-brand"}
            />
          );
        })}
      </svg>

      {rooms.map((room, i) => {
        const p = at.get(room.path)!;
        const here = room.path === currentPath;
        const side = sides?.[i] ?? "below";
        return (
          <Link
            key={room.path}
            href={room.path}
            scroll={false}
            data-graph-node={room.kind === "hub" ? "center" : ""}
            aria-label={`${here ? "این‌جا هستید: " : "رفتن به "}${room.kind === "leaf" ? room.leaf.title : room.label}`}
            aria-current={here ? "page" : undefined}
            onClick={(event) => {
              if (here) event.preventDefault();
              onClose(false);
            }}
            className="group absolute z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            style={{ left: p.x, top: p.y } as CSSProperties}
          >
            {here ? (
              <span
                aria-hidden="true"
                className="graph-pulse absolute inset-0 rounded-full border-2 border-brand"
              />
            ) : null}
            {room.kind === "hub" ? (
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center overflow-hidden rounded-full bg-brand"
              >
                <LogoMark className="w-8" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className="size-5 rounded-full bg-brand shadow-overlay transition-transform duration-(--motion) ease-motion group-hover:scale-125 md:size-6"
              />
            )}
            <span
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className={cn(
                "absolute w-max max-w-24 rounded-control bg-background/80 px-1 text-center text-xs font-bold leading-tight text-foreground group-hover:text-brand sm:text-sm md:max-w-32",
                !sides && "invisible",
              )}
              style={labelStyle[side]}
            >
              <bdi>{room.kind === "hub" ? "خانه" : room.short}</bdi>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function rank(room: Room) {
  return room.kind === "hub" ? 0 : room.kind === "section" ? 1 : 2;
}
