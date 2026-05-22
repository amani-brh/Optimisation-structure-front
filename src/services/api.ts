import type { OptimizationReport } from '../types/optimization';

/**
 * Base URL of the backend. In dev we proxy through Vite (see vite.config.ts),
 * so a relative path works in both dev and prod when served behind the same host.
 *
 * If you prefer to hit the API directly, replace `''` with
 *   'https://localhost:5001'
 */
const BASE_URL = '';

export async function fetchOptimizations(): Promise<OptimizationReport[]> {
  const res = await fetch(`${BASE_URL}/api/v1/Reports/optimizations`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(
      `Échec du chargement des optimisations (HTTP ${res.status} ${res.statusText})`,
    );
  }

  const data = (await res.json()) as OptimizationReport[];
  return data;
}
