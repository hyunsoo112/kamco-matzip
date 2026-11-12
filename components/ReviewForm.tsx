"use client";

// 평가 쓰기 칸 (상세 화면)
// PLAN 작업 15 (PRD 개발 단위 12) / 기준: DESIGN.md 3.2 "평가 쓰기", 4.2 평가 남기기
//
// 화면 쪽 1차 검사: lib/rules.ts의 validateReview로 별명 2~10글자, 별점 1~5, 한 줄 평 5~100글자,
//                  개인정보·금지어를 검사합니다. 규칙에 맞지 않으면 등록 버튼이 눌리지 않고,
//                  손댄 칸 아래에 이유를 빨간 글씨로 보여 줍니다.
// 서버 쪽 2차 검사: /api/restaurants/[id]/reviews 에서 같은 규칙으로 다시 검사합니다.
// PLAN 작업 23 (PRD 개발 단위 20): 등록에 실패해도 입력한 내용은 지우지 않습니다.
//   - 인터넷 끊김·서버 오류처럼 "다시 보내면 될 수 있는" 실패에는 "다시 시도" 버튼을 보여 줍니다.
//   - 글자 수·개인정보·금지어처럼 "내용을 고쳐야 하는" 실패에는 보여 주지 않고, 칸을 고치면 안내가 사라집니다.
//
// PLAN 작업 18 (PRD 개발 단위 15): 같은 휴대폰에서는 한 식당에 하루 1번만 평가할 수 있습니다.
//   - 화면을 열 때 상세 API에 기기 표시값을 보내 "오늘 이미 평가했는지"를 물어보고,
//     이미 했으면 쓰기 칸 대신 "오늘은 이미 평가했어요. 내일 다시 남길 수 있어요"를 보여 줍니다.
//   - 평가를 남긴 직후, 또는 서버가 409(오늘 이미 평가함)로 막았을 때도 같은 안내로 바꿉니다.
//   - 실제로 막는 것은 서버와 저장 공간 규칙(같은 식당 + 같은 기기 + 같은 날은 한 번만)입니다.

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { getDeviceId } from "@/lib/deviceId";
import { countChars, LIMITS, validateReview } from "@/lib/rules";
import type { ApiErrorResponse, RestaurantDetailResponse } from "@/lib/types";

/** 하루 1번 규칙 안내 (DESIGN 3.2) */
const ALREADY_REVIEWED_MESSAGE = "오늘은 이미 평가했어요. 내일 다시 남길 수 있어요";

type Field = "nickname" | "rating" | "comment";

export default function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [rating, setRating] = useState(0); // 0 = 아직 고르지 않음
  const [comment, setComment] = useState("");
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    nickname: false,
    rating: false,
    comment: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  // 서버가 알려 준 실패가 "다시 보내면 될 수 있는" 종류인지 (true면 "다시 시도" 버튼을 보여 줌)
  const [canRetry, setCanRetry] = useState(false);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  // 오늘 이 휴대폰으로 이 식당에 평가했는지 (null = 아직 확인 중)
  const [reviewedToday, setReviewedToday] = useState<boolean | null>(null);

  // 화면을 열 때 한 번: 오늘 이미 평가했는지 서버에 물어봄
  useEffect(() => {
    let cancelled = false;
    const url = `/api/restaurants/${encodeURIComponent(restaurantId)}?deviceId=${encodeURIComponent(getDeviceId())}`;
    fetch(url, { cache: "no-store" })
      .then((res) => (res.ok ? (res.json() as Promise<RestaurantDetailResponse>) : null))
      .then((body) => {
        if (!cancelled) setReviewedToday(body?.data.reviewedToday ?? false);
      })
      .catch(() => {
        // 확인하지 못해도 쓰기 칸은 보여 줌 (서버가 등록할 때 다시 막음)
        if (!cancelled) setReviewedToday(false);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  // 지금 입력이 규칙에 맞는지 (맞으면 null)
  const problem = validateReview({ nickname, rating: rating || undefined, comment });

  /** 이 칸 아래에 빨간 안내를 보여 줄지: 문제가 이 칸이고, 사용자가 이 칸을 손댔을 때 */
  function messageFor(field: Field): string | null {
    if (!problem || problem.field !== field) return null;
    // 별점은 다른 칸을 다 쓰고도 안 골랐을 때 알려 줌
    const shown = field === "rating" ? touched.rating || touched.comment : touched[field];
    return shown ? problem.message : null;
  }

  function touch(field: Field) {
    setTouched((t) => ({ ...t, [field]: true }));
    setServerMessage(null);
    setCanRetry(false);
    setDoneMessage(null);
  }

  /** 입력한 내용을 서버로 보냄 (등록 버튼과 "다시 시도" 버튼이 같이 씀) */
  async function submit() {
    if (problem || submitting) return;

    setSubmitting(true);
    setServerMessage(null);
    setCanRetry(false);
    try {
      const response = await fetch(
        `/api/restaurants/${encodeURIComponent(restaurantId)}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname, rating, comment, deviceId: getDeviceId() }),
        },
      );

      if (response.ok) {
        // 성공: 칸을 비우고, 평가 목록·평균 별점을 새로 읽어 옴
        setNickname("");
        setRating(0);
        setComment("");
        setTouched({ nickname: false, rating: false, comment: false });
        setDoneMessage("평가를 남겼어요. 고마워요!");
        setReviewedToday(true); // 오늘은 더 남길 수 없으므로 안내로 바꿈
        router.refresh();
        return;
      }

      const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
      if (body?.error.code === "ALREADY_REVIEWED_TODAY") {
        // 다른 창에서 이미 남긴 경우 등: 쓰기 칸을 안내로 바꿈
        setReviewedToday(true);
        return;
      }
      // 서버가 막은 이유를 보여 주고, 입력한 내용은 그대로 둠
      setServerMessage(body?.error.message ?? "잠시 후 다시 시도해 주세요");
      // 서버 쪽 문제(5xx)는 잠시 뒤 다시 보내면 될 수 있음. 내용 문제(4xx)는 고쳐야 하므로 버튼 없음
      setCanRetry(response.status >= 500);
    } catch {
      // 인터넷 끊김 등으로 서버 응답이 없을 때 (DESIGN 6.2 "응답 없음")
      setServerMessage("인터넷 연결을 확인하고 다시 시도해 주세요");
      setCanRetry(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submit();
  }

  const commentLength = countChars(comment);

  // 오늘 이미 평가한 식당: 쓰기 칸 대신 안내 (DESIGN 3.2)
  if (reviewedToday === true) {
    return (
      <section
        className="mt-6 rounded-xl border border-black/10 p-4 dark:border-white/15"
        aria-labelledby="review-form-title"
      >
        <h2 id="review-form-title" className="text-lg font-semibold">
          평가 남기기
        </h2>
        {doneMessage && (
          <p role="status" className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
            {doneMessage}
          </p>
        )}
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{ALREADY_REVIEWED_MESSAGE}</p>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 rounded-xl border border-black/10 p-4 dark:border-white/15"
      aria-labelledby="review-form-title"
    >
      <h2 id="review-form-title" className="text-lg font-semibold">
        평가 남기기
      </h2>

      {/* 별명 */}
      <label className="mt-3 block text-sm font-medium" htmlFor="review-nickname">
        별명 <span className="font-normal text-zinc-500">(2~10글자)</span>
      </label>
      <input
        id="review-nickname"
        value={nickname}
        onChange={(e) => {
          setNickname(e.target.value);
          touch("nickname");
        }}
        maxLength={LIMITS.nickname.max}
        autoComplete="off"
        className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-base dark:border-white/20 dark:bg-white/5"
      />
      <FieldMessage text={messageFor("nickname")} />

      {/* 별점: 별 5개 중 하나를 누름 */}
      <fieldset className="mt-3">
        <legend className="text-sm font-medium">별점</legend>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer text-3xl leading-none">
              <input
                type="radio"
                name="rating"
                value={n}
                aria-label={`${n}점`}
                checked={rating === n}
                onChange={() => {
                  setRating(n);
                  touch("rating");
                }}
                className="sr-only"
              />
              <span aria-hidden className={n <= rating ? "text-orange-500" : "text-zinc-300 dark:text-zinc-600"}>
                ★
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <FieldMessage text={messageFor("rating")} />

      {/* 한 줄 평 */}
      <label className="mt-3 block text-sm font-medium" htmlFor="review-comment">
        한 줄 평 <span className="font-normal text-zinc-500">(5~100글자)</span>
      </label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
          touch("comment");
        }}
        maxLength={LIMITS.comment.max}
        rows={2}
        className="mt-1 w-full resize-none rounded-lg border border-black/15 bg-white px-3 py-2 text-base dark:border-white/20 dark:bg-white/5"
      />
      <div className="flex items-start justify-between gap-2">
        <FieldMessage text={messageFor("comment")} />
        <span className="mt-1 ml-auto shrink-0 text-xs text-zinc-500">
          {commentLength}/{LIMITS.comment.max}
        </span>
      </div>

      {/* 서버가 알려 준 문제 (입력 내용은 그대로 남아 있음) */}
      {serverMessage && (
        <div className="mt-3">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {serverMessage}
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
        disabled={problem !== null || submitting || reviewedToday === null}
        className="mt-4 w-full rounded-full bg-orange-500 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-700 dark:disabled:text-zinc-400"
      >
        {submitting ? "등록하는 중…" : "등록"}
      </button>
    </form>
  );
}

/** 칸 아래 빨간 안내 한 줄 */
function FieldMessage({ text }: { text: string | null }) {
  if (!text) return null;
  return <p className="mt-1 text-sm text-red-600 dark:text-red-400">{text}</p>;
}
