import { Storage } from '@apps-in-toss/web-framework';

async function readFromSdk(key: string) {
  try {
    return await Storage.getItem(key);
  } catch {
    return null;
  }
}

function readFromLocal(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

async function writeToSdk(key: string, value: string) {
  try {
    await Storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function writeToLocal(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export async function getItem(key: string) {
  const sdkValue = await readFromSdk(key);
  return sdkValue ?? readFromLocal(key);
}

export async function setItem(key: string, value: string) {
  const storedBySdk = await writeToSdk(key, value);
  if (storedBySdk) {
    return true;
  }
  return writeToLocal(key, value);
}

export async function removeItem(key: string) {
  try {
    await Storage.removeItem(key);
  } catch {}

  try {
    window.localStorage.removeItem(key);
  } catch {}

  return true;
}

export async function readJSON<T>(key: string, fallback: T) {
  const stored = await getItem(key);

  if (!stored) {
    return fallback;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: string, value: T) {
  await setItem(key, JSON.stringify(value));
}
