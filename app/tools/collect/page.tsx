import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import CollectApp from "@/components/collect/CollectApp";

export const metadata: Metadata = {
  title: "엑셀 파일 취합",
  description:
    "여러 학교에서 받은 엑셀 파일을 모아 계산하고, 교육청용 양식에 채워 주는 무료 도구. 파일은 내 기기 밖으로 나가지 않아요.",
};

export default function CollectPage() {
  return (
    <ToolShell
      title="엑셀 파일 취합"
      tips={
        <ul>
          <li>모든 처리는 이 브라우저 안에서만 이루어져요. 학교에서 받은 파일은 서버로 보내지도, 저장하지도 않아요.</li>
          <li>학교용·교육청용 양식과 학교 목록 설정만 이 기기에 저장돼요. 공용 컴퓨터에서는 쓰고 나서 설정을 지워 주세요.</li>
          <li>.xlsx 파일만 읽어요. .xls는 엑셀에서 &quot;다른 이름으로 저장&quot;으로 바꿔 주세요.</li>
          <li>결과는 꼭 한 번 눈으로 확인한 뒤 제출하세요.</li>
        </ul>
      }
    >
      <CollectApp />
    </ToolShell>
  );
}
