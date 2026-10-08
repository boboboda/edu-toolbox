import type { Metadata } from "next";
import ToolShell from "@/components/ToolShell";
import NamePicker from "@/components/NamePicker";

export const metadata: Metadata = {
  title: "모둠·순서 뽑기",
  description:
    "이름이나 번호로 한 명 뽑기, 순서 정하기, 모둠 나누기를 하는 무료 도구. 이름은 서버에 저장하지 않아요.",
};

export default function PickerPage() {
  return (
    <ToolShell
      title="모둠·순서 뽑기"
      tips={
        <ul>
          <li>이름이나 번호를 한 줄에 하나씩 적어요. 쉼표로 이어서 적어도 돼요.</li>
          <li>&quot;한 명 뽑기&quot;는 뽑힌 사람을 빼고 계속 뽑을 수 있어요. 발표나 도우미를 정할 때 써요.</li>
          <li>&quot;순서 정하기&quot;는 모두를 섞어서 번호를 붙여요. &quot;모둠 나누기&quot;는 모둠 수나 한 모둠 인원으로 나눠요.</li>
          <li>이름은 이 화면에만 있고 서버로 보내거나 저장하지 않아요. 새로고침하면 사라져요.</li>
        </ul>
      }
    >
      <NamePicker />
    </ToolShell>
  );
}
