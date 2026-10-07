// 메인 홈페이지(부영실 웹사이트) API 호출 도구.
// 서버(서버 컴포넌트·라우트 핸들러)에서만 쓴다. 클라이언트 컴포넌트에서 가져오면 안 된다.
// 환경변수:
//   EDU_API_KEY       홈페이지의 EDU_API_KEY 와 같은 값 (24자 이상)
//   HOMEPAGE_API_URL  홈페이지 주소 (기본값: https://www.buyoungsilcoding.com)

const DEFAULT_BASE_URL = "https://www.buyoungsilcoding.com";
const TIMEOUT_MS = 10_000;

export type HomepageResult<T> = {
  ok: boolean;
  status: number;
  data: T;
};

type Options = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  clientIp?: string;
};

export async function homepageFetch<T = Record<string, unknown>>(
  path: string,
  { method = "GET", body, clientIp }: Options = {},
): Promise<HomepageResult<T>> {
  const key = process.env.EDU_API_KEY;

  if (!key) {
    console.error("[homepage] EDU_API_KEY 가 설정되지 않았어요.");

    return { ok: false, status: 503, data: {} as T };
  }

  const base = (process.env.HOMEPAGE_API_URL || DEFAULT_BASE_URL).replace(
    /\/+$/,
    "",
  );

  try {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        "x-edu-key": key,
        "x-edu-client-ip": clientIp ?? "unknown",
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data = (await res.json().catch(() => ({}))) as T;

    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error("[homepage] 요청 실패:", path, error);

    return { ok: false, status: 502, data: {} as T };
  }
}

// Pi 의 nginx 가 넘겨 준 방문자 IP. 요청 횟수 제한에만 쓴다.
export function getClientIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();

  if (real) return real.slice(0, 64);

  const forwarded = headers.get("x-forwarded-for");

  if (forwarded) {
    // 맨 앞은 방문자가 조작할 수 있으니, 프록시가 마지막에 붙인 값을 쓴다.
    const last = forwarded.split(",").pop()?.trim();

    if (last) return last.slice(0, 64);
  }

  return "unknown";
}
