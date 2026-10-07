// app/request/write/page.tsx — 요청 글쓰기
import type { Metadata } from "next";

import styles from "../request.module.css";
import WriteForm from "./WriteForm";

export const metadata: Metadata = {
  title: "요청 글 쓰기",
};

export default function WritePage() {
  return (
    <div className="container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>요청 글 쓰기</h1>
        <p className={styles.lead}>
          필요한 도구나 앱, 어떤 수업에서 쓰고 싶은지, 사용 환경(태블릿·PC·전자칠판)을 적어
          주세요.
        </p>

        <div className={styles.notice} role="note">
          <strong>개인정보는 쓰지 마세요</strong>
          <p>
            글은 다른 사람에게 공개돼요. 학생 이름, 학교명, 연락처처럼 개인을 알아볼 수 있는
            정보는 적지 않도록 주의해 주세요. 학생의 특성은 “초등 저학년 수준, 시각 지원이
            필요함”처럼 일반적으로만 적어 주세요.
          </p>
        </div>

        <WriteForm />
      </div>
    </div>
  );
}
