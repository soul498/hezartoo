import Link from "next/link";
import type { ReactNode } from "react";
import { Mark } from "@/components/site/logo";
import { WireField } from "@/components/site/wire-field";
import { instagramUrl, linkedinUrl } from "@/lib/content";

export type Crumb = { href: string; label: string };

/** The path walked so far, drawn as dots joined by a line. Last crumb is the current node. */
export function Header({ trail = [] }: { trail?: Crumb[] }) {
  return (
    <header className="relative z-20 shrink-0">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        رفتن به محتوا
      </a>
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center gap-3 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="هزارتو، گره مرکزی"
        >
          <Mark className="h-10 w-auto overflow-hidden rounded-control" />
          <span className="text-lg font-bold">هزارتو</span>
        </Link>

        {trail.length > 0 ? (
          <nav aria-label="مسیر" className="min-w-0 flex-1 max-sm:hidden">
            <ol className="flex items-center gap-2 text-sm">
              {trail.map((crumb, index) => {
                const last = index === trail.length - 1;
                return (
                  <li key={crumb.href} className="flex min-w-0 items-center gap-2">
                    <span aria-hidden="true" className="h-px w-6 shrink-0 bg-brand/60" />
                    <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand" />
                    {last ? (
                      <span aria-current="page" className="truncate font-semibold">
                        <bdi>{crumb.label}</bdi>
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="flex min-h-11 items-center truncate rounded-control text-foreground/80 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <bdi>{crumb.label}</bdi>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        ) : (
          <span className="flex-1" />
        )}

        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 shrink-0 items-center rounded-control px-4 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:hidden"
        >
          اینستاگرام
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative z-20 shrink-0">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 px-4 py-1 text-sm">
        <p className="text-muted-foreground max-sm:hidden">شرکت فناوری و نوآوری شناخت هزارتو</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center rounded-control px-4 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            اینستاگرام
          </a>
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center rounded-control px-4 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            لینکدین
          </a>
        </div>
      </div>
    </footer>
  );
}

/** Scrolling page (leaf nodes) over the full-screen wire field. */
export function Shell({ trail, children }: { trail?: Crumb[]; children: ReactNode }) {
  return (
    <div className="graph-field relative isolate flex min-h-dvh flex-col">
      <WireField />
      <Header trail={trail} />
      <main id="content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}

/** One viewport, no scroll: the graph stage is sized to whatever space is left. */
export function Stage({ trail, heading, children }: { trail?: Crumb[]; heading: ReactNode; children: ReactNode }) {
  return (
    <div className="graph-field relative isolate flex h-dvh flex-col overflow-hidden">
      <WireField />
      <Header trail={trail} />
      <div className="relative z-10 mx-auto w-full max-w-5xl shrink-0 px-4">{heading}</div>
      <main id="content" className="graph-stage-wrap grid min-h-0 flex-1 place-items-center px-4 py-2">
        {children}
      </main>
      <Footer />
    </div>
  );
}
