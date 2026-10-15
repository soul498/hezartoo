import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Contact } from "@/components/site/contact";
import { CurrentNode, DotLink, GraphFrame, Wire, bend, type Point } from "@/components/site/graph";
import { Hub } from "@/components/site/hub";
import { leafIcon, sectionIcons } from "@/components/site/icons";
import { LogoMark } from "@/components/site/logo";
import type { Leaf } from "@/lib/content";
import { neighborsOf, type Neighbor, type Room } from "@/lib/world";

const center: Point = { x: 50, y: 50 };

type Placed = Neighbor & { at: Point; from: Point };

/**
 * Put every neighbour in the direction it lies on the map, so a click pans the camera the way
 * the dot points. When two neighbours share a direction (a parent with home behind it), the
 * nearer one sits halfway and the wire runs through it.
 */
function place(room: Room, neighbors: Neighbor[], radius: Point, inner: number): Placed[] {
  const items = neighbors.map((n) => {
    const dx = n.room.pos.x - room.pos.x;
    const dy = n.room.pos.y - room.pos.y;
    const dist = Math.hypot(dx, dy) || 1;
    return { n, ux: dx / dist, uy: dy / dist, angle: Math.atan2(dy, dx), dist, f: 1, via: -1 };
  });
  items.forEach((a, i) => {
    items.forEach((b, j) => {
      if (i === j) return;
      let diff = Math.abs(a.angle - b.angle);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff < 0.55 && a.dist < b.dist) {
        a.f = inner;
        b.via = i;
      }
    });
  });
  const at = items.map((i) => ({ x: center.x + i.ux * radius.x * i.f, y: center.y + i.uy * radius.y * i.f }));
  return items.map((i, k) => ({ ...i.n, at: at[k], from: i.via >= 0 ? at[i.via] : center }));
}

export function HomeDot({ at, delay = 0 }: { at: Point; delay?: number }) {
  return (
    <Link
      href="/"
      scroll={false}
      aria-label="خانه، بازگشت به گره مرکزی هزارتو"
      data-graph-node=""
      className="graph-node group absolute z-10 flex w-max -translate-x-1/2 -translate-y-6 flex-col items-center gap-1 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background md:-translate-y-7"
      style={{ left: `${at.x}%`, top: `${at.y}%`, "--delay": `${delay}ms` } as CSSProperties}
    >
      <span className="relative grid size-12 place-items-center overflow-hidden rounded-full border-2 border-brand bg-brand ring-4 ring-background transition-transform duration-(--motion) ease-motion group-hover:scale-110 group-active:scale-95 md:size-14">
        <span aria-hidden="true" className="graph-pulse absolute inset-0 rounded-full border-2 border-brand" />
        <LogoMark className="relative w-9 md:w-10" />
      </span>
      <span className="rounded-control bg-background/80 px-2 text-sm font-bold leading-normal text-brand">خانه</span>
    </Link>
  );
}

function NeighborGraph({ room, compact, className }: { room: Room; compact: boolean; className: string }) {
  const placed = place(room, neighborsOf(room), compact ? { x: 42, y: 40 } : { x: 38, y: 38 }, 0.58);
  const title = room.kind === "section" ? room.section.label : room.label;
  const icon =
    room.kind === "leaf"
      ? leafIcon(room.section.id, room.leaf.slug)
      : room.kind === "section"
        ? sectionIcons[room.section.id]
        : sectionIcons.about;

  return (
    <GraphFrame
      label={`نقشه‌ی ${title}`}
      className={className}
      wires={placed.map((p, index) => (
        <Wire
          key={p.room.path}
          d={bend(p.from, p.at, index % 2 ? -4 : 4)}
          tone={p.role === "child" || p.role === "parent" ? "brand" : "quiet"}
          delay={150 + index * 100}
        />
      ))}
    >
      <CurrentNode at={center} icon={icon} title={title} compact={compact} />
      {placed.map((p, index) => {
        if (p.role === "home") return <HomeDot key="home" at={p.at} delay={200 + index * 100} />;
        const r = p.room;
        const nodeIcon =
          r.kind === "leaf" ? leafIcon(r.section.id, r.leaf.slug) : r.kind === "section" ? sectionIcons[r.section.id] : icon;
        return (
          <DotLink
            key={r.path}
            href={r.path}
            at={p.at}
            label={<bdi>{r.short}</bdi>}
            ariaLabel={p.role === "parent" ? `بازگشت به گره ${r.label}` : `گره ${r.kind === "leaf" ? r.leaf.title : r.label}`}
            icon={nodeIcon}
            tone={p.role === "sibling" ? "quiet" : "brand"}
            pulse={p.role === "child" && index === 1}
            delay={200 + index * 100}
          />
        );
      })}
    </GraphFrame>
  );
}

export function RoomBody({ room, active, showCard }: { room: Room; active: boolean; showCard: boolean }) {
  const Heading = active ? "h1" : "p";

  if (room.kind === "hub") {
    return (
      <div className="flex h-full flex-col pt-16 pb-12">
        <Heading className="sr-only">
          هزارتو، شرکت فناوری و نوآوری شناخت. از گره مرکزی یکی از چهار راه را بروید: رویداد، محصول، درباره ما یا آموزش.
        </Heading>
        <div className="graph-stage-wrap grid min-h-0 flex-1 place-items-center px-4 py-2">
          <Hub />
        </div>
      </div>
    );
  }

  if (room.kind === "section") {
    return (
      <div className="flex h-full flex-col pt-16 pb-12">
        <div className="mx-auto flex w-full max-w-5xl shrink-0 flex-col gap-1 px-4">
          <Heading className="wordmark text-2xl md:text-3xl">{room.section.title}</Heading>
          <p className="max-w-2xl text-base text-foreground/85">{room.section.summary}</p>
        </div>
        <div className="graph-stage-wrap grid min-h-0 flex-1 place-items-center px-4 py-2">
          <NeighborGraph room={room} compact={false} className="graph-stage" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pt-16 pb-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4">
        <NeighborGraph room={room} compact className="aspect-square w-full max-w-md md:aspect-5/2 md:max-w-none" />
        {showCard ? <LeafCard leaf={room.leaf} active={active} /> : <div className="min-h-96 w-full max-w-3xl" />}
      </div>
    </div>
  );
}

function LeafCard({ leaf, active }: { leaf: Leaf; active: boolean }) {
  const Heading = active ? "h1" : "p";
  return (
    <Card className="w-full max-w-3xl border-brand/50">
      <CardHeader className="gap-2">
        {leaf.status ? (
          <Badge variant="brand" className="gap-2">
            <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
            {leaf.status}
          </Badge>
        ) : null}
        <Heading className="wordmark text-3xl md:text-4xl">
          <bdi>{leaf.title}</bdi>
        </Heading>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          {leaf.body.map((text) => (
            <p key={text} className="max-w-2xl text-lg">
              {text}
            </p>
          ))}
        </div>

        {leaf.facts ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            {leaf.facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1 border-s-2 border-brand ps-4">
                <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                <dd className="text-base font-semibold">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {leaf.people ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-xl">سخنران‌ها</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {leaf.people.map((person) => (
                <li key={person.name} className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-2 size-3 shrink-0 rounded-full bg-brand" />
                  <span>
                    <span className="block font-semibold">{person.name}</span>
                    <span className="text-base text-foreground/80">{person.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {leaf.items ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {leaf.items.map((item) => (
              <li key={item.title} className="flex flex-col gap-1 rounded-control border-line border-border p-4">
                <span className="flex items-center gap-2 font-semibold">
                  <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
                  {item.title}
                </span>
                <span className="text-base text-foreground/80">{item.body}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {leaf.contact ? <Contact /> : null}

        {leaf.links ? (
          <div className="flex flex-wrap gap-3">
            {leaf.links.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={linkClass}>
                  {link.label}
                  <ArrowUpLeft aria-hidden="true" strokeWidth={2} className="size-4" />
                </a>
              ) : (
                <Link key={link.href} href={link.href} scroll={false} className={linkClass}>
                  {link.label}
                  <ArrowLeft aria-hidden="true" strokeWidth={2} className="size-4" />
                </Link>
              ),
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const linkClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-control border-line border-brand px-6 text-base font-semibold text-foreground transition-colors duration-(--motion) ease-motion hover:bg-brand hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
