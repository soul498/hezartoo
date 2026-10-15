import { Stage } from "@/components/site/header";
import { Hub } from "@/components/site/hub";

export default function Page() {
  return (
    <Stage
      heading={
        <h1 className="sr-only">
          هزارتو، شرکت فناوری و نوآوری شناخت. از گره مرکزی یکی از چهار راه را بروید: رویداد، محصول، درباره ما یا آموزش.
        </h1>
      }
    >
      <Hub />
    </Stage>
  );
}
