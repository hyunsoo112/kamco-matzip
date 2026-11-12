// 시험용 식당 25곳 (이름이 모두 "[시험]"으로 시작)
// PLAN 작업 10 / 기준: DESIGN.md 5.3 "시험용 25곳", 8번 확인 계획 5번(더 보기)
//
// "더 보기"처럼 식당이 21곳 이상 있어야 확인할 수 있는 기능을 시험할 때만 씁니다.
// 시험할 때만 저장 공간에 넣고, 끝나면 "[시험]"으로 시작하는 식당을 지웁니다. (PLAN 작업 14부터)
//   넣기:  npm run db:seed -- --with-test
//   지우기: npm run db:seed -- --remove-test

import type { Cuisine, PartySize, PriceRange, Restaurant, WalkMinutes } from "@/lib/types";

const CUISINE_CYCLE: Cuisine[] = ["한식", "중식", "일식", "양식", "분식"];
const WALK_CYCLE: WalkMinutes[] = [5, 10, 15];
const PRICE_CYCLE: PriceRange[] = ["1만 원 미만", "1만~2만 원 미만", "2만 원 이상"];
const PARTY_CYCLE: PartySize[][] = [["혼밥"], ["2~4명"], ["혼밥", "2~4명", "단체"]];

/** 1번~25번 시험용 식당을 규칙에 맞는 값으로 돌려가며 만듭니다. */
export const TEST_RESTAURANTS: Restaurant[] = Array.from({ length: 25 }, (_, i) => {
  const no = String(i + 1).padStart(2, "0");
  return {
    id: `test-${no}`,
    name: `[시험] 식당 ${no}`,
    address: `시험로 ${i + 1} (시험동)`,
    walkMinutes: WALK_CYCLE[i % WALK_CYCLE.length],
    cuisine: CUISINE_CYCLE[i % CUISINE_CYCLE.length],
    signatureMenu: `시험 메뉴 ${no}`,
    partySizes: PARTY_CYCLE[i % PARTY_CYCLE.length],
    priceRange: PRICE_CYCLE[i % PRICE_CYCLE.length],
    daysOff: [],
  };
});
