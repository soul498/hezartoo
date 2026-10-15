import { AtSign } from "lucide-react";
import { DotLink, GraphFrame, RingLink, Terminal, Wire, type Point } from "@/components/site/graph";
import { Mark } from "@/components/site/logo";
import { instagramUrl, sections, type Side } from "@/lib/content";

const anchor: Record<Side, Point> = {
  top: { x: 50, y: 27 },
  bottom: { x: 50, y: 73 },
  left: { x: 27, y: 50 },
  right: { x: 73, y: 50 },
};

/** Where each section's wire leaves the frame. */
const exit: Record<Side, { d: string; end: Point }> = {
  top: { d: "M50 27 C50 18 42 17 44 9 S47 3 46 0", end: { x: 46, y: 0 } },
  bottom: { d: "M50 73 C50 82 57 83 54 91 S52 97 53 100", end: { x: 53, y: 100 } },
  left: { d: "M27 50 C20 50 17 44 10 46 S3 52 0 51", end: { x: 0, y: 51 } },
  right: { d: "M73 50 C80 50 82 40 90 41 S97 37 100 36", end: { x: 100, y: 36 } },
};

const corner: Point = { x: 88, y: 86 };

export function Hub() {
  return (
    <GraphFrame
      label="نقشه‌ی هزارتو"
      className="aspect-square md:aspect-3/2"
      wires={
        <>
          {sections.map((section, index) => (
            <Wire key={section.id} d={exit[section.side].d} delay={200 + index * 120} />
          ))}
          <Wire d="M73 73 C78 80 82 78 88 86" tone="quiet" delay={800} />
        </>
      }
    >
      <div
        aria-hidden="true"
        className="graph-node absolute grid place-items-center rounded-surface border-2 border-brand/70 bg-background"
        style={{ left: "27%", top: "27%", width: "46%", height: "46%" }}
      >
        <div className="flex w-1/2 flex-col items-center gap-2 md:w-2/5">
          <Mark className="h-auto w-full overflow-hidden rounded-control" />
          <p className="wordmark hidden text-2xl text-foreground md:block">هزارتو</p>
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
      {sections.map((section, index) => (
        <Terminal key={section.id} at={exit[section.side].end} delay={500 + index * 120} />
      ))}

      <DotLink
        href={instagramUrl}
        external
        at={corner}
        label="اینستاگرام"
        ariaLabel="اینستاگرام هزارتو، در زبانه‌ی تازه"
        icon={AtSign}
        tone="quiet"
        delay={900}
      />
    </GraphFrame>
  );
}
