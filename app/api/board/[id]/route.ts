// 브라우저 -> edu 서버: 작성 때 정한 비밀번호로 요청 글 삭제.
import { NextResponse } from "next/server";

import { getClientIp, homepageFetch } from "@/lib/homepage";

const fail = (status: number, message: string) =>
  NextResponse.json({ message }, { status });

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let password: unknown;

  try {
    ({ password } = await req.json());
  } catch {
    return fail(400, "요청 형식이 올바르지 않아요.");
  }

  if (typeof password !== "string" || !password) {
    return fail(400, "비밀번호를 입력해 주세요.");
  }

  const result = await homepageFetch<{ message?: string }>(
    `/api/edu/posts/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      clientIp: getClientIp(req.headers),
      body: { password },
    },
  );

  if (result.ok) return NextResponse.json({ success: true });

  if (result.status === 403) return fail(403, "비밀번호가 맞지 않아요.");
  if (result.status === 404) return fail(404, "이미 지워졌거나 없는 글이에요.");
  if (result.status === 429) {
    return fail(429, "시도 횟수가 너무 많아요. 잠시 후 다시 해 주세요.");
  }

  return fail(502, "지금은 글을 지울 수 없어요. 잠시 후 다시 해 주세요.");
}
