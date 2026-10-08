"use client";

import { useEffect, useMemo, useState } from "react";
import { analyze, buildReport, fillTemplate, parseCollected, readWorkbook } from "@/lib/collect/engine";
import { b64ToBuf } from "@/lib/collect/storage";
import { LEVELS, type Analyzed, type Level, type Parsed, type Project } from "@/lib/collect/types";
import styles from "./collect.module.css";

export type PickedFile = { key: string; name: string; mtime: number; buf: ArrayBuffer };

type Props = {
  project: Project;
  update: (patch: Partial<Project>) => void;
  files: PickedFile[];
  setFiles: (f: PickedFile[]) => void;
};

const stClass = (s: string) =>
  s === "정상" ? styles.stOk : s === "경고" ? styles.stWarn : s === "오류" || s === "미제출" ? styles.stErr : styles.stMuted;

const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function StepRun({ project, update, files, setFiles }: Props) {
  const [parsed, setParsed] = useState<Parsed[]>([]);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [date, setDate] = useState(today);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const itemsSig = useMemo(
    () => JSON.stringify(project.items.map((i) => [i.id, i.kind, i.rowLabel, i.colLabel, i.label, i.role, i.sheet])),
    [project.items],
  );

  // 파일을 읽어 항목을 뽑음 (양식 항목이 바뀌면 다시 읽음)
  useEffect(() => {
    let alive = true;
    (async () => {
      setBusy(true);
      const out: Parsed[] = [];
      for (const f of files) {
        try {
          const wb = await readWorkbook(f.buf);
          out.push(parseCollected(wb, project.items, { file: f.name, mtime: f.mtime }));
        } catch (e) {
          out.push({
            key: f.key, file: f.name, mtime: f.mtime, declared: null, declaredLevel: null, values: {}, ok: false,
            issues: [{ level: "error", msg: "엑셀 파일을 열 수 없음: " + (e instanceof Error ? e.message : "알 수 없는 오류") }],
          });
        }
      }
      if (alive) {
        setParsed(out);
        setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, itemsSig]);

  const an = useMemo(
    () => analyze(parsed, project, assign, excluded),
    [parsed, project, assign, excluded],
  );

  const addFiles = (list: FileList | File[] | null) => {
    if (!list) return;
    const arr = Array.from(list);
    const bad = arr.filter((f) => !/\.xlsx$/i.test(f.name));
    const good = arr.filter((f) => /\.xlsx$/i.test(f.name) && !f.name.startsWith("~$"));
    setMsg(bad.length ? `엑셀(.xlsx)이 아니라서 건너뛴 파일 ${bad.length}개: ${bad.map((f) => f.name).join(", ")}` : "");
    Promise.all(
      good.map(async (f) => ({ key: f.name, name: f.name, mtime: f.lastModified, buf: await f.arrayBuffer() })),
    ).then((read) => {
      const map = new Map(files.map((f) => [f.key, f]));
      read.forEach((r) => map.set(r.key, r));
      setFiles([...map.values()]);
    });
  };

  const toggleLevel = (lv: Level) => {
    const has = project.targetLevels.includes(lv);
    update({ targetLevels: has ? project.targetLevels.filter((x) => x !== lv) : LEVELS.filter((x) => x === lv || project.targetLevels.includes(x)) });
  };

  const ready = project.items.length > 0 && project.schools.length > 0;
  const counts = {
    target: an.targetSchools.length,
    used: an.files.filter((f) => f.included).length,
    missing: an.status.filter((s) => s.state === "미제출").length,
    bad: an.status.filter((s) => s.state === "오류").length,
  };

  const makeResult = async () => {
    setMsg("");
    if (!project.templateB64) { setMsg("3단계에서 교육청용 양식을 먼저 올려 주세요."); return; }
    if (!project.outputs.length) { setMsg("3단계에서 값을 채울 칸을 먼저 연결해 주세요."); return; }
    const { blob, skipped } = await fillTemplate(b64ToBuf(project.templateB64), project.outputs, an, project, date);
    download(blob, "교육청용_결과.xlsx");
    if (skipped.length) setMsg(`채우지 못한 칸: ${skipped.join(", ")}`);
  };

  const fileIssues = (a: Analyzed) => a.allIssues;

  return (
    <div className={styles.panel}>
      <h2>4. 수합하기</h2>
      {!ready && (
        <div className={styles.notice}>
          {project.items.length === 0 ? "1단계에서 학교용 양식의 항목을 먼저 골라 주세요. " : ""}
          {project.schools.length === 0 ? "2단계에서 학교 목록을 먼저 넣어 주세요." : ""}
        </div>
      )}

      <div className={styles.row}>
        <strong>이번에 수합할 학교급</strong>
        {LEVELS.map((lv) => (
          <label key={lv} className={styles.check}>
            <input type="checkbox" checked={project.targetLevels.includes(lv)} onChange={() => toggleLevel(lv)} />
            {lv}
          </label>
        ))}
      </div>

      <label
        className={`${styles.drop} ${drag ? styles.dropOn : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
      >
        <strong>학교에서 받은 엑셀 파일을 여기에 끌어다 놓거나 눌러서 고르세요</strong>
        <span className={styles.meta}>여러 개를 한 번에 올릴 수 있어요. 파일은 이 기기 밖으로 나가지 않아요.</span>
        <input type="file" accept=".xlsx" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      </label>
      {msg && <div className={styles.notice}>{msg}</div>}

      {files.length > 0 && (
        <>
          <div className={styles.stats} aria-live="polite">
            <span className={styles.stat}>올린 파일 {files.length}개{busy ? " (읽는 중…)" : ""}</span>
            <span className={styles.stat}>대상 학교 {counts.target}곳</span>
            <span className={styles.stat}>집계에 포함 {counts.used}곳</span>
            <span className={styles.stat}>미제출 {counts.missing}곳</span>
            <span className={styles.stat}>오류 {counts.bad}곳</span>
          </div>

          <div className={styles.row}>
            <label className={styles.check}>
              작성일
              <input type="date" className={styles.input} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <button type="button" className="btn btn-primary btn-small" onClick={makeResult} disabled={busy || !ready}>
              교육청용 엑셀 받기
            </button>
            <button type="button" className="btn btn-outline btn-small" onClick={async () => download(await buildReport(an), "수합현황_점검.xlsx")} disabled={busy || !ready}>
              수합 현황표 받기
            </button>
            <button type="button" className="btn btn-outline btn-small" onClick={() => { if (confirm("올린 파일을 모두 지울까요?")) { setFiles([]); setAssign({}); setExcluded(new Set()); } }}>
              파일 모두 지우기
            </button>
          </div>
          <p className={styles.help}>오류가 있는 파일은 집계에서 빠져요. 아래에서 확인하고 고친 파일을 다시 올리면 같은 이름의 파일은 바뀌어요.</p>

          <h3>학교별 현황</h3>
          <div className={styles.tblWrap}>
            <table className={styles.tbl}>
              <thead><tr><th>학교</th><th>학교급</th><th>상태</th><th>파일</th><th>메모</th></tr></thead>
              <tbody>
                {an.status.map((s) => (
                  <tr key={s.school}>
                    <td>{s.school}</td>
                    <td>{s.level}</td>
                    <td className={stClass(s.state)}>{s.state}</td>
                    <td>{s.file}</td>
                    <td className={styles.meta}>{s.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>파일별 점검</h3>
          <div className={styles.tblWrap}>
            <table className={styles.tbl}>
              <thead><tr><th>파일</th><th>연결된 학교</th><th>상태</th><th>집계에서 제외</th></tr></thead>
              <tbody>
                {an.files.map((a) => (
                  <tr key={a.key}>
                    <td>
                      <button type="button" className={styles.meta} style={{ all: "unset", cursor: "pointer", textDecoration: "underline" }} onClick={() => setOpen(open === a.key ? null : a.key)} aria-expanded={open === a.key}>
                        {a.file}
                      </button>
                      {(open === a.key || a.status === "오류") && fileIssues(a).map((i, n) => (
                        <p key={n} className={`${styles.issue} ${i.level === "error" ? styles.issueErr : ""}`}>
                          {i.level === "error" ? "오류: " : "경고: "}{i.msg}
                        </p>
                      ))}
                      {open === a.key && !fileIssues(a).length && <p className={styles.issue}>문제 없음</p>}
                    </td>
                    <td>
                      <select
                        className={styles.select}
                        value={assign[a.key] ?? ""}
                        onChange={(e) => setAssign({ ...assign, [a.key]: e.target.value })}
                        aria-label={`${a.file} 학교 지정`}
                      >
                        <option value="">{a.school && !assign[a.key] ? `${a.school.name} (${a.matchBy})` : "자동 (연결 안 됨)"}</option>
                        {project.schools.map((s) => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className={stClass(a.status)}>{a.status}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={excluded.has(a.key)}
                        onChange={(e) => {
                          const n = new Set(excluded);
                          if (e.target.checked) n.add(a.key); else n.delete(a.key);
                          setExcluded(n);
                        }}
                        aria-label={`${a.file} 제외`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
