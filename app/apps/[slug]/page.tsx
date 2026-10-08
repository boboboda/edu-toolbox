// app/apps/[slug]/page.tsx — 앱 상세 (홈페이지 프로젝트 정보를 edu 화면으로 보여줘요)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  coverUrl,
  fetchEduApp,
  platformLabel,
  statusText,
} from "@/lib/apps";
import styles from "../apps.module.css";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { app } = await fetchEduApp(slug);

  return app
    ? { title: app.title, description: app.description.slice(0, 120) }
    : { title: "앱" };
}

export default async function AppDetailPage({ params }: Props) {
  const { slug } = await params;
  const { ok, status, app } = await fetchEduApp(slug);

  if (!ok && status === 404) notFound();

  if (!ok || !app) {
    return (
      <section className="container section">
        <div className={styles.empty} role="alert">
          앱 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </div>
        <p style={{ marginTop: 16 }}>
          <Link href="/apps">← 앱 목록으로</Link>
        </p>
      </section>
    );
  }

  const img = coverUrl(app.coverImage);
  const store = app.appLink && /^https:\/\//i.test(app.appLink) ? app.appLink : null;

  return (
    <section className="container section">
      <p style={{ marginBottom: 12 }}>
        <Link href="/apps">← 앱 목록으로</Link>
      </p>

      <article className={styles.detail}>
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.detailCover} src={img} alt="" />
        )}

        <h1 className={styles.title}>{app.title}</h1>
        <div className="tags">
          <span className="tag tag-blue">{platformLabel(app.platform)}</span>
          <span
            className={`tag ${app.status === "released" ? "tag-mint" : "tag-yellow"}`}
          >
            {statusText(app.status)}
          </span>
        </div>

        <p className={styles.desc}>{app.description}</p>

        <div className={styles.links}>
          {store && (
            <a
              className="btn btn-primary"
              href={store}
              target="_blank"
              rel="noopener noreferrer"
            >
              받으러 가기
            </a>
          )}
          <Link href="/apps" className="btn btn-outline">
            다른 앱 보기
          </Link>
        </div>
      </article>
    </section>
  );
}
