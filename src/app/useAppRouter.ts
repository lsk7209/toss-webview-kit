import { type AppRoute, HOME_ROUTE } from '@/app/types';
import { useCallback, useEffect, useState } from 'react';

interface RouteHistoryState {
  routeStack: AppRoute[];
}

function getHistoryStack(): AppRoute[] {
  const state = window.history.state as RouteHistoryState | null;

  if (state?.routeStack?.length) {
    return state.routeStack;
  }

  return [HOME_ROUTE];
}

export function useAppRouter() {
  const [routeStack, setRouteStack] = useState<AppRoute[]>(() => getHistoryStack());

  useEffect(() => {
    // 브라우저 히스토리를 단일 엔트리로 고정 — popstate 미사용
    // graniteEvent.backEvent 만으로 뒤로가기를 처리해 이중 발화 방지
    const state = window.history.state as RouteHistoryState | null;

    if (!state?.routeStack?.length) {
      window.history.replaceState(
        { routeStack: [HOME_ROUTE] } satisfies RouteHistoryState,
        '',
        window.location.pathname,
      );
    }
  }, []);

  const pushRoute = useCallback((route: AppRoute) => {
    setRouteStack((current) => {
      const next = [...current, route];
      window.history.replaceState(
        { routeStack: next } satisfies RouteHistoryState,
        '',
        window.location.pathname,
      );
      return next;
    });
  }, []);

  const replaceTop = useCallback((route: AppRoute) => {
    setRouteStack((current) => {
      const next = current.length === 0 ? [route] : [...current.slice(0, -1), route];
      window.history.replaceState(
        { routeStack: next } satisfies RouteHistoryState,
        '',
        window.location.pathname,
      );
      return next;
    });
  }, []);

  const popRoute = useCallback(() => {
    setRouteStack((current) => {
      if (current.length <= 1) {
        return current;
      }

      const next = current.slice(0, -1);
      window.history.replaceState(
        { routeStack: next } satisfies RouteHistoryState,
        '',
        window.location.pathname,
      );
      return next;
    });
  }, []);

  const resetToHome = useCallback(() => {
    window.history.replaceState(
      { routeStack: [HOME_ROUTE] } satisfies RouteHistoryState,
      '',
      window.location.pathname,
    );
    setRouteStack([HOME_ROUTE]);
  }, []);

  return {
    canGoBack: routeStack.length > 1,
    currentRoute: routeStack[routeStack.length - 1] ?? HOME_ROUTE,
    popRoute,
    pushRoute,
    replaceTop,
    resetToHome,
    routeStack,
  };
}
