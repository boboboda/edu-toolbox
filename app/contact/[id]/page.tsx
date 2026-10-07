// app/contact/[id]/page.tsx — 문의 글 상세 (댓글·대댓글 포함)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { homepageFetch } from "@/lib/homepage";
import { formatDate, type InquiryPost } from "@/lib/board";
import styles from "../../request/request.module.css";

export const metadata: Metadata = {
  title: "문의 글",
};

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await homepageFetch<{ post?: InquiryPost }>(
    `/api/edu/inquiries/${encodeURIComponent(id)}`,
  );

  if (result.status === 404) notFound();

  const post = result.data.post;

  if (!result.ok || !post) {
    return (
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.error} role="alert">
            글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </div>
          <Link href="/contact" className="btn btn-outline">
            목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.wrap}>
        <article className={styles.article}>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          <div className={styles.meta}>
            <span>{post.nickname}</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <p className={styles.body}>{post.content}</p>
        </article>

        {post.comments.length > 0 && (
          <section aria-labelledby="replies-title">
            <h2 id="replies-title" className={styles.repliesTitle}>
              답변
            </h2>
            <ul className={styles.replies}>
              {post.comments.map((c) => (
                <li key={c.id} className={styles.reply}>
                  <span className={styles.replyWho}>
                    {c.writer} · {formatDate(c.createdAt)}
                  </span>
                  <p className={styles.replyBody}>{c.content}</p>

                  {c.replies.map((r) => (
                    <div key={r.id} style={{ marginTop: 12, paddingLeft: 16, borderLeft: "3px solid var(--ink, #14213d)" }}>
                      <span className={styles.replyWho}>
                        {r.writer} · {formatDate(r.createdAt)}
                      </span>
                      <p className={styles.replyBody}>{r.content}</p>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className={styles.actions}>
          <Link href="/contact" className="btn btn-outline">
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
