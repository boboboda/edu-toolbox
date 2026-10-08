// 메인 홈페이지에 등록된 프로젝트 중 "특수교육" 태그가 붙은 앱 목록 (서버에서만 사용)
import { homepageFetch } from "@/lib/homepage";

export type EduApp = {
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  appLink: string | null;
  platform: string;
  status: string;
};

const HOMEPAGE = (
  process.env.HOMEPAGE_API_URL || "https://www.buyoungsilcoding.com"
).replace(/\/+$/, "");

// 홈페이지 프로젝트 상세 화면 주소
export const appDetailUrl = (slug: string) =>
  `${HOMEPAGE}/project/${encodeURIComponent(slug)}`;

// 표지 그림 주소: 상대 경로면 홈페이지 주소를 붙이고, 그 밖의 값은 쓰지 않는다.
export function coverUrl(value: string | null): string | null {
  if (!value) return null;
  if (/^https:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${HOMEPAGE}${value}`;

  return null;
}

export async function fetchEduApps() {
  const res = await homepageFetch<{ apps?: EduApp[] }>("/api/edu/apps");

  return { ok: res.ok, apps: res.data.apps ?? [] };
}

export const platformLabel = (p: string) =>
  p === "mobile" ? "모바일 앱" : p === "web" ? "웹" : p;

export const statusText = (s: string) =>
  s === "released" ? "출시됨" : s === "in-progress" ? "준비 중" : s;
