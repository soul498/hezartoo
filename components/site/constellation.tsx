"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ConstellationDot = {
  key: string;
  href: string;
  label: ReactNode;
  ariaLabel: string;
  /** Fan slot: 0 is straight up, counted clockwise. */
  slot: number;
  /** Children are filled dots; return dots (parent, «خانه») are hollow, same size. */
  tone: "child" | "return";
};

type Side = "above" | "below" | "left" | "right";
type Box = { l: number; t: number; r: number; b: number };
type Orient = "column" | "row";
type Fit = { w: number; h: number; scale: number; compact: boolean; orient: Orient };
type Layout = {
  w: number;
  h: number;
  dots: { x: number; y: number; side: Side }[];
  hero: { w: number; h: number; scale: number };
  compact: boolean;
  orient: Orient;
  wires: string[];
};

/** Half the 44px touch target; the visible dot is smaller and centred in it. */
const DOT = 22;
const GAP = 12;
const EDGE = 4;
/** Below this stage height, labels of the top and bottom dots move beside them. */
const SHORT_STAGE = 360;
const MIN_SCALE = 0.6;

function angle(slot: number, slots: number) {
  return (slot / slots) * Math.PI * 2;
}

function sideFor(theta: number, short: boolean): Side {
  const up = Math.cos(theta);
  if (Math.abs(up) > 0.38) {
    if (short) return Math.sin(theta) < -0.2 ? "left" : "right";
    return up > 0 ? "above" : "below";
  }
  return "below";
}

const labelStyle: Record<Side, CSSProperties> = {
  above: { bottom: "100%", left: "50%", transform: "translateX(-50%)" },
  below: { top: "100%", left: "50%", transform: "translateX(-50%)" },
  right: { left: "100%", top: "50%", transform: "translateY(-50%)" },
  left: { right: "100%", top: "50%", transform: "translateY(-50%)" },
};

function labelBox(x: number, y: number, side: Side, lw: number, lh: number): Box {
  if (side === "above") return { l: x - lw / 2, r: x + lw / 2, t: y - DOT - lh, b: y - DOT };
  if (side === "below") return { l: x - lw / 2, r: x + lw / 2, t: y + DOT, b: y + DOT + lh };
  if (side === "right") return { l: x + DOT, r: x + DOT + lw, t: y - lh / 2, b: y + lh / 2 };
  return { l: x - DOT - lw, r: x - DOT, t: y - lh / 2, b: y + lh / 2 };
}

function union(a: Box, b: Box): Box {
  return { l: Math.min(a.l, b.l), t: Math.min(a.t, b.t), r: Math.max(a.r, b.r), b: Math.max(a.b, b.b) };
}

/** Largest centred boxes that stay clear of every dot and label, one per obstacle edge. */
function candidateBoxes(w: number, h: number, obstacles: Box[]) {
  const cx = w / 2;
  const cy = h / 2;
  const rel = obstacles.map((o) => ({ l: o.l - cx - GAP, r: o.r - cx + GAP, t: o.t - cy - GAP, b: o.b - cy + GAP }));
  const widths = new Set<number>([cx - EDGE]);
  for (const o of rel) {
    if (o.l > 0) widths.add(o.l);
    if (o.r < 0) widths.add(-o.r);
  }
  return [...widths]
    .filter((hw) => hw > 40)
    .map((hw) => {
      let hh = cy - EDGE;
      for (const o of rel) {
        if (o.r <= -hw || o.l >= hw) continue;
        hh = Math.min(hh, o.t > 0 ? o.t : o.b < 0 ? -o.b : 0);
      }
      return { hw, hh };
    })
    .filter((c) => c.hh > 24);
}

/** Point where the ray from the centre towards (x, y) leaves a centred box of half-size hw × hh. */
function exitPoint(cx: number, cy: number, x: number, y: number, hw: number, hh: number) {
  const dx = x - cx;
  const dy = y - cy;
  const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return { x: cx + dx * t, y: cy + dy * t };
}

function wire(from: { x: number; y: number }, to: { x: number; y: number }, bow: number) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const end = { x: to.x - (dx / len) * 14, y: to.y - (dy / len) * 14 };
  const mx = (from.x + end.x) / 2 - (dy / len) * len * bow;
  const my = (from.y + end.y) / 2 + (dx / len) * len * bow;
  const r = (v: number) => Math.round(v * 10) / 10;
  return `M${r(from.x)} ${r(from.y)} Q${r(mx)} ${r(my)} ${r(end.x)} ${r(end.y)}`;
}

/**
 * The one geometry every page uses: a frameless centre and its dots on an even fan around it
 * (four slots make the cross). Dots sit as far out as their labels allow; the centre then
 * takes the largest box left between them and scales its type to fill it, so short copy and
 * few dots read large and nothing ever runs into a dot or a label.
 * `dots` must be stable between renders (memoise it); a new array re-runs the layout.
 */
export function Constellation({
  label,
  slots,
  dots,
  center,
  maxScale = 1.3,
  rowCenter = false,
  className,
}: {
  label: string;
  slots: number;
  dots: ConstellationDot[];
  center: ReactNode;
  maxScale?: number;
  /** The centre may also lay out side by side (`data-orient="row"`) when height is scarce. */
  rowCenter?: boolean;
  className?: string;
}) {
  const stageRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const hero = heroRef.current;
    if (!stage || !hero) return;
    let live = true;

    const labels = () => labelRefs.current.slice(0, dots.length);

    /** Places dots for one label size, then finds the centre box and type scale that fit. */
    const solve = (w: number, h: number, compact: boolean, orient: Orient) => {
      for (const el of labels()) el?.toggleAttribute("data-compact", compact);
      hero.dataset.orient = orient;
      const short = h < SHORT_STAGE;
      const thetas = dots.map((d) => angle(d.slot, slots));
      const sides = thetas.map((t) => sideFor(t, short));
      const sizes = labels().map((el) => ({ lw: el?.offsetWidth ?? 0, lh: el?.offsetHeight ?? 0 }));

      let mx = DOT + EDGE;
      let my = DOT + EDGE;
      thetas.forEach((t, i) => {
        const { lw, lh } = sizes[i];
        if (Math.abs(Math.sin(t)) > 0.38) {
          const reach = sides[i] === "above" || sides[i] === "below" ? Math.max(lw / 2, DOT) : DOT + lw;
          mx = Math.max(mx, reach + EDGE);
        }
        if (Math.abs(Math.cos(t)) > 0.38) {
          const reach = sides[i] === "above" || sides[i] === "below" ? DOT + lh : Math.max(lh / 2, DOT);
          my = Math.max(my, reach + EDGE);
        }
      });

      const points = thetas.map((t) => ({
        x: w / 2 + Math.sin(t) * (w / 2 - mx),
        y: h / 2 - Math.cos(t) * (h / 2 - my),
      }));
      const obstacles = points.map((p, i) =>
        union(
          { l: p.x - DOT, r: p.x + DOT, t: p.y - DOT, b: p.y + DOT },
          labelBox(p.x, p.y, sides[i], sizes[i].lw, sizes[i].lh),
        ),
      );

      let best: Fit | null = null;
      for (const { hw, hh } of candidateBoxes(w, h, obstacles)) {
        let lo = MIN_SCALE;
        let hi = maxScale;
        if (!fits(hw * 2, hh * 2, lo)) continue;
        for (let k = 0; k < 7; k += 1) {
          const mid = (lo + hi) / 2;
          if (fits(hw * 2, hh * 2, mid)) lo = mid;
          else hi = mid;
        }
        if (!best || lo > best.scale + 0.01 || (Math.abs(lo - best.scale) <= 0.01 && hw * 2 > best.w)) {
          best = { w: hw * 2, h: hh * 2, scale: lo, compact, orient };
        }
      }
      return { best, points, sides };
    };

    const fits = (width: number, height: number, scale: number) => {
      hero.style.fontSize = `${scale}rem`;
      hero.style.width = `${Math.min(width, 34 * 16 * scale)}px`;
      return hero.scrollHeight <= height && hero.scrollWidth <= width;
    };

    const measure = () => {
      if (!live) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;

      // Full-size labels first; compact labels or a side-by-side centre only when they let the centre read larger.
      const tries: [boolean, Orient][] = [[false, "column"], [true, "column"]];
      if (rowCenter) tries.push([false, "row"], [true, "row"]);
      let chosen: ReturnType<typeof solve> | null = null;
      for (const [compact, orient] of tries) {
        const result = solve(w, h, compact, orient);
        const score = result.best?.scale ?? 0;
        const bestScore = chosen?.best?.scale ?? 0;
        if (!chosen || score > bestScore + 0.05) chosen = result;
      }
      const result = chosen!;
      const best = result.best ?? {
        w: Math.max(w / 2, 120),
        h: h / 2,
        scale: MIN_SCALE,
        compact: true,
        orient: rowCenter ? "row" : "column",
      };
      const final = solve(w, h, best.compact, best.orient);
      const { points, sides } = final.best ? final : result;
      fits(best.w, best.h, best.scale);
      const heroW = hero.offsetWidth;
      const heroH = hero.offsetHeight;

      const wires = points.map((p, i) =>
        wire(exitPoint(w / 2, h / 2, p.x, p.y, heroW / 2 + 8, heroH / 2 + 8), p, i % 2 ? -0.08 : 0.08),
      );
      setLayout({
        w,
        h,
        dots: points.map((p, i) => ({ ...p, side: sides[i] })),
        hero: { w: Math.min(best.w, 34 * 16 * best.scale), h: best.h, scale: best.scale },
        compact: best.compact,
        orient: best.orient,
        wires,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [dots, slots, maxScale, rowCenter]);

  return (
    <nav ref={stageRef} aria-label={label} data-graph-stage="" className={cn("relative", className)}>
      {layout ? (
        <svg
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
          viewBox={`0 0 ${layout.w} ${layout.h}`}
          aria-hidden="true"
        >
          {layout.wires.map((d, i) => (
            <path
              key={dots[i].key}
              d={d}
              fill="none"
              strokeWidth={dots[i].tone === "child" ? 2 : 1.5}
              strokeLinecap="round"
              className={cn("graph-wire", dots[i].tone === "child" ? "stroke-brand" : "stroke-foreground/40")}
              style={{ "--delay": `${150 + i * 100}ms` } as CSSProperties}
            />
          ))}
        </svg>
      ) : null}

      <div
        ref={heroRef}
        data-graph-node="center"
        data-orient={layout?.orient ?? "column"}
        className="graph-node absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: "50%",
          top: "50%",
          ...(layout
            ? { width: layout.hero.w, fontSize: `${layout.hero.scale}rem` }
            : { width: "min(34rem, calc(100% - 16rem))" }),
        }}
      >
        {center}
      </div>

      {dots.map((dot, i) => {
        const theta = angle(dot.slot, slots);
        const placed = layout?.dots[i];
        const side = placed?.side ?? sideFor(theta, false);
        const style: CSSProperties = placed
          ? { left: placed.x, top: placed.y }
          : {
              left: `calc(50% + ${Math.sin(theta).toFixed(3)} * (50% - 4rem))`,
              top: `calc(50% - ${Math.cos(theta).toFixed(3)} * (50% - 4rem))`,
            };
        return (
          <Link
            key={dot.key}
            href={dot.href}
            scroll={false}
            aria-label={dot.ariaLabel}
            data-graph-node=""
            className="graph-node group absolute z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            style={{ ...style, "--delay": `${200 + i * 100}ms` } as CSSProperties}
          >
            {dot.tone === "child" ? (
              <span aria-hidden="true" className="graph-pulse absolute inset-0 rounded-full border-2 border-brand" />
            ) : null}
            <span
              aria-hidden="true"
              className={cn(
                "size-5 rounded-full transition-transform duration-(--motion) ease-motion group-hover:scale-125 group-active:scale-95 md:size-6",
                dot.tone === "child" ? "bg-brand shadow-overlay" : "border-2 border-brand bg-background",
              )}
            />
            <span
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              data-compact={layout?.compact ? "" : undefined}
              className="absolute w-max max-w-28 px-2 py-1 text-center text-sm font-bold leading-snug text-foreground transition-colors duration-(--motion) group-hover:text-brand data-compact:max-w-20 data-compact:px-1 data-compact:text-xs md:max-w-40 md:text-base"
              style={labelStyle[side]}
            >
              {dot.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
