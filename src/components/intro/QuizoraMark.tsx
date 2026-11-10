import type { CSSProperties } from "react";

type Props = {
  /** Optional path to a custom logo file (e.g. "/logo.svg"). If omitted, the built-in SVG mark is used. */
  src?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

const BUBBLE =
  "M30 6H66A22 22 0 0 1 88 28V56A22 22 0 0 1 66 78H42L16 94L22 78H30A22 22 0 0 1 8 56V28A22 22 0 0 1 30 6Z";

/**
 * Quizora mark: a speech bubble holding a Q whose tail is a checkmark.
 * Pass `src` to use your own image file instead.
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
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      fill="none"
    >
      <path d={BUBBLE} transform="translate(4 4)" fill="#0F3D2E" />
      <path d={BUBBLE} fill="#FFE94A" stroke="#0F3D2E" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="46" cy="40" r="17" stroke="#0F3D2E" strokeWidth="8" />
      <path
        d="M50 46L60 56L78 32"
        stroke="#0F3D2E"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}