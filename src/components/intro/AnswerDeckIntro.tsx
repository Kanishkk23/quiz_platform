import QuizoraMark from "./QuizoraMark";
import styles from "./AnswerDeckIntro.module.css";

/**
 * Option 1 — "Answer Deck"
 * Four answer cards fly in through 3D space, the right one gets picked,
 * the rest fall away and the winner morphs into the Quizora logo.
 */
const CARDS = [
  { letter: "A", text: '"null"' },
  { letter: "B", text: '"object"', picked: true },
  { letter: "C", text: '"undefined"' },
  { letter: "D", text: '"boolean"' },
];

const WORDMARK = "quizora".split("");

export default function AnswerDeckIntro({ logoSrc }: { logoSrc?: string }) {
  return (
    <div className={styles.stage}>
      <div className={styles.floor} />
      <div className={styles.grain} />

      <div className={styles.persp}>
        <div className={styles.scene}>
          {CARDS.map((c, i) => (
            <div
              key={c.letter}
              className={`${styles.card} ${styles[`c${i}`]} ${
                c.picked ? styles.picked : styles.fall
              }`}
            >
              <div className={styles.face}>
                <div className={styles.content}>
                  <span className={styles.badge}>{c.letter}</span>
                  <span className={styles.text}>{c.text}</span>
                  {c.picked && (
                    <svg
                      className={styles.tick}
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
                      <path
                        d="M7.8 12.4l3 3 5.4-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* logo takes over from the picked card */}
          <div className={styles.pulse} />
          <QuizoraMark src={logoSrc} size={132} className={styles.logo} />

          <div className={styles.xp}>+100 XP</div>

          <div className={styles.brand}>
            <div className={styles.wmClip}>
              <span className={styles.wm} aria-label="quizora">
                {WORDMARK.map((ch, i) => (
                  <span key={i} style={{ ["--i" as string]: i }}>
                    {ch}
                  </span>
                ))}
              </span>
            </div>
            <div className={styles.chip}>
              <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                <path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H12L13 2z" fill="currentColor" />
              </svg>
              Live Competitive Quiz Arena
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
