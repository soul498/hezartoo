import Image from "next/image";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

/** The headset mark cropped from the official logo: lime field, navy outline. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src={asset("/hezartoo-mark.png")}
      alt=""
      aria-hidden="true"
      width={244}
      height={184}
      className={cn("block aspect-61/46 h-auto", className)}
    />
  );
}

/** The full official logo: mark, wordmark «هزارتو», and the company band. */
export function Logo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={asset("/hezartoo-logo.png")}
      alt="نشان هزارتو، شرکت فناوری و نوآوری شناخت"
      width={426}
      height={457}
      priority={priority}
      className={cn("block aspect-426/457 h-auto", className)}
    />
  );
}
