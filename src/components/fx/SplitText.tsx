import type { CSSProperties } from "react";

/** Renders text letter by letter so each character can animate in. */
export function SplitText({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((char, i) => (
          <span
            key={i}
            className="qz-char"
            style={{ "--i": i, "--d": `${delay}ms` } as CSSProperties}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </span>
  );
}