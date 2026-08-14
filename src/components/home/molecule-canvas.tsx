"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import {
  E2D_ATOMS,
  E2D_BONDS,
  ELEMENT_STYLE,
  type Atom,
  type Bond,
} from "@/lib/molecules";

/*
  Ball-and-stick molecule on a 2D canvas.

  Canvas 2D rather than WebGL on purpose. A raymarched SDF was the obvious
  match for the cells backdrop, but for twelve spheres and twelve sticks it is
  the wrong tool: raymarching pays per pixel, this pays per atom. Two dozen
  draw calls a frame runs anywhere, needs no GPU context, and gives crisper
  spheres than a marched isosurface would.

  Depth is painter's algorithm: sort by z, draw far to near, scale radius and
  bond width by perspective. Enough at this size, and it costs nothing.

  Entrance: atoms travel in from a scattered cloud and settle, so the molecule
  assembles rather than appears. Under `prefers-reduced-motion` it draws one
  assembled frame and never starts a loop.
*/

type Projected = { x: number; y: number; z: number; scale: number };

/** Deterministic scatter, so the assembly looks the same on every load. */
function scatterOf(i: number): [number, number, number] {
  const f = (n: number) => {
    const v = Math.sin(n) * 43758.5453;
    return (v - Math.floor(v)) * 2 - 1;
  };
  return [f(i * 12.9898) * 9, f(i * 78.233) * 7, f(i * 39.425) * 7];
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Camera distance for the perspective divide, in model units. */
const DEPTH = 16;

/** Half-width of the ambient yaw wobble, in radians. */
const YAW_MAX = 0.45;

/*
  How far the pointer can turn the molecule, on top of the ambient wobble.
  Deliberately small. This sits on a card the visitor is trying to read, and a
  molecule that swings hard at the cursor stops being texture and becomes a
  toy; it should feel like the thing noticed you, not like it is chasing you.
*/
const YAW_REACH = 0.35;
const PITCH_REACH = 0.22;

/*
  Per-frame approach rate toward the pointer. Low enough that the molecule
  glides rather than tracks, which also means a fast cursor crossing the card
  never makes it jerk.
*/
const EASE = 0.06;

/*
  Breathing room kept between the drawing and the canvas edge. One pixel is
  enough: the reach below is exact, so this only absorbs rounding.
*/
const EDGE_PAD = 1;

export default function MoleculeCanvas({
  atoms = E2D_ATOMS,
  bonds = E2D_BONDS,
  className = "",
  label,
  speed = 1,
  interactive = false,
}: {
  atoms?: Atom[];
  bonds?: Bond[];
  className?: string;
  /*
    Description for assistive tech. Omit when the molecule is decoration
    inside an element that already has an accessible name, such as a card
    that is itself a link: a second label there is noise, not information.
  */
  label?: string;
  /** Multiplier on the rotation rate. Below 1 for background use. */
  speed?: number;
  /*
    Let the pointer turn the molecule while it is over the host element, the
    nearest ancestor marked `data-molecule-host` (the canvas itself if there
    is none). Ignored under `prefers-reduced-motion`.
  */
  interactive?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Centre the model so it rotates about itself, not about the origin.
    const mid = (k: "x" | "y" | "z") =>
      atoms.reduce((n, a) => n + a[k], 0) / atoms.length;
    const cx = mid("x");
    const cy = mid("y");
    const cz = mid("z");
    const model = atoms.map((a) => ({
      ...a,
      x: a.x - cx,
      y: a.y - cy,
      z: a.z - cz,
    }));
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /*
      Rotation is a roll about the chain's own long axis, with only a gentle
      yaw wobble. A full yaw spin would swing this molecule edge-on twice a
      turn and collapse a ten-carbon chain to nearly a point; rolling keeps it
      extended and legible throughout, and it is the roll that shows the
      epoxide oxygen orbiting the C4-C5 bond, which is the interesting part.
    */
    const orient = (
      a: { x: number; y: number; z: number },
      roll: number,
      yaw: number,
      pitch: number,
    ) => {
      // Roll about the chain's own long axis.
      const y1 = a.y * Math.cos(roll) - a.z * Math.sin(roll);
      const z1 = a.y * Math.sin(roll) + a.z * Math.cos(roll);
      // Yaw about the vertical.
      const x2 = a.x * Math.cos(yaw) + z1 * Math.sin(yaw);
      const z2 = -a.x * Math.sin(yaw) + z1 * Math.cos(yaw);
      // Pitch about the screen horizontal, so it can nod toward the cursor.
      const y3 = y1 * Math.cos(pitch) - z2 * Math.sin(pitch);
      const z3 = y1 * Math.sin(pitch) + z2 * Math.cos(pitch);
      return { x: x2, y: y3, z: z3, scale: DEPTH / (DEPTH - z3) };
    };

    const project = (
      a: { x: number; y: number; z: number },
      roll: number,
      yaw: number,
      pitch: number,
      unit: number,
    ): Projected => {
      const o = orient(a, roll, yaw, pitch);
      return {
        x: w / 2 + o.x * unit * o.scale,
        y: h / 2 + o.y * unit * o.scale,
        z: o.z,
        scale: o.scale,
      };
    };

    /*
      How far the drawing reaches from the centre per unit of scale, at the
      worst point of the rotation.

      Sizing on the span of the atom centres, which is what this did before,
      is not the same question as how much room the drawing needs. Two things
      sit outside the centres: perspective, which enlarges whichever end has
      swung toward the viewer, and the radius of the sphere drawn at each
      centre. Both are proportional to the scale, so they can be folded into a
      single reach measured once and divided into the box.

      Sampled over the whole roll and the full extent of the yaw and pitch the
      molecule can ever reach, rather than solved, because the worst case is
      cheap to find by brute force at twelve atoms and only has to be found
      once per mount. Sampling the pointer's range too is what stops the
      molecule from growing out of its box when someone drives it to a corner.
    */
    const yawLimit = YAW_MAX + (interactive ? YAW_REACH : 0);
    const pitchLimit = interactive ? PITCH_REACH : 0;
    let fitX = 1e-3;
    let fitY = 1e-3;
    for (let i = 0; i < 48; i++) {
      const roll = (i / 48) * Math.PI * 2;
      for (let j = 0; j <= 8; j++) {
        const yaw = -yawLimit + (j / 8) * 2 * yawLimit;
        for (let k = 0; k <= 4; k++) {
          const pitch = pitchLimit === 0 ? 0 : -pitchLimit + (k / 4) * 2 * pitchLimit;
          for (const a of model) {
            const o = orient(a, roll, yaw, pitch);
            const r = ELEMENT_STYLE[a.el].r;
            fitX = Math.max(fitX, o.scale * (Math.abs(o.x) + r));
            fitY = Math.max(fitY, o.scale * (Math.abs(o.y) + r));
          }
          if (pitchLimit === 0) break;
        }
      }
    }

    const draw = (t: number, tiltX = 0, tiltY = 0) => {
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;

      /*
        Largest scale at which the worst-case reach still lands inside the box,
        on both axes. Whichever axis runs out first is the one that decides.
      */
      const unit = Math.min((w / 2 - EDGE_PAD) / fitX, (h / 2 - EDGE_PAD) / fitY);
      const roll = t * 0.45 * speed;
      const yaw = Math.sin(t * 0.16 * speed) * YAW_MAX + tiltX * YAW_REACH;
      const pitch = tiltY * PITCH_REACH;

      const k = easeOut(Math.min(1, t / 1.6));

      const pts = model.map((a, i) => {
        const [sx, sy, sz] = scatterOf(i + 1);
        return project(
          {
            x: a.x + sx * (1 - k),
            y: a.y + sy * (1 - k),
            z: a.z + sz * (1 - k),
          },
          roll,
          yaw,
          pitch,
          unit,
        );
      });

      // Bonds behind atoms, far to near.
      const ordered = [...bonds].sort(
        (m, n) => (pts[m.a].z + pts[m.b].z) / 2 - (pts[n.a].z + pts[n.b].z) / 2,
      );

      ctx.lineCap = "round";
      ctx.strokeStyle = "#5b6b82";
      // Sticks only appear once the atoms are near their seats.
      const bondAlpha = Math.max(0, (k - 0.55) / 0.45) * 0.9;

      for (const bond of ordered) {
        const p = pts[bond.a];
        const q = pts[bond.b];
        const width = Math.max(1, unit * 0.15 * ((p.scale + q.scale) / 2));
        ctx.globalAlpha = bondAlpha;

        if (bond.order === 2) {
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const len = Math.hypot(dx, dy) || 1;
          const ox = (-dy / len) * width * 0.55;
          const oy = (dx / len) * width * 0.55;
          ctx.lineWidth = width * 0.5;
          for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(p.x + ox * s, p.y + oy * s);
            ctx.lineTo(q.x + ox * s, q.y + oy * s);
            ctx.stroke();
          }
        } else {
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;

      const byDepth = model
        .map((a, i) => ({ a, i }))
        .sort((m, n) => pts[m.i].z - pts[n.i].z);

      for (const { a, i } of byDepth) {
        const p = pts[i];
        const style = ELEMENT_STYLE[a.el];
        const r = Math.max(1, style.r * unit * p.scale);

        // Lit from upper-left so the spheres read round rather than flat.
        const g = ctx.createRadialGradient(
          p.x - r * 0.35,
          p.y - r * 0.4,
          r * 0.1,
          p.x,
          p.y,
          r,
        );
        g.addColorStop(0, style.core);
        g.addColorStop(1, style.rim);

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        if (p.z > -0.5) {
          ctx.beginPath();
          ctx.arc(p.x - r * 0.34, p.y - r * 0.38, r * 0.19, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.fill();
        }
      }
    };

    resize();

    if (reduced) {
      draw(2.4);
      const ro = new ResizeObserver(() => {
        resize();
        draw(2.4);
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    let raf = 0;
    let start: number | null = null;
    let running = false;
    // Where the animation had got to, so any redraw can resume from it.
    let lastT = 0;

    /*
      Pointer tracking is read off `window` rather than the card, because the
      molecule and everything around it is `pointer-events-none` so the card
      could not report a hover without becoming a click target for it. The
      rect test does the same job without touching hit testing.

      `target` is where the cursor says to be, `tilt` is where the molecule
      actually is; easing between them each frame is what makes it drift
      rather than snap, and it returns to neutral on its own once the pointer
      leaves the card.

      Declared above the observers below, which read `tilt` when they redraw.
    */
    const host = (canvas.closest("[data-molecule-host]") as HTMLElement) ?? canvas;
    const target = { x: 0, y: 0 };
    const tilt = { x: 0, y: 0 };

    /*
      Paint the first frame straight away and re-measure after layout. The loop
      below waits on the IntersectionObserver, and measuring inside the effect
      can catch the canvas before it has a width; together those left a 1x1
      buffer that never drew anything. The ResizeObserver then keeps the buffer
      correct if the card is still settling or the window changes.
    */
    draw(0);
    const settle = requestAnimationFrame(() => {
      resize();
      draw(lastT, tilt.x, tilt.y);
    });
    /*
      Always redraw, not only when the loop is stopped. Reassigning the canvas
      size clears it, and resize observations land after layout but before
      paint, so resizing without drawing puts one empty frame on screen. At
      `lastT` rather than 0 so a mid-flight rotation is not snapped back to the
      entrance.
    */
    const ro = new ResizeObserver(() => {
      resize();
      draw(lastT, tilt.x, tilt.y);
    });
    ro.observe(canvas);

    const onPointerMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      ) {
        target.x = 0;
        target.y = 0;
        return;
      }
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };

    if (interactive) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    const frame = (now: number) => {
      start ??= now;
      resize();
      tilt.x += (target.x - tilt.x) * EASE;
      tilt.y += (target.y - tilt.y) * EASE;
      lastT = (now - start) / 1000;
      draw(lastT, tilt.x, tilt.y);
      raf = requestAnimationFrame(frame);
    };

    const setRunning = (next: boolean) => {
      if (next === running) return;
      running = next;
      if (next) raf = requestAnimationFrame(frame);
      else cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting && !document.hidden),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => setRunning(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(settle);
    };
    /*
      `reduced` is a dependency so that turning the preference on mid-session
      tears the loop down and repaints the assembled frame, rather than leaving
      whatever was decided at mount running for the rest of the visit.
    */
  }, [atoms, bonds, speed, interactive, reduced]);

  return (
    <canvas
      ref={ref}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={`h-full w-full ${className}`}
    />
  );
}
