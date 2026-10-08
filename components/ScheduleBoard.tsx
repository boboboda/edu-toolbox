"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ScheduleBoard.module.css";

type Kind = "class" | "break" | "lunch" | "arrive";
type Item = {
  id: string;
  icon: string;
  label: string;
  done: boolean;
  minutes?: number; // 걸리는 시간(분). 없으면 시간 표시 없음
  kind?: Kind; // 수업/쉬는 시간이면 위쪽 설정을 바꿀 때 같이 바뀜
};
type Settings = {
  start: string;
  arriveMin: number; // 등교(아침 활동) 시간
  classMin: number;
  breakMin: number;
  lunchMin: number;
  periods: number; // 하루 수업 수
  lunchAfter: number; // 몇 교시 뒤에 점심
};

const DAYS = ["월", "화", "수", "목", "금"] as const;
type Day = (typeof DAYS)[number];
type Week = Record<Day, Item[]>;
const emptyWeek = (): Week => ({ 월: [], 화: [], 수: [], 목: [], 금: [] });
// 오늘이 무슨 요일인지 (주말이면 월요일)
const todayDay = (): Day => {
  const d = new Date().getDay();
  return d >= 1 && d <= 5 ? DAYS[d - 1] : "월";
};

const SETTINGS_KEY = "edu-toolbox.schedule.settings";
const WEEK_KEY = "edu-toolbox.schedule.week.v1";
const DEFAULT_SETTINGS: Settings = {
  start: "08:40",
  arriveMin: 10,
  classMin: 45,
  breakMin: 10,
  lunchMin: 50,
  periods: 6,
  lunchAfter: 4,
};
const ARRIVE_CHOICES = [10, 20, 30, 40];
const LUNCH_CHOICES = [40, 50, 60];
const CLASS_CHOICES = [35, 40, 45, 50];
const BREAK_CHOICES = [5, 10, 15, 20];
const SUBJECT_ICONS = ["📖", "🔢", "🎨", "🎵", "🏃", "🧩", "📚"];

const pad = (n: number) => String(n).padStart(2, "0");
const toMin = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const fmt = (min: number) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;

const STORAGE_KEY = "edu-toolbox.schedule";
const MAX_ITEMS = 20;

// 활동 그림: 이모지로 표시해요. 이름은 바꿔 쓸 수 있어요.
const PRESETS: { icon: string; label: string; kind?: Kind; min?: number }[] = [
  { icon: "🎒", label: "등교", kind: "arrive" },
  { icon: "🧺", label: "준비하기" },
  { icon: "📖", label: "국어", kind: "class" },
  { icon: "🔢", label: "수학", kind: "class" },
  { icon: "🎨", label: "미술", kind: "class" },
  { icon: "🎵", label: "음악", kind: "class" },
  { icon: "🏃", label: "체육", kind: "class" },
  { icon: "🧩", label: "활동", kind: "class" },
  { icon: "🍎", label: "간식", min: 15 },
  { icon: "🍚", label: "점심", kind: "lunch" },
  { icon: "🪥", label: "양치", min: 10 },
  { icon: "🚻", label: "화장실" },
  { icon: "🛝", label: "쉬는 시간", kind: "break" },
  { icon: "🧹", label: "청소", min: 10 },
  { icon: "🏠", label: "하교" },
];

const minutesOf = (kind: Kind, st: Settings) =>
  kind === "class" ? st.classMin : kind === "break" ? st.breakMin : kind === "lunch" ? st.lunchMin : st.arriveMin;

const makeId = () => Math.random().toString(36).slice(2, 10);

function isItem(value: unknown): value is Item {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  return (
    typeof v.id === "string" &&
    typeof v.icon === "string" &&
    typeof v.label === "string" &&
    typeof v.done === "boolean" &&
    (v.minutes === undefined || typeof v.minutes === "number") &&
    (v.kind === undefined || v.kind === "class" || v.kind === "break" || v.kind === "lunch" || v.kind === "arrive")
  );
}

export default function ScheduleBoard() {
  const [week, setWeek] = useState<Week>(emptyWeek);
  const [day, setDay] = useState<Day>("월");
  const [today, setToday] = useState<Day>("월");
  const [copyFrom, setCopyFrom] = useState<Day>("월");
  const items = week[day];
  const setItems = (fn: Item[] | ((prev: Item[]) => Item[])) =>
    setWeek((w) => ({ ...w, [day]: typeof fn === "function" ? fn(w[day]) : fn }));
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [customIcon, setCustomIcon] = useState("⭐");
  const [customLabel, setCustomLabel] = useState("");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const { periods, lunchAfter } = settings;

  /* 저장된 값 불러오기 */
  useEffect(() => {
    const t = todayDay();

    // 브라우저 저장소는 서버에서 읽을 수 없어서, 화면이 뜬 뒤에 불러와요.
    /* eslint-disable react-hooks/set-state-in-effect */
    setToday(t);
    setDay(t);
    setCopyFrom(t === "월" ? "화" : "월");
    /* eslint-enable react-hooks/set-state-in-effect */
    try {
      const rw = localStorage.getItem(WEEK_KEY);

      if (rw) {
        const parsed = JSON.parse(rw) as Partial<Record<Day, unknown>>;
        const w = emptyWeek();

        for (const d of DAYS) {
          const v = parsed[d];

          if (Array.isArray(v)) w[d] = v.filter(isItem).slice(0, MAX_ITEMS);
        }
        setWeek(w);
      } else {
        // 예전에 만든 일과표(요일 구분 없음)는 월~금에 똑같이 넣어 줘요
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw) {
          const parsed: unknown = JSON.parse(raw);

          if (Array.isArray(parsed)) {
            const old = parsed.filter(isItem).slice(0, MAX_ITEMS);
            const w = emptyWeek();

            for (const d of DAYS) w[d] = old.map((i) => ({ ...i, id: makeId() }));
            setWeek(w);
          }
        }
      }
      const rs = localStorage.getItem(SETTINGS_KEY);

      if (rs) {
        const p = JSON.parse(rs) as Partial<Settings>;
        const num = (v: unknown, d: number) => (typeof v === "number" && v > 0 ? v : d);

        if (typeof p.start === "string" && toMin(p.start) !== null) {
          setSettings({
            start: p.start,
            arriveMin: num(p.arriveMin, DEFAULT_SETTINGS.arriveMin),
            classMin: num(p.classMin, DEFAULT_SETTINGS.classMin),
            breakMin: num(p.breakMin, DEFAULT_SETTINGS.breakMin),
            lunchMin: num(p.lunchMin, DEFAULT_SETTINGS.lunchMin),
            periods: num(p.periods, DEFAULT_SETTINGS.periods),
            lunchAfter: num(p.lunchAfter, DEFAULT_SETTINGS.lunchAfter),
          });
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
      localStorage.setItem(WEEK_KEY, JSON.stringify(week));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // 무시
    }
  }, [loaded, week, settings]);

  // 시작 시각부터 차례로 더해서 시작·끝 시각 계산
  const times = useMemo(() => {
    const out: { from: number; to: number | null }[] = [];
    let t = toMin(settings.start) ?? 0;

    for (const i of items) {
      const from = t;

      t += i.minutes ?? 0;
      out.push({ from, to: i.minutes ? t : null });
    }
    return out;
  }, [items, settings.start]);
  const hasTimes = items.some((i) => i.minutes);

  const full = items.length >= MAX_ITEMS;
  // 아직 안 끝난 첫 번째 활동이 "지금"
  const currentId = items.find((i) => !i.done)?.id;
  const allDone = items.length > 0 && !currentId;

  const add = (icon: string, label: string, kind?: Kind, min?: number) => {
    const name = label.trim();

    if (!name || full) return;
    const minutes = kind ? minutesOf(kind, settings) : min;

    setItems((prev) => [
      ...prev,
      { id: makeId(), icon: icon.trim() || "⭐", label: name, done: false, minutes, kind },
    ]);
  };

  const patch = (id: string, p: Partial<Item>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...p } : i)));

  // 직접 고친 시간은 위쪽 설정과 따로 움직여요
  const setMinutes = (id: string, minutes: number | undefined) =>
    patch(id, { minutes, kind: undefined });

  // 길이 설정을 바꾸면 같은 종류 카드가 모든 요일에서 한꺼번에 바뀌어요
  const changeLen = (kind: Kind, key: "arriveMin" | "classMin" | "breakMin" | "lunchMin", m: number) => {
    setSettings((st) => ({ ...st, [key]: m }));
    setWeek((w) => {
      const n = emptyWeek();

      for (const d of DAYS) n[d] = w[d].map((i) => (i.kind === kind ? { ...i, minutes: m } : i));

      return n;
    });
  };

  // 요일 복사
  const copyDay = (from: Day, to: Day[]) =>
    setWeek((w) => {
      const n = { ...w };

      for (const d of to) if (d !== from) n[d] = w[from].map((i) => ({ ...i, id: makeId(), done: false }));

      return n;
    });

  // 학교 시간표 틀: 등교 → 1교시 → 쉬는 시간 … → 점심 → … → 하교
  const buildTimetable = () => {
    if (items.length && !window.confirm(`${day}요일 일과표를 지우고 새 시간표 틀로 바꿀까요?`)) return;
    const list: Item[] = [
      { id: makeId(), icon: "🎒", label: "등교", done: false, minutes: settings.arriveMin, kind: "arrive" },
    ];

    for (let n = 1; n <= periods; n++) {
      list.push({
        id: makeId(),
        icon: SUBJECT_ICONS[(n - 1) % SUBJECT_ICONS.length],
        label: `${n}교시`,
        done: false,
        minutes: settings.classMin,
        kind: "class",
      });
      if (n === periods) break;
      if (n === lunchAfter) {
        list.push({ id: makeId(), icon: "🍚", label: "점심", done: false, minutes: settings.lunchMin, kind: "lunch" });
      } else {
        list.push({ id: makeId(), icon: "🛝", label: "쉬는 시간", done: false, minutes: settings.breakMin, kind: "break" });
      }
    }
    list.push({ id: makeId(), icon: "🏠", label: "하교", done: false });
    setItems(list.slice(0, MAX_ITEMS));
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
    if (window.confirm(`${day}요일 일과표를 모두 지울까요?`)) setItems([]);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.days} role="tablist" aria-label="요일">
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={d === day}
            className={`${styles.dayBtn} ${d === day ? styles.dayOn : ""}`}
            onClick={() => setDay(d)}
          >
            {d}
            {d === today && <span className={styles.todayDot}>오늘</span>}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>{day}요일 일과표가 비어 있어요.</p>
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
                  <span className={styles.text}>
                    <span className={styles.label}>{item.label}</span>
                    {hasTimes && (
                      <span className={styles.time}>
                        {fmt(times[index].from)}
                        {times[index].to !== null && ` ~ ${fmt(times[index].to as number)}`}
                        {item.minutes ? ` · ${item.minutes}분` : ""}
                      </span>
                    )}
                  </span>
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

                {editing && (
                  <div className={styles.detail}>
                    <input
                      className={`${styles.input} ${styles.iconInput}`}
                      maxLength={4}
                      value={item.icon}
                      aria-label={`${item.label} 그림`}
                      onChange={(e) => patch(item.id, { icon: e.target.value })}
                    />
                    <input
                      className={styles.input}
                      maxLength={12}
                      value={item.label}
                      aria-label="활동 이름"
                      onChange={(e) => patch(item.id, { label: e.target.value })}
                    />
                    <div className={styles.minRow}>
                      <button
                        type="button"
                        className={styles.small}
                        aria-label={`${item.label} 5분 줄이기`}
                        onClick={() => setMinutes(item.id, Math.max(0, (item.minutes ?? 0) - 5) || undefined)}
                      >
                        −5
                      </button>
                      <span className={styles.minVal}>{item.minutes ? `${item.minutes}분` : "시간 없음"}</span>
                      <button
                        type="button"
                        className={styles.small}
                        aria-label={`${item.label} 5분 늘리기`}
                        onClick={() => setMinutes(item.id, (item.minutes ?? 0) + 5)}
                      >
                        +5
                      </button>
                      {[10, 35, 45, 50].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={`${styles.chip} ${item.minutes === m ? styles.chipOn : ""}`}
                          aria-pressed={item.minutes === m}
                          onClick={() => setMinutes(item.id, m)}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {allDone && !editing && (
        <div className={styles.finish} role="status">
          🎉 {day === today ? "오늘" : `${day}요일`} 일과를 모두 마쳤어요!
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
          <p className={styles.panelTitle}>시간표 설정 (모든 요일에 적용)</p>
          <div className={styles.setRow}>
            <label htmlFor="sch-start">등교 시각</label>
            <input
              id="sch-start"
              type="time"
              step={300}
              className={styles.input}
              style={{ flex: "none", width: 210 }}
              value={settings.start}
              onChange={(e) => e.target.value && setSettings((st) => ({ ...st, start: e.target.value }))}
            />
          </div>
          <div className={styles.setRow}>
            <span>등교·아침 활동</span>
            {ARRIVE_CHOICES.map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.chip} ${settings.arriveMin === m ? styles.chipOn : ""}`}
                aria-pressed={settings.arriveMin === m}
                onClick={() => changeLen("arrive", "arriveMin", m)}
              >
                {m}분
              </button>
            ))}
          </div>
          <div className={styles.setRow}>
            <span>수업 한 시간</span>
            {CLASS_CHOICES.map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.chip} ${settings.classMin === m ? styles.chipOn : ""}`}
                aria-pressed={settings.classMin === m}
                onClick={() => changeLen("class", "classMin", m)}
              >
                {m}분
              </button>
            ))}
          </div>
          <div className={styles.setRow}>
            <span>쉬는 시간</span>
            {BREAK_CHOICES.map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.chip} ${settings.breakMin === m ? styles.chipOn : ""}`}
                aria-pressed={settings.breakMin === m}
                onClick={() => changeLen("break", "breakMin", m)}
              >
                {m}분
              </button>
            ))}
          </div>
          <div className={styles.setRow}>
            <span>점심시간</span>
            {LUNCH_CHOICES.map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.chip} ${settings.lunchMin === m ? styles.chipOn : ""}`}
                aria-pressed={settings.lunchMin === m}
                onClick={() => changeLen("lunch", "lunchMin", m)}
              >
                {m}분
              </button>
            ))}
          </div>
          <p className={styles.hint}>
            길이를 바꾸면 같은 종류 카드(등교, 교시, 쉬는 시간, 점심)가 모든 요일에서 한꺼번에 바뀌어요.
            카드마다 시간을 따로 고치면 그 카드만 따로 움직여요.
          </p>

          <p className={styles.panelTitle}>{day}요일 시간표 틀 만들기</p>
          <div className={styles.setRow}>
            <select
              className={styles.input}
              style={{ flex: "none", width: 150 }}
              value={periods}
              aria-label="수업 수"
              onChange={(e) => setSettings((st) => ({ ...st, periods: Number(e.target.value) }))}
            >
              {[3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>{n}교시까지</option>
              ))}
            </select>
            <select
              className={styles.input}
              style={{ flex: "none", width: 210 }}
              value={lunchAfter}
              aria-label="점심 시간 위치"
              onChange={(e) => setSettings((st) => ({ ...st, lunchAfter: Number(e.target.value) }))}
            >
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}교시 뒤 점심</option>
              ))}
            </select>
            <button type="button" className="btn btn-outline" onClick={buildTimetable}>
              {day}요일 틀 만들기
            </button>
          </div>

          <p className={styles.panelTitle}>요일 복사</p>
          <div className={styles.setRow}>
            <select
              className={styles.input}
              style={{ flex: "none", width: 150 }}
              value={copyFrom}
              aria-label="복사해 올 요일"
              onChange={(e) => setCopyFrom(e.target.value as Day)}
            >
              {DAYS.filter((d) => d !== day).map((d) => (
                <option key={d} value={d}>{d}요일</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline"
              disabled={copyFrom === day}
              onClick={() => {
                if (!items.length || window.confirm(`${day}요일을 ${copyFrom}요일 일과표로 바꿀까요?`)) copyDay(copyFrom, [day]);
              }}
            >
              {copyFrom}요일 → {day}요일 복사
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={!items.length}
              onClick={() => {
                if (window.confirm(`${day}요일 일과표를 월~금 모두에 똑같이 넣을까요? 다른 요일은 지워져요.`)) copyDay(day, [...DAYS]);
              }}
            >
              월~금 똑같이
            </button>
          </div>
        </div>
      )}

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
                onClick={() => add(p.icon, p.label, p.kind, p.min)}
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
