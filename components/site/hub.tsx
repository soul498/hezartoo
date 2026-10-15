import { AtSign } from "lucide-react";
import { DotLink, GraphFrame, RingLink, type Spot } from "@/components/site/graph";
import { Mark } from "@/components/site/logo";
import { instagramUrl, sections, type Side } from "@/lib/content";

/** The box inset comes from `.hub-stage` in globals.css so it can widen on phones. */
const anchor: Record<Side, Spot> = {
  top: { x: "50%", y: "var(--hub-y)" },
  bottom: { x: "50%", y: "calc(100% - var(--hub-y))" },
  left: { x: "var(--hub-x)", y: "50%" },
  right: { x: "calc(100% - var(--hub-x))", y: "50%" },
};

export function Hub() {
  return (
    <GraphFrame label="نقشه‌ی هزارتو" className="graph-stage hub-stage">
      <div
        data-graph-node="center"
        className="graph-node absolute grid place-items-center rounded-surface border-2 border-brand/70 bg-background/85 p-10 shadow-overlay md:p-16"
        style={{
          left: "var(--hub-x)",
          top: "var(--hub-y)",
          width: "calc(100% - 2 * var(--hub-x))",
          height: "calc(100% - 2 * var(--hub-y))",
        }}
      >
        <div className="flex flex-col items-center gap-1 text-center md:gap-2">
          <Mark className="h-auto w-14 overflow-hidden rounded-control md:w-32" />
          <p className="wordmark text-xl text-foreground md:text-3xl">هزارتو</p>
          <p className="text-xs font-medium leading-normal text-foreground/85 md:text-base">
            شرکت فناوری و نوآوری شناخت
          </p>
          <span aria-hidden="true" className="my-1 h-px w-12 bg-brand/60" />
          <p lang="en" dir="ltr" className="text-sm font-bold leading-normal text-brand md:text-lg">
            HEZARTOO
          </p>
          <p lang="en" dir="ltr" className="text-xs leading-normal text-foreground/75 md:text-sm">
            Cognitive Technology &amp; Innovation Company
          </p>
        </div>
      </div>

      {sections.map((section, index) => (
        <RingLink
          key={section.id}
          href={`/${section.id}`}
          at={anchor[section.side]}
          label={section.label}
          ariaLabel={`گره ${section.label}: ${section.summary}`}
          delay={200 + index * 120}
        />
      ))}

      <DotLink
        href={instagramUrl}
        external
        at={{ x: 90, y: 90 }}
        label="اینستاگرام"
        ariaLabel="اینستاگرام هزارتو، در زبانه‌ی تازه"
        icon={AtSign}
        tone="quiet"
        delay={900}
      />
    </GraphFrame>
  );
}
