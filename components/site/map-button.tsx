"use client";

import { Map as MapIcon } from "lucide-react";
import { useWorld } from "@/components/site/world-context";

export function MapButton() {
  const { openMap } = useWorld();
  return (
    <button
      type="button"
      onClick={(event) => openMap(event.currentTarget)}
      className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-brand px-5 text-base font-semibold text-foreground transition-colors duration-(--motion) ease-motion hover:bg-brand hover:text-brand-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <MapIcon aria-hidden="true" strokeWidth={2} className="size-5" />
      مشاهده نقشه
    </button>
  );
}
