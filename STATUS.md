# Status | 마지막: 2026-04-29
## 현재 작업
TODO 3개 완료. 실환경 배포 준비 완료 상태.
## 최근 변경 (최근 5개만)
- 04-29: 실환경 광고 ID 3종 교체 (배너/전면/리워드)
- 04-29: 번들 코드 분할 (index 1,139KB→31KB, 페이지 lazy load)
- 04-29: granite.config.ts icon URL 설정 (GitHub raw)
- 04-29: 앱스토어 등록용 이미지 재생성 (올바른 사이즈)
- 04-24: lint/type-check/build/브라우저 검증 통과
## TODO
- [ ] 앱인토스 콘솔 등록 (이미지/텍스트 업로드)
- [ ] 실환경 Toss 앱에서 광고 노출 최종 확인
## 결정사항
- 뒤로가기: modal > ad overlay > route pop > root exit confirm
- 광고: 홈/컬렉션 배너 + 결과 종료 지점 전면 + 결과 페이지 선택형 리워드
- 번들: vendor-toss(949KB, TDS 자체 크기) chunkSizeWarningLimit=1000으로 경고 억제
## 주의
- .omx/ .gitignore 미등록 — 수동으로 커밋 제외 중
- 광고 ID는 실환경용 (테스트 ID 아님)
