"use client";

import { useSyncExternalStore } from "react";
import {
  sections as defaultSections,
  type Leaf,
  type Section,
} from "@/lib/content";

/**
 * The admin's edits to the node tree, kept in this browser only. When present and valid the
 * public graph reads them instead of `lib/content.ts`; prerendered HTML always starts from the
 * shipped content and switches after hydration.
 */
const KEY = "hezartoo:content:v1";
const EVENT = "hezartoo:content";

function isLeaf(value: unknown): value is Leaf {
  const leaf = value as Leaf;
  return (
    typeof leaf?.slug === "string" &&
    /^[a-z0-9-]+$/.test(leaf.slug) &&
    typeof leaf.label === "string" &&
    typeof leaf.title === "string" &&
    Array.isArray(leaf.body) &&
    leaf.body.every((p) => typeof p === "string")
  );
}

function parse(raw: string | null): Section[] | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Section[];
    if (!Array.isArray(data) || data.length !== defaultSections.length)
      return null;
    const ok = data.every(
      (s, i) =>
        s?.id === defaultSections[i].id &&
        typeof s.label === "string" &&
        typeof s.title === "string" &&
        typeof s.summary === "string" &&
        Array.isArray(s.leaves) &&
        s.leaves.every(isLeaf),
    );
    return ok
      ? data.map((s, i) => ({ ...s, side: defaultSections[i].side }))
      : null;
  } catch {
    return null;
  }
}

let lastRaw: string | null | undefined;
let lastValue: Section[] = defaultSections;

function snapshot(): Section[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastValue = parse(raw) ?? defaultSections;
  }
  return lastValue;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function useSections(): Section[] {
  return useSyncExternalStore(subscribe, snapshot, () => defaultSections);
}

export function hasOverride(sections: Section[]) {
  return sections !== defaultSections;
}

export function saveSections(next: Section[]) {
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function resetSections() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}
