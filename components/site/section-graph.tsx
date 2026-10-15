import { DotLink, GraphFrame, CurrentNode, Terminal, Wire, bend, wiggle, type Point } from "@/components/site/graph";
import { HubDot } from "@/components/site/hub-dot";
import { leafIcon, sectionIcons } from "@/components/site/icons";
import type { Section, Side } from "@/lib/content";

const direction: Record<Side, Point> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/** Angular spread (degrees) of the children around the outward direction. */
const spread: Record<number, number[]> = {
  1: [0],
  2: [-38, 38],
  3: [-58, 0, 58],
  4: [-72, -24, 24, 72],
};

const center: Point = { x: 50, y: 50 };

function polar(angle: number, radius: Point): Point {
  const rad = (angle * Math.PI) / 180;
  return { x: center.x + Math.cos(rad) * radius.x, y: center.y + Math.sin(rad) * radius.y };
}

/** Walk from the center through `p` until the frame edge. */
function toEdge(p: Point): Point {
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  const tx = dx === 0 ? Infinity : (dx > 0 ? 100 - center.x : -center.x) / dx;
  const ty = dy === 0 ? Infinity : (dy > 0 ? 100 - center.y : -center.y) / dy;
  const t = Math.min(tx, ty);
  return { x: center.x + dx * t, y: center.y + dy * t };
}

export function SectionGraph({ section }: { section: Section }) {
  const dir = direction[section.side];
  const base = (Math.atan2(dir.y, dir.x) * 180) / Math.PI;
  const offsets = spread[section.leaves.length] ?? spread[4];
  const vertical = section.side === "top" || section.side === "bottom";
  const radius = vertical ? { x: 36, y: 34 } : { x: 34, y: 32 };
  // Reading order: top to bottom on the sides, right to left (RTL start first) above and below.
  const spots = section.leaves
    .map((_, index) => polar(base + offsets[index], radius))
    .sort((a, b) => (vertical ? b.x - a.x : a.y - b.y));
  const nodes = section.leaves.map((leaf, index) => ({ leaf, at: spots[index] }));
  const back: Point = { x: center.x - dir.x * 38, y: center.y - dir.y * 36 };

  return (
    <GraphFrame
      label={`نقشه‌ی ${section.label}`}
      className="aspect-square md:aspect-3/2"
      wires={
        <>
          <Wire d={wiggle(back, center, 3)} tone="quiet" />
          {nodes.map(({ leaf, at }, index) => (
            <Wire key={leaf.slug} d={bend(center, at, index % 2 ? -5 : 5)} delay={200 + index * 120} />
          ))}
          {nodes.map(({ leaf, at }, index) => (
            <Wire key={`${leaf.slug}-out`} d={wiggle(at, toEdge(at), 2.5)} tone="quiet" delay={500 + index * 120} />
          ))}
        </>
      }
    >
      <CurrentNode at={center} icon={sectionIcons[section.id]} title={section.label} />
      <HubDot at={back} />
      {nodes.map(({ leaf, at }, index) => (
        <DotLink
          key={leaf.slug}
          href={`/${section.id}/${leaf.slug}`}
          at={at}
          label={<bdi>{leaf.label}</bdi>}
          ariaLabel={`گره ${leaf.title}`}
          icon={leafIcon(section.id, leaf.slug)}
          pulse={index === 0}
          delay={300 + index * 120}
        />
      ))}
      {nodes.map(({ leaf, at }, index) => (
        <Terminal key={leaf.slug} at={toEdge(at)} delay={800 + index * 120} />
      ))}
    </GraphFrame>
  );
}
