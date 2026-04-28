import { TossAds, type TossAdsAttachBannerResult } from '@apps-in-toss/web-framework';
import { useEffect, useRef, useState } from 'react';

type Primitive = string | number | boolean | null | undefined;

interface BannerSlotProps {
  adGroupId: string;
  placementId: string;
  sessionAdCount: number;
  getTimeSinceSessionStart: () => number;
  onAdShown: () => void;
  trackEvent: (name: string, params?: Record<string, Primitive>) => void;
}

let bannerSdkPromise: Promise<boolean> | null = null;

function isBannerInitializeSupported() {
  try {
    return TossAds.initialize.isSupported() === true;
  } catch {
    return false;
  }
}

function isBannerAttachSupported() {
  try {
    return TossAds.attachBanner.isSupported() === true;
  } catch {
    return false;
  }
}

function ensureBannerSdk() {
  if (bannerSdkPromise) {
    return bannerSdkPromise;
  }

  bannerSdkPromise = new Promise((resolve) => {
    if (!isBannerInitializeSupported()) {
      resolve(false);
      return;
    }

    TossAds.initialize({
      callbacks: {
        onInitialized: () => resolve(true),
        onInitializationFailed: () => resolve(false),
      },
    });
  });

  return bannerSdkPromise;
}

export function BannerSlot({
  adGroupId,
  placementId,
  sessionAdCount,
  getTimeSinceSessionStart,
  onAdShown,
  trackEvent,
}: BannerSlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let active = true;
    let attached: TossAdsAttachBannerResult | undefined;

    trackEvent('ad_request', {
      ad_format: 'banner',
      placement_id: placementId,
      session_ad_count: sessionAdCount,
      time_since_session_start: getTimeSinceSessionStart(),
    });

    void ensureBannerSdk().then((initialized) => {
      if (!active) {
        return;
      }

      if (!initialized || !containerRef.current || !isBannerAttachSupported()) {
        setShowFallback(true);
        trackEvent('ad_failed', {
          ad_format: 'banner',
          fail_reason: 'unsupported_banner_sdk',
          placement_id: placementId,
          session_ad_count: sessionAdCount,
          time_since_session_start: getTimeSinceSessionStart(),
        });
        return;
      }

      attached = TossAds.attachBanner(adGroupId, containerRef.current, {
        theme: 'light',
        tone: 'grey',
        variant: 'card',
        callbacks: {
          onAdRendered: () => {
            trackEvent('ad_loaded', {
              ad_format: 'banner',
              placement_id: placementId,
              session_ad_count: sessionAdCount,
              time_since_session_start: getTimeSinceSessionStart(),
            });
          },
          onAdImpression: () => {
            onAdShown();
            trackEvent('ad_shown', {
              ad_format: 'banner',
              placement_id: placementId,
              session_ad_count: sessionAdCount + 1,
              time_since_session_start: getTimeSinceSessionStart(),
            });
          },
          onAdClicked: () => {
            trackEvent('ad_clicked', {
              ad_format: 'banner',
              placement_id: placementId,
              session_ad_count: sessionAdCount,
              time_since_session_start: getTimeSinceSessionStart(),
            });
          },
          onAdFailedToRender: (payload) => {
            setShowFallback(true);
            trackEvent('ad_failed', {
              ad_format: 'banner',
              fail_reason: payload.error.message,
              placement_id: placementId,
              session_ad_count: sessionAdCount,
              time_since_session_start: getTimeSinceSessionStart(),
            });
          },
          onNoFill: () => {
            setShowFallback(true);
            trackEvent('ad_failed', {
              ad_format: 'banner',
              fail_reason: 'no_fill',
              placement_id: placementId,
              session_ad_count: sessionAdCount,
              time_since_session_start: getTimeSinceSessionStart(),
            });
          },
        },
      });
    });

    return () => {
      active = false;
      attached?.destroy();
    };
  }, [adGroupId, getTimeSinceSessionStart, onAdShown, placementId, sessionAdCount, trackEvent]);

  return (
    <section style={{ marginTop: 8 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: '#9aa4b2' }}>AD</span>
        <span style={{ fontSize: 12, color: '#9aa4b2' }}>광고는 자연스러운 지점에만 보여줘요</span>
      </div>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          minHeight: 96,
          borderRadius: 24,
          overflow: 'hidden',
        }}
      />
      {showFallback && (
        <div
          style={{
            marginTop: 10,
            borderRadius: 24,
            padding: '18px 16px',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: '1px solid #fdba74',
            color: '#9a3412',
          }}
        >
          브라우저 검증 환경이라 배너를 안내 카드로 대체했어요.
        </div>
      )}
    </section>
  );
}
