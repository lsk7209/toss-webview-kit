import { Storage } from "@apps-in-toss/web-framework";

/**
 * SDK Storage 래퍼
 * 주의: AsyncStorage는 앱인토스에서 사용 불가 (white-out 발생)
 * 반드시 @apps-in-toss/web-framework의 Storage를 사용할 것
 */

/** 저장소에서 값 가져오기 */
export async function getItem(key: string): Promise<string | null> {
  try {
    return await Storage.getItem(key);
  } catch {
    return null;
  }
}

/** 저장소에 값 저장하기 */
export async function setItem(key: string, value: string): Promise<boolean> {
  try {
    await Storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** 저장소에서 값 삭제하기 */
export async function removeItem(key: string): Promise<boolean> {
  try {
    await Storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** 저장소 전체 비우기 */
export async function clearItems(): Promise<boolean> {
  try {
    await Storage.clearItems();
    return true;
  } catch {
    return false;
  }
}
