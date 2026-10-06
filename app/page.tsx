import Link from "next/link";
import Icon from "@/components/Icon";
import HeroTimer from "@/components/HeroTimer";
import { TOOLS } from "@/lib/tools";

const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const DOWNLOAD = "M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14";
const SHIELD =
  "M12 3l7.5 3v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6zM9 12l2.2 2.2L15.5 10";


// 예시 자료입니다. 실제 자료가 생기면 이 배열을 교체하세요.
const MATERIALS = [
  {
    href: "/materials",
    tags: [
      { label: "생활 기능", cls: "tag-blue" },
      { label: "중학교", cls: "tag-plain" },
    ],
    title: "손 씻기 순서 카드",
    desc: "단계별 그림 순서를 보며 따라 하는 활동 카드예요.",
  },
  {
    href: "/materials",
    tags: [
      { label: "국어", cls: "tag-mint" },
      { label: "기초 학습", cls: "tag-plain" },
    ],
    title: "자음 모음 짝 맞추기",
    desc: "오려서 쓰는 글자 카드와 활동 안내를 함께 담았어요.",
  },
  {
    href: "/materials",
    tags: [
      { label: "수학", cls: "tag-yellow" },
      { label: "기초 학습", cls: "tag-plain" },
    ],
    title: "10까지 수 세기 활동지",
    desc: "그림을 세어 같은 수에 연결하는 활동지예요.",
  },
];

const AAC_KEYS = [
  {
    label: "밥",
    bg: "var(--yellow-soft)",
    d: "M4 11h16a8 8 0 0 1-16 0zM9 7c0-1.5 1-2 1-3.5M14 7c0-1.5 1-2 1-3.5",
  },
  {
    label: "물",
    bg: "var(--blue-soft)",
    d: "M12 3.5c3 4 6 6.8 6 10.5a6 6 0 0 1-12 0c0-3.7 3-6.5 6-10.5z",
  },
  {
    label: "좋아",
    bg: "var(--mint)",
    d: "M12 20s-7-4.3-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.7-7 10-7 10z",
  },
  {
    label: "싫어",
    bg: "var(--coral-soft)",
    d: "M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0M8.5 15.5s1.2-1.5 3.5-1.5 3.5 1.5 3.5 1.5M9 9.5h.01M15 9.5h.01",
  },
  {
    label: "도와줘",
    bg: "var(--blue-soft)",
    d: "M9 9a3 3 0 1 1 4.5 2.6c-1 .6-1.5 1.2-1.5 2.4M12 18v.01",
  },
  {
    label: "화장실",
    bg: "var(--yellow-soft)",
    d: "M8 3.5h8v17H8zM8 12h8M12 7v.01",
  },
];

export default function Home() {
  return (
    <>
      {/* 히어로 */}
      <section className="container hero">
        <div className="hero-text">
          <span className="badge">현직 특수교사가 만들어요</span>
          <h1>
            수업 시간에 바로 쓰는
            <br />
            특수교육 도구함
          </h1>
          <p className="hero-lead">
            시각 타이머, 일과표, 낱말카드까지. 설치 없이 태블릿과 전자칠판에서
            바로 열어 쓰는 무료 웹 도구와 수업 자료를 모았어요.
          </p>

          <div className="hero-actions">
            <a href="#tools" className="btn btn-primary">
              도구 바로 쓰기
            </a>
            <a href="#materials" className="btn btn-outline">
              자료실 가기
            </a>
          </div>

          <ul className="checks">
            {["설치 없이 바로 실행", "학생 정보 수집 없음", "전자칠판 전체화면 지원"].map(
              (text) => (
                <li key={text}>
                  <Icon d={CHECK} size={20} color="#1f8a6e" strokeWidth={2.6} />
                  {text}
                </li>
              )
            )}
          </ul>
        </div>

        <HeroTimer />
      </section>

      {/* 도구 */}
      <section id="tools" className="container section">
        <div className="section-head">
          <div>
            <h2>지금 바로 쓸 수 있는 도구</h2>
            <p>누르면 바로 열려요. 설정은 이 기기 안에만 저장돼요.</p>
          </div>
          <Link href="/tools" className="section-link">
            도구 전체 보기
          </Link>
        </div>

        <div className="card-row">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="tool-card">
              <span className={`tile ${tool.tile}`}>
                <Icon d={tool.d} />
              </span>
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
              <span className="open-link">열기 →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 자료실 */}
      <div id="materials" className="band">
        <section className="container section">
          <div className="section-head">
            <div>
              <h2>새로 올라온 자료</h2>
              <p>직접 만든 수업 자료만 올려요. 내려받아 바로 인쇄해 쓸 수 있어요.</p>
            </div>
            <Link href="/materials" className="section-link">
              자료실 전체 보기
            </Link>
          </div>

          <div className="card-row">
            {MATERIALS.map((item) => (
              <Link key={item.title} href={item.href} className="mat-card">
                <span className="tags">
                  {item.tags.map((tag) => (
                    <span key={tag.label} className={`tag ${tag.cls}`}>
                      {tag.label}
                    </span>
                  ))}
                </span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <span className="download">
                  <Icon d={DOWNLOAD} size={22} color="#1d4fb8" strokeWidth={2.4} />
                  내려받기
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 앱 소개 */}
      <section id="apps" className="container section">
        <div className="apps-box">
          <div className="apps-text">
            <span className="badge">준비 중</span>
            <h2>말을 도와주는 AAC 앱</h2>
            <p>
              그림 카드를 눌러 마음을 전하는 보완대체의사소통 앱을 만들고
              있어요. 인터넷이 없어도 동작하고, 정보는 기기 안에만 저장해요.
            </p>
            <Link href="/request" className="btn">
              필요한 기능 알려주기
            </Link>
          </div>

          <div className="aac-board" aria-label="AAC 카드판 미리보기">
            {AAC_KEYS.map((key) => (
              <div
                key={key.label}
                className="aac-key"
                style={{ background: key.bg }}
              >
                <Icon d={key.d} size={30} />
                <span>{key.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 요청 띠 */}
      <section id="request" className="container section">
        <div className="request-band">
          <div className="request-text">
            <h2>이런 도구가 있으면 좋겠나요?</h2>
            <p>
              필요한 도구나 앱을 남겨주세요. 접수된 요청 가운데 골라서 만들어요.
              모든 요청을 만들 수는 없어요.
            </p>
          </div>
          <Link href="/request" className="btn btn-dark">
            요청 남기기
          </Link>
        </div>
      </section>

      {/* 개인정보 안내 */}
      <section className="container">
        <div className="notice">
          <span className="notice-icon">
            <Icon d={SHIELD} size={28} />
          </span>
          <div>
            <strong>학생 정보는 수집하지 않아요</strong>
            <p>
              도구에서 입력한 이름, 사진, 설정은 사용하는 기기 안에만 저장돼요.
              요청을 남길 때도 학생 이름이나 사진 같은 개인정보는 적지 말아
              주세요.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}