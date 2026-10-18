"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type Ref,
} from "react";
import { defaultWorld, isPrerendered, type WorldModel } from "@/lib/world";

export const WorldModelContext = createContext<WorldModel>(defaultWorld);

export function useWorldModel() {
  return useContext(WorldModelContext);
}

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * A link to a room. Rooms added in the admin have no prerendered page, so instead of asking the
 * server for one the URL changes in place (the App Router follows `history.pushState`) and the
 * camera pans there like for any other room.
 */
export function NodeLink({
  href,
  ref,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
}) {
  if (isPrerendered(href))
    return <Link href={href} scroll={false} ref={ref} {...props} />;
  return (
    <a
      href={`${base}${href}`}
      ref={ref}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        window.history.pushState(null, "", `${base}${href}`);
      }}
    />
  );
}
