import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import TodayBoard from "@/components/TodayBoard";

export const metadata: Metadata = {
  title: "오늘의 알림판",
  description:
    "오늘 날짜와 요일, 날씨를 큰 글씨와 그림으로 보여 주는 무료 알림판. 아침 활동과 수업 시작에 전자칠판에 띄워요.",
};

export default function TodayPage() {
  return (
    <ToolShell
      title="오늘의 알림판"
      tips={
        <ul>
          <li>날짜와 요일은 기기의 시계를 보고 자동으로 나와요.</li>
          <li>날씨는 창밖을 보고 학생과 함께 눌러서 골라요. 날씨 정보를 인터넷에서 가져오지는 않아요.</li>
          <li>&quot;오늘의 한마디&quot;에 알릴 말을 적으면 판에 크게 보여요. 이 기기에만 저장되고 다음 날이 되면 새로 시작해요.</li>
          <li>전체화면 버튼을 누르면 전자칠판에 크게 띄울 수 있어요.</li>
        </ul>
      }
    >
      <TodayBoard />
    </ToolShell>
  );
}
