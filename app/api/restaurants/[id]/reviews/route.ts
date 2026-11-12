// 평가 등록 API — POST /api/restaurants/[식당번호]/reviews
// PLAN 작업 15 (PRD 개발 단위 12) / 기준: DESIGN.md 4.2 평가 남기기, 6.1 ④ 평가 등록, 6.2 결과 코드
//
// 보내는 값: { nickname, rating, comment, deviceId }
// 받는 값 (201): { data: { nickname, rating, comment, createdAt } }   ← 기기 표시값은 돌려주지 않음
// 오류: { error: { code, message, field? } }
//
// 서버 쪽 2차 검사: 화면에서 이미 검사했더라도 lib/rules.ts의 같은 규칙으로 다시 검사합니다.

import { getDb, REVIEW_COLUMNS, toReview, type ReviewRow } from "@/lib/db";
import { validateReview } from "@/lib/rules";
import type {
  ApiErrorResponse,
  CreateReviewResponse,
  ErrorCode,
} from "@/lib/types";

/** 오류 응답 만들기 */
function fail(status: number, code: ErrorCode, message: string, field?: string) {
  const body: ApiErrorResponse = { error: { code, message, ...(field ? { field } : {}) } };
  return Response.json(body, { status });
}

/** 저장 공간의 "같은 값 두 번 금지" 오류 번호 (하루 1번 규칙에 걸렸을 때) */
const UNIQUE_VIOLATION = "23505";

export async function POST(request: Request, ctx: RouteContext<"/api/restaurants/[id]/reviews">) {
  const { id: rawId } = await ctx.params;
  const restaurantId = decodeURIComponent(rawId);

  // 1) 보낸 값 읽기
  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "VALIDATION_ERROR", "보낸 내용을 읽을 수 없어요. 다시 시도해 주세요");
  }

  // 2) 규칙 검사 (글자 수 → 별점 → 개인정보 → 금지어 순서, 첫 번째 문제 1개만 알려 줌)
  const problem = validateReview({
    nickname: input.nickname,
    rating: input.rating,
    comment: input.comment,
  });
  if (problem) return fail(400, problem.code, problem.message, problem.field);

  const deviceId = typeof input.deviceId === "string" ? input.deviceId.trim() : "";
  if (deviceId === "" || deviceId.length > 100) {
    return fail(400, "VALIDATION_ERROR", "잠시 후 다시 시도해 주세요");
  }

  const db = getDb();

  // 3) 식당이 있는지 확인
  const { data: restaurant, error: findError } = await db
    .from("restaurants")
    .select("id")
    .eq("id", restaurantId)
    .maybeSingle();
  if (findError) return fail(500, "SERVER_ERROR", "잠시 후 다시 시도해 주세요");
  if (!restaurant) return fail(404, "NOT_FOUND", "식당을 찾을 수 없어요");

  // 4) 저장 (앞뒤 띄어쓰기는 지우고 저장). 평가한 날은 저장 공간이 한국 시간으로 자동으로 넣음
  const { data, error } = await db
    .from("reviews")
    .insert({
      restaurant_id: restaurantId,
      nickname: (input.nickname as string).trim(),
      rating: input.rating as number,
      comment: (input.comment as string).trim(),
      device_id: deviceId,
    })
    .select(REVIEW_COLUMNS)
    .single();

  if (error) {
    // 같은 식당 + 같은 기기 + 같은 날 → 하루 1번 규칙 (화면 안내는 PLAN 작업 18에서 다듬음)
    if (error.code === UNIQUE_VIOLATION) {
      return fail(409, "ALREADY_REVIEWED_TODAY", "오늘은 이미 평가했어요. 내일 다시 남길 수 있어요");
    }
    return fail(500, "SERVER_ERROR", "잠시 후 다시 시도해 주세요");
  }

  const body: CreateReviewResponse = { data: toReview(data as ReviewRow) };
  return Response.json(body, { status: 201 });
}
