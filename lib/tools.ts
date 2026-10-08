export type Tool = {
  href: string;
  title: string;
  desc: string;
  tile: "tile-coral" | "tile-blue" | "tile-mint" | "tile-yellow";
  d: string; // 아이콘 경로
  ready: boolean;
  category: "edu" | "work"; // 교육용(수업·학생 활동) / 업무용(선생님 업무)
};

export const CATEGORIES = [
  { id: "edu", title: "교육용", desc: "수업과 학생 활동에서 바로 쓰는 도구" },
  { id: "work", title: "업무용", desc: "선생님의 업무를 덜어 주는 도구" },
] as const;

export function toolsOf(category: Tool["category"]): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

export const TOOLS: Tool[] = [
  {
    href: "/tools/timer",
    category: "edu",
    title: "시각 타이머",
    desc: "남은 시간을 색으로 보여줘요. 기다리기, 활동 시간 안내에 써요.",
    tile: "tile-coral",
    d: "M4 13a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 13V8M9.5 2.5h5M18.5 5l1.5-1.5",
    ready: true,
  },
  {
    href: "/tools/schedule",
    category: "edu",
    title: "그림 일과표",
    desc: "하루 순서를 카드로 보여줘요. 끝난 활동은 체크해요.",
    tile: "tile-blue",
    d: "M7 5h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zM4 10h16M9 3v4M15 3v4M8 14h3",
    ready: true,
  },
  {
    href: "/tools/wordcards",
    category: "edu",
    title: "낱말카드",
    desc: "그림과 낱말을 넘기며 익혀요. 인쇄용 카드도 만들 수 있어요.",
    tile: "tile-mint",
    d: "M6 6h7a2.5 2.5 0 0 1 2.5 2.5v10A2.5 2.5 0 0 1 13 21H6a2.5 2.5 0 0 1-2.5-2.5v-10A2.5 2.5 0 0 1 6 6zM8.5 3.5h9a3 3 0 0 1 3 3V16M7 12h5M7 16h3",
    ready: true,
  },
  {
    href: "/tools/tokens",
    category: "edu",
    title: "토큰 보상판",
    desc: "별을 모으면 보상이 나와요. 목표 개수는 직접 정해요.",
    tile: "tile-yellow",
    d: "M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z",
    ready: true,
  },
  {
    href: "/tools/choice",
    category: "edu",
    title: "선택판",
    desc: "두 가지 중 하나를 골라요. 그림과 이름은 직접 바꿔요.",
    tile: "tile-coral",
    d: "M4 6h7v12H4zM13 6h7v12h-7zM7.5 12h0M16.5 12h0",
    ready: true,
  },
  {
    href: "/tools/emotions",
    category: "edu",
    title: "감정 카드",
    desc: "얼굴 그림으로 지금 기분을 말해요. 누르면 읽어 줘요.",
    tile: "tile-blue",
    d: "M3.5 12a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0-17 0M8.5 10h0M15.5 10h0M8.5 14.5c1 1.5 2.2 2 3.5 2s2.500-.5 3.500-2",
    ready: true,
  },
  {
    href: "/tools/collect",
    category: "work",
    title: "엑셀 파일 취합",
    desc: "여러 곳에서 받은 엑셀 파일을 모아 계산하고, 제출용 양식에 채워줘요.",
    tile: "tile-mint",
    d: "M4 5h16v14H4zM4 10h16M4 15h16M10 5v14",
    ready: true,
  },
];
