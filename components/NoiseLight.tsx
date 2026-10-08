"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./NoiseLight.module.css";

type Status = "idle" | "asking" | "on" | "denied" | "unsupported";

// 소리 크기를 0~100으로 바꿔요. (대략 -80dB → 0, -20dB → 100)
const toLevel = (rms: number) => {
  const db = 20 * Math.log10(Math.max(rms, 1e-5));

  return Math.min(100, Math.max(0, ((db + 80) * 100) / 60));
};

export default function NoiseLight() {
  const [status, setStatus] = useState<Status>("idle");
  const [level, setLevel] = useState(0);
  const [sens, setSens] = useState(5); // 1(둔함) ~ 9(민감)
  const [offset, setOffset] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rawRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    setLevel(0);
    setStatus("idle");
  }, []);

  // 화면을 떠나면 마이크를 꺼요
  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void ctxRef.current?.close();
  }, []);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setStatus("asking");
    // 버튼을 누른 바로 그 순간에 만들어야 브라우저가 소리 처리를 막지 않아요
    const ctx = new AudioContext();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });

      await ctx.resume();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();

      an.fftSize = 1024;
      src.connect(an);
      // 일부 브라우저는 소리가 어딘가로 이어져 있어야 크기를 재요. 소리는 0으로 줄여서 내보내지 않아요.
      const mute = ctx.createGain();

      mute.gain.value = 0;
      an.connect(mute);
      mute.connect(ctx.destination);
      streamRef.current = stream;
      ctxRef.current = ctx;
      const buf = new Float32Array(an.fftSize);
      let smooth = 0;

      timerRef.current = setInterval(() => {
        an.getFloatTimeDomainData(buf);
        let sum = 0;

        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const raw = toLevel(Math.sqrt(sum / buf.length));

        rawRef.current = raw;
        // 오르는 건 빠르게, 내리는 건 천천히 (신호등이 깜빡이지 않게)
        smooth = raw > smooth ? smooth * 0.4 + raw * 0.6 : smooth * 0.9 + raw * 0.1;
        setLevel(smooth);
      }, 100);
      setStatus("on");
    } catch {
      void ctx.close();
      setStatus("denied");
    }
  };

  // 지금 소리를 "조용한 상태"로 맞춰요
  const calibrate = () => setOffset(Math.max(0, rawRef.current - 15));

  const shown = Math.min(100, Math.max(0, level - offset));
  const shift = (5 - sens) * 4; // 민감할수록 기준이 낮아져요
  const yellowAt = 50 + shift;
  const redAt = 70 + shift;
  const state = shown >= redAt ? "red" : shown >= yellowAt ? "yellow" : "green";
  const on = status === "on";

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <div className={styles.light} role="img" aria-label={on ? { red: "빨강: 너무 시끄러워요", yellow: "노랑: 조금 시끄러워요", green: "초록: 조용해요" }[state] : "꺼져 있음"}>
          <span className={`${styles.lamp} ${styles.red} ${on && state === "red" ? styles.lit : ""}`} />
          <span className={`${styles.lamp} ${styles.yellow} ${on && state === "yellow" ? styles.lit : ""}`} />
          <span className={`${styles.lamp} ${styles.green} ${on && state === "green" ? styles.lit : ""}`} />
        </div>

        <div className={styles.side}>
          <p className={styles.msg} aria-live="polite">
            {!on && "마이크를 켜면 시작해요"}
            {on && state === "green" && "조용해요 👍"}
            {on && state === "yellow" && "조금 시끄러워요"}
            {on && state === "red" && "너무 시끄러워요!"}
          </p>
          <div className={styles.meter} aria-hidden="true">
            <div className={styles.fill} style={{ width: `${on ? shown : 0}%` }} />
            <span className={styles.mark} style={{ left: `${yellowAt}%` }} />
            <span className={styles.mark} style={{ left: `${redAt}%` }} />
          </div>
        </div>
      </div>

      {status === "denied" && (
        <p className={styles.warn} role="alert">
          마이크를 쓸 수 없어요. 주소창 옆의 자물쇠 아이콘에서 마이크를 &quot;허용&quot;으로 바꾼 뒤 다시 눌러 주세요.
        </p>
      )}
      {status === "unsupported" && (
        <p className={styles.warn} role="alert">이 브라우저에서는 마이크를 쓸 수 없어요.</p>
      )}

      <div className={styles.controls}>
        {!on ? (
          <button type="button" className="btn btn-primary" onClick={start} disabled={status === "asking"}>
            {status === "asking" ? "마이크 확인 중…" : "마이크 켜기"}
          </button>
        ) : (
          <button type="button" className="btn btn-outline" onClick={stop}>
            끄기
          </button>
        )}
      </div>

      <div className={styles.panel}>
        <label htmlFor="noise-sens" className={styles.label}>
          민감도: {sens <= 3 ? "둔하게" : sens >= 7 ? "민감하게" : "보통"}
        </label>
        <input
          id="noise-sens"
          type="range"
          min={1}
          max={9}
          value={sens}
          onChange={(e) => setSens(Number(e.target.value))}
        />
        <button type="button" className="btn btn-outline" onClick={calibrate} disabled={!on}>
          지금 소리를 &quot;조용함&quot;으로 맞추기
        </button>
        {offset > 0 && (
          <button type="button" className={styles.link} onClick={() => setOffset(0)}>
            맞춘 값 지우기
          </button>
        )}
        <p className={styles.hint}>
          소리는 녹음하거나 서버로 보내지 않아요. 크기만 재고 바로 버려요.
        </p>
      </div>
    </div>
  );
}
