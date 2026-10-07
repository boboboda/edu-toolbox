// app/request/page.tsx
import type { Metadata } from "next";
import styles from "./request.module.css";

export const metadata: Metadata = {
  title: "앱·도구 요청",
  description: "필요한 특수교육 도구나 앱을 요청해 주세요.",
};

// 부영실 홈페이지에 등록한 프로젝트 name (관리자 > 게시판 관리 카드에 표시되는 값)
const PROJECT_NAME = "여기에-프로젝트-name-붙여넣기";

const BOARD_URL = `https://buyoungsilcoding.com/project/${PROJECT_NAME}/board/post`;
const WRITE_URL = `${BOARD_URL}/write`;

const STEPS = [
  {
    n: "1",
    title: "로그인",
    desc: "부영실 홈페이지 계정으로 로그인해요. 계정이 없으면 간단히 가입할 수 있어요.",
  },
  {
    n: "2",
    title: "요청 글 쓰기",
    desc: "필요한 도구나 앱, 어떤 수업에서 쓰고 싶은지, 사용 환경(태블릿·PC·스마트보드)을 적어 주세요.",
  },
  {
    n: "3",
    title: "답변 받기",
    desc: "댓글로 답변과 진행 상황을 알려드려요. 다른 선생님의 요청에 댓글을 달 수도 있어요.",
  },
];

export default function RequestPage() {
  return (
    <div className="container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>앱·도구 요청</h1>
        <p className={styles.lead}>
          수업에 필요한 도구나 앱이 있다면 알려 주세요. 요청이 많은 것부터 차례로 만들어요.
        </p>

        <ol className={styles.steps}>
          {STEPS.map((s) => (
            <li key={s.n} className={styles.step}>
              <span className={styles.num}>{s.n}</span>
              <div>
                <h2 className={styles.stepTitle}>{s.title}</h2>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.notice} role="note">
          <strong>개인정보는 쓰지 마세요</strong>
          <p>
            게시판 글은 다른 사람에게 공개돼요. 학생 이름, 학교명, 연락처처럼 개인을 알아볼 수
            있는 정보는 적지 않도록 주의해 주세요. 학생의 특성은 “초등 저학년 수준, 시각 지원이
            필요함”처럼 일반적으로만 적어 주세요.
          </p>
        </div>

        <div className={styles.actions}>
          <a
            className="btn btn-primary"
            href={WRITE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            요청 글 쓰기
          </a>
          <a
            className="btn btn-outline"
            href={BOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            다른 요청 보기
          </a>
        </div>
      </div>
    </div>
  );
}
