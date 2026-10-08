"use client";

import { useEffect, useState } from "react";
import styles from "./ScheduleBoard.module.css";

type Item = { id: string; icon: string; label: string; done: boolean };

const STORAGE_KEY = "edu-toolbox.schedule";
const MAX_ITEMS = 12;

// 활동 그림: 이모지로 표시해요. 이름은 바꿔 쓸 수 있어요.
const PRESETS: { icon: string; label: string }[] = [
  { icon: "🎒", label: "등교" },
  { icon: "🧺", label: "준비하기" },
  { icon: "📖", label: "국어" },
  { icon: "🔢", label: "수학" },
  { icon: "🎨", label: "미술" },
  { icon: "🎵", label: "음악" },
  { icon: "🏃", label: "체육" },
  { icon: "🧩", label: "활동" },
  { icon: "🍎", label: "간식" },
  { icon: "🍚", label: "점심" },
  { icon: "🪥", label: "양치" },
  { icon: "🚻", label: "화장실" },
  { icon: "🛝", label: "쉬는 시간" },
  { icon: "🧹", label: "청소" },
  { icon: "🏠", label: "하교" },
];

const makeId = () => Math.random().toString(36).slice(2, 10);

function isItem(value: unknown): value is Item {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.id === "string" &&
    typeof v.icon === "string" &&
    typeof v.label === "string" &&
    typeof v.done === "boolean"
  );
}

export default function ScheduleBoard() {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [customIcon, setCustomIcon] = useState("⭐");
  const [customLabel, setCustomLabel] = useState("");

  /* 저장된 값 불러오기 */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed: unknown = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          // 브라우저 저장소는 서버에서 읽을 수 없어서, 화면이 뜬 뒤에 불러와요.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(parsed.filter(isItem).slice(0, MAX_ITEMS));
        }
      }
    } catch {
      // 저장소를 못 쓰면 빈 상태로 시작
    }
    setLoaded(true);
  }, []);

  /* 바뀔 때마다 저장 */
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // 무시
    }
  }, [loaded, items]);

  const full = items.length >= MAX_ITEMS;
  // 아직 안 끝난 첫 번째 활동이 "지금"
  const currentId = items.find((i) => !i.done)?.id;
  const allDone = items.length > 0 && !currentId;

  const add = (icon: string, label: string) => {
    const name = label.trim();

    if (!name || full) return;
    setItems((prev) => [
      ...prev,
      { id: makeId(), icon: icon.trim() || "⭐", label: name, done: false },
    ]);
  };

  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const move = (index: number, dir: -1 | 1) =>
    setItems((prev) => {
      const to = index + dir;

      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];

      [next[index], next[to]] = [next[to], next[index]];

      return next;
    });

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    );

  const resetChecks = () =>
    setItems((prev) => prev.map((i) => ({ ...i, done: false })));

  const clearAll = () => {
    if (window.confirm("일과표를 모두 지울까요?")) setItems([]);
  };

  return (
    <div className={styles.wrap}>
      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>아직 일과표가 비어 있어요.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setEditing(true)}
          >
            일과표 만들기
          </button>
        </div>
      ) : (
        <ol className={styles.list}>
          {items.map((item, index) => {
            const isNow = item.id === currentId;

            return (
              <li
                key={item.id}
                className={[
                  styles.card,
                  item.done ? styles.done : "",
                  isNow ? styles.now : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <button
                  type="button"
                  className={styles.cardBtn}
                  aria-pressed={item.done}
                  aria-label={`${item.label}, ${item.done ? "끝남. 누르면 되돌려요" : "누르면 끝났다고 표시해요"}`}
                  onClick={() => toggle(item.id)}
                  disabled={editing}
                >
                  <span className={styles.order}>{index + 1}</span>
                  <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className={styles.label}>{item.label}</span>
                  {isNow && !editing && (
                    <span className={styles.nowTag}>지금</span>
                  )}
                  {item.done && (
                    <span className={styles.check} aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>

                {editing && (
                  <div className={styles.edit}>
                    <button
                      type="button"
                      className={styles.small}
                      aria-label={`${item.label} 위로`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className={styles.small}
                      aria-label={`${item.label} 아래로`}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className={`${styles.small} ${styles.danger}`}
                      aria-label={`${item.label} 지우기`}
                      onClick={() => remove(item.id)}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {allDone && !editing && (
        <div className={styles.finish} role="status">
          🎉 오늘 일과를 모두 마쳤어요!
        </div>
      )}

      <div className={styles.controls}>
        {items.length > 0 && (
          <button
            type="button"
            className={`btn ${editing ? "btn-primary" : "btn-outline"} ${styles.big}`}
            onClick={() => setEditing((e) => !e)}
          >
            {editing ? "편집 끝내기" : "편집하기"}
          </button>
        )}
        {items.length > 0 && !editing && (
          <button
            type="button"
            className={`btn btn-outline ${styles.big}`}
            onClick={resetChecks}
          >
            체크 모두 풀기
          </button>
        )}
      </div>

      {editing && (
        <div className={styles.panel}>
          <p className={styles.panelTitle}>
            활동 고르기 ({items.length}/{MAX_ITEMS})
          </p>
          <div className={styles.presets}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={styles.preset}
                disabled={full}
                onClick={() => add(p.icon, p.label)}
              >
                <span aria-hidden="true">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>

          <form
            className={styles.custom}
            onSubmit={(e) => {
              e.preventDefault();
              add(customIcon, customLabel);
              setCustomLabel("");
            }}
          >
            <label htmlFor="sch-icon" className={styles.srOnly}>
              그림
            </label>
            <input
              id="sch-icon"
              className={`${styles.input} ${styles.iconInput}`}
              maxLength={4}
              value={customIcon}
              onChange={(e) => setCustomIcon(e.target.value)}
            />
            <label htmlFor="sch-label" className={styles.srOnly}>
              활동 이름
            </label>
            <input
              id="sch-label"
              className={styles.input}
              maxLength={12}
              placeholder="직접 추가 (예: 도서관)"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-outline"
              disabled={full || !customLabel.trim()}
            >
              추가
            </button>
          </form>

          {items.length > 0 && (
            <button type="button" className={styles.clear} onClick={clearAll}>
              전부 지우기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
