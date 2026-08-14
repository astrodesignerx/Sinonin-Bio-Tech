import { Fragment } from "react";

/*
  Splits a sentence into per-word spans that lift and settle left to right on
  hover of an ancestor marked `group`.

  No JavaScript: the delay is a static inline style and the motion is a CSS
  transition, so this stays a server component. Delays are capped so a long
  sentence still finishes promptly instead of trailing for a second and a half.

  Spaces are emitted as their own text nodes rather than being tucked inside
  each span: trailing whitespace inside an inline-block is trimmed, which would
  run every word together.
*/
export default function StaggerWords({
  text,
  step = 15,
  maxSteps = 14,
  className = "",
}: {
  text: string;
  step?: number;
  maxSteps?: number;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span
            className="inline-block transition-transform motion-quick group-hover:-translate-y-0.5"
            style={{ transitionDelay: `${Math.min(i, maxSteps) * step}ms` }}
          >
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
