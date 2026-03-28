import { share } from "@apps-in-toss/web-framework";

/**
 * 토스 앱 외부(카카오톡 등)로 공유하기
 * 공식 API: share({ message: string })
 */
export async function shareMessage(message: string): Promise<boolean> {
  try {
    await share({ message });
    return true;
  } catch {
    return false;
  }
}
