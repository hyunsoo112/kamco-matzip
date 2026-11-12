-- 식당 표와 평가 표 만들기
-- PLAN 작업 13 (PRD 개발 단위 10) / 기준: DESIGN.md 5.1 식당 표, 5.2 평가 표, 7번 보안
--
-- 규칙(글자 수, 선택지, 하루 1번 평가)을 저장 공간에서도 한 번 더 지켜,
-- 서버 코드에 실수가 있어도 잘못된 값이 저장되지 않게 합니다.
-- 외부 직접 접근 차단(RLS)을 켜고 허용 규칙은 만들지 않습니다 → 서버 API(비밀 열쇠)만 읽고 쓸 수 있습니다.

-- ─────────────────────────────────────────────
-- 1. 식당 표 (restaurants)
-- ─────────────────────────────────────────────
create table public.restaurants (
  -- 식당 번호 (미리 넣는 식당은 "seed-01"처럼 직접 정하고, 새 식당은 자동으로 만들어짐)
  id text primary key default gen_random_uuid()::text,
  -- 식당 이름 1~30글자
  name text not null check (char_length(name) between 1 and 30),
  -- 비교용 이름: 띄어쓰기를 빼고 소문자로 바꾼 이름. 같은 값 금지(같으면 등록을 막음)
  name_key text not null unique,
  -- 위치 1~50글자, 형식 "도로명 주소 (동 이름)"
  address text not null check (char_length(address) between 1 and 50),
  -- 걸어서 걸리는 시간: 5 / 10 / 15분
  walk_minutes smallint not null check (walk_minutes in (5, 10, 15)),
  -- 음식 종류: 하나만
  cuisine text not null check (cuisine in ('한식', '중식', '일식', '양식', '분식', '기타')),
  -- 대표 메뉴 1~30글자
  signature_menu text not null check (char_length(signature_menu) between 1 and 30),
  -- 인원: 1개 이상, 선택지 안에서만
  party_sizes text[] not null
    check (cardinality(party_sizes) >= 1 and party_sizes <@ array['혼밥', '2~4명', '단체']),
  -- 1인 가격대: 하나만
  price_range text not null
    check (price_range in ('1만 원 미만', '1만~2만 원 미만', '2만 원 이상')),
  -- 쉬는 날: 0개 이상, 요일만
  days_off text[] not null default '{}'
    check (days_off <@ array['월', '화', '수', '목', '금', '토', '일']),
  -- 등록한 기기 (화면에 보내지 않음, 하루 3곳 제한용). 미리 넣는 식당은 'seed'
  device_id text not null,
  -- 등록한 날 (한국 시간 기준)
  created_date date not null default (now() at time zone 'Asia/Seoul')::date,
  created_at timestamptz not null default now()
);

-- 하루 3곳 제한을 빨리 세기 위한 색인
create index restaurants_device_day_idx on public.restaurants (device_id, created_date);

-- ─────────────────────────────────────────────
-- 2. 평가 표 (reviews)
-- ─────────────────────────────────────────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  -- 어느 식당의 평가인지 (식당이 지워지면 평가도 함께 지움)
  restaurant_id text not null references public.restaurants (id) on delete cascade,
  -- 별명 2~10글자
  nickname text not null check (char_length(nickname) between 2 and 10),
  -- 별점 1~5 정수
  rating smallint not null check (rating between 1 and 5),
  -- 한 줄 평 5~100글자
  comment text not null check (char_length(comment) between 5 and 100),
  -- 기기 표시값 (화면에 보내지 않음)
  device_id text not null,
  -- 평가한 날 (한국 시간 기준)
  review_date date not null default (now() at time zone 'Asia/Seoul')::date,
  created_at timestamptz not null default now(),
  -- 하루 1번 규칙: 같은 식당 + 같은 기기 + 같은 날은 한 번만
  constraint reviews_one_per_day unique (restaurant_id, device_id, review_date)
);

-- 식당별 평가를 최신순으로 빨리 읽기 위한 색인
create index reviews_restaurant_created_idx on public.reviews (restaurant_id, created_at desc);

-- ─────────────────────────────────────────────
-- 3. 외부 직접 접근 차단 (RLS) — 허용 규칙을 만들지 않으므로 공개 열쇠로는 읽기·쓰기 모두 불가
-- ─────────────────────────────────────────────
alter table public.restaurants enable row level security;
alter table public.reviews enable row level security;
