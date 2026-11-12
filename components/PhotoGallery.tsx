// 식당 상세 화면의 사진 칸 3개
// 사용자 요청(2026-11-12): 실제 사진은 아직 없고, 사진을 넣을 수 있는 공간만 만듭니다.
//   - 사진 주소(photoUrls)가 있으면 그 사진을, 없으면 "사진 준비 중" 빈 칸을 보여 줍니다.
//   - 교육생이 사진을 올리는 기능은 없습니다. (주소는 운영자가 저장 공간에 직접 넣음)

const SLOT_COUNT = 3;

export default function PhotoGallery({ name, photoUrls }: { name: string; photoUrls: string[] }) {
  return (
    <section className="mt-4" aria-label={`${name} 사진`}>
      <ul className="grid grid-cols-3 gap-2">
        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const url = photoUrls[i];
          return (
            <li
              key={i}
              className="aspect-square overflow-hidden rounded-xl border border-black/10 bg-zinc-100 dark:border-white/15 dark:bg-zinc-800"
            >
              {url ? (
                // 사진 주소는 어디서든 올 수 있어 next/image 대신 기본 img를 씁니다.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={`${name} 사진 ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-zinc-500 dark:text-zinc-400">
                  <span aria-hidden className="text-2xl">
                    📷
                  </span>
                  <span className="text-xs">사진 준비 중</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}