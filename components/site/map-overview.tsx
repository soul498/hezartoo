"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { CSSProperties } from "react";
import { leafIcon, sectionIcons } from "@/components/site/icons";
import { besideLabelClass } from "@/components/site/graph";
import { LogoMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";
import { mapBounds, mapLinks, rooms, type Room, type Vec } from "@/lib/world";

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
  const s = Math.min((w - SIDE * 2) / (mapCols * w), (h - top(h) - BOTTOM - SIDE) / (mapRows * h));
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
          <p className="truncate text-sm text-foreground/80 short:sr-only">روی هر گره بزنید تا دوربین به آن‌جا برود.</p>
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

      <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden="true">
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

      {rooms.map((room) => {
        const p = at.get(room.path)!;
        const here = room.path === currentPath;
        const Icon =
          room.kind === "leaf"
            ? leafIcon(room.section.id, room.leaf.slug)
            : room.kind === "section"
              ? sectionIcons[room.section.id]
              : null;
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
              <span aria-hidden="true" className="graph-pulse absolute -inset-1 rounded-full border-2 border-brand" />
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "grid place-items-center rounded-full transition-transform duration-(--motion) ease-motion group-hover:scale-110",
                room.kind === "hub" && "size-11 overflow-hidden bg-brand",
                room.kind === "section" && "size-10 bg-brand text-brand-foreground",
                room.kind === "leaf" && "size-8 border-2 border-brand bg-background text-brand",
              )}
            >
              {room.kind === "hub" ? (
                <LogoMark className="w-8" />
              ) : Icon ? (
                <Icon strokeWidth={2} className={room.kind === "section" ? "size-5" : "size-4"} />
              ) : null}
            </span>
            <span
              className={cn(
                "absolute top-full w-max max-w-24 text-center leading-tight text-foreground group-hover:text-brand md:max-w-32",
                room.kind === "leaf" ? "text-xs font-medium md:text-sm" : "text-sm font-bold",
                // Columns right of the hub label leftwards and the rest rightwards, so no label reaches the next column's.
                besideLabelClass({ side: room.pos.x > 0 ? "left" : "right", always: false }),
              )}
            >
              <bdi>{room.kind === "hub" ? "خانه" : room.short}</bdi>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
