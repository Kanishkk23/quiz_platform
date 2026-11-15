const COLORS = ["#FFE94A", "#0F3D2E", "#1F9D6B", "#FFFDF5", "#BDF2D5"];

/** Fires a burst of confetti from a screen position. Call it from any click handler. */
export function fireConfetti(x: number, y: number, count = 28) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("i");
    const size = 6 + Math.random() * 8;
    const round = Math.random() < 0.3;

    Object.assign(piece.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${round ? size : size * 0.5}px`,
      background: COLORS[i % COLORS.length],
      border: "1.5px solid #0F3D2E",
      borderRadius: round ? "50%" : "2px",
      pointerEvents: "none",
      zIndex: "9998",
    });
    document.body.appendChild(piece);

    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 170;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 90;

    const anim = piece.animate(
      [
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy}px) rotate(${Math.random() * 720 - 360}deg)`,
          opacity: 1,
          offset: 0.55,
        },
        {
          transform: `translate(${dx * 1.15}px, ${dy + 160}px) rotate(${Math.random() * 900 - 450}deg)`,
          opacity: 0,
        },
      ],
      { duration: 1100 + Math.random() * 700, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
    );
    anim.onfinish = () => piece.remove();
  }
}