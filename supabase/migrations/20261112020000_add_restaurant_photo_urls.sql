-- 식당 사진 주소 칸 추가 (사용자 요청 2026-11-12: "사진을 넣을 수 있는 공간")
-- 교육생이 올리는 기능은 없고, 운영자가 사진 주소(https://…)를 넣으면 상세 화면에 보입니다.
-- 한 식당에 최대 3장, 비어 있으면 화면에 "사진 준비 중" 칸만 보입니다.
alter table public.restaurants
  add column photo_urls text[] not null default '{}';

alter table public.restaurants
  add constraint restaurants_photo_urls_check
  check (coalesce(array_length(photo_urls, 1), 0) <= 3);