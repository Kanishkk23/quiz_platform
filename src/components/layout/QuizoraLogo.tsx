import React from "react";

interface QuizoraLogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function QuizoraLogo({ className = "h-11 w-auto", ...props }: QuizoraLogoProps) {
  return (
    <svg
      viewBox="0 0 330 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="quizora -B logo"
      {...props}
    >
      {/* Speech Bubble Icon in Sage Green (#9CAF88) */}
      <path
        d="M 22 6 C 13.16 6 6 13.16 6 22 L 6 54 C 6 62.84 13.16 70 22 70 L 23 70 L 19 81 L 34 70 L 64 70 C 72.84 70 80 62.84 80 54 L 80 22 C 80 13.16 72.84 6 64 6 Z"
        fill="#9CAF88"
      />

      {/* Row 1: Unselected Option Dot & Line (White) */}
      <circle cx="24" cy="23" r="3.5" fill="#FFFFFF" />
      <rect x="33" y="20" width="31" height="6" rx="3" fill="#FFFFFF" />

      {/* Row 2: Selected Option Pill in Burnt Amber (#CC5500) */}
      <rect x="17" y="30" width="52" height="18" rx="9" fill="#CC5500" />
      {/* White Checkmark */}
      <path
        d="M 23 39 L 26.5 42.5 L 32.5 35"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dark Forest Green text bar inside pill */}
      <rect x="36" y="36.5" width="25" height="5" rx="2.5" fill="#2B3B24" />

      {/* Row 3: Unselected Option Dot & Line (White) */}
      <circle cx="24" cy="55" r="3.5" fill="#FFFFFF" />
      <rect x="33" y="52" width="24" height="6" rx="3" fill="#FFFFFF" />

      {/* Brand Wordmark 'quizora' */}
      <text
        x="96"
        y="55"
        fontFamily="var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="44"
        fontWeight="900"
        letterSpacing="-1.5"
        fill="#2B3B24"
        className="dark:fill-[#EFF2ED]"
      >
        quizora
      </text>

      {/* Project/Track Badge in Concrete Grey (#A7A7A7) */}
      <rect x="262" y="28" width="46" height="28" rx="10" fill="#A7A7A7" />
      <text
        x="285"
        y="48"
        fontFamily="var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="18"
        fontWeight="900"
        textAnchor="middle"
        fill="#2B3B24"
      >
        -B
      </text>
    </svg>
  );
}
