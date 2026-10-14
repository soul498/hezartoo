import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 112"
      className={cn("block", className)}
      aria-hidden="true"
    >
      <rect width="160" height="112" fill="var(--brand)" />
      <g
        fill="none"
        stroke="var(--brand-foreground)"
        strokeWidth="7"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <rect x="22" y="16" width="116" height="80" rx="26" />
        <rect x="38" y="40" width="34" height="26" rx="8" />
        <rect x="88" y="40" width="34" height="26" rx="8" />
        <rect x="44" y="46" width="22" height="14" rx="4" />
        <rect x="94" y="46" width="22" height="14" rx="4" />
      </g>
    </svg>
  );
}

export function Lockup({ className }: { className?: string }) {
  return (
    <figure className={cn("overflow-hidden rounded-surface border-line border-border bg-card shadow-surface", className)}>
      <Mark className="h-auto w-full" />
      <figcaption>
        <p className="wordmark px-4 py-6 text-center text-3xl text-foreground">هزارتو</p>
        <p className="bg-brand px-4 py-3 text-center text-sm font-semibold text-brand-foreground">
          شرکت فناوری و نوآوری شناخت
        </p>
      </figcaption>
    </figure>
  );
}
