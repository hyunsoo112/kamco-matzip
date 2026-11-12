// 새 식당 등록 API — POST /api/restaurants
// PLAN 작업 20 (PRD 개발 단위 17) / 기준: DESIGN.md 4.3 새 식당 등록, 6.1 ③ 새 식당 등록, 6.2 결과 코드
//
// 보내는 값: { name, address, walkMinutes, cuisine, signatureMenu, partySizes, priceRange, daysOff, deviceId }
// 받는 값 (201): { data: { id } }   ← 기기 표시값은 돌려주지 않음
// 오류: { error: { code, message, field? } }
//
// 서버 쪽 2차 검사: 화면에서 이미 검사했더라도 lib/rules.ts의 같은 규칙으로 다시 검사합니다.
// 같은 이름 안내·하루 3곳 제한은 PLAN 작업 21에서 이어서 다듬습니다.
// (같은 이름은 저장 공간의 "같은 값 금지" 규칙이 이미 막고 있어, 이 API는 그 오류를 안내로 바꿔 줍니다)

import { getDb } from "@/lib/db";
import { makeNameKey, validateNewRestaurant } from "@/lib/rules";
import type { ApiErrorResponse, CreateRestaurantResponse, ErrorCode } from "@/lib/types";

function fail(status: number, code: ErrorCode, message: string, field?: string) {
  const body: ApiErrorResponse = { error: { code, message, ...(field ? { field } : {}) } };
  return Response.json(body, { status });
}

/** 저장 공간의 "같은 값 두 번 금지" 오류 번호 */
const UNIQUE_VIOLATION = "23505";

export async function POST(request: Request) {
  // 1) 보낸 값 읽기
  let input: Record<string, unknown>;
  try {
    input = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "VALIDATION_ERROR", "보낸 내용을 읽을 수 없어요. 다시 시도해 주세요");
  }

  // 2) 규칙 검사 (글자 수 → 선택지 → 개인정보 → 금지어 순서, 첫 번째 문제 1개만 알려 줌)
  const problem = validateNewRestaurant({
    name: input.name,
    address: input.address,
    walkMinutes: input.walkMinutes,
    cuisine: input.cuisine,
    signatureMenu: input.signatureMenu,
    partySizes: input.partySizes,
    priceRange: input.priceRange,
    daysOff: input.daysOff ?? [],
  });
  if (problem) return fail(400, problem.code, problem.message, problem.field);

  const deviceId = typeof input.deviceId === "string" ? input.deviceId.trim() : "";
  if (deviceId === "" || deviceId.length > 100) {
    return fail(400, "VALIDATION_ERROR", "잠시 후 다시 시도해 주세요");
  }

  const name = (input.name as string).trim();

  // 3) 저장 (비교용 이름은 띄어쓰기를 빼고 소문자로 만든 값, 같으면 저장 공간이 막음)
  const { data, error } = await getDb()
    .from("restaurants")
    .insert({
      name,
      name_key: makeNameKey(name),
      address: (input.address as string).trim(),
      walk_minutes: input.walkMinutes as number,
      cuisine: input.cuisine as string,
      signature_menu: (input.signatureMenu as string).trim(),
      party_sizes: input.partySizes as string[],
      price_range: input.priceRange as string,
      days_off: (input.daysOff ?? []) as string[],
      device_id: deviceId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return fail(
        409,
        "DUPLICATE_NAME",
        "같은 이름의 식당이 있어요. 다른 지점이면 'OO점'처럼 지점명을 붙여 주세요",
        "name",
      );
    }
    return fail(500, "SERVER_ERROR", "잠시 후 다시 시도해 주세요");
  }

  const body: CreateRestaurantResponse = { data: { id: (data as { id: string }).id } };
  return Response.json(body, { status: 201 });
}
