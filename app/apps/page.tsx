import type { Metadata } from "next";
import Link from "next/link";

import {
  coverUrl,
  fetchEduApps,
  platformLabel,
  statusText,
} from "@/lib/apps";
import styles from "./apps.module.css";

export const metadata: Metadata = {
  title: "앱",
  description: "특수교육 현장에서 쓰려고 만든 앱 모음.",
};

export const dynamic = "force-dynamic";

export default async function AppsPage() {
  const { ok, apps } = await fetchEduApps();

  return (
    <section className="container section">
      <h1 className={styles.title}>앱</h1>
      <p className={styles.lead}>현장에서 쓰려고 만든 앱을 소개하는 곳이에요.</p>

      {!ok ? (
        <div className={styles.empty} role="alert">
          앱 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </div>
      ) : apps.length === 0 ? (
        <div className={styles.empty}>
          <p>아직 소개할 앱이 없어요. 만드는 대로 이곳에 올릴게요.</p>
          <div className={styles.actions}>
            <Link href="/request" className="btn btn-primary">
              필요한 앱 요청하기
            </Link>
            <Link href="/tools" className="btn btn-outline">
              도구함 보기
            </Link>
          </div>
        </div>
      ) : (
        <div className="card-row">
          {apps.map((app) => {
            const img = coverUrl(app.coverImage);

            return (
              <article key={app.slug} className="tool-card">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.cover} src={img} alt="" loading="lazy" />
                )}
                <h2>{app.title}</h2>
                <p>{app.description}</p>
                <div className="tags">
                  <span className="tag tag-blue">{platformLabel(app.platform)}</span>
                  <span
                    className={`tag ${app.status === "released" ? "tag-mint" : "tag-yellow"}`}
                  >
                    {statusText(app.status)}
                  </span>
                </div>
                <div className={styles.links}>
                  {app.appLink && /^https:\/\//i.test(app.appLink) && (
                    <a
                      className="btn btn-primary btn-small"
                      href={app.appLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      받으러 가기
                    </a>
                  )}
                  <Link
                    className="btn btn-outline btn-small"
                    href={`/apps/${encodeURIComponent(app.slug)}`}
                  >
                    자세히 보기
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
