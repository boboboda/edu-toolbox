"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import styles from "./TokenBoard.module.css";

const STAR =
  "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z";
const GIFT =
  "M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3.5-5-1.5S10.5 7 12 7zM12 7c1.5-3 5-3.5 5-1.5S13.5 7 12 7z";

const MIN_GOAL = 2;
const MAX_GOAL = 10;
const DEFAULT_GOAL = 5;
const DEFAULT_REWARD = "좋아하는 활동 하기";
const STORAGE_KEY = "edu-toolbox.tokens";

type Saved = { goal: number; count: number; reward: string };

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={styles.star} aria-hidden="true">
      <path
        d={STAR}
        fill={filled ? "#ffc93c" : "#ffffff"}
        stroke={filled ? "#14213d" : "#6f84ab"}
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeDasharray={filled ? undefined : "2.2 2.2"}
      />
    </svg>
  );
}

export default function TokenBoard() {
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [count, setCount] = useState(0);
  const [reward, setReward] = useState(DEFAULT_REWARD);
  const [loaded, setLoaded] = useState(false);

  /* 저장된 값 불러오기 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Saved>;
        const g =
          typeof saved.goal === "number" &&
          saved.goal >= MIN_GOAL &&
          saved.goal <= MAX_GOAL
            ? saved.goal
            : DEFAULT_GOAL;
        setGoal(g);
        if (typeof saved.count === "number") {
          setCount(Math.min(Math.max(0, saved.count), g));
        }
        if (typeof saved.reward === "string") setReward(saved.reward);
      }
    } catch {
      // 저장소를 못 쓰면 기본값 사용
    }
    setLoaded(true);
  }, []);

  /* 바뀔 때마다 저장 */
  useEffect(() => {
    if (!loaded) return;
    try {
      const data: Saved = { goal, count, reward };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 무시
    }
  }, [loaded, goal, count, reward]);

  const done = count >= goal;

  const add = () => setCount((c) => Math.min(goal, c + 1));
  const remove = () => setCount((c) => Math.max(0, c - 1));
  const reset = () => setCount(0);

  const changeGoal = (next: number) => {
    const g = Math.min(MAX_GOAL, Math.max(MIN_GOAL, next));
    setGoal(g);
    setCount((c) => Math.min(c, g));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.board}>
        {Array.from({ length: goal }, (_, i) => {
          const filled = i < count;
          const isNext = i === count && !done;

          return isNext ? (
            <button
              key={i}
              type="button"
              className={styles.slotBtn}
              aria-label={`별 붙이기, ${count + 1}번째`}
              onClick={add}
            >
              <Star filled={false} />
            </button>
          ) : (
            <div key={i} className={styles.slot}>
              <Star filled={filled} />
            </div>
          );
        })}
      </div>

      <div className={styles.count} aria-live="polite">
        별 {count}개 / {goal}개
      </div>

      {done && (
        <div className={styles.reward} role="status">
          <Icon d={GIFT} size={48} />
          <div>
            <strong>목표를 달성했어요!</strong>
            <span>{reward.trim() || DEFAULT_REWARD}</span>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <button
          type="button"
          className={`btn btn-primary ${styles.big}`}
          onClick={add}
          disabled={done}
        >
          <Icon d={STAR} size={26} color="#ffffff" strokeWidth={2.4} />
          별 붙이기
        </button>
        <button
          type="button"
          className={`btn btn-outline ${styles.big}`}
          onClick={remove}
          disabled={count === 0}
        >
          하나 빼기
        </button>
        <button
          type="button"
          className={`btn btn-outline ${styles.big}`}
          onClick={reset}
        >
          처음부터
        </button>
      </div>

      <div className={styles.panel}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>목표 별 개수</span>
          <button
            type="button"
            className={styles.step}
            aria-label="목표 하나 줄이기"
            disabled={goal <= MIN_GOAL}
            onClick={() => changeGoal(goal - 1)}
          >
            −
          </button>
          <span className={styles.number}>{goal}개</span>
          <button
            type="button"
            className={styles.step}
            aria-label="목표 하나 늘리기"
            disabled={goal >= MAX_GOAL}
            onClick={() => changeGoal(goal + 1)}
          >
            +
          </button>
        </div>

        <div className={styles.row}>
          <label htmlFor="reward-text" className={styles.rowLabel}>
            보상 정하기
          </label>
          <input
            id="reward-text"
            type="text"
            className={styles.input}
            maxLength={24}
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            placeholder={DEFAULT_REWARD}
          />
        </div>
      </div>
    </div>
  );
}