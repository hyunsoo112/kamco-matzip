// 식당·평가를 저장 공간(Supabase)에서 읽어 오는 곳 (서버 전용)
// PLAN 작업 14 (PRD 개발 단위 11) / 기준: DESIGN.md 4.1 식당 찾기, 5번 데이터 모양
//
// 화면 코드는 이 파일의 함수만 부르면 되고, 저장 공간을 어떻게 읽는지는 몰라도 됩니다.
// 거르기·검색·정렬·평균 별점은 lib/rules.ts의 같은 규칙을 그대로 씁니다.
// (식당 수가 수십~수백 곳 수준이라, 한 번에 읽어 와서 규칙을 적용해도 충분히 빠릅니다)

import "server-only";
import {
  getDb,
  RESTAURANT_COLUMNS,
  REVIEW_COLUMNS,
  toRestaurant,
  toReview,
  type RestaurantRow,
  type ReviewRow,
} from "./db";
import {
  averageRating,
  filterRestaurants,
  searchRestaurants,
  sortByDistanceThenName,
  todayInKorea,
  type RestaurantFilters,
} from "./rules";
import type { RatingSummary, Restaurant, RestaurantListItem, Review } from "./types";

/** 저장 공간을 읽다 문제가 생겼을 때 (화면에서 "잠시 후 다시 시도" 안내에 사용) */
export class DataLoadError extends Error {}

/** 모든 식당 */
async function loadAllRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await getDb().from("restaurants").select(RESTAURANT_COLUMNS);
  if (error) throw new DataLoadError(`식당 목록을 읽지 못했습니다: ${error.message}`);
  return (data as RestaurantRow[]).map(toRestaurant);
}

/** 식당별 평가 수·평균 별점 (평가 3건 미만이면 평균 없음) */
async function loadRatingSummaries(): Promise<Map<string, RatingSummary>> {
  const { data, error } = await getDb().from("reviews").select("restaurant_id, rating");
  if (error) throw new DataLoadError(`평가를 읽지 못했습니다: ${error.message}`);

  const ratingsById = new Map<string, number[]>();
  for (const row of data as { restaurant_id: string; rating: number }[]) {
    const list = ratingsById.get(row.restaurant_id) ?? [];
    list.push(row.rating);
    ratingsById.set(row.restaurant_id, list);
  }

  const summaries = new Map<string, RatingSummary>();
  for (const [id, ratings] of ratingsById) {
    summaries.set(id, { reviewCount: ratings.length, avgRating: averageRating(ratings) });
  }
  return summaries;
}

const NO_REVIEWS: RatingSummary = { reviewCount: 0, avgRating: null };

/**
 * 목록 화면용: 조건으로 거르고, 검색어로 찾고, 가까운 순으로 정렬한 카드 목록.
 * query는 길이 검사를 통과한 검색어(없으면 "")를 넘겨 주세요.
 */
export async function getRestaurantList(
  filters: RestaurantFilters,
  query: string,
): Promise<RestaurantListItem[]> {
  const [restaurants, summaries] = await Promise.all([
    loadAllRestaurants(),
    loadRatingSummaries(),
  ]);

  const found = sortByDistanceThenName(searchRestaurants(filterRestaurants(restaurants, filters), query));

  return found.map(({ id, name, cuisine, distanceKm, priceRange }) => ({
    id,
    name,
    cuisine,
    distanceKm,
    priceRange,
    ...(summaries.get(id) ?? NO_REVIEWS),
  }));
}

/**
 * 오늘(한국 시간) 이 기기로 이 식당에 평가를 남겼는지 — 하루 1번 규칙 (PLAN 작업 18)
 * 기기 표시값은 비교에만 쓰고 어디에도 돌려주지 않습니다.
 */
export async function hasReviewedToday(restaurantId: string, deviceId: string): Promise<boolean> {
  const { count, error } = await getDb()
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("device_id", deviceId)
    .eq("review_date", todayInKorea());
  if (error) throw new DataLoadError(`오늘 평가 여부를 확인하지 못했습니다: ${error.message}`);
  return (count ?? 0) > 0;
}

/**
 * 오늘(한국 시간) 이 기기로 새로 등록한 식당 수 — 하루 3곳 제한 (PLAN 작업 21)
 * 기기 표시값은 비교에만 쓰고 어디에도 돌려주지 않습니다. 미리 넣은 식당은 기기 값이 "seed"라 세지 않습니다.
 */
export async function countRestaurantsRegisteredToday(deviceId: string): Promise<number> {
  const { count, error } = await getDb()
    .from("restaurants")
    .select("id", { count: "exact", head: true })
    .eq("device_id", deviceId)
    .eq("created_date", todayInKorea());
  if (error) throw new DataLoadError(`오늘 등록 수를 확인하지 못했습니다: ${error.message}`);
  return count ?? 0;
}

/** 상세 화면용: 식당 정보 + 평가 목록(최신순) + 평균 별점. 없는 식당이면 null */
export async function getRestaurantDetail(
  id: string,
): Promise<(Restaurant & RatingSummary & { reviews: Review[] }) | null> {
  const db = getDb();
  const [restaurantResult, reviewsResult] = await Promise.all([
    db.from("restaurants").select(RESTAURANT_COLUMNS).eq("id", id).maybeSingle(),
    db
      .from("reviews")
      .select(REVIEW_COLUMNS)
      .eq("restaurant_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (restaurantResult.error) {
    throw new DataLoadError(`식당 정보를 읽지 못했습니다: ${restaurantResult.error.message}`);
  }
  if (reviewsResult.error) {
    throw new DataLoadError(`평가를 읽지 못했습니다: ${reviewsResult.error.message}`);
  }
  if (!restaurantResult.data) return null;

  const reviews = (reviewsResult.data as ReviewRow[]).map(toReview);
  return {
    ...toRestaurant(restaurantResult.data as RestaurantRow),
    reviews,
    reviewCount: reviews.length,
    avgRating: averageRating(reviews.map((r) => r.rating)),
  };
}
