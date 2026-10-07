"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import styles from "../request.module.css";

export default function DeleteBox({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (busy || !password) return;

    setError("");
    setBusy(true);

    try {
      const res = await fetch(`/api/board/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message ?? "글을 지우지 못했어요.");
        setBusy(false);

        return;
      }

      router.push("/request");
      router.refresh();
    } catch {
      setError("네트워크 오류가 났어요. 잠시 후 다시 해 주세요.");
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className={styles.deleteBox}>
        <div>
          <button
            type="button"
            className="btn btn-outline btn-small"
            onClick={() => setOpen(true)}
          >
            내 글 지우기
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.deleteBox} onSubmit={onSubmit}>
      <label className={styles.label} htmlFor="delete-password">
        글 쓸 때 정한 비밀번호
      </label>
      <div className={styles.deleteRow}>
        <input
          id="delete-password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          required
        />
        <button type="submit" className="btn btn-dark btn-small" disabled={busy}>
          {busy ? "지우는 중…" : "지우기"}
        </button>
        <button
          type="button"
          className="btn btn-outline btn-small"
          onClick={() => {
            setOpen(false);
            setPassword("");
            setError("");
          }}
        >
          취소
        </button>
      </div>
      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
