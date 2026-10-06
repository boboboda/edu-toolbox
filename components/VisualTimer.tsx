"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import styles from "./VisualTimer.module.css";

const PRESETS = [1, 3, 5, 10, 15, 30];
const MIN_MINUTES = 1;
const MAX_MINUTES = 120;
const CIRCUMFERENCE = 157.08; // 반지름 25인 원의 둘레 (2 × π × 25)
const STORAGE_KEY = "edu-toolbox.timer";

const PLAY = "M8 5l11 7-11 7z";
const PAUSE = "M8 5v14M16 5v14";

type Saved = { minutes: number; showNumber: boolean; sound: boolean };

function formatTime(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export default function VisualTimer() {
  const [minutes, setMinutes] = useState(5);
  const [remaining, setRemaining] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [showNumber, setShowNumber] = useState(true);
  const [sound, setSound] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const endAt = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  /* ---------- 저장된 설정 불러오기 / 저장하기 ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Saved>;
        if (
          typeof saved.minutes === "number" &&
          saved.minutes >= MIN_MINUTES &&
          saved.minutes <= MAX_MINUTES
        ) {
          setMinutes(saved.minutes);
          setRemaining(saved.minutes * 60);
        }
        if (typeof saved.showNumber === "boolean") setShowNumber(saved.showNumber);
        if (typeof saved.sound === "boolean") setSound(saved.sound);
      }
    } catch {
      // 저장소를 못 쓰는 환경이면 기본값 사용
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      const data: Saved = { minutes, showNumber, sound };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 무시
    }
  }, [loaded, minutes, showNumber, sound]);

  /* ---------- 끝났을 때 알림음 ---------- */
  const beep = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.45, 0.9].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.4);
    });
  }, []);

  // 브라우저는 사용자가 누른 순간에만 소리를 허용하므로, 시작 버튼에서 준비해 둠
  const prepareAudio = () => {
    try {
      if (!audioRef.current) {
        const AC =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioRef.current = new AC();
      }
      void audioRef.current.resume();
    } catch {
      // 소리를 못 쓰면 화면 표시만 사용
    }
  };

  /* ---------- 시간 흐르기 ---------- */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = (endAt.current - Date.now()) / 1000;
      if (left <= 0) {
        setRemaining(0);
        setRunning(false);
        setFinished(true);
        if (sound) beep();
      } else {
        setRemaining(left);
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [running, sound, beep]);

  /* ---------- 버튼 동작 ---------- */
  const total = minutes * 60;

  const start = () => {
    prepareAudio();
    const base = finished || remaining <= 0 ? total : remaining;
    setRemaining(base);
    setFinished(false);
    endAt.current = Date.now() + base * 1000;
    setRunning(true);
  };

  const pause = () => {
    setRemaining(Math.max(0, (endAt.current - Date.now()) / 1000));
    setRunning(false);
  };

  const reset = () => {
    setRunning(false);
    setFinished(false);
    setRemaining(total);
  };

  const chooseMinutes = (m: number) => {
    const next = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, m));
    setMinutes(next);
    setRunning(false);
    setFinished(false);
    setRemaining(next * 60);
  };

  /* ---------- 화면 계산 ---------- */
  const fraction = Math.min(1, Math.max(0, total > 0 ? remaining / total : 0));
  const mainLabel = running
    ? "일시정지"
    : finished
      ? "다시 시작"
      : remaining < total - 0.5
        ? "계속하기"
        : "시작";

  return (
    <div className={styles.wrap}>
      <div className={styles.dialWrap}>
        <svg
          className={styles.dial}
          viewBox="0 0 100 100"
          role="img"
          aria-label={`남은 시간 ${formatTime(remaining)}`}
        >
          <circle cx="50" cy="50" r="48" fill="#ffffff" />
          <circle
            cx="50"
            cy="50"
            r="25"
            fill="none"
            stroke={finished ? "#bdefdd" : "#e5484d"}
            strokeWidth="50"
            strokeDasharray={`${finished ? CIRCUMFERENCE : fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            transform="rotate(-90 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#14213d"
            strokeWidth="2"
          />
        </svg>
        {finished && <div className={styles.done}>끝!</div>}
      </div>

      {showNumber && (
        <div className={styles.time} role="timer" aria-live="off">
          {formatTime(remaining)}
        </div>
      )}

      <div className={styles.status} aria-live="polite">
        {finished ? "시간이 끝났어요!" : ""}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={`btn btn-primary ${styles.big}`}
          onClick={running ? pause : start}
        >
          <Icon d={running ? PAUSE : PLAY} size={26} color="#ffffff" strokeWidth={2.6} />
          {mainLabel}
        </button>
        <button
          type="button"
          className={`btn btn-outline ${styles.big}`}
          onClick={reset}
        >
          처음으로
        </button>
      </div>

      <div className={styles.panel}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>시간 고르기</span>
          {PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              className={`${styles.preset} ${minutes === m ? styles.active : ""}`}
              aria-pressed={minutes === m}
              onClick={() => chooseMinutes(m)}
            >
              {m}분
            </button>
          ))}
        </div>

        <div className={styles.row}>
          <span className={styles.rowLabel}>1분씩 조절</span>
          <button
            type="button"
            className={styles.step}
            aria-label="1분 줄이기"
            disabled={minutes <= MIN_MINUTES}
            onClick={() => chooseMinutes(minutes - 1)}
          >
            −
          </button>
          <span className={styles.minutes}>{minutes}분</span>
          <button
            type="button"
            className={styles.step}
            aria-label="1분 늘리기"
            disabled={minutes >= MAX_MINUTES}
            onClick={() => chooseMinutes(minutes + 1)}
          >
            +
          </button>
        </div>

        <div className={styles.options}>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={showNumber}
              onChange={(e) => setShowNumber(e.target.checked)}
            />
            숫자 보이기
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
            />
            끝나면 소리 내기
          </label>
        </div>
      </div>
    </div>
  );
}