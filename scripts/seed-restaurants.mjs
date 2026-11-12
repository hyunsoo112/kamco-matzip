// 미리 넣을 식당 50곳(data/seed-restaurants.ts)을 저장 공간(Supabase)에 옮겨 넣는 명령
// PLAN 작업 14 (PRD 개발 단위 11) / 기준: DESIGN.md 5.3 미리 넣을 데이터와 시험용 데이터
//
// 쓰는 법 (my-app 폴더에서):
//   npm run db:seed              미리 넣을 50곳을 넣거나, 이미 있으면 내용을 최신으로 고칩니다.
//   npm run db:seed -- --with-test     시험용 25곳("[시험]")도 함께 넣습니다. ("더 보기" 시험용)
//   npm run db:seed -- --remove-test   시험용 25곳("[시험]"으로 시작하는 식당)을 지웁니다.
//
// 접속 값은 .env에서 읽으며(npm 명령이 --env-file=.env로 불러옴), 화면에 출력하지 않습니다.
// 실제 식당 정보로 바꾼 뒤에도 같은 명령을 다시 실행하면 됩니다.

import { createClient } from "@supabase/supabase-js";
import { SEED_RESTAURANTS } from "../data/seed-restaurants.ts";
import { TEST_RESTAURANTS } from "../data/test-restaurants.ts";

const args = new Set(process.argv.slice(2));

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error(".env에 SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

/** 비교용 이름: 띄어쓰기를 빼고 소문자로 (lib/rules.ts의 makeNameKey와 같은 규칙) */
const makeNameKey = (name) => name.replace(/\s+/g, "").toLowerCase();

/** 화면용 모양 → 저장 공간 줄 모양 */
const toRow = (r) => ({
  id: r.id,
  name: r.name,
  name_key: makeNameKey(r.name),
  address: r.address,
  distance_km: r.distanceKm,
  cuisine: r.cuisine,
  signature_menu: r.signatureMenu,
  party_sizes: r.partySizes,
  price_range: r.priceRange,
  days_off: r.daysOff,
  device_id: "seed",
});

async function upsert(list, label) {
  const { error } = await db.from("restaurants").upsert(list.map(toRow), { onConflict: "id" });
  if (error) throw new Error(`${label} 넣기 실패: ${error.message}`);
  console.log(`${label} ${list.length}곳을 넣었습니다.`);
}

async function main() {
  if (args.has("--remove-test")) {
    const { error, count } = await db
      .from("restaurants")
      .delete({ count: "exact" })
      .like("name", "[시험]%");
    if (error) throw new Error(`시험용 식당 지우기 실패: ${error.message}`);
    console.log(`시험용 식당 ${count ?? 0}곳을 지웠습니다.`);
    return;
  }

  await upsert(SEED_RESTAURANTS, "미리 넣을 식당");
  if (args.has("--with-test")) await upsert(TEST_RESTAURANTS, "시험용 식당");

  const { count } = await db.from("restaurants").select("id", { count: "exact", head: true });
  console.log(`지금 저장 공간의 식당 수: ${count}곳`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
