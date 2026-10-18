"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { NodeLink } from "@/components/site/world-model";
import { cn } from "@/lib/utils";

export type ConstellationDot = {
  key: string;
  href: string;
  /** Title drawn inside the circle. */
  label: ReactNode;
  ariaLabel: string;
  /** Fan slot: 0 is straight up, counted clockwise. */
  slot: number;
  /** Children are drawn in brand; return circles (parent, «خانه») are quieter, same shape. */
  tone: "child" | "return";
};

type Orient = "column" | "row";
type Fit = { w: number; h: number; scale: number; orient: Orient };
type Layout = {
  dots: { x: number; y: number }[];
  hero: { w: number; scale: number };
  orient: Orient;
};

/** Clear space between the centre and any circle, and between circles and the stage edge. */
const GAP = 16;
const EDGE = 4;
const MIN_SCALE = 0.6;
/** Leaf centres hold the whole page; below this scale the stage grows taller and scrolls instead. */
const GROW_SCALE = 0.85;

function angle(slot: number, slots: number) {
  return (slot / slots) * Math.PI * 2;
}

type Box = { l: number; t: number; r: number; b: number };

/** Largest centred boxes that stay clear of every circle, one per obstacle edge. */
function candidateBoxes(w: number, h: number, obstacles: Box[]) {
  const cx = w / 2;
  const cy = h / 2;
  const rel = obstacles.map((o) => ({
    l: o.l - cx - GAP,
    r: o.r - cx + GAP,
    t: o.t - cy - GAP,
    b: o.b - cy + GAP,
  }));
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

/**
 * The one geometry every page uses, after the whiteboard sketch: a frameless centre and titled
 * circles on an even fan around it (four slots make the cross), with clear space between them
 * and no stroke joining them. The circles' wires run outward from their rims to the screen edge
 * (drawn by `WireField`). Circles sit as far out as the stage allows; the centre takes the
 * largest box left between them and scales its type to fill it.
 * `dots` must be stable between renders (memoise it); a new array re-runs the layout.
 */
export function Constellation({
  label,
  slots,
  dots,
  center,
  maxScale = 1.3,
  rowCenter = false,
  grow = false,
  className,
}: {
  label: string;
  slots: number;
  dots: ConstellationDot[];
  center: ReactNode;
  maxScale?: number;
  /** The centre may also lay out side by side (`data-orient="row"`) when height is scarce. */
  rowCenter?: boolean;
  /** Let the stage grow past its box (the room scrolls) rather than shrink the centre below reading size. */
  grow?: boolean;
  className?: string;
}) {
  const stageRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLElement | null)[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const hero = heroRef.current;
    if (!stage || !hero) return;
    let live = true;
    let grownFor = 0;

    const fits = (width: number, height: number, scale: number) => {
      hero.style.fontSize = `${scale}rem`;
      hero.style.width = `${Math.min(width, 34 * 16 * scale)}px`;
      return hero.scrollHeight <= height && hero.scrollWidth <= width;
    };

    const solve = (w: number, h: number, orient: Orient) => {
      hero.dataset.orient = orient;
      const radii = dots.map(
        (_, i) => (circleRefs.current[i]?.offsetWidth ?? 44) / 2,
      );
      const thetas = dots.map((d) => angle(d.slot, slots));
      const points = thetas.map((t, i) => ({
        x: w / 2 + Math.sin(t) * (w / 2 - radii[i] - EDGE),
        y: h / 2 - Math.cos(t) * (h / 2 - radii[i] - EDGE),
      }));
      const obstacles = points.map((p, i) => ({
        l: p.x - radii[i],
        r: p.x + radii[i],
        t: p.y - radii[i],
        b: p.y + radii[i],
      }));

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
        if (
          !best ||
          lo > best.scale + 0.01 ||
          (Math.abs(lo - best.scale) <= 0.01 && hw * 2 > best.w)
        ) {
          best = { w: hw * 2, h: hh * 2, scale: lo, orient };
        }
      }
      return { best, points, obstacles };
    };

    const measure = () => {
      if (!live) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      if (grow && grownFor && Math.abs(grownFor - w) > 24) {
        grownFor = 0;
        stage.style.minHeight = "";
        return;
      }

      const orients: Orient[] = rowCenter ? ["column", "row"] : ["column"];
      let chosen: ReturnType<typeof solve> | null = null;
      for (const orient of orients) {
        const result = solve(w, h, orient);
        if (
          !chosen ||
          (result.best?.scale ?? 0) > (chosen.best?.scale ?? 0) + 0.05
        )
          chosen = result;
      }
      const result = chosen!;

      if (grow && (result.best?.scale ?? 0) < GROW_SCALE) {
        // Taller stage: the side circles stay level with the centre, the top and bottom ones move out.
        grownFor = w;
        stage.style.minHeight = `${Math.ceil(h * 1.25 + 40)}px`;
        return;
      }

      const widest = candidateBoxes(w, h, result.obstacles).sort(
        (a, b) => b.hw * b.hh - a.hw * a.hh,
      )[0];
      const best = result.best ?? {
        w: widest ? widest.hw * 2 : w / 2,
        h: widest ? widest.hh * 2 : h / 2,
        scale: MIN_SCALE,
        orient: orients[0],
      };
      const { points } = solve(w, h, best.orient);
      fits(best.w, best.h, best.scale);
      setLayout({
        dots: points,
        hero: { w: Math.min(best.w, 34 * 16 * best.scale), scale: best.scale },
        orient: best.orient,
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
  }, [dots, slots, maxScale, rowCenter, grow]);

  return (
    <nav
      ref={stageRef}
      aria-label={label}
      data-graph-stage=""
      className={cn("relative", className)}
    >
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
        const style: CSSProperties = placed
          ? { left: placed.x, top: placed.y }
          : {
              left: `calc(50% + ${Math.sin(theta).toFixed(3)} * (50% - 3.5rem))`,
              top: `calc(50% - ${Math.cos(theta).toFixed(3)} * (50% - 3.5rem))`,
            };
        return (
          <NodeLink
            key={dot.key}
            href={dot.href}
            aria-label={dot.ariaLabel}
            data-graph-node=""
            className={circleClass(dot.tone)}
            style={
              { ...style, "--delay": `${200 + i * 100}ms` } as CSSProperties
            }
            ref={(el) => {
              circleRefs.current[i] = el;
            }}
          >
            <CircleInner tone={dot.tone}>{dot.label}</CircleInner>
          </NodeLink>
        );
      })}
    </nav>
  );
}

/** The one circle every page and the map draw: hollow, title inside, centred on its point. */
export function circleClass(tone: ConstellationDot["tone"]) {
  return cn(
    "graph-node group absolute z-10 grid aspect-square min-w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 p-2 text-center transition-colors duration-(--motion) ease-motion sm:min-w-20 sm:p-3 md:min-w-24 short:min-w-16 short:p-2",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
    tone === "child"
      ? "border-brand text-foreground hover:text-brand"
      : "border-brand/50 text-foreground/85 hover:border-brand hover:text-brand",
  );
}

export function CircleInner({
  tone,
  children,
}: {
  tone: ConstellationDot["tone"];
  children: ReactNode;
}) {
  return (
    <>
      {tone === "child" ? (
        <span
          aria-hidden="true"
          className="graph-pulse absolute -inset-0.5 rounded-full border-2 border-brand"
        />
      ) : null}
      <span className="relative w-max max-w-16 text-xs font-bold leading-snug sm:max-w-24 sm:text-base md:max-w-28 short:max-w-20 short:text-xs">
        {children}
      </span>
    </>
  );
}
