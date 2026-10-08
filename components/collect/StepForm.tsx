"use client";

import { useEffect, useMemo, useState } from "react";
import { deriveItem, readWorkbook, suggestItems, toGrid } from "@/lib/collect/engine";
import { b64ToBuf, bufToB64 } from "@/lib/collect/storage";
import type { Item, Project } from "@/lib/collect/types";
import type { Workbook } from "exceljs";
import SheetGrid from "./SheetGrid";
import styles from "./collect.module.css";

type Props = {
  project: Project;
  update: (patch: Partial<Project>) => void;
};

const ROLE_LABEL: Record<Item["role"], string> = {
  value: "숫자 항목",
  school: "학교명 칸",
  level: "학교급 칸",
};

export default function StepForm({ project, update }: Props) {
  const [wb, setWb] = useState<Workbook | null>(null);
  const [sheet, setSheet] = useState("");
  const [msg, setMsg] = useState("");

  // 저장된 양식 불러오기
  useEffect(() => {
    let alive = true;
    if (!project.formB64) return;
    readWorkbook(b64ToBuf(project.formB64))
      .then((w) => {
        if (!alive) return;
        setWb(w);
        setSheet((s) => s || w.worksheets[0]?.name || "");
      })
      .catch(() => alive && setMsg("저장된 양식을 열 수 없어요. 다시 올려 주세요."));
    return () => {
      alive = false;
    };
  }, [project.formB64]);

  const ws = wb?.getWorksheet(sheet) ?? wb?.worksheets[0];
  const grid = useMemo(() => (ws ? toGrid(ws) : null), [ws]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setMsg("");
    if (!/\.xlsx$/i.test(f.name)) {
      setMsg("엑셀(.xlsx) 파일만 쓸 수 있어요. .xls 파일은 엑셀에서 '다른 이름으로 저장 → .xlsx'로 바꿔 주세요.");
      return;
    }
    if (project.items.length && !confirm("새 양식을 올리면 지금까지 고른 항목이 지워져요. 계속할까요?")) return;
    try {
      const buf = await f.arrayBuffer();
      const w = await readWorkbook(buf);
      setWb(w);
      setSheet(w.worksheets[0]?.name ?? "");
      update({ formName: f.name, formB64: bufToB64(buf), items: suggestItems(w.worksheets[0]), outputs: [] });
    } catch {
      setMsg("이 파일을 열 수 없어요. 암호가 걸려 있거나 손상된 파일일 수 있어요.");
    }
  };

  const onPick = (r: number, c: number) => {
    if (!ws) return;
    setMsg("");
    const d = deriveItem(ws, r, c, "auto");
    if (!d.item) {
      setMsg(d.error ?? "");
      return;
    }
    const same = project.items.find((i) => i.sheet === d.item!.sheet && i.addr === d.item!.addr);
    if (same) {
      update({ items: project.items.filter((i) => i.id !== same.id) });
      return;
    }
    update({ items: [...project.items, d.item] });
  };

  const patchItem = (id: string, patch: Partial<Item>) =>
    update({ items: project.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) });

  const setRole = (id: string, role: Item["role"]) => {
    // 학교명·학교급 칸은 하나씩만
    update({
      items: project.items.map((i) => {
        if (i.id === id) return { ...i, role };
        if (role !== "value" && i.role === role) return { ...i, role: "value" };
        return i;
      }),
    });
  };

  const marks: Record<string, "picked"> = {};
  for (const i of project.items) if (i.sheet === (ws?.name ?? "")) marks[i.addr] = "picked";

  const hasSchool = project.items.some((i) => i.role === "school");

  return (
    <div className={styles.panel}>
      <h2>1. 학교에 나눠 줄 양식 올리기</h2>
      <p className={styles.help}>
        학교에서 숫자를 적는 엑셀 파일(학교용 양식)을 올려 주세요. 올리면 <b>숫자를 적는 빈칸을 자동으로 찾아서
        초록색으로 표시</b>해요. 파일은 이 기기 안에서만 읽고 어디에도 보내지 않아요.
      </p>
      <div className={styles.row}>
        <label className={`btn btn-primary btn-small ${styles.fileBtn}`}>
          {project.formName ? "다른 양식 올리기" : "학교용 양식 올리기 (.xlsx)"}
          <input type="file" accept=".xlsx" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {project.formName && <span className={styles.meta}>{project.formName}</span>}
        {wb && wb.worksheets.length > 1 && (
          <select className={styles.select} value={ws?.name} onChange={(e) => setSheet(e.target.value)} aria-label="시트 선택">
            {wb.worksheets.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        )}
      </div>
      {msg && <div className={`${styles.notice} ${styles.err}`}>{msg}</div>}

      {grid && (
        <>
          <p className={styles.help}>
            <b>초록색 칸이 맞는지 확인하세요.</b> 빠진 칸은 눌러서 넣고, 잘못 잡힌 칸은 다시 눌러서 빼세요.
          </p>
          <div className={styles.row}>
            <button type="button" className="btn btn-outline btn-small" onClick={() => ws && update({ items: suggestItems(ws) })}>
              처음부터 다시 자동으로 찾기
            </button>
          </div>
          <SheetGrid grid={grid} marks={marks} onPick={onPick} />
        </>
      )}

      {project.items.length > 0 && (
        <div className={styles.list}>
          <h3>고른 항목 {project.items.length}개</h3>
          {project.items.map((i) => (
            <div key={i.id} className={styles.item}>
              <input className={`${styles.input} ${styles.itemName}`} value={i.name} onChange={(e) => patchItem(i.id, { name: e.target.value })} aria-label="항목 이름" />
              <select className={styles.select} value={i.role} onChange={(e) => setRole(i.id, e.target.value as Item["role"])} aria-label="칸의 종류">
                {(Object.keys(ROLE_LABEL) as Item["role"][]).map((r) => (
                  <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                ))}
              </select>
              <span className={styles.meta}>
                {i.kind === "table" ? `행 '${i.rowLabel}' / 열 '${i.colLabel}'` : `이름 '${i.label}' 옆`}
              </span>
              <button type="button" className={styles.x} onClick={() => update({ items: project.items.filter((x) => x.id !== i.id) })} aria-label={`${i.name} 삭제`}>✕</button>
            </div>
          ))}
          {!hasSchool && (
            <div className={styles.notice}>
              학교명이 적힌 칸을 &quot;학교명 칸&quot;으로 바꿔 두면 파일 안의 학교 이름으로 학교를 찾아요.
              지정하지 않으면 파일 이름으로만 찾아요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
