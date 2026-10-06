import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Docker 배포용 최소 빌드
  poweredByHeader: false, // 응답 헤더에서 Next.js 노출 제거
};

export default nextConfig;