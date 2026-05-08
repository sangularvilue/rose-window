'use client';

import Link from 'next/link';
import RoseWindow from '@/components/engine/RoseWindow';
import { TraceryFrame, LightFan, DustMotes, RoomLight, StoneDefs, FONT_DISPLAY, PARCHMENT, GOLD_INK } from '@/components/engine/SceneAtoms';
import { PATTERNS, SAINT_LIGHT } from '@/lib/engine';

export default function TitleScreen() {
  const L = SAINT_LIGHT.Moreau;
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', overflow: 'hidden', background: '#0f1218' }}>
      {/* Stone backdrop SVG */}
      <svg viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <StoneDefs id="title" />
        <rect width="1280" height="800" fill="#0f1218" />
        <rect width="1280" height="800" filter="url(#title-stoneN)" opacity="0.85" />
        {/* Cathedral arch */}
        <path d="M 320 800 L 320 360 C 320 220 460 100 640 100 C 820 100 960 220 960 360 L 960 800 Z"
          fill="#080a10" opacity="0.9" />
        <RoomLight saintKey="Moreau" cx={640} cy={720} w={900} h={300} opacity={0.55} />
        <circle cx="640" cy="380" r="320" fill="url(#rw-halo)" opacity="0.85" />
        <circle cx="640" cy="380" r="260" fill={L.warm} opacity="0.18" filter="url(#rw-bloom-lg)" style={{ mixBlendMode: 'screen' }} />
        <g transform="translate(640,380)">
          <TraceryFrame S={220} defsId="title-tr" archHeight={1.6} />
        </g>
      </svg>

      {/* Rose Window */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -58%)', width: 480, height: 540, maxWidth: '80vw' }}>
        <RoseWindow S={220} defsId="rw" colorFn={PATTERNS.Moreau} saintKey="Moreau" haloIntensity={1.1} />
      </div>

      {/* God rays + dust */}
      <svg viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <LightFan cx={640} cy={380} opacity={0.55} beams={[
          { angle: Math.PI * 0.55, width: 90, length: 480, color: L.warm },
          { angle: Math.PI * 0.65, width: 70, length: 520, color: L.cool },
          { angle: Math.PI * 0.45, width: 80, length: 460, color: L.accent },
          { angle: Math.PI * 0.78, width: 60, length: 420, color: L.cool },
          { angle: Math.PI * 0.32, width: 50, length: 400, color: L.warm },
        ]} />
        <DustMotes x={300} y={300} w={680} h={460} count={140} seed={11} saintKey="Moreau" />
      </svg>

      {/* Title text + buttons */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 24px 60px',
        background: 'linear-gradient(to top, rgba(8,9,16,0.9) 60%, transparent)',
      }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 'clamp(48px, 8vw, 92px)',
          fontWeight: 500, letterSpacing: 18, color: PARCHMENT,
          textTransform: 'uppercase', textShadow: '0 2px 24px rgba(255,210,140,0.35)',
          lineHeight: 1,
        }}>
          Rose Window
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 'clamp(14px, 2vw, 22px)',
          letterSpacing: 4, color: GOLD_INK, marginTop: 6,
        }}>
          a game of stained glass &amp; sealed bids
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/lobby?action=new" style={{
            padding: '12px 28px',
            background: 'rgba(255,224,160,0.08)',
            border: '1px solid rgba(255,224,160,0.5)',
            color: PARCHMENT, letterSpacing: 3, fontSize: 13,
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            New Game
          </Link>
          <Link href="/lobby?action=join" style={{
            padding: '12px 28px',
            background: 'transparent',
            border: '1px solid rgba(255,224,160,0.2)',
            color: 'rgba(243,233,210,0.7)', letterSpacing: 3, fontSize: 13,
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Join Room
          </Link>
          <Link href="/how-to-play" style={{
            padding: '12px 28px',
            background: 'transparent',
            border: '1px solid rgba(255,224,160,0.2)',
            color: 'rgba(243,233,210,0.7)', letterSpacing: 3, fontSize: 13,
            textTransform: 'uppercase', textDecoration: 'none',
          }}>
            How to Play
          </Link>
        </div>
      </div>
    </div>
  );
}
