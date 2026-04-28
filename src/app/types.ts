import type { FortuneResult } from '@/features/fortune/data';

export type AppRoute =
  | { page: 'home' }
  | { page: 'result'; result: FortuneResult }
  | { page: 'collection' };

export const HOME_ROUTE: AppRoute = { page: 'home' };
