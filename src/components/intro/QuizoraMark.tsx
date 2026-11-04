import type { CSSProperties } from "react";

type Props = {
  /** Optional path to your real logo (e.g. "/logo.svg"). If omitted, the built-in SVG mark is used. */
  src?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * Quizora speech-bubble mark.
 * The inline SVG is a faithful redraw of the logo for the intro.
 * Pass `logoSrc` to <IntroGate /> to use your own file instead.
 */
export default function QuizoraMark({ src, size = 132, className, style }: Props) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{ objectFit: "contain", ...style }}
        draggable={false}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 120 124"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M28 4h64a24 24 0 0 1 24 24v40a24 24 0 0 1-24 24H56L30 118l5-26h-7A24 24 0 0 1 4 68V28A24 24 0 0 1 28 4Z"
        fill="#7f9f70"
      />
      <path
        d="M21 35l5.5 5.5L38 28"
        fill="none"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="45" y="25" width="55" height="19" rx="9.5" fill="#d2570a" />
      <rect x="53" y="32.5" width="39" height="4" rx="2" fill="#1f2a24" />
      <rect x="21" y="55" width="52" height="6.5" rx="3.25" fill="#fff" opacity=".92" />
      <rect x="21" y="69" width="30" height="6.5" rx="3.25" fill="#fff" opacity=".7" />
    </svg>
  );
}
