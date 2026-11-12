"use client";

// 저장 공간을 읽다가 문제가 생겼을 때 보여 줄 화면 (모든 화면 공통)
// PLAN 작업 14 / 기준: DESIGN.md 6.2 결과 코드 500 "잠시 후 다시 시도해 주세요" + 다시 시도
// 자세한 오류 내용(비밀 값이 섞일 수 있는 서버 메시지)은 화면에 보여 주지 않습니다.

export default function ErrorScreen({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 pt-20 text-center">
      <p className="text-4xl" aria-hidden>
        😥
      </p>
      <h1 className="mt-4 text-xl font-bold">잠시 후 다시 시도해 주세요</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        식당 정보를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white"
      >
        다시 시도
      </button>
    </main>
  );
}
