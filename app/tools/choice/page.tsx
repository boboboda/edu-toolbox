import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import ChoiceBoard from "@/components/ChoiceBoard";

export const metadata: Metadata = {
  title: "선택판",
  description:
    "두 가지 중 하나를 골라요. 그림과 이름을 직접 바꿔 쓰는 무료 선택판.",
};

export default function ChoicePage() {
  return (
    <ToolShell
      title="선택판"
      tips={
        <ul>
          <li>두 카드 중 하나를 누르면 선택한 카드가 커지고 이름을 읽어 줘요.</li>
          <li>&quot;내용 바꾸기&quot;에서 그림과 이름을 직접 정할 수 있어요.</li>
          <li>간식, 놀이, 쉬는 방법을 고르는 연습에 써요.</li>
          <li>내용은 이 기기에만 저장돼요. 학생 이름은 적지 마세요.</li>
        </ul>
      }
    >
      <ChoiceBoard />
    </ToolShell>
  );
}
