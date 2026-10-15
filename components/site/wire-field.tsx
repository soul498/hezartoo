"use client";

import { useEffect, useRef } from "react";
import { mulberry32 } from "@/lib/utils";

type Vec = { x: number; y: number };

type Curve = {
  node: number;
  angle: number;
  /** Bow of the curve as a share of its length; drifts over time. */
  bow: number;
  drift: number;
  phase: number;
  primary: boolean;
  pulses: { t: number; speed: number }[];
};

const FAINT_PER_NODE = 4;
const FAINT_PER_CENTER = 9;

function edgePoint(from: Vec, angle: number, w: number, h: number): Vec {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const tx = dx > 0 ? (w - from.x) / dx : dx < 0 ? -from.x / dx : Infinity;
  const ty = dy > 0 ? (h - from.y) / dy : dy < 0 ? -from.y / dy : Infinity;
  const t = Math.max(0, Math.min(tx, ty));
  return { x: from.x + dx * t, y: from.y + dy * t };
}

function cubic(p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y };
}

/**
 * Full-viewport canvas of faint wires running from every `[data-graph-node]` to the screen edges,
 * with signal pulses travelling outward. Static under prefers-reduced-motion, paused when hidden.
 */
export function WireField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const root = getComputedStyle(document.documentElement);
    const brand = root.getPropertyValue("--brand").trim() || "currentColor";
    const ink = root.getPropertyValue("--foreground").trim() || "currentColor";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let nodes: HTMLElement[] = [];
    let curves: Curve[] = [];
    let frame = 0;
    let last = 0;
    let width = 0;
    let height = 0;

    function collect() {
      const found = Array.from(document.querySelectorAll<HTMLElement>("[data-graph-node]"));
      if (found.length === nodes.length && found.every((el, i) => el === nodes[i])) return;
      nodes = found;
      const rand = mulberry32(found.length * 7919 + 17);
      curves = [];
      found.forEach((el, index) => {
        const center = el.dataset.graphNode === "center";
        const count = center ? FAINT_PER_CENTER : FAINT_PER_NODE;
        for (let i = 0; i <= count; i += 1) {
          const primary = i === 0 && !center;
          curves.push({
            node: index,
            angle: center ? (i / (count + 1)) * Math.PI * 2 + rand() * 0.4 : (rand() - 0.5) * (primary ? 0.5 : 1.6),
            bow: (rand() - 0.5) * 0.5,
            drift: 0.04 + rand() * 0.08,
            phase: rand() * Math.PI * 2,
            primary,
            pulses: Array.from({ length: primary ? 2 : rand() > 0.5 ? 1 : 0 }, (_, k) => ({
              t: (rand() + k * 0.5) % 1,
              speed: 0.00005 + rand() * 0.00008,
            })),
          });
        }
      });
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(time: number, animate: boolean) {
      collect();
      ctx!.clearRect(0, 0, width, height);
      const stage = document.querySelector<HTMLElement>("[data-graph-stage]")?.getBoundingClientRect();
      const hub: Vec = stage
        ? { x: stage.left + stage.width / 2, y: stage.top + stage.height / 2 }
        : { x: width / 2, y: height / 2 };
      const anchors = nodes.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });

      for (const curve of curves) {
        const from = anchors[curve.node];
        if (!from) continue;
        const outward = Math.atan2(from.y - hub.y, from.x - hub.x);
        const angle = nodes[curve.node].dataset.graphNode === "center" ? curve.angle : outward + curve.angle;
        const to = edgePoint(from, angle, width, height);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy);
        if (len < 8) continue;
        const nx = -dy / len;
        const ny = dx / len;
        const sway = animate ? Math.sin(time * 0.00025 * (1 + curve.drift * 4) + curve.phase) * curve.drift : 0;
        const bend = (curve.bow + sway) * len;
        const p1 = { x: from.x + dx * 0.33 + nx * bend, y: from.y + dy * 0.33 + ny * bend };
        const p2 = { x: from.x + dx * 0.66 - nx * bend * 0.6, y: from.y + dy * 0.66 - ny * bend * 0.6 };

        ctx!.beginPath();
        ctx!.moveTo(from.x, from.y);
        ctx!.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, to.x, to.y);
        ctx!.strokeStyle = curve.primary ? brand : ink;
        ctx!.globalAlpha = curve.primary ? 0.34 : 0.1;
        ctx!.lineWidth = curve.primary ? 1.5 : 1;
        ctx!.stroke();

        if (!animate) continue;
        for (const pulse of curve.pulses) {
          pulse.t = (pulse.t + pulse.speed * Math.min(time - last, 64)) % 1;
          const steps = 10;
          for (let s = steps; s >= 0; s -= 1) {
            const t = pulse.t - s * 0.006;
            if (t < 0) continue;
            const p = cubic(from, p1, p2, to, t);
            const head = s === 0;
            ctx!.globalAlpha = (head ? 0.9 : 0.45 * (1 - s / steps)) * (curve.primary ? 1 : 0.6);
            ctx!.fillStyle = brand;
            ctx!.shadowColor = brand;
            ctx!.shadowBlur = head ? 12 : 0;
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, head ? 2 : 1.25, 0, Math.PI * 2);
            ctx!.fill();
          }
          ctx!.shadowBlur = 0;
        }
      }
      ctx!.globalAlpha = 1;
      last = time;
    }

    function loop(time: number) {
      draw(time, true);
      frame = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(frame);
      if (motion.matches) {
        draw(0, false);
        return;
      }
      if (document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }

    function redrawStatic() {
      if (motion.matches) draw(0, false);
    }

    function onResize() {
      resize();
      if (motion.matches) draw(0, false);
    }

    function onVisibility() {
      if (document.hidden) cancelAnimationFrame(frame);
      else start();
    }

    resize();
    start();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", redrawStatic, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", redrawStatic);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", start);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 size-full"
    />
  );
}
