import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Point = { x: number; y: number };
/** Numbers are frame percentages; strings are raw CSS lengths (e.g. `var(--hub-x)`). */
export type Spot = { x: number | string; y: number | string };

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background";

/** Graph coordinates are percentages of the frame, on both axes. */
function place({ x, y }: Spot, delay = 0): CSSProperties {
  const unit = (v: number | string) => (typeof v === "number" ? `${v}%` : v);
  return { left: unit(x), top: unit(y), "--delay": `${delay}ms` } as CSSProperties;
}

export function GraphFrame({
  wires,
  children,
  className,
  label,
}: {
  wires?: ReactNode;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <nav aria-label={label} data-graph-stage="" className={cn("relative", className)}>
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
  at: Spot;
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
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={ariaLabel}
        data-graph-node=""
        className={className}
        style={place(at, delay)}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} scroll={false} aria-label={ariaLabel} data-graph-node="" className={className} style={place(at, delay)}>
      {content}
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
      data-graph-node="center"
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
