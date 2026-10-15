import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Point = { x: number; y: number };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background";

/** Graph coordinates are percentages of the frame, on both axes. */
function place({ x, y }: Point, delay = 0): CSSProperties {
  return { left: `${x}%`, top: `${y}%`, "--delay": `${delay}ms` } as CSSProperties;
}

export function GraphFrame({
  wires,
  children,
  className,
  label,
}: {
  wires: ReactNode;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn("graph-field relative w-full rounded-surface border-line border-border", className)}
    >
      <svg
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {wires}
      </svg>
      {children}
    </nav>
  );
}

export function Wire({
  d,
  tone = "brand",
  delay = 0,
}: {
  d: string;
  tone?: "brand" | "quiet";
  delay?: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={tone === "brand" ? 2 : 1.5}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      className={cn("graph-wire", tone === "brand" ? "stroke-brand" : "stroke-foreground/30")}
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    />
  );
}

/** Small dot where a wire leaves the frame: the path keeps going, off the map. */
export function Terminal({ at, delay = 0 }: { at: Point; delay?: number }) {
  return (
    <span
      aria-hidden="true"
      className="graph-node absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/40"
      style={place(at, delay)}
    />
  );
}

/** A dot with its label underneath. The whole column is the link. */
export function DotLink({
  href,
  at,
  label,
  ariaLabel,
  icon: Icon,
  tone = "brand",
  pulse = false,
  delay = 0,
  external = false,
}: {
  href: string;
  at: Point;
  label: ReactNode;
  ariaLabel: string;
  icon: LucideIcon;
  tone?: "brand" | "quiet";
  pulse?: boolean;
  delay?: number;
  external?: boolean;
}) {
  const className = cn(
    "graph-node group absolute z-10 flex w-max max-w-28 -translate-x-1/2 -translate-y-6 flex-col items-center gap-1 rounded-control text-center md:max-w-40 md:-translate-y-7",
    focusRing,
  );
  const content = (
    <>
      <span
        className={cn(
          "relative grid size-12 place-items-center rounded-full ring-4 ring-background transition-transform duration-(--motion) ease-motion group-hover:scale-110 group-active:scale-95 md:size-14",
          tone === "brand"
            ? "bg-brand text-brand-foreground"
            : "border-2 border-brand bg-card text-brand",
        )}
      >
        {pulse ? <span aria-hidden="true" className="graph-pulse absolute inset-0 rounded-full bg-brand" /> : null}
        <Icon aria-hidden="true" strokeWidth={2} className="relative size-5 md:size-6" />
      </span>
      <span className="rounded-control bg-background/80 px-2 text-sm font-semibold leading-normal text-foreground group-hover:text-brand">
        {label}
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={ariaLabel} className={className} style={place(at, delay)}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} aria-label={ariaLabel} className={className} style={place(at, delay)}>
      {content}
    </Link>
  );
}

/** The hub's four circles: label written inside the circle, as in the sketch. */
export function RingLink({
  href,
  at,
  label,
  ariaLabel,
  delay = 0,
}: {
  href: string;
  at: Point;
  label: string;
  ariaLabel: string;
  delay?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "graph-node group absolute z-10 grid size-18 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full md:size-28",
        focusRing,
      )}
      style={place(at, delay)}
    >
      <span aria-hidden="true" className="graph-pulse absolute inset-0 rounded-full border-2 border-brand" />
      <span className="relative grid size-full place-items-center rounded-full border-2 border-brand bg-card px-2 text-center text-sm font-bold leading-normal text-foreground transition-all duration-(--motion) ease-motion group-hover:scale-105 group-hover:bg-brand group-hover:text-brand-foreground group-active:scale-95 md:text-lg">
        {label}
      </span>
    </Link>
  );
}

/** The node the visitor is standing on. Not a link. */
export function CurrentNode({
  at,
  icon: Icon,
  title,
  compact = false,
}: {
  at: Point;
  icon: LucideIcon;
  title: string;
  compact?: boolean;
}) {
  return (
    <div
      aria-current="page"
      className={cn(
        "graph-node absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-brand-foreground",
        compact ? "size-16 ring-4 ring-background md:size-20" : "size-24 ring-8 ring-background md:size-36",
      )}
      style={place(at)}
    >
      <span aria-hidden="true" className="graph-pulse absolute inset-0 rounded-full bg-brand" />
      <span className="relative flex flex-col items-center gap-1 px-2 text-center">
        <Icon aria-hidden="true" strokeWidth={2} className="size-6 md:size-8" />
        <span className={cn("text-base font-bold leading-tight md:text-xl", compact && "sr-only")}>{title}</span>
      </span>
    </div>
  );
}

/** Smooth bend between two points, bowed sideways by `bow` (in frame percent). */
export function bend(a: Point, b: Point, bow = 6): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return `M${r(a.x)} ${r(a.y)} Q${r(cx)} ${r(cy)} ${r(b.x)} ${r(b.y)}`;
}

/** Hand-drawn style wire: an S-curve from a to b. */
export function wiggle(a: Point, b: Point, amp = 4): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * amp;
  const py = (dx / len) * amp;
  const c1 = { x: a.x + dx / 3 + px, y: a.y + dy / 3 + py };
  const c2 = { x: a.x + (dx * 2) / 3 - px, y: a.y + (dy * 2) / 3 - py };
  return `M${r(a.x)} ${r(a.y)} C${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${r(b.x)} ${r(b.y)}`;
}

function r(value: number) {
  return Math.round(value * 100) / 100;
}
