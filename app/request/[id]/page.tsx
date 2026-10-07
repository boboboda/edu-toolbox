// app/request/[id]/page.tsx — 요청 글 상세 (공개글만)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { homepageFetch } from "@/lib/homepage";
import { formatDate, statusLabel, type BoardPost } from "@/lib/board";
import styles from "../request.module.css";
import DeleteBox from "./DeleteBox";

export const metadata: Metadata = {
  title: "요청 글",
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await homepageFetch<{ post?: BoardPost }>(
    `/api/edu/posts/${encodeURIComponent(id)}`,
  );

  if (result.status === 404) notFound();

  const post = result.data.post;

  // 요청 게시판의 공개글만 보여 준다. (비밀글이거나 다른 게시판 글이면 없는 글로 처리)
  if (result.ok && (!post || post.board !== "request" || post.locked)) notFound();

  if (!result.ok || !post) {
    return (
      <div className="container">
        <div className={styles.wrap}>
          <div className={styles.error} role="alert">
            글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
          </div>
          <Link href="/request" className="btn btn-outline">
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
            <span className={styles.badge}>{statusLabel(post.status)}</span>
            <span>{post.nickname}</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <p className={styles.body}>{post.content}</p>
        </article>

        {post.replies.length > 0 && (
          <section aria-labelledby="replies-title">
            <h2 id="replies-title" className={styles.repliesTitle}>
              답변
            </h2>
            <ul className={styles.replies}>
              {post.replies.map((r) => (
                <li key={r.id} className={styles.reply}>
                  <span className={styles.replyWho}>
                    운영자 · {formatDate(r.createdAt)}
                  </span>
                  <p className={styles.replyBody}>{r.content}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className={styles.actions} style={{ marginBottom: 28 }}>
          <Link href="/request" className="btn btn-outline">
            목록으로
          </Link>
        </div>

        <DeleteBox id={post.id} />
      </div>
    </div>
  );
}
