import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/components/site/header";
import { LeafView } from "@/components/site/leaf-view";
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

export default async function Page({ params }: Props) {
  const { section, node } = await params;
  const found = getLeaf(section, node);
  if (!found) notFound();

  return (
    <Shell
      trail={[
        { href: `/${found.section.id}`, label: found.section.label },
        { href: `/${found.section.id}/${found.leaf.slug}`, label: found.leaf.label },
      ]}
    >
      <LeafView section={found.section} leaf={found.leaf} />
    </Shell>
  );
}
