// 목록 화면의 조건·검색어를 인터넷 주소(예: /?cuisine=한식,중식&price=1만 원 미만&q=찌개)에 담고 읽는 도구
// PLAN 작업 8·9 / 기준: DESIGN.md 3.1 "고른 조건과 검색어는 인터넷 주소 뒤에 붙여 둠", 6.1 이름(party·cuisine·price·q)
//
// 주소에 담아 두면 상세 화면에 갔다가 "목록으로" 돌아와도 고른 조건과 검색어가 그대로 남습니다.
// 몇 번째부터(offset)는 PLAN 작업 10에서 더합니다.

import type { RestaurantFilters } from "./rules";
import {
  CUISINES,
  MIN_RATINGS,
  PARTY_SIZES,
  PRICE_RANGES,
  type Cuisine,
  type MinRating,
  type PartySize,
  type PriceRange,
} from "./types";

/** 주소에 쓰는 이름 (DESIGN 6.1) */
const PARAM_NAMES = {
  partySizes: "party",
  cuisines: "cuisine",
  priceRanges: "price",
} as const;

/** 평점 기준을 담는 주소 이름 (예: rating=4.5) */
export const RATING_PARAM = "rating";

/** 검색어를 담는 주소 이름 */
export const SEARCH_PARAM = "q";

export type FilterKind = keyof typeof PARAM_NAMES;

/** 목록 화면의 상태: 조건 + 검색어 */
export type ListState = RestaurantFilters & { q: string };

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

/** 주소의 평점 기준 → 4.0 / 4.5 / 4.8 중 하나, 아니면 null (이상한 값은 조용히 무시) */
function readMinRating(raw: string | string[] | undefined): MinRating | null {
  const text = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  return MIN_RATINGS.find((v) => v.toFixed(1) === text.trim()) ?? null;
}

/** 주소 값 → 목록 화면 상태. 검색어는 받은 그대로 두고, 길이 검사는 화면에서 따로 합니다. */
export function parseListState(params: RawSearchParams): ListState {
  const rawQ = params[SEARCH_PARAM];
  return {
    partySizes: readList<PartySize>(params[PARAM_NAMES.partySizes], PARTY_SIZES),
    cuisines: readList<Cuisine>(params[PARAM_NAMES.cuisines], CUISINES),
    priceRanges: readList<PriceRange>(params[PARAM_NAMES.priceRanges], PRICE_RANGES),
    minRating: readMinRating(params[RATING_PARAM]),
    q: (Array.isArray(rawQ) ? rawQ[0] : rawQ) ?? "",
  };
}

/** 고른 조건을 주소에 넣을 이름·값 목록으로 바꿉니다. (고르지 않은 종류는 빠짐) */
export function filterParamEntries(
  filters: RestaurantFilters,
): { name: string; value: string }[] {
  const entries: { name: string; value: string }[] = (Object.keys(PARAM_NAMES) as FilterKind[])
    .filter((kind) => filters[kind].length > 0)
    .map((kind) => ({ name: PARAM_NAMES[kind], value: filters[kind].join(",") }));
  if (filters.minRating !== null) {
    entries.push({ name: RATING_PARAM, value: filters.minRating.toFixed(1) });
  }
  return entries;
}

/** 목록 화면 상태 → 주소 뒤에 붙일 글자 (예: "cuisine=한식&q=찌개"). 아무것도 없으면 "" */
export function listStateToQueryString(state: ListState): string {
  const query = new URLSearchParams();
  for (const { name, value } of filterParamEntries(state)) query.set(name, value);
  if (state.q.trim() !== "") query.set(SEARCH_PARAM, state.q.trim());
  return query.toString();
}

/** 목록 화면 상태 → 주소 (예: "/?cuisine=한식&q=찌개"). 아무것도 없으면 "/" */
export function listStateToHref(state: ListState): string {
  const text = listStateToQueryString(state);
  return text ? `/?${text}` : "/";
}

/**
 * 상세 화면 주소 (PLAN 작업 12). 목록의 조건·검색어를 그대로 붙여 두어,
 * 상세 화면의 "목록으로"가 같은 조건의 목록으로 돌아가게 합니다.
 * 예) "/restaurants/seed-01?cuisine=한식"
 */
export function restaurantDetailHref(id: string, listQueryString: string): string {
  const path = `/restaurants/${encodeURIComponent(id)}`;
  return listQueryString ? `${path}?${listQueryString}` : path;
}

/** 조건 버튼 하나를 눌렀을 때 갈 주소: 이미 골랐으면 빼고, 안 골랐으면 더합니다. (검색어는 유지) */
export function toggleFilterHref(
  state: ListState,
  kind: FilterKind,
  value: string,
): string {
  const current = state[kind] as readonly string[];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
  return listStateToHref({ ...state, [kind]: next });
}

/** 평점 기준 버튼을 눌렀을 때 갈 주소: 이미 고른 기준이면 해제, 아니면 그 기준으로 바꿈 (하나만 선택) */
export function toggleRatingHref(state: ListState, value: MinRating): string {
  return listStateToHref({ ...state, minRating: state.minRating === value ? null : value });
}

/** "조건 모두 지우기": 조건만 지우고 검색어는 유지 */
export function clearFiltersHref(state: ListState): string {
  return listStateToHref({ partySizes: [], cuisines: [], priceRanges: [], minRating: null, q: state.q });
}

/** "검색어 지우기": 검색어만 지우고 조건은 유지 */
export function clearSearchHref(state: ListState): string {
  return listStateToHref({ ...state, q: "" });
}

/** 하나라도 고른 조건이 있는지 */
export function hasAnyFilter(filters: RestaurantFilters): boolean {
  return (
    filters.partySizes.length + filters.cuisines.length + filters.priceRanges.length > 0 ||
    filters.minRating !== null
  );
}
