// 조건 버튼 묶음 (인원·음식 종류·가격대)
// PLAN 작업 8 (PRD 개발 단위 5) / 기준: DESIGN.md 3.1 목록 화면 "조건 버튼"
//
// 버튼은 인터넷 주소를 바꾸는 링크입니다. 누르면 그 조건을 더하거나 빼고,
// 주소에 남은 조건으로 목록을 다시 보여 줍니다. (종류마다 여러 개 선택 가능)

import Link from "next/link";
import {
  clearFiltersHref,
  hasAnyFilter,
  toggleFilterHref,
  type FilterKind,
  type ListState,
} from "@/lib/listQuery";
import { CUISINES, PARTY_SIZES, PRICE_RANGES } from "@/lib/types";

/** 화면에 보일 줄 이름과 선택지 (DESIGN 3 "선택지 이름") */
const ROWS: { kind: FilterKind; label: string; choices: readonly string[] }[] = [
  { kind: "partySizes", label: "인원", choices: PARTY_SIZES },
  { kind: "cuisines", label: "종류", choices: CUISINES },
  { kind: "priceRanges", label: "가격", choices: PRICE_RANGES },
];

/** 버튼에 보일 글자 ("단체"는 몇 명부터인지 함께 보여 줌) */
function buttonText(value: string): string {
  return value === "단체" ? "단체(5명 이상)" : value;
}

/** filters: 지금 목록 화면 상태 (조건 + 검색어). 버튼을 눌러도 검색어는 유지됩니다. */
export default function FilterBar({ filters }: { filters: ListState }) {
  return (
    <section aria-label="조건 선택" className="flex flex-col gap-2">
      {ROWS.map(({ kind, label, choices }) => (
        <div key={kind} className="flex items-start gap-2">
          <span className="w-8 shrink-0 pt-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {label}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {choices.map((value) => {
              const selected = (filters[kind] as readonly string[]).includes(value);
              return (
                <Link
                  key={value}
                  href={toggleFilterHref(filters, kind, value)}
                  scroll={false}
                  className={
                    "rounded-full border px-3 py-1.5 text-sm transition-colors " +
                    (selected
                      ? "border-orange-500 bg-orange-500 font-semibold text-white"
                      : "border-black/15 bg-white text-zinc-800 dark:border-white/20 dark:bg-white/5 dark:text-zinc-200")
                  }
                >
                  {buttonText(value)}
                  {selected && <span className="sr-only"> (선택됨)</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* 고른 조건이 있을 때만 "조건 모두 지우기" 링크를 보여 줌 */}
      {hasAnyFilter(filters) && (
        <Link
          href={clearFiltersHref(filters)}
          scroll={false}
          className="self-end text-sm text-zinc-500 underline dark:text-zinc-400"
        >
          조건 모두 지우기
        </Link>
      )}
    </section>
  );
}
