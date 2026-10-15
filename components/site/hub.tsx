import Link from "next/link";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";
import { sections, type Side } from "@/lib/content";

/**
 * Open hub: the logo and four dots sit straight on the page, joined only by wires.
 * Three wire sets because the stage is 4:5 on phones, 3:2 from `md` and 13:5 on short
 * (landscape phone) screens; dot positions come from the matching `--hub-*` variables in globals.css.
 */
type WireSet = "mobile" | "desktop" | "short";

const wires: Record<WireSet, Record<Side, string>> = {
  mobile: {
    top: "M50 30 C50 22 47 18 50 11",
    bottom: "M50 72 C50 80 53 84 50 89",
    left: "M36 42 C29 42 24 46 15 43",
    right: "M64 42 C71 42 76 38 85 43",
  },
  desktop: {
    top: "M50 31 C50 22 48 18 50 12",
    bottom: "M50 70 C50 78 52 83 50 88",
    left: "M42 44 C36 44 31 48 22 45",
    right: "M58 44 C64 44 69 40 78 45",
  },
  short: {
    top: "M50 32 C50 25 48 19 50 11",
    bottom: "M50 68 C50 75 52 81 50 89",
    left: "M27 50 C21 50 16 46 9 50",
    right: "M73 50 C79 50 84 54 91 50",
  },
};

const wireSetClass: Record<WireSet, string> = {
  mobile: "md:hidden short:hidden",
  desktop: "max-md:hidden short:hidden",
  short: "hidden short:inline",
};

const anchor: Record<Side, CSSProperties> = {
  top: { left: "50%", top: "var(--hub-top)" },
  bottom: { left: "50%", top: "calc(100% - var(--hub-top))" },
  left: { left: "var(--hub-side)", top: "var(--hub-mid)" },
  right: { left: "calc(100% - var(--hub-side))", top: "var(--hub-mid)" },
};

function Wires() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {(["mobile", "desktop", "short"] as const).map((set) => (
        <g key={set} className={wireSetClass[set]}>
          {sections.map((section, index) => (
            <path
              key={section.id}
              d={wires[set][section.side]}
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="graph-wire stroke-brand"
              style={{ "--delay": `${150 + index * 120}ms` } as CSSProperties}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

function HubDot({
  side,
  href,
  label,
  ariaLabel,
  delay,
}: {
  side: Side;
  href: string;
  label: string;
  ariaLabel: string;
  delay: number;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-label={ariaLabel}
      data-graph-node=""
      className={cn(
        "graph-node group absolute z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
      )}
      style={{ ...anchor[side], "--delay": `${delay}ms` } as CSSProperties}
    >
      <span aria-hidden="true" className="graph-pulse absolute inset-0 rounded-full border-2 border-brand" />
      <span
        aria-hidden="true"
        className="size-5 rounded-full bg-brand shadow-overlay transition-transform duration-(--motion) ease-motion group-hover:scale-125 group-active:scale-95 md:size-6"
      />
      <span
        className={cn(
          "absolute w-max px-2 py-1 text-lg font-bold leading-normal text-foreground transition-colors duration-(--motion) group-hover:text-brand md:text-xl",
          side === "top" ? "bottom-full" : "top-full",
          (side === "top" || side === "bottom") &&
            "short:top-1/2 short:bottom-auto short:start-full short:-translate-y-1/2 short:ps-1",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

export function Hub() {
  return (
    <nav aria-label="نقشه‌ی هزارتو" data-graph-stage="" className="graph-stage hub-stage relative">
      <Wires />

      <div
        data-graph-node="center"
        className="graph-node absolute flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center md:w-56 short:w-72 short:flex-row short:gap-3"
        style={{ left: "50%", top: "50%" }}
      >
        <Logo priority className="w-24 shrink-0 md:w-36 short:w-16" />
        <div lang="en" dir="ltr" className="flex flex-col items-center gap-2 short:items-start short:gap-1 short:text-left">
          <p className="text-base font-bold leading-normal text-brand md:text-xl short:text-lg">HEZARTOO</p>
          <p className="text-balance text-xs leading-normal text-foreground/85 md:text-sm">
            Cognitive Technology &amp; Innovation Company
          </p>
        </div>
      </div>

      {sections.map((section, index) => (
        <HubDot
          key={section.id}
          side={section.side}
          href={`/${section.id}`}
          label={section.label}
          ariaLabel={`گره ${section.label}: ${section.summary}`}
          delay={250 + index * 120}
        />
      ))}
    </nav>
  );
}
