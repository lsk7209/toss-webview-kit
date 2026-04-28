import { share } from '@apps-in-toss/web-framework';

export async function shareMessage(message: string) {
  try {
    await share({ message });
    return true;
  } catch {
    if (typeof navigator.share === 'function') {
      await navigator.share({ text: message });
      return true;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
      return true;
    }

    return false;
  }
}
