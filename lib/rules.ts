// 공통 규칙 검사 (화면과 서버가 같은 규칙으로 두 번 검사)
// PLAN 작업 4 / 기준: PRD.md 5번 "AI가 지킬 규칙", DESIGN.md 4.0 공통 규칙·6.2 결과 코드
//
// 숫자 규칙을 바꿀 때는 이 파일의 LIMITS만 고칩니다. (PRD.md와 다르게 바꾸지 않습니다)

import { BANNED_WORDS } from "./bannedWords";
import {
  CUISINES,
  DAYS_OF_WEEK,
  PARTY_SIZES,
  PRICE_RANGES,
  WALK_MINUTES,
  type Cuisine,
  type ErrorCode,
  type PartySize,
  type PriceRange,
} from "./types";

// ─────────────────────────────────────────────
// 1. 숫자 규칙 (PRD 5번)
// ─────────────────────────────────────────────

export const LIMITS = {
  /** 검색어 글자 수 */
  searchQuery: { min: 1, max: 20 },
  /** 별명 글자 수 */
  nickname: { min: 2, max: 10 },
  /** 한 줄 평 글자 수 */
  comment: { min: 5, max: 100 },
  /** 별점 (정수) */
  rating: { min: 1, max: 5 },
  /** 새 식당 이름 글자 수 */
  restaurantName: { min: 1, max: 30 },
  /** 새 식당 위치 글자 수 */
  address: { min: 1, max: 50 },
  /** 새 식당 대표 메뉴 글자 수 */
  signatureMenu: { min: 1, max: 30 },
  /** 목록 한 번에 보여 줄 식당 수 ("더 보기"도 같은 수만큼 추가) */
  pageSize: 20,
  /** 평균 별점을 보여 주기 시작하는 평가 수 */
  minReviewsForAverage: 3,
  /** 같은 휴대폰에서 하루에 등록할 수 있는 새 식당 수 */
  maxNewRestaurantsPerDay: 3,
  /** 개인정보로 보는 연속 숫자 자릿수 */
  personalInfoDigits: 9,
} as const;

/** 위치 칸 아래에 보여 줄 주소 형식 안내 (PRD: 안내만 하고 형식을 강제하지는 않음) */
export const ADDRESS_HINT =
  "도로명 주소 뒤 괄호에 동 이름을 적어 주세요. 예: OO로 12 (OO동)";

// ─────────────────────────────────────────────
// 2. 글자 다루기
// ─────────────────────────────────────────────

/** 글자 수 세기: 앞뒤 띄어쓰기를 지운 뒤 셉니다. 가운데 띄어쓰기는 1글자로 셉니다. */
export function countChars(text: string): number {
  // 이모지처럼 두 칸을 쓰는 글자도 1글자로 세기 위해 한 글자씩 나눠 셉니다.
  return Array.from(text.trim()).length;
}

/** 비교·검색용 글자: 띄어쓰기를 모두 지우고 영어는 소문자로 바꿉니다. */
export function toCompareKey(text: string): string {
  return text.replace(/\s+/g, "").toLowerCase();
}

/** 같은 식당인지 비교할 "비교용 이름" (예: "김밥 천국" → "김밥천국") */
export function makeNameKey(name: string): string {
  return toCompareKey(name);
}

/** 검색: 검색어가 대상 글에 일부라도 들어 있는지 (띄어쓰기 무시) */
export function matchesSearch(target: string, query: string): boolean {
  return toCompareKey(target).includes(toCompareKey(query));
}

/** 개인정보 검사: 띄어쓰기·"-"를 지운 뒤 숫자 연속 9자리 이상이거나 "@"가 있으면 true */
export function containsPersonalInfo(text: string): boolean {
  if (text.includes("@")) return true;
  const compact = text.replace(/[\s-]/g, "");
  const digitRun = new RegExp(`\\d{${LIMITS.personalInfoDigits},}`);
  return digitRun.test(compact);
}

/** 금지어 검사: 띄어쓰기를 지운 글에 금지어가 일부라도 들어 있으면 true */
export function containsBannedWord(text: string): boolean {
  const compact = toCompareKey(text);
  return BANNED_WORDS.some((word) => compact.includes(toCompareKey(word)));
}

// ─────────────────────────────────────────────
// 2-1. 정렬 (PRD must ① 세 번째 규칙, DESIGN 4.1)
// ─────────────────────────────────────────────

/**
 * 목록 정렬: 걸어서 걸리는 시간이 짧은 순(5분 → 10분 → 15분), 같으면 이름 가나다순.
 * 원래 목록은 그대로 두고, 정렬한 새 목록을 돌려줍니다.
 */
export function sortByWalkThenName<
  T extends { walkMinutes: number; name: string },
>(restaurants: readonly T[]): T[] {
  return [...restaurants].sort(
    (a, b) => a.walkMinutes - b.walkMinutes || a.name.localeCompare(b.name, "ko"),
  );
}

// ─────────────────────────────────────────────
// 2-2. 조건으로 걸러 보기 (PRD must ① 첫 번째 규칙, DESIGN 4.1)
// ─────────────────────────────────────────────

/** 조건 선택값 (고르지 않은 종류는 빈 목록 = 그 종류는 거르지 않음) */
export interface RestaurantFilters {
  partySizes: readonly PartySize[];
  cuisines: readonly Cuisine[];
  priceRanges: readonly PriceRange[];
}

/**
 * 조건으로 거르기: 같은 종류 안에서는 "또는", 다른 종류끼리는 "그리고".
 * 예) 한식·중식 + 1만 원 미만 → (한식 또는 중식) 그리고 (1만 원 미만)
 * 인원은 한 식당이 여러 개를 가지므로, 고른 인원 중 하나라도 맞으면 통과합니다.
 */
export function filterRestaurants<
  T extends { partySizes: readonly PartySize[]; cuisine: Cuisine; priceRange: PriceRange },
>(restaurants: readonly T[], filters: RestaurantFilters): T[] {
  return restaurants.filter(
    (r) =>
      (filters.partySizes.length === 0 ||
        r.partySizes.some((p) => filters.partySizes.includes(p))) &&
      (filters.cuisines.length === 0 || filters.cuisines.includes(r.cuisine)) &&
      (filters.priceRanges.length === 0 || filters.priceRanges.includes(r.priceRange)),
  );
}

// ─────────────────────────────────────────────
// 3. 평균 별점과 날짜
// ─────────────────────────────────────────────

/** 평균 별점: 평가 3건 미만이면 null("평가 모으는 중"), 아니면 소수점 첫째 자리까지 반올림 */
export function averageRating(ratings: readonly number[]): number | null {
  if (ratings.length < LIMITS.minReviewsForAverage) return null;
  const sum = ratings.reduce((total, r) => total + r, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

/** 한국 시간 기준 오늘 날짜 (예: "2026-11-12") — 하루 1번·하루 3곳 규칙에 사용 */
export function todayInKorea(now: Date = new Date()): string {
  // "sv-SE" 형식은 날짜를 "YYYY-MM-DD"로 보여 줍니다.
  return now.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

// ─────────────────────────────────────────────
// 4. 입력 검사 (통과하면 null, 아니면 첫 번째 문제 1개를 돌려줌)
// ─────────────────────────────────────────────

export interface RuleViolation {
  code: ErrorCode;
  /** 화면에 그대로 보여 줄 한국어 안내 */
  message: string;
  /** 문제가 있는 칸 이름 */
  field?: string;
}

const MESSAGES = {
  personalInfo: "전화번호나 이메일은 적을 수 없어요",
  bannedWord: "사용할 수 없는 단어가 들어 있어요",
} as const;

/** 낱말 뒤에 붙일 "은/는" 고르기 (마지막 글자에 받침이 있으면 "은") */
function withTopicParticle(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasFinalConsonant = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${word}${hasFinalConsonant ? "은" : "는"}`;
}

/** 글자 수 검사 */
function checkLength(
  value: unknown,
  field: string,
  label: string,
  limit: { min: number; max: number },
): RuleViolation | null {
  const length = typeof value === "string" ? countChars(value) : 0;
  if (length < limit.min || length > limit.max) {
    const range =
      limit.min === 1 ? `${limit.max}글자 이하` : `${limit.min}~${limit.max}글자`;
    return {
      code: "VALIDATION_ERROR",
      message: `${withTopicParticle(label)} ${range}로 적어 주세요`,
      field,
    };
  }
  return null;
}

/** 개인정보·금지어 검사 (글을 쓸 수 있는 칸에만 적용) */
function checkTextSafety(value: string, field: string): RuleViolation | null {
  if (containsPersonalInfo(value)) {
    return { code: "PERSONAL_INFO", message: MESSAGES.personalInfo, field };
  }
  if (containsBannedWord(value)) {
    return { code: "BANNED_WORD", message: MESSAGES.bannedWord, field };
  }
  return null;
}

/** 값이 선택지 안에 있는지 */
function isOneOf<T>(choices: readonly T[], value: unknown): value is T {
  return choices.includes(value as T);
}

/** 검색어 검사: 1~20글자 (검색어가 없으면 검사하지 않음) */
export function validateSearchQuery(q: string): RuleViolation | null {
  if (q === "") return null;
  return checkLength(q, "q", "검색어", LIMITS.searchQuery);
}

/** 평가 검사 — 검사 대상 칸: 별명, 한 줄 평 (DESIGN 4.0 표) */
export function validateReview(input: {
  nickname: unknown;
  rating: unknown;
  comment: unknown;
}): RuleViolation | null {
  const lengthProblem =
    checkLength(input.nickname, "nickname", "별명", LIMITS.nickname) ??
    checkLength(input.comment, "comment", "한 줄 평", LIMITS.comment);
  if (lengthProblem) return lengthProblem;

  const rating = input.rating;
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < LIMITS.rating.min ||
    rating > LIMITS.rating.max
  ) {
    return {
      code: "VALIDATION_ERROR",
      message: "별점은 1~5점 중에서 골라 주세요",
      field: "rating",
    };
  }

  return (
    checkTextSafety(input.nickname as string, "nickname") ??
    checkTextSafety(input.comment as string, "comment")
  );
}

/** 새 식당 검사 — 필수 7가지 + 쉬는 날(선택), 검사 대상 글자 칸: 이름·위치·대표 메뉴 */
export function validateNewRestaurant(input: {
  name: unknown;
  address: unknown;
  walkMinutes: unknown;
  cuisine: unknown;
  signatureMenu: unknown;
  partySizes: unknown;
  priceRange: unknown;
  daysOff: unknown;
}): RuleViolation | null {
  const lengthProblem =
    checkLength(input.name, "name", "식당 이름", LIMITS.restaurantName) ??
    checkLength(input.address, "address", "위치", LIMITS.address) ??
    checkLength(
      input.signatureMenu,
      "signatureMenu",
      "대표 메뉴",
      LIMITS.signatureMenu,
    );
  if (lengthProblem) return lengthProblem;

  if (!isOneOf(WALK_MINUTES, input.walkMinutes)) {
    return {
      code: "VALIDATION_ERROR",
      message: "걸어서 걸리는 시간을 5분 / 10분 / 15분 중에서 골라 주세요",
      field: "walkMinutes",
    };
  }
  if (!isOneOf(CUISINES, input.cuisine)) {
    return {
      code: "VALIDATION_ERROR",
      message: "음식 종류를 하나 골라 주세요",
      field: "cuisine",
    };
  }
  if (!isOneOf(PRICE_RANGES, input.priceRange)) {
    return {
      code: "VALIDATION_ERROR",
      message: "가격대를 하나 골라 주세요",
      field: "priceRange",
    };
  }

  const partySizes = input.partySizes;
  if (
    !Array.isArray(partySizes) ||
    partySizes.length === 0 ||
    !partySizes.every((p) => isOneOf(PARTY_SIZES, p)) ||
    new Set(partySizes).size !== partySizes.length
  ) {
    return {
      code: "VALIDATION_ERROR",
      message: "인원을 하나 이상 골라 주세요",
      field: "partySizes",
    };
  }

  const daysOff = input.daysOff;
  if (
    !Array.isArray(daysOff) ||
    !daysOff.every((d) => isOneOf(DAYS_OF_WEEK, d)) ||
    new Set(daysOff).size !== daysOff.length
  ) {
    return {
      code: "VALIDATION_ERROR",
      message: "쉬는 날은 요일 버튼으로 골라 주세요",
      field: "daysOff",
    };
  }

  return (
    checkTextSafety(input.name as string, "name") ??
    checkTextSafety(input.address as string, "address") ??
    checkTextSafety(input.signatureMenu as string, "signatureMenu")
  );
}
