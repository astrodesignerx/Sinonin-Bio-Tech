"use client";

import { useEffect, useRef } from "react";

/*
  Animated Voronoi "cells" backdrop.

  This is the Vanta CELLS look rebuilt as a single fragment shader. Vanta's
  version of this effect runs on p5.js, which is roughly a megabyte of runtime
  for a decorative background; this is a few hundred lines and no dependency,
  and it takes the site's own palette rather than Vanta's colour options.

  Three things keep it cheap:
  - it renders at a fraction of device resolution (the pattern is soft, so the
    upscale is invisible) with the device pixel ratio capped,
  - it stops entirely when scrolled out of view, and
  - under `prefers-reduced-motion` it paints one static frame and never starts
    a loop at all.

  If WebGL is unavailable the canvas simply stays empty and the section's own
  background shows through, so nothing depends on this rendering.
*/

const VERT = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform float u_scale;
uniform vec3  u_base;
uniform vec3  u_alt;
uniform vec3  u_edge;

out vec4 outColor;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.x *= u_res.x / u_res.y;

  vec2 p  = uv * u_scale;
  vec2 ip = floor(p);
  vec2 fp = fract(p);

  // F1 and F2 are the nearest and second-nearest feature point distances.
  // Their difference is small exactly at a cell boundary, which is what draws
  // the membrane between cells.
  float f1 = 8.0, f2 = 8.0;
  vec2 id = vec2(0.0);

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(ip + g);
      // Each point orbits its cell slowly, on its own phase, so the pattern
      // drifts rather than pulsing in unison.
      o = 0.5 + 0.42 * sin(u_time * 0.22 + 6.2831 * o);
      vec2 r = g + o - fp;
      float d = dot(r, r);
      if (d < f1) { f2 = f1; f1 = d; id = ip + g; }
      else if (d < f2) { f2 = d; }
    }
  }

  float edge = sqrt(f2) - sqrt(f1);
  vec3 col = mix(u_base, u_alt, hash1(id));
  col = mix(col, u_edge, smoothstep(0.24, 0.0, edge) * 0.9);

  outColor = vec4(col, 1.0);
}`;

/** #rrggbb to linear-ish 0..1 rgb. */
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function CellsCanvas({
  className = "",
  base = "#f7faf5",
  alt = "#dbe8d6",
  edge = "#a4c6aa",
  scale = 3.6,
}: {
  className?: string;
  /** Cell fill, low end. */
  base?: string;
  /** Cell fill, high end. */
  alt?: string;
  /** Membrane colour between cells. */
  edge?: string;
  /** Cell density: higher is more, smaller cells. */
  scale?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      depth: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    gl.uniform1f(gl.getUniformLocation(program, "u_scale"), scale);
    gl.uniform3fv(gl.getUniformLocation(program, "u_base"), rgb(base));
    gl.uniform3fv(gl.getUniformLocation(program, "u_alt"), rgb(alt));
    gl.uniform3fv(gl.getUniformLocation(program, "u_edge"), rgb(edge));

    // The pattern has no hard edges, so rendering well under device resolution
    // costs nothing visually and a great deal less in fill rate.
    const RENDER_SCALE = 0.7;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * RENDER_SCALE;
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const draw = (t: number) => {
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      draw(0);
      const ro = new ResizeObserver(() => {
        resize();
        draw(0);
      });
      ro.observe(canvas);
      return () => ro.disconnect();
    }

    let raf = 0;
    let start: number | null = null;
    let running = false;

    const frame = (now: number) => {
      start ??= now;
      resize();
      draw((now - start) / 1000);
      raf = requestAnimationFrame(frame);
    };

    const setRunning = (next: boolean) => {
      if (next === running) return;
      running = next;
      if (next) raf = requestAnimationFrame(frame);
      else cancelAnimationFrame(raf);
    };

    // Off-screen or backgrounded means no reason to burn frames.
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting && !document.hidden),
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => setRunning(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [base, alt, edge, scale]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`h-full w-full ${className}`}
    />
  );
}
