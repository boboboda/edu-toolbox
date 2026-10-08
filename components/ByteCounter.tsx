"use client";

import { useMemo, useState } from "react";
import styles from "./ByteCounter.module.css";

// NEIS 방식: 한글·한자 등 ASCII가 아닌 글자 3바이트, 영문·숫자·공백·기호 1바이트, 줄바꿈 2바이트
const byteOf = (ch: string) => (ch === "\n" ? 2 : ch.charCodeAt(0) < 128 ? 1 : 3);

const PRESETS = [
  { id: "500", name: "500자 (1500바이트)", bytes: 1500 },
  { id: "300", name: "300자 (900바이트)", bytes: 900 },
  { id: "700", name: "700자 (2100바이트)", bytes: 2100 },
  { id: "1000", name: "1000자 (3000바이트)", bytes: 3000 },
  { id: "custom", name: "직접 입력", bytes: 0 },
];

export default function ByteCounter() {
  // 입력한 글은 이 화면에만 있어요. 저장하지 않아요.
  const [text, setText] = useState("");
  const [preset, setPreset] = useState("500");
  const [custom, setCustom] = useState(1500);
  const [copied, setCopied] = useState(false);

  const limit = preset === "custom" ? Math.max(1, custom) : (PRESETS.find((p) => p.id === preset)?.bytes ?? 1500);

  const stat = useMemo(() => {
    const norm = text.replace(/\r\n?/g, "\n");
    const chars = Array.from(norm);
    let bytes = 0;
    let cut = chars.length; // 한도를 넘기 시작하는 글자 위치

    chars.forEach((ch, i) => {
      bytes += byteOf(ch);
      if (bytes > limit && cut === chars.length) cut = i;
    });
    const lines = norm === "" ? 0 : norm.split("\n").length;
    const noSpace = chars.filter((c) => !/\s/.test(c)).length;

    return {
      chars: chars.length - (norm.split("\n").length - 1), // 줄바꿈은 글자 수에서 빼요
      noSpace,
      lines,
      bytes,
      fit: chars.slice(0, cut).join(""),
      over: chars.slice(cut).join(""),
    };
  }, [text, limit]);

  const left = limit - stat.bytes;
  const pct = Math.min(100, (stat.bytes / limit) * 100);
  const level = left < 0 ? "over" : pct >= 90 ? "warn" : "ok";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 복사가 막혀 있으면 넘어가요
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <label htmlFor="bc-text" className={styles.label}>글을 붙여넣거나 써요</label>
        <textarea
          id="bc-text"
          className={styles.textarea}
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 생활기록부 문구를 붙여넣으면 바이트를 세어 줘요."
        />

        <div className={styles.row}>
          <label htmlFor="bc-limit" className={styles.label}>글자 수 기준(예시)</label>
          <select id="bc-limit" className={styles.select} value={preset} onChange={(e) => setPreset(e.target.value)}>
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {preset === "custom" && (
            <>
              <input
                type="number"
                min={1}
                className={styles.num}
                value={custom}
                aria-label="한도 바이트"
                onChange={(e) => setCustom(Number(e.target.value))}
              />
              <span>바이트</span>
            </>
          )}
        </div>

        <div className={`${styles.gauge} ${styles[level]}`}>
          <div className={styles.bar} aria-hidden="true">
            <div className={styles.fill} style={{ width: `${pct}%` }} />
          </div>
          <p className={styles.big} aria-live="polite">
            {stat.bytes.toLocaleString()} <span>/ {limit.toLocaleString()} 바이트</span>
          </p>
          <p className={styles.sub}>
            {left >= 0 ? `${left.toLocaleString()}바이트 남았어요` : `${(-left).toLocaleString()}바이트 넘었어요`}
          </p>
        </div>

        <dl className={styles.stats}>
          <div><dt>글자 수</dt><dd>{stat.chars.toLocaleString()}</dd></div>
          <div><dt>공백 뺀 글자 수</dt><dd>{stat.noSpace.toLocaleString()}</dd></div>
          <div><dt>줄 수</dt><dd>{stat.lines}</dd></div>
        </dl>

        {left < 0 && (
          <div className={styles.cutBox}>
            <p className={styles.cutTitle}>한도를 넘는 부분 (빨간 글씨)</p>
            <p className={styles.cutText}>
              {stat.fit}
              <mark>{stat.over}</mark>
            </p>
          </div>
        )}

        <div className={styles.row}>
          <button type="button" className="btn btn-outline" onClick={copy} disabled={!text}>
            {copied ? "복사했어요" : "글 복사"}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setText("")} disabled={!text}>
            지우기
          </button>
        </div>

        <p className={styles.hint}>
          세는 방법: 한글은 3바이트, 영문·숫자·공백은 1바이트, 줄바꿈은 2바이트로 셈해요. 특수문자는 NEIS에서 다르게 세는 경우가 있어서, 마지막 확인은 NEIS 화면의 숫자로 해 주세요.
          글자 수 기준은 해마다·항목마다 달라서 예시로 넣었어요. 학교생활기록부 기재요령에서 확인하고 &quot;직접 입력&quot;으로 맞춰 쓰세요.
        </p>
        <p className={styles.hint}>입력한 글은 이 화면에서만 쓰여요. 서버로 보내거나 저장하지 않아요.</p>
      </div>
    </div>
  );
}
