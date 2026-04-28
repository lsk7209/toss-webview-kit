import { useCallback, useRef, useState } from 'react';

/** 비동기 콜백의 로딩 상태를 자동으로 관리하는 훅
 *
 * 사용 예시:
 *   const [handleSubmit, isSubmitting] = useAsyncCallback(async () => {
 *     await submitForm();
 *   });
 *   <Button loading={isSubmitting} onClick={handleSubmit}>제출하기</Button>
 */
export function useAsyncCallback(fn: () => Promise<void>): [() => Promise<void>, boolean] {
  const [isLoading, setIsLoading] = useState(false);
  const fnRef = useRef(fn);
  const isLoadingRef = useRef(isLoading);

  // 항상 최신 함수 참조 유지
  fnRef.current = fn;
  isLoadingRef.current = isLoading;

  const execute = useCallback(async () => {
    // 중복 실행 방지
    if (isLoadingRef.current) return;
    setIsLoading(true);
    try {
      await fnRef.current();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [execute, isLoading];
}
