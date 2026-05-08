'use client';

import type { SaintKey } from '@/lib/types';

const G = '#f6d676';
const Gd = '#a47a1f';
const Cr = '#fff7d0';
const Dk = '#1a0e04';

export default function SaintSymbol({ saintKey, radius: r }: { saintKey: SaintKey; radius: number }) {
  switch (saintKey) {
    case 'Moreau':
      return (
        <g>
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k * Math.PI) / 6;
            return <line key={k} x1={Math.cos(a)*r*0.35} y1={Math.sin(a)*r*0.35}
              x2={Math.cos(a)*r*0.95} y2={Math.sin(a)*r*0.95}
              stroke={Gd} strokeWidth={r*0.018} opacity="0.7" />;
          })}
          <circle r={r*0.34} fill="none" stroke={G} strokeWidth={r*0.018} opacity="0.7" />
          <rect x={-r*0.05} y={-r*0.78} width={r*0.10} height={r*1.55} fill={G} stroke={Gd} strokeWidth={r*0.012} />
          <rect x={-r*0.42} y={-r*0.55} width={r*0.84} height={r*0.10} fill={G} stroke={Gd} strokeWidth={r*0.012} />
          <path d={`M ${-r*0.42} ${r*0.55} Q ${-r*0.55} ${r*0.78} ${-r*0.18} ${r*0.78}`} fill="none" stroke={G} strokeWidth={r*0.07} strokeLinecap="round" />
          <path d={`M ${r*0.42} ${r*0.55} Q ${r*0.55} ${r*0.78} ${r*0.18} ${r*0.78}`} fill="none" stroke={G} strokeWidth={r*0.07} strokeLinecap="round" />
          <rect x={-r*0.32} y={r*0.50} width={r*0.64} height={r*0.07} fill={Gd} />
          <circle cx="0" cy={-r*0.5} r={r*0.07} fill={Cr} stroke={Gd} strokeWidth={r*0.012} />
        </g>
      );

    case 'Brigid': {
      const arm = (rot: number) => (
        <g transform={`rotate(${rot})`}>
          <rect x={-r*0.10} y={-r*0.85} width={r*0.20} height={r*0.70} fill={G} stroke={Gd} strokeWidth={r*0.012} />
          <rect x={r*0.02} y={-r*0.30} width={r*0.20} height={r*0.20} fill={Gd} />
          <rect x={-r*0.13} y={-r*0.92} width={r*0.26} height={r*0.10} fill={Gd} />
          <line x1={-r*0.06} y1={-r*0.78} x2={-r*0.06} y2={-r*0.20} stroke={Gd} strokeWidth={r*0.010} />
          <line x1={r*0.06} y1={-r*0.78} x2={r*0.06} y2={-r*0.20} stroke={Gd} strokeWidth={r*0.010} />
        </g>
      );
      return (
        <g>
          {[0, 90, 180, 270].map(d => <g key={d}>{arm(d)}</g>)}
          <rect x={-r*0.16} y={-r*0.16} width={r*0.32} height={r*0.32} fill={Cr} stroke={Gd} strokeWidth={r*0.018} />
          <path d={`M 0 ${r*0.10} Q ${r*0.05} 0 0 ${-r*0.06} Q ${-r*0.05} 0 0 ${r*0.10} Z`} fill="#d6263b" />
        </g>
      );
    }

    case 'Lawrence':
      return (
        <g>
          {Array.from({ length: 14 }, (_, k) => {
            const a = -Math.PI / 2 + (k - 7) * 0.20;
            const len = r * (0.85 + 0.10 * Math.sin(k * 1.7));
            return <path key={k} d={`M ${Math.cos(a)*r*0.35} ${Math.sin(a)*r*0.35} Q ${Math.cos(a)*len*0.7} ${Math.sin(a)*len*0.65} ${Math.cos(a)*len} ${Math.sin(a)*len}`}
              stroke={k % 2 ? G : '#ffb066'} strokeWidth={r*0.04} fill="none" strokeLinecap="round" opacity="0.85" />;
          })}
          <rect x={-r*0.55} y={-r*0.40} width={r*1.10} height={r*0.78} fill="none" stroke={G} strokeWidth={r*0.07} />
          {[-0.20, 0, 0.20].map((y, k) => (
            <line key={k} x1={-r*0.55} y1={r*y} x2={r*0.55} y2={r*y} stroke={G} strokeWidth={r*0.05} />
          ))}
          <line x1={-r*0.55} y1={r*0.38} x2={-r*0.78} y2={r*0.78} stroke={G} strokeWidth={r*0.05} strokeLinecap="round" />
          <line x1={r*0.55} y1={r*0.38} x2={r*0.78} y2={r*0.78} stroke={G} strokeWidth={r*0.05} strokeLinecap="round" />
          <circle cx={-r*0.78} cy={r*0.78} r={r*0.06} fill={Gd} />
          <circle cx={r*0.78} cy={r*0.78} r={r*0.06} fill={Gd} />
        </g>
      );

    case 'Francis':
      return (
        <g>
          {Array.from({ length: 16 }, (_, k) => {
            const a = (k * Math.PI) / 8;
            const len = r * (k % 2 ? 0.95 : 0.78);
            return <line key={k} x1={Math.cos(a)*r*0.18} y1={Math.sin(a)*r*0.18 - r*0.05}
              x2={Math.cos(a)*len} y2={Math.sin(a)*len - r*0.05}
              stroke={G} strokeWidth={r*0.022} opacity="0.85" strokeLinecap="round" />;
          })}
          <circle cx="0" cy={-r*0.05} r={r*0.32} fill={G} stroke={Gd} strokeWidth={r*0.018} />
          <g fill={Cr} stroke={Gd} strokeWidth={r*0.010}>
            <ellipse cx="0" cy={r*0.08} rx={r*0.24} ry={r*0.10} />
            <circle cx={r*0.20} cy={-r*0.02} r={r*0.075} />
            <path d={`M ${-r*0.22} ${r*0.04} L ${-r*0.36} ${-r*0.02} L ${-r*0.36} ${r*0.10} L ${-r*0.22} ${r*0.14} Z`} />
            <path d={`M ${-r*0.04} ${r*0.02} Q ${-r*0.08} ${-r*0.18} ${r*0.10} ${-r*0.10} Q ${r*0.06} ${r*0.04} ${-r*0.04} ${r*0.02} Z`} />
            <path d={`M ${r*0.27} ${-r*0.02} L ${r*0.34} ${-r*0.005} L ${r*0.27} ${r*0.01} Z`} fill={Gd} />
          </g>
          <path d={`M ${-r*0.55} ${r*0.55} Q ${-r*0.20} ${r*0.40} ${r*0.25} ${r*0.50}`} stroke={'#5a8a3a'} strokeWidth={r*0.022} fill="none" strokeLinecap="round" />
          {[-0.40, -0.20, 0, 0.18].map((x, k) => (
            <ellipse key={k} cx={r*x} cy={r*(0.46 + k*0.005)} rx={r*0.06} ry={r*0.025} fill={'#7ab050'}
              transform={`rotate(${-15 - k*5} ${r*x} ${r*(0.46 + k*0.005)})`} />
          ))}
        </g>
      );

    case 'Dionysius':
      return (
        <g>
          {Array.from({ length: 48 }, (_, k) => {
            const a = (k * 2 * Math.PI) / 48;
            const inner = r * 0.62;
            const outer = r * (0.92 + 0.04 * Math.sin(k * 0.7));
            return <line key={k} x1={Math.cos(a)*inner} y1={Math.sin(a)*inner}
              x2={Math.cos(a)*outer} y2={Math.sin(a)*outer}
              stroke={k % 4 === 0 ? G : Gd} strokeWidth={r*0.010} opacity={k % 4 === 0 ? 0.9 : 0.5} />;
          })}
          <circle r={r*0.58} fill="none" stroke={G} strokeWidth={r*0.020} opacity="0.9" />
          <circle r={r*0.62} fill="none" stroke={Gd} strokeWidth={r*0.008} opacity="0.6" />
          <circle r={r*0.55} fill={Dk} />
          <line x1={-r*0.18} y1="0" x2={r*0.18} y2="0" stroke="#3a2858" strokeWidth={r*0.008} />
          <line x1="0" y1={-r*0.18} x2="0" y2={r*0.18} stroke="#3a2858" strokeWidth={r*0.008} />
        </g>
      );

    case 'Christopher':
      return (
        <g>
          {[0.55, 0.70, 0.85].map((y, k) => (
            <path key={k}
              d={`M ${-r*0.85} ${r*y} q ${r*0.15} ${-r*0.05} ${r*0.30} 0 t ${r*0.30} 0 t ${r*0.30} 0 t ${r*0.30} 0`}
              stroke={k === 0 ? G : Gd} strokeWidth={r*0.022} fill="none" opacity={1 - k*0.25} strokeLinecap="round" />
          ))}
          <line x1={-r*0.55} y1={r*0.55} x2={r*0.40} y2={-r*0.65} stroke={G} strokeWidth={r*0.07} strokeLinecap="round" />
          <line x1={-r*0.55} y1={r*0.55} x2={r*0.40} y2={-r*0.65} stroke={Gd} strokeWidth={r*0.024} strokeLinecap="round" />
          <ellipse cx={-r*0.05} cy={-r*0.05} rx={r*0.12} ry={r*0.05} fill="#7ab050" stroke={Gd} strokeWidth={r*0.010} transform={`rotate(-50 ${-r*0.05} ${-r*0.05})`} />
          <ellipse cx={r*0.18} cy={-r*0.32} rx={r*0.10} ry={r*0.04} fill="#7ab050" stroke={Gd} strokeWidth={r*0.010} transform={`rotate(-50 ${r*0.18} ${-r*0.32})`} />
          {(() => {
            const cx = r*0.40, cy = -r*0.65, R = r*0.18;
            const pts = Array.from({ length: 10 }, (_, k) => {
              const a = -Math.PI / 2 + (k * Math.PI) / 5;
              const rr = k % 2 ? R*0.42 : R;
              return `${cx + rr*Math.cos(a)},${cy + rr*Math.sin(a)}`;
            }).join(' ');
            return <polygon points={pts} fill={Cr} stroke={Gd} strokeWidth={r*0.014} />;
          })()}
        </g>
      );

    default:
      return null;
  }
}
