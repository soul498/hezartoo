import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  const ink = "var(--brand-foreground)";
  const lime = "var(--brand)";
  return (
    <svg viewBox="0 0 320 220" className={cn("block", className)} aria-hidden="true">
      <rect width="320" height="220" fill={lime} />
      <rect x="36" y="28" width="248" height="164" rx="52" fill={ink} />
      <rect x="58" y="50" width="204" height="120" rx="40" fill={lime} />
      <rect x="74" y="78" width="74" height="58" rx="18" fill={ink} />
      <rect x="88" y="92" width="46" height="30" rx="10" fill={lime} />
      <rect x="172" y="78" width="74" height="58" rx="18" fill={ink} />
      <rect x="186" y="92" width="46" height="30" rx="10" fill={lime} />
    </svg>
  );
}

export function Lockup({ className }: { className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-surface border-line border-border bg-card shadow-surface", className)}>
      <Mark className="h-auto w-full" />
      <figcaption>
        <p className="wordmark bg-foreground px-4 py-6 text-center text-3xl text-background">هزارتو</p>
        <p className="bg-brand px-4 py-3 text-center text-sm font-semibold text-brand-foreground">
          شرکت فناوری و نوآوری شناخت
        </p>
      </figcaption>
    </figure>
  );
}
