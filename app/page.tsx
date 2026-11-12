// 첫 화면 (목록 화면)
// PLAN 작업 6 (PRD 개발 단위 3): 미리 넣은 식당을 카드 목록으로 보여 줍니다.
// PLAN 작업 7 (PRD 개발 단위 4): 걸어서 걸리는 시간이 짧은 순, 같으면 이름 가나다순으로 정렬합니다.
// PLAN 작업 8 (PRD 개발 단위 5): 인원·음식 종류·가격대 조건 버튼으로 걸러 봅니다.
// - 지금은 data/seed-restaurants.ts를 직접 읽습니다. 저장 공간 연결 후(PLAN 작업 14) 바꿉니다.
// - 검색(작업 9), 더 보기(작업 10), 0곳 안내(작업 11)는 이어서 붙입니다.

import { Suspense } from "react";
import FilterBar from "@/components/FilterBar";
import RestaurantCard from "@/components/RestaurantCard";
import { SEED_RESTAURANTS } from "@/data/seed-restaurants";
import { parseFilters, type RawSearchParams } from "@/lib/listQuery";
import { filterRestaurants, sortByWalkThenName, type RestaurantFilters } from "@/lib/rules";
import type { RestaurantListItem } from "@/lib/types";

/** 조건으로 거르고 정렬한 뒤, 목록 카드에 필요한 값만 골라 냅니다. (아직 평가가 없어 평균 별점 없음) */
function toListItems(filters: RestaurantFilters): RestaurantListItem[] {
  const filtered = filterRestaurants(SEED_RESTAURANTS, filters);
  return sortByWalkThenName(filtered).map(
    ({ id, name, cuisine, walkMinutes, priceRange }) => ({
      id,
      name,
      cuisine,
      walkMinutes,
      priceRange,
      reviewCount: 0,
      avgRating: null,
    }),
  );
}

/** 주소에 담긴 조건을 읽어 조건 버튼과 목록을 그립니다. (주소를 읽는 부분만 요청 때 그림) */
async function RestaurantList({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const filters = parseFilters(await searchParams);
  const restaurants = toListItems(filters);

  return (
    <>
      <FilterBar filters={filters} />

      <p className="mt-4 mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        식당 {restaurants.length}곳
      </p>
      <ul className="flex flex-col gap-3">
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            <RestaurantCard restaurant={restaurant} />
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    // 휴대폰 화면 폭에 맞추고, 큰 화면에서는 가운데에 좁게 보이게 합니다.
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">캠코인재개발원 맛집 지도</h1>
      </header>

      <main className="flex-1 px-4 pb-8">
        <Suspense
          fallback={<p className="text-sm text-zinc-500">식당 목록을 불러오는 중…</p>}
        >
          <RestaurantList searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
