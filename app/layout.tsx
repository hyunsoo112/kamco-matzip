import type { Metadata } from "next";
import "./globals.css";

// 브라우저 탭 제목과 검색엔진용 설명
export const metadata: Metadata = {
  title: "캠코인재개발원 맛집 지도",
  description:
    "캠코인재개발원 교육생이 주변 맛집을 찾고, 직접 평가와 새 식당을 남기는 맛집 지도",
};

// 모든 화면을 감싸는 공통 틀 (한국어 페이지)
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
