import { useEffect, useState } from 'react';
import type { ForcePair } from '../services/ec1';

type WallZone = 'A' | 'B' | 'C' | 'D' | 'E';
type RoofZone = 'F' | 'G' | 'H' | 'I' | 'J';

interface Props {
  b: number;
  d: number;
  h: number;
  adeg: number;
  ht: number;
  e: number;
  fmW1: Record<WallZone, ForcePair>;
  fmW2: Record<WallZone, ForcePair>;
  ftW1: Record<RoofZone, ForcePair>;
  ftW2: Record<RoofZone, ForcePair>;
  Cp1: number;
  Cp2: number;
  W1on: boolean;
  W2on: boolean;
}

const ZONE_COLORS_DARK: Record<string, { fill: string; stroke: string; text: string }> = {
  A: { fill: 'rgba(59,130,246,.25)', stroke: '#3B82F6', text: '#93C5FD' },
  B: { fill: 'rgba(168,85,247,.25)', stroke: '#A855F7', text: '#C4B5FD' },
  C: { fill: 'rgba(236,72,153,.25)', stroke: '#EC4899', text: '#F9A8D4' },
  D: { fill: 'rgba(34,197,94,.25)', stroke: '#22C55E', text: '#86EFAC' },
  E: { fill: 'rgba(239,68,68,.25)', stroke: '#EF4444', text: '#FCA5A5' },
  F: { fill: 'rgba(245,158,11,.25)', stroke: '#F59E0B', text: '#FCD34D' },
  G: { fill: 'rgba(6,182,212,.25)', stroke: '#06B6D4', text: '#67E8F9' },
  H: { fill: 'rgba(132,204,22,.25)', stroke: '#84CC16', text: '#BEF264' },
  I: { fill: 'rgba(249,115,22,.25)', stroke: '#F97316', text: '#FDBA74' },
  J: { fill: 'rgba(20,184,166,.25)', stroke: '#14B8A6', text: '#5EEAD4' },
};

const ZONE_COLORS_LIGHT: Record<string, { fill: string; stroke: string; text: string }> = {
  A: { fill: 'rgba(59,130,246,.18)', stroke: '#1D4ED8', text: '#1E40AF' },
  B: { fill: 'rgba(168,85,247,.18)', stroke: '#7E22CE', text: '#6B21A8' },
  C: { fill: 'rgba(236,72,153,.18)', stroke: '#BE185D', text: '#9D174D' },
  D: { fill: 'rgba(34,197,94,.18)', stroke: '#15803D', text: '#166534' },
  E: { fill: 'rgba(239,68,68,.18)', stroke: '#B91C1C', text: '#991B1B' },
  F: { fill: 'rgba(245,158,11,.18)', stroke: '#B45309', text: '#92400E' },
  G: { fill: 'rgba(6,182,212,.18)', stroke: '#0E7490', text: '#155E75' },
  H: { fill: 'rgba(132,204,22,.18)', stroke: '#4D7C0F', text: '#365314' },
  I: { fill: 'rgba(249,115,22,.18)', stroke: '#C2410C', text: '#9A3412' },
  J: { fill: 'rgba(20,184,166,.18)', stroke: '#0F766E', text: '#134E4A' },
};

function useTheme() {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-theme') !== 'light',
  );
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') !== 'light');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

export default function WindSchemas(props: Props) {
  const isDark = useTheme();
  const Z = isDark ? ZONE_COLORS_DARK : ZONE_COLORS_LIGHT;

  const cross = buildCrossSection(props, isDark);

  return (
    <div className="card">
      <div className="cardhd">
        <div className="ctitle">
          <span className="cbar vl" />
          Schémas de zones EC1 — Valeurs en daN/m²
        </div>
        <span className="ctag tv">Dynamique · Proportionnel</span>
      </div>

      {/* ─── Cross section ─── */}
      <div style={{ marginBottom: '.85rem' }}>
        <div className="sech">Coupe transversale (à l'échelle)</div>
        <div
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--bd)',
            borderRadius: 8,
            padding: '.75rem',
            overflow: 'hidden',
          }}
          dangerouslySetInnerHTML={{ __html: cross }}
        />
      </div>

      {/* ─── Wall zone grids ─── */}
      <div className="g2">
        {props.W1on && (
          <ZoneBlock
            title="Murs — W1 Pignon 0° (vent⊥pignon)"
            forces={props.fmW1}
            zones={['A', 'B', 'C', 'D', 'E']}
            colors={Z}
            note={`e=min(b,2ht)=${props.e.toFixed(2)} m — A=e/5, B=4e/5, C=d-e`}
          />
        )}
        {props.W2on && (
          <ZoneBlock
            title="Murs — W2 Long Pan 90° (vent⊥long pan)"
            forces={props.fmW2}
            zones={['A', 'B', 'C', 'D', 'E']}
            colors={Z}
            note={`e=min(b,2ht)=${props.e.toFixed(2)} m — A=e/5, B=4e/5, C=b-e`}
          />
        )}
      </div>

      <hr className="sep" />

      {/* ─── Roof zone grids ─── */}
      <div className="g2">
        {props.W1on && (
          <ZoneBlock
            title={`Toiture — W1 θ=0° α=${props.adeg.toFixed(2)}°`}
            forces={props.ftW1}
            zones={['F', 'G', 'H', 'I', 'J']}
            colors={Z}
            note="Découpage Fig. 7.8 EC1 — vent perpendiculaire au pignon"
          />
        )}
        {props.W2on && (
          <ZoneBlock
            title={`Toiture — W2 θ=90° α=${props.adeg.toFixed(2)}°`}
            forces={props.ftW2}
            zones={['F', 'G', 'H', 'I', 'J']}
            colors={Z}
            note="Découpage Fig. 7.8 EC1 — vent perpendiculaire au long pan"
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Cross section SVG — to-scale elevation showing α, h, ht, f, b
───────────────────────────────────────────────────────────────────── */
function buildCrossSection(p: Props, isDark: boolean): string {
  const { b, h, ht, adeg } = p;
  const SW = 680;
  const SH = 305;
  const LP = 95;
  const RP = 62;
  const TP = 38;
  const BP = 55;
  const DW = SW - LP - RP;
  const DH = SH - TP - BP;
  const scX = DW / b;
  const scY = DH / (ht * 1.18);
  const pxB = b * scX;
  const pxH = h * scY;
  const pxHt = ht * scY;
  const pxF = (ht - h) * scY;
  const x0 = LP;
  const ySOL = TP + DH;
  const yH = ySOL - pxH;
  const yHt = ySOL - pxHt;
  const mx = x0 + pxB / 2;

  const W = isDark ? '#00D4FF' : '#0077AA';
  const D = isDark ? '#3D5A78' : '#8899AA';
  const T = isDark ? '#FFB84D' : '#C4780A';
  const M = isDark ? '#3B82F6' : '#1D4ED8';
  const TXT = isDark ? '#E2EAF4' : '#1A2232';
  const SOL = isDark ? '#6B85A0' : '#4A5E78';
  const fillT = isDark ? 'rgba(245,158,11,.1)' : 'rgba(180,83,9,.07)';
  const fillM = isDark ? 'rgba(59,130,246,.07)' : 'rgba(29,78,216,.05)';

  // Hatch ticks for ground
  let hatches = '';
  for (let hx = x0 - 5; hx < x0 + pxB + 14; hx += 10) {
    hatches += `<line x1="${hx}" y1="${ySOL}" x2="${hx - 7}" y2="${ySOL + 8}" stroke="${isDark ? '#2A3D52' : '#C0CDD8'}" stroke-width="1"/>`;
  }

  // Angle arc
  const alpRad = Math.atan2(pxF, pxB / 2);
  const arcR = Math.min(40, pxB * 0.13, pxH * 0.35);
  const pBx = x0 + arcR * Math.cos(alpRad);
  const pBy = yH - arcR * Math.sin(alpRad);

  return `<svg viewBox="0 0 ${SW} ${SH}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">
    <defs>
      <marker id="aw" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
        <path d="M0,0 L9,4.5 L0,9 Z" fill="${W}"/>
      </marker>
      <marker id="da" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
        <path d="M6,0 L0,3 L6,6 Z" fill="${D}"/>
      </marker>
      <marker id="db" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="${D}"/>
      </marker>
      <marker id="ta" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
        <path d="M6,0 L0,3 L6,6 Z" fill="${T}"/>
      </marker>
      <marker id="tb" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="${T}"/>
      </marker>
    </defs>

    <line x1="${x0 - 10}" y1="${ySOL}" x2="${x0 + pxB + 10}" y2="${ySOL}" stroke="${SOL}" stroke-width="3"/>
    ${hatches}

    <rect x="${x0}" y="${yH}" width="${pxB}" height="${pxH}" fill="${fillM}"/>
    <polygon points="${x0},${yH} ${mx},${yHt} ${x0 + pxB},${yH}" fill="${fillT}"/>

    <line x1="${x0}" y1="${ySOL}" x2="${x0}" y2="${yH}" stroke="${M}" stroke-width="3"/>
    <line x1="${x0 + pxB}" y1="${ySOL}" x2="${x0 + pxB}" y2="${yH}" stroke="${M}" stroke-width="3"/>

    <line x1="${x0}" y1="${yH}" x2="${mx}" y2="${yHt}" stroke="${T}" stroke-width="2.5"/>
    <line x1="${mx}" y1="${yHt}" x2="${x0 + pxB}" y2="${yH}" stroke="${T}" stroke-width="2.5"/>

    <line x1="${mx}" y1="${ySOL}" x2="${mx}" y2="${yHt}" stroke="${T}" stroke-width="1" stroke-dasharray="5,4" opacity=".4"/>
    <text x="${mx + 5}" y="${yHt - 5}" font-family="JetBrains Mono,monospace" font-size="9" fill="${T}" opacity=".8">Faîte</text>

    <line x1="${x0 + pxB}" y1="${yH}" x2="${x0 + pxB + 24}" y2="${yH}" stroke="${D}" stroke-width=".8" stroke-dasharray="2,2"/>
    <line x1="${x0 + pxB}" y1="${ySOL}" x2="${x0 + pxB + 24}" y2="${ySOL}" stroke="${D}" stroke-width=".8" stroke-dasharray="2,2"/>
    <line x1="${x0 + pxB + 22}" y1="${ySOL}" x2="${x0 + pxB + 22}" y2="${yH}" stroke="${D}" stroke-width="1.2" marker-start="url(#da)" marker-end="url(#db)"/>
    <text x="${x0 + pxB + 31}" y="${yH + pxH / 2 + 4}" font-family="JetBrains Mono,monospace" font-size="11" fill="${D}">h=${h}m</text>

    <line x1="${x0}" y1="${yHt}" x2="${x0 - 30}" y2="${yHt}" stroke="${T}" stroke-width=".8" stroke-dasharray="2,2"/>
    <line x1="${x0}" y1="${ySOL}" x2="${x0 - 30}" y2="${ySOL}" stroke="${T}" stroke-width=".8" stroke-dasharray="2,2"/>
    <line x1="${x0 - 28}" y1="${ySOL}" x2="${x0 - 28}" y2="${yHt}" stroke="${T}" stroke-width="1.2" marker-start="url(#ta)" marker-end="url(#tb)"/>
    <text x="${x0 - 36}" y="${yH + pxHt / 2 + 4}" font-family="JetBrains Mono,monospace" font-size="11" fill="${T}" text-anchor="end">ht=${ht.toFixed(3)}m</text>

    <line x1="${x0}" y1="${ySOL + 22}" x2="${x0}" y2="${ySOL + 26}" stroke="${D}" stroke-width=".8"/>
    <line x1="${x0 + pxB}" y1="${ySOL + 22}" x2="${x0 + pxB}" y2="${ySOL + 26}" stroke="${D}" stroke-width=".8"/>
    <line x1="${x0}" y1="${ySOL + 22}" x2="${x0 + pxB}" y2="${ySOL + 22}" stroke="${D}" stroke-width="1.2" marker-start="url(#da)" marker-end="url(#db)"/>
    <text x="${mx}" y="${ySOL + 36}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="11" fill="${D}">b=${b}m</text>

    <path d="M ${x0 + arcR},${yH} A ${arcR} ${arcR} 0 0 1 ${pBx.toFixed(1)},${pBy.toFixed(1)}" fill="none" stroke="${T}" stroke-width="1.5"/>
    <text x="${x0 + arcR * 1.3}" y="${yH - arcR * 0.4}" font-family="JetBrains Mono,monospace" font-size="10" fill="${T}">α=${adeg.toFixed(2)}°</text>

    <text x="${x0 + 8}" y="${yH - 4}" font-family="JetBrains Mono,monospace" font-size="9" fill="${M}" opacity=".85">D (face vent)</text>
    <text x="${x0 + pxB - 6}" y="${yH - 4}" font-family="JetBrains Mono,monospace" font-size="9" fill="${D}" text-anchor="end" opacity=".85">E (sous vent)</text>

    <line x1="${x0 - 82}" y1="${yH + pxH * 0.38}" x2="${x0 - 5}" y2="${yH + pxH * 0.38}" stroke="${W}" stroke-width="3" marker-end="url(#aw)"/>
    <text x="${x0 - 44}" y="${yH + pxH * 0.38 - 16}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="9" font-weight="700" fill="${W}">Vent</text>
    <text x="${x0 - 44}" y="${yH + pxH * 0.38 - 5}" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="8" fill="${W}">W1 · Y+</text>

    <text x="${SW / 2}" y="19" text-anchor="middle" font-family="Space Grotesk,sans-serif" font-size="13" font-weight="700" fill="${TXT}">Coupe transversale — Élévation (à l'échelle)</text>
    <text x="${SW / 2}" y="31" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="9" fill="${D}">b = ${b} m · h = ${h} m · ht = ${ht.toFixed(2)} m · α = ${adeg.toFixed(2)}°</text>
  </svg>`;
}

/* ─────────────────────────────────────────────────────────────────────
   ZoneBlock — visualises one set of zones with their force values as a
   grid of colored tiles (much cleaner than the original SVG mess).
───────────────────────────────────────────────────────────────────── */
function ZoneBlock<Z extends string>({
  title,
  forces,
  zones,
  colors,
  note,
}: {
  title: string;
  forces: Record<Z, ForcePair>;
  zones: Z[];
  colors: Record<string, { fill: string; stroke: string; text: string }>;
  note: string;
}) {
  return (
    <div>
      <div className="sech">{title}</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 6,
          marginBottom: 8,
        }}
      >
        {zones.map((z) => {
          const c = colors[z as string];
          const f = forces[z];
          return (
            <div
              key={z}
              style={{
                background: c.fill,
                border: `1px solid ${c.stroke}`,
                borderRadius: 7,
                padding: '0.55rem 0.4rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--fm)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: c.stroke,
                  marginBottom: 2,
                }}
              >
                {z}
              </div>
              <div
                style={{
                  fontFamily: 'var(--fm)',
                  fontSize: '.7rem',
                  fontWeight: 600,
                  color: c.text,
                }}
              >
                {f.f1.toFixed(2)}
              </div>
              <div
                style={{
                  fontFamily: 'var(--fm)',
                  fontSize: '.65rem',
                  color: 'var(--tx3)',
                  marginTop: 1,
                }}
              >
                {f.f2.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontSize: '.7rem',
          color: 'var(--tx3)',
          fontFamily: 'var(--fm)',
          padding: '0.4rem 0.6rem',
          background: 'var(--bg4)',
          borderRadius: 5,
          border: '1px solid var(--bd)',
        }}
      >
        {note}
      </div>
    </div>
  );
}
