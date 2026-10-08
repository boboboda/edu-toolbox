import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import NoiseLight from "@/components/NoiseLight";

export const metadata: Metadata = {
  title: "소음 신호등",
  description:
    "교실 소리 크기를 초록·노랑·빨강 신호등으로 보여 주는 무료 도구. 소리는 녹음하지 않고 서버로 보내지 않아요.",
};

export default function NoisePage() {
  return (
    <ToolShell
      title="소음 신호등"
      tips={
        <ul>
          <li>&quot;마이크 켜기&quot;를 누르고 브라우저가 물으면 &quot;허용&quot;을 골라요.</li>
          <li>교실이 조용하면 초록, 조금 시끄러우면 노랑, 너무 시끄러우면 빨강이 켜져요.</li>
          <li>교실이 원래 시끄럽거나 너무 조용해서 맞지 않으면, 조용한 때에 &quot;지금 소리를 조용함으로 맞추기&quot;를 눌러요. 민감도 막대로도 조절해요.</li>
          <li>소리는 녹음하지 않고 서버로도 보내지 않아요. 크기만 재고 바로 버려요.</li>
          <li>기기 마이크의 성능에 따라 기준이 달라요. 처음에는 한 번 맞춰 보세요.</li>
        </ul>
      }
    >
      <NoiseLight />
    </ToolShell>
  );
}
