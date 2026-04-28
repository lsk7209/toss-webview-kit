import { getAnonymousKey } from '@apps-in-toss/web-framework';

/**
 * 비게임 미니앱 유저 식별키 발급
 *
 * 서버 구축 없이, 사용자 동의 없이 유저를 식별할 수 있어요.
 * 같은 유저는 항상 동일한 해시 키를 반환해요.
 *
 * 공식 문서: https://developers-apps-in-toss.toss.im/game-login/intro.md
 *
 * @returns 유저 식별 해시 키 | null (앱 버전 미지원 또는 오류 시)
 */
export async function getAnonymousUserKey(): Promise<string | null> {
  const result = await getAnonymousKey();

  if (!result) {
    // 토스 앱 버전이 최소 지원 버전보다 낮아요
    return null;
  }

  if (result === 'ERROR') {
    return null;
  }

  return result.hash;
}
