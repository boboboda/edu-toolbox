// 엑셀 파일 취합 도구에서 쓰는 자료 형태

export const LEVELS = ["초등", "중등", "고등", "통합"] as const;
export type Level = (typeof LEVELS)[number];

export type School = { name: string; level: Level };

/** 수합 양식에서 뽑아낼 항목 하나 */
export type Item = {
  id: string;
  name: string; // 사람이 보는 이름 (고칠 수 있음)
  kind: "table" | "pair"; // 표 안의 칸(행 이름+열 이름) / 이름 옆 칸
  rowLabel?: string; // table: 같은 줄 왼쪽의 이름
  colLabel?: string; // table: 같은 열 위쪽의 이름
  label?: string; // pair: 칸 왼쪽의 이름
  role: "value" | "school" | "level"; // 숫자 항목 / 학교명 칸 / 학교급 칸
  sheet: string; // 등록할 때의 시트 이름
  addr: string; // 등록할 때의 칸 주소 (참고용)
};

export type OutSource =
  | { type: "sum"; itemIds: string[]; level: "all" | Level }
  | { type: "submitted"; level: "all" | Level }
  | { type: "target"; level: "all" | Level }
  | { type: "levels" }
  | { type: "date" };

/** 제출 양식에서 값을 채울 칸 하나 */
export type OutCell = {
  addr: string;
  sheet: string;
  src: OutSource;
};

export type Project = {
  id: string;
  name: string;
  updatedAt: number;
  formName: string;
  formB64: string;
  templateName: string;
  templateB64: string;
  items: Item[];
  outputs: OutCell[];
  schools: School[];
  targetLevels: Level[];
};

export type Issue = { level: "error" | "warn"; msg: string };

/** 파일 하나를 읽은 결과 (학교 연결 전) */
export type Parsed = {
  key: string; // 파일 이름 (같은 이름은 마지막 것으로 덮어씀)
  file: string;
  mtime: number;
  declared: string | null; // 파일 안에 적힌 학교명
  declaredLevel: string | null;
  values: Record<string, number>;
  issues: Issue[];
  ok: boolean; // 읽기에 성공했는지(값이 있는지)
};

export type Analyzed = Parsed & {
  school: School | null;
  matchBy: string | null;
  cands: string[];
  allIssues: Issue[];
  status: "정상" | "경고" | "오류" | "중복(제외)" | "대상 아님";
  included: boolean;
};

export type StatusRow = {
  school: string;
  level: Level;
  state: string;
  file: string;
  memo: string;
};

/** 화면에 보여 줄 표 모양 */
export type Grid = {
  rows: number;
  cols: number;
  cells: string[][]; // 보여 줄 글자
  formula: boolean[][]; // 수식 칸
  merges: { r1: number; c1: number; r2: number; c2: number }[]; // 1부터
};
