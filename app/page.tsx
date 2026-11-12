// 첫 화면 (목록 화면 자리)
// PLAN 작업 2: 예시 화면을 비우고 제목만 둔 휴대폰용 빈 화면입니다.
// 식당 목록·조건·검색은 PLAN 작업 6~12에서 이 화면 안에 채워 넣습니다.

export default function Home() {
  return (
    // 휴대폰 화면 폭에 맞추고, 큰 화면에서는 가운데에 좁게 보이게 합니다.
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">캠코인재개발원 맛집 지도</h1>
      </header>

      {/* 식당 목록이 들어갈 자리 (PLAN 작업 6부터 채움) */}
      <main className="flex-1 px-4" />
    </div>
  );
}
