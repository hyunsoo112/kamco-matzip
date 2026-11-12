// 처음 화면에 미리 넣어 둘 식당 50곳 (손으로 쓴 10곳 + 규칙대로 만든 40곳)
// PLAN 작업 5 (PRD 개발 단위 2) / 기준: DESIGN.md 5.3 "미리 넣을 데이터"
//
// 상태: 임시 데이터 — 작성자가 실제로 다녀온 식당 정보를 주면 이 파일만 바꿉니다.
//   - 모든 이름 앞에 "[임시]"를 붙여 실제 식당과 헷갈리지 않게 했습니다.
//   - 주소도 실제로 없는 가짜 주소입니다.
//
// 지켜야 할 조건 (실제 데이터로 바꿀 때도 동일):
//   - 50곳, "기타"를 뺀 음식 종류가 5가지 이상
//   - 모든 칸이 lib/rules.ts의 새 식당 규칙(validateNewRestaurant)을 통과해야 함
//
// 저장 공간(Supabase)을 연결하기 전(PLAN 작업 6~12)에는 화면이 이 파일을 직접 읽고,
// 연결한 뒤(PLAN 작업 14)에는 이 내용을 저장 공간으로 한 번 옮겨 넣습니다.

import type { Restaurant } from "@/lib/types";

export const SEED_STATUS = "임시 데이터 — 실제 식당 정보로 바꿀 예정";

const BASE_SEED_RESTAURANTS: Restaurant[] = [
  {
    id: "seed-01",
    name: "[임시] 든든한 백반집",
    address: "임시로 11 (가나동)",
    distanceKm: 1,
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
    distanceKm: 1,
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
    distanceKm: 5,
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
    distanceKm: 1,
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
    distanceKm: 1,
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
    distanceKm: 1,
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
    distanceKm: 5,
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
    distanceKm: 1,
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
    distanceKm: 1,
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
    distanceKm: 1,
    cuisine: "분식",
    signatureMenu: "치즈떡볶이",
    partySizes: ["혼밥", "2~4명", "단체"],
    priceRange: "1만 원 미만",
    daysOff: ["수"],
  },
];

// ─────────────────────────────────────────────
// seed-11 ~ seed-50: 임시 식당 40곳 (음식 종류별 8곳)
// 거리·가격대·인원·쉬는 날은 돌려가며 정해, 조건 버튼과 정렬을 시험하기 좋게 섞었습니다.
// 이름·주소·메뉴는 모두 가짜입니다.
// ─────────────────────────────────────────────

const EXTRA_BY_CUISINE: { cuisine: Restaurant["cuisine"]; items: [string, string][] }[] = [
  { cuisine: "한식", items: [["청국장 마루", "청국장"], ["된장 한상", "된장찌개 정식"], ["순두부 골목", "해물순두부"], ["설렁탕 본가", "설렁탕"], ["비빔밥 곳간", "돌솥비빔밥"], ["불고기 사랑채", "불고기 정식"], ["삼겹 구이집", "삼겹살"], ["칼국수 마당", "바지락칼국수"]] },
  { cuisine: "중식", items: [["용궁 짜장", "간짜장"], ["북경 주방", "탕수육"], ["마라 공작소", "마라탕"], ["금룡 마파두부", "마파두부 덮밥"], ["차이나 볶음밥", "새우볶음밥"], ["복래 만두", "군만두"], ["홍등 요리", "깐풍기"], ["사천 짬뽕", "삼선짬뽕"]] },
  { cuisine: "일식", items: [["소바 한그릇", "냉소바"], ["이자카야 달빛", "모둠 꼬치"], ["우동 공방", "튀김우동"], ["라멘 별", "돈코츠라멘"], ["덮밥 하루", "가츠동"], ["오니기리 가게", "참치마요 오니기리"], ["스시 정원", "연어초밥"], ["규동 한끼", "소고기 규동"]] },
  { cuisine: "양식", items: [["스테이크 하우스", "등심 스테이크"], ["리조또 정원", "버섯 리조또"], ["피자 오븐", "페퍼로니 피자"], ["샌드위치 카페", "클럽 샌드위치"], ["브런치 테이블", "에그 베네딕트"], ["그릴 키친", "치킨 그릴 플레이트"], ["크림 파스타집", "까르보나라"], ["오믈렛 하우스", "치즈 오믈렛"]] },
  { cuisine: "분식", items: [["라볶이 천국", "라볶이"], ["순대 포차", "모둠 순대"], ["튀김 골목", "모둠 튀김"], ["쫄면 하우스", "쫄면"], ["핫도그 가게", "치즈 핫도그"], ["우동김밥 세트", "우동김밥 세트"], ["어묵 한꼬치", "어묵탕"], ["토스트 아침", "햄치즈 토스트"]] },
];

const EXTRA_DISTANCE: Restaurant["distanceKm"][] = [1, 5, 10, 1, 5, 1, 10, 5];
const EXTRA_PRICE: Restaurant["priceRange"][] = ["1만 원 미만", "1만~2만 원 미만", "2만 원 이상", "1만~2만 원 미만"];
const EXTRA_PARTY: Restaurant["partySizes"][] = [["혼밥"], ["혼밥", "2~4명"], ["2~4명", "단체"], ["혼밥", "2~4명", "단체"]];
const EXTRA_DAYS_OFF: Restaurant["daysOff"][] = [[], ["일"], [], ["월"], [], ["토", "일"], [], ["수"]];
const EXTRA_TOWNS = ["가나동", "다라동", "마바동", "사아동"];

const EXTRA_SEED_RESTAURANTS: Restaurant[] = EXTRA_BY_CUISINE.flatMap(({ cuisine, items }, c) =>
  items.map(([name, menu], i) => {
    const n = c * 8 + i; // 0 ~ 39
    return {
      id: `seed-${String(n + 11).padStart(2, "0")}`,
      name: `[임시] ${name}`,
      address: `임시로 ${n + 12} (${EXTRA_TOWNS[n % EXTRA_TOWNS.length]})`,
      distanceKm: EXTRA_DISTANCE[(n + c) % EXTRA_DISTANCE.length],
      cuisine,
      signatureMenu: menu,
      partySizes: EXTRA_PARTY[(n + i) % EXTRA_PARTY.length],
      priceRange: EXTRA_PRICE[(n + 2 * c) % EXTRA_PRICE.length],
      daysOff: EXTRA_DAYS_OFF[n % EXTRA_DAYS_OFF.length],
    };
  }),
);

export const SEED_RESTAURANTS: Restaurant[] = [...BASE_SEED_RESTAURANTS, ...EXTRA_SEED_RESTAURANTS];