"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { LIMITS } from "@/lib/board";
import styles from "../../request/request.module.css";

export default function WriteForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (busy) return;

    setError("");
    setBusy(true);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, title, content }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.id) {
        setError(data.message ?? "글을 저장하지 못했어요. 잠시 후 다시 해 주세요.");
        setBusy(false);

        return;
      }

      router.push(`/contact/${data.id}`);
    } catch {
      setError("네트워크 오류가 났어요. 잠시 후 다시 해 주세요.");
      setBusy(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="nickname">
          닉네임
        </label>
        <input
          id="nickname"
          className={styles.input}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={LIMITS.nickname}
          autoComplete="off"
          required
        />
        <p className={styles.hint}>실명 대신 별명을 써 주세요.</p>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="title">
          제목
        </label>
        <input
          id="title"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={LIMITS.title}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="content">
          내용
        </label>
        <textarea
          id="content"
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={LIMITS.content}
          required
        />
        <span className={styles.counter}>
          {content.length} / {LIMITS.content}
        </span>
      </div>

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "올리는 중…" : "문의 올리기"}
        </button>
        <Link href="/contact" className="btn btn-outline">
          취소
        </Link>
      </div>
    </form>
  );
}
