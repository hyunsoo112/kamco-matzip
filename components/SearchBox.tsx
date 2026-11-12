// 검색창 (식당 이름·대표 메뉴·동네)
// PLAN 작업 9 (PRD 개발 단위 6) / 기준: DESIGN.md 3.1 "검색창", 4.1 식당 찾기
//
// 화면 쪽 1차 검사:
//   - 20글자를 넘게 입력할 수 없게 막습니다. (maxLength)
//   - 띄어쓰기만 넣고 검색할 수 없게 막습니다. (띄어쓰기가 아닌 글자가 1개 이상 있어야 함)
// 서버 쪽 2차 검사는 app/page.tsx에서 lib/rules.ts의 validateSearchQuery로 다시 합니다.
//
// 검색하면 고른 조건(인원·음식 종류·가격대)은 그대로 두고 검색어만 주소(q=)에 더합니다.

import Form from "next/form";
import Link from "next/link";
import {
  clearSearchHref,
  filterParamEntries,
  SEARCH_PARAM,
  type ListState,
} from "@/lib/listQuery";
import { LIMITS } from "@/lib/rules";

export default function SearchBox({ state }: { state: ListState }) {
  return (
    <Form action="/" scroll={false} role="search" className="flex gap-2">
      {/* 지금 고른 조건을 함께 보내 검색해도 조건이 유지되게 합니다 */}
      {filterParamEntries(state).map(({ name, value }) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div className="relative flex-1">
        <input
          // 검색어가 바뀌면 칸 내용도 새로 채우기 위해 key를 검색어로 둡니다
          key={state.q}
          // type="search"는 브라우저가 자체 × 버튼을 하나 더 그려서, 글자 칸으로 두고
          // 휴대폰 키보드의 확인 버튼만 "검색"으로 바꿉니다.
          type="text"
          enterKeyHint="search"
          name={SEARCH_PARAM}
          defaultValue={state.q}
          placeholder="메뉴·식당·동네 검색"
          aria-label="검색어 (1~20글자)"
          required
          maxLength={LIMITS.searchQuery.max}
          pattern=".*\S.*"
          title={`검색어를 ${LIMITS.searchQuery.min}~${LIMITS.searchQuery.max}글자로 적어 주세요`}
          className="w-full rounded-full border border-black/15 bg-white py-2 pr-9 pl-4 text-base dark:border-white/20 dark:bg-white/5"
        />
        {state.q !== "" && (
          <Link
            href={clearSearchHref(state)}
            scroll={false}
            aria-label="검색어 지우기"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-lg leading-none text-zinc-400"
          >
            ×
          </Link>
        )}
      </div>

      <button
        type="submit"
        className="shrink-0 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
      >
        검색
      </button>
    </Form>
  );
}
