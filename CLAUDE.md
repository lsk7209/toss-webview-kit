# 앱인토스 미니앱 개발 규칙

## 프로젝트 정보
- 콘솔 국문 이름: 냥타로
- 앱 ID: nyangtarot
- 아이콘 URL: 미정
- 스택: React + Vite + TDS, 프론트엔드 온리, localStorage/SDK Storage 병행
- SDK: @apps-in-toss/web-framework 2.x

## 절대 규칙
- `granite.config.ts`의 `displayName`과 `index.html`의 `<title>`은 `냥타로`와 동일하게 유지
- 자체 상단 헤더바와 뒤로가기 화살표는 구현하지 않기
- `index.html` viewport의 `maximum-scale=1.0, user-scalable=no` 유지
- `granite.config.ts`의 `icon`은 추후 접근 가능한 `https` URL로 교체

## UX 규칙
- 모든 문구는 해요체 유지
- 첫 진입 직후 전면광고 금지
- 광고는 결과 종료 지점과 선택형 리워드에만 배치
- 루트 화면에서만 종료 확인 다이얼로그 노출

## 광고 규칙
- 홈/컬렉션: 배너
- 결과 화면: 선택형 리워드
- 결과 종료 후 홈 복귀: 세션당 전면광고 1회
- 광고 실패 시 사용자 플로우를 막지 않고 즉시 폴백

## 데이터 저장 규칙
- prefix: `nyangtarot.v1.*`
- 민감정보 저장 금지
- 브라우저 검증 환경에서는 localStorage 폴백 허용, Toss 실환경은 SDK Storage 우선

## 검증 규칙
- 구현 후 `npm run lint`, `npm run type-check`, `npm run build`
- 브라우저에서 홈/결과/컬렉션/뒤로가기/광고 폴백 시나리오를 실제 검증
- 검증 결과는 `test-results/browser-report.json`에 저장
