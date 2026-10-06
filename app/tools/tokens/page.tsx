import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import TokenBoard from "@/components/TokenBoard";

export const metadata: Metadata = {
  title: "토큰 보상판",
  description:
    "별을 모으면 보상이 나오는 무료 토큰 보상판. 목표 개수와 보상을 직접 정해서 쓰세요.",
};

export default function TokensPage() {
  return (
    <ToolShell
      title="토큰 보상판"
      tips={
        <ul>
          <li>점선 별을 누르거나 &quot;별 붙이기&quot; 버튼으로 별을 하나씩 붙여요.</li>
          <li>학생마다 목표 개수와 보상을 다르게 정해서 쓸 수 있어요.</li>
          <li>실수로 붙였으면 &quot;하나 빼기&quot;로 되돌려요.</li>
          <li>별 개수와 보상 문구는 이 기기에만 저장돼요. 학생 이름은 적지 마세요.</li>
        </ul>
      }
    >
      <TokenBoard />
    </ToolShell>
  );
}