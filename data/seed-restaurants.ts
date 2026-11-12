// 처음 화면에 미리 넣어 둘 식당 10곳
// PLAN 작업 5 (PRD 개발 단위 2) / 기준: DESIGN.md 5.3 "미리 넣을 데이터"
//
// 상태: 임시 데이터 — 작성자가 실제로 다녀온 식당 정보를 주면 이 파일만 바꿉니다.
//   - 모든 이름 앞에 "[임시]"를 붙여 실제 식당과 헷갈리지 않게 했습니다.
//   - 주소도 실제로 없는 가짜 주소입니다.
//
// 지켜야 할 조건 (실제 데이터로 바꿀 때도 동일):
//   - 10곳, "기타"를 뺀 음식 종류가 5가지 이상
//   - 모든 칸이 lib/rules.ts의 새 식당 규칙(validateNewRestaurant)을 통과해야 함
//
// 저장 공간(Supabase)을 연결하기 전(PLAN 작업 6~12)에는 화면이 이 파일을 직접 읽고,
// 연결한 뒤(PLAN 작업 14)에는 이 내용을 저장 공간으로 한 번 옮겨 넣습니다.

import type { Restaurant } from "@/lib/types";

export const SEED_STATUS = "임시 데이터 — 실제 식당 정보로 바꿀 예정";

export const SEED_RESTAURANTS: Restaurant[] = [
  {
    id: "seed-01",
    name: "[임시] 든든한 백반집",
    address: "임시로 11 (가나동)",
    walkMinutes: 5,
    cuisine: "한식",
    signatureMenu: "제육볶음 백반",
    partySizes: ["혼밥", "2~4명"],
    priceRange: "1만 원 미만",
    daysOff: ["일"],
  },
  {
    id: "seed-02",
    name: "[임시] 얼큰 찌개마을",
    address: "임시로 25 (가나동)",
    walkMinutes: 5,
    cuisine: "한식",
    signatureMenu: "김치찌개",
    partySizes: ["혼밥", "2~4명", "단체"],
    priceRange: "1만 원 미만",
    daysOff: [],
  },
  {
    id: "seed-03",
    name: "[임시] 숯불 갈비정",
    address: "연습대로 102 (다라동)",
    walkMinutes: 15,
    cuisine: "한식",
    signatureMenu: "돼지갈비",
    partySizes: ["2~4명", "단체"],
    priceRange: "2만 원 이상",
    daysOff: ["월"],
  },
  {
    id: "seed-04",
    name: "[임시] 홍룡 반점",
    address: "임시로 40 (가나동)",
    walkMinutes: 10,
    cuisine: "중식",
    signatureMenu: "짬뽕",
    partySizes: ["혼밥", "2~4명", "단체"],
    priceRange: "1만 원 미만",
    daysOff: ["화"],
  },
  {
    id: "seed-05",
    name: "[임시] 바다 초밥",
    address: "연습대로 18 (다라동)",
    walkMinutes: 10,
    cuisine: "일식",
    signatureMenu: "모둠초밥",
    partySizes: ["혼밥", "2~4명"],
    priceRange: "1만~2만 원 미만",
    daysOff: [],
  },
  {
    id: "seed-06",
    name: "[임시] 카츠 공방",
    address: "임시로 7 (가나동)",
    walkMinutes: 5,
    cuisine: "일식",
    signatureMenu: "등심돈가스",
    partySizes: ["혼밥", "2~4명"],
    priceRange: "1만~2만 원 미만",
    daysOff: ["일"],
  },
  {
    id: "seed-07",
    name: "[임시] 파스타 키친",
    address: "연습대로 55 (다라동)",
    walkMinutes: 15,
    cuisine: "양식",
    signatureMenu: "토마토 파스타",
    partySizes: ["2~4명", "단체"],
    priceRange: "1만~2만 원 미만",
    daysOff: ["월", "화"],
  },
  {
    id: "seed-08",
    name: "[임시] 수제버거 하우스",
    address: "임시로 63 (마바동)",
    walkMinutes: 10,
    cuisine: "양식",
    signatureMenu: "치즈버거 세트",
    partySizes: ["혼밥", "2~4명"],
    priceRange: "1만~2만 원 미만",
    daysOff: [],
  },
  {
    id: "seed-09",
    name: "[임시] 김밥 한줄",
    address: "임시로 3 (가나동)",
    walkMinutes: 5,
    cuisine: "분식",
    signatureMenu: "참치김밥",
    partySizes: ["혼밥"],
    priceRange: "1만 원 미만",
    daysOff: [],
  },
  {
    id: "seed-10",
    name: "[임시] 떡볶이 연구소",
    address: "연습대로 9 (다라동)",
    walkMinutes: 10,
    cuisine: "분식",
    signatureMenu: "치즈떡볶이",
    partySizes: ["혼밥", "2~4명", "단체"],
    priceRange: "1만 원 미만",
    daysOff: ["수"],
  },
];
