import { useCallback, useEffect, useState } from "react";
import { getItem, setItem } from "@utils/storage";

/** SDK Storage를 React 상태와 연결하는 훅 */
export function useStorage(key: string, defaultValue = "") {
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getItem(key).then((stored) => {
      if (stored !== null) {
        setValue(stored);
      }
      setIsLoading(false);
    });
  }, [key]);

  const update = useCallback(
    async (newValue: string) => {
      setValue(newValue);
      await setItem(key, newValue);
    },
    [key],
  );

  return { value, update, isLoading } as const;
}
