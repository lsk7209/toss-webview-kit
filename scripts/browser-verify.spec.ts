import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const BASE_URL = "http://127.0.0.1:5173";
const OUTPUT_DIR = resolve(process.cwd(), "test-results");
const REPORT_PATH = resolve(OUTPUT_DIR, "browser-report.json");

test.describe.configure({ mode: "serial" });

test.use({
  viewport: { width: 360, height: 800 },
});

test("냥타로 브라우저 동작 검증", async ({ context, page }) => {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const requestFailures: string[] = [];
  const steps: Array<Record<string, unknown>> = [];
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

  async function capture(name: string) {
    await page.screenshot({ fullPage: true, path: resolve(OUTPUT_DIR, `${name}.png`) });
  }

  async function runStep(name: string, handler: () => Promise<Record<string, unknown>>) {
    const detail = await handler();
    steps.push({ detail, name, status: "PASS" });
  }

  await runStep("home_load", async () => {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await expect(page.getByText("참치가 오늘의 흐름을")).toBeVisible();
    await capture("01-home");
    return { url: page.url() };
  });

  await runStep("fortune_open", async () => {
    await page.getByRole("button", { name: "오늘의 흐름을 볼래요" }).click();
    await expect(page.getByText("오늘의 한 줄 액션")).toBeVisible();
    await capture("02-result");
    return { page: "result" };
  });

  await runStep("save_result", async () => {
    await page.getByRole("button", { name: "결과 저장하기" }).click();
    await expect(page.getByText("결과를 저장했어요.")).toBeVisible();
    return { saved: true };
  });

  await runStep("reward_ad_latency", async () => {
    const start = Date.now();
    await page.getByRole("button", { name: /광고/ }).click();
    await expect(page.getByText("개발용 광고 오버레이")).toBeVisible();
    const latencyMs = Date.now() - start;
    await capture("03-reward-overlay");
    await page.getByRole("button", { name: "보상 받고 닫기" }).click();
    await expect(page.getByText("개발용 광고 오버레이")).toBeHidden();
    return { latencyMs };
  });

  await runStep("collection_open", async () => {
    await page.getByRole("button", { name: "컬렉션 보기" }).click();
    await expect(page.getByText("컬렉션")).toBeVisible();
    await capture("04-collection");
    return { page: "collection" };
  });

  await runStep("back_from_collection", async () => {
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await expect(page.getByText("오늘의 한 줄 액션")).toBeVisible();
    return { page: "result" };
  });

  await runStep("interstitial_latency", async () => {
    const waitMs = Math.max(0, 15100 - (Date.now() - sessionStart));
    if (waitMs > 0) {
      await page.waitForTimeout(waitMs);
    }

    const start = Date.now();
    await page.getByRole("button", { name: "홈으로 돌아가기" }).click();
    await expect(page.getByText("개발용 광고 오버레이")).toBeVisible();
    const latencyMs = Date.now() - start;
    await capture("05-interstitial-overlay");
    await page.getByRole("button", { name: "광고 닫기" }).click();
    await expect(page.getByText("참치가 오늘의 흐름을")).toBeVisible();
    return { latencyMs };
  });

  await runStep("modal_back_priority", async () => {
    await page.getByRole("button", { name: "저장한 결과 다시 열기" }).click();
    await expect(page.getByText("저장한 결과")).toBeVisible();
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await expect(page.getByText("저장한 결과")).toBeHidden();
    return { modalClosedFirst: true };
  });

  await runStep("root_exit_confirm", async () => {
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await expect(page.getByText("정말 종료할까요?")).toBeVisible();
    await page.getByRole("button", { name: "계속 볼게요" }).click();
    await expect(page.getByText("정말 종료할까요?")).toBeHidden();
    return { confirmDialogShown: true };
  });

  await runStep("deep_back_sequence", async () => {
    await page.getByRole("button", { name: "일운을 볼래요" }).click();
    await expect(page.getByText("오늘의 한 줄 액션")).toBeVisible();
    await page.getByRole("button", { name: "컬렉션 보기" }).click();
    await expect(page.getByText("컬렉션")).toBeVisible();
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await expect(page.getByText("오늘의 한 줄 액션")).toBeVisible();
    await page.getByRole("button", { name: "뒤로가기 시뮬레이션" }).click();
    await expect(page.getByText("참치가 오늘의 흐름을")).toBeVisible();
    return { sequence: ["collection", "result", "home"] };
  });

  await runStep("offline_reward_fallback", async () => {
    await page.getByRole("button", { name: "관계운을 볼래요" }).click();
    await expect(page.getByText("오늘의 한 줄 액션")).toBeVisible();
    await context.setOffline(true);
    await page.getByRole("button", { name: /광고/ }).click();
    await expect(page.getByText("개발용 광고 오버레이")).toBeHidden();
    await context.setOffline(false);
    return { fallbackContinued: true };
  });

  const report = {
    consoleErrors,
    pageErrors,
    requestFailures,
    steps,
  };

  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
