// 기기 표시값 만들기·읽기 (휴대폰 화면 쪽에서만 사용)
// PLAN 작업 15 / 기준: DESIGN.md 4.2 "기기 표시값이란?"
//
// 로그인이 없으므로, 처음 쓸 때 이 휴대폰 브라우저 저장소(localStorage)에 무작위 번호를 하나 만들어 둡니다.
// 이름·전화번호 같은 개인정보가 아니라 "같은 휴대폰인지"만 구분하는 값입니다.
// 하루 1번 평가(PLAN 작업 18), 하루 3곳 등록(PLAN 작업 21) 규칙에 씁니다.
// 브라우저 기록을 지우면 새 번호가 생기므로 완벽한 차단은 아닙니다. (PRD 6번에서 감수하기로 함)

const STORAGE_KEY = "kamco-matzip-device-id";

/** 이 휴대폰의 기기 표시값 (없으면 새로 만들어 저장) */
export function getDeviceId(): string {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    const created = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    // 브라우저 저장소를 쓸 수 없는 경우(사생활 보호 모드 등): 이번 화면에서만 쓰는 번호
    return crypto.randomUUID();
  }
}
