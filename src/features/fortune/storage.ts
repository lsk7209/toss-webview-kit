import type { FortuneResult } from '@/features/fortune/data';
import { readJSON, writeJSON } from '@/utils/storage';

const STORAGE_PREFIX = 'nyangtarot.v1';
const SAVED_FORTUNES_KEY = `${STORAGE_PREFIX}.saved-fortunes`;
const STATS_KEY = `${STORAGE_PREFIX}.stats`;
const MAX_SAVED_FORTUNES = 20;

export interface SavedFortune extends FortuneResult {
  savedAt: string;
}

export interface VisitStats {
  streakCount: number;
  totalFortunes: number;
  totalVisits: number;
  lastVisitedOn: string | null;
}

export interface VisitBootstrapResult {
  daysSinceLastVisit: number | null;
  isReturning: boolean;
  stats: VisitStats;
}

const DEFAULT_STATS: VisitStats = {
  streakCount: 1,
  totalFortunes: 0,
  totalVisits: 1,
  lastVisitedOn: null,
};

function toDayKey(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function getDayDistance(prevDay: string | null, nextDay: string) {
  if (!prevDay) {
    return null;
  }

  const prev = new Date(prevDay).getTime();
  const next = new Date(nextDay).getTime();
  return Math.round((next - prev) / 86_400_000);
}

export async function loadSavedFortunes() {
  return readJSON<SavedFortune[]>(SAVED_FORTUNES_KEY, []);
}

export async function saveFortune(result: FortuneResult) {
  const saved = await loadSavedFortunes();

  if (saved.some((fortune) => fortune.readingId === result.readingId)) {
    return saved;
  }

  const next = [{ ...result, savedAt: new Date().toISOString() }, ...saved].slice(
    0,
    MAX_SAVED_FORTUNES,
  );

  await writeJSON(SAVED_FORTUNES_KEY, next);
  return next;
}

export async function bootstrapVisitStats(now = new Date()): Promise<VisitBootstrapResult> {
  const current = await readJSON<VisitStats>(STATS_KEY, DEFAULT_STATS);
  const today = toDayKey(now);
  const daysSinceLastVisit = getDayDistance(current.lastVisitedOn, today);

  if (current.lastVisitedOn === today) {
    return {
      daysSinceLastVisit,
      isReturning: current.lastVisitedOn != null,
      stats: current,
    };
  }

  const streakCount =
    daysSinceLastVisit === 1 ? current.streakCount + 1 : DEFAULT_STATS.streakCount;

  const next = {
    ...current,
    lastVisitedOn: today,
    streakCount,
    totalVisits: current.totalVisits + 1,
  };

  await writeJSON(STATS_KEY, next);

  return {
    daysSinceLastVisit,
    isReturning: current.lastVisitedOn != null,
    stats: next,
  };
}

export async function bumpFortuneCount() {
  const current = await readJSON<VisitStats>(STATS_KEY, DEFAULT_STATS);
  const next = {
    ...current,
    totalFortunes: current.totalFortunes + 1,
  };

  await writeJSON(STATS_KEY, next);
  return next;
}
