"use client";

// 새 식당 등록 양식
// PLAN 작업 20 (PRD 개발 단위 17) / 기준: DESIGN.md 3.3 새 식당 등록 화면, 4.3 새 식당 등록
//
// 필수 7가지(이름, 위치, 인재개발원에서 거리,음식 종류, 대표 메뉴, 인원, 가격대)와 쉬는 날(선택)을 받습니다.
// 화면 쪽 1차 검사: lib/rules.ts의 validateNewRestaurant로 글자 수·선택지·개인정보·금지어를 검사합니다.
//   - 필수 항목이 하나라도 비어 있으면 등록 버튼이 눌리지 않습니다.
//   - 글자 칸은 최대 길이(이름 30·위치 50·대표 메뉴 30)를 넘게 입력할 수 없습니다.
// 서버 쪽 2차 검사: POST /api/restaurants 에서 같은 규칙으로 다시 검사합니다.
// PLAN 작업 23 (PRD 개발 단위 20): 등록에 실패해도 입력한 내용은 지우지 않습니다.
//   - 인터넷 끊김·서버 오류처럼 "다시 보내면 될 수 있는" 실패에는 "다시 시도" 버튼을 보여 줍니다.
//   - 같은 이름·하루 3곳 초과·글자 수처럼 "내용을 고치거나 내일 해야 하는" 실패에는 보여 주지 않습니다.
// 같은 이름 안내·하루 3곳 제한은 PLAN 작업 21에서 확인했습니다.

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getDeviceId } from "@/lib/deviceId";
import { ADDRESS_HINT, LIMITS, validateNewRestaurant } from "@/lib/rules";
import {
  CUISINES,
  DAYS_OF_WEEK,
  PARTY_SIZES,
  PRICE_RANGES,
  DISTANCE_KM,
  type ApiErrorResponse,
  type CreateRestaurantResponse,
  type Cuisine,
  type DayOfWeek,
  type PartySize,
  type PriceRange,
  type DistanceKm,
} from "@/lib/types";

type Field =
  | "name"
  | "address"
  | "distanceKm"
  | "cuisine"
  | "signatureMenu"
  | "partySizes"
  | "priceRange"
  | "daysOff";

/** 칸 아래 빨간 안내 한 줄 */
function FieldMessage({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="mt-1 text-sm text-red-600 dark:text-red-400">{text}</p>;
}

/** 선택 버튼 한 개 (둥근 알약 모양, 고르면 주황색) */
function Pill({
  type,
  name,
  label,
  checked,
  onChange,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  /** 화면 읽기 프로그램이 읽어 줄 이름 (예: "10분", "한식") */
  label: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={
        "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors " +
        (checked
          ? "border-orange-500 bg-orange-500 font-semibold text-white"
          : "border-black/15 bg-white text-zinc-800 dark:border-white/20 dark:bg-white/5 dark:text-zinc-200")
      }
    >
      <input
        type={type}
        name={name}
        aria-label={label}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {children}
    </label>
  );
}

export default function NewRestaurantForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [distanceKm, setDistanceKm] = useState<DistanceKm | null>(null);
  const [cuisine, setCuisine] = useState<Cuisine | null>(null);
  const [signatureMenu, setSignatureMenu] = useState("");
  const [partySizes, setPartySizes] = useState<PartySize[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [daysOff, setDaysOff] = useState<DayOfWeek[]>([]);

  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverProblem, setServerProblem] = useState<{ message: string; field?: string } | null>(
    null,
  );
  // 서버가 알려 준 실패가 "다시 보내면 될 수 있는" 종류인지 (true면 "다시 시도" 버튼을 보여 줌)
  const [canRetry, setCanRetry] = useState(false);

  // 지금 입력이 규칙에 맞는지 (맞으면 null). 비어 있는 선택 칸은 값 없음(undefined)으로 넘김
  const problem = validateNewRestaurant({
    name,
    address,
    distanceKm: distanceKm ?? undefined,
    cuisine: cuisine ?? undefined,
    signatureMenu,
    partySizes,
    priceRange: priceRange ?? undefined,
    daysOff,
  });

  function touch(field: Field) {
    setTouched((t) => ({ ...t, [field]: true }));
    setServerProblem(null);
    setCanRetry(false);
  }

  /** 이 칸 아래에 빨간 안내를 보여 줄지: 문제가 이 칸이고, 사용자가 이 칸을 손댔을 때 */
  function messageFor(field: Field): string | null {
    if (serverProblem?.field === field) return serverProblem.message;
    if (!problem || problem.field !== field) return null;
    return touched[field] ? problem.message : null;
  }

  /** 여러 개 고르는 칸에서 하나를 넣거나 뺌 (선택지 순서대로 정리) */
  function toggle<T extends string>(list: T[], value: T, choices: readonly T[]): T[] {
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    return choices.filter((c) => next.includes(c));
  }

  /** 입력한 내용을 서버로 보냄 (등록 버튼과 "다시 시도" 버튼이 같이 씀) */
  async function submit() {
    if (problem || submitting) return;

    setSubmitting(true);
    setServerProblem(null);
    setCanRetry(false);
    try {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          distanceKm,
          cuisine,
          signatureMenu,
          partySizes,
          priceRange,
          daysOff,
          deviceId: getDeviceId(),
        }),
      });

      if (response.ok) {
        // 성공: 새 식당의 상세 화면으로 이동 (목록·조건·검색에도 바로 나타남)
        const body = (await response.json()) as CreateRestaurantResponse;
        router.push(`/restaurants/${encodeURIComponent(body.data.id)}`);
        return;
      }

      // 서버가 막은 이유를 보여 주고, 입력한 내용은 그대로 둠
      const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
      setServerProblem({
        message: body?.error.message ?? "잠시 후 다시 시도해 주세요",
        field: body?.error.field,
      });
      // 서버 쪽 문제(5xx)는 잠시 뒤 다시 보내면 될 수 있음. 내용·한도 문제(4xx)는 버튼 없음
      setCanRetry(response.status >= 500);
    } catch {
      // 인터넷 끊김 등으로 서버 응답이 없을 때 (DESIGN 6.2 "응답 없음")
      setServerProblem({ message: "인터넷 연결을 확인하고 다시 시도해 주세요" });
      setCanRetry(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submit();
  }

  const textInputClass =
    "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-base dark:border-white/20 dark:bg-white/5";
  const labelClass = "mt-4 block text-sm font-medium";

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* 식당 이름 */}
      <label className={labelClass} htmlFor="new-name">
        식당 이름 <span className="text-red-600">*</span>{" "}
        <span className="font-normal text-zinc-500">(최대 {LIMITS.restaurantName.max}글자)</span>
      </label>
      <input
        id="new-name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          touch("name");
        }}
        maxLength={LIMITS.restaurantName.max}
        autoComplete="off"
        className={textInputClass}
      />
      <FieldMessage text={messageFor("name")} />

      {/* 위치 */}
      <label className={labelClass} htmlFor="new-address">
        위치 <span className="text-red-600">*</span>{" "}
        <span className="font-normal text-zinc-500">(최대 {LIMITS.address.max}글자)</span>
      </label>
      <input
        id="new-address"
        value={address}
        onChange={(e) => {
          setAddress(e.target.value);
          touch("address");
        }}
        maxLength={LIMITS.address.max}
        autoComplete="off"
        aria-describedby="new-address-hint"
        className={textInputClass}
      />
      <p id="new-address-hint" className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {ADDRESS_HINT}
      </p>
      <FieldMessage text={messageFor("address")} />

      {/* 인재개발원에서 떨어진 거리: 하나만 */}
      <fieldset className="mt-4">
        <legend className="text-sm font-medium">
          인재개발원에서 거리 <span className="text-red-600">*</span>
        </legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {DISTANCE_KM.map((m) => (
            <Pill
              key={m}
              type="radio"
              name="distanceKm"
              label={`${m}km 이내`}
              checked={distanceKm === m}
              onChange={() => {
                setDistanceKm(m);
                touch("distanceKm");
              }}
            >
              {m}km 이내
            </Pill>
          ))}
        </div>
      </fieldset>
      <FieldMessage text={messageFor("distanceKm")} />

      {/* 음식 종류: 하나만 */}
      <fieldset className="mt-4">
        <legend className="text-sm font-medium">
          음식 종류 <span className="text-red-600">*</span>
        </legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {CUISINES.map((c) => (
            <Pill
              key={c}
              type="radio"
              name="cuisine"
              label={c}
              checked={cuisine === c}
              onChange={() => {
                setCuisine(c);
                touch("cuisine");
              }}
            >
              {c}
            </Pill>
          ))}
        </div>
      </fieldset>
      <FieldMessage text={messageFor("cuisine")} />

      {/* 대표 메뉴 */}
      <label className={labelClass} htmlFor="new-menu">
        대표 메뉴 <span className="text-red-600">*</span>{" "}
        <span className="font-normal text-zinc-500">(최대 {LIMITS.signatureMenu.max}글자)</span>
      </label>
      <input
        id="new-menu"
        value={signatureMenu}
        onChange={(e) => {
          setSignatureMenu(e.target.value);
          touch("signatureMenu");
        }}
        maxLength={LIMITS.signatureMenu.max}
        autoComplete="off"
        className={textInputClass}
      />
      <FieldMessage text={messageFor("signatureMenu")} />

      {/* 인원: 여러 개 */}
      <fieldset className="mt-4">
        <legend className="text-sm font-medium">
          인원 <span className="text-red-600">*</span>{" "}
          <span className="font-normal text-zinc-500">(여러 개 선택 가능)</span>
        </legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {PARTY_SIZES.map((p) => (
            <Pill
              key={p}
              type="checkbox"
              name="partySizes"
              label={p === "단체" ? "단체(5명 이상)" : p}
              checked={partySizes.includes(p)}
              onChange={() => {
                setPartySizes((list) => toggle(list, p, PARTY_SIZES));
                touch("partySizes");
              }}
            >
              {p === "단체" ? "단체(5명 이상)" : p}
            </Pill>
          ))}
        </div>
      </fieldset>
      <FieldMessage text={messageFor("partySizes")} />

      {/* 가격대: 하나만 */}
      <fieldset className="mt-4">
        <legend className="text-sm font-medium">
          1인 가격대 <span className="text-red-600">*</span>
        </legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {PRICE_RANGES.map((p) => (
            <Pill
              key={p}
              type="radio"
              name="priceRange"
              label={p}
              checked={priceRange === p}
              onChange={() => {
                setPriceRange(p);
                touch("priceRange");
              }}
            >
              {p}
            </Pill>
          ))}
        </div>
      </fieldset>
      <FieldMessage text={messageFor("priceRange")} />

      {/* 쉬는 날: 선택 입력 */}
      <fieldset className="mt-4">
        <legend className="text-sm font-medium">
          쉬는 날 <span className="font-normal text-zinc-500">(선택)</span>
        </legend>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {DAYS_OF_WEEK.map((d) => (
            <Pill
              key={d}
              type="checkbox"
              name="daysOff"
              label={`${d}요일`}
              checked={daysOff.includes(d)}
              onChange={() => {
                setDaysOff((list) => toggle(list, d, DAYS_OF_WEEK));
                touch("daysOff");
              }}
            >
              {d}
            </Pill>
          ))}
        </div>
      </fieldset>
      <FieldMessage text={messageFor("daysOff")} />

      {/* 서버가 알려 준 문제 중 특정 칸이 아닌 것 (입력 내용은 그대로 남아 있음) */}
      {serverProblem && !serverProblem.field && (
        <div className="mt-4">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {serverProblem.message}
          </p>
          {/* 인터넷 끊김·서버 오류일 때만: 입력한 내용 그대로 다시 보냄 (PLAN 작업 23) */}
          {canRetry && (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="mt-2 rounded-full border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 disabled:opacity-50 dark:text-orange-400"
            >
              다시 시도
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={problem !== null || submitting}
        className="mt-6 w-full rounded-full bg-orange-500 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
      >
        {submitting ? "등록하는 중…" : "등록"}
      </button>
    </form>
  );
}
