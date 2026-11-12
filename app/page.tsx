// 첫 화면 (목록 화면)
// PLAN 작업 6 (PRD 개발 단위 3): 미리 넣은 식당을 카드 목록으로 보여 줍니다.
// PLAN 작업 7 (PRD 개발 단위 4): 걸어서 걸리는 시간이 짧은 순, 같으면 이름 가나다순으로 정렬합니다.
// PLAN 작업 8 (PRD 개발 단위 5): 인원·음식 종류·가격대 조건 버튼으로 걸러 봅니다.
// PLAN 작업 9 (PRD 개발 단위 6): 검색창으로 이름·대표 메뉴·주소에서 찾습니다. (검색어 1~20글자)
// PLAN 작업 10 (PRD 개발 단위 7): 20곳씩 보여 주고 "더 보기"로 20곳씩 더 보여 줍니다.
// - 식당은 lib/restaurantSource.ts에서 가져옵니다. 저장 공간 연결 후(PLAN 작업 14) 그 파일만 바꿉니다.
// - 0곳 안내(작업 11)는 이어서 붙입니다.

import { Suspense } from "react";
import FilterBar from "@/components/FilterBar";
import RestaurantResults from "@/components/RestaurantResults";
import SearchBox from "@/components/SearchBox";
import { listStateToHref, parseListState, type RawSearchParams } from "@/lib/listQuery";
import { getAllRestaurants } from "@/lib/restaurantSource";
import {
  filterRestaurants,
  searchRestaurants,
  sortByWalkThenName,
  toCompareKey,
  validateSearchQuery,
  type RestaurantFilters,
} from "@/lib/rules";
import type { RestaurantListItem } from "@/lib/types";

/** 조건·검색어로 거르고 정렬한 뒤, 목록 카드에 필요한 값만 골라 냅니다. (아직 평가가 없어 평균 별점 없음) */
function toListItems(filters: RestaurantFilters, query: string): RestaurantListItem[] {
  const filtered = filterRestaurants(getAllRestaurants(), filters);
  const searched = searchRestaurants(filtered, query);
  return sortByWalkThenName(searched).map(
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

/** 주소에 담긴 조건·검색어를 읽어 검색창, 조건 버튼, 목록을 그립니다. (주소를 읽는 부분만 요청 때 그림) */
async function RestaurantList({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const state = parseListState(await searchParams);

  // 서버 쪽 2차 검사: 띄어쓰기만 있으면 검색하지 않은 것으로 보고,
  // 20글자를 넘으면 안내를 보여 주고 검색어 없이 목록을 보여 줍니다.
  const hasQuery = toCompareKey(state.q) !== "";
  const searchProblem = hasQuery ? validateSearchQuery(state.q) : null;
  const query = hasQuery && !searchProblem ? state.q : "";

  const restaurants = toListItems(state, query);

  return (
    <>
      <SearchBox state={state} />
      {searchProblem && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {searchProblem.message}
        </p>
      )}

      <div className="mt-4">
        <FilterBar filters={state} />
      </div>

      <p className="mt-4 mb-3 text-sm text-zinc-600 dark:text-zinc-400">
        {query && <>&ldquo;{query.trim()}&rdquo; 검색 결과 · </>}식당 {restaurants.length}곳
      </p>
      {/* 조건·검색어가 바뀌면 key가 바뀌어 "더 보기"로 늘린 개수가 처음(20곳)으로 돌아갑니다 */}
      <RestaurantResults
        key={listStateToHref({ ...state, q: query })}
        restaurants={restaurants}
      />
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
