// 브라우저 -> edu 서버: 요청 글 작성.
// 여기서 한 번 걸러 낸 뒤 홈페이지 API 로 넘긴다. 게시판은 항상 "request" 로 고정한다.
import { NextResponse } from "next/server";

import { getClientIp, homepageFetch } from "@/lib/homepage";
import { LIMITS } from "@/lib/board";

const fail = (status: number, message: string) =>
  NextResponse.json({ message }, { status });

export async function POST(req: Request) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return fail(400, "요청 형식이 올바르지 않아요.");
  }

  const { nickname, title, content, password } = body;

  if (
    typeof nickname !== "string" ||
    typeof title !== "string" ||
    typeof content !== "string" ||
    typeof password !== "string"
  ) {
    return fail(400, "모든 칸을 채워 주세요.");
  }

  if (!nickname.trim() || nickname.trim().length > LIMITS.nickname) {
    return fail(400, `닉네임은 1~${LIMITS.nickname}자로 입력해 주세요.`);
  }

  if (!title.trim() || title.trim().length > LIMITS.title) {
    return fail(400, `제목은 1~${LIMITS.title}자로 입력해 주세요.`);
  }

  if (!content.trim() || content.trim().length > LIMITS.content) {
    return fail(400, `내용은 1~${LIMITS.content}자로 입력해 주세요.`);
  }

  if (
    password.length < LIMITS.passwordMin ||
    password.length > LIMITS.passwordMax
  ) {
    return fail(
      400,
      `비밀번호는 ${LIMITS.passwordMin}~${LIMITS.passwordMax}자로 입력해 주세요.`,
    );
  }

  const result = await homepageFetch<{ id?: string; message?: string }>(
    "/api/edu/posts",
    {
      method: "POST",
      clientIp: getClientIp(req.headers),
      body: { board: "request", nickname, title, content, password },
    },
  );

  if (!result.ok || !result.data.id) {
    // 홈페이지가 돌려준 안내 문구(횟수 제한 등)는 그대로 보여 주고, 서버 내부 사정은 감춘다.
    const message =
      result.status === 400 || result.status === 429
        ? (result.data.message ?? "글을 저장하지 못했어요.")
        : "지금은 글을 저장할 수 없어요. 잠시 후 다시 해 주세요.";

    return fail(result.status === 429 ? 429 : result.status === 400 ? 400 : 502, message);
  }

  return NextResponse.json({ success: true, id: result.data.id }, { status: 201 });
}
