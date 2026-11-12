"use client";

// 식당 카드 목록 + "더 보기" 버튼
// PLAN 작업 10 (PRD 개발 단위 7) / 기준: DESIGN.md 3.1 "더 보기 버튼"
//
// - 처음에는 20곳까지만 보여 주고, "더 보기"를 누를 때마다 20곳씩 더 보여 줍니다.
// - 결과가 20곳 이하이면 "더 보기" 버튼이 나오지 않습니다.
// - 늘린 개수는 주소에 남기지 않습니다. 조건·검색어가 바뀌거나 상세 화면에서 돌아오면
//   처음 20곳부터 다시 보여 줍니다. (DESIGN 3.1)
//
// 지금은 서버가 거르고 정렬한 목록 전체를 받아 나눠 보여 줍니다.
// 저장 공간 연결 후(PLAN 작업 14)에는 "더 보기" 때 서버 API에서 20곳씩 받아 오게 바꿉니다.

import { useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import { restaurantDetailHref } from "@/lib/listQuery";
import { LIMITS } from "@/lib/rules";
import type { RestaurantListItem } from "@/lib/types";

/** 결과 0곳 안내 (PRD 문구 그대로) */
const NO_RESULT_MESSAGE = "조건에 맞는 식당이 없어요. 조건을 줄여 보세요";

/** listQueryString: 지금 목록의 조건·검색어 (상세 화면에서 "목록으로" 돌아올 때 쓰려고 카드 주소에 붙임) */
export default function RestaurantResults({
  restaurants,
  listQueryString,
}: {
  restaurants: RestaurantListItem[];
  listQueryString: string;
}) {
  const [visibleCount, setVisibleCount] = useState<number>(LIMITS.pageSize);

  // PLAN 작업 11 (PRD 개발 단위 8): 결과가 0곳이면 빈 화면 대신 안내 문구 (PRD must ① 네 번째 규칙)
  if (restaurants.length === 0) {
    return (
      <p
        role="status"
        className="rounded-xl border border-dashed border-black/20 px-4 py-8 text-center text-sm text-zinc-600 dark:border-white/20 dark:text-zinc-300"
      >
        {NO_RESULT_MESSAGE}
      </p>
    );
  }

  const visible = restaurants.slice(0, visibleCount);
  const remaining = restaurants.length - visible.length;

  return (
    <>
      <ul className="flex flex-col gap-3">
        {visible.map((restaurant) => (
          <li key={restaurant.id}>
            <RestaurantCard
              restaurant={restaurant}
              href={restaurantDetailHref(restaurant.id, listQueryString)}
            />
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + LIMITS.pageSize)}
          className="mt-4 w-full rounded-full border border-black/15 py-3 text-sm font-semibold dark:border-white/20"
        >
          더 보기 (남은 식당 {remaining}곳)
        </button>
      )}
    </>
  );
}
