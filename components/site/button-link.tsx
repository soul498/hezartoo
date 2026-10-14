import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost";

const variants: Record<Variant, string> = {
  default: "h-12 bg-primary px-6 text-base text-primary-foreground hover:bg-primary/90",
  outline: "h-12 border-line border-input bg-transparent px-6 text-base hover:bg-accent",
  ghost: "h-11 px-4 text-sm hover:bg-accent",
};

export function ButtonLink({
  variant = "default",
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant }) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-semibold",
        "transition-all duration-(--motion) ease-motion",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "[&_svg]:size-4",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
