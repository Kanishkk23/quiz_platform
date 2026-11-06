import s from "./landing.module.css";

/** Study Lab backdrop (graph paper comes from CSS): pencil, lightbulb, flask, sticky note, scribbles. */
const F = "#0f3d2e";
const Y = "#ffe94a";
const P = "#fffdf5";
const BAD = "#e5484d";

export default function Backdrop() {
  return (
    <div className={s.backdrop} aria-hidden="true">
      <svg className={`${s.art} ${s.deco}`} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        {/* pencil, top right behind the card */}
        <g transform="translate(1170 110) rotate(38)">
          <g className={`${s.bob} ${s.d2}`}>
            <rect x="0" y="-18" width="250" height="36" fill={Y} stroke={F} strokeWidth="4" />
            <line x1="0" y1="-6" x2="250" y2="-6" stroke={F} strokeWidth="2" opacity=".35" />
            <line x1="0" y1="6" x2="250" y2="6" stroke={F} strokeWidth="2" opacity=".35" />
            <rect x="-34" y="-18" width="34" height="36" rx="6" fill={BAD} stroke={F} strokeWidth="4" />
            <rect x="0" y="-18" width="14" height="36" fill="#d9d3b8" stroke={F} strokeWidth="4" />
            <path d="M250 -18 L318 0 L250 18Z" fill="#f2d9a8" stroke={F} strokeWidth="4" strokeLinejoin="round" />
            <path d="M296 -6 L318 0 L296 6Z" fill={F} />
          </g>
        </g>

        {/* lightbulb */}
        <g transform="translate(742 150) rotate(-8)">
          <g className={`${s.bob} ${s.d1}`}>
            {[-70, -40, -10, 20, 50].map((a, i) => (
              <line key={i} x1="0" y1="-58" x2="0" y2="-80" stroke={F} strokeWidth="5" strokeLinecap="round" transform={`rotate(${a + 20})`} />
            ))}
            <path d="M0 -44 a34 34 0 0 0 -20 62 v14 h40 v-14 a34 34 0 0 0 -20 -62Z" fill={Y} stroke={F} strokeWidth="5" strokeLinejoin="round" />
            <path d="M-14 38 h28 M-12 50 h24" stroke={F} strokeWidth="5" strokeLinecap="round" />
            <path d="M-6 8 l6 -10 l6 10 l-6 12" fill="none" stroke={F} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>

        {/* sticky note */}
        <g transform="translate(1110 838) rotate(4)">
          <g className={`${s.bob} ${s.d3}`}>
            <rect x="-86" y="-52" width="172" height="104" fill={P} stroke={F} strokeWidth="3.5" />
            <rect x="-86" y="-52" width="172" height="20" fill={Y} stroke={F} strokeWidth="3.5" />
            <text x="0" y="14" textAnchor="middle" fontSize="34" className={s.hand} fill={F}>no peeking!</text>
            <path d="M-50 30 q 25 -10 50 0 t 50 0" fill="none" stroke={BAD} strokeWidth="3.5" strokeLinecap="round" />
          </g>
        </g>

        {/* flask */}
        <g transform="translate(62 806) rotate(-10)">
          <g className={`${s.bob} ${s.d4}`}>
            <path d="M-14 -50 h28 v32 l36 62 a10 10 0 0 1 -9 15 h-82 a10 10 0 0 1 -9 -15 l36 -62Z" fill={P} stroke={F} strokeWidth="5" strokeLinejoin="round" />
            <path d="M-38 24 h76 l14 24 a6 6 0 0 1 -5 9 h-94 a6 6 0 0 1 -5 -9Z" fill={Y} stroke={F} strokeWidth="4" strokeLinejoin="round" />
            <circle cx="-6" cy="8" r="5" fill="none" stroke={F} strokeWidth="3.5" />
            <circle cx="12" cy="-2" r="3.5" fill="none" stroke={F} strokeWidth="3" />
            <path d="M-20 -50 h40" stroke={F} strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>

        {/* ruler along the left edge */}
        <g transform="translate(18 380) rotate(90)">
          <rect x="0" y="-22" width="300" height="44" fill={Y} stroke={F} strokeWidth="4" opacity=".95" />
          {Array.from({ length: 31 }, (_, i) => (
            <line key={i} x1={i * 10} y1="-22" x2={i * 10} y2={i % 5 === 0 ? -4 : -12} stroke={F} strokeWidth="2.5" />
          ))}
        </g>

        {/* scribbles */}
        <text x="470" y="880" fontSize="44" className={s.hand} fill={F} opacity=".7">x² + y² = r²</text>
        <path d="M1390 480 q 20 -24 40 0 t 40 0" fill="none" stroke={BAD} strokeWidth="5" strokeLinecap="round" />
        <path d="M120 70 l12 -12 M120 58 l12 12" stroke={F} strokeWidth="4" strokeLinecap="round" />
        <path d="M900 70 l0 22 M889 81 l22 0" stroke={F} strokeWidth="4" strokeLinecap="round" />
        <path d="M1405 770 l0 22 M1394 781 l22 0" stroke={BAD} strokeWidth="4" strokeLinecap="round" />
        <circle cx="800" cy="860" r="8" fill={Y} stroke={F} strokeWidth="3" />
        <circle cx="260" cy="870" r="6" fill={Y} stroke={F} strokeWidth="3" />
        {/* big checkmark scribble */}
        <path d="M880 820 l24 26 l52 -66" fill="none" stroke={F} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity=".18" />
      </svg>
    </div>
  );
}
