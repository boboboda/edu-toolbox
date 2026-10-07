// app/contact/write/page.tsx — 문의 글쓰기
import type { Metadata } from "next";

import styles from "../../request/request.module.css";
import WriteForm from "./WriteForm";

export const metadata: Metadata = {
  title: "문의 글 쓰기",
};

export default function ContactWritePage() {
  return (
    <div className="container">
      <div className={styles.wrap}>
        <h1 className={styles.title}>문의 글 쓰기</h1>
        <p className={styles.lead}>
          궁금한 점이나 불편한 점, 사용 환경(태블릿·PC·전자칠판)을 적어 주세요. 답변은 글 아래에
          달려요.
        </p>

        <div className={styles.notice} role="note">
          <strong>개인정보는 쓰지 마세요</strong>
          <p>
            문의 글은 다른 사람에게 공개돼요. 학생 이름, 학교명, 연락처처럼 개인을 알아볼 수 있는
            정보는 적지 않도록 주의해 주세요. 글을 올린 뒤에는 직접 지울 수 없어요. 지워야 하면
            운영자에게 알려 주세요.
          </p>
        </div>

        <WriteForm />
      </div>
    </div>
  );
}
