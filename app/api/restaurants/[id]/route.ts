// 식당 상세 API — GET /api/restaurants/[식당번호]?deviceId=기기표시값
// PLAN 작업 18 (PRD 개발 단위 15) / 기준: DESIGN.md 4.2 "오늘 이미 평가했는지 화면이 아는 방법", 6.1 ② 상세
//
// 받는 값: { data: { 식당 정보…, reviewCount, avgRating, reviews: [...], reviewedToday } }
// - reviewedToday: 오늘(한국 시간) 이 기기로 이 식당에 평가를 남겼는지
// - 기기 표시값은 비교에만 쓰고 응답에는 담지 않습니다.

import { DataLoadError, getRestaurantDetail, hasReviewedToday } from "@/lib/restaurantSource";
import type { ApiErrorResponse, RestaurantDetailResponse } from "@/lib/types";

function fail(status: number, code: "NOT_FOUND" | "SERVER_ERROR", message: string) {
  const body: ApiErrorResponse = { error: { code, message } };
  return Response.json(body, { status });
}

export async function GET(request: Request, ctx: RouteContext<"/api/restaurants/[id]">) {
  const { id: rawId } = await ctx.params;
  const restaurantId = decodeURIComponent(rawId);
  const deviceId = (new URL(request.url).searchParams.get("deviceId") ?? "").trim().slice(0, 100);

  try {
    const restaurant = await getRestaurantDetail(restaurantId);
    if (!restaurant) return fail(404, "NOT_FOUND", "식당을 찾을 수 없어요");

    const reviewedToday = deviceId ? await hasReviewedToday(restaurantId, deviceId) : false;
    const body: RestaurantDetailResponse = { data: { ...restaurant, reviewedToday } };
    // 평가가 계속 바뀌므로 저장해 두지 않고 매번 새로 읽게 합니다.
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof DataLoadError) return fail(500, "SERVER_ERROR", "잠시 후 다시 시도해 주세요");
    throw error;
  }
}
