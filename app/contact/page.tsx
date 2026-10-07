// app/contact/page.tsx — 문의 게시판 목록 (홈페이지 프로젝트 문의 게시판과 같은 글)
import type { Metadata } from "next";
import Link from "next/link";

import { homepageFetch, inquiryPath } from "@/lib/homepage";
import { formatDate, type InquiryListItem } from "@/lib/board";
import styles from "../request/request.module.css";

export const metadata: Metadata = {
  title: "문의하기",
  description: "특수교육 도구함에 대한 궁금한 점과 불편한 점을 남겨 주세요.",
};

type ListResponse = {
  posts?: InquiryListItem[];
  total?: number;
  pageSize?: number;
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = (await searchParams).page;
  const page = Math.max(
    1,
    parseInt(Array.isArray(raw) ? raw[0] : (raw ?? "1"), 10) || 1,
  );

  const result = await homepageFetch<ListResponse>(inquiryPath(`?page=${page}`));

  const posts = result.data.posts ?? [];
  const total = result.data.total ?? 0;
  const pageSize = result.data.pageSize ?? 15;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>문의하기</h1>
        <p className={styles.lead}>
          사용 중 궁금한 점이나 불편한 점을 남겨 주세요. 로그인 없이 닉네임만 적으면 돼요. 새로운
          도구나 앱이 필요하다면 <Link href="/request">앱·도구 요청</Link>에 남겨 주세요.
        </p>

        <div className={styles.topBar}>
          <p className={styles.count}>{result.ok ? `문의 ${total}개` : ""}</p>
          <Link href="/contact/write" className="btn btn-primary">
            문의 글 쓰기
          </Link>
        </div>

        {!result.ok ? (
          <div className={styles.error} role="alert">
            {result.status === 404 || result.status === 503
              ? "문의 게시판을 준비하고 있어요. 조금만 기다려 주세요."
              : "게시판을 불러오지 못했어요. 잠시 후 다시 시도해 주세요."}
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>
            {page > 1
              ? "이 페이지에는 글이 없어요."
              : "아직 문의가 없어요. 궁금한 점을 남겨 주세요!"}
          </div>
        ) : (
          <ul className={styles.list}>
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/contact/${p.id}`} className={styles.item}>
                  <h2 className={styles.itemTitle}>{p.title}</h2>
                  <div className={styles.meta}>
                    <span>{p.nickname}</span>
                    <span>{formatDate(p.createdAt)}</span>
                    {p.replyCount > 0 && <span>답변 {p.replyCount}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {result.ok && lastPage > 1 && (
          <nav className={styles.pager} aria-label="쪽 이동">
            {page > 1 ? (
              <Link className="btn btn-outline btn-small" href={`/contact?page=${page - 1}`}>
                이전
              </Link>
            ) : null}
            <span className={styles.pageInfo}>
              {page} / {lastPage}
            </span>
            {page < lastPage ? (
              <Link className="btn btn-outline btn-small" href={`/contact?page=${page + 1}`}>
                다음
              </Link>
            ) : null}
          </nav>
        )}
      </div>
    </div>
  );
}
