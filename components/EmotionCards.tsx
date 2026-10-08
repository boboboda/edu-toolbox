"use client";

import { useState } from "react";
import styles from "./EmotionCards.module.css";

type Emotion = { emoji: string; name: string; say: string; tip: string };

const EMOTIONS: Emotion[] = [
  { emoji: "😊", name: "기뻐요", say: "나는 기뻐요", tip: "좋은 일이 있어서 웃음이 나요." },
  { emoji: "😢", name: "슬퍼요", say: "나는 슬퍼요", tip: "눈물이 나고 마음이 아파요. 도와 달라고 말해도 돼요." },
  { emoji: "😠", name: "화나요", say: "나는 화가 나요", tip: "숨을 크게 쉬어 봐요. 잠깐 쉬어도 돼요." },
  { emoji: "😨", name: "무서워요", say: "나는 무서워요", tip: "선생님에게 말해요. 안전한 곳에 있어요." },
  { emoji: "😴", name: "졸려요", say: "나는 졸려요", tip: "몸이 피곤해요. 쉬고 싶다고 말해요." },
  { emoji: "🤢", name: "아파요", say: "나는 아파요", tip: "어디가 아픈지 손으로 가리켜요." },
  { emoji: "😳", name: "부끄러워요", say: "나는 부끄러워요", tip: "얼굴이 뜨거워요. 괜찮아요." },
  { emoji: "🤩", name: "신나요", say: "나는 신나요", tip: "기대되고 몸이 들썩여요." },
];

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
            <span className={styles.bigPic} aria-hidden="true">{cur.emoji}</span>
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
            <span className={styles.pic} aria-hidden="true">{e.emoji}</span>
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
