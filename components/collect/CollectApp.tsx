"use client";

import { useCallback, useEffect, useState } from "react";
import { deriveItem, guessLevel, readWorkbook, suggestOutputs } from "@/lib/collect/engine";
import { bufToB64, emptyProject, loadProjects, saveProjects } from "@/lib/collect/storage";
import type { Item, Project } from "@/lib/collect/types";
import StepForm from "./StepForm";
import StepOutput from "./StepOutput";
import StepRun, { type PickedFile } from "./StepRun";
import StepSchools from "./StepSchools";
import styles from "./collect.module.css";

const STEPS = ["학교용 양식", "학교 목록", "교육청용 양식", "수합하기"];

const DEMO_FILES = [
  "가나초등학교", "노을통합학교", "다라초등학교", "마바초등학교", "무지개통합학교", "산들중학교",
  "새봄고등학교", "새봄고등학교_수정", "수합_한빛", "엉뚱한초등학교", "은하고등학교", "자차초등학교",
  "푸른중_학급현황", "하늘고등학교", "한빛고등학교", "해돋이중학교",
].map((n) => `${n}.xlsx`);
const DEMO_SCHOOLS = [
  "가나초등학교", "다라초등학교", "마바초등학교", "사아초등학교", "자차초등학교",
  "해돋이중학교", "푸른중학교", "산들중학교", "한빛중학교",
  "한빛고등학교", "새봄고등학교", "은하고등학교", "하늘고등학교",
  "무지개통합학교", "노을통합학교",
];

async function fetchBuf(name: string) {
  const res = await fetch(`/collect-sample/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(name);
  return res.arrayBuffer();
}

function SecurityNote() {
  return (
    <div className={`${styles.notice} ${styles.ok}`} role="note">
      <strong>🔒 학생 정보는 서버에 저장되지 않아요</strong>
      <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
        <li>올린 엑셀 파일은 서버로 전송되지 않아요. 이 브라우저 안에서만 읽고 계산해요.</li>
        <li>학교에서 받은 파일과 계산 결과는 어디에도 저장하지 않아요. 새로고침하거나 창을 닫으면 사라져요.</li>
        <li>이 기기에는 양식과 학교 목록 설정만 저장돼요. 공용 컴퓨터에서는 다 쓰고 나서 수합 설정을 지워 주세요.</li>
      </ul>
    </div>
  );
}

export default function CollectApp() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cur, setCur] = useState<Project | null>(null);
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [saveFail, setSaveFail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setProjects(loadProjects());
    setLoaded(true);
  }, []);

  const persist = useCallback((p: Project) => {
    setProjects((all) => {
      const next = all.some((x) => x.id === p.id) ? all.map((x) => (x.id === p.id ? p : x)) : [...all, p];
      setSaveFail(!saveProjects(next));
      return next;
    });
  }, []);

  const update = useCallback(
    (patch: Partial<Project>) => {
      setCur((c) => {
        if (!c) return c;
        const n = { ...c, ...patch, updatedAt: Date.now() };
        persist(n);
        return n;
      });
    },
    [persist],
  );

  const create = () => {
    const name = prompt("수합 이름을 정해 주세요. 예: 2026 특수교육 현황", "")?.trim();
    if (!name) return;
    const p = emptyProject(name);
    persist(p);
    setCur(p);
    setStep(0);
    setFiles([]);
  };

  const open = (p: Project) => {
    setCur(p);
    setFiles([]);
    setStep(p.items.length && p.schools.length && p.outputs.length ? 3 : 0);
  };

  const remove = (p: Project) => {
    if (!confirm(`'${p.name}' 설정을 지울까요? (올린 파일은 저장되지 않아서 영향이 없어요)`)) return;
    setProjects((all) => {
      const next = all.filter((x) => x.id !== p.id);
      setSaveFail(!saveProjects(next));
      return next;
    });
  };

  const loadDemo = async () => {
    setBusy(true);
    setErr("");
    try {
      const formBuf = await fetchBuf("학교용_양식_예시.xlsx");
      const tplBuf = await fetchBuf("교육청용_양식_예시.xlsx");
      const formWb = await readWorkbook(formBuf);
      const ws = formWb.worksheets[0];
      const clicks: [number, number, "table" | "pair"][] = [[3, 2, "pair"], [4, 2, "pair"], [5, 2, "pair"], [15, 2, "pair"]];
      for (let r = 8; r <= 12; r++) clicks.push([r, 2, "table"], [r, 3, "table"]);
      const items: Item[] = clicks.map(([r, c, m]) => deriveItem(ws, r, c, m).item!);
      items[0].role = "school";
      items[1].role = "level";
      const tplWb = await readWorkbook(tplBuf);
      const outputs = suggestOutputs(tplWb.worksheets[0], items);
      const p: Project = {
        ...emptyProject("예시: 특수교육 현황 수합"),
        formName: "학교용_양식_예시.xlsx",
        formB64: bufToB64(formBuf),
        templateName: "교육청용_양식_예시.xlsx",
        templateB64: bufToB64(tplBuf),
        items,
        outputs,
        schools: DEMO_SCHOOLS.map((name) => ({ name, level: guessLevel(name) })),
      };
      const picked: PickedFile[] = [];
      for (const name of DEMO_FILES) {
        picked.push({ key: name, name, mtime: Date.now() - (name.includes("수정") ? 0 : 86400000), buf: await fetchBuf(name) });
      }
      persist(p);
      setCur(p);
      setFiles(picked);
      setStep(3);
    } catch {
      setErr("예시를 불러오지 못했어요. 잠시 뒤 다시 눌러 주세요.");
    } finally {
      setBusy(false);
    }
  };

  if (!loaded) return null;

  if (!cur) {
    return (
      <div className={styles.app}>
        <div className={styles.panel}>
          <h2>엑셀 파일 취합</h2>
          <p className={styles.help}>
            여러 학교에서 받은 엑셀 파일을 모아 계산하고, 제출할 양식에 채워 줘요. 학교마다 칸의 위치가 달라도
            <b> 칸의 이름</b>으로 찾아요. 모든 처리는 <b>이 기기 안에서만</b> 이루어져서 학생 정보가 밖으로 나가지 않아요.
          </p>
          <div className={styles.row}>
            <button type="button" className="btn btn-primary btn-small" onClick={create}>새 수합 만들기</button>
            <button type="button" className="btn btn-outline btn-small" onClick={loadDemo} disabled={busy}>
              {busy ? "불러오는 중…" : "예시로 먼저 해 보기"}
            </button>
          </div>
          {err && <div className={`${styles.notice} ${styles.err}`}>{err}</div>}
        </div>
        <SecurityNote />
        {projects.length > 0 && (
          <div className={styles.projects}>
            {projects.map((p) => (
              <div key={p.id} className={styles.proj}>
                <strong>{p.name}</strong>
                <span className={styles.meta}>
                  항목 {p.items.length}개 · 학교 {p.schools.length}곳 · 채울 칸 {p.outputs.length}개
                </span>
                <div className={styles.row}>
                  <button type="button" className="btn btn-primary btn-small" onClick={() => open(p)}>열기</button>
                  <button type="button" className="btn btn-outline btn-small" onClick={() => remove(p)}>지우기</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className={styles.help}>양식과 학교 목록 설정은 이 기기의 브라우저에만 저장돼요. 학교에서 받은 파일은 저장하지 않아요.</p>
      </div>
    );
  }

  const done = [cur.items.length > 0, cur.schools.length > 0, cur.outputs.length > 0, false];

  return (
    <div className={styles.app}>
      <div className={styles.row}>
        <button type="button" className="btn btn-outline btn-small" onClick={() => setCur(null)}>← 수합 목록</button>
        <strong>{cur.name}</strong>
        {saveFail && <span className={styles.meta}>저장 공간이 부족해 설정을 저장하지 못했어요.</span>}
      </div>
      <div className={styles.steps} role="tablist" aria-label="단계">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={step === i}
            className={`${styles.step} ${step === i ? styles.stepOn : ""} ${done[i] ? styles.stepDone : ""}`}
            onClick={() => setStep(i)}
          >
            <span className={styles.stepNum}>{done[i] ? "✓" : i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      {step === 3 && <SecurityNote />}
      {step === 0 && <StepForm project={cur} update={update} />}
      {step === 1 && <StepSchools project={cur} update={update} />}
      {step === 2 && <StepOutput project={cur} update={update} />}
      {step === 3 && <StepRun project={cur} update={update} files={files} setFiles={setFiles} />}
      <div className={styles.row}>
        {step > 0 && <button type="button" className="btn btn-outline btn-small" onClick={() => setStep(step - 1)}>← 이전</button>}
        <span className={styles.sp} />
        {step < 3 && <button type="button" className="btn btn-primary btn-small" onClick={() => setStep(step + 1)}>다음 →</button>}
      </div>
    </div>
  );
}
