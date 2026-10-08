"use client";

import { useEffect, useMemo, useState } from "react";
import { addrOf, describeSrc, readWorkbook, suggestOutputs, toGrid } from "@/lib/collect/engine";
import { b64ToBuf, bufToB64 } from "@/lib/collect/storage";
import { LEVELS, type Level, type OutCell, type OutSource, type Project } from "@/lib/collect/types";
import type { Workbook } from "exceljs";
import SheetGrid from "./SheetGrid";
import styles from "./collect.module.css";

type Props = {
  project: Project;
  update: (patch: Partial<Project>) => void;
};

type Kind = OutSource["type"];
const KIND_LABEL: Record<Kind, string> = {
  sum: "항목 합계",
  submitted: "제출 학교 수",
  target: "대상 학교 수",
  levels: "수합 대상 학교급 (글자)",
  date: "작성일 (글자)",
};

export default function StepOutput({ project, update }: Props) {
  const [wb, setWb] = useState<Workbook | null>(null);
  const [sheet, setSheet] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    if (!project.templateB64) return;
    readWorkbook(b64ToBuf(project.templateB64))
      .then((w) => {
        if (!alive) return;
        setWb(w);
        setSheet((s) => s || w.worksheets[0]?.name || "");
      })
      .catch(() => alive && setMsg("저장된 교육청용 양식을 열 수 없어요. 다시 올려 주세요."));
    return () => {
      alive = false;
    };
  }, [project.templateB64]);

  const ws = wb?.getWorksheet(sheet) ?? wb?.worksheets[0];
  const grid = useMemo(() => (ws ? toGrid(ws) : null), [ws]);
  const valueItems = project.items.filter((i) => i.role === "value");

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setMsg("");
    if (!/\.xlsx$/i.test(f.name)) {
      setMsg("엑셀(.xlsx) 파일만 쓸 수 있어요. .xls 파일은 엑셀에서 '다른 이름으로 저장 → .xlsx'로 바꿔 주세요.");
      return;
    }
    if (project.outputs.length && !confirm("새 양식을 올리면 지금까지 정한 채울 칸이 지워져요. 계속할까요?")) return;
    try {
      const buf = await f.arrayBuffer();
      const w = await readWorkbook(buf);
      setWb(w);
      setSheet(w.worksheets[0]?.name ?? "");
      setSel(null);
      update({ templateName: f.name, templateB64: bufToB64(buf), outputs: [] });
    } catch {
      setMsg("이 파일을 열 수 없어요. 암호가 걸려 있거나 손상된 파일일 수 있어요.");
    }
  };

  const outAt = (addr: string) => project.outputs.find((o) => o.sheet === (ws?.name ?? "") && o.addr === addr);
  const current = sel ? outAt(sel) : undefined;

  const onPick = (r: number, c: number) => {
    if (!ws) return;
    const g = (ws.model as unknown as { merges?: string[] }).merges ?? [];
    let addr = addrOf(r, c);
    // 병합 칸이면 왼쪽 위 칸으로
    for (const m of g) {
      const p = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(m);
      if (!p) continue;
      const toN = (s: string) => [...s].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
      if (r >= +p[2] && r <= +p[4] && c >= toN(p[1]) && c <= toN(p[3])) addr = `${p[1]}${p[2]}`;
    }
    setSel(addr);
  };

  const setOut = (addr: string, src: OutSource | null) => {
    if (!ws) return;
    const rest = project.outputs.filter((o) => !(o.sheet === ws.name && o.addr === addr));
    update({ outputs: src ? [...rest, { addr, sheet: ws.name, src }] : rest });
  };

  const suggest = () => {
    if (!ws) return;
    const found = suggestOutputs(ws, project.items);
    const fresh = found.filter((f) => !outAt(f.addr));
    update({ outputs: [...project.outputs, ...fresh] });
    setMsg(
      found.length
        ? `${fresh.length}칸을 자동으로 연결했어요. 아래 목록과 표에서 맞는지 확인해 주세요.`
        : "자동으로 연결할 칸을 찾지 못했어요. 칸을 눌러 직접 정해 주세요.",
    );
  };

  const marks: Record<string, "out" | "sel"> = {};
  for (const o of project.outputs) if (o.sheet === (ws?.name ?? "")) marks[o.addr] = "out";
  if (sel) marks[sel] = "sel";

  const src: OutSource | undefined = current?.src;
  const kind: Kind = src?.type ?? "sum";
  const lvOf = (s?: OutSource): "all" | Level => (s && "level" in s ? s.level : "all");

  const changeKind = (k: Kind) => {
    if (!sel) return;
    const level = lvOf(src);
    const next: OutSource =
      k === "sum" ? { type: "sum", itemIds: src?.type === "sum" ? src.itemIds : [], level }
      : k === "submitted" ? { type: "submitted", level }
      : k === "target" ? { type: "target", level }
      : k === "levels" ? { type: "levels" }
      : { type: "date" };
    setOut(sel, next);
  };

  const sorted = [...project.outputs].sort((a, b) => a.sheet.localeCompare(b.sheet) || a.addr.localeCompare(b.addr, undefined, { numeric: true }));

  return (
    <div className={styles.panel}>
      <h2>3. 교육청용 양식 등록</h2>
      <p className={styles.help}>
        학교에서 받은 값을 모아 <b>교육청에 제출할 엑셀 양식(교육청용)</b>을 올리세요. 값을 채울 칸을 누르고 무엇을 넣을지 고르면,
        수합이 끝났을 때 그 칸에 자동으로 채워 줘요. 합계 같은 <b>수식은 그대로</b> 유지돼요.
      </p>
      {project.items.length === 0 && (
        <div className={styles.notice}>먼저 1단계에서 학교용 양식의 항목을 골라야 항목 합계를 연결할 수 있어요.</div>
      )}
      <div className={styles.row}>
        <label className={`btn btn-primary btn-small ${styles.fileBtn}`}>
          {project.templateName ? "다른 양식 올리기" : "교육청용 양식 올리기 (.xlsx)"}
          <input type="file" accept=".xlsx" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {project.templateName && <span className={styles.meta}>{project.templateName}</span>}
        {wb && wb.worksheets.length > 1 && (
          <select className={styles.select} value={ws?.name} onChange={(e) => { setSheet(e.target.value); setSel(null); }} aria-label="시트 선택">
            {wb.worksheets.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        )}
        {grid && (
          <button type="button" className="btn btn-outline btn-small" onClick={suggest} disabled={!project.items.length}>
            이름을 보고 자동 연결
          </button>
        )}
      </div>
      {msg && <div className={styles.notice}>{msg}</div>}

      {grid && (
        <>
          <p className={styles.help}>파란 칸은 이미 연결된 칸이에요. 칸을 누르면 아래에서 무엇을 넣을지 정할 수 있어요.</p>
          <SheetGrid grid={grid} marks={marks} onPick={onPick} />
        </>
      )}

      {sel && (
        <div className={styles.item} style={{ flexDirection: "column", alignItems: "stretch" }}>
          <div className={styles.row}>
            <strong>{sel} 칸에 넣을 값</strong>
            <select className={styles.select} value={current ? kind : ""} onChange={(e) => changeKind(e.target.value as Kind)} aria-label="넣을 값의 종류">
              {!current && <option value="">선택하세요</option>}
              {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                <option key={k} value={k}>{KIND_LABEL[k]}</option>
              ))}
            </select>
            {src && "level" in src && (
              <select className={styles.select} value={src.level} onChange={(e) => setOut(sel, { ...src, level: e.target.value as "all" | Level })} aria-label="학교급 범위">
                <option value="all">전체 학교급</option>
                {LEVELS.map((lv) => (
                  <option key={lv} value={lv}>{lv}만</option>
                ))}
              </select>
            )}
            {current && (
              <button type="button" className="btn btn-outline btn-small" onClick={() => setOut(sel, null)}>이 칸 연결 끊기</button>
            )}
          </div>
          {src?.type === "sum" && (
            <div className={styles.list}>
              <span className={styles.meta}>더할 항목을 고르세요. 여러 개를 고르면 모두 더해요.</span>
              <div className={styles.row}>
                <button type="button" className={`btn btn-outline ${styles.small}`} onClick={() => setOut(sel, { ...src, itemIds: valueItems.map((i) => i.id) })}>전체 선택</button>
                <button type="button" className={`btn btn-outline ${styles.small}`} onClick={() => setOut(sel, { ...src, itemIds: [] })}>선택 해제</button>
              </div>
              {valueItems.map((i) => (
                <label key={i.id} className={styles.check}>
                  <input
                    type="checkbox"
                    checked={src.itemIds.includes(i.id)}
                    onChange={(e) =>
                      setOut(sel, { ...src, itemIds: e.target.checked ? [...src.itemIds, i.id] : src.itemIds.filter((x) => x !== i.id) })
                    }
                  />
                  {i.name}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {sorted.length > 0 && (
        <div className={styles.list}>
          <h3>연결된 칸 {sorted.length}개</h3>
          <div className={styles.tblWrap}>
            <table className={styles.tbl}>
              <thead>
                <tr><th>칸</th><th>들어갈 값</th></tr>
              </thead>
              <tbody>
                {sorted.map((o: OutCell) => (
                  <tr key={`${o.sheet}!${o.addr}`} onClick={() => { setSheet(o.sheet); setSel(o.addr); }} style={{ cursor: "pointer" }}>
                    <td>{o.addr}</td>
                    <td>{describeSrc(o.src, project.items)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
