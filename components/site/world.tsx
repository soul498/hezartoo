"use client";

import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { RoomBody } from "@/components/site/rooms";
import { WireField } from "@/components/site/wire-field";
import { roomForPath, type Room } from "@/lib/world";

const PAN_MS = 800;

/**
 * The site is one map and the viewport is a camera over it. Navigating keeps the room you
 * left mounted while the camera pans to the next one, then drops it.
 */
export function World({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const room = roomForPath(pathname);
  const [view, setView] = useState<{
    current: Room | undefined;
    previous: Room | null;
  }>({
    current: room,
    previous: null,
  });
  const activeRef = useRef<HTMLDivElement>(null);
  if (room?.path !== view.current?.path) {
    setView({
      current: room,
      previous: room && view.current ? view.current : null,
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

  if (!current) return <>{children}</>;

  const camera: CSSProperties = {
    transform: `translate(${-current.pos.x * 100}%, ${-current.pos.y * 100}%)`,
  };
  const shown = previous ? [previous, current] : [current];

  return (
    <div className="fixed inset-0 isolate overflow-hidden bg-background">
      <WireField />
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
              style={{ left: `${r.pos.x * 100}%`, top: `${r.pos.y * 100}%` }}
            >
              <RoomBody room={r} active={active} />
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
}
