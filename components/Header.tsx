"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // 페이지가 바뀌면 메뉴를 닫아요
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Esc 키로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="특수교육 도구함 홈">
          <span className="logo-mark" aria-hidden="true">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <span className="logo-text">특수교육 도구함</span>
        </Link>

        <button
          type="button"
          className="menu-btn"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        <div
          id="site-menu"
          className={"header-right" + (open ? " is-open" : "")}
        >
          <nav className="nav" aria-label="주요 메뉴">
            <Link href="/tools">도구함</Link>
            <Link href="/materials">자료실</Link>
            <Link href="/sites">사이트</Link>
            <Link href="/apps">앱</Link>
            <Link href="/about">소개</Link>
          </nav>
          <Link href="/request" className="nav-cta">
            요청하기
          </Link>
        </div>
      </div>
    </header>
  );
}
