import Link from "next/link";
import { Shell } from "@/components/site/header";

export default function NotFound() {
  return (
    <Shell>
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 py-16">
        <p className="text-sm text-muted-foreground">۴۰۴</p>
        <h1 className="text-3xl">این گره به جایی وصل نیست</h1>
        <p className="text-lg">صفحه‌ای که دنبالش بودید روی این نقشه نیست.</p>
        <Link
          href="/"
          className="inline-flex h-12 w-fit items-center justify-center rounded-control bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          بازگشت به گره مرکزی
        </Link>
      </div>
    </Shell>
  );
}
