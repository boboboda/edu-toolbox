import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import TracingSheet from "@/components/TracingSheet";

export const metadata: Metadata = {
  title: "따라쓰기 연습지",
  description:
    "글자나 낱말을 입력하면 점선 따라쓰기 연습지를 만들어 인쇄하는 무료 도구. 입력한 내용은 서버로 보내지 않아요.",
};

export default function TracingPage() {
  return (
    <ToolShell
      title="따라쓰기 연습지"
      tips={
        <ul>
          <li>연습할 글자나 낱말을 한 줄에 하나씩 적어요. 이름도 쓸 수 있어요.</li>
          <li>첫 칸은 진한 글씨, 다음 칸은 점선이나 연한 글씨라서 따라 쓰기 좋아요.</li>
          <li>크기는 학생에게 맞게 크게, 보통, 작게 중에서 골라요. 한 장(A4)에 들어가는 줄 수가 달라요.</li>
          <li>&quot;인쇄하기&quot;를 누르면 연습지만 인쇄돼요. 입력한 글자는 서버로 보내지 않아요.</li>
        </ul>
      }
    >
      <TracingSheet />
    </ToolShell>
  );
}
