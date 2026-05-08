'use client';

const MED_GROUNDS: Record<string, [string, string, string]> = {
  Moreau:      ['#0e1a3a', '#1a2c5a', '#3a5fa0'],
  Brigid:      ['#0a1e10', '#1a4020', '#3a7a3a'],
  Lawrence:    ['#1a0408', '#3a0610', '#7a1820'],
  Francis:     ['#0e1f14', '#1f4028', '#3a6a4a'],
  Dionysius:   ['#0a0414', '#1c0a30', '#3a1860'],
  Christopher: ['#10142a', '#22305a', '#4a6090'],
};

const PALETTE: Record<string, { core: string; mid: string; edge: string }> = {
  red:    { core: '#ff8b9c', mid: '#d6263b', edge: '#5a0814' },
  blue:   { core: '#a3c8ff', mid: '#3863d8', edge: '#0a1a55' },
  gold:   { core: '#fff5c4', mid: '#e7b045', edge: '#724107' },
  green:  { core: '#c0eaa0', mid: '#4a9650', edge: '#143d1a' },
  purple: { core: '#e8c2f0', mid: '#8c3fc4', edge: '#330757' },
  empty:  { core: '#3b2f23', mid: '#231a13', edge: '#0e0a07' },
  pebble: { core: '#2a2a2e', mid: '#0c0c10', edge: '#000' },
};

export default function GlassDefs({ id = 'rw' }: { id?: string }) {
  return (
    <defs>
      {Object.entries(MED_GROUNDS).map(([k, [a, b, c]]) => (
        <radialGradient key={k} id={`${id}-medground-${k}`} cx="0.5" cy="0.5" r="0.7">
          <stop offset="0" stopColor={c} />
          <stop offset="0.55" stopColor={b} />
          <stop offset="1" stopColor={a} />
        </radialGradient>
      ))}
      {Object.entries(PALETTE).map(([k, p]) => (
        <radialGradient key={k} id={`${id}-g-${k}`} cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor={p.core} />
          <stop offset="0.45" stopColor={p.mid} />
          <stop offset="1" stopColor={p.edge} />
        </radialGradient>
      ))}
      <filter id={`${id}-glass`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3" />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 -0.18" />
      </filter>
      <filter id={`${id}-ripple`} x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="turbulence" baseFrequency="3.4 0.6" numOctaves="2" seed="11" />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.45 -0.20" />
      </filter>
      <filter id={`${id}-crackle`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="19" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -10 4" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
      <radialGradient id={`${id}-cell-hi`} cx="0.30" cy="0.18" r="0.55">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
        <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.10" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-lead-bevel`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5a4630" stopOpacity="0.85" />
        <stop offset="0.35" stopColor="#1c130a" />
        <stop offset="1" stopColor="#000" />
      </linearGradient>
      <filter id={`${id}-bloom`} x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
      <filter id={`${id}-bloom-lg`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="22" />
      </filter>
      <filter id={`${id}-haze`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <filter id={`${id}-granite`} x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="2" seed="13" />
        <feColorMatrix values="0 0 0 0 0.18  0 0 0 0 0.18  0 0 0 0 0.20  0 0 0 0.95 -0.30" />
      </filter>
      <linearGradient id={`${id}-rock-facet`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5e5a55" />
        <stop offset="0.45" stopColor="#2a2622" />
        <stop offset="1" stopColor="#0a0908" />
      </linearGradient>
      <radialGradient id={`${id}-pebble-shine`} cx="0.32" cy="0.22" r="0.55">
        <stop offset="0" stopColor="#a09484" stopOpacity="0.85" />
        <stop offset="0.4" stopColor="#5a544c" stopOpacity="0.4" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <filter id={`${id}-solder`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="23" />
        <feDisplacementMap in="SourceGraphic" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`${id}-stone`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
        <feColorMatrix values="0 0 0 0 0.06  0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0.55 0" />
      </filter>
      <radialGradient id={`${id}-halo`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff4d0" stopOpacity="0.95" />
        <stop offset="0.35" stopColor="#ffd47a" stopOpacity="0.45" />
        <stop offset="0.7" stopColor="#7a4a18" stopOpacity="0.18" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${id}-lead`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a1107" />
        <stop offset="1" stopColor="#040201" />
      </linearGradient>
    </defs>
  );
}
