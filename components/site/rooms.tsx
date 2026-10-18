import { useMemo, type ReactNode } from "react";
import {
  Constellation,
  type ConstellationDot,
} from "@/components/site/constellation";
import { Contact } from "@/components/site/contact";
import { Logo } from "@/components/site/logo";
import { MapRoom } from "@/components/site/map-room";
import type { Leaf } from "@/lib/content";
import { arrange, type Placed, type Room } from "@/lib/world";

function ariaFor(p: Placed) {
  const r = p.room;
  if (p.role === "home") return "خانه، بازگشت به گره مرکزی هزارتو";
  if (p.role === "parent") return `بازگشت به گره ${r.label}`;
  if (r.kind === "map") return "نقشه، همه‌ی گره‌ها در یک نگاه";
  if (r.kind === "section") return `گره ${r.label}: ${r.section.summary}`;
  return `گره ${r.kind === "leaf" ? r.leaf.title : r.label}`;
}

function useDots(room: Room) {
  return useMemo(() => {
    const links = room.kind === "leaf" ? (room.leaf.links ?? []) : [];
    const { slots, placed, free } = arrange(room, links.length);
    const dots = placed.map((p): ConstellationDot => ({
      key: p.room.path,
      href: p.room.path,
      label: <bdi>{p.role === "home" ? "خانه" : p.room.short}</bdi>,
      ariaLabel: ariaFor(p),
      slot: p.slot,
      tone: p.role === "home" || p.role === "parent" ? "return" : "child",
    }));
    links.forEach((link, i) => {
      dots.push({
        key: link.href,
        href: link.href,
        label: <bdi>{link.short}</bdi>,
        ariaLabel: link.label,
        slot: free[i],
        tone: "child",
      });
    });
    return { slots, dots };
  }, [room]);
}

function HubCenter() {
  return (
    <div className="hero-fit">
      <Logo priority className="hero-fit-logo" />
      <div
        lang="en"
        dir="ltr"
        className="hero-fit-en flex flex-col items-center gap-1"
      >
        <p className="hero-fit-mark font-bold text-brand">HEZARTOO</p>
        <p className="hero-fit-tagline text-foreground/85">
          Cognitive Technology &amp; Innovation Company
        </p>
      </div>
    </div>
  );
}

function Hero({
  title,
  body,
  status,
  heading: Heading,
  children,
}: {
  title: string;
  body: string[];
  status?: string;
  heading: "h1" | "p";
  children?: ReactNode;
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
      {body.map((text) => (
        <p key={text} className="hero-fit-text text-foreground/85">
          {text}
        </p>
      ))}
      {children}
    </div>
  );
}

/** A leaf's details, frameless, inside the centre with its title; links are circles, not buttons. */
function LeafDetails({ leaf }: { leaf: Leaf }) {
  return (
    <>
      {leaf.facts ? (
        <dl className="hero-fit-meta grid w-full gap-x-6 gap-y-2 sm:grid-cols-2">
          {leaf.facts.map((fact) => (
            <div key={fact.label} className="flex flex-col">
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd className="font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {leaf.people ? (
        <div className="flex w-full flex-col gap-2">
          <h2 className="hero-fit-meta font-bold text-brand">سخنران‌ها</h2>
          <ul className="hero-fit-meta grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {leaf.people.map((person) => (
              <li key={person.name} className="flex flex-col">
                <span className="font-semibold">{person.name}</span>
                <span className="text-foreground/80">{person.role}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {leaf.items ? (
        <ul className="hero-fit-meta grid w-full gap-x-6 gap-y-3 sm:grid-cols-2">
          {leaf.items.map((item) => (
            <li key={item.title} className="flex flex-col">
              <span className="font-semibold text-brand">{item.title}</span>
              <span className="text-foreground/80">{item.body}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {leaf.contact ? <Contact /> : null}
    </>
  );
}

const stageClass = "m-auto size-full max-h-160 max-w-5xl";

export function RoomBody({ room, active }: { room: Room; active: boolean }) {
  const Heading = active ? "h1" : "p";
  const { slots, dots } = useDots(room);

  if (room.kind === "map") return <MapRoom heading={Heading} />;

  if (room.kind === "hub") {
    return (
      <div className="flex h-full flex-col py-4 short:py-2">
        <Heading className="sr-only">
          هزارتو، شرکت فناوری و نوآوری شناخت. از گره مرکزی یکی از چهار راه را
          بروید: رویداد، محصول، درباره ما یا آموزش.
        </Heading>
        <div className="flex min-h-0 flex-1 px-2 py-2 sm:px-4">
          <Constellation
            label="نقشه‌ی هزارتو"
            slots={slots}
            dots={dots}
            center={<HubCenter />}
            maxScale={1.4}
            rowCenter
            className={stageClass}
          />
        </div>
      </div>
    );
  }

  if (room.kind === "section") {
    return (
      <div className="flex h-full flex-col py-4 short:py-2">
        <div className="flex min-h-0 flex-1 px-2 py-2 sm:px-4">
          <Constellation
            label={`نقشه‌ی ${room.section.label}`}
            slots={slots}
            dots={dots}
            center={
              <Hero
                title={room.section.title}
                body={[room.section.summary]}
                heading={Heading}
              />
            }
            className={stageClass}
          />
        </div>
      </div>
    );
  }

  const { leaf } = room;
  return (
    <div className="flex h-full flex-col py-4 short:py-2">
      <div className="room-scroll flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2 sm:px-4">
        <Constellation
          label={`نقشه‌ی ${leaf.label}`}
          slots={slots}
          dots={dots}
          center={
            <Hero
              title={leaf.title}
              body={leaf.body}
              status={leaf.status}
              heading={Heading}
            >
              <LeafDetails leaf={leaf} />
            </Hero>
          }
          grow
          className="my-auto w-full max-w-5xl flex-1 shrink-0 self-center sm:max-h-160"
        />
      </div>
    </div>
  );
}
