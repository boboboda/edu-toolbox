import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import VisualTimer from "@/components/VisualTimer";

export const metadata: Metadata = {
  title: "시각 타이머",
  description:
    "남은 시간을 빨간 부채꼴로 보여주는 무료 시각 타이머. 설치 없이 전자칠판과 태블릿에서 바로 쓰세요.",
};

export default function TimerPage() {
  return (
    <ToolShell
      title="시각 타이머"
      tips={
        <ul>
          <li>빨간 부분이 줄어드는 만큼 시간이 흘러간 거예요.</li>
          <li>숫자가 부담스러운 학생에게는 &quot;숫자 보이기&quot;를 꺼 주세요.</li>
          <li>전자칠판에서는 &quot;전체화면&quot;을 누르면 크게 보여요.</li>
          <li>시간과 소리 설정은 이 기기에만 저장돼요.</li>
        </ul>
      }
    >
      <VisualTimer />
    </ToolShell>
  );
}