"use client";

import { useMemo, useState } from "react";
import styles from "./TracingSheet.module.css";

type Style = "dotted" | "light";
type Size = { id: string; name: string; cols: number; rows: number };

// 한 줄 칸 수와 한 장에 들어가는 줄 수 (A4 한 장 기준)
const SIZES: Size[] = [
  { id: "l", name: "크게", cols: 6, rows: 7 },
  { id: "m", name: "보통", cols: 8, rows: 10 },
  { id: "s", name: "작게", cols: 11, rows: 14 },
];

const MAX_CHARS = 10;

// 글씨 한 칸. 점선 십자 안내선 위에 글자를 그려요.
function Cell({ ch, mode }: { ch: string; mode: "solid" | Style | "blank" }) {
  return (
    <svg className={styles.cell} viewBox="0 0 100 100" aria-hidden="true">
      <rect x="1" y="1" width="98" height="98" className={styles.box} />
      <path d="M50 1V99M1 50H99" className={styles.guide} />
      {ch && mode !== "blank" && (
        <text
          x="50"
          y="52"
          textAnchor="middle"
          dominantBaseline="central"
          className={
            mode === "solid" ? styles.solid : mode === "dotted" ? styles.dotted : styles.light
          }
        >
          {ch}
        </text>
      )}
    </svg>
  );
}

export default function TracingSheet() {
  const [text, setText] = useState("가나다라\n사과\n학교");
  const [size, setSize] = useState("m");
  const [style, setStyle] = useState<Style>("dotted");
  const [blankEnd, setBlankEnd] = useState(true);
  const [nameLine, setNameLine] = useState(true);

  const sz = SIZES.find((s) => s.id === size) ?? SIZES[1];

  const lines = useMemo(
    () =>
      text
        .split("\n")
        .map((l) => Array.from(l.replace(/\s/g, "")).slice(0, MAX_CHARS))
        .filter((l) => l.length > 0),
    [text],
  );
  const over = lines.length > sz.rows;
  const shown = lines.slice(0, sz.rows);

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <label htmlFor="tr-text" className={styles.label}>
          연습할 글자 (한 줄에 낱말 하나, 최대 {MAX_CHARS}글자)
        </label>
        <textarea
          id="tr-text"
          className={styles.textarea}
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"예)\n가나다\n사과"}
        />

        <div className={styles.row}>
          <span className={styles.label}>크기</span>
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.chip} ${size === s.id ? styles.chipOn : ""}`}
              aria-pressed={size === s.id}
              onClick={() => setSize(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className={styles.row}>
          <span className={styles.label}>글씨 모양</span>
          <button
            type="button"
            className={`${styles.chip} ${style === "dotted" ? styles.chipOn : ""}`}
            aria-pressed={style === "dotted"}
            onClick={() => setStyle("dotted")}
          >
            점선
          </button>
          <button
            type="button"
            className={`${styles.chip} ${style === "light" ? styles.chipOn : ""}`}
            aria-pressed={style === "light"}
            onClick={() => setStyle("light")}
          >
            연한 글씨
          </button>
        </div>
        <div className={styles.row}>
          <label className={styles.check}>
            <input type="checkbox" checked={blankEnd} onChange={(e) => setBlankEnd(e.target.checked)} />
            끝 칸은 비워서 혼자 써 보기
          </label>
          <label className={styles.check}>
            <input type="checkbox" checked={nameLine} onChange={(e) => setNameLine(e.target.checked)} />
            이름·날짜 줄 넣기
          </label>
        </div>

        {over && (
          <p className={styles.warn} role="status">
            이 크기는 한 장에 {sz.rows}줄까지 들어가요. 뒤의 {lines.length - sz.rows}줄은 빠져요.
          </p>
        )}

        <button type="button" className="btn btn-primary" onClick={() => window.print()} disabled={!shown.length}>
          인쇄하기
        </button>
        <p className={styles.hint}>
          입력한 글자는 이 기기에서만 쓰여요. 서버로 보내지 않아요. 인쇄 창에서 &quot;PDF로 저장&quot;도 고를 수 있어요.
        </p>
      </div>

      <div className={styles.sheetWrap}>
        <div className={styles.sheet} style={{ ["--cols" as string]: sz.cols }}>
          <h2 className={styles.title}>따라 써 봐요</h2>
          {nameLine && (
            <div className={styles.nameLine}>
              <span>이름</span>
              <span className={styles.blank} />
              <span>날짜</span>
              <span className={styles.blank} />
            </div>
          )}
          {shown.length === 0 && <p className={styles.empty}>위에 글자를 입력하면 연습지가 만들어져요.</p>}
          {shown.map((chars, r) => (
            <div key={r} className={styles.line}>
              {Array.from({ length: sz.cols }, (_, i) => {
                const ch = chars[i % chars.length];
                const isBlankEnd = blankEnd && i >= sz.cols - 2 && sz.cols > chars.length + 2;
                const mode = isBlankEnd ? "blank" : i < chars.length ? "solid" : style;

                return <Cell key={i} ch={ch} mode={mode} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
