"use client";

import { useState } from "react";
import styles from "./EmotionCards.module.css";
import { EMOTIONS, faceSvg } from "@/lib/emotions";
import { FACES2, faceSvg2, type FaceStyle } from "@/lib/emotionFaces2";

type SetId = "round" | FaceStyle;
const SETS: { id: SetId; name: string }[] = [
  { id: "round", name: "동그라미" },
  { id: "boy", name: "남자 어린이" },
  { id: "girl", name: "여자 어린이" },
  { id: "cat", name: "고양이" },
];

function render(set: SetId, i: number) {
  return set === "round" ? faceSvg(EMOTIONS[i]) : faceSvg2(FACES2[i], undefined, set);
}

function Face({ i, set }: { i: number; set: SetId }) {
  return <span dangerouslySetInnerHTML={{ __html: render(set, i) }} />;
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
  const [set, setSet] = useState<SetId>("round");
  const cur = sel === null ? null : EMOTIONS[sel];

  return (
    <div className={styles.wrap}>
      <div className={styles.big} aria-live="polite">
        {cur ? (
          <>
            <span className={styles.bigPic}><Face i={sel as number} set={set} /></span>
            <span className={styles.bigName}>{cur.name}</span>
            <span className={styles.tip}>{cur.tip}</span>
          </>
        ) : (
          <span className={styles.ask}>지금 기분은 어때요?</span>
        )}
      </div>

      <div className={styles.sets} role="group" aria-label="그림 종류">
        {SETS.map((x) => (
          <button
            key={x.id}
            type="button"
            className={`${styles.setBtn} ${set === x.id ? styles.setOn : ""}`}
            aria-pressed={set === x.id}
            onClick={() => setSet(x.id)}
          >
            {x.name}
          </button>
        ))}
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
            <span className={styles.pic}><Face i={i} set={set} /></span>
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
