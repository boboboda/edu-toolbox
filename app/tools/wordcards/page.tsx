import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import WordCards from "@/components/WordCards";

export const metadata: Metadata = {
  title: "낱말카드",
  description:
    "그림과 낱말을 넘기며 익히는 무료 낱말카드. 소리로 읽어 주고, 인쇄용 카드도 만들 수 있어요.",
};

export default function WordCardsPage() {
  return (
    <ToolShell
      title="낱말카드"
      tips={
        <ul>
          <li>묶음(과일·동물 등)을 고르고 &quot;다음&quot;으로 카드를 넘겨요.</li>
          <li>카드를 누르면 낱말을 소리로 읽어 줘요. (기기에서 소리를 지원할 때)</li>
          <li>&quot;낱말 가리기&quot;로 그림만 보고 말해 보게 할 수 있어요.</li>
          <li>&quot;내 카드&quot;에서 직접 낱말을 만들고, &quot;인쇄용 카드&quot;로 종이에 뽑을 수 있어요.</li>
          <li>직접 만든 카드는 이 기기에만 저장돼요. 학생 이름은 적지 마세요.</li>
        </ul>
      }
    >
      <WordCards />
    </ToolShell>
  );
}
