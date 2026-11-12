// 첫 화면 (목록 화면)
// PLAN 작업 6 (PRD 개발 단위 3): 미리 넣은 식당을 카드 목록으로 보여 줍니다.
// - 지금은 data/seed-restaurants.ts를 직접 읽습니다. 저장 공간 연결 후(PLAN 작업 14) 바꿉니다.
// - 정렬(작업 7), 조건(작업 8), 검색(작업 9), 더 보기(작업 10), 0곳 안내(작업 11)는 이어서 붙입니다.

import RestaurantCard from "@/components/RestaurantCard";
import { SEED_RESTAURANTS } from "@/data/seed-restaurants";
import type { RestaurantListItem } from "@/lib/types";

/** 목록 카드에 필요한 값만 골라 냅니다. 아직 평가가 없으므로 평가 수 0, 평균 별점 없음 */
function toListItems(): RestaurantListItem[] {
  return SEED_RESTAURANTS.map(({ id, name, cuisine, walkMinutes, priceRange }) => ({
    id,
    name,
    cuisine,
    walkMinutes,
    priceRange,
    reviewCount: 0,
    avgRating: null,
  }));
}

export default function Home() {
  const restaurants = toListItems();

  return (
    // 휴대폰 화면 폭에 맞추고, 큰 화면에서는 가운데에 좁게 보이게 합니다.
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">캠코인재개발원 맛집 지도</h1>
      </header>

      <main className="flex-1 px-4 pb-8">
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          식당 {restaurants.length}곳
        </p>
        <ul className="flex flex-col gap-3">
          {restaurants.map((restaurant) => (
            <li key={restaurant.id}>
              <RestaurantCard restaurant={restaurant} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
