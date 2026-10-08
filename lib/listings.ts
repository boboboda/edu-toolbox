// 자료실·앱 목록. 항목을 추가하면 페이지에 바로 나타나요. 비어 있으면 "준비 중" 안내가 보여요.

export type Listing = {
  title: string;
  desc: string;
  href: string; // 내려받기·스토어·상세 주소
  tags?: string[];
};

// 자료실: 인쇄해서 쓰는 자료 (PDF 등). 예) { title: "...", desc: "...", href: "/materials/xxx.pdf" }
export const MATERIALS: Listing[] = [
  {
    title: "별 모으기 판",
    desc: "점선 별 5개와 보상 칸이 있는 토큰 보상판이에요. 별 스티커를 붙여 써요.",
    href: "/materials/token-board.pdf",
    tags: ["PDF", "A4"],
  },
  {
    title: "오늘의 일과 양식",
    desc: "순서 6칸에 그림 카드를 붙이고 끝나면 체크해요.",
    href: "/materials/schedule-blank.pdf",
    tags: ["PDF", "A4"],
  },
  {
    title: "골라요 판",
    desc: "큰 칸 두 개에 그림이나 글씨를 붙이고 하나를 골라요. 한 장에 두 번 쓸 수 있어요.",
    href: "/materials/choice-board.pdf",
    tags: ["PDF", "A4"],
  },
  {
    title: "우리 반 약속 판",
    desc: "그림 칸과 글씨 줄이 4개 있어요. 교실 약속을 정리해서 붙여요.",
    href: "/materials/class-rules.pdf",
    tags: ["PDF", "A4"],
  },
];

