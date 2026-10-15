import { Shell } from "@/components/site/header";
import { Hub } from "@/components/site/hub";

export default function Page() {
  return (
    <Shell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl">هزارتو</h1>
        <p className="max-w-2xl text-lg">
          شرکت فناوری و نوآوری شناخت. از گره مرکزی یکی از چهار راه را بروید: رویداد، محصول، درباره ما یا آموزش.
        </p>
      </div>
      <Hub />
    </Shell>
  );
}
