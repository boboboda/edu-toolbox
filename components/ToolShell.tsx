"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./ToolShell.module.css";

type Props = {
  title: string;
  tips?: ReactNode;
  children: ReactNode;
};

export default function ToolShell({ title, tips, children }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setCanFullscreen(document.fullscreenEnabled);

    const onChange = () =>
      setIsFullscreen(document.fullscreenElement === shellRef.current);

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await shellRef.current?.requestFullscreen();
      }
    } catch {
      // 전체화면이 막혀 있으면 조용히 무시
    }
  };

  return (
    <div ref={shellRef} className={styles.shell}>
      <div className={styles.bar}>
        <div className={`container ${styles.barInner}`}>
          <Link href="/tools" className={styles.back}>
            ← 도구함으로
          </Link>
          <h1 className={styles.title}>{title}</h1>
          {canFullscreen && (
            <button
              type="button"
              className={styles.fs}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? "전체화면 닫기" : "전체화면"}
            </button>
          )}
        </div>
      </div>

      <div className={`container ${styles.stage}`}>{children}</div>

      {tips && (
        <details className={styles.tips}>
          <summary>사용 팁</summary>
          {tips}
        </details>
      )}
    </div>
  );
}