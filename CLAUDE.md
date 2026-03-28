# CLAUDE.md - 프로젝트 규칙

## 프로젝트 개요

앱인토스(Apps in Toss) WebView 미니앱 스타터킷. 토스 앱 내에서 동작하는 WebView 기반 미니앱을 빠르게 만들기 위한 보일러플레이트.

## 기술 스택

- **런타임**: React 19 + Vite
- **언어**: TypeScript (strict 모드)
- **빌드**: Granite (`granite.config.ts`) - `@apps-in-toss/web-framework`
- **UI**: TDS Mobile (Web) - `@toss/tds-mobile` + `@toss/tds-mobile-ait`
- **포맷팅/린팅**: Biome
- **스타일**: CSS-in-JS (inline CSSProperties)

## 코딩 규칙

- TypeScript strict 모드 필수
- Biome 포맷팅: 2칸 들여쓰기, 세미콜론, 트레일링 콤마
- 컴포넌트는 함수형 컴포넌트 + hooks 패턴
- 파일명: 컴포넌트는 PascalCase, 유틸/훅은 camelCase
- 경로 별칭: `@/*`, `@components/*`, `@pages/*`, `@hooks/*`, `@utils/*`

## 파일 구조

- `src/pages/` - 페이지 컴포넌트 (상태 기반 라우팅)
- `src/components/` - 재사용 컴포넌트
- `src/hooks/` - 커스텀 훅
- `src/utils/` - 유틸리티 함수
- `src/styles/` - 글로벌 CSS

## 핵심 규칙

- `TDSMobileAITProvider`로 앱 최상위 래핑 필수
- Storage는 `@apps-in-toss/web-framework`의 `Storage` 사용 (AsyncStorage 금지)
- 360px 모바일 전용 최적화
- TDS 컴포넌트 우선 사용

## 개발 명령어

```bash
npm run dev          # 개발 서버 (Vite)
npm run build        # 프로덕션 빌드
npm run lint         # Biome 린팅 + 자동 수정
npm run format       # Biome 포맷팅
npm run type-check   # TypeScript 타입 체크
```

## 중요 설정 파일

- `granite.config.ts` - 앱인토스 앱 설정 (appName 필수)
- `vite.config.ts` - Vite 빌드 + 경로 별칭
- `biome.json` - 포맷팅/린팅 규칙
- `tsconfig.app.json` - TypeScript 설정

## 작업 로그

- 의미 있는 작업 완료 시 `DEV_LOG.md`에 기록
