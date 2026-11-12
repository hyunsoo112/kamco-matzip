// 저장 공간(Supabase) 연결 — 서버 전용
// PLAN 작업 14 / 기준: DESIGN.md 5번 데이터 모양, 7번 보안, 9.4 환경변수
//
// - 비밀 열쇠(SUPABASE_SERVICE_ROLE_KEY)는 .env에서 읽고, 서버 쪽 코드에서만 씁니다.
//   이 파일을 휴대폰 화면 쪽 코드에서 불러오면 "server-only" 때문에 빌드가 멈춥니다.
// - 저장 공간의 이름(name_key, walk_minutes …)과 화면의 이름(walkMinutes …)을 서로 바꿔 줍니다.
// - 기기 표시값(device_id)은 읽어 오지 않습니다. (화면에 보내지 않기 위해)

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  Cuisine,
  DayOfWeek,
  PartySize,
  PriceRange,
  Restaurant,
  Review,
  WalkMinutes,
} from "./types";

let client: SupabaseClient | null = null;

/** Supabase 연결 (처음 한 번 만들고 다시 씀) */
export function getDb(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // 값 자체는 절대 보여 주지 않고, 어떤 이름이 비었는지만 알립니다.
    throw new Error(
      "저장 공간 접속 값이 없습니다. .env의 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 확인해 주세요.",
    );
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

// ─────────────────────────────────────────────
// 저장 공간의 줄(row) 모양 ↔ 화면에서 쓰는 모양
// ─────────────────────────────────────────────

/** 식당 표에서 읽어 올 칸 (device_id·name_key·created_* 는 읽지 않음) */
export const RESTAURANT_COLUMNS =
  "id, name, address, walk_minutes, cuisine, signature_menu, party_sizes, price_range, days_off";

export interface RestaurantRow {
  id: string;
  name: string;
  address: string;
  walk_minutes: number;
  cuisine: string;
  signature_menu: string;
  party_sizes: string[];
  price_range: string;
  days_off: string[];
}

/** 식당 줄 → 화면용 식당 (값은 저장 공간 규칙으로 이미 검사되어 있음) */
export function toRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    walkMinutes: row.walk_minutes as WalkMinutes,
    cuisine: row.cuisine as Cuisine,
    signatureMenu: row.signature_menu,
    partySizes: row.party_sizes as PartySize[],
    priceRange: row.price_range as PriceRange,
    daysOff: row.days_off as DayOfWeek[],
  };
}

/** 평가 표에서 읽어 올 칸 (device_id는 읽지 않음) */
export const REVIEW_COLUMNS = "nickname, rating, comment, created_at";

export interface ReviewRow {
  nickname: string;
  rating: number;
  comment: string;
  created_at: string;
}

/** 평가 줄 → 화면용 평가 */
export function toReview(row: ReviewRow): Review {
  return {
    nickname: row.nickname,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}
