import { graniteEvent } from '@apps-in-toss/web-framework';
import { useCallback, useEffect } from 'react';

type Primitive = string | number | boolean | null | undefined;

interface UseBackEventOptions {
  canGoBack: boolean;
  closeLayer: () => boolean;
  onNavigateBack: () => void;
  onRequestExit: () => void;
  routeDepth: number;
  screenName: string;
  trackEvent: (name: string, params?: Record<string, Primitive>) => void;
}

export function useBackEvent({
  canGoBack,
  closeLayer,
  onNavigateBack,
  onRequestExit,
  routeDepth,
  screenName,
  trackEvent,
}: UseBackEventOptions) {
  const handleBackPress = useCallback(() => {
    trackEvent('back_pressed', {
      entry_point: screenName,
      route_depth: routeDepth,
      screen_name: screenName,
    });

    if (closeLayer()) {
      return;
    }

    if (canGoBack) {
      onNavigateBack();
      return;
    }

    onRequestExit();
  }, [canGoBack, closeLayer, onNavigateBack, onRequestExit, routeDepth, screenName, trackEvent]);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    try {
      unsubscribe = graniteEvent.addEventListener('backEvent', {
        onEvent: handleBackPress,
        onError: () => undefined,
      });
    } catch {
      unsubscribe = () => {};
    }

    return unsubscribe;
  }, [handleBackPress]);

  return { handleBackPress };
}
