import React from "react";

interface QuizoraLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const BUBBLE =
  "M30 6H66A22 22 0 0 1 88 28V56A22 22 0 0 1 66 78H42L16 94L22 78H30A22 22 0 0 1 8 56V28A22 22 0 0 1 30 6Z";

export function QuizoraLogo({ className = "h-11 w-auto", ...props }: QuizoraLogoProps) {
  return (
    <svg
      viewBox="0 0 400 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="quizora-B logo"
      {...props}
    >
      {/* Speech bubble with hard shadow */}
      <path d={BUBBLE} transform="translate(4 4)" fill="#0F3D2E" />
      <path d={BUBBLE} fill="#FFE94A" stroke="#0F3D2E" strokeWidth="3.5" strokeLinejoin="round" />

      {/* Q whose tail is a checkmark */}
      <circle cx="46" cy="40" r="17" stroke="#0F3D2E" strokeWidth="8" />
      <path
        d="M50 46L60 56L78 32"
        stroke="#0F3D2E"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Wordmark */}
      <text
        x="112"
        y="66"
        fontFamily="var(--font-display), 'Arial Black', system-ui, sans-serif"
        fontSize="52"
        fontWeight="800"
        letterSpacing="-2"
        textLength="196"
        lengthAdjust="spacingAndGlyphs"
        fill="#0F3D2E"
      >
        quizora
      </text>

      {/* "-B" sticker */}
      <g transform="rotate(-5 354 53)">
        <rect x="326" y="36" width="56" height="34" rx="8" transform="translate(3 3)" fill="#0F3D2E" />
        <rect x="326" y="36" width="56" height="34" rx="8" fill="#FFE94A" stroke="#0F3D2E" strokeWidth="3" />
        <text
          x="354"
          y="60"
          textAnchor="middle"
          fontFamily="var(--font-mono), ui-monospace, monospace"
          fontSize="22"
          fontWeight="700"
          fill="#0F3D2E"
        >
          -B
        </text>
      </g>
    </svg>
  );
}