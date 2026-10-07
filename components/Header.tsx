import Link from "next/link";

export default function Header() {
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

        <nav className="nav" aria-label="주요 메뉴">
          <Link href="/tools">도구함</Link>
          <Link href="/materials">자료실</Link>
          <Link href="/apps">앱</Link>
          <Link href="/about">소개</Link>
          <Link href="/request" className="nav-cta">
            요청하기
          </Link>
        </nav>
      </div>
    </header>
  );
}