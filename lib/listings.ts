// 자료실·앱 목록. 항목을 추가하면 페이지에 바로 나타나요. 비어 있으면 "준비 중" 안내가 보여요.

export type Listing = {
  title: string;
  desc: string;
  href: string; // 내려받기·스토어·상세 주소
  tags?: string[];
};

// 자료실: 인쇄해서 쓰는 자료 (PDF 등). 예) { title: "...", desc: "...", href: "/materials/xxx.pdf" }
export const MATERIALS: Listing[] = [];

