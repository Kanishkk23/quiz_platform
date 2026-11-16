/**
 * Quizora scroll effect · Option 1 · PAPER RISE
 * Cards, headings and text rise into place and un-tilt like paper lifted off a desk.
 * Plays once per element. Highlight markers wipe in left → right.
 *
 * Tag elements with data-fx="title | text | item | media | mark".
 * Only the CSS `translate`, `rotate`, `opacity` and `clip-path` properties are animated,
 * so any existing `transform` / keyframe animation on an element keeps working.
 * Every inline style and attribute this adds is removed again once the element has landed.
 */
const MODE = "paper";

export function initScrollFx(): () => void {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const root = document.documentElement;
  const vh = window.innerHeight;
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-fx]"));
  const timers = new Set<number>();
  const pending = new Map<HTMLElement, number>(); // parent -> children still hidden
  const order = new Map<HTMLElement, number>(); // index among tagged siblings (stagger)
  const seen = new Map<Element, number>();

  all.forEach((el) => {
    const p = el.parentElement as HTMLElement;
    const n = seen.get(p) ?? 0;
    seen.set(p, n + 1);
    order.set(el, n);
  });

  const land = (el: HTMLElement) => {
    el.removeAttribute("data-fx-state");
    el.style.transitionDelay = "";
    const p = el.parentElement as HTMLElement;
    const left = (pending.get(p) ?? 1) - 1;
    pending.set(p, left);
    if (left <= 0) p.style.perspective = "";
  };

  // Elements still waiting below the fold. (A scroll check is used instead of IntersectionObserver
  // because IntersectionObserver ignores targets whose own clip-path hides them.)
  const waiting = new Set<HTMLElement>();
  let raf = 0;

  const reveal = (el: HTMLElement) => {
    const delay = el.dataset.fx === "mark" ? 480 : Math.min(order.get(el) ?? 0, 5) * 180;
    el.style.transitionDelay = `${delay}ms`;
    el.dataset.fxState = "in";
    const t = window.setTimeout(() => {
      timers.delete(t);
      land(el);
    }, delay + 1850);
    timers.add(t);
  };

  const check = () => {
    raf = 0;
    const limit = window.innerHeight * 0.86;
    waiting.forEach((el) => {
      if (el.getBoundingClientRect().top < limit) {
        waiting.delete(el);
        reveal(el);
      }
    });
    if (!waiting.size) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  };
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(check);
  };

  // Hide only what is still below the fold. Anything already on screen is left alone.
  all.forEach((el) => {
    if (el.getBoundingClientRect().top < vh * 0.92) return;
    const p = el.parentElement as HTMLElement;
    p.style.perspective = "1100px";
    pending.set(p, (pending.get(p) ?? 0) + 1);
    el.dataset.fxState = "hidden";
    waiting.add(el);
  });
  if (waiting.size) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }
  root.dataset.fxMode = MODE;

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    waiting.clear();
    timers.forEach((t) => window.clearTimeout(t));
    timers.clear();
    document.querySelectorAll<HTMLElement>("[data-fx-state]").forEach((el) => {
      el.removeAttribute("data-fx-state");
      el.style.transitionDelay = "";
    });
    pending.forEach((_, p) => (p.style.perspective = ""));
    delete root.dataset.fxMode;
  };
}
