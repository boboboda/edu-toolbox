"use client";

import { useState } from "react";
import { guessLevel } from "@/lib/collect/engine";
import { LEVELS, type Level, type Project, type School } from "@/lib/collect/types";
import styles from "./collect.module.css";

type Props = {
  project: Project;
  update: (patch: Partial<Project>) => void;
};

export default function StepSchools({ project, update }: Props) {
  const [text, setText] = useState("");

  const add = () => {
    const have = new Set(project.schools.map((s) => s.name));
    const added: School[] = [];
    for (const line of text.split(/\r?\n/)) {
      const parts = line.split(/[\t,]/).map((x) => x.trim()).filter(Boolean);
      if (!parts.length) continue;
      const name = parts[0];
      if (have.has(name)) continue;
      have.add(name);
      const lv = parts[1] && (LEVELS as readonly string[]).includes(parts[1]) ? (parts[1] as Level) : guessLevel(name);
      added.push({ name, level: lv });
    }
    update({ schools: [...project.schools, ...added] });
    setText("");
  };

  const setLevel = (name: string, level: Level) =>
    update({ schools: project.schools.map((s) => (s.name === name ? { ...s, level } : s)) });

  const count = (lv: Level) => project.schools.filter((s) => s.level === lv).length;

  return (
    <div className={styles.panel}>
      <h2>2. 학교 목록</h2>
      <p className={styles.help}>
        수합할 <b>전체 학교 이름</b>을 붙여 넣으세요. 엑셀에서 학교명 열을 복사해 붙여도 되고, 한 줄에 한 학교씩
        적어도 돼요. 학교급은 이름으로 자동 짐작하고, 틀리면 아래에서 고칠 수 있어요.
      </p>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"가나초등학교\n푸른중학교\n새봄고등학교\n무지개통합학교"}
        aria-label="학교 이름 붙여넣기"
      />
      <div className={styles.row}>
        <button type="button" className={`btn btn-primary btn-small`} onClick={add} disabled={!text.trim()}>
          목록에 추가
        </button>
        {project.schools.length > 0 && (
          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={() => confirm("학교 목록을 모두 지울까요?") && update({ schools: [] })}
          >
            모두 지우기
          </button>
        )}
      </div>

      {project.schools.length > 0 && (
        <>
          <div className={styles.stats}>
            <span className={styles.stat}>전체 {project.schools.length}곳</span>
            {LEVELS.map((lv) => (
              <span key={lv} className={styles.stat}>{lv} {count(lv)}</span>
            ))}
          </div>
          <div className={styles.list}>
            {project.schools.map((s) => (
              <div key={s.name} className={styles.item}>
                <span className={styles.itemName}>{s.name}</span>
                <select className={styles.select} value={s.level} onChange={(e) => setLevel(s.name, e.target.value as Level)} aria-label={`${s.name} 학교급`}>
                  {LEVELS.map((lv) => (
                    <option key={lv} value={lv}>{lv}</option>
                  ))}
                </select>
                <button type="button" className={styles.x} onClick={() => update({ schools: project.schools.filter((x) => x.name !== s.name) })} aria-label={`${s.name} 삭제`}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
