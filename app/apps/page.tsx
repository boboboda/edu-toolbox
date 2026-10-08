import type { Metadata } from "next";
import ListingPage from "@/components/ListingPage";
import { APPS } from "@/lib/listings";

export const metadata: Metadata = {
  title: "앱",
  description: "특수교육 현장에서 쓰려고 만든 앱 모음.",
};

export default function AppsPage() {
  return (
    <ListingPage
      title="앱"
      lead="현장에서 쓰려고 만든 앱을 소개하는 곳이에요."
      items={APPS}
      emptyText="아직 소개할 앱이 없어요. 만드는 대로 이곳에 올릴게요. 필요한 앱이 있으면 요청해 주세요."
    />
  );
}
