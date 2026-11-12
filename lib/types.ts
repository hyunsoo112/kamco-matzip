// 식당·평가 정보의 모양과 선택지
// PLAN 작업 3 (PRD 개발 단위 1) / 기준: DESIGN.md 3번 "선택지 이름", 5번 데이터 모양, 6번 API
//
// 화면·서버·저장 공간이 모두 이 파일의 이름과 선택지를 함께 씁니다.
// 선택지를 바꿀 때는 이 파일만 고치면 됩니다. (PRD.md와 다르게 바꾸지 않습니다)

// ─────────────────────────────────────────────
// 1. 선택지 (PRD·DESIGN과 같은 이름, 같은 순서)
// ─────────────────────────────────────────────

/** 인원: 한 식당이 여러 개를 가질 수 있음 (예: 혼밥과 단체 모두 가능) */
export const PARTY_SIZES = ["혼밥", "2~4명", "단체"] as const;

/** 인원 버튼 옆에 붙일 설명 (단체 = 5명 이상) */
export const PARTY_SIZE_DESCRIPTIONS: Record<PartySize, string> = {
  혼밥: "혼자",
  "2~4명": "2~4명",
  단체: "5명 이상",
};

/** 음식 종류: 한 식당에 하나만. "기타"는 "음식 종류 5가지 이상" 목표를 셀 때 뺌 */
export const CUISINES = ["한식", "중식", "일식", "양식", "분식", "기타"] as const;

/** "음식 종류 5가지 이상" 목표를 셀 때 빼는 종류 */
export const CUISINE_EXCLUDED_FROM_VARIETY: Cuisine = "기타";

/** 1인 가격대: 한 식당에 하나만. 경계값이 겹치지 않게 나눔 */
export const PRICE_RANGES = [
  "1만 원 미만",
  "1만~2만 원 미만",
  "2만 원 이상",
] as const;

/** 인재개발원에서 떨어진 거리(km 이내): 10km보다 먼 식당은 등록하지 않음 */
export const DISTANCE_KM = [1, 5, 10] as const;

/** 쉬는 날: 요일 버튼으로만 선택 (선택 입력) */
export const DAYS_OF_WEEK = ["월", "화", "수", "목", "금", "토", "일"] as const;

// 선택지에서 자동으로 만들어지는 이름표 (선택지 밖의 값은 넣을 수 없음)
export type PartySize = (typeof PARTY_SIZES)[number];
export type Cuisine = (typeof CUISINES)[number];
export type PriceRange = (typeof PRICE_RANGES)[number];
export type DistanceKm = (typeof DISTANCE_KM)[number];
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// ─────────────────────────────────────────────
// 2. 식당과 평가의 모양 (화면·서버에서 쓰는 이름)
//    저장 공간(Supabase) 표의 이름은 DESIGN.md 5번을 따르며,
//    서로 바꿔 주는 일은 lib/db.ts(PLAN 작업 13)에서 합니다.
// ─────────────────────────────────────────────

/** 식당 (DESIGN 5.1 식당 표) — 기기 표시값·비교용 이름처럼 화면에 보이지 않는 값은 뺐습니다 */
export interface Restaurant {
  /** 식당 번호 */
  id: string;
  /** 식당 이름 (최대 30글자) */
  name: string;
  /** 위치: "도로명 주소 (동 이름)" 형식 (최대 50글자) */
  address: string;
  /** 인재개발원에서 떨어진 거리 (1 / 5 / 10km 이내) */
  distanceKm: DistanceKm;
  /** 음식 종류 (하나) */
  cuisine: Cuisine;
  /** 대표 메뉴 (최대 30글자) */
  signatureMenu: string;
  /** 인원 (1개 이상) */
  partySizes: PartySize[];
  /** 1인 가격대 (하나) */
  priceRange: PriceRange;
  /** 쉬는 날 (없으면 빈 목록) */
  daysOff: DayOfWeek[];
}

/** 평가 (DESIGN 5.2 평가 표) — 기기 표시값은 화면에 보내지 않으므로 뺐습니다 */
export interface Review {
  /** 별명 (2~10글자) */
  nickname: string;
  /** 별점 (1~5 정수) */
  rating: number;
  /** 한 줄 평 (5~100글자) */
  comment: string;
  /** 등록 시각 (ISO 날짜 글자, 예: "2026-11-12T03:00:00Z") */
  createdAt: string;
}

/** 평균 별점과 평가 수 (평가 3건 미만이면 avgRating은 null → "평가 모으는 중") */
export interface RatingSummary {
  reviewCount: number;
  avgRating: number | null;
}

// ─────────────────────────────────────────────
// 3. 서버 API가 주고받는 모양 (DESIGN 6.1)
// ─────────────────────────────────────────────

/** ① 목록 카드 한 장 */
export type RestaurantListItem = Pick<
  Restaurant,
  "id" | "name" | "cuisine" | "distanceKm" | "priceRange"
> &
  RatingSummary;

/** ① 목록 조회 조건 (같은 종류 안은 "또는", 다른 종류끼리는 "그리고") */
export interface RestaurantSearchQuery {
  partySizes: PartySize[];
  cuisines: Cuisine[];
  priceRanges: PriceRange[];
  /** 검색어 (1~20글자, 없으면 빈 글자) */
  q: string;
  /** 몇 번째부터 (0, 20, 40 …) */
  offset: number;
}

/** ① 목록 응답 */
export interface RestaurantListResponse {
  data: RestaurantListItem[];
  total: number;
  hasMore: boolean;
}

/** ② 상세 응답 */
export interface RestaurantDetailResponse {
  data: Restaurant &
    RatingSummary & {
      /** 최신순 */
      reviews: Review[];
      /** 오늘 이 기기로 이 식당에 평가했는지 */
      reviewedToday: boolean;
    };
}

/** ③ 새 식당 등록 요청 */
export type CreateRestaurantRequest = Omit<Restaurant, "id"> & {
  deviceId: string;
};

/** ③ 새 식당 등록 응답 (201) */
export interface CreateRestaurantResponse {
  data: { id: string };
}

/** ④ 평가 등록 요청 */
export interface CreateReviewRequest {
  nickname: string;
  rating: number;
  comment: string;
  deviceId: string;
}

/** ④ 평가 등록 응답 (201) */
export interface CreateReviewResponse {
  data: Review;
}

// ─────────────────────────────────────────────
// 4. 오류 (DESIGN 6.2 결과 코드)
// ─────────────────────────────────────────────

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "PERSONAL_INFO",
  "BANNED_WORD",
  "DUPLICATE_NAME",
  "ALREADY_REVIEWED_TODAY",
  "DAILY_LIMIT",
  "NOT_FOUND",
  "SERVER_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** 모든 API의 오류 응답 모양 */
export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    /** 화면에 그대로 보여 줄 한국어 안내 */
    message: string;
    /** 문제가 있는 칸 이름 (없으면 생략) */
    field?: string;
  };
}
