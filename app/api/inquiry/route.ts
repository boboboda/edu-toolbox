// 브라우저 -> edu 서버: 문의 글 작성. 홈페이지의 프로젝트 문의 게시판에 저장된다.
import { NextResponse } from "next/server";

import { getClientIp, homepageFetch, inquiryPath } from "@/lib/homepage";
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

  const { nickname, title, content } = body;

  if (
    typeof nickname !== "string" ||
    typeof title !== "string" ||
    typeof content !== "string"
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

  const result = await homepageFetch<{ id?: string; message?: string }>(
    inquiryPath(),
    {
      method: "POST",
      clientIp: getClientIp(req.headers),
      body: { nickname, title, content },
    },
  );

  if (!result.ok || !result.data.id) {
    const message =
      result.status === 400 || result.status === 429
        ? (result.data.message ?? "글을 저장하지 못했어요.")
        : "지금은 글을 저장할 수 없어요. 잠시 후 다시 해 주세요.";

    return fail(
      result.status === 429 ? 429 : result.status === 400 ? 400 : 502,
      message,
    );
  }

  return NextResponse.json({ success: true, id: result.data.id }, { status: 201 });
}
