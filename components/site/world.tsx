"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Footer, Header, type Crumb } from "@/components/site/header";
import { MapOverview, fitMap, mapCenter } from "@/components/site/map-overview";
import { WorldContext } from "@/components/site/world-context";
import { RoomBody } from "@/components/site/rooms";
import { WireField } from "@/components/site/wire-field";
import { roomForPath, type Room } from "@/lib/world";

const PAN_MS = 800;

function trailOf(room: Room): Crumb[] {
  if (room.kind === "hub") return [];
  const section = { href: `/${room.section.id}`, label: room.section.label };
  if (room.kind === "section") return [section];
  return [section, { href: room.path, label: room.short }];
}

/**
 * The site is one map and the viewport is a camera over it. Navigating keeps the room you
 * left mounted while the camera pans to the next one, then drops it.
 */
export function World({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const room = roomForPath(pathname);
  const [view, setView] = useState<{ current: Room | undefined; previous: Room | null }>({
    current: room,
    previous: null,
  });
  const activeRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<{ open: boolean; w: number; h: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openMap = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null;
    setMap({ open: true, w: window.innerWidth, h: window.innerHeight });
  }, []);

  const closeMap = useCallback((restoreFocus: boolean) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMap((m) => (m ? { ...m, open: false } : m));
    window.setTimeout(() => setMap((m) => (m && !m.open ? null : m)), reduce ? 0 : PAN_MS + 50);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }, []);

  const mapOpen = Boolean(map?.open);

  useEffect(() => {
    if (!mapOpen) return;
    document.querySelector<HTMLElement>("[data-map-close]")?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMap(true);
    };
    const onResize = () => setMap((m) => (m ? { ...m, w: window.innerWidth, h: window.innerHeight } : m));
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [mapOpen, closeMap]);

  const context = useMemo(() => ({ openMap }), [openMap]);

  if (room?.path !== view.current?.path) {
    setView({ current: room, previous: room && view.current ? view.current : null });
  }

  const { current, previous } = view;

  useEffect(() => {
    if (!previous) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const done = () => setView((v) => (v.previous ? { ...v, previous: null } : v));
    const timer = window.setTimeout(done, reduce ? 0 : PAN_MS + 50);
    const focusWasLost = !document.activeElement || document.activeElement === document.body;
    const leftBehind = document.activeElement?.closest("[data-room]:not([data-room-active])");
    if (focusWasLost || leftBehind) activeRef.current?.focus({ preventScroll: true });
    return () => window.clearTimeout(timer);
  }, [previous]);

  if (!current) return <>{children}</>;

  // One transform shape for every state so pans and the map zoom interpolate the same way.
  const fit = map?.open ? fitMap(map.w, map.h) : null;
  const focus = fit ? mapCenter : current.pos;
  const camera: CSSProperties = {
    transform: `translate(50%, calc(50% + ${fit ? fit.dy : 0}px)) scale(${fit ? fit.s : 1}) translate(${-(focus.x * 100 + 50)}%, ${-(focus.y * 100 + 50)}%)`,
  };
  const shown = previous ? [previous, current] : [current];

  return (
    <WorldContext.Provider value={context}>
      <div className="graph-field fixed inset-0 isolate overflow-hidden">
        <WireField />
        <div
          data-world-camera=""
          data-world-dimmed={mapOpen ? "" : undefined}
          inert={mapOpen}
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
                <RoomBody room={r} active={active} showCard />
              </div>
            );
          })}
        </div>
        <div
          inert={mapOpen}
          data-world-dimmed={mapOpen ? "" : undefined}
          className="world-chrome pointer-events-none absolute inset-x-0 top-0 z-20"
        >
          <Header trail={trailOf(current)} />
        </div>
        <div
          inert={mapOpen}
          data-world-dimmed={mapOpen ? "" : undefined}
          className="world-chrome pointer-events-none absolute inset-x-0 bottom-0 z-20"
        >
          <Footer />
        </div>
        {map ? <MapOverview open={map.open} w={map.w} h={map.h} currentPath={current.path} onClose={closeMap} /> : null}
        {children}
      </div>
    </WorldContext.Provider>
  );
}
