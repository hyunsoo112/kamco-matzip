// 목록 화면의 조건을 인터넷 주소(예: /?cuisine=한식,중식&price=1만 원 미만)에 담고 읽는 도구
// PLAN 작업 8 / 기준: DESIGN.md 3.1 "고른 조건과 검색어는 인터넷 주소 뒤에 붙여 둠", 6.1 이름(party·cuisine·price)
//
// 주소에 담아 두면 상세 화면에 갔다가 "목록으로" 돌아와도 고른 조건이 그대로 남습니다.
// 검색어(q)와 몇 번째부터(offset)는 PLAN 작업 9·10에서 더합니다.

import type { RestaurantFilters } from "./rules";
import {
  CUISINES,
  PARTY_SIZES,
  PRICE_RANGES,
  type Cuisine,
  type PartySize,
  type PriceRange,
} from "./types";

/** 주소에 쓰는 이름 (DESIGN 6.1) */
const PARAM_NAMES = {
  partySizes: "party",
  cuisines: "cuisine",
  priceRanges: "price",
} as const;

export type FilterKind = keyof typeof PARAM_NAMES;

/** Next.js가 넘겨주는 주소 값 모양 */
export type RawSearchParams = { [key: string]: string | string[] | undefined };

/** "한식,중식" 같은 값을 나눠, 선택지에 있는 값만 남깁니다. (이상한 값은 조용히 무시) */
function readList<T extends string>(
  raw: string | string[] | undefined,
  choices: readonly T[],
): T[] {
  const text = Array.isArray(raw) ? raw.join(",") : (raw ?? "");
  const picked = text.split(",").map((v) => v.trim());
  // 선택지 순서대로 정리하고 중복은 뺍니다.
  return choices.filter((choice) => picked.includes(choice));
}

/** 주소 값 → 조건 선택값 */
export function parseFilters(params: RawSearchParams): RestaurantFilters {
  return {
    partySizes: readList<PartySize>(params[PARAM_NAMES.partySizes], PARTY_SIZES),
    cuisines: readList<Cuisine>(params[PARAM_NAMES.cuisines], CUISINES),
    priceRanges: readList<PriceRange>(params[PARAM_NAMES.priceRanges], PRICE_RANGES),
  };
}

/** 조건 선택값 → 주소 (예: "/?cuisine=한식,중식"). 고른 것이 없으면 "/" */
export function filtersToHref(filters: RestaurantFilters): string {
  const query = new URLSearchParams();
  for (const kind of Object.keys(PARAM_NAMES) as FilterKind[]) {
    const values = filters[kind];
    if (values.length > 0) query.set(PARAM_NAMES[kind], values.join(","));
  }
  const text = query.toString();
  return text ? `/?${text}` : "/";
}

/** 버튼 하나를 눌렀을 때 갈 주소: 이미 골랐으면 빼고, 안 골랐으면 더합니다. */
export function toggleFilterHref(
  filters: RestaurantFilters,
  kind: FilterKind,
  value: string,
): string {
  const current = filters[kind] as readonly string[];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  return filtersToHref({ ...filters, [kind]: next });
}

/** 하나라도 고른 조건이 있는지 */
export function hasAnyFilter(filters: RestaurantFilters): boolean {
  return (
    filters.partySizes.length + filters.cuisines.length + filters.priceRanges.length > 0
  );
}
