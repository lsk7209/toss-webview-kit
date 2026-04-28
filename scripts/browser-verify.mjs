import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = "http://127.0.0.1:5173";
const OUTPUT_DIR = resolve(process.cwd(), "test-results");
const REPORT_PATH = resolve(OUTPUT_DIR, "browser-report.json");

await mkdir(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 360, height: 800 },
});
const page = await context.newPage();

const consoleErrors = [];
const pageErrors = [];
const requestFailures = [];
const steps = [];
const sessionStart = Date.now();

page.on("console", (message) => {
  if (message.type() === "error") {
    consoleErrors.push(message.text());
  }
});

page.on("pageerror", (error) => {
  pageErrors.push(error.message);
});

page.on("requestfailed", (request) => {
  requestFailures.push(`${request.url()} :: ${request.failure()?.errorText ?? "failed"}`);
});

async function screenshot(name) {
  await page.screenshot({ path: resolve(OUTPUT_DIR, `${name}.png`), fullPage: true });
}

async function runStep(name, handler) {
  try {
    const detail = await handler();
    steps.push({ detail, name, status: "PASS" });
  } catch (error) {
    steps.push({
      error: error instanceof Error ? error.message : String(error),
      name,
      status: "FAIL",
    });
    throw error;
  }
}

try {
  await runStep("home_load", async () => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.getByText("참치가 오늘의 흐름을").waitFor();
    await screenshot("01-home");
    return { url: page.url() };
  });

  await runStep("fortune_open", async () => {
    await page.getByRole("button", { name: "오늘의 흐름을 볼래요" }).click();
    await page.getByText("오늘의 한 줄 액션").waitFor();
    await screenshot("02-result");
    return { page: "result" };
  });

  await runStep("save_result", async () => {
    await page.getByRole("button", { name: "결과 저장하기" }).click();
    await page.getByText("결과를 저장했어요.").waitFor();
    return { saved: true };
  });

  await runStep("reward_ad_latency", async () => {
    const button = page.getByRole("button", { name: /광고/ });
    const start = Date.now();
    await button.click();
    await page.getByText("개발용 광고 오버레이").waitFor();
    const latencyMs = Date.now() - start;
    await screenshot("03-reward-overlay");
    await page.getByRole("button", { name: "보상 받고 닫기" }).click();
    await page.getByText("추가 조언").waitFor();
    return { latencyMs };
  });

  await runStep("collection_open", async () => {
    await page.getByRole("button", { name: "컬렉션 보기" }).click();
    await page.getByText("컬렉션").waitFor();
    await screenshot("04-collection");
    return { page: "collection" };
  });

  await runStep("back_from_collection", async () => {
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await page.getByText("오늘의 한 줄 액션").waitFor();
    return { page: "result" };
  });

  await runStep("interstitial_latency", async () => {
    const waitMs = Math.max(0, 15100 - (Date.now() - sessionStart));
    if (waitMs > 0) {
      await page.waitForTimeout(waitMs);
    }

    const start = Date.now();
    await page.getByRole("button", { name: "홈으로 돌아가기" }).click();
    await page.getByText("개발용 광고 오버레이").waitFor();
    const latencyMs = Date.now() - start;
    await screenshot("05-interstitial-overlay");
    await page.getByRole("button", { name: "광고 닫기" }).click();
    await page.getByText("참치가 오늘의 흐름을").waitFor();
    return { latencyMs };
  });

  await runStep("modal_back_priority", async () => {
    await page.getByRole("button", { name: "저장한 결과 다시 열기" }).click();
    await page.getByText("저장한 결과").waitFor();
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await page.getByText("저장한 결과").waitFor({ state: "hidden" });
    return { modalClosedFirst: true };
  });

  await runStep("root_exit_confirm", async () => {
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await page.getByText("정말 종료할까요?").waitFor();
    await page.getByRole("button", { name: "계속 볼게요" }).click();
    await page.getByText("정말 종료할까요?").waitFor({ state: "hidden" });
    return { confirmDialogShown: true };
  });

  await runStep("deep_back_sequence", async () => {
    await page.getByRole("button", { name: "일운을 볼래요" }).click();
    await page.getByText("오늘의 한 줄 액션").waitFor();
    await page.getByRole("button", { name: "컬렉션 보기" }).click();
    await page.getByText("컬렉션").waitFor();
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await page.getByText("오늘의 한 줄 액션").waitFor();
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await page.getByText("참치가 오늘의 흐름을").waitFor();
    return { sequence: ["collection", "result", "home"] };
  });

  await runStep("offline_reward_fallback", async () => {
    await page.getByRole("button", { name: "관계운을 볼래요" }).click();
    await page.getByText("오늘의 한 줄 액션").waitFor();
    await context.setOffline(true);
    await page.getByRole("button", { name: /광고/ }).click();
    await page.getByText("개발용 광고 오버레이").waitFor({ state: "hidden" });
    await page.getByText("추가 조언").waitFor();
    await context.setOffline(false);
    return { fallbackContinued: true };
  });
} finally {
  const report = {
    consoleErrors,
    pageErrors,
    requestFailures,
    steps,
  };

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  await browser.close();
}
