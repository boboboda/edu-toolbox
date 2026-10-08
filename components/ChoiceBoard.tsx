"use client";

import { useEffect, useState } from "react";
import styles from "./ChoiceBoard.module.css";

type Choice = { emoji: string; label: string };

const STORAGE_KEY = "edu-toolbox.choice";

const PRESETS: { name: string; a: Choice; b: Choice }[] = [
  { name: "간식", a: { emoji: "🍎", label: "사과" }, b: { emoji: "🍪", label: "과자" } },
  { name: "놀이", a: { emoji: "🧩", label: "퍼즐" }, b: { emoji: "🎨", label: "그림 그리기" } },
  { name: "쉬는 곳", a: { emoji: "🎵", label: "노래 듣기" }, b: { emoji: "📖", label: "책 보기" } },
  { name: "활동", a: { emoji: "🏃", label: "운동장" }, b: { emoji: "🏫", label: "교실" } },
  { name: "마시기", a: { emoji: "💧", label: "물" }, b: { emoji: "🥛", label: "우유" } },
];

const EMOJIS = [
  "🍎", "🍪", "🍌", "🥛", "💧", "🧩", "🎨", "🎵", "📖", "🏃",
  "🏫", "🎮", "🧸", "🚗", "⚽", "🫧", "😀", "😢", "👍", "🙅",
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

function sanitize(v: unknown, fallback: Choice): Choice {
  if (v && typeof v === "object") {
    const c = v as Partial<Choice>;
    if (typeof c.emoji === "string" && typeof c.label === "string") {
      return { emoji: c.emoji.slice(0, 8), label: c.label.slice(0, 12) };
    }
  }
  return fallback;
}

export default function ChoiceBoard() {
  const [a, setA] = useState<Choice>(PRESETS[0].a);
  const [b, setB] = useState<Choice>(PRESETS[0].b);
  const [picked, setPicked] = useState<"a" | "b" | null>(null);
  const [edit, setEdit] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /* 저장된 값 불러오기 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { a?: unknown; b?: unknown };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setA((cur) => sanitize(s.a, cur));
        setB((cur) => sanitize(s.b, cur));
      }
    } catch {
      // 저장소를 못 쓰면 기본값 사용
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ a, b }));
    } catch {
      // 저장 실패는 무시
    }
  }, [a, b, loaded]);

  function pick(which: "a" | "b") {
    setPicked(which);
    speak((which === "a" ? a : b).label);
  }

  function applyPreset(i: number) {
    setA(PRESETS[i].a);
    setB(PRESETS[i].b);
    setPicked(null);
  }

  function editor(
    title: string,
    c: Choice,
    set: (c: Choice) => void,
  ) {
    return (
      <div className={styles.editor}>
        <strong>{title}</strong>
        <input
          className={styles.input}
          value={c.label}
          maxLength={12}
          aria-label={`${title} 이름`}
          onChange={(e) => {
            set({ ...c, label: e.target.value });
            setPicked(null);
          }}
        />
        <div className={styles.emojis}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              className={e === c.emoji ? styles.emojiOn : styles.emoji}
              aria-label={`그림 ${e}`}
              onClick={() => {
                set({ ...c, emoji: e });
                setPicked(null);
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.pair}>
        {(["a", "b"] as const).map((k) => {
          const c = k === "a" ? a : b;
          const state =
            picked === null ? "" : picked === k ? styles.chosen : styles.dim;
          return (
            <button
              key={k}
              type="button"
              className={`${styles.card} ${state}`}
              onClick={() => pick(k)}
              aria-pressed={picked === k}
            >
              <span className={styles.pic} aria-hidden="true">
                {c.emoji}
              </span>
              <span className={styles.label}>{c.label || "?"}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.row}>
        {picked && (
          <button type="button" className="btn btn-outline" onClick={() => setPicked(null)}>
            다시 고르기
          </button>
        )}
        <button type="button" className="btn btn-outline" onClick={() => setEdit((v) => !v)}>
          {edit ? "편집 닫기" : "내용 바꾸기"}
        </button>
      </div>

      {edit && (
        <div className={styles.panel}>
          <div className={styles.presets}>
            {PRESETS.map((p, i) => (
              <button
                key={p.name}
                type="button"
                className="btn btn-outline"
                onClick={() => applyPreset(i)}
              >
                {p.a.emoji} {p.b.emoji} {p.name}
              </button>
            ))}
          </div>
          <div className={styles.editors}>
            {editor("왼쪽", a, setA)}
            {editor("오른쪽", b, setB)}
          </div>
        </div>
      )}
    </div>
  );
}
