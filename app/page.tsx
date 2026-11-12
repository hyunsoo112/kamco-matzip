// 첫 화면 (목록 화면)
// PLAN 작업 6 (PRD 개발 단위 3): 미리 넣은 식당을 카드 목록으로 보여 줍니다.
// PLAN 작업 7 (PRD 개발 단위 4): 걸어서 걸리는 시간이 짧은 순, 같으면 이름 가나다순으로 정렬합니다.
// PLAN 작업 8 (PRD 개발 단위 5): 인원·음식 종류·가격대 조건 버튼으로 걸러 봅니다.
// PLAN 작업 9 (PRD 개발 단위 6): 검색창으로 이름·대표 메뉴·주소에서 찾습니다. (검색어 1~20글자)
// PLAN 작업 10 (PRD 개발 단위 7): 20곳씩 보여 주고 "더 보기"로 20곳씩 더 보여 줍니다.
// PLAN 작업 11 (PRD 개발 단위 8): 결과가 0곳이면 안내 문구를 보여 줍니다. (components/RestaurantResults.tsx)
// PLAN 작업 14 (PRD 개발 단위 11): 식당과 평균 별점을 저장 공간(Supabase)에서 읽어 옵니다. (lib/restaurantSource.ts)
// PLAN 작업 20 (PRD 개발 단위 17): 화면 아래에 "+ 새 식당 등록" 버튼을 고정해 둡니다.

import Link from "next/link";
import { Suspense } from "react";
import FilterBar from "@/components/FilterBar";
import RestaurantResults from "@/components/RestaurantResults";
import SearchBox from "@/components/SearchBox";
import {
  listStateToQueryString,
  parseListState,
  type RawSearchParams,
} from "@/lib/listQuery";
import { getRestaurantList } from "@/lib/restaurantSource";
import { toCompareKey, validateSearchQuery } from "@/lib/rules";

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

  // 조건·검색어로 거르고 가까운 순으로 정렬한 식당 (평균 별점 포함)
  const restaurants = await getRestaurantList(state, query);
  // 지금 목록의 조건·검색어 (카드 → 상세 → "목록으로"에서 그대로 돌아오기 위해 사용)
  const listQueryString = listStateToQueryString({ ...state, q: query });

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
        key={listQueryString}
        restaurants={restaurants}
        listQueryString={listQueryString}
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

      {/* 아래 고정 버튼에 목록이 가려지지 않도록 아래쪽을 넉넉히 비워 둠 */}
      <main className="flex-1 px-4 pb-28">
        <Suspense
          fallback={<p className="text-sm text-zinc-500">식당 목록을 불러오는 중…</p>}
        >
          <RestaurantList searchParams={searchParams} />
        </Suspense>
      </main>

      {/* PLAN 작업 20: 화면 아래에 고정된 "새 식당 등록" 버튼 (DESIGN 3.1) */}
      <div className="pointer-events-none sticky bottom-0 flex justify-center bg-gradient-to-t from-white via-white/90 to-transparent px-4 pt-6 pb-4 dark:from-black dark:via-black/90">
        <Link
          href="/restaurants/new"
          className="pointer-events-auto rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
        >
          + 새 식당 등록
        </Link>
      </div>
    </div>
  );
}
