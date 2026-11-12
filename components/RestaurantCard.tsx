// 식당 카드 한 장 (목록 화면)
// PLAN 작업 6 (PRD 개발 단위 3) / 기준: DESIGN.md 3.1 목록 화면 "식당 카드"
// 보여 주는 것: 이름, 음식 종류, 걸어서 걸리는 시간, 가격대, 평균 별점 또는 "평가 모으는 중"
// PLAN 작업 12: 카드를 누르면 상세 화면으로 갑니다.

import Link from "next/link";
import type { Cuisine, RestaurantListItem } from "@/lib/types";

/** 음식 종류별 아이콘 (카드 왼쪽에 보이는 그림 글자) */
const CUISINE_ICONS: Record<Cuisine, string> = {
  한식: "🍚",
  중식: "🍜",
  일식: "🍣",
  양식: "🍝",
  분식: "🍢",
  기타: "🍽️",
};

/** href: 카드를 누르면 갈 상세 화면 주소 */
export default function RestaurantCard({
  restaurant,
  href,
}: {
  restaurant: RestaurantListItem;
  href: string;
}) {
  const { name, cuisine, walkMinutes, priceRange, avgRating } = restaurant;

  return (
    <Link href={href} className="block rounded-xl">
      <article className="flex items-start gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-sm transition-colors hover:border-orange-400 dark:border-white/15 dark:bg-white/5">
        <span aria-hidden className="text-2xl leading-none">
          {CUISINE_ICONS[cuisine]}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            {/* 이름이 길면 두 줄까지 보여 주고 나머지는 줄임 */}
            <h2 className="line-clamp-2 text-base font-semibold">{name}</h2>

            {/* 평가 3건 이상이면 평균 별점, 아니면 "평가 모으는 중" (DESIGN 3.1) */}
            {avgRating === null ? (
              <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                평가 모으는 중
              </span>
            ) : (
              <span className="shrink-0 text-sm font-semibold">
                <span aria-hidden>⭐ </span>
                <span className="sr-only">평균 별점 </span>
                {avgRating.toFixed(1)}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {cuisine} · 걸어서 {walkMinutes}분 · {priceRange}
          </p>
        </div>
      </article>
    </Link>
  );
}
