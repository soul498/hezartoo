import { ButtonLink } from "@/components/site/button-link";

const home = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`;

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center gap-4 px-4 py-24">
      <p className="text-sm text-muted-foreground">۴۰۴</p>
      <h1 className="text-3xl">این راهرو به جایی نمی‌رسد</h1>
      <p className="text-lg">صفحه‌ای که دنبالش بودید روی این نقشه نیست.</p>
      <ButtonLink href={home} className="w-fit">
        بازگشت به هزارتو
      </ButtonLink>
    </main>
  );
}
