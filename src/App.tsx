import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { useState } from "react";
import { DetailPage } from "./pages/DetailPage";
import { HomePage } from "./pages/HomePage";

/** 간단한 라우터 (상태 기반) */
interface RouteState {
  page: "home" | "detail";
  params?: Record<string, string>;
}

export function App() {
  const [route, setRoute] = useState<RouteState>({ page: "home" });

  const navigate = (
    page: RouteState["page"],
    params?: Record<string, string>,
  ) => {
    setRoute({ page, params });
  };

  const goBack = () => {
    setRoute({ page: "home" });
  };

  return (
    <TDSMobileAITProvider>
      {route.page === "home" && <HomePage onNavigate={navigate} />}
      {route.page === "detail" && (
        <DetailPage params={route.params} onBack={goBack} />
      )}
    </TDSMobileAITProvider>
  );
}
