import type { Metadata } from "next";
import { SITE_CHECKED, SITE_GROUPS } from "@/lib/sites";
import styles from "./sites.module.css";

export const metadata: Metadata = {
  title: "자료 사이트",
  description:
    "국립특수교육원, 에듀에이블 등 특수교육 자료를 찾으러 바로 들어갈 수 있는 사이트 모음.",
};

export default function SitesPage() {
  return (
    <section className="container section">
      <h1 className={styles.title}>자료 사이트</h1>
      <p className={styles.lead}>
        특수교육 자료를 찾을 때 자주 들어가는 사이트를 모았어요. 누르면 새 창에서 열려요.
      </p>

      <nav className={styles.switch} aria-label="사이트 종류">
        {SITE_GROUPS.map((g) => (
          <a key={g.id} href={`#${g.id}`} className={styles.switchLink}>
            {g.title}
          </a>
        ))}
      </nav>

      {SITE_GROUPS.map((g) => (
        <section key={g.id} id={g.id} className={styles.group}>
          <h2 className={styles.groupTitle}>{g.title}</h2>
          <p className={styles.groupDesc}>{g.desc}</p>
          <div className="card-row">
            {g.sites.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="tool-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                {s.note && <p className={styles.note}>{s.note}</p>}
                <span className="open-link">새 창에서 열기 ↗</span>
              </a>
            ))}
          </div>
        </section>
      ))}

      <p className={styles.foot}>
        주소는 {SITE_CHECKED}에 확인했어요. 열리지 않거나 추가하면 좋을 사이트가 있으면 &quot;요청하기&quot;로 알려 주세요.
        여기 모은 사이트는 각 기관과 운영자의 것이며, 자료를 쓸 때는 각 사이트의 이용 조건을 따라 주세요.
      </p>
    </section>
  );
}
