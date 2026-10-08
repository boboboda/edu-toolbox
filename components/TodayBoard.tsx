"use client";

import { useEffect, useState } from "react";
import styles from "./TodayBoard.module.css";

const DAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const WEATHER = [
  { id: "sun", icon: "☀️", name: "맑아요", tip: "밖에서 놀기 좋아요." },
  { id: "cloud", icon: "☁️", name: "흐려요", tip: "구름이 많아요." },
  { id: "rain", icon: "🌧️", name: "비가 와요", tip: "우산을 챙겨요." },
  { id: "snow", icon: "❄️", name: "눈이 와요", tip: "따뜻하게 입어요." },
  { id: "wind", icon: "💨", name: "바람이 불어요", tip: "겉옷을 챙겨요." },
  { id: "dust", icon: "😷", name: "미세먼지", tip: "마스크를 써요." },
];
const KEY = "edu-toolbox.today";

type Saved = { date: string; weather: string | null; note: string };

const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export default function TodayBoard() {
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);

  // 시계: 날짜가 바뀌면 화면도 바뀌어요
  useEffect(() => {
    // 서버와 화면 시각이 달라서, 화면이 뜬 뒤에 정해요.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);

    return () => clearInterval(t);
  }, []);

  const key = now ? dateKey(now) : null;

  // 오늘 날짜의 날씨·한마디만 불러와요 (다른 날 것은 지나가요)
  useEffect(() => {
    if (!key) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(KEY);
      const p = raw ? (JSON.parse(raw) as Partial<Saved>) : null;

      if (p && p.date === key) {
        setWeather(typeof p.weather === "string" ? p.weather : null);
        setNote(typeof p.note === "string" ? p.note : "");
      } else {
        setWeather(null);
        setNote("");
      }
    } catch {
      // 저장소를 못 쓰면 그냥 시작
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [key]);

  useEffect(() => {
    if (!loaded || !key) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ date: key, weather, note } satisfies Saved));
    } catch {
      // 무시
    }
  }, [loaded, key, weather, note]);

  const w = WEATHER.find((x) => x.id === weather);

  return (
    <div className={styles.wrap}>
      <section className={styles.board} aria-live="polite">
        {now ? (
          <>
            <p className={styles.year}>{now.getFullYear()}년</p>
            <p className={styles.date}>
              {now.getMonth() + 1}월 {now.getDate()}일
            </p>
            <p className={styles.day}>{DAY_NAMES[now.getDay()]}</p>
          </>
        ) : (
          <p className={styles.date}>…</p>
        )}

        <div className={styles.weather}>
          {w ? (
            <>
              <span className={styles.wIcon} aria-hidden="true">{w.icon}</span>
              <span className={styles.wName}>오늘은 {w.name}</span>
              <span className={styles.wTip}>{w.tip}</span>
            </>
          ) : (
            <span className={styles.wAsk}>오늘 날씨는 어때요?</span>
          )}
        </div>

        {note && <p className={styles.note}>{note}</p>}
      </section>

      <div className={styles.picks} role="group" aria-label="오늘 날씨 고르기">
        {WEATHER.map((x) => (
          <button
            key={x.id}
            type="button"
            className={`${styles.pick} ${weather === x.id ? styles.on : ""}`}
            aria-pressed={weather === x.id}
            onClick={() => setWeather(weather === x.id ? null : x.id)}
          >
            <span className={styles.pickIcon} aria-hidden="true">{x.icon}</span>
            {x.name}
          </button>
        ))}
      </div>

      <div className={styles.noteBox}>
        <label htmlFor="today-note" className={styles.noteLabel}>오늘의 한마디 (선생님이 써요)</label>
        <input
          id="today-note"
          className={styles.input}
          maxLength={40}
          placeholder="예) 오늘은 체육 시간이 있어요"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </div>
  );
}
