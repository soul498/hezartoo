"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Missing } from "@/components/site/missing";
import { RoomBody } from "@/components/site/rooms";
import { WireField } from "@/components/site/wire-field";
import { WorldModelContext } from "@/components/site/world-model";
import { hasOverride, useSections } from "@/lib/content-store";
import {
  buildWorld,
  defaultWorld,
  isPrerendered,
  roomForPath,
  type Room,
} from "@/lib/world";

const PAN_MS = 800;
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const noSubscribe = () => () => {};

/**
 * The address bar, for rooms that exist only in this browser: their URL is served the static
 * 404 page, whose router path is not the URL, so the room is looked up from `location` too.
 */
function useLocationPath() {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const path = window.location.pathname;
      return base && path.startsWith(base)
        ? path.slice(base.length) || "/"
        : path;
    },
    () => null,
  );
}

/**
 * The site is one map and the viewport is a camera over it. Navigating keeps the room you
 * left mounted while the camera pans to the next one, then drops it. Both rooms stay drawn
 * the whole way, the wires follow their circles, and the lens dips to 97% mid-pan.
 */
export function World({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const located = useLocationPath();
  const sections = useSections();
  const world = useMemo(
    () => (hasOverride(sections) ? buildWorld(sections) : defaultWorld),
    [sections],
  );
  const room =
    roomForPath(world, pathname) ??
    (located ? roomForPath(world, located) : undefined);

  const [view, setView] = useState<{
    current: Room | undefined;
    previous: Room | null;
  }>({
    current: room,
    previous: null,
  });
  const activeRef = useRef<HTMLDivElement>(null);
  if (room !== view.current) {
    const moved = room?.path !== view.current?.path;
    setView({
      current: room,
      previous: moved && room && view.current ? view.current : view.previous,
    });
  }

  const { current, previous } = view;

  useEffect(() => {
    if (!previous) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const done = () =>
      setView((v) => (v.previous ? { ...v, previous: null } : v));
    const timer = window.setTimeout(done, reduce ? 0 : PAN_MS + 50);
    const focusWasLost =
      !document.activeElement || document.activeElement === document.body;
    const leftBehind = document.activeElement?.closest(
      "[data-room]:not([data-room-active])",
    );
    if (focusWasLost || leftBehind)
      activeRef.current?.focus({ preventScroll: true });
    return () => window.clearTimeout(timer);
  }, [previous]);

  if (!current) {
    // A shipped room the admin removed in this browser; any other address keeps its own page.
    return isPrerendered(pathname) ? <Missing /> : <>{children}</>;
  }

  const camera: CSSProperties = {
    transform: `translate(${-current.pos.x * 100}%, ${-current.pos.y * 100}%)`,
  };
  const shown =
    previous && previous.path !== current.path
      ? [previous, current]
      : [current];

  return (
    <WorldModelContext.Provider value={world}>
      <div className="fixed inset-0 isolate overflow-hidden bg-background">
        <WireField />
        <div
          data-world-lens=""
          data-panning={shown.length > 1 ? "" : undefined}
          className="world-lens absolute inset-0"
        >
          <div
            data-world-camera=""
            className="world-camera absolute inset-0"
            style={camera}
          >
            {shown.map((r) => {
              const active = r.path === current.path;
              return (
                <div
                  key={r.path}
                  ref={active ? activeRef : undefined}
                  id={active ? "content" : undefined}
                  data-room={r.path}
                  data-room-active={active ? "" : undefined}
                  tabIndex={active ? -1 : undefined}
                  aria-hidden={active ? undefined : true}
                  inert={!active}
                  className="absolute size-full outline-none"
                  style={{
                    left: `${r.pos.x * 100}%`,
                    top: `${r.pos.y * 100}%`,
                  }}
                >
                  <RoomBody room={r} active={active} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </WorldModelContext.Provider>
  );
}
