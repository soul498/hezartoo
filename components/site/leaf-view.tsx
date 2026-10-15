import Link from "next/link";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Contact } from "@/components/site/contact";
import { CurrentNode, DotLink, GraphFrame, Terminal, Wire, bend, type Point } from "@/components/site/graph";
import { leafIcon, sectionIcons } from "@/components/site/icons";
import type { Leaf, Section } from "@/lib/content";

const parentAt: Point = { x: 50, y: 20 };
const currentAt: Point = { x: 50, y: 68 };
const siblingX = [18, 82];
const siblingY = 50;

export function LeafView({ section, leaf }: { section: Section; leaf: Leaf }) {
  const siblings = section.leaves.filter((item) => item.slug !== leaf.slug).slice(0, siblingX.length);

  return (
    <div className="flex flex-col items-center">
      <GraphFrame
        label={`نقشه‌ی ${section.label}`}
        className="aspect-4/3 w-full rounded-surface border-line border-border bg-background/40 md:aspect-3/1"
        wires={
          <>
            <Wire d={`M${parentAt.x} ${parentAt.y} L${currentAt.x} ${currentAt.y}`} />
            <Wire d={`M${currentAt.x} ${currentAt.y} L50 100`} delay={300} />
            {siblings.map((item, index) => (
              <Wire
                key={item.slug}
                d={bend(parentAt, { x: siblingX[index], y: siblingY }, index ? 4 : -4)}
                tone="quiet"
                delay={150 + index * 120}
              />
            ))}
          </>
        }
      >
        <DotLink
          href={`/${section.id}`}
          at={parentAt}
          label={section.label}
          ariaLabel={`بازگشت به گره ${section.label}`}
          icon={sectionIcons[section.id]}
        />
        <CurrentNode at={currentAt} icon={leafIcon(section.id, leaf.slug)} title={leaf.label} compact />
        {siblings.map((item, index) => (
          <DotLink
            key={item.slug}
            href={`/${section.id}/${item.slug}`}
            at={{ x: siblingX[index], y: siblingY }}
            label={<bdi>{item.label}</bdi>}
            ariaLabel={`گره ${item.title}`}
            icon={leafIcon(section.id, item.slug)}
            tone="quiet"
            delay={150 + index * 120}
          />
        ))}
        <Terminal at={{ x: 50, y: 100 }} delay={500} />
      </GraphFrame>

      <span aria-hidden="true" className="h-8 w-0.5 bg-brand" />

      <Card className="w-full max-w-3xl border-brand/50">
        <CardHeader className="gap-2">
          {leaf.status ? (
            <Badge variant="brand" className="gap-2">
              <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
              {leaf.status}
            </Badge>
          ) : null}
          <h1 className="text-3xl md:text-4xl">
            <bdi>{leaf.title}</bdi>
          </h1>
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
                  <Link key={link.href} href={link.href} className={linkClass}>
                    {link.label}
                    <ArrowLeft aria-hidden="true" strokeWidth={2} className="size-4" />
                  </Link>
                ),
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

const linkClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-control border-line border-brand px-6 text-base font-semibold text-foreground transition-colors duration-(--motion) ease-motion hover:bg-brand hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
