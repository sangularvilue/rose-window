'use client';

import { useMemo } from 'react';
import { SAINT_LIGHT, beamPolyPoints } from '@/lib/engine';
import type { SaintKey } from '@/lib/types';

export const FONT_DISPLAY = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
export const FONT_BODY = 'Inter, -apple-system, "Segoe UI", system-ui, sans-serif';
export const STONE_BG = '#0f1218';
export const PARCHMENT = '#f3e9d2';
export const GOLD_INK = '#c4953a';

export function StoneDefs({ id = 'sb' }: { id?: string }) {
  return (
    <defs>
      <pattern id="prep-stone-pat" x="0" y="0" width="600" height="600" patternUnits="userSpaceOnUse">
        <rect width="600" height="600" fill={STONE_BG} />
        <rect width="600" height="600" filter={`url(#${id}-stoneN)`} />
      </pattern>
      <filter id={`${id}-stoneN`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="5" />
        <feColorMatrix values="0 0 0 0 0.07  0 0 0 0 0.06  0 0 0 0 0.05  0 0 0 0.45 0" />
      </filter>
    </defs>
  );
}

interface Beam {
  angle: number;
  width: number;
  length: number;
  color: string;
  opacity?: number;
}

export function LightFan({ cx, cy, beams, opacity = 0.5 }: {
  cx: number; cy: number; beams: Beam[]; opacity?: number;
}) {
  let brightIdx = 0, bestW = -1;
  beams.forEach((b, i) => { if (b.width > bestW) { bestW = b.width; brightIdx = i; } });
  return (
    <g style={{ mixBlendMode: 'screen' }} opacity={opacity}>
      {beams.map((b, i) => (
        <g key={i} className={i === brightIdx ? 'rw-living-beam' : 'rw-living-bloom'}
          style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <polygon
            points={beamPolyPoints({ cx, cy, angle: b.angle, width: b.width, length: b.length })}
            fill={b.color} opacity={b.opacity ?? 0.5}
            filter="url(#rw-bloom-lg)" />
        </g>
      ))}
    </g>
  );
}

export function DustMotes({ x, y, w, h, count = 80, seed = 1, saintKey }: {
  x: number; y: number; w: number; h: number;
  count?: number; seed?: number; saintKey?: SaintKey;
}) {
  const L = saintKey ? SAINT_LIGHT[saintKey] : null;
  const palette = L ? ['#fff7d8', L.warm, L.cool, L.accent] : ['#fff7d8'];
  const motes = useMemo(() => {
    const out: Array<{ cx: number; cy: number; r: number; op: number; color: string }> = [];
    let s = seed;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < count; i++) {
      out.push({
        cx: x + rnd() * w, cy: y + rnd() * h,
        r: 0.4 + rnd() * 1.6, op: 0.15 + rnd() * 0.55,
        color: palette[Math.floor(rnd() * palette.length)],
      });
    }
    return out;
  }, [x, y, w, h, count, seed, saintKey]);
  const half = Math.ceil(motes.length / 2);
  return (
    <g>
      <g className="rw-living-motes">
        {motes.slice(0, half).map((m, i) => (
          <circle key={i} cx={m.cx} cy={m.cy} r={m.r} fill={m.color} opacity={m.op} />
        ))}
      </g>
      <g className="rw-living-motes-2">
        {motes.slice(half).map((m, i) => (
          <circle key={i + half} cx={m.cx} cy={m.cy} r={m.r} fill={m.color} opacity={m.op} />
        ))}
      </g>
    </g>
  );
}

export function RoomLight({ saintKey = 'Moreau' as SaintKey, cx, cy, w = 900, h = 400, opacity = 0.55 }: {
  saintKey?: SaintKey; cx: number; cy: number; w?: number; h?: number; opacity?: number;
}) {
  const L = SAINT_LIGHT[saintKey] || SAINT_LIGHT.Moreau;
  return (
    <g style={{ mixBlendMode: 'screen' }} opacity={opacity}>
      <ellipse cx={cx} cy={cy} rx={w*0.55} ry={h*0.55} fill={L.warm} opacity="0.55" filter="url(#rw-bloom-lg)" />
      <ellipse cx={cx-w*0.18} cy={cy+h*0.10} rx={w*0.30} ry={h*0.28} fill={L.cool} opacity="0.45" filter="url(#rw-bloom-lg)" />
      <ellipse cx={cx+w*0.18} cy={cy-h*0.05} rx={w*0.24} ry={h*0.22} fill={L.accent} opacity="0.55" filter="url(#rw-bloom-lg)" />
    </g>
  );
}

export function TraceryFrame({ S = 220, defsId = 'tr', archHeight = 1.6, showArch = true }: {
  S?: number; defsId?: string; archHeight?: number; showArch?: boolean;
}) {
  const stone = '#231a13', stoneHi = '#3c2e21', stoneShadow = '#0c0805', goldRim = '#7a5a22';
  const R = S * 1.06;
  const cusps = Array.from({ length: 6 }, (_, k) => {
    const a = -Math.PI / 3 + (k + 0.5) * Math.PI / 3;
    return { x: R * 1.06 * Math.cos(a), y: R * 1.06 * Math.sin(a), a };
  });
  return (
    <g>
      <defs>
        <radialGradient id={`${defsId}-stone-grad`} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor={stoneHi} />
          <stop offset="0.6" stopColor={stone} />
          <stop offset="1" stopColor={stoneShadow} />
        </radialGradient>
        <linearGradient id={`${defsId}-mullion`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={stoneHi} />
          <stop offset="0.5" stopColor={stone} />
          <stop offset="1" stopColor={stoneShadow} />
        </linearGradient>
        <filter id={`${defsId}-stone-n`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="9" />
          <feColorMatrix values="0 0 0 0 0.10  0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0.7 0" />
        </filter>
      </defs>
      {showArch && (
        <g>
          <path d={`M ${-S*1.55} ${S*archHeight} L ${-S*1.55} ${-S*0.2} Q ${-S*1.55} ${-S*1.7} 0 ${-S*1.85} Q ${S*1.55} ${-S*1.7} ${S*1.55} ${-S*0.2} L ${S*1.55} ${S*archHeight} Z`}
            fill={`url(#${defsId}-stone-grad)`} />
          <path d={`M ${-S*1.55} ${S*archHeight} L ${-S*1.55} ${-S*0.2} Q ${-S*1.55} ${-S*1.7} 0 ${-S*1.85} Q ${S*1.55} ${-S*1.7} ${S*1.55} ${-S*0.2} L ${S*1.55} ${S*archHeight} Z`}
            fill="white" filter={`url(#${defsId}-stone-n)`} opacity="0.5" />
          <path d={`M -${S*0.18} ${-R*1.18} L ${S*0.18} ${-R*1.18} L ${S*0.13} ${-R*1.34} L -${S*0.13} ${-R*1.34} Z`}
            fill={stoneHi} stroke={stoneShadow} strokeWidth="1" />
          <circle cx="0" cy={-R*1.26} r={S*0.05} fill={goldRim} opacity="0.7" />
        </g>
      )}
      <g>
        <circle cx="0" cy="0" r={R * 1.18} fill={`url(#${defsId}-stone-grad)`} />
        <circle cx="0" cy="0" r={R * 1.18} fill="white" filter={`url(#${defsId}-stone-n)`} opacity="0.55" />
        <circle cx="0" cy="0" r={R * 1.005} fill="#000" />
        <circle cx="0" cy="0" r={R * 1.02} fill="none" stroke={goldRim} strokeWidth={Math.max(1, S/220)} opacity="0.7" />
      </g>
      <g>
        {[0,1,2,3,4,5].map(k => {
          const a = -Math.PI / 3 + k * Math.PI / 3;
          const x1 = S * Math.cos(a), y1 = S * Math.sin(a);
          const x2 = R * 1.18 * Math.cos(a), y2 = R * 1.18 * Math.sin(a);
          const dx = -Math.sin(a), dy = Math.cos(a);
          const ww = Math.max(2, S/40);
          return <polygon key={k}
            points={`${x1+dx*ww},${y1+dy*ww} ${x1-dx*ww},${y1-dy*ww} ${x2-dx*ww*1.4},${y2-dy*ww*1.4} ${x2+dx*ww*1.4},${y2+dy*ww*1.4}`}
            fill={`url(#${defsId}-mullion)`} stroke={stoneShadow} strokeWidth="1" />;
        })}
      </g>
      <g>
        {cusps.map((c, k) => {
          const rr = S * 0.13;
          return (
            <g key={k} transform={`translate(${c.x},${c.y}) rotate(${(c.a * 180) / Math.PI + 90})`}>
              <circle r={rr * 1.35} fill={stone} stroke={stoneShadow} strokeWidth="1" />
              {[0, 90, 180, 270].map(d => (
                <circle key={d} cx={Math.cos(d * Math.PI / 180) * rr * 0.65} cy={Math.sin(d * Math.PI / 180) * rr * 0.65}
                  r={rr * 0.55} fill="#000" />
              ))}
              <circle r={rr * 0.18} fill={goldRim} opacity="0.85" />
            </g>
          );
        })}
      </g>
    </g>
  );
}
