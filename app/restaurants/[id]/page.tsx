// 식당 상세 화면 (/restaurants/식당번호)
// PLAN 작업 12 (PRD 개발 단위 9) / 기준: DESIGN.md 3.2 상세 화면
//
// 보여 주는 것: 이름, 음식 종류, 인재개발원에서 거리,대표 메뉴, 가격대, 인원, 위치,
//              쉬는 날(있을 때만), 평균 별점 또는 "평가 모으는 중", 교육생 평가 목록(최신순)
// "목록으로": 주소에 붙어 온 조건·검색어 그대로 목록 화면으로 돌아갑니다.
//
// PLAN 작업 14: 식당 정보와 평가 목록을 저장 공간(Supabase)에서 읽어 옵니다.
// PLAN 작업 15: 평가 쓰기 칸(components/ReviewForm.tsx)을 붙였습니다.

import Link from "next/link";
import PhotoGallery from "@/components/PhotoGallery";
import ReviewForm from "@/components/ReviewForm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { listStateToHref, parseListState, type RawSearchParams } from "@/lib/listQuery";
import { getRestaurantDetail } from "@/lib/restaurantSource";
import type { PartySize } from "@/lib/types";

/** 인원 글자 ("단체"는 몇 명부터인지 함께 보여 줌) */
function partySizeText(partySizes: readonly PartySize[]): string {
  return partySizes.map((p) => (p === "단체" ? "단체(5명 이상)" : p)).join(", ");
}

/** 날짜 글자, 한국 시간 기준 (예: "11/10") */
function writtenDate(iso: string): string {
  // "sv-SE" 형식은 "2026-11-10"처럼 나옵니다. 한국 시간 기준으로 "2026.11.10"으로 보여 줍니다.
  return new Date(iso)
    .toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })
    .replaceAll("-", ".");
}

/** 식당 정보 한 줄 (이름표 + 내용) */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2">
      <dt className="w-20 shrink-0 text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

/** 주소의 식당 번호·조건을 읽어 상세 내용을 그립니다. (주소를 읽는 부분만 요청 때 그림) */
async function RestaurantDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { id } = await params;
  const backHref = listStateToHref(parseListState(await searchParams));

  const restaurant = await getRestaurantDetail(decodeURIComponent(id));
  if (!restaurant) notFound();

  const { reviews, avgRating } = restaurant;

  return (
    <>
      <Link
        href={backHref}
        className="inline-block py-2 text-sm text-zinc-600 dark:text-zinc-300"
      >
        ← 목록으로
      </Link>

      <header className="mt-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {restaurant.cuisine} · {restaurant.distanceKm}km 이내
          </p>
        </div>
        {/* 평가 3건 이상이면 평균 별점, 아니면 "평가 모으는 중" (DESIGN 3.2) */}
        {avgRating === null ? (
          <span className="shrink-0 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
            평가 모으는 중
          </span>
        ) : (
          <span className="shrink-0 pt-1 text-lg font-semibold">
            <span aria-hidden>⭐ </span>
            <span className="sr-only">평균 별점 </span>
            {avgRating.toFixed(1)}
          </span>
        )}
      </header>

      <PhotoGallery name={restaurant.name} photoUrls={restaurant.photoUrls ?? []} />

      <dl className="mt-4 divide-y divide-black/10 rounded-xl border border-black/10 px-4 dark:divide-white/10 dark:border-white/15">
        <InfoRow label="대표 메뉴" value={restaurant.signatureMenu} />
        <InfoRow label="가격대" value={restaurant.priceRange} />
        <InfoRow label="인원" value={partySizeText(restaurant.partySizes)} />
        <InfoRow label="위치" value={restaurant.address} />
        {/* 쉬는 날은 입력된 경우만 보여 줌 */}
        {restaurant.daysOff.length > 0 && (
          <InfoRow label="쉬는 날" value={restaurant.daysOff.join(", ")} />
        )}
      </dl>

      {/* PLAN 작업 15: 평가 쓰기 칸 (DESIGN 3.2 순서대로 식당 정보 아래, 평가 목록 위) */}
      <ReviewForm restaurantId={restaurant.id} />

      <section className="mt-6" aria-labelledby="reviews-title">
        <h2 id="reviews-title" className="text-lg font-semibold">
          교육생 평가 ({reviews.length}건)
        </h2>

        {reviews.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-black/20 px-4 py-6 text-center text-sm text-zinc-600 dark:border-white/20 dark:text-zinc-300">
            아직 평가가 없어요. 다녀오셨다면 첫 평가를 남겨 주세요.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {reviews.map((review) => (
              <li
                key={`${review.nickname}-${review.createdAt}`}
                className="rounded-xl border border-black/10 p-3 dark:border-white/15"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{review.nickname}</span>
                  <span
                    className="text-zinc-500 dark:text-zinc-400"
                    aria-label={`별점 ${review.rating}점`}
                  >
                    {"⭐".repeat(review.rating)}
                  </span>
                </div>
                <p className="mt-1 text-sm">{review.comment}</p>
                {/* 한줄평을 쓴 날짜 (한국 시간 기준) */}
                <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  작성일{" "}
                  <time dateTime={review.createdAt}>{writtenDate(review.createdAt)}</time>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default function RestaurantPage({
  params,
  searchParams,
}: PageProps<"/restaurants/[id]">) {
  return (
    // 목록 화면과 같은 폭 (휴대폰 화면 폭, 큰 화면에서는 가운데)
    <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-8">
      <Suspense fallback={<p className="text-sm text-zinc-500">식당 정보를 불러오는 중…</p>}>
        <RestaurantDetail params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
