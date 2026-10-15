import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLeaf, sections } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.flatMap((section) =>
    section.leaves.map((leaf) => ({ section: section.id, node: leaf.slug })),
  );
}

type Props = { params: Promise<{ section: string; node: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section, node } = await params;
  const found = getLeaf(section, node);
  if (!found) return {};
  return {
    title: `${found.leaf.title} | ${found.section.label} | هزارتو`,
    description: found.leaf.body[0],
    alternates: { canonical: `./` },
  };
}

/** Drawn by `World` in the root layout; the page validates the slug and carries metadata. */
export default async function Page({ params }: Props) {
  const { section, node } = await params;
  if (!getLeaf(section, node)) notFound();
  return null;
}
