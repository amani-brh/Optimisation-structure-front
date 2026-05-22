/**
 * EN 1991-1-4 (Eurocode 1) — wind action calculation helpers.
 * Ported from the legacy WindCalc PRO HTML/JS.
 */

export type TerrainCat = '0' | 'II' | 'IIIa' | 'IIIb' | 'IV';

/** [z0, zmin] per terrain category */
export const TERRAIN_TABLE: Record<TerrainCat, [number, number]> = {
  '0': [0.005, 1],
  II: [0.05, 2],
  IIIa: [0.2, 5],
  IIIb: [0.5, 9],
  IV: [1, 15],
};

export interface CoreInput {
  b: number;
  d: number;
  h: number;
  apct: number;
  cat: TerrainCat;
  vb0: number;
  C0: number;
  Cdir: number;
  Csea: number;
  rho: number;
}

export interface CoreResult {
  z0: number;
  zmin: number;
  kr: number;
  Cr: number;
  kl: number;
  Ce: number;
  Vb: number;
  qb: number;
  qp: number;
  ht: number;
  F: number;
  adeg: number;
  e: number;
  hd1: number;
  hd2: number;
}

export function ec1Core(p: CoreInput): CoreResult {
  const { b, d, h, apct, cat, vb0, C0, Cdir, Csea, rho } = p;
  const [z0, zmin] = TERRAIN_TABLE[cat];
  const z02 = 0.05;
  const kr = 0.19 * (z0 / z02) ** 0.07;
  const adeg = (Math.atan(apct / 100) * 180) / Math.PI;
  const F = (b / 2) * Math.tan((adeg * Math.PI) / 180);
  const ht = h + F;
  const Ze = Math.max(ht, zmin);
  const Cr = kr * Math.log(Ze / z0);
  const kl = C0 * (1 - 0.0002 * (Math.log10(z0) + 3) ** 6);
  const Ce = (1 + (7 * kl * kr) / (C0 * Cr)) * (C0 * Cr) ** 2;
  const Vb = Cdir * Csea * vb0;
  const qb = (0.5 * rho * Vb ** 2) / 10;
  const qp = qb * Ce;
  return {
    z0,
    zmin,
    kr,
    Cr,
    kl,
    Ce,
    Vb,
    qb,
    qp,
    ht,
    F,
    adeg,
    e: Math.min(b, 2 * ht),
    hd1: ht / d,
    hd2: ht / b,
  };
}

export type WallZone = 'A' | 'B' | 'C' | 'D' | 'E';
export type RoofZone = 'F' | 'G' | 'H' | 'I' | 'J';

export type WallCpe = Record<WallZone, number>;
export type RoofCpe = Record<RoofZone, number>;

/** Linear interpolation between h/d=0.25 and h/d=1 (Table 7.1) */
export function cpeMurs(hd: number): WallCpe {
  const lo: WallCpe = { A: -1.2, B: -0.8, C: -0.5, D: 0.7, E: -0.3 };
  const hi: WallCpe = { A: -1.2, B: -0.8, C: -0.5, D: 0.8, E: -0.5 };
  if (hd <= 0.25) return lo;
  if (hd >= 1) return hi;
  const t = (hd - 0.25) / 0.75;
  const r: Partial<WallCpe> = {};
  (Object.keys(lo) as WallZone[]).forEach((k) => {
    r[k] = lo[k] + t * (hi[k] - lo[k]);
  });
  return r as WallCpe;
}

/** Interpolate roof Cpe values for given angle (Table 7.4a) */
export function cpeToit(a: number): RoofCpe {
  const T: Record<number, RoofCpe> = {
    5: { F: -1.7, G: -1.2, H: -0.6, I: -0.6, J: 0.2 },
    15: { F: -0.9, G: -0.8, H: -0.3, I: -0.4, J: -1 },
    30: { F: -0.5, G: -0.5, H: -0.2, I: -0.4, J: -0.5 },
    45: { F: 0, G: 0, H: 0, I: -0.2, J: -0.3 },
  };
  const ks = [5, 15, 30, 45];
  if (a <= 5) return T[5];
  if (a >= 45) return T[45];
  for (let i = 0; i < ks.length - 1; i++) {
    if (a <= ks[i + 1]) {
      const t = (a - ks[i]) / (ks[i + 1] - ks[i]);
      const r: Partial<RoofCpe> = {};
      (Object.keys(T[ks[i]]) as RoofZone[]).forEach((k) => {
        r[k] = T[ks[i]][k] + t * (T[ks[i + 1]][k] - T[ks[i]][k]);
      });
      return r as RoofCpe;
    }
  }
  return T[45];
}

export interface ForcePair {
  f1: number; // Cpi = +Cp1
  f2: number; // Cpi = +Cp2
}

export function calcForces<T extends WallZone | RoofZone>(
  cpe: Record<T, number>,
  CsCd: number,
  qp: number,
  Cp1: number,
  Cp2: number,
): Record<T, ForcePair> {
  const out: Partial<Record<T, ForcePair>> = {};
  (Object.keys(cpe) as T[]).forEach((k) => {
    out[k] = {
      f1: +(CsCd * qp * cpe[k] - qp * Cp1).toFixed(3),
      f2: +(CsCd * qp * cpe[k] - qp * Cp2).toFixed(3),
    };
  });
  return out as Record<T, ForcePair>;
}
