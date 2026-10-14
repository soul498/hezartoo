"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ButtonLink } from "@/components/site/button-link";
import { Mark } from "@/components/site/logo";
import { instagramUrl, nav } from "@/lib/content";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        رفتن به محتوا
      </a>
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <a href="#top" className="flex items-center gap-3" aria-label="هزارتو، ابتدای صفحه">
          <Mark className="h-10 w-auto overflow-hidden rounded-control" />
          <span className="text-lg font-bold">هزارتو</span>
        </a>
        <nav className="hidden items-center gap-6 md:flex" aria-label="بخش‌های صفحه">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-foreground/80 hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            variant="outline"
            className="h-11 max-sm:hidden"
          >
            اینستاگرام
          </ButtonLink>
          <Button
            size="icon"
            variant="outline"
            className="size-11 md:hidden"
            aria-label="باز کردن منو"
            onClick={() => setOpen(true)}
          >
            <Menu strokeWidth={2} />
          </Button>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen} title="منو" side="start">
        <nav className="flex flex-col gap-2" aria-label="بخش‌های صفحه">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-control px-3 text-base hover:bg-accent"
            >
              {item.label}
            </a>
          ))}
          <ButtonLink href={instagramUrl} target="_blank" rel="noreferrer" className="mt-4">
            اینستاگرام هزارتو
          </ButtonLink>
        </nav>
      </Sheet>
    </header>
  );
}
