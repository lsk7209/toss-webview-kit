import {
  eventLog,
  getAnonymousKey,
  getOperationalEnvironment,
  getPlatformOS,
  getTossAppVersion,
} from '@apps-in-toss/web-framework';
import { useCallback, useEffect, useRef, useState } from 'react';

type Primitive = string | number | boolean | null | undefined;
type LogType =
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'event'
  | 'screen'
  | 'impression'
  | 'click'
  | 'popup';

export interface DebugEvent {
  at: string;
  name: string;
  params: Record<string, Primitive>;
}

function createSessionId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSafeOs() {
  try {
    return getPlatformOS();
  } catch {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ? 'ios' : 'web';
  }
}

function getSafeVersion() {
  try {
    return getTossAppVersion();
  } catch {
    return 'web-dev';
  }
}

function getSafeEnvironment() {
  try {
    return getOperationalEnvironment();
  } catch {
    return 'browser';
  }
}

export function useAnalytics() {
  const sessionIdRef = useRef(createSessionId());
  const sessionStartedAtRef = useRef(Date.now());
  const [anonymousId, setAnonymousId] = useState('anonymous');
  const [recentEvents, setRecentEvents] = useState<DebugEvent[]>([]);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const response = await getAnonymousKey();

        if (!active || response === 'ERROR' || response == null) {
          return;
        }

        setAnonymousId(response.hash);
      } catch {}
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, []);

  const trackEvent = useCallback(
    async (name: string, params: Record<string, Primitive> = {}, logType: LogType = 'event') => {
      const at = new Date().toISOString();
      const payload = {
        anonymous_id: anonymousId,
        app_version: getSafeVersion(),
        entry_point: 'app',
        environment: getSafeEnvironment(),
        event_at: at,
        experiment_id: 'balanced_ad_v1',
        os: getSafeOs(),
        session_id: sessionIdRef.current,
        variant_id: 'default',
        ...params,
      };

      setRecentEvents((current) => [{ at, name, params: payload }, ...current].slice(0, 12));

      try {
        await eventLog({
          log_name: name,
          log_type: logType,
          params: payload,
        });
      } catch {}
    },
    [anonymousId],
  );

  const getTimeSinceSessionStart = useCallback(() => Date.now() - sessionStartedAtRef.current, []);

  return {
    getTimeSinceSessionStart,
    recentEvents,
    trackEvent,
  };
}
