import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Stage } from "@/components/site/header";
import { SectionGraph } from "@/components/site/section-graph";
import { getSection, sections } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.map((section) => ({ section: section.id }));
}

type Props = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const section = getSection((await params).section);
  if (!section) return {};
  return {
    title: `${section.title} | هزارتو`,
    description: section.summary,
    alternates: { canonical: `./` },
  };
}

export default async function Page({ params }: Props) {
  const section = getSection((await params).section);
  if (!section) notFound();

  return (
    <Stage
      trail={[{ href: `/${section.id}`, label: section.label }]}
      heading={
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl">{section.title}</h1>
          <p className="max-w-2xl text-base text-foreground/85">{section.summary}</p>
        </div>
      }
    >
      <SectionGraph section={section} />
    </Stage>
  );
}
