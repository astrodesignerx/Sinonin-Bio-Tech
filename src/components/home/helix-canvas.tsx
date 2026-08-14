"use client";

import { useEffect, useRef } from "react";
import { ALPHA_HELIX, HELIX_STYLE } from "@/lib/helix";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";

/*
  Alpha helix ribbon on a 2D canvas.

  Same approach as the molecule next to it, for the same reason: a few hundred
  filled quads cost far less than raymarching a surface, and at this size a
  marched isosurface would not look any better. Depth is painter's algorithm,
  segments sorted back to front, which is all a single self-occluding coil
  needs to read correctly.

  The ribbon is built from a moving frame along the helix. At each residue the
  tangent says which way the chain is heading and the radial says which way is
  out from the axis; their cross product gives the direction the flat of the
  ribbon lies in. Offsetting each point along that by half the ribbon width is
  what makes the face turn as the coil turns, instead of a flat band bent into
  a spiral.

  Entrance: the ribbon draws on from one end, so it folds rather than appears.
  Under `prefers-reduced-motion` it paints one folded frame and never loops.
*/

/** Camera distance for the perspective divide, in the same units as the model. */
const DEPTH = 60;
/** Half-width of the ambient yaw wobble, radians. */
const YAW_MAX = 0.30;
/** How far the pointer can add on top of that. */
const YAW_REACH = 0.28;
const PITCH_REACH = 0.18;
/** Per-frame approach toward the pointer. */
const EASE = 0.06;
/** Kept between the drawing and the canvas edge, px. */
const EDGE_PAD = 1;
/** Seconds for the ribbon to draw itself on. */
const FOLD_S = 1.4;
/** Samples per residue. Higher is smoother and costs a quad each. */
const STEPS = 6;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

type Vec = { x: number; y: number; z: number };

const norm = (v: Vec): Vec => {
  const m = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / m, y: v.y / m, z: v.z / m };
};
const cross = (a: Vec, b: Vec): Vec => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** #rrggbb to [r,g,b]. */
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function HelixCanvas({
  className = "",
  label,
  speed = 1,
  interactive = false,
}: {
  className?: string;
  /*
    Description for assistive tech. Omit when the helix is decoration inside an
    element that already has an accessible name, such as a card that is itself
    a link.
  */
  label?: string;
  /** Multiplier on the rotation rate. */
  speed?: number;
  /** Let the pointer turn it while over the host element. */
  interactive?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { residuesPerTurn, risePerResidue, radius, ribbonWidth, residues } =
      ALPHA_HELIX;
    const near = rgb(HELIX_STYLE.near);
    const far = rgb(HELIX_STYLE.far);

    const turn = (2 * Math.PI) / residuesPerTurn;
    const length = residues * risePerResidue;
    const half = length / 2;

    /*
      One rung of the ribbon: the centre of the backbone at this residue, and
      the two edges of the flat of the ribbon either side of it.
    */
    const rung = (i: number) => {
      const theta = i * turn;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const p: Vec = { x: i * risePerResidue - half, y: radius * c, z: radius * s };
      // Tangent: how the point moves as the chain advances.
      const t = norm({
        x: risePerResidue,
        y: -radius * s * turn,
        z: radius * c * turn,
      });
      // Radial: straight out from the axis.
      const n: Vec = { x: 0, y: c, z: s };
      // The flat of the ribbon lies along this.
      const b = norm(cross(t, n));
      const w = ribbonWidth / 2;
      return {
        a: { x: p.x + b.x * w, y: p.y + b.y * w, z: p.z + b.z * w },
        b: { x: p.x - b.x * w, y: p.y - b.y * w, z: p.z - b.z * w },
        n,
      };
    };

    const rungs = Array.from({ length: residues * STEPS + 1 }, (_, k) =>
      rung(k / STEPS),
    );

    const spin = (v: Vec, roll: number, yaw: number, pitch: number): Vec => {
      // Roll about the helix axis.
      const y1 = v.y * Math.cos(roll) - v.z * Math.sin(roll);
      const z1 = v.y * Math.sin(roll) + v.z * Math.cos(roll);
      // Yaw about the vertical.
      const x2 = v.x * Math.cos(yaw) + z1 * Math.sin(yaw);
      const z2 = -v.x * Math.sin(yaw) + z1 * Math.cos(yaw);
      // Pitch about the screen horizontal.
      const y3 = y1 * Math.cos(pitch) - z2 * Math.sin(pitch);
      const z3 = y1 * Math.sin(pitch) + z2 * Math.cos(pitch);
      return { x: x2, y: y3, z: z3 };
    };

    /*
      Worst-case reach from the centre per unit of scale, sampled over every
      rotation the thing can reach. Same lesson as the molecule: sizing on the
      path alone ignores the perspective enlargement of whichever side has
      swung toward the viewer, and the drawing then overhangs its own box.
    */
    const yawLimit = YAW_MAX + (interactive ? YAW_REACH : 0);
    const pitchLimit = interactive ? PITCH_REACH : 0;
    let fitX = 1e-3;
    let fitY = 1e-3;
    for (let i = 0; i < 24; i++) {
      const roll = (i / 24) * Math.PI * 2;
      for (let j = 0; j <= 6; j++) {
        const yaw = -yawLimit + (j / 6) * 2 * yawLimit;
        for (let k = 0; k <= 4; k++) {
          const pitch =
            pitchLimit === 0 ? 0 : -pitchLimit + (k / 4) * 2 * pitchLimit;
          for (const r of rungs) {
            for (const e of [r.a, r.b]) {
              const p = spin(e, roll, yaw, pitch);
              const sc = DEPTH / (DEPTH - p.z);
              fitX = Math.max(fitX, Math.abs(p.x) * sc);
              fitY = Math.max(fitY, Math.abs(p.y) * sc);
            }
          }
          if (pitchLimit === 0) break;
        }
      }
    }

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

    const draw = (t: number, tiltX = 0, tiltY = 0) => {
      ctx.clearRect(0, 0, w, h);
      if (!w || !h) return;

      const unit = Math.min((w / 2 - EDGE_PAD) / fitX, (h / 2 - EDGE_PAD) / fitY);
      const roll = t * 0.5 * speed;
      const yaw = Math.sin(t * 0.19 * speed) * YAW_MAX + tiltX * YAW_REACH;
      const pitch = tiltY * PITCH_REACH;

      const project = (v: Vec) => {
        const p = spin(v, roll, yaw, pitch);
        const sc = DEPTH / (DEPTH - p.z);
        return { x: w / 2 + p.x * unit * sc, y: h / 2 + p.y * unit * sc, z: p.z };
      };

      const pts = rungs.map((r) => ({
        a: project(r.a),
        b: project(r.b),
        n: spin(r.n, roll, yaw, pitch),
      }));

      // How much of the chain has folded in so far.
      const grown = Math.max(0, Math.min(1, t / FOLD_S));
      const upto = Math.max(1, Math.floor(easeOut(grown) * (pts.length - 1)));

      const segments = [];
      for (let i = 0; i < upto; i++) {
        segments.push({ i, z: (pts[i].a.z + pts[i].b.z + pts[i + 1].a.z + pts[i + 1].b.z) / 4 });
      }
      segments.sort((m, n) => m.z - n.z);

      const zSpan = radius * 2 || 1;
      ctx.lineJoin = "round";

      for (const seg of segments) {
        const p0 = pts[seg.i];
        const p1 = pts[seg.i + 1];

        // Depth 0 at the far side of the coil, 1 at the near side.
        const depth = Math.min(1, Math.max(0, (seg.z + zSpan / 2) / zSpan));
        // A ribbon turned edge-on catches less light than one facing out.
        const facing = Math.abs((p0.n.z + p1.n.z) / 2);
        const lit = Math.min(1, depth * 0.75 + facing * 0.35);

        ctx.beginPath();
        ctx.moveTo(p0.a.x, p0.a.y);
        ctx.lineTo(p1.a.x, p1.a.y);
        ctx.lineTo(p1.b.x, p1.b.y);
        ctx.lineTo(p0.b.x, p0.b.y);
        ctx.closePath();
        ctx.fillStyle = `rgb(${Math.round(mix(far[0], near[0], lit))},${Math.round(
          mix(far[1], near[1], lit),
        )},${Math.round(mix(far[2], near[2], lit))})`;
        ctx.fill();

        // Edge lines, faint, only on the near side where they read as contour.
        if (depth > 0.5) {
          ctx.strokeStyle = HELIX_STYLE.edge;
          ctx.globalAlpha = (depth - 0.5) * 0.5;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p0.a.x, p0.a.y);
          ctx.lineTo(p1.a.x, p1.a.y);
          ctx.moveTo(p0.b.x, p0.b.y);
          ctx.lineTo(p1.b.x, p1.b.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    };

    resize();

    if (reduced) {
      draw(FOLD_S * 2);
      const roStatic = new ResizeObserver(() => {
        resize();
        draw(FOLD_S * 2);
      });
      roStatic.observe(canvas);
      return () => roStatic.disconnect();
    }

    let raf = 0;
    let start: number | null = null;
    let running = false;
    /*
      Seeded past the fold so every paint that happens before the loop starts
      shows a finished helix, not the first frame of its entrance.

      The loop only starts once the card is on screen, so the fold still plays
      on arrival; this is about what is on the canvas in the meantime. Painting
      t=0 there meant a single segment, and if anything kept the loop from ever
      running the card was left with a three-pixel smudge instead of a helix.
      The loop overwrites this on its first frame.
    */
    let lastT = FOLD_S * 2;

    const host = (canvas.closest("[data-helix-host]") as HTMLElement) ?? canvas;
    const target = { x: 0, y: 0 };
    const tilt = { x: 0, y: 0 };

    draw(lastT);
    const settle = requestAnimationFrame(() => {
      resize();
      draw(lastT, tilt.x, tilt.y);
    });
    /*
      Always redraw after resizing, never only when the loop is stopped.
      Reassigning the canvas size clears it and resize observations land before
      paint, so a resize without a draw shows one empty frame.
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
    // See molecule-canvas: the dependency is what stops the loop if the
    // preference is turned on after the page has loaded.
  }, [speed, interactive, reduced]);

  return (
    <canvas
      ref={ref}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={`h-full w-full ${className}`}
    />
  );
}
