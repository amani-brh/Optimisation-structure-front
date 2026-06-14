import { useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────────
interface ProfileData {
  h: number; b: number; tw?: number; tf?: number; r?: number;
  A: number; Iy?: number; Iz?: number; iy?: number; iz?: number;
  Wely?: number; Welz?: number; Wply?: number; Wplz?: number;
  It?: number; Iw?: number;
  t?: number; r1?: number; r2?: number;
  LIyz?: number; Liyz?: number; LWelyz?: number;
  LIu?: number; Liu?: number; LIyz2?: number; LIv?: number; Liv?: number;
}

type Curve = 'a' | 'b' | 'c' | 'd';
type Liaison = 'Articulé-Articulé' | 'Encastré-Articulé' | 'Encastré-Encastré';
type ProfileType = 'Poutrelles I européennes' | 'Cornières' | 'Fers U';

interface Results {
  fy: number; lam1: number;
  Lfy: number; Lfz: number;
  lamy: number; lamz: number;
  lamyb: number; lamzb: number;
  courbeY: Curve; courbeZ: Curve;
  ay: number; az: number;
  phiy: number; phiz: number;
  chiy: number; chiz: number;
  lammax: number; chimin: number;
  NcRd: number; ratio: number; ok: boolean;
  Areq: number; secRecomm: string;
}

// ─── Profile Database ────────────────────────────────────────────────────────────
const PROFILES: Record<string, Record<string, ProfileData>> = {
  IPE: {
    IPE80:  {h:80,  b:46, tw:3.8,tf:5.2, r:5, A:7.64, Iy:80.1, Iz:8.49, iy:3.24,iz:1.05,Wely:20.0,Welz:3.69, Wply:23.2, Wplz:5.82, It:0.70,Iw:0.126},
    IPE100: {h:100, b:55, tw:4.1,tf:5.7, r:7, A:10.3, Iy:171,  Iz:15.9, iy:4.07,iz:1.24,Wely:34.2,Welz:5.79, Wply:39.4, Wplz:9.14, It:1.20,Iw:0.348},
    IPE120: {h:120, b:64, tw:4.4,tf:6.3, r:7, A:13.2, Iy:318,  Iz:27.7, iy:4.90,iz:1.45,Wely:53.0,Welz:8.65, Wply:60.7, Wplz:13.6, It:1.74,Iw:0.889},
    IPE140: {h:140, b:73, tw:4.7,tf:6.9, r:7, A:16.4, Iy:541,  Iz:44.9, iy:5.74,iz:1.65,Wely:77.3,Welz:12.3, Wply:88.3, Wplz:19.2, It:2.45,Iw:1.98},
    IPE160: {h:160, b:82, tw:5.0,tf:7.4, r:9, A:20.1, Iy:869,  Iz:68.3, iy:6.58,iz:1.84,Wely:109, Welz:16.7, Wply:124,  Wplz:26.1, It:3.60,Iw:3.96},
    IPE180: {h:180, b:91, tw:5.3,tf:8.0, r:9, A:23.9, Iy:1320, Iz:101,  iy:7.42,iz:2.05,Wely:146, Welz:22.2, Wply:166,  Wplz:34.6, It:4.79,Iw:7.43},
    IPE200: {h:200, b:100,tw:5.6,tf:8.5, r:12,A:28.5, Iy:1940, Iz:142,  iy:8.26,iz:2.24,Wely:194, Welz:28.5, Wply:221,  Wplz:44.6, It:6.98,Iw:12.99},
    IPE220: {h:220, b:110,tw:5.9,tf:9.2, r:12,A:33.4, Iy:2770, Iz:205,  iy:9.11,iz:2.48,Wely:252, Welz:37.3, Wply:285,  Wplz:58.1, It:9.07,Iw:22.7},
    IPE240: {h:240, b:120,tw:6.2,tf:9.8, r:15,A:39.1, Iy:3890, Iz:284,  iy:9.97,iz:2.69,Wely:324, Welz:47.3, Wply:367,  Wplz:73.9, It:12.9,Iw:37.4},
    IPE270: {h:270, b:135,tw:6.6,tf:10.2,r:15,A:45.9, Iy:5790, Iz:420,  iy:11.2,iz:3.02,Wely:429, Welz:62.2, Wply:484,  Wplz:96.9, It:15.9,Iw:70.6},
    IPE300: {h:300, b:150,tw:7.1,tf:10.7,r:15,A:53.8, Iy:8360, Iz:604,  iy:12.5,iz:3.35,Wely:557, Welz:80.5, Wply:628,  Wplz:125,  It:20.1,Iw:126},
    IPE330: {h:330, b:160,tw:7.5,tf:11.5,r:18,A:62.6, Iy:11770,Iz:788,  iy:13.7,iz:3.55,Wely:713, Welz:98.5, Wply:804,  Wplz:154,  It:28.2,Iw:199},
    IPE360: {h:360, b:170,tw:8.0,tf:12.7,r:18,A:72.7, Iy:16270,Iz:1040, iy:15.0,iz:3.79,Wely:904, Welz:123,  Wply:1019, Wplz:191,  It:37.3,Iw:314},
    IPE400: {h:400, b:180,tw:8.6,tf:13.5,r:21,A:84.5, Iy:23130,Iz:1320, iy:16.5,iz:3.95,Wely:1160,Welz:146,  Wply:1307, Wplz:229,  It:51.1,Iw:490},
    IPE450: {h:450, b:190,tw:9.4,tf:14.6,r:21,A:98.8, Iy:33740,Iz:1680, iy:18.5,iz:4.12,Wely:1500,Welz:176,  Wply:1702, Wplz:276,  It:66.9,Iw:791},
    IPE500: {h:500, b:200,tw:10.2,tf:16.0,r:21,A:116,  Iy:48200,Iz:2140, iy:20.4,iz:4.31,Wely:1928,Welz:214,  Wply:2194, Wplz:336,  It:89.3,Iw:1249},
    IPE550: {h:550, b:210,tw:11.1,tf:17.2,r:24,A:134,  Iy:67120,Iz:2670, iy:22.3,iz:4.45,Wely:2440,Welz:254,  Wply:2787, Wplz:401,  It:123, Iw:1864},
    IPE600: {h:600, b:220,tw:12.0,tf:19.0,r:24,A:156,  Iy:92080,Iz:3390, iy:24.3,iz:4.66,Wely:3069,Welz:308,  Wply:3512, Wplz:486,  It:165, Iw:2846},
  },
  HEA: {
    HEA100:{h:96, b:100,tw:5,  tf:8,  r:12,A:21.2,Iy:349,  Iz:134,  iy:4.06,iz:2.51,Wely:72.8, Welz:26.8,Wply:83.0, Wplz:41.1,It:5.24,Iw:50},
    HEA120:{h:114,b:120,tw:5,  tf:8,  r:12,A:25.3,Iy:606,  Iz:231,  iy:4.89,iz:3.02,Wely:106,  Welz:38.5,Wply:120,  Wplz:58.8,It:5.99,Iw:112},
    HEA140:{h:133,b:140,tw:5.5,tf:8.5,r:12,A:31.4,Iy:1033, Iz:389,  iy:5.73,iz:3.52,Wely:155,  Welz:55.6,Wply:173,  Wplz:84.8,It:8.13,Iw:230},
    HEA160:{h:152,b:160,tw:6,  tf:9,  r:15,A:38.8,Iy:1673, Iz:616,  iy:6.57,iz:3.98,Wely:220,  Welz:77.0,Wply:245,  Wplz:117, It:12.2,Iw:433},
    HEA180:{h:171,b:180,tw:6,  tf:9.5,r:15,A:45.3,Iy:2510, Iz:925,  iy:7.45,iz:4.52,Wely:294,  Welz:103, Wply:325,  Wplz:156, It:14.8,Iw:748},
    HEA200:{h:190,b:200,tw:6.5,tf:10, r:18,A:53.8,Iy:3692, Iz:1336, iy:8.28,iz:4.98,Wely:389,  Welz:134, Wply:429,  Wplz:204, It:21.1,Iw:1220},
    HEA220:{h:210,b:220,tw:7,  tf:11, r:18,A:64.3,Iy:5410, Iz:1955, iy:9.17,iz:5.51,Wely:515,  Welz:178, Wply:568,  Wplz:270, It:28.5,Iw:2040},
    HEA240:{h:230,b:240,tw:7.5,tf:12, r:21,A:76.8,Iy:7763, Iz:2769, iy:10.1,iz:6.00,Wely:675,  Welz:231, Wply:745,  Wplz:351, It:41.6,Iw:3290},
    HEA260:{h:250,b:260,tw:7.5,tf:12.5,r:24,A:86.8,Iy:10450,Iz:3668,iy:11.0,iz:6.50,Wely:836,  Welz:282, Wply:919,  Wplz:430, It:52.4,Iw:4910},
    HEA280:{h:270,b:280,tw:8,  tf:13, r:24,A:97.3,Iy:13670,Iz:4763, iy:11.9,iz:7.00,Wely:1013, Welz:340, Wply:1112, Wplz:518, It:62.7,Iw:7060},
    HEA300:{h:290,b:300,tw:8.5,tf:14, r:27,A:112, Iy:18260,Iz:6310, iy:12.8,iz:7.49,Wely:1260, Welz:421, Wply:1383, Wplz:641, It:85.2,Iw:10670},
  },
  HEB: {
    HEB100:{h:100,b:100,tw:6,  tf:10, r:12,A:26.0,Iy:450,  Iz:167,  iy:4.16,iz:2.53,Wely:89.9, Welz:33.5,Wply:104,  Wplz:51.4,It:9.25,Iw:67},
    HEB120:{h:120,b:120,tw:6.5,tf:11, r:12,A:34.0,Iy:864,  Iz:318,  iy:5.04,iz:3.06,Wely:144,  Welz:52.9,Wply:165,  Wplz:80.9,It:13.8,Iw:165},
    HEB140:{h:140,b:140,tw:7,  tf:12, r:12,A:43.0,Iy:1509, Iz:550,  iy:5.93,iz:3.58,Wely:215,  Welz:78.5,Wply:245,  Wplz:119, It:20.1,Iw:357},
    HEB160:{h:160,b:160,tw:8,  tf:13, r:15,A:54.3,Iy:2492, Iz:889,  iy:6.78,iz:4.05,Wely:311,  Welz:111, Wply:354,  Wplz:170, It:31.2,Iw:679},
    HEB180:{h:180,b:180,tw:8.5,tf:14, r:15,A:65.3,Iy:3831, Iz:1363, iy:7.66,iz:4.57,Wely:426,  Welz:151, Wply:481,  Wplz:231, It:42.2,Iw:1140},
    HEB200:{h:200,b:200,tw:9,  tf:15, r:18,A:78.1,Iy:5696, Iz:2003, iy:8.54,iz:5.07,Wely:570,  Welz:200, Wply:642,  Wplz:306, It:59.3,Iw:1790},
    HEB220:{h:220,b:220,tw:9.5,tf:16, r:18,A:91.0,Iy:8091, Iz:2843, iy:9.43,iz:5.59,Wely:736,  Welz:258, Wply:827,  Wplz:395, It:76.4,Iw:2840},
    HEB240:{h:240,b:240,tw:10, tf:17, r:21,A:106, Iy:11260,Iz:3923, iy:10.3,iz:6.08,Wely:938,  Welz:327, Wply:1053, Wplz:498, It:102, Iw:4250},
    HEB260:{h:260,b:260,tw:10, tf:17.5,r:24,A:118,Iy:14920,Iz:5135, iy:11.2,iz:6.58,Wely:1148, Welz:395, Wply:1283, Wplz:602, It:124, Iw:6280},
    HEB280:{h:280,b:280,tw:10.5,tf:18,r:24,A:131, Iy:19270,Iz:6595, iy:12.1,iz:7.09,Wely:1376, Welz:471, Wply:1534, Wplz:718, It:144, Iw:8980},
    HEB300:{h:300,b:300,tw:11, tf:19, r:27,A:149, Iy:25170,Iz:8563, iy:13.0,iz:7.58,Wely:1678, Welz:571, Wply:1869, Wplz:870, It:185, Iw:12990},
  },
  UPN: {
    UPN80: {h:80, b:45,tw:6,  tf:8,  r:8,  A:11.0,Iy:106, Iz:19.4,iy:3.10,iz:1.33,Wely:26.5,Welz:6.36, Wply:32.4,Wplz:10.5,It:2.87},
    UPN100:{h:100,b:50,tw:6,  tf:8.5,r:8.5,A:13.5,Iy:206, Iz:29.3,iy:3.91,iz:1.47,Wely:41.2,Welz:8.49, Wply:50.9,Wplz:13.8,It:3.68},
    UPN120:{h:120,b:55,tw:7,  tf:9,  r:9,  A:17.0,Iy:364, Iz:43.2,iy:4.62,iz:1.59,Wely:60.7,Welz:11.1, Wply:75.3,Wplz:18.3,It:5.95},
    UPN140:{h:140,b:60,tw:7,  tf:10, r:10, A:20.4,Iy:605, Iz:62.7,iy:5.45,iz:1.75,Wely:86.4,Welz:14.8, Wply:108, Wplz:24.5,It:7.27},
    UPN160:{h:160,b:65,tw:7.5,tf:10.5,r:10.5,A:24.0,Iy:925,Iz:85.3,iy:6.21,iz:1.89,Wely:116,Welz:18.3, Wply:145, Wplz:30.2,It:9.57},
    UPN180:{h:180,b:70,tw:8,  tf:11, r:11, A:28.0,Iy:1350,Iz:114, iy:6.95,iz:2.02,Wely:150,Welz:22.4, Wply:187, Wplz:37.0,It:12.9},
    UPN200:{h:200,b:75,tw:8.5,tf:11.5,r:11.5,A:32.2,Iy:1910,Iz:148,iy:7.70,iz:2.14,Wely:191,Welz:27.0, Wply:239, Wplz:44.7,It:16.8},
    UPN220:{h:220,b:80,tw:9,  tf:12.5,r:12.5,A:37.4,Iy:2690,Iz:196,iy:8.48,iz:2.29,Wely:245,Welz:49.0, Wply:283, Wplz:77.0,It:36.0},
    UPN240:{h:240,b:85,tw:9.5,tf:13, r:13, A:42.3,Iy:3600,Iz:248, iy:9.22,iz:2.42,Wely:300,Welz:40.1, Wply:380, Wplz:67.7,It:26.0},
    UPN260:{h:260,b:90,tw:10, tf:14, r:14, A:48.3,Iy:4820,Iz:317, iy:9.99,iz:2.56,Wely:371,Welz:48.6, Wply:470, Wplz:82.0,It:32.9},
    UPN280:{h:280,b:95,tw:10, tf:15, r:15, A:53.3,Iy:6280,Iz:399, iy:10.9,iz:2.74,Wely:448,Welz:57.2, Wply:571, Wplz:97.3,It:41.7},
    UPN300:{h:300,b:100,tw:10,tf:16, r:16, A:58.8,Iy:8030,Iz:495, iy:11.7,iz:2.90,Wely:535,Welz:67.8, Wply:682, Wplz:115, It:52.9},
  },
  L: {
    'L40x40x4':    {h:40, b:40, t:4,  r1:5,  r2:2.5,A:3.08, LIyz:9.32, Liyz:1.55,LWelyz:2.98, LIu:14.76,Liu:1.95,LIyz2:-5.10,  LIv:3.82,  Liv:0.99},
    'L45x45x4.5':  {h:45, b:45, t:4.5,r1:5.5,r2:2.75,A:3.90,LIyz:13.5, Liyz:1.74,LWelyz:3.88, LIu:21.4, Liu:2.34,LIyz2:-7.44,  LIv:5.56,  Liv:1.19},
    'L50x50x5':    {h:50, b:50, t:5,  r1:7,  r2:3.5,A:4.80, LIyz:20.5, Liyz:2.07,LWelyz:5.27, LIu:32.5, Liu:2.60,LIyz2:-11.3,  LIv:8.46,  Liv:1.33},
    'L60x60x6':    {h:60, b:60, t:6,  r1:8,  r2:4,  A:6.91, LIyz:42.0, Liyz:2.46,LWelyz:9.00, LIu:66.8, Liu:3.11,LIyz2:-23.2,  LIv:17.3,  Liv:1.58},
    'L70x70x7':    {h:70, b:70, t:7,  r1:9,  r2:4.5,A:9.40, LIyz:79.9, Liyz:2.92,LWelyz:14.8, LIu:127,  Liu:3.68,LIyz2:-44.1,  LIv:32.8,  Liv:1.87},
    'L80x80x8':    {h:80, b:80, t:8,  r1:10, r2:5,  A:12.3, LIyz:138,  Liyz:3.35,LWelyz:22.3, LIu:219,  Liu:4.23,LIyz2:-76.0,  LIv:56.7,  Liv:2.15},
    'L90x90x9':    {h:90, b:90, t:9,  r1:11, r2:5.5,A:15.5, LIyz:221,  Liyz:3.78,LWelyz:31.8, LIu:352,  Liu:4.77,LIyz2:-122,   LIv:90.7,  Liv:2.42},
    'L100x100x10': {h:100,b:100,t:10, r1:12, r2:6,  A:19.2, LIyz:339,  Liyz:4.20,LWelyz:45.5, LIu:539,  Liu:5.30,LIyz2:-186,   LIv:139,   Liv:2.69},
    'L120x120x12': {h:120,b:120,t:12, r1:13, r2:6.5,A:27.5, LIyz:703,  Liyz:5.05,LWelyz:80.4, LIu:1117, Liu:6.37,LIyz2:-386,   LIv:289,   Liv:3.24},
    'L150x150x15': {h:150,b:150,t:15, r1:16, r2:8,  A:43.0, LIyz:1736, Liyz:6.36,LWelyz:161,  LIu:2756, Liu:8.00,LIyz2:-952,   LIv:711,   Liv:4.07},
  },
};

const SERIES_BY_FAMILY: Record<string, string[]> = {
  I: ['HEA', 'HEB', 'IPE'],
  U: ['UPN'],
  L: ['L'],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────────
const ALPHA_MAP: Record<Curve, number> = { a: 0.21, b: 0.34, c: 0.49, d: 0.76 };

function getK(liaison: Liaison): number {
  if (liaison === 'Encastré-Encastré') return 0.5;
  if (liaison === 'Encastré-Articulé') return 0.7;
  return 1.0;
}

function getFy(nuance: string, t: number): number {
  const s = parseInt(nuance.replace('S', ''));
  if (t <= 16) return s;
  if (t <= 40) return s === 235 ? 225 : s === 275 ? 265 : 345;
  if (t <= 63) return s === 235 ? 215 : s === 275 ? 255 : 335;
  return s === 235 ? 215 : s === 275 ? 255 : 325;
}

function getCurves(profType: ProfileType, h: number, b: number, tf: number): [Curve, Curve] {
  if (profType === 'Poutrelles I européennes') {
    const hb = h / b;
    if (hb > 1.2 && tf < 40) return ['a', 'b'];
    if (hb > 1.2) return ['b', 'c'];
    if (tf < 40) return ['b', 'c'];
    return ['d', 'd'];
  }
  return ['c', 'c'];
}

function suggestSection(Areq: number, profType: ProfileType): string {
  const db = profType === 'Fers U' ? PROFILES.UPN : PROFILES.IPE;
  let best = '(à déterminer)', bestA = Infinity;
  for (const [name, p] of Object.entries(db)) {
    if (p.A >= Areq && p.A < bestA) { bestA = p.A; best = name; }
  }
  return best;
}

// Mirrors generer_html() from Flambement.py — generates a professional HTML report
function generateHtmlReport(r: Results, inputs: ReturnType<typeof buildInputsSnapshot>): void {
  const ok = r.ok;
  const date = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Note de calcul EC3 – Flambement</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;background:#f5f7fa;color:#2c3e50;padding:30px 20px}
.container{max-width:960px;margin:0 auto;background:white;border:1px solid #d1d9e6;padding:35px 40px;box-shadow:0 5px 15px rgba(0,0,0,.05)}
h1{font-size:22px;font-weight:600;color:#1e3d58;border-left:6px solid #2c7a7b;padding-left:14px;margin-bottom:10px}
h2{font-size:15px;font-weight:600;color:#1e3d58;margin:28px 0 10px;border-bottom:1px solid #b0c4ce;padding-bottom:4px}
.meta{display:flex;justify-content:space-between;background:#ecf3f0;padding:10px 16px;margin-bottom:20px;border:1px solid #cbd5e0;font-size:13px}
.badge{background:#2c7a7b;color:white;padding:3px 12px;font-weight:600;font-size:12px}
table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}
th{background:#2c5f73;color:white;padding:8px;text-align:left;border:1px solid #1f4757}
td{padding:7px 8px;border:1px solid #e2e8f0}
tr:nth-child(even) td{background:#f9fbfd}
.card{border:1px solid #dce5ec;padding:16px 20px;margin-bottom:18px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-bottom:8px}
.field strong{color:#1f5f5f;display:block;font-size:11px;margin-bottom:2px}
.formula{background:#f2f6f9;padding:12px 16px;border:1px solid #cddae5;margin:12px 0;font-size:14px}
.result-box{text-align:center;padding:20px;border:1px solid;margin-top:20px}
.ok{border-color:#1f7a4c;background:#ecf7f0;color:#1f7a4c}
.ko{border-color:#b34141;background:#fdf0f0;color:#b34141}
.ratio{font-family:monospace;font-size:22px;font-weight:700;display:block;margin:8px 0}
.footer{margin-top:30px;text-align:center;font-size:11px;color:#5f6c7a;border-top:1px solid #d0dbe8;padding-top:16px}
@media print{body{padding:0}button{display:none}}
</style></head><body>
<div class="container">
<button onclick="window.print()" style="float:right;background:#2c7a7b;color:white;border:none;padding:8px 18px;cursor:pointer;font-size:13px;margin-bottom:10px">📄 Imprimer / PDF</button>
<h1>NOTE DE CALCUL – EUROCODE 3</h1>
<div class="meta"><span>${date}</span><span class="badge">Flambement • EC3 §6.3.1</span></div>

<h2>1. Données d'entrée</h2>
<div class="card"><div class="grid">
<div class="field"><strong>Nuance / fy</strong>${inputs.nuance} — fy = ${r.fy} MPa</div>
<div class="field"><strong>Effort N_Ed</strong>${inputs.N} kN</div>
<div class="field"><strong>Type profilé</strong>${inputs.profType}</div>
<div class="field"><strong>A</strong>${inputs.A} cm²</div>
<div class="field"><strong>iy / iz</strong>${inputs.iy} / ${inputs.iz} *10mm (cm)</div>
<div class="field"><strong>h × b × tf</strong>${inputs.h} × ${inputs.b} × ${inputs.tf} mm</div>
<div class="field"><strong>Ly / Lz</strong>${inputs.Ly} / ${inputs.Lz} m</div>
<div class="field"><strong>ky / kz</strong>${inputs.ky.toFixed(3)} / ${inputs.kz.toFixed(3)}</div>
<div class="field"><strong>γM0 / γM1</strong>${inputs.gamma0} / ${inputs.gamma1}</div>
<div class="field"><strong>E</strong>${inputs.E} MPa</div>
</div></div>

<h2>2. Calculs intermédiaires</h2>
<div class="card">
<div class="formula"><b>λ₁</b> = π × √(E/fy) = π × √(${inputs.E}/${r.fy}) = <b>${r.lam1.toFixed(3)}</b></div>
<table>
<thead><tr><th>Paramètre</th><th>Plan xz (y-y)</th><th>Plan xy (z-z)</th></tr></thead>
<tbody>
<tr><td>Lf (m)</td><td>${r.Lfy.toFixed(3)}</td><td>${r.Lfz.toFixed(3)}</td></tr>
<tr><td>λ = Lf×1000/(i×10)</td><td>${r.lamy.toFixed(3)}</td><td>${r.lamz.toFixed(3)}</td></tr>
<tr><td>λ̄ = λ / λ₁</td><td>${r.lamyb.toFixed(4)}</td><td>${r.lamzb.toFixed(4)}</td></tr>
<tr><td>Courbe de flambement</td><td>${r.courbeY}</td><td>${r.courbeZ}</td></tr>
<tr><td>α (imperfection)</td><td>${r.ay.toFixed(2)}</td><td>${r.az.toFixed(2)}</td></tr>
<tr><td>φ = 0.5[1+α(λ̄−0.2)+λ̄²]</td><td>${r.phiy.toFixed(5)}</td><td>${r.phiz.toFixed(5)}</td></tr>
<tr><td>χ = 1/[φ+√(φ²−λ̄²)]</td><td>${r.chiy.toFixed(5)}</td><td>${r.chiz.toFixed(5)}</td></tr>
</tbody>
</table></div>

<h2>3. Résistance au flambement</h2>
<div class="card">
<div class="formula">
<b>χ_min</b> = min(χy, χz) = min(${r.chiy.toFixed(5)}, ${r.chiz.toFixed(5)}) = <b>${r.chimin.toFixed(5)}</b><br>
<b>Nc,Rd</b> = χ_min × A × fy / γM1 = ${r.chimin.toFixed(5)} × ${inputs.A} × ${r.fy} / ${inputs.gamma1} = <b>${r.NcRd.toFixed(3)} kN</b>
</div>
<div class="result-box ${ok ? 'ok' : 'ko'}">
<span class="ratio">N_Ed / Nc,Rd = ${r.ratio.toFixed(4)}</span>
<b>${ok ? '✓ N_Ed ≤ Nc,Rd — CONDITION SATISFAITE' : '✗ N_Ed > Nc,Rd — CONDITION NON SATISFAITE'}</b>
</div></div>

<div class="footer">EC3 Checker — Note de calcul générée automatiquement — NF EN 1993-1-1 §6.3.1<br>λ₁ = π√(E/fy) — χ = min(χy, χz) — γM1 = ${inputs.gamma1}</div>
</div></body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); }
}

function buildInputsSnapshot(form: FormState) {
  return {
    nuance: form.nuance,
    N: form.N,
    profType: form.profType,
    A: form.A,
    iy: form.iy,
    iz: form.iz,
    h: form.h,
    b: form.b,
    tf: form.tf,
    Ly: form.Ly,
    Lz: form.Lz,
    ky: getK(form.liaisonY),
    kz: getK(form.liaisonZ),
    gamma0: form.gamma0,
    gamma1: form.gamma1,
    E: form.E,
  };
}

// ─── Form state ───────────────────────────────────────────────────────────────────
interface FormState {
  N: number; nuance: string;
  gamma0: number; gamma1: number; E: number;
  profType: ProfileType;
  Ly: number; Lz: number;
  A: number; iy: number; iz: number;
  h: number; b: number; tf: number; tw: number; classe: number;
  liaisonY: Liaison; kyAuto: boolean; kyManual: number;
  liaisonZ: Liaison; kzAuto: boolean; kzManual: number;
}

const DEFAULT_FORM: FormState = {
  N: 106, nuance: 'S275',
  gamma0: 1.0, gamma1: 1.1, E: 210000,
  profType: 'Poutrelles I européennes',
  Ly: 2.1, Lz: 1.68,
  A: 37.4, iy: 8.48, iz: 2.29,
  h: 220, b: 80, tf: 12.5, tw: 9, classe: 1,
  liaisonY: 'Articulé-Articulé', kyAuto: true, kyManual: 1.0,
  liaisonZ: 'Articulé-Articulé', kzAuto: true, kzManual: 1.0,
};

// ─── Catalogue state ──────────────────────────────────────────────────────────────
interface CatState {
  family: string; series: string; profile: string; classe: number | null;
}

// ─── Main Component ───────────────────────────────────────────────────────────────
export default function FlambementPage() {
  const [tab, setTab] = useState<'flamb' | 'cat'>('flamb');
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [results, setResults] = useState<Results | null>(null);
  const [cat, setCat] = useState<CatState>({ family: 'I', series: 'HEA', profile: 'HEA200', classe: null });

  const setF = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const ky = form.kyAuto ? getK(form.liaisonY) : form.kyManual;
  const kz = form.kzAuto ? getK(form.liaisonZ) : form.kzManual;

  // ── Calculation ──────────────────────────────────────────────────────────────────
  function calculate() {
    const { nuance, profType, tf, tw, h, b, A, iy, iz, N, gamma0, gamma1, E, Ly, Lz } = form;
    const t_ref = profType === 'Poutrelles I européennes' ? Math.min(tf, tw || tf) : tf;
    const fy = getFy(nuance, t_ref);

    const [courbeY, courbeZ] = getCurves(profType, h, b, tf);
    const ay = ALPHA_MAP[courbeY];
    const az = ALPHA_MAP[courbeZ];

    const lam1 = Math.PI * Math.sqrt(E / fy);

    const Lfy = ky * Ly;
    const Lfz = kz * Lz;

    const lamy = (Lfy * 1000) / (iy * 10);
    const lamz = (Lfz * 1000) / (iz * 10);
    const lamyb = lamy / lam1;
    const lamzb = lamz / lam1;

    const phiy = 0.5 * (1 + ay * (lamyb - 0.2) + lamyb ** 2);
    const phiz = 0.5 * (1 + az * (lamzb - 0.2) + lamzb ** 2);
    const chiy = Math.min(1, 1 / (phiy + Math.sqrt(Math.max(0, phiy ** 2 - lamyb ** 2))));
    const chiz = Math.min(1, 1 / (phiz + Math.sqrt(Math.max(0, phiz ** 2 - lamzb ** 2))));

    const lammax = Math.max(lamyb, lamzb);
    const chimin = Math.min(chiy, chiz);

    const NcRd = lammax > 0.2
      ? (chimin * A * fy) / (gamma1 * 10)
      : (A * fy) / (gamma0 * 10);

    const ratio = NcRd > 0 ? N / NcRd : Infinity;
    const Areq = lammax > 0.2
      ? (N * 10 * gamma1) / (chimin * fy)
      : (N * 10 * gamma0) / fy;

    setResults({
      fy, lam1, Lfy, Lfz,
      lamy, lamz, lamyb, lamzb,
      courbeY, courbeZ, ay, az,
      phiy, phiz, chiy, chiz,
      lammax, chimin,
      NcRd, ratio, ok: ratio <= 1.0,
      Areq, secRecomm: suggestSection(Areq, profType),
    });
  }

  // ── Catalogue helpers ────────────────────────────────────────────────────────────
  const catSeries = SERIES_BY_FAMILY[cat.family] ?? ['HEA'];
  const catProfiles = Object.keys(PROFILES[cat.series] ?? {});
  const catData = (PROFILES[cat.series] ?? {})[cat.profile];

  function changeCatFamily(fam: string) {
    const series = (SERIES_BY_FAMILY[fam] ?? ['HEA'])[0];
    const profile = Object.keys(PROFILES[series] ?? {})[0] ?? '';
    setCat({ family: fam, series, profile, classe: null });
  }
  function changeCatSeries(s: string) {
    const profile = Object.keys(PROFILES[s] ?? {})[0] ?? '';
    setCat(prev => ({ ...prev, series: s, profile, classe: null }));
  }
  function changeCatProfile(p: string) {
    setCat(prev => ({ ...prev, profile: p, classe: null }));
  }

  function determinerClasse() {
    if (!catData || !catData.tw) return;
    const fyVal = catData.tf ? getFy(form.nuance, catData.tf) : 235;
    const eps = Math.sqrt(235 / fyVal);
    const tf = catData.tf ?? 0, tw = catData.tw ?? 0, h = catData.h, b = catData.b, r = catData.r ?? 0;
    const d = h - 2 * tf - 2 * r;
    const cdWeb = d / tw;
    const cfFlange = (b / 2 - tw / 2 - r) / tf;
    let cw = 1, cf = 1;
    if (cdWeb > 124 * eps) cw = 4; else if (cdWeb > 83 * eps) cw = 3; else if (cdWeb > 72 * eps) cw = 2;
    if (cfFlange > 14 * eps) cf = 4; else if (cfFlange > 10 * eps) cf = 3; else if (cfFlange > 9 * eps) cf = 2;
    setCat(prev => ({ ...prev, classe: Math.max(cw, cf) }));
  }

  function transferToFlambement() {
    if (!catData) return;
    const pt: ProfileType = cat.family === 'I' ? 'Poutrelles I européennes'
      : cat.family === 'U' ? 'Fers U' : 'Cornières';
    setForm(prev => ({
      ...prev,
      profType: pt,
      h: catData.h,
      b: catData.b,
      tf: catData.tf ?? catData.t ?? 0,
      tw: catData.tw ?? catData.t ?? 0,
      A: catData.A,
      iy: catData.iy ?? catData.Liyz ?? 0,
      iz: catData.iz ?? catData.Liyz ?? 0,
    }));
    setTab('flamb');
  }

  const d = (v: number | undefined, dec = 2) =>
    v !== undefined ? v.toFixed(dec) : '—';

  // ── Render ───────────────────────────────────────────────────────────────────────
  return (
    <div className="mod-page">
      <div className="mod-breadcrumb">OptiStruct / <span>Flambement EC3</span></div>
      <div className="mod-title">Vérification du Flambement</div>
      <div className="mod-sub">// EC3 §6.3.1 — NF EN 1993-1-1 — Pièce comprimée</div>

      {/* Tabs */}
      <div className="mod-tabs">
        <div className={`mod-tab${tab === 'flamb' ? ' active' : ''}`} onClick={() => setTab('flamb')}>
          🧮 Vérification Flambement
        </div>
        <div className={`mod-tab${tab === 'cat' ? ' active' : ''}`} onClick={() => setTab('cat')}>
          📋 Catalogue Profilés
        </div>
        <div style={{ marginLeft: 'auto', padding: '0 0 0 12px' }}>
          {results && (
            <button
              className="mod-btn mod-btn-outline"
              style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={() => generateHtmlReport(results, buildInputsSnapshot(form))}
            >
              📄 Note de calcul PDF
            </button>
          )}
        </div>
      </div>

      {/* ── TAB 1: FLAMBEMENT ────────────────────────────────────────────────────── */}
      {tab === 'flamb' && (
        <div className="mod-grid-3" style={{ alignItems: 'start' }}>

          {/* COL 1 — Données */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="mod-card">
              <div className="mod-card-title"><span className="mod-card-dot" />Sollicitations</div>
              <div className="mod-field">
                <label className="mod-field-label">N (kN)</label>
                <input type="number" className="mod-field-input" value={form.N}
                  onChange={e => setF('N', parseFloat(e.target.value))} />
              </div>
            </div>

            <div className="mod-card">
              <div className="mod-card-title"><span className="mod-card-dot" />Caractéristiques acier</div>
              <div className="mod-field">
                <label className="mod-field-label">Nuance</label>
                <select className="mod-field-select" value={form.nuance}
                  onChange={e => setF('nuance', e.target.value)}>
                  <option>S235</option><option>S275</option><option>S355</option>
                </select>
              </div>
              <div className="mod-field">
                <label className="mod-field-label">γM0</label>
                <select className="mod-field-select" value={form.gamma0}
                  onChange={e => setF('gamma0', parseFloat(e.target.value))}>
                  <option value={1}>1.00</option><option value={1.05}>1.05</option>
                </select>
              </div>
              <div className="mod-field">
                <label className="mod-field-label">γM1</label>
                <input type="number" className="mod-field-input" step={0.05} value={form.gamma1}
                  onChange={e => setF('gamma1', parseFloat(e.target.value))} />
              </div>
              <div className="mod-field">
                <label className="mod-field-label">E (MPa)</label>
                <input type="number" className="mod-field-input" value={form.E}
                  onChange={e => setF('E', parseFloat(e.target.value))} />
              </div>
            </div>

            <div className="mod-card">
              <div className="mod-card-title"><span className="mod-card-dot" />Données géométriques</div>
              <div className="mod-field">
                <label className="mod-field-label">Type profilé</label>
                <select className="mod-field-select" value={form.profType}
                  onChange={e => setF('profType', e.target.value as ProfileType)}>
                  <option>Poutrelles I européennes</option>
                  <option>Cornières</option>
                  <option>Fers U</option>
                </select>
              </div>
              <div className="mod-field">
                <label className="mod-field-label">Ly (m)</label>
                <input type="number" className="mod-field-input" step={0.1} value={form.Ly}
                  onChange={e => setF('Ly', parseFloat(e.target.value))} />
              </div>
              <div className="mod-field">
                <label className="mod-field-label">Lz (m)</label>
                <input type="number" className="mod-field-input" step={0.1} value={form.Lz}
                  onChange={e => setF('Lz', parseFloat(e.target.value))} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--tx3)', margin: '8px 0 4px', fontFamily: 'var(--fm)' }}>
                Propriétés de la section
              </div>
              {[
                { label: 'A (cm²)', key: 'A' as const, step: 0.1 },
                { label: 'iy (cm)', key: 'iy' as const, step: 0.01 },
                { label: 'iz (cm)', key: 'iz' as const, step: 0.01 },
                { label: 'h (mm)',  key: 'h'  as const, step: 1 },
                { label: 'b (mm)',  key: 'b'  as const, step: 1 },
                { label: 'tf (mm)', key: 'tf' as const, step: 0.1 },
                { label: 'tw (mm)', key: 'tw' as const, step: 0.1 },
              ].map(({ label, key, step }) => (
                <div className="mod-field" key={key}>
                  <label className="mod-field-label">{label}</label>
                  <input type="number" className="mod-field-input" step={step} value={form[key]}
                    onChange={e => setF(key, parseFloat(e.target.value))} />
                </div>
              ))}
              <div className="mod-field">
                <label className="mod-field-label">Classe section</label>
                <input type="number" className="mod-field-input" min={1} max={4} value={form.classe}
                  onChange={e => setF('classe', parseInt(e.target.value))} />
              </div>
            </div>
          </div>

          {/* COL 2 — Détails calcul */}
          <div>
            <div className="mod-card">
              <div className="mod-card-title"><span className="mod-card-dot" />Détails du calcul</div>

              {/* Plan xz */}
              <div style={{ background: 'var(--bg4)', border: '1px solid var(--bd)', borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cy)', marginBottom: 10, fontFamily: 'var(--fm)' }}>
                  Plan (xz) — axe y-y
                </div>
                <div className="mod-field">
                  <label className="mod-field-label">Liaison</label>
                  <select className="mod-field-select" value={form.liaisonY}
                    onChange={e => setF('liaisonY', e.target.value as Liaison)}>
                    <option>Articulé-Articulé</option>
                    <option>Encastré-Articulé</option>
                    <option>Encastré-Encastré</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 16, margin: '6px 0', fontSize: 12, fontFamily: 'var(--fm)' }}>
                  {(['Auto', 'Manuel'] as const).map(m => (
                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input type="radio" name="modeKy" value={m}
                        checked={form.kyAuto === (m === 'Auto')}
                        onChange={() => setF('kyAuto', m === 'Auto')} />
                      {m}
                    </label>
                  ))}
                </div>
                <div className="mod-field">
                  <label className="mod-field-label">ky</label>
                  <input type="number" className="mod-field-input" step={0.05}
                    value={form.kyAuto ? getK(form.liaisonY) : form.kyManual}
                    readOnly={form.kyAuto}
                    style={form.kyAuto ? { background: 'var(--bg4)' } : {}}
                    onChange={e => setF('kyManual', parseFloat(e.target.value))} />
                </div>
                {results && (
                  <>
                    {[
                      ['Lo (m)', results.Lfy.toFixed(3)],
                      ['λy', results.lamy.toFixed(3)],
                      ['λ̄y', results.lamyb.toFixed(4)],
                      ['Courbe', results.courbeY],
                      ['αy', results.ay.toFixed(2)],
                      ['φy', results.phiy.toFixed(4)],
                      ['χy', results.chiy.toFixed(4)],
                    ].map(([label, val]) => (
                      <div className="mod-field" key={label}>
                        <label className="mod-field-label">{label}</label>
                        <input className="mod-field-input" readOnly value={val}
                          style={{ background: 'var(--bg4)', color: 'var(--cy)', fontFamily: 'var(--fm)' }} />
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Plan xy */}
              <div style={{ background: 'var(--bg4)', border: '1px solid var(--bd)', borderRadius: 6, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--am)', marginBottom: 10, fontFamily: 'var(--fm)' }}>
                  Plan (xy) — axe z-z
                </div>
                <div className="mod-field">
                  <label className="mod-field-label">Liaison</label>
                  <select className="mod-field-select" value={form.liaisonZ}
                    onChange={e => setF('liaisonZ', e.target.value as Liaison)}>
                    <option>Articulé-Articulé</option>
                    <option>Encastré-Articulé</option>
                    <option>Encastré-Encastré</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 16, margin: '6px 0', fontSize: 12, fontFamily: 'var(--fm)' }}>
                  {(['Auto', 'Manuel'] as const).map(m => (
                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input type="radio" name="modeKz" value={m}
                        checked={form.kzAuto === (m === 'Auto')}
                        onChange={() => setF('kzAuto', m === 'Auto')} />
                      {m}
                    </label>
                  ))}
                </div>
                <div className="mod-field">
                  <label className="mod-field-label">kz</label>
                  <input type="number" className="mod-field-input" step={0.05}
                    value={form.kzAuto ? getK(form.liaisonZ) : form.kzManual}
                    readOnly={form.kzAuto}
                    style={form.kzAuto ? { background: 'var(--bg4)' } : {}}
                    onChange={e => setF('kzManual', parseFloat(e.target.value))} />
                </div>
                {results && (
                  <>
                    {[
                      ['Lo (m)', results.Lfz.toFixed(3)],
                      ['λz', results.lamz.toFixed(3)],
                      ['λ̄z', results.lamzb.toFixed(4)],
                      ['Courbe', results.courbeZ],
                      ['αz', results.az.toFixed(2)],
                      ['φz', results.phiz.toFixed(4)],
                      ['χz', results.chiz.toFixed(4)],
                    ].map(([label, val]) => (
                      <div className="mod-field" key={label}>
                        <label className="mod-field-label">{label}</label>
                        <input className="mod-field-input" readOnly value={val}
                          style={{ background: 'var(--bg4)', color: 'var(--am)', fontFamily: 'var(--fm)' }} />
                      </div>
                    ))}
                  </>
                )}
              </div>

              <div className="mod-btn-group">
                <button className="mod-btn mod-btn-primary" onClick={calculate}>
                  🧮 Calculer
                </button>
              </div>
            </div>

            {/* EC3 formula reminder */}
            <div className="mod-card" style={{ marginTop: '0.75rem' }}>
              <div className="mod-card-title"><span className="mod-card-dot" />Rappel formules EC3</div>
              <div style={{ fontSize: 11, lineHeight: 1.8, color: 'var(--tx2)', fontFamily: 'var(--fm)' }}>
                <div><b>λ₁</b> = π × √(E / fy)</div>
                <div><b>λ̄</b> = (Lf / i) / λ₁</div>
                <div><b>φ</b> = 0.5 × [1 + α(λ̄ − 0.2) + λ̄²]</div>
                <div><b>χ</b> = 1 / [φ + √(φ² − λ̄²)]  ≤ 1</div>
                <div style={{ borderTop: '1px solid var(--bd)', margin: '6px 0' }} />
                <div><b>Nc,Rd</b> = χ × A × fy / γM1 &nbsp; (λ̄max &gt; 0.2)</div>
                <div><b>Nc,Rd</b> = A × fy / γM0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (λ̄max ≤ 0.2)</div>
                <div style={{ borderTop: '1px solid var(--bd)', margin: '6px 0' }} />
                <div><b>Courbes — Poutrelles I :</b></div>
                <div>h/b &gt; 1.2, tf &lt; 40 → axe y: a, z: b</div>
                <div>h/b &gt; 1.2, tf ≥ 40 → b / c</div>
                <div>h/b ≤ 1.2, tf &lt; 40 → b / c</div>
                <div>h/b ≤ 1.2, tf ≥ 40 → d / d</div>
                <div><b>Cornières / Fers U :</b> courbe c</div>
              </div>
            </div>
          </div>

          {/* COL 3 — Résultats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="mod-card">
              <div className="mod-card-title"><span className="mod-card-dot" />Résultats &amp; Vérifications</div>

              {!results ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--tx3)', fontSize: 13 }}>
                  Renseignez les données et cliquez sur Calculer
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', margin: '8px 0 4px', fontFamily: 'var(--fm)' }}>Flambement</div>
                  {[
                    ['λ̄max', results.lammax.toFixed(4)],
                    ['χ_min', results.chimin.toFixed(4)],
                  ].map(([label, val]) => (
                    <div className="mod-field" key={label}>
                      <label className="mod-field-label">{label}</label>
                      <input className="mod-field-input" readOnly value={val}
                        style={{ background: 'var(--bg4)', fontFamily: 'var(--fm)' }} />
                    </div>
                  ))}
                  <div className="mod-field">
                    <label className="mod-field-label">Risque</label>
                    <input className="mod-field-input" readOnly
                      value={results.lammax > 0.2 ? 'Risque de flambement' : 'Aucun risque'}
                      style={{
                        background: results.lammax > 0.2 ? 'var(--ama)' : 'var(--ema)',
                        color: results.lammax > 0.2 ? 'var(--am)' : 'var(--em)',
                        fontFamily: 'var(--fm)', fontWeight: 600,
                      }} />
                  </div>

                  <div style={{ borderTop: '1px solid var(--bd)', margin: '10px 0 6px' }} />
                  <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4, fontFamily: 'var(--fm)' }}>Vérifications</div>

                  <div style={{ padding: '10px 12px', background: 'var(--bg4)', borderRadius: 6, marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'var(--fm)' }}>Nc,Rd</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--cy)', fontFamily: 'var(--fm)' }}>
                      {results.NcRd.toFixed(3)} <span style={{ fontSize: 12 }}>kN</span>
                    </div>
                  </div>

                  <div className="mod-field">
                    <label className="mod-field-label">Ratio N/Nc,Rd</label>
                    <input className="mod-field-input" readOnly value={results.ratio.toFixed(4)}
                      style={{ background: 'var(--bg4)', fontFamily: 'var(--fm)' }} />
                  </div>
                  <div className="mod-field">
                    <label className="mod-field-label">Vérifiée</label>
                    <input className="mod-field-input" readOnly
                      value={results.ok ? 'OK ✓' : 'NON ✗'}
                      style={{
                        background: results.ok ? 'var(--ema)' : 'var(--rsa)',
                        color: results.ok ? 'var(--em)' : 'var(--rs)',
                        fontWeight: 700, textAlign: 'center', fontFamily: 'var(--fm)',
                      }} />
                  </div>

                  <div style={{ borderTop: '1px solid var(--bd)', margin: '10px 0 6px' }} />
                  <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4, fontFamily: 'var(--fm)' }}>Optimisation</div>

                  <div className="mod-field">
                    <label className="mod-field-label">A requis (cm²)</label>
                    <input className="mod-field-input" readOnly value={results.Areq.toFixed(3)}
                      style={{ background: 'var(--bg4)', fontFamily: 'var(--fm)' }} />
                  </div>
                  <div className="mod-field">
                    <label className="mod-field-label">Section recommandée</label>
                    <input className="mod-field-input" readOnly value={results.secRecomm}
                      style={{ background: 'var(--bg4)', fontFamily: 'var(--fm)', color: 'var(--cy)' }} />
                  </div>
                </>
              )}
            </div>

            {results && (
              <div className="mod-result">
                <div className="mod-result-header">∑ Résultat EC3 §6.3.1</div>
                <div className="mod-grid-2" style={{ marginTop: 12 }}>
                  <div className="mod-metric">
                    <div className="mod-metric-label">Nc,Rd</div>
                    <div className="mod-metric-value" style={{ color: 'var(--cy)' }}>{results.NcRd.toFixed(1)}</div>
                    <div className="mod-metric-unit">kN</div>
                  </div>
                  <div className="mod-metric">
                    <div className="mod-metric-label">Statut global</div>
                    <div className="mod-metric-value" style={{ color: results.ok ? 'var(--em)' : 'var(--rs)', fontSize: 14 }}>
                      {results.ok ? 'VÉRIFIÉ' : 'NON OK'}
                    </div>
                    <div className="mod-metric-unit">ratio = {results.ratio.toFixed(3)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: CATALOGUE ─────────────────────────────────────────────────────── */}
      {tab === 'cat' && (
        <div className="mod-card">
          <div className="mod-card-title"><span className="mod-card-dot" />Catalogue Profilés</div>

          {/* Selectors */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
            <select className="mod-field-select" style={{ width: 'auto' }} value={cat.family}
              onChange={e => changeCatFamily(e.target.value)}>
              <option value="I">Poutrelles I</option>
              <option value="U">Fers U</option>
              <option value="L">Cornières</option>
            </select>
            <select className="mod-field-select" style={{ width: 'auto' }} value={cat.series}
              onChange={e => changeCatSeries(e.target.value)}>
              {catSeries.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="mod-field-select" style={{ width: 'auto', minWidth: 120 }} value={cat.profile}
              onChange={e => changeCatProfile(e.target.value)}>
              {catProfiles.map(p => <option key={p}>{p}</option>)}
            </select>
            <button className="mod-btn mod-btn-outline" style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={determinerClasse}>
              Déterminer la classe
            </button>
            {cat.classe !== null && (
              <span>La section est de classe :&nbsp;
                <span className="mod-tag mod-tag-blue" style={{ fontSize: 13, padding: '3px 10px' }}>{cat.classe}</span>
              </span>
            )}
          </div>

          {catData && (
            <div className="mod-grid-2" style={{ gap: '1rem' }}>
              {/* I/H/U table */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--cy)', marginBottom: 8, fontFamily: 'var(--fm)' }}>
                  Dimensions — I / H / U
                </div>
                <table className="mod-table">
                  <thead><tr><th>Paramètre</th><th>Valeur</th><th>Unité</th></tr></thead>
                  <tbody>
                    {[
                      ['h',      catData.h,     'mm'],
                      ['b',      catData.b,     'mm'],
                      ['tw',     catData.tw,    'mm'],
                      ['tf',     catData.tf,    'mm'],
                      ['r',      catData.r,     'mm'],
                      ['A',      catData.A,     '×10² mm²'],
                      ['Iy',     catData.Iy,    '×10⁴ mm⁴'],
                      ['Iz',     catData.Iz,    '×10⁴ mm⁴'],
                      ['iy',     catData.iy,    '×10 mm'],
                      ['iz',     catData.iz,    '×10 mm'],
                      ['Wel,y',  catData.Wely,  '×10³ mm³'],
                      ['Wel,z',  catData.Welz,  '×10³ mm³'],
                      ['Wpl,y',  catData.Wply,  '×10³ mm³'],
                      ['Wpl,z',  catData.Wplz,  '×10³ mm³'],
                      ['It',     catData.It,    '×10⁴ mm⁴'],
                      ['Iw',     catData.Iw,    '×10⁹ mm⁶'],
                    ].map(([label, val]) => (
                      <tr key={label as string}>
                        <td>{label}</td>
                        <td className="mod-val-accent">{val ?? '—'}</td>
                        <td style={{ color: 'var(--tx3)', fontSize: 11 }}>{val !== undefined ? (val === '—' ? '' : (Array.isArray(val) ? '' : '')) : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cornières table */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--am)', marginBottom: 8, fontFamily: 'var(--fm)' }}>
                  Dimensions — Cornières
                </div>
                <table className="mod-table">
                  <thead><tr><th>Paramètre</th><th>Valeur</th></tr></thead>
                  <tbody>
                    {[
                      ['h',          catData.h],
                      ['b',          catData.b],
                      ['t',          catData.t],
                      ['r1',         catData.r1],
                      ['r2',         catData.r2],
                      ['A (×10²)',   catData.A],
                      ['Iy=Iz',      catData.LIyz],
                      ['iy=iz',      catData.Liyz],
                      ['Wel,y=Wel,z',catData.LWelyz],
                      ['Iu',         catData.LIu],
                      ['iu',         catData.Liu],
                      ['Iyz',        catData.LIyz2],
                      ['Iv',         catData.LIv],
                      ['iv',         catData.Liv],
                    ].map(([label, val]) => (
                      <tr key={label as string}>
                        <td>{label}</td>
                        <td className="mod-val-accent">{val ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mod-btn-group" style={{ marginTop: 12 }}>
                  <button className="mod-btn mod-btn-primary" style={{ fontSize: 12 }}
                    onClick={transferToFlambement}>
                    ➡ Utiliser ce profilé pour la vérification
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
