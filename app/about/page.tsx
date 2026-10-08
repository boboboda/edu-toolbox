// app/about/page.tsx — 만든 사람 + 개인정보 안내
import type { Metadata } from "next";
import Link from "next/link";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "만든 사람 · 개인정보 안내",
  description:
    "특수교육 도구함을 만든 사람과, 게시판에서 받는 정보를 어떻게 다루는지 안내해요.",
};

export default function AboutPage() {
  return (
    <section className="container section">
      <h1 className={styles.title}>만든 사람</h1>
      <p className={styles.lead}>수업에서 쓰려고 직접 만들고 있어요.</p>

      <div className={styles.block}>
        <h2>특수교육 도구함이란</h2>
        <p>
          현직 특수교사가 수업에서 필요한 도구를 직접 만들어 올리는 사이트예요.
          시각 타이머, 토큰 보드처럼 교실에서 바로 켜서 쓸 수 있는 도구를
          모아 두었어요. 이 사이트에는 광고가 없어요. 소개한 앱에는 광고가 있을 수 있어요.
        </p>
        <p>
          필요한 도구나 앱이 있으면 요청해 주세요. 만들 수 있는 것부터
          차례로 만들어요.
        </p>
        <div className={styles.links}>
          <Link href="/request" className="btn btn-primary">
            앱·도구 요청
          </Link>
          <Link href="/contact" className="btn btn-outline">
            문의하기
          </Link>
        </div>
      </div>

      <div className={styles.block} id="privacy">
        <h2>개인정보 안내</h2>
        <p>
          이 사이트는 회원가입과 로그인이 없고, 도구를 쓰는 데 필요한 정보는
          받지 않아요. 정보를 받는 곳은 아래 두 게시판뿐이에요.
        </p>

        <h3>게시판에서 받는 정보</h3>
        <ul className={styles.list}>
          <li>
            <strong>앱·도구 요청:</strong> 닉네임, 글 제목, 글 내용, 글을 지울 때
            쓰는 비밀번호. 글은 모두에게 공개돼요.
          </li>
          <li>
            <strong>문의하기:</strong> 닉네임, 글 제목, 글 내용. 글은 모두에게
            공개돼요.
          </li>
        </ul>
        <p>
          닉네임은 실명이 아니어도 돼요. 학생·학부모·동료의 이름, 연락처,
          학교 이름처럼 누군지 알 수 있는 정보는 글에 쓰지 마세요.
          공개 게시판이라 누구나 볼 수 있어요.
        </p>

        <h3>어떻게 보관하나요</h3>
        <ul className={styles.list}>
          <li>
            글은 운영자의 홈페이지(buyoungsilcoding.com) 서버에 저장돼요.
          </li>
          <li>
            비밀번호는 원래 값이 아니라 복원할 수 없게 바꾼 값으로만 저장돼서
            운영자도 볼 수 없어요. 잊어버리면 찾아 드릴 수 없어요.
          </li>
          <li>
            글을 너무 많이 올리는 것을 막으려고 접속 주소(IP)를 잠깐 이용해요.
            이 값은 글과 함께 저장하지 않아요.
          </li>
          <li>
            글 지우기는 요청 글은 비밀번호로 직접 할 수 있어요. 문의 글을
            지우고 싶으면 문의하기에 남겨 주세요.
          </li>
        </ul>

        <h3>이 기기에만 저장되는 것</h3>
        <p>
          타이머와 토큰 보드의 설정은 사용하는 기기의 브라우저에만 저장되고,
          서버로 보내지 않아요.
        </p>
      </div>
    </section>
  );
}
