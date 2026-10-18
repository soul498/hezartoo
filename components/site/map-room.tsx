"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { CircleInner, circleClass } from "@/components/site/constellation";
import { mapBounds, rooms, type Room, type Vec } from "@/lib/world";

const EDGE = 4;
const GAP = 8;

function labelOf(room: Room) {
  return room.kind === "hub" ? "خانه" : room.short;
}

function ariaOf(room: Room) {
  if (room.kind === "hub") return "خانه، گره مرکزی هزارتو";
  if (room.kind === "map") return "نقشه، همین صفحه";
  if (room.kind === "section")
    return `گره ${room.label}: ${room.section.summary}`;
  return `گره ${room.leaf.title}`;
}

/**
 * Every room as the same hollow circle, where it sits on the map. A click pans the camera from
 * here to that room. On a narrow (or short) screen, neighbours that would touch give way along
 * the roomier axis, so circles keep their size and never overlap.
 */
export function MapRoom({ heading: Heading }: { heading: "h1" | "p" }) {
  const stageRef = useRef<HTMLElement>(null);
  const circleRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [points, setPoints] = useState<Vec[] | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      const radii = circleRefs.current.map((el) => (el?.offsetWidth ?? 64) / 2);
      const m = Math.max(...radii) + EDGE;
      const cols = mapBounds.maxX - mapBounds.minX;
      const rows = mapBounds.maxY - mapBounds.minY;
      const stepX = (w - m * 2) / cols;
      const stepY = (h - m * 2) / rows;
      const home = rooms.map((room) => ({
        x: m + (room.pos.x - mapBounds.minX) * stepX,
        y: m + (room.pos.y - mapBounds.minY) * stepY,
      }));
      // Neighbours that touch are pushed apart, mostly along the roomier axis, while a spring
      // pulls each circle back to its true place; alternate columns (rows) start a little
      // apart so pairs on one line know which way to give.
      const ax = stepX < stepY ? 0.25 : 1;
      const ay = stepY < stepX ? 0.25 : 1;
      const pts = home.map((p, i) => {
        const odd =
          Math.abs(stepX < stepY ? rooms[i].pos.x : rooms[i].pos.y) % 2
            ? -1
            : 1;
        return stepX < stepY
          ? { x: p.x, y: p.y + odd }
          : { x: p.x + odd, y: p.y };
      });
      for (let round = 0; round < 400; round += 1) {
        for (let i = 0; i < pts.length; i += 1) {
          for (let j = i + 1; j < pts.length; j += 1) {
            const dx = pts[j].x - pts[i].x;
            const dy = pts[j].y - pts[i].y;
            const dist = Math.hypot(dx, dy) || 1;
            const need = radii[i] + radii[j] + GAP - dist;
            if (need <= 0) continue;
            const ux = (dx / dist) * ax;
            const uy = (dy / dist) * ay;
            const len = Math.hypot(ux, uy) || 1;
            const push = need / 2 + 0.5;
            pts[i].x -= (ux / len) * push;
            pts[i].y -= (uy / len) * push;
            pts[j].x += (ux / len) * push;
            pts[j].y += (uy / len) * push;
          }
        }
        pts.forEach((p, i) => {
          p.x += (home[i].x - p.x) * 0.02;
          p.y += (home[i].y - p.y) * 0.02;
          p.x = Math.min(w - radii[i] - EDGE, Math.max(radii[i] + EDGE, p.x));
          p.y = Math.min(h - radii[i] - EDGE, Math.max(radii[i] + EDGE, p.y));
        });
      }
      setPoints(pts);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full flex-col p-2 sm:p-4">
      <Heading className="sr-only">
        نقشه‌ی هزارتو: همه‌ی گره‌ها سر جای خودشان. هر کدام را بزنید، دوربین به
        آن‌جا می‌رود.
      </Heading>
      <nav
        ref={stageRef}
        aria-label="نقشه‌ی همه‌ی گره‌ها"
        className="relative mx-auto min-h-0 w-full max-w-6xl flex-1"
      >
        {rooms.map((room, i) => {
          const tone = room.kind === "leaf" ? "return" : "child";
          const placed = points?.[i];
          const style = (
            placed
              ? {
                  left: placed.x,
                  top: placed.y,
                  "--delay": `${100 + i * 40}ms`,
                }
              : { left: "50%", top: "50%", visibility: "hidden" }
          ) as CSSProperties;
          return (
            <Link
              key={room.path}
              href={room.path}
              scroll={false}
              aria-label={ariaOf(room)}
              aria-current={room.kind === "map" ? "page" : undefined}
              data-map-node=""
              className={circleClass(room.kind === "map" ? "return" : tone)}
              style={style}
              ref={(el) => {
                circleRefs.current[i] = el;
              }}
            >
              <CircleInner tone={room.kind === "map" ? "return" : tone}>
                <bdi>{labelOf(room)}</bdi>
              </CircleInner>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
