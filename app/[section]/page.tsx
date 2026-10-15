import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

/** Drawn by `World` in the root layout; the page validates the slug and carries metadata. */
export default async function Page({ params }: Props) {
  if (!getSection((await params).section)) notFound();
  return null;
}
