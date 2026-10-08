"use client";

import { useEffect, useState } from "react";
import styles from "./WordCards.module.css";

type Card = { icon: string; word: string };
type CardSet = { id: string; name: string; cards: Card[] };

const STORAGE_KEY = "edu-toolbox.wordcards";
const MAX_CUSTOM = 30;

// 그림은 이모지로 보여줘요. 기기에 따라 모양이 조금 달라 보일 수 있어요.
const SETS: CardSet[] = [
  {
    id: "fruit",
    name: "과일·음식",
    cards: [
      { icon: "🍎", word: "사과" },
      { icon: "🍌", word: "바나나" },
      { icon: "🍇", word: "포도" },
      { icon: "🍓", word: "딸기" },
      { icon: "🍊", word: "귤" },
      { icon: "🍉", word: "수박" },
      { icon: "🥕", word: "당근" },
      { icon: "🍚", word: "밥" },
      { icon: "🥛", word: "우유" },
      { icon: "🍞", word: "빵" },
    ],
  },
  {
    id: "animal",
    name: "동물",
    cards: [
      { icon: "🐶", word: "강아지" },
      { icon: "🐱", word: "고양이" },
      { icon: "🐰", word: "토끼" },
      { icon: "🐻", word: "곰" },
      { icon: "🐘", word: "코끼리" },
      { icon: "🐟", word: "물고기" },
      { icon: "🐦", word: "새" },
      { icon: "🐄", word: "소" },
      { icon: "🐷", word: "돼지" },
      { icon: "🐔", word: "닭" },
    ],
  },
  {
    id: "vehicle",
    name: "탈것",
    cards: [
      { icon: "🚗", word: "자동차" },
      { icon: "🚌", word: "버스" },
      { icon: "🚆", word: "기차" },
      { icon: "🚲", word: "자전거" },
      { icon: "✈️", word: "비행기" },
      { icon: "🚢", word: "배" },
      { icon: "🚒", word: "소방차" },
      { icon: "🚑", word: "구급차" },
    ],
  },
  {
    id: "daily",
    name: "생활",
    cards: [
      { icon: "🏠", word: "집" },
      { icon: "🛏️", word: "침대" },
      { icon: "🪑", word: "의자" },
      { icon: "📖", word: "책" },
      { icon: "✏️", word: "연필" },
      { icon: "🎒", word: "가방" },
      { icon: "👕", word: "옷" },
      { icon: "👟", word: "신발" },
      { icon: "🪥", word: "칫솔" },
      { icon: "⏰", word: "시계" },
    ],
  },
];

const isCard = (v: unknown): v is Card => {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;

  return typeof c.icon === "string" && typeof c.word === "string";
};

export default function WordCards() {
  const [setId, setSetId] = useState(SETS[0].id);
  const [custom, setCustom] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [hideWord, setHideWord] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [newIcon, setNewIcon] = useState("⭐");
  const [newWord, setNewWord] = useState("");
  const [canSpeak, setCanSpeak] = useState(false);

  /* 저장된 값 불러오기 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const saved: unknown = JSON.parse(raw);

        if (typeof saved === "object" && saved !== null) {
          const s = saved as { custom?: unknown };

          if (Array.isArray(s.custom)) {
            // 브라우저 저장소는 서버에서 읽을 수 없어서, 화면이 뜬 뒤에 불러와요.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCustom(s.custom.filter(isCard).slice(0, MAX_CUSTOM));
          }
        }
      }
    } catch {
      // 저장소를 못 쓰면 기본값 사용
    }
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    setLoaded(true);
  }, []);

  /* 바뀔 때마다 저장 */
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ custom }));
    } catch {
      // 무시
    }
  }, [loaded, custom]);

  const sets: CardSet[] = [...SETS, { id: "mine", name: "내 카드", cards: custom }];
  const current = sets.find((s) => s.id === setId) ?? sets[0];
  const cards = current.cards;
  const safeIndex = Math.min(index, Math.max(0, cards.length - 1));
  const card = cards[safeIndex];

  const choose = (id: string) => {
    setSetId(id);
    setIndex(0);
  };

  const go = (dir: -1 | 1) => {
    if (cards.length === 0) return;
    setIndex((i) => (Math.min(i, cards.length - 1) + dir + cards.length) % cards.length);
  };

  const speak = () => {
    if (!card || !canSpeak) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(card.word);

      u.lang = "ko-KR";
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    } catch {
      // 소리가 안 나는 기기에서는 조용히 무시
    }
  };

  const addCard = () => {
    const word = newWord.trim();

    if (!word || custom.length >= MAX_CUSTOM) return;
    setCustom((prev) => [...prev, { icon: newIcon.trim() || "⭐", word }]);
    setNewWord("");
  };

  const removeCard = (i: number) => {
    setCustom((prev) => prev.filter((_, n) => n !== i));
    setIndex(0);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs} role="tablist" aria-label="카드 묶음">
        {sets.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === current.id}
            className={`${styles.tab} ${s.id === current.id ? styles.tabOn : ""}`}
            onClick={() => choose(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      {!card ? (
        <div className={styles.empty}>
          <p>아직 카드가 없어요. 아래에서 낱말을 추가해 보세요.</p>
        </div>
      ) : (
        <>
          <button
            type="button"
            className={styles.card}
            onClick={speak}
            aria-label={`${card.word} 카드${canSpeak ? ". 누르면 읽어 줘요" : ""}`}
          >
            <span className={styles.icon} aria-hidden="true">
              {card.icon}
            </span>
            <span className={`${styles.word} ${hideWord ? styles.hidden : ""}`}>
              {hideWord ? "?" : card.word}
            </span>
          </button>

          <div className={styles.count} aria-live="polite">
            {safeIndex + 1} / {cards.length}
          </div>

          <div className={styles.controls}>
            <button type="button" className={`btn btn-outline ${styles.big}`} onClick={() => go(-1)}>
              ← 이전
            </button>
            <button type="button" className={`btn btn-primary ${styles.big}`} onClick={() => go(1)}>
              다음 →
            </button>
          </div>

          <div className={styles.controls}>
            <button
              type="button"
              className="btn btn-outline"
              aria-pressed={hideWord}
              onClick={() => setHideWord((h) => !h)}
            >
              {hideWord ? "낱말 보이기" : "낱말 가리기"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => window.print()}>
              인쇄용 카드
            </button>
          </div>
        </>
      )}

      {current.id === "mine" && (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>
            내 카드 만들기 ({custom.length}/{MAX_CUSTOM})
          </p>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              addCard();
            }}
          >
            <label htmlFor="wc-icon" className={styles.srOnly}>
              그림
            </label>
            <input
              id="wc-icon"
              className={`${styles.input} ${styles.iconInput}`}
              maxLength={4}
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
            />
            <label htmlFor="wc-word" className={styles.srOnly}>
              낱말
            </label>
            <input
              id="wc-word"
              className={styles.input}
              maxLength={12}
              placeholder="낱말 (예: 우리 반)"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-outline"
              disabled={!newWord.trim() || custom.length >= MAX_CUSTOM}
            >
              추가
            </button>
          </form>

          {custom.length > 0 && (
            <ul className={styles.list}>
              {custom.map((c, i) => (
                <li key={`${c.word}-${i}`}>
                  <span aria-hidden="true">{c.icon}</span> {c.word}
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`${c.word} 지우기`}
                    onClick={() => removeCard(i)}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.note}>그림 칸에는 이모지 하나를 넣어요. 학생 이름은 적지 마세요.</p>
        </div>
      )}

      {/* 인쇄할 때만 보이는 카드 모음 */}
      <div className={styles.print} aria-hidden="true">
        <h2 className={styles.printTitle}>{current.name} 낱말카드</h2>
        <div className={styles.printGrid}>
          {cards.map((c, i) => (
            <div key={`${c.word}-${i}`} className={styles.printCard}>
              <span className={styles.printIcon}>{c.icon}</span>
              <span className={styles.printWord}>{c.word}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
