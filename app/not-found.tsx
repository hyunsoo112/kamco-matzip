// 없는 주소로 들어왔을 때 보여 줄 화면 (사이트 전체 공통)
// PLAN 작업 24 (처음부터 끝까지 점검에서 영어 기본 화면이 남아 있는 것을 발견해 추가)
// 식당 번호가 잘못된 경우는 app/restaurants/[id]/not-found.tsx 가 따로 안내합니다.

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 pt-20 text-center">
      <p className="text-4xl" aria-hidden>
        🍽️
      </p>
      <h1 className="mt-4 text-xl font-bold">페이지를 찾을 수 없어요</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        주소가 잘못되었거나 없어진 페이지예요.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white"
      >
        맛집 목록으로
      </Link>
    </main>
  );
}
