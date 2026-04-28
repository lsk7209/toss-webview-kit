# 개발 로그

## 2026-03-24

### WebView 스타터킷 초기 구성
- Vite + React 18 + TypeScript 기반 프로젝트 생성
- `@apps-in-toss/web-framework`, `@toss/tds-mobile`, `@toss/tds-mobile-ait` 설정
- `TDSMobileAITProvider` 래핑, 상태 기반 라우팅 구현
- HomePage, DetailPage 페이지 작성
- SDK Storage/Share 유틸리티 래퍼 작성
- useStorage 커스텀 훅 작성
- 360px 모바일 최적화 글로벌 CSS 적용
- ESLint → Biome 전환, 불필요한 Vite 스캐폴드 파일 제거
