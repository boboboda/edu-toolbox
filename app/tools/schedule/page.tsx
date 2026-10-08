import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import ScheduleBoard from "@/components/ScheduleBoard";

export const metadata: Metadata = {
  title: "그림 일과표",
  description:
    "하루 순서를 그림 카드로 보여주는 무료 그림 일과표. 활동을 고르고 끝나면 체크해요.",
};

export default function SchedulePage() {
  return (
    <ToolShell
      title="그림 일과표"
      tips={
        <ul>
          <li>&quot;일과표 만들기&quot;에서 활동을 눌러 순서대로 담아요. 최대 20개까지 담을 수 있어요.</li>
          <li>활동 카드를 누르면 끝났다고 표시돼요. 아직 안 끝난 첫 활동에 &quot;지금&quot; 표시가 붙어요.</li>
          <li>편집하기의 &quot;시간표 설정&quot;에서 시작 시각과 수업(35·40·45·50분), 쉬는 시간을 정하면 카드마다 시작·끝 시각이 나와요. &quot;학교 시간표 틀 만들기&quot;를 누르면 등교부터 하교까지 한 번에 만들어져요.</li>
          <li>편집하기에서 순서를 바꾸고, 지우고, 직접 활동을 추가할 수 있어요.</li>
          <li>일과표는 이 기기에만 저장돼요. 학생 이름은 적지 마세요.</li>
        </ul>
      }
    >
      <ScheduleBoard />
    </ToolShell>
  );
}
