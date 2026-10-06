import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { TOOLS } from "@/lib/tools";
import styles from "./tools.module.css";

export const metadata: Metadata = {
  title: "도구함",
  description: "수업 시간에 바로 쓰는 특수교육 웹 도구 모음.",
};

export default function ToolsPage() {
  return (
    <section className="container section">
      <h1 className={styles.title}>도구함</h1>
      <p className={styles.lead}>
        누르면 바로 열려요. 설정은 이 기기 안에만 저장돼요.
      </p>

      <div className="card-row">
        {TOOLS.map((tool) => {
          const inner = (
            <>
              <span className={`tile ${tool.tile}`}>
                <Icon d={tool.d} />
              </span>
              <h2>{tool.title}</h2>
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
            <Link key={tool.href} href={tool.href} className="tool-card">
              {inner}
            </Link>
          ) : (
            <div
              key={tool.href}
              className={`tool-card ${styles.soon}`}
              aria-disabled="true"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}