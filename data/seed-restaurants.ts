// 처음 화면에 미리 넣어 둘 식당 100곳 (손으로 쓴 10곳 + 규칙대로 만든 90곳)
// PLAN 작업 5 (PRD 개발 단위 2) / 기준: DESIGN.md 5.3 "미리 넣을 데이터"
//
// 상태: 임시 데이터 — 작성자가 실제로 다녀온 식당 정보를 주면 이 파일만 바꿉니다.
//   - 모든 이름 앞에 "[임시]"를 붙여 실제 식당과 헷갈리지 않게 했습니다.
//   - 주소도 실제로 없는 가짜 주소입니다.
//
// 지켜야 할 조건 (실제 데이터로 바꿀 때도 동일):
//   - 100곳, "기타"를 뺀 음식 종류가 5가지 이상
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

// ─────────────────────────────────────────────
// seed-51 ~ seed-100: 임시 식당 50곳 추가 (음식 종류별 10곳)
// 이름·주소·메뉴는 모두 가짜입니다. 값은 위와 같은 방식으로 돌려가며 정했습니다.
// ─────────────────────────────────────────────

const MORE_BY_CUISINE: { cuisine: Restaurant["cuisine"]; items: [string, string][] }[] = [
  { cuisine: "한식", items: [["감자탕 본점", "뼈해장국"], ["보쌈 정식집", "보쌈 정식"], ["닭갈비 철판", "닭갈비"], ["냉면 한그릇", "물냉면"], ["곰탕 하루", "한우곰탕"], ["갈비탕 마을", "갈비탕"], ["쌈밥 정원", "쌈밥 정식"], ["제주 고기국수", "고기국수"], ["부대찌개 광장", "부대찌개"], ["콩나물 국밥집", "콩나물국밥"]] },
  { cuisine: "중식", items: [["홍콩 반점", "볶음짬뽕"], ["양꼬치 거리", "양꼬치"], ["딤섬 하우스", "새우 딤섬"], ["유산슬 주방", "유산슬덮밥"], ["만리장성 식당", "고추잡채"], ["쿵푸 마라샹궈", "마라샹궈"], ["짜장 공방", "쟁반짜장"], ["동북 훠궈", "훠궈 세트"], ["베이징 덕집", "북경오리"], ["차돌 짬뽕", "차돌짬뽕"]] },
  { cuisine: "일식", items: [["돈부리 상점", "연어덮밥"], ["이치방 카레", "돈가스 카레"], ["텐동 공방", "새우 텐동"], ["야키토리 골목", "닭꼬치 모둠"], ["사누키 우동", "가마아게 우동"], ["회전 초밥", "광어초밥"], ["타코야키 포차", "타코야키"], ["오코노미 식당", "오코노미야키"], ["장어 덮밥집", "장어덮밥"], ["일본 가정식", "함박 정식"]] },
  { cuisine: "양식", items: [["타코 키친", "소고기 타코"], ["리코타 샐러드", "리코타 샐러드"], ["립 바비큐", "바비큐 립"], ["라자냐 하우스", "미트 라자냐"], ["수프 앤 브레드", "크림수프 세트"], ["핫플레이트 그릴", "함박스테이크"], ["파니니 카페", "햄치즈 파니니"], ["화덕 피자집", "마르게리타"], ["씨푸드 파스타", "봉골레"], ["토스카나 식당", "닭다리 구이"]] },
  { cuisine: "분식", items: [["치즈 김밥집", "치즈김밥"], ["즉석 떡볶이", "즉석 떡볶이"], ["돈가스 분식", "미니 돈가스"], ["김말이 가게", "김말이 튀김"], ["오뎅 정류장", "꼬치 어묵"], ["참치 주먹밥", "참치 주먹밥"], ["라면 맛집", "치즈라면"], ["비빔국수 가게", "비빔국수"], ["만두 분식", "손만두"], ["계란빵 아침", "계란빵"]] },
];

const MORE_DISTANCE: Restaurant["distanceKm"][] = [5, 1, 10, 1, 5, 10, 1, 5, 1, 10];
const MORE_PRICE: Restaurant["priceRange"][] = ["1만~2만 원 미만", "1만 원 미만", "2만 원 이상", "1만 원 미만", "1만~2만 원 미만"];
const MORE_PARTY: Restaurant["partySizes"][] = [["2~4명"], ["혼밥"], ["혼밥", "2~4명", "단체"], ["2~4명", "단체"], ["혼밥", "2~4명"]];
const MORE_DAYS_OFF: Restaurant["daysOff"][] = [[], ["화"], [], ["일"], ["금"], [], ["월", "화"], [], ["토"], []];
const MORE_TOWNS = ["나다동", "라마동", "바사동", "아자동", "가나동"];

const MORE_SEED_RESTAURANTS: Restaurant[] = MORE_BY_CUISINE.flatMap(({ cuisine, items }, c) =>
  items.map(([name, menu], i) => {
    const n = c * 10 + i; // 0 ~ 49
    return {
      id: `seed-${String(n + 51).padStart(2, "0")}`,
      name: `[임시] ${name}`,
      address: `임시로 ${n + 52} (${MORE_TOWNS[(n + c) % MORE_TOWNS.length]})`,
      distanceKm: MORE_DISTANCE[(n + 2 * c) % MORE_DISTANCE.length],
      cuisine,
      signatureMenu: menu,
      partySizes: MORE_PARTY[(n + c) % MORE_PARTY.length],
      priceRange: MORE_PRICE[(n + i) % MORE_PRICE.length],
      daysOff: MORE_DAYS_OFF[(n + 3) % MORE_DAYS_OFF.length],
    };
  }),
);

// 화면과 저장 공간 옮기기가 읽는 전체 목록 (손으로 쓴 10곳 + 40곳 + 50곳)
export const SEED_RESTAURANTS: Restaurant[] = [
  ...BASE_SEED_RESTAURANTS,
  ...EXTRA_SEED_RESTAURANTS,
  ...MORE_SEED_RESTAURANTS,
];
