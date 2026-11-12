-- "걸어서 걸리는 시간(분)"을 "인재개발원에서 거리(km 이내)"로 바꾸기
-- 사용자 요청(2026-11-12): 인재개발원에서 걸어서 몇 분인지가 아니라 몇 km 거리에 있는지로 바꿔 달라는 요청
--
-- 새 항목 distance_km: 1 / 5 / 10 중 하나 ("1km 이내", "5km 이내", "10km 이내")
-- 이미 들어 있는 식당은 걸음 속도(시속 약 5km)로 거리를 계산해 옮깁니다.
--   5분(약 0.4km)  → 1km 이내
--   10분(약 0.8km) → 1km 이내
--   15분(약 1.2km) → 5km 이내

-- 1) 새 칸을 먼저 비어 있는 채로 만들고
alter table public.restaurants add column distance_km smallint;

-- 2) 기존 값을 옮긴 뒤
update public.restaurants
set distance_km = case walk_minutes
  when 5 then 1
  when 10 then 1
  when 15 then 5
end;

-- 3) 모든 줄이 채워졌으니 필수 칸으로 만들고, 허용하는 값(1·5·10)만 받게 막습니다
alter table public.restaurants alter column distance_km set not null;
alter table public.restaurants
  add constraint restaurants_distance_km_check check (distance_km in (1, 5, 10));

-- 4) 더 이상 쓰지 않는 옛 칸을 지웁니다 (옛 값 규칙도 함께 사라짐)
alter table public.restaurants drop column walk_minutes;
