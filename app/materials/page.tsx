import type { Metadata } from "next";
import ListingPage from "@/components/ListingPage";
import { MATERIALS } from "@/lib/listings";

export const metadata: Metadata = {
  title: "자료실",
  description: "인쇄해서 바로 쓰는 특수교육 수업 자료 모음.",
};

export default function MaterialsPage() {
  return (
    <ListingPage
      title="자료실"
      lead="인쇄해서 쓰는 수업 자료를 모아 두는 곳이에요."
      items={MATERIALS}
      emptyText="아직 올라온 자료가 없어요. 준비되는 대로 올릴게요. 필요한 자료가 있으면 알려 주세요."
    />
  );
}
