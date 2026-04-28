import {
  DEV_AD_READY_DELAY_MS,
  INTERSTITIAL_AD_GROUP_ID,
  INTERSTITIAL_SESSION_LIMIT,
  REWARDED_AD_GROUP_ID,
  REWARDED_SESSION_LIMIT,
} from '@/features/ads/constants';
import { GoogleAdMob } from '@apps-in-toss/web-framework';
import { useCallback, useEffect, useRef, useState } from 'react';

type Primitive = string | number | boolean | null | undefined;
type AdFormat = 'interstitial' | 'rewarded';
type AdPhase = 'idle' | 'loading' | 'ready' | 'showing' | 'cooldown' | 'failed';

interface ShowAdOptions {
  placementId: string;
  onCompleted?: () => void;
}

interface UseAdEngineOptions {
  getTimeSinceSessionStart: () => number;
  showToast: (message: string) => void;
  trackEvent: (name: string, params?: Record<string, Primitive>) => void;
}

const AD_GROUP_IDS: Record<AdFormat, string> = {
  interstitial: INTERSTITIAL_AD_GROUP_ID,
  rewarded: REWARDED_AD_GROUP_ID,
};

function isLoadSupported() {
  try {
    return GoogleAdMob.loadAppsInTossAdMob.isSupported() === true;
  } catch {
    return false;
  }
}

function isShowSupported() {
  try {
    return GoogleAdMob.showAppsInTossAdMob.isSupported() === true;
  } catch {
    return false;
  }
}

export function useAdEngine({
  getTimeSinceSessionStart,
  showToast,
  trackEvent,
}: UseAdEngineOptions) {
  const [interstitialPhase, setInterstitialPhase] = useState<AdPhase>('idle');
  const [interstitialCount, setInterstitialCount] = useState(0);
  const [rewardedPhase, setRewardedPhase] = useState<AdPhase>('idle');
  const [sessionAdCount, setSessionAdCount] = useState(0);
  const [rewardedCount, setRewardedCount] = useState(0);
  const [overlay, setOverlay] = useState({
    format: 'interstitial' as AdFormat,
    open: false,
    placementId: '',
  });
  const requestIdRef = useRef<Record<AdFormat, string>>({
    interstitial: '',
    rewarded: '',
  });
  const pendingHandlersRef = useRef<Record<AdFormat, (() => void) | undefined>>({
    interstitial: undefined,
    rewarded: undefined,
  });

  const setPhase = useCallback((format: AdFormat, phase: AdPhase) => {
    if (format === 'interstitial') {
      setInterstitialPhase(phase);
      return;
    }

    setRewardedPhase(phase);
  }, []);

  const registerShownAd = useCallback((format?: AdFormat) => {
    setSessionAdCount((current) => current + 1);
    if (format === 'interstitial') {
      setInterstitialCount((current) => current + 1);
    }
    if (format === 'rewarded') {
      setRewardedCount((current) => current + 1);
    }
  }, []);

  const loadAd = useCallback(
    (format: AdFormat) => {
      const requestId = crypto.randomUUID();
      requestIdRef.current[format] = requestId;
      setPhase(format, 'loading');

      trackEvent('ad_request', {
        ad_format: format,
        placement_id: `${format}_preload`,
        request_id: requestId,
        session_ad_count: sessionAdCount,
        time_since_session_start: getTimeSinceSessionStart(),
      });

      if (navigator.onLine === false) {
        setPhase(format, 'failed');
        trackEvent('ad_failed', {
          ad_format: format,
          fail_reason: 'offline',
          placement_id: `${format}_preload`,
          request_id: requestId,
          session_ad_count: sessionAdCount,
          time_since_session_start: getTimeSinceSessionStart(),
        });
        return;
      }

      if (isLoadSupported()) {
        GoogleAdMob.loadAppsInTossAdMob({
          onEvent: (event) => {
            if (event.type !== 'loaded') {
              return;
            }

            setPhase(format, 'ready');
            trackEvent('ad_loaded', {
              ad_format: format,
              placement_id: `${format}_preload`,
              request_id: requestId,
              session_ad_count: sessionAdCount,
              time_since_session_start: getTimeSinceSessionStart(),
            });
          },
          onError: (error) => {
            setPhase(format, 'failed');
            trackEvent('ad_failed', {
              ad_format: format,
              fail_reason: error.message,
              placement_id: `${format}_preload`,
              request_id: requestId,
              session_ad_count: sessionAdCount,
              time_since_session_start: getTimeSinceSessionStart(),
            });
          },
          options: { adGroupId: AD_GROUP_IDS[format] },
        });
        return;
      }

      window.setTimeout(() => {
        setPhase(format, 'ready');
        trackEvent('ad_loaded', {
          ad_format: format,
          placement_id: `${format}_preload`,
          request_id: requestId,
          session_ad_count: sessionAdCount,
          time_since_session_start: getTimeSinceSessionStart(),
        });
      }, DEV_AD_READY_DELAY_MS);
    },
    [getTimeSinceSessionStart, sessionAdCount, setPhase, trackEvent],
  );

  useEffect(() => {
    loadAd('interstitial');
    loadAd('rewarded');
  }, [loadAd]);

  const showAd = useCallback(
    (format: AdFormat, { placementId, onCompleted }: ShowAdOptions) => {
      const phase = format === 'interstitial' ? interstitialPhase : rewardedPhase;

      if (phase !== 'ready') {
        trackEvent('ad_failed', {
          ad_format: format,
          fail_reason: 'not_ready',
          placement_id: placementId,
          request_id: requestIdRef.current[format],
          session_ad_count: sessionAdCount,
          time_since_session_start: getTimeSinceSessionStart(),
        });
        onCompleted?.();
        loadAd(format);
        return;
      }

      pendingHandlersRef.current[format] = onCompleted;
      setPhase(format, 'showing');

      if (!isShowSupported() && navigator.onLine === false) {
        trackEvent('ad_failed', {
          ad_format: format,
          fail_reason: 'offline_show',
          placement_id: placementId,
          request_id: requestIdRef.current[format],
          session_ad_count: sessionAdCount,
          time_since_session_start: getTimeSinceSessionStart(),
        });
        pendingHandlersRef.current[format]?.();
        pendingHandlersRef.current[format] = undefined;
        setPhase(format, 'failed');
        loadAd(format);
        return;
      }

      if (isShowSupported()) {
        GoogleAdMob.showAppsInTossAdMob({
          onEvent: (event) => {
            if (event.type === 'impression') {
              registerShownAd(format);
              trackEvent('ad_shown', {
                ad_format: format,
                placement_id: placementId,
                request_id: requestIdRef.current[format],
                session_ad_count: sessionAdCount + 1,
                time_since_session_start: getTimeSinceSessionStart(),
              });
            }

            if (event.type === 'clicked') {
              trackEvent('ad_clicked', {
                ad_format: format,
                placement_id: placementId,
                request_id: requestIdRef.current[format],
                session_ad_count: sessionAdCount,
                time_since_session_start: getTimeSinceSessionStart(),
              });
            }

            if (event.type === 'userEarnedReward' && format === 'rewarded') {
              showToast('추가 조언이 열렸어요.');
            }

            if (event.type === 'dismissed') {
              trackEvent('ad_closed', {
                ad_format: format,
                placement_id: placementId,
                request_id: requestIdRef.current[format],
                session_ad_count: sessionAdCount,
                time_since_session_start: getTimeSinceSessionStart(),
              });
              pendingHandlersRef.current[format]?.();
              pendingHandlersRef.current[format] = undefined;
              setPhase(format, 'cooldown');
              loadAd(format);
            }

            if (event.type === 'failedToShow') {
              trackEvent('ad_failed', {
                ad_format: format,
                fail_reason: 'failed_to_show',
                placement_id: placementId,
                request_id: requestIdRef.current[format],
                session_ad_count: sessionAdCount,
                time_since_session_start: getTimeSinceSessionStart(),
              });
              pendingHandlersRef.current[format]?.();
              pendingHandlersRef.current[format] = undefined;
              setPhase(format, 'failed');
              loadAd(format);
            }
          },
          onError: (error) => {
            trackEvent('ad_failed', {
              ad_format: format,
              fail_reason: error.message,
              placement_id: placementId,
              request_id: requestIdRef.current[format],
              session_ad_count: sessionAdCount,
              time_since_session_start: getTimeSinceSessionStart(),
            });
            pendingHandlersRef.current[format]?.();
            pendingHandlersRef.current[format] = undefined;
            setPhase(format, 'failed');
            loadAd(format);
          },
          options: { adGroupId: AD_GROUP_IDS[format] },
        });
        return;
      }

      registerShownAd(format);
      trackEvent('ad_shown', {
        ad_format: format,
        placement_id: placementId,
        request_id: requestIdRef.current[format],
        session_ad_count: sessionAdCount + 1,
        time_since_session_start: getTimeSinceSessionStart(),
      });
      setOverlay({ format, open: true, placementId });
    },
    [
      getTimeSinceSessionStart,
      interstitialPhase,
      loadAd,
      registerShownAd,
      rewardedPhase,
      sessionAdCount,
      setPhase,
      showToast,
      trackEvent,
    ],
  );

  const closeOverlay = useCallback(() => {
    if (!overlay.open) {
      return;
    }

    trackEvent('ad_closed', {
      ad_format: overlay.format,
      placement_id: overlay.placementId,
      request_id: requestIdRef.current[overlay.format],
      session_ad_count: sessionAdCount,
      time_since_session_start: getTimeSinceSessionStart(),
    });
    pendingHandlersRef.current[overlay.format]?.();
    pendingHandlersRef.current[overlay.format] = undefined;
    setOverlay({ format: overlay.format, open: false, placementId: '' });
    setPhase(overlay.format, 'cooldown');
    loadAd(overlay.format);
  }, [getTimeSinceSessionStart, loadAd, overlay, sessionAdCount, setPhase, trackEvent]);

  const markOverlayClicked = useCallback(() => {
    if (!overlay.open) {
      return;
    }

    trackEvent('ad_clicked', {
      ad_format: overlay.format,
      placement_id: overlay.placementId,
      request_id: requestIdRef.current[overlay.format],
      session_ad_count: sessionAdCount,
      time_since_session_start: getTimeSinceSessionStart(),
    });
  }, [getTimeSinceSessionStart, overlay, sessionAdCount, trackEvent]);

  const rewardAndCloseOverlay = useCallback(() => {
    if (overlay.format === 'rewarded') {
      showToast('추가 조언이 열렸어요.');
    }
    closeOverlay();
  }, [closeOverlay, overlay.format, showToast]);

  return {
    closeOverlay,
    interstitialReady: interstitialPhase === 'ready',
    markOverlayClicked,
    overlay,
    registerShownAd,
    rewardAndCloseOverlay,
    rewardedReady: rewardedPhase === 'ready',
    sessionAdCount,
    shouldShowInterstitial: (fortuneCount: number) =>
      interstitialCount < INTERSTITIAL_SESSION_LIMIT && fortuneCount >= 1,
    showInterstitial: (options: ShowAdOptions) => showAd('interstitial', options),
    showRewarded: (options: ShowAdOptions) => {
      if (rewardedCount >= REWARDED_SESSION_LIMIT) {
        options.onCompleted?.();
        return;
      }
      showAd('rewarded', options);
    },
  };
}
