import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import EmotionCards from "@/components/EmotionCards";

export const metadata: Metadata = {
  title: "감정 카드",
  description:
    "얼굴 그림으로 지금 기분을 말해 보는 무료 감정 카드. 누르면 읽어 줘요.",
};

export default function EmotionsPage() {
  return (
    <ToolShell
      title="감정 카드"
      tips={
        <ul>
          <li>지금 기분과 맞는 얼굴을 누르면 크게 보이고 문장을 읽어 줘요.</li>
          <li>말로 표현하기 어려운 학생이 기분을 가리킬 때 써요.</li>
          <li>화나요, 무서워요를 골랐을 때 어떻게 할지 짧은 안내가 나와요.</li>
        </ul>
      }
    >
      <EmotionCards />
    </ToolShell>
  );
}
