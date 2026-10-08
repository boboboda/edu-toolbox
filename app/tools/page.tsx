import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { CATEGORIES, toolsOf, type Tool } from "@/lib/tools";
import styles from "./tools.module.css";

export const metadata: Metadata = {
  title: "도구함",
  description:
    "수업 시간에 바로 쓰는 교육용 도구와, 선생님의 업무를 덜어 주는 업무용 도구 모음.",
};

function ToolCard({ tool }: { tool: Tool }) {
  const inner = (
    <>
      <span className={`tile ${tool.tile}`}>
        <Icon d={tool.d} />
      </span>
      <h3>{tool.title}</h3>
      <p>{tool.desc}</p>
      {tool.ready ? (
        <span className="open-link">열기 →</span>
      ) : (
        <span className="tag tag-yellow" style={{ alignSelf: "flex-start" }}>
          준비 중
        </span>
      )}
    </>
  );

  return tool.ready ? (
    <Link href={tool.href} className="tool-card">
      {inner}
    </Link>
  ) : (
    <div className={`tool-card ${styles.soon}`} aria-disabled="true">
      {inner}
    </div>
  );
}

export default function ToolsPage() {
  return (
    <section className="container section">
      <h1 className={styles.title}>도구함</h1>
      <p className={styles.lead}>
        누르면 바로 열려요. 설정은 이 기기 안에만 저장돼요.
      </p>

      <nav className={styles.switch} aria-label="도구 종류">
        {CATEGORIES.map((c) => (
          <a key={c.id} href={`#${c.id}`} className={styles.switchLink}>
            {c.title}
          </a>
        ))}
      </nav>

      {CATEGORIES.map((c) => (
        <section key={c.id} id={c.id} className={styles.group}>
          <h2 className={styles.groupTitle}>{c.title}</h2>
          <p className={styles.groupDesc}>{c.desc}</p>
          <div className="card-row">
            {toolsOf(c.id).map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
