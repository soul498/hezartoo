import Link from "next/link";
import { useMemo } from "react";
import { ArrowDown, ArrowLeft, ArrowUpLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Constellation, type ConstellationDot } from "@/components/site/constellation";
import { Contact } from "@/components/site/contact";
import { Logo } from "@/components/site/logo";
import { MapButton } from "@/components/site/map-button";
import type { Leaf } from "@/lib/content";
import { arrange, type Placed, type Room } from "@/lib/world";

function ariaFor(p: Placed) {
  const r = p.room;
  if (p.role === "home") return "خانه، بازگشت به گره مرکزی هزارتو";
  if (p.role === "parent") return `بازگشت به گره ${r.label}`;
  if (r.kind === "section") return `گره ${r.label}: ${r.section.summary}`;
  return `گره ${r.kind === "leaf" ? r.leaf.title : r.label}`;
}

function useDots(room: Room) {
  return useMemo(() => {
    const { slots, placed } = arrange(room);
    const dots = placed.map(
      (p): ConstellationDot => ({
        key: p.room.path,
        href: p.room.path,
        label: <bdi>{p.role === "home" ? "خانه" : p.room.short}</bdi>,
        ariaLabel: ariaFor(p),
        slot: p.slot,
        tone: p.role === "home" || p.role === "parent" ? "return" : "child",
      }),
    );
    return { slots, dots };
  }, [room]);
}

function HubCenter() {
  return (
    <div className="hero-fit">
      <Logo priority className="hero-fit-logo" />
      <div lang="en" dir="ltr" className="hero-fit-en flex flex-col items-center gap-1">
        <p className="hero-fit-mark font-bold text-brand">HEZARTOO</p>
        <p className="hero-fit-tagline text-foreground/85">Cognitive Technology &amp; Innovation Company</p>
      </div>
    </div>
  );
}

function Hero({
  title,
  text,
  status,
  heading: Heading,
}: {
  title: string;
  text: string;
  status?: string;
  heading: "h1" | "p";
}) {
  return (
    <div className="hero-fit">
      {status ? (
        <p className="hero-fit-meta flex items-center gap-2 font-semibold text-brand">
          <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
          {status}
        </p>
      ) : null}
      <Heading className="hero-fit-title wordmark">
        <bdi>{title}</bdi>
      </Heading>
      <p className="hero-fit-text text-foreground/85">{text}</p>
    </div>
  );
}

/** What a leaf has beyond its opening paragraph; that paragraph is already the centre. */
function hasDetails(leaf: Leaf) {
  return Boolean(leaf.body.length > 1 || leaf.facts || leaf.people || leaf.items || leaf.contact || leaf.links);
}

export function RoomBody({ room, active, showCard }: { room: Room; active: boolean; showCard: boolean }) {
  const Heading = active ? "h1" : "p";
  const { slots, dots } = useDots(room);

  if (room.kind === "hub") {
    return (
      <div className="flex h-full flex-col pt-16 pb-12 short:pt-12">
        <Heading className="sr-only">
          هزارتو، شرکت فناوری و نوآوری شناخت. از گره مرکزی یکی از چهار راه را بروید: رویداد، محصول، درباره ما یا آموزش.
        </Heading>
        <div className="flex min-h-0 flex-1 px-4 py-2">
          <Constellation
            label="نقشه‌ی هزارتو"
            slots={slots}
            dots={dots}
            center={<HubCenter />}
            maxScale={1.4}
            rowCenter
            className="m-auto size-full max-h-160 max-w-5xl"
          />
        </div>
        <div className="flex shrink-0 justify-center px-4 pb-2">
          <MapButton />
        </div>
      </div>
    );
  }

  if (room.kind === "section") {
    return (
      <div className="flex h-full flex-col pt-16 pb-12 short:pt-12">
        <div className="flex min-h-0 flex-1 px-4 py-2">
          <Constellation
            label={`نقشه‌ی ${room.section.label}`}
            slots={slots}
            dots={dots}
            center={<Hero title={room.section.title} text={room.section.summary} heading={Heading} />}
            className="m-auto size-full max-h-160 max-w-5xl"
          />
        </div>
      </div>
    );
  }

  const { leaf } = room;
  const details = hasDetails(leaf);
  const detailsId = `details-${room.section.id}-${leaf.slug}`;
  return (
    <div className="flex h-full flex-col pt-16 pb-14 short:pt-12">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex h-full flex-col">
          <div className="flex min-h-0 flex-1 px-4 py-2">
            <Constellation
              label={`نقشه‌ی ${leaf.label}`}
              slots={slots}
              dots={dots}
              center={<Hero title={leaf.title} text={leaf.body[0]} status={leaf.status} heading={Heading} />}
              className="m-auto size-full max-h-160 max-w-5xl"
            />
          </div>
          {details ? (
            <div className="flex shrink-0 justify-center px-4 pb-2">
              <button
                type="button"
                onClick={() =>
                  document.getElementById(detailsId)?.scrollIntoView({
                    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                    block: "start",
                  })
                }
                className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-foreground/85 transition-colors duration-(--motion) hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                جزئیات بیشتر
                <ArrowDown aria-hidden="true" strokeWidth={2} className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
        {details ? (
          <div id={detailsId} className="mx-auto w-full max-w-3xl scroll-mt-4 px-4 pb-6">
            {showCard ? <LeafDetails leaf={leaf} /> : <div className="min-h-96" />}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LeafDetails({ leaf }: { leaf: Leaf }) {
  return (
    <Card className="w-full border-brand/50">
      <CardContent className="flex flex-col gap-6 pt-6">
        {leaf.body.length > 1 ? (
          <div className="flex flex-col gap-4">
            {leaf.body.slice(1).map((text) => (
              <p key={text} className="max-w-2xl text-lg">
                {text}
              </p>
            ))}
          </div>
        ) : null}

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
