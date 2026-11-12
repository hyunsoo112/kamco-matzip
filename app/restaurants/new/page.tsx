// 새 식당 등록 화면 (/restaurants/new)
// PLAN 작업 20 (PRD 개발 단위 17) / 기준: DESIGN.md 3.3 새 식당 등록 화면
//
// 목록에 없는 식당을 다녀온 교육생이 직접 등록합니다. 입력 양식은 components/NewRestaurantForm.tsx 입니다.

import Link from "next/link";
import NewRestaurantForm from "@/components/NewRestaurantForm";

export default function NewRestaurantPage() {
  return (
    // 다른 화면과 같은 폭 (휴대폰 화면 폭, 큰 화면에서는 가운데)
    <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-10">
      <Link href="/" className="inline-block py-2 text-sm text-zinc-600 dark:text-zinc-300">
        ← 목록으로
      </Link>
      <h1 className="mt-2 text-2xl font-bold">새 식당 등록</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        다녀온 식당이 목록에 없다면 직접 등록해 주세요. <span className="text-red-600">*</span>는 꼭
        적어야 해요.
      </p>

      <NewRestaurantForm />
    </main>
  );
}
