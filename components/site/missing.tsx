import Link from "next/link";

/** No room at this address: the shipped 404, and a page the admin removed in this browser. */
export function Missing() {
  return (
    <main
      id="content"
      className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-16 text-center"
    >
      <div className="flex max-w-lg flex-col gap-4">
        <p className="text-sm text-muted-foreground">۴۰۴</p>
        <h1 className="text-3xl">این گره به جایی وصل نیست</h1>
        <p className="text-lg">صفحه‌ای که دنبالش بودید روی این نقشه نیست.</p>
      </div>
      <Link
        href="/"
        aria-label="خانه، بازگشت به گره مرکزی هزارتو"
        className="grid size-24 place-items-center rounded-full border-2 border-brand text-base font-bold transition-colors duration-(--motion) ease-motion hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        خانه
      </Link>
    </main>
  );
}
