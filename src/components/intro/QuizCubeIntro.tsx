import QuizoraMark from "./QuizoraMark";
import styles from "./QuizCubeIntro.module.css";

/**
 * Option 2 — "Quiz Cube"
 * A countdown ring fills while a 3D cube tumbles through ? A B C D
 * and lands on the green tick. The cube bursts apart and the logo appears.
 */
const WORDMARK = "quizora".split("");

export default function QuizCubeIntro({ logoSrc }: { logoSrc?: string }) {
  return (
    <div className={styles.stage}>
      <div className={styles.grain} />

      <div className={styles.rig}>
        {/* countdown ring */}
        <svg className={styles.ring} viewBox="0 0 440 440" aria-hidden="true">
          <circle className={styles.ticks} cx="220" cy="220" r="212" />
          <circle className={styles.track} cx="220" cy="220" r="200" />
          <circle className={styles.progress} cx="220" cy="220" r="200" />
          <g className={styles.head}>
            <circle cx="220" cy="20" r="7" />
          </g>
        </svg>

        {/* timer chip, same look as the landing preview */}
        <div className={styles.timer}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className={styles.digits}>
            <span>00:0</span>
            <span className={styles.digitWin}>
              <span className={styles.digitCol}>
                <i>3</i>
                <i>2</i>
                <i>1</i>
                <i>0</i>
              </span>
            </span>
          </span>
        </div>

        {/* cube */}
        <div className={styles.shadow} />
        <div className={styles.cubePulse}>
          <div className={styles.cube}>
            <div className={`${styles.face} ${styles.front} ${styles.q}`}>?</div>
            <div className={`${styles.face} ${styles.right}`}>
              <b>A</b>
            </div>
            <div className={`${styles.face} ${styles.back}`}>
              <b>B</b>
            </div>
            <div className={`${styles.face} ${styles.left}`}>
              <b>C</b>
            </div>
            <div className={`${styles.face} ${styles.top}`}>
              <b>D</b>
            </div>
            <div className={`${styles.face} ${styles.bottom} ${styles.ok}`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5.5 12.8l4.2 4.2 8.8-9.6"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className={styles.flash} />

        {/* reveal */}
        <div className={styles.lockup}>
          <div className={styles.logoWrap}>
            <div className={styles.pulse} />
            <QuizoraMark src={logoSrc} size={140} className={styles.logo} />
            <div className={styles.xp}>+100 XP</div>
          </div>
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
            Master Any Topic. Beat the Clock.
          </div>
        </div>
      </div>
    </div>
  );
}
