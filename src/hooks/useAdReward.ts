import { useCallback, useRef, useState } from 'react';

/**
 * 광고 보기 → 보상 패턴 훅
 *
 * "광고 보기" 버튼의 반응속도를 높이고 중복 실행을 방지해요.
 *
 * 사용 예시:
 *   const [watchAd, isWatching] = useAdReward(async () => {
 *     await AdSDK.show(); // 광고 SDK 호출
 *     await giveReward(); // 보상 지급
 *   });
 *   <Button loading={isWatching} onClick={watchAd}>광고 보고 포인트 받기</Button>
 */
export function useAdReward(onShowAd: () => Promise<void>): [() => void, boolean] {
  const [isPending, setIsPending] = useState(false);
  const isPendingRef = useRef(false);
  const onShowAdRef = useRef(onShowAd);

  // 항상 최신 콜백 참조 유지
  onShowAdRef.current = onShowAd;

  const trigger = useCallback(() => {
    // 동기적으로 즉시 상태 변경 → 버튼 반응 지연 없음
    if (isPendingRef.current) return;
    isPendingRef.current = true;
    setIsPending(true);

    onShowAdRef.current().finally(() => {
      isPendingRef.current = false;
      setIsPending(false);
    });
  }, []);

  return [trigger, isPending];
}
