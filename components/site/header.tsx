import Link from "next/link";
import { LogoMark } from "@/components/site/logo";
import { instagramUrl, linkedinUrl } from "@/lib/content";

export type Crumb = { href: string; label: string };

/** The path walked so far, drawn as dots joined by a line. Last crumb is the current node. */
export function Header({ trail = [] }: { trail?: Crumb[] }) {
  return (
    <header className="pointer-events-auto">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        رفتن به محتوا
      </a>
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-4 px-4">
        <Link
          href="/"
          scroll={false}
          className="flex min-h-11 shrink-0 items-center gap-3 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="هزارتو، گره مرکزی"
        >
          <LogoMark className="w-12" />
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
                        scroll={false}
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
    <footer className="pointer-events-auto">
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
