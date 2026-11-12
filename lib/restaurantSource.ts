// 식당 목록을 어디서 가져올지 한 곳에 모은 파일 (서버 전용)
// PLAN 작업 10 / 저장 공간 연결(PLAN 작업 14) 전까지 쓰는 임시 출처입니다.
//
// - 평소: 미리 넣은 10곳(data/seed-restaurants.ts)
// - 시험할 때: 개발 서버를 INCLUDE_TEST_RESTAURANTS=1로 켜면 시험용 25곳을 뒤에 더함
// PLAN 작업 14에서 이 파일만 Supabase에서 읽어 오도록 바꾸면, 화면 코드는 그대로 둘 수 있습니다.

import { SEED_RESTAURANTS } from "@/data/seed-restaurants";
import { TEST_RESTAURANTS } from "@/data/test-restaurants";
import type { Restaurant } from "./types";

/** 시험용 식당을 더할지 (배포 화면에서는 이 값을 넣지 않으므로 항상 꺼져 있음) */
function includeTestRestaurants(): boolean {
  return process.env.INCLUDE_TEST_RESTAURANTS === "1";
}

/** 식당 번호로 한 곳 찾기 (없으면 null) — 상세 화면(PLAN 작업 12)에서 사용 */
export function getRestaurantById(id: string): Restaurant | null {
  return getAllRestaurants().find((r) => r.id === id) ?? null;
}

/** 지금 보여 줄 수 있는 모든 식당 */
export function getAllRestaurants(): Restaurant[] {
  return includeTestRestaurants()
    ? [...SEED_RESTAURANTS, ...TEST_RESTAURANTS]
    : [...SEED_RESTAURANTS];
}
