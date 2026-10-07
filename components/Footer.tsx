import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-name">특수교육 도구함</div>
          <div>현직 특수교사가 만들고 운영해요.</div>
        </div>

        <nav className="footer-links" aria-label="하단 메뉴">
          <Link href="/about">만든 사람</Link>
          <Link href="/about#privacy">개인정보 안내</Link>
          <Link href="/request">앱·도구 요청</Link>
          <Link href="/contact">문의하기</Link>
        </nav>
      </div>
    </footer>
  );
}