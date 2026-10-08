"use client";

import { useState } from "react";
import styles from "./EmotionCards.module.css";
import { EMOTIONS, faceSvg } from "@/lib/emotions";

function Face({ i }: { i: number }) {
  return <span dangerouslySetInnerHTML={{ __html: faceSvg(EMOTIONS[i]) }} />;
}

function speak(text: string) {
  try {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    window.speechSynthesis.speak(u);
  } catch {
    // 음성을 못 쓰면 그냥 넘어감
  }
}

export default function EmotionCards() {
  const [sel, setSel] = useState<number | null>(null);
  const cur = sel === null ? null : EMOTIONS[sel];

  return (
    <div className={styles.wrap}>
      <div className={styles.big} aria-live="polite">
        {cur ? (
          <>
            <span className={styles.bigPic}><Face i={sel as number} /></span>
            <span className={styles.bigName}>{cur.name}</span>
            <span className={styles.tip}>{cur.tip}</span>
          </>
        ) : (
          <span className={styles.ask}>지금 기분은 어때요?</span>
        )}
      </div>

      <div className={styles.grid}>
        {EMOTIONS.map((e, i) => (
          <button
            key={e.name}
            type="button"
            className={`${styles.card} ${sel === i ? styles.on : ""}`}
            aria-pressed={sel === i}
            onClick={() => {
              setSel(i);
              speak(e.say);
            }}
          >
            <span className={styles.pic}><Face i={i} /></span>
            <span>{e.name}</span>
          </button>
        ))}
      </div>

      {sel !== null && (
        <button type="button" className="btn btn-outline" onClick={() => setSel(null)}>
          처음으로
        </button>
      )}
    </div>
  );
}
