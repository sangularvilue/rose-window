'use client';

import { useMemo } from 'react';
import { buildTris, SIDE, MEDALLION_SIDE, PALETTE } from '@/lib/engine';
import type { Triangle, SaintKey, TileType } from '@/lib/types';
import GlassDefs from './GlassDefs';
import SaintSymbol from './SaintSymbol';

interface RoseWindowProps {
  S?: number;
  defsId?: string;
  colorFn?: (t: Triangle) => TileType | null;
  colorMap?: Record<number, TileType>;
  pebbles?: Set<number>;
  showLead?: boolean;
  saintKey?: SaintKey | null;
  haloIntensity?: number;
  className?: string;
  style?: React.CSSProperties;
  onTriClick?: (triId: number) => void;
  highlightTris?: Set<number>;
  disabledTris?: Set<number>;
}

export default function RoseWindow({
  S = 220,
  defsId = 'rw',
  colorFn,
  colorMap,
  pebbles = new Set(),
  showLead = true,
  saintKey = null,
  haloIntensity = 1,
  className,
  style,
  onTriClick,
  highlightTris = new Set(),
  disabledTris = new Set(),
}: RoseWindowProps) {
  const tris = useMemo(() => buildTris(S), [S]);
  const W = S * Math.sqrt(3) + 24;
  const H = S * 2 + 24;
  const medallionSide = MEDALLION_SIDE;
  const medR = saintKey ? (medallionSide / SIDE) * S * 0.95 : 0;

  const inMedallion = (t: Triangle) => saintKey && t.ring <= medallionSide;

  const colorOf = (t: Triangle): TileType | null => {
    if (inMedallion(t)) return null;
    if (pebbles.has(t.id)) return 'pebble';
    if (colorMap && colorMap[t.id]) return colorMap[t.id];
    if (colorFn) return colorFn(t) || null;
    return null;
  };

  const strokeWidth = Math.max(0.9, S / 110);

  const hexPoints = [0,1,2,3,4,5].map(k => {
    const a = -Math.PI / 3 + k * Math.PI / 3;
    return `${S * Math.cos(a)},${S * Math.sin(a)}`;
  }).join(' ');

  return (
    <svg
      className={className}
      style={style}
      viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}
      width="100%"
      height="100%"
      overflow="visible"
      preserveAspectRatio="xMidYMid meet"
    >
      <GlassDefs id={defsId} />
      <defs>
        <clipPath id={`${defsId}-hex-clip`}>
          <polygon points={hexPoints} />
        </clipPath>
      </defs>

      {/* Halo — lives outside clipPath so it glows beyond the hex edge */}
      <circle
        className="rw-living-halo"
        cx="0" cy="0"
        r={S * 1.05 * haloIntensity}
        fill={`url(#${defsId}-halo)`}
        opacity="0.85"
      />

      {/* All tile content clipped to hex shape */}
      <g clipPath={`url(#${defsId}-hex-clip)`}>
        {/* Bloom layer */}
        <g filter={`url(#${defsId}-bloom)`} opacity="0.55">
          {tris.map(t => {
            const c = colorOf(t);
            if (!c || c === 'empty') return null;
            const pts = t.points.map(p => `${p.x},${p.y}`).join(' ');
            return <polygon key={'b' + t.id} points={pts} fill={`url(#${defsId}-g-${c})`} />;
          })}
        </g>

        {/* Main tiles */}
        <g>
          {tris.map(t => {
            const c = colorOf(t) || 'empty';
            const pts = t.points.map(p => `${p.x},${p.y}`).join(' ');
            if (c === 'pebble') {
              return (
                <g key={t.id}>
                  <polygon points={pts} fill="#1a1814" />
                  <polygon points={pts} fill={`url(#${defsId}-rock-facet)`} opacity="0.95" />
                  <polygon points={pts} fill="white" filter={`url(#${defsId}-granite)`} opacity="0.6" />
                  <polygon points={pts} fill={`url(#${defsId}-pebble-shine)`} opacity="0.9" />
                </g>
              );
            }
            return <polygon key={t.id} points={pts} fill={`url(#${defsId}-g-${c})`} />;
          })}
        </g>

        {/* Mottling */}
        <defs>
          <mask id={`${defsId}-cells-mask`}>
            <rect x={-W/2} y={-H/2} width={W} height={H} fill="black" />
            {tris.map(t => {
              const c = colorOf(t);
              if (!c || c === 'empty') return null;
              const pts = t.points.map(p => `${p.x},${p.y}`).join(' ');
              return <polygon key={'m' + t.id} points={pts} fill="white" />;
            })}
          </mask>
        </defs>
        <g opacity="0.28">
          <rect x={-W/2} y={-H/2} width={W} height={H} filter={`url(#${defsId}-glass)`} fill="white" mask={`url(#${defsId}-cells-mask)`} />
        </g>
        <g opacity="0.18">
          <rect x={-W/2} y={-H/2} width={W} height={H} filter={`url(#${defsId}-ripple)`} fill="white" mask={`url(#${defsId}-cells-mask)`} />
        </g>
        <g opacity="0.12">
          <rect x={-W/2} y={-H/2} width={W} height={H} filter={`url(#${defsId}-crackle)`} fill="#1a0e04" mask={`url(#${defsId}-cells-mask)`} />
        </g>

        {/* Cell highlights */}
        <g opacity="0.6">
          {tris.map(t => {
            const c = colorOf(t);
            if (!c || c === 'empty' || c === 'pebble') return null;
            const pts = t.points.map(p => `${p.x},${p.y}`).join(' ');
            return <polygon key={'h' + t.id} points={pts} fill={`url(#${defsId}-cell-hi)`} />;
          })}
        </g>

        {/* Lead came */}
        {showLead && (
          <g filter={`url(#${defsId}-solder)`}>
            {tris.map(t => {
              const pts = t.points.map(p => `${p.x},${p.y}`).join(' ');
              return <polygon key={'l' + t.id} points={pts} fill="none"
                stroke={`url(#${defsId}-lead-bevel)`} strokeWidth={strokeWidth} strokeLinejoin="miter" />;
            })}
            {tris.map(t => {
              const pts = t.points.map(p => `${p.x},${p.y}`).join(' ');
              return <polygon key={'lh' + t.id} points={pts} fill="none"
                stroke="#7d603a" strokeOpacity="0.45" strokeWidth={Math.max(0.3, S / 320)} strokeLinejoin="miter" />;
            })}
          </g>
        )}

        {/* Highlight overlay */}
        {highlightTris.size > 0 && tris.map(t => {
          if (!highlightTris.has(t.id)) return null;
          const pts = t.points.map(p => `${p.x},${p.y}`).join(' ');
          return <polygon key={'hl' + t.id} points={pts} fill="rgba(255,224,160,0.35)" stroke="#ffd680" strokeWidth="1" />;
        })}

        {/* Click targets */}
        {onTriClick && tris.map(t => {
          if (inMedallion(t)) return null;
          const pts = t.points.map(p => `${p.x},${p.y}`).join(' ');
          const disabled = disabledTris.has(t.id);
          return (
            <polygon
              key={'click' + t.id}
              points={pts}
              fill="transparent"
              stroke="none"
              style={{ cursor: disabled ? 'default' : 'pointer' }}
              onClick={() => !disabled && onTriClick(t.id)}
            />
          );
        })}
      </g>

      {/* Hex outline */}
      <polygon
        points={[0,1,2,3,4,5].map(k => {
          const a = -Math.PI / 3 + k * Math.PI / 3;
          return `${S * Math.cos(a)},${S * Math.sin(a)}`;
        }).join(' ')}
        fill="none" stroke="#0a0604" strokeWidth={Math.max(2, S / 60)} strokeLinejoin="miter"
      />

      {/* Saint medallion */}
      {saintKey && (
        <g>
          <polygon
            points={[0,1,2,3,4,5].map(k => { const a=-Math.PI/3+k*Math.PI/3; return `${medR*Math.cos(a)},${medR*Math.sin(a)}`; }).join(' ')}
            fill="#0a0604" stroke="#1a1107" strokeWidth={Math.max(2, S/80)} strokeLinejoin="miter"
          />
          <polygon
            points={[0,1,2,3,4,5].map(k => { const a=-Math.PI/3+k*Math.PI/3; return `${medR*0.95*Math.cos(a)},${medR*0.95*Math.sin(a)}`; }).join(' ')}
            fill={`url(#${defsId}-medground-${saintKey})`}
          />
          <SaintSymbol saintKey={saintKey} radius={medR * 0.82} />
        </g>
      )}
    </svg>
  );
}
