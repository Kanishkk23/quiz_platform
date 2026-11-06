import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const line = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const Bolt = (p: P) => (
  <svg {...line} fill="currentColor" stroke="none" {...p}>
    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z" />
  </svg>
);
export const CheckCircle = (p: P) => (
  <svg {...line} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.4 3 3 5-6" />
  </svg>
);
export const Sparkle = (p: P) => (
  <svg {...line} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </svg>
);
export const Hourglass = (p: P) => (
  <svg {...line} {...p}>
    <path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />
  </svg>
);
export const Trophy = (p: P) => (
  <svg {...line} {...p}>
    <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4" />
  </svg>
);
export const Reset = (p: P) => (
  <svg {...line} {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
  </svg>
);
export const Clock = (p: P) => (
  <svg {...line} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const Arrow = (p: P) => (
  <svg {...line} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const Cross = (p: P) => (
  <svg {...line} strokeWidth={2.6} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const Check = (p: P) => (
  <svg {...line} strokeWidth={2.8} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
