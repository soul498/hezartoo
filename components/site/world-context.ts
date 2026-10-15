"use client";

import { createContext, useContext } from "react";

export const WorldContext = createContext<{ openMap: (trigger?: HTMLElement | null) => void }>({
  openMap: () => {},
});

export function useWorld() {
  return useContext(WorldContext);
}
