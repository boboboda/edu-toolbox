"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./NamePicker.module.css";

type Mode = "one" | "order" | "group";

const MAX_NAMES = 60;

// 안전한 난수 (브라우저 암호용 난수)
const rand = (n: number) => {
  const a = new Uint32Array(1);

  crypto.getRandomValues(a);

  return a[0] % n;
};
const shuffle = <T,>(list: T[]): T[] => {
  const a = [...list];

  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);

    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
};

export default function NamePicker() {
  // 이름은 이 화면의 메모리에만 있어요. 저장하지 않아요.
  const [raw, setRaw] = useState("1번\n2번\n3번\n4번\n5번\n6번");
  const [mode, setMode] = useState<Mode>("one");
  const [count, setCount] = useState(6);
  const [removePicked, setRemovePicked] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [spin, setSpin] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[][]>([]);
  const [groupBy, setGroupBy] = useState<"count" | "size">("count");
  const [groupN, setGroupN] = useState(3);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const names = useMemo(() => {
    const seen = new Set<string>();

    return raw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => {
        if (!s || seen.has(s)) return false;
        seen.add(s);

        return true;
      })
      .slice(0, MAX_NAMES);
  }, [raw]);

  const pool = removePicked ? names.filter((n) => !picked.includes(n)) : names;

  const resetResults = () => {
    setPicked([]);
    setWinner(null);
    setOrder([]);
    setGroups([]);
  };

  const makeNumbers = () => {
    const n = Math.min(MAX_NAMES, Math.max(1, count));

    setRaw(Array.from({ length: n }, (_, i) => `${i + 1}번`).join("\n"));
    resetResults();
  };

  const pickOne = () => {
    if (!pool.length || spin) return;
    const result = pool[rand(pool.length)];
    let ticks = 0;

    setWinner(null);
    timer.current = setInterval(() => {
      ticks++;
      setSpin(pool[rand(pool.length)]);
      if (ticks >= 14) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setSpin(null);
        setWinner(result);
        setPicked((p) => [...p, result]);
      }
    }, 90);
  };

  const makeOrder = () => setOrder(shuffle(names));

  const makeGroups = () => {
    if (!names.length) return;
    const k = groupBy === "count" ? Math.min(groupN, names.length) : Math.ceil(names.length / Math.max(1, groupN));
    const out: string[][] = Array.from({ length: k }, () => []);

    shuffle(names).forEach((n, i) => out[i % k].push(n));
    setGroups(out);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 복사가 막혀 있으면 넘어가요
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <label htmlFor="pk-names" className={styles.label}>
          이름 또는 번호 ({names.length}명 / 최대 {MAX_NAMES}명)
        </label>
        <textarea
          id="pk-names"
          className={styles.textarea}
          rows={5}
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            resetResults();
          }}
        />
        <div className={styles.row}>
          <label htmlFor="pk-count" className={styles.small}>번호로 만들기</label>
          <input
            id="pk-count"
            type="number"
            min={1}
            max={MAX_NAMES}
            className={styles.num}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <span className={styles.small}>번까지</span>
          <button type="button" className="btn btn-outline btn-small" onClick={makeNumbers}>
            채우기
          </button>
        </div>
        <p className={styles.hint}>
          이름은 이 화면에만 있고 서버로 보내지 않아요. 저장도 안 해서 새로고침하면 사라져요. 학생 이름 대신 번호를 써도 돼요.
        </p>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="방법">
        {(
          [
            ["one", "한 명 뽑기"],
            ["order", "순서 정하기"],
            ["group", "모둠 나누기"],
          ] as [Mode, string][]
        ).map(([id, name]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            className={`${styles.tab} ${mode === id ? styles.tabOn : ""}`}
            onClick={() => setMode(id)}
          >
            {name}
          </button>
        ))}
      </div>

      {mode === "one" && (
        <div className={styles.result}>
          <div className={styles.big} aria-live="polite">
            {spin ?? winner ?? (names.length ? "누가 뽑힐까요?" : "이름을 먼저 넣어요")}
          </div>
          <label className={styles.check}>
            <input type="checkbox" checked={removePicked} onChange={(e) => setRemovePicked(e.target.checked)} />
            뽑힌 사람은 빼고 뽑기
          </label>
          <div className={styles.row}>
            <button type="button" className="btn btn-primary" onClick={pickOne} disabled={!pool.length || !!spin}>
              {pool.length ? "뽑기" : "모두 뽑았어요"}
            </button>
            {picked.length > 0 && (
              <button type="button" className="btn btn-outline" onClick={resetResults}>
                처음부터 다시
              </button>
            )}
          </div>
          {picked.length > 0 && (
            <p className={styles.small}>
              지금까지 뽑힌 순서: {picked.join(" → ")}
            </p>
          )}
        </div>
      )}

      {mode === "order" && (
        <div className={styles.result}>
          <button type="button" className="btn btn-primary" onClick={makeOrder} disabled={!names.length}>
            순서 섞기
          </button>
          {order.length > 0 && (
            <>
              <ol className={styles.orderList}>
                {order.map((n, i) => (
                  <li key={n} className={styles.orderItem}>
                    <span className={styles.no}>{i + 1}</span>
                    {n}
                  </li>
                ))}
              </ol>
              <button type="button" className="btn btn-outline btn-small" onClick={() => copy(order.map((n, i) => `${i + 1}. ${n}`).join("\n"))}>
                결과 복사
              </button>
            </>
          )}
        </div>
      )}

      {mode === "group" && (
        <div className={styles.result}>
          <div className={styles.row}>
            <button
              type="button"
              className={`${styles.chip} ${groupBy === "count" ? styles.chipOn : ""}`}
              aria-pressed={groupBy === "count"}
              onClick={() => setGroupBy("count")}
            >
              모둠 수로
            </button>
            <button
              type="button"
              className={`${styles.chip} ${groupBy === "size" ? styles.chipOn : ""}`}
              aria-pressed={groupBy === "size"}
              onClick={() => setGroupBy("size")}
            >
              한 모둠 인원으로
            </button>
            <label htmlFor="pk-gn" className={styles.small}>{groupBy === "count" ? "모둠 수" : "인원"}</label>
            <input
              id="pk-gn"
              type="number"
              min={1}
              max={20}
              className={styles.num}
              value={groupN}
              onChange={(e) => setGroupN(Math.min(20, Math.max(1, Number(e.target.value))))}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={makeGroups} disabled={!names.length}>
            모둠 나누기
          </button>
          {groups.length > 0 && (
            <>
              <div className={styles.groups}>
                {groups.map((g, i) => (
                  <div key={i} className={styles.group}>
                    <p className={styles.groupTitle}>{i + 1}모둠 ({g.length}명)</p>
                    <ul>
                      {g.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-outline btn-small" onClick={() => copy(groups.map((g, i) => `${i + 1}모둠: ${g.join(", ")}`).join("\n"))}>
                결과 복사
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
