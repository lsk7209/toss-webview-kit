import { getItem, setItem } from '@utils/storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * SDK Storage를 React 상태와 연결하는 훅 (JSON 직렬화 지원)
 *
 * 사용 예시:
 *   const { value, update } = useStorage('count', 0);
 *   const { value, update } = useStorage<string[]>('tags', []);
 *   const { value, update } = useStorage('name', '');  // string도 동일하게 사용
 */
export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getItem(key).then((stored) => {
      if (stored !== null) {
        try {
          setValue(JSON.parse(stored) as T);
        } catch {
          // 기존 순수 문자열 값 호환
          setValue(stored as unknown as T);
        }
      }
      setIsLoading(false);
    });
  }, [key]);

  const update = useCallback(
    async (newValue: T) => {
      setValue(newValue);
      await setItem(key, JSON.stringify(newValue));
    },
    [key],
  );

  return { value, update, isLoading } as const;
}
