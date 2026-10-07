// 요청 게시판 공통 값 (서버·클라이언트 모두 가져다 써도 되는 파일)

export const LIMITS = {
  nickname: 20,
  title: 80,
  content: 3000,
  passwordMin: 4,
  passwordMax: 32,
} as const;

export const STATUS_LABELS: Record<string, string> = {
  open: "접수",
  reviewing: "검토 중",
  planned: "제작 예정",
  done: "완료",
};

export const statusLabel = (status: string) => STATUS_LABELS[status] ?? status;

export type BoardListItem = {
  id: string;
  nickname: string;
  title: string;
  status: string;
  createdAt: string;
  replyCount: number;
};

export type BoardReply = {
  id: string;
  content: string;
  createdAt: string;
};

export type BoardPost = {
  id: string;
  board: string;
  nickname: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  locked: boolean;
  replies: BoardReply[];
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

// 문의 게시판 (홈페이지 프로젝트 문의 게시판과 같은 글)
export type InquiryListItem = {
  id: string;
  listNumber: number;
  nickname: string;
  title: string;
  createdAt: string;
  replyCount: number;
};

export type InquiryReply = {
  id: string;
  writer: string;
  content: string;
  createdAt: string;
};

export type InquiryComment = InquiryReply & {
  replies: InquiryReply[];
};

export type InquiryPost = {
  id: string;
  listNumber: number;
  nickname: string;
  title: string;
  content: string;
  createdAt: string;
  comments: InquiryComment[];
};
