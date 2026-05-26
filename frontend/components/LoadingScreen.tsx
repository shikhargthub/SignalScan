"use client";

import styles from "./LoadingScreen.module.css";

interface LoadingScreenProps {
  messages: string[];
  activeIndex: number;
}

export default function LoadingScreen({ messages, activeIndex }: LoadingScreenProps) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-label={messages[activeIndex]}>
      <div className={styles.spinnerWrap} aria-hidden="true">
        <div className={styles.outer} />
        <div className={styles.inner} />
      </div>
      <div className={styles.msg}>{messages[activeIndex]}</div>
      <div className={styles.steps} aria-hidden="true">
        {messages.map((_, i) => (
          <div key={i} className={`${styles.step} ${i <= activeIndex ? styles.on : ""}`} />
        ))}
      </div>
      <div className={styles.hint}>Analyzing structure, DOM, and signal density</div>
    </div>
  );
}
