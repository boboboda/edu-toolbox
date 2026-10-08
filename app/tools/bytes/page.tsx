import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import ByteCounter from "@/components/ByteCounter";

export const metadata: Metadata = {
  title: "NEIS 글자·바이트 세기",
  description:
    "생활기록부 문구의 글자 수와 NEIS 바이트를 세어 주는 무료 도구. 입력한 글은 서버로 보내지 않아요.",
};

export default function BytesPage() {
  return (
    <ToolShell
      title="NEIS 글자·바이트 세기"
      tips={
        <ul>
          <li>글을 붙여넣으면 글자 수와 바이트가 바로 나와요. 한도를 넘으면 넘는 부분이 빨간 글씨로 보여요.</li>
          <li>한글 3바이트, 영문·숫자·공백 1바이트, 줄바꿈 2바이트로 세어요. 최종 확인은 NEIS 화면에서 해 주세요.</li>
          <li>글자 수 기준은 해마다·항목마다 달라서 예시로 넣었어요. 학교생활기록부 기재요령을 보고 &quot;직접 입력&quot;으로 맞추세요.</li>
          <li>입력한 글은 이 화면에서만 쓰여요. 서버로 보내거나 저장하지 않아요. 학생 정보가 있어도 안전하지만, 공용 컴퓨터에서는 쓴 뒤에 &quot;지우기&quot;를 눌러 주세요.</li>
        </ul>
      }
    >
      <ByteCounter />
    </ToolShell>
  );
}
