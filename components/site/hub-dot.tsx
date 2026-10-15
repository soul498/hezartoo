import Link from "next/link";
import type { CSSProperties } from "react";
import type { Point } from "@/components/site/graph";
import { Mark } from "@/components/site/logo";

export function HubDot({ at }: { at: Point }) {
  return (
    <Link
      href="/"
      aria-label="بازگشت به گره مرکزی هزارتو"
      data-graph-node=""
      className="graph-node group absolute z-10 flex w-max -translate-x-1/2 -translate-y-6 flex-col items-center gap-1 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background md:-translate-y-7"
      style={{ left: `${at.x}%`, top: `${at.y}%` } as CSSProperties}
    >
      <span className="grid size-12 place-items-center overflow-hidden rounded-full border-2 border-brand bg-brand ring-4 ring-background transition-transform duration-(--motion) ease-motion group-hover:scale-110 group-active:scale-95 md:size-14">
        <Mark className="h-auto w-full" />
      </span>
      <span className="rounded-control bg-background/80 px-2 text-sm font-semibold leading-normal text-muted-foreground group-hover:text-brand">
        هزارتو
      </span>
    </Link>
  );
}
