import { useAppRouter } from "@/app/useAppRouter";
import { useBackEvent } from "@/app/useBackEvent";
import { BottomSheet } from "@/components/BottomSheet";
import { Dialog } from "@/components/Dialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Layout } from "@/components/Layout";
import { Toast } from "@/components/Toast";
import { BannerSlot } from "@/features/ads/BannerSlot";
import { DevAdModal } from "@/features/ads/DevAdModal";
import {
  BANNER_AD_GROUP_ID,
  COLLECTION_BANNER_PLACEMENT,
  HOME_BANNER_PLACEMENT,
  RESULT_BANNER_PLACEMENT,
  RESULT_HOME_INTERSTITIAL_PLACEMENT,
  RESULT_REWARD_PLACEMENT,
} from "@/features/ads/constants";
import { useAdEngine } from "@/features/ads/useAdEngine";
import { useAnalytics } from "@/features/analytics/useAnalytics";
import {
  type FortuneTopicId,
  createFortuneResult,
} from "@/features/fortune/data";
import {
  type SavedFortune,
  type VisitStats,
  bootstrapVisitStats,
  bumpFortuneCount,
  loadSavedFortunes,
  saveFortune,
} from "@/features/fortune/storage";
import { HomePage } from "@/pages/HomePage";
import {
  closeView,
  getOperationalEnvironment,
} from "@apps-in-toss/web-framework";
import { ThemeProvider } from "@toss/tds-mobile";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import {
  Fragment,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const CollectionPage = lazy(() =>
  import("@/pages/CollectionPage").then((m) => ({ default: m.CollectionPage })),
);
const ResultPage = lazy(() =>
  import("@/pages/DetailPage").then((m) => ({ default: m.ResultPage })),
);
const DebugPanel = lazy(() =>
  import("@/components/DebugPanel").then((m) => ({ default: m.DebugPanel })),
);

const DEFAULT_STATS: VisitStats = {
  streakCount: 1,
  totalFortunes: 0,
  totalVisits: 1,
  lastVisitedOn: null,
};

const isDebugMode = import.meta.env.DEV;

export function App() {
  const router = useAppRouter();
  const currentRoute = router.currentRoute;
  const currentResult =
    currentRoute.page === "result" ? currentRoute.result : null;
  const { recentEvents, trackEvent, getTimeSinceSessionStart } = useAnalytics();
  const [savedFortunes, setSavedFortunes] = useState<SavedFortune[]>([]);
  const [stats, setStats] = useState<VisitStats>(DEFAULT_STATS);
  const [sessionFortuneCount, setSessionFortuneCount] = useState(0);
  const [savedSheetOpen, setSavedSheetOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const lastViewedResultRef = useRef<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const [saved, visit] = await Promise.all([
        loadSavedFortunes(),
        bootstrapVisitStats(),
      ]);

      if (!active) {
        return;
      }

      setSavedFortunes(saved);
      setStats(visit.stats);

      trackEvent("session_started", {
        entry_point: "app_launch",
        saved_count: saved.length,
        streak_count: visit.stats.streakCount,
        time_since_session_start: 0,
      });

      if (visit.isReturning) {
        trackEvent("return_entry", {
          days_since_last_session: visit.daysSinceLastVisit ?? -1,
          entry_point: "app_launch",
          return_trigger: "recent_visit",
        });
      }
    }

    void bootstrap();

    return () => {
      active = false;
    };
  }, [trackEvent]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: page_view는 페이지 전환 시만 발화
  useEffect(() => {
    trackEvent("page_view", {
      entry_point: currentRoute.page,
      screen_name: currentRoute.page,
    });
  }, [currentRoute.page]);

  useEffect(() => {
    if (!currentResult) {
      return;
    }

    if (lastViewedResultRef.current === currentResult.readingId) {
      return;
    }

    lastViewedResultRef.current = currentResult.readingId;
    trackEvent("fortune_result_viewed", {
      entry_point: "result",
      question_category: currentResult.topicId,
      result_id: currentResult.readingId,
      reward_unlocked: currentResult.rewardUnlocked,
      time_to_result_ms: 0,
    });
  }, [currentResult, trackEvent]);

  const adEngine = useAdEngine({
    getTimeSinceSessionStart,
    showToast,
    trackEvent,
  });

  const closeActiveLayer = useCallback(() => {
    if (savedSheetOpen) {
      setSavedSheetOpen(false);
      return true;
    }

    if (exitDialogOpen) {
      setExitDialogOpen(false);
      return true;
    }

    if (adEngine.overlay.open) {
      adEngine.closeOverlay();
      return true;
    }

    return false;
  }, [adEngine, exitDialogOpen, savedSheetOpen]);

  const { handleBackPress } = useBackEvent({
    canGoBack: router.canGoBack,
    closeLayer: closeActiveLayer,
    onNavigateBack: router.popRoute,
    onRequestExit: () => setExitDialogOpen(true),
    routeDepth: router.routeStack.length,
    screenName: currentRoute.page,
    trackEvent,
  });

  const latestSaved = savedFortunes[0] ?? null;
  const isCurrentResultSaved = currentResult
    ? savedFortunes.some(
        (fortune) => fortune.readingId === currentResult.readingId,
      )
    : false;

  const handlePickFortune = useCallback(
    async (topicId: FortuneTopicId) => {
      const result = createFortuneResult(topicId);
      const nextStats = await bumpFortuneCount();

      setStats(nextStats);
      setSessionFortuneCount((current) => current + 1);
      router.pushRoute({ page: "result", result });

      trackEvent("fortune_requested", {
        entry_point: "home",
        question_category: topicId,
        result_id: result.readingId,
        time_to_result_ms: 0,
      });
    },
    [router, trackEvent],
  );

  const handleSaveFortune = useCallback(async () => {
    if (!currentResult) {
      return;
    }

    const next = await saveFortune(currentResult);
    setSavedFortunes(next);
    showToast("결과를 저장했어요.");
  }, [currentResult, showToast]);

  const handleRewardAdvice = useCallback(() => {
    if (!currentResult) {
      return;
    }

    adEngine.showRewarded({
      placementId: RESULT_REWARD_PLACEMENT,
      onCompleted: () => {
        router.replaceTop({
          page: "result",
          result: {
            ...currentResult,
            rewardUnlocked: true,
          },
        });
      },
    });
  }, [adEngine, currentResult, router]);

  const handleGoHomeFromResult = useCallback(() => {
    const finish = () => {
      router.resetToHome();
      showToast("홈으로 돌아왔어요.");
    };

    if (!adEngine.shouldShowInterstitial(sessionFortuneCount)) {
      finish();
      return;
    }

    adEngine.showInterstitial({
      placementId: RESULT_HOME_INTERSTITIAL_PLACEMENT,
      onCompleted: finish,
    });
  }, [adEngine, router, sessionFortuneCount, showToast]);

  const handleOpenSavedFortune = useCallback(
    (fortune: SavedFortune) => {
      setSavedSheetOpen(false);
      router.pushRoute({
        page: "result",
        result: {
          ...fortune,
          rewardUnlocked: fortune.rewardUnlocked,
        },
      });
    },
    [router],
  );

  const confirmExit = useCallback(async () => {
    try {
      await closeView();
    } catch {
      showToast("브라우저 검증 환경에서는 종료 호출을 생략했어요.");
      setExitDialogOpen(false);
    }
  }, [showToast]);

  const isSandbox = (() => {
    try {
      return getOperationalEnvironment() === "sandbox";
    } catch {
      return false;
    }
  })();
  const AppShell = isSandbox ? TDSMobileAITProvider : Fragment;

  let page: React.ReactNode = null;

  if (currentRoute.page === "home") {
    page = (
      <HomePage
        latestSaved={latestSaved}
        savedCount={savedFortunes.length}
        stats={stats}
        onOpenCollection={() => router.pushRoute({ page: "collection" })}
        onOpenSavedSheet={() => setSavedSheetOpen(true)}
        onPickFortune={handlePickFortune}
      />
    );
  }

  if (currentRoute.page === "result" && currentResult) {
    page = (
      <ResultPage
        isSaved={isCurrentResultSaved}
        rewardReady={adEngine.rewardedReady}
        result={currentResult}
        onGoHome={handleGoHomeFromResult}
        onOpenCollection={() => router.pushRoute({ page: "collection" })}
        onSave={handleSaveFortune}
        onShowReward={handleRewardAdvice}
      />
    );
  }

  if (currentRoute.page === "collection") {
    page = (
      <CollectionPage
        savedFortunes={savedFortunes}
        stats={stats}
        onOpenFortune={handleOpenSavedFortune}
        onPickFortune={handlePickFortune}
      />
    );
  }

  return (
    <ErrorBoundary>
      <AppShell>
        <ThemeProvider>
          <Layout>
            <Suspense fallback={null}>{page}</Suspense>
            {currentRoute.page === "home" && (
              <BannerSlot
                adGroupId={BANNER_AD_GROUP_ID}
                getTimeSinceSessionStart={getTimeSinceSessionStart}
                onAdShown={adEngine.registerShownAd}
                placementId={HOME_BANNER_PLACEMENT}
                sessionAdCount={adEngine.sessionAdCount}
                trackEvent={trackEvent}
              />
            )}
            {currentRoute.page === "collection" && (
              <BannerSlot
                adGroupId={BANNER_AD_GROUP_ID}
                getTimeSinceSessionStart={getTimeSinceSessionStart}
                onAdShown={adEngine.registerShownAd}
                placementId={COLLECTION_BANNER_PLACEMENT}
                sessionAdCount={adEngine.sessionAdCount}
                trackEvent={trackEvent}
              />
            )}
            {currentRoute.page === "result" && (
              <BannerSlot
                adGroupId={BANNER_AD_GROUP_ID}
                getTimeSinceSessionStart={getTimeSinceSessionStart}
                onAdShown={adEngine.registerShownAd}
                placementId={RESULT_BANNER_PLACEMENT}
                sessionAdCount={adEngine.sessionAdCount}
                trackEvent={trackEvent}
              />
            )}
          </Layout>

          <BottomSheet
            description="최근 저장한 결과를 다시 열어볼 수 있어요."
            open={savedSheetOpen}
            title="저장한 결과"
            onClose={() => setSavedSheetOpen(false)}
          >
            {savedFortunes.length === 0 ? (
              <p style={{ color: "#6b7684", lineHeight: 1.6 }}>
                아직 저장한 결과가 없어요.
              </p>
            ) : (
              savedFortunes.map((fortune) => (
                <button
                  key={fortune.readingId}
                  type="button"
                  onClick={() => handleOpenSavedFortune(fortune)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 18,
                    border: "1px solid #e5e8eb",
                    background: "#ffffff",
                    textAlign: "left",
                  }}
                >
                  <strong style={{ display: "block", color: "#191f28" }}>
                    {fortune.catName} · {fortune.headline}
                  </strong>
                  <span style={{ color: "#6b7684", fontSize: 13 }}>
                    {fortune.topicLabel} ·{" "}
                    {new Date(fortune.savedAt).toLocaleString("ko-KR")}
                  </span>
                </button>
              ))
            )}
          </BottomSheet>

          <Dialog
            confirmLabel="종료할게요"
            description="루트 화면에서는 한 번 더 확인한 뒤 종료할게요."
            open={exitDialogOpen}
            title="정말 종료할까요?"
            onCancel={() => setExitDialogOpen(false)}
            onConfirm={confirmExit}
          />

          <DevAdModal
            format={adEngine.overlay.format}
            open={adEngine.overlay.open}
            placementId={adEngine.overlay.placementId}
            onClickAd={adEngine.markOverlayClicked}
            onClose={adEngine.closeOverlay}
            onRewardAndClose={adEngine.rewardAndCloseOverlay}
          />

          <Toast message={toastMessage} onClose={() => setToastMessage("")} />

          {isDebugMode && (
            <Suspense fallback={null}>
              <DebugPanel
                currentPage={currentRoute.page}
                events={recentEvents}
                isInterstitialReady={adEngine.interstitialReady}
                isRewardReady={adEngine.rewardedReady}
                isSandbox={isSandbox}
                onSimulateBack={handleBackPress}
                sessionAdCount={adEngine.sessionAdCount}
              />
            </Suspense>
          )}
        </ThemeProvider>
      </AppShell>
    </ErrorBoundary>
  );
}
