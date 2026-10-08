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
  {
    title: "감정 카드 인쇄판",
    desc: "감정 얼굴 12개를 4가지 그림(동그라미, 남자·여자 어린이, 고양이)으로 담았어요. 오려서 코팅해 써요.",
    href: "/materials/emotion-cards.pdf",
    tags: ["PDF", "A4", "4쪽"],
  },
  {
    title: "선 긋기·가위질 연습지",
    desc: "가로선, 물결, 지그재그, 도형을 따라 긋고, 점선을 따라 가위로 잘라 보는 연습지예요.",
    href: "/materials/line-scissor-practice.pdf",
    tags: ["PDF", "A4", "2쪽"],
  },
  {
    title: "생활 순서 카드",
    desc: "손 씻기, 양치하기, 화장실 가기, 가방 싸기를 단계별 카드로 만들었어요. 그림 칸에 사진을 붙여 써요.",
    href: "/materials/life-steps.pdf",
    tags: ["PDF", "A4 가로", "2쪽"],
  },
  {
    title: "사회적 이야기 빈 양식",
    desc: "그림 칸과 글씨 줄이 6장 있어요. 상황 이야기를 직접 만들고, 문장 쓰는 방법 안내도 적혀 있어요.",
    href: "/materials/social-story-blank.pdf",
    tags: ["PDF", "A4"],
  },
  {
    title: "월간 달력",
    desc: "년·월과 날짜를 직접 적는 빈 달력이에요. 칸에 그림이나 스티커를 붙여 써요.",
    href: "/materials/monthly-calendar.pdf",
    tags: ["PDF", "A4 가로"],
  },
];

