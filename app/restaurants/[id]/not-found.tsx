// 없는 식당 번호로 들어왔을 때 보여 줄 화면
// PLAN 작업 12 / 기준: DESIGN.md 6.2 결과 코드 404 "식당을 찾을 수 없어요" + 목록으로

import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 pt-20 text-center">
      <p className="text-4xl" aria-hidden>
        🍽️
      </p>
      <h1 className="mt-4 text-xl font-bold">식당을 찾을 수 없어요</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        주소가 잘못되었거나 목록에서 빠진 식당이에요.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white"
      >
        목록으로
      </Link>
    </main>
  );
}
