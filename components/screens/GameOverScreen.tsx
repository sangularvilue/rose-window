'use client';

import Link from 'next/link';
import type { GameState, Player } from '@/lib/types';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG, StoneDefs, LightFan } from '@/components/engine/SceneAtoms';
import { SAINTS, PATTERNS, SAINT_LIGHT } from '@/lib/engine';
import RoseWindow from '@/components/engine/RoseWindow';
import type { TileType } from '@/lib/types';

interface Props {
  state: GameState;
  me: Player | null;
  isHost: boolean;
  sendAction: (a: Record<string, unknown>) => void;
  playerId: string;
}

export default function GameOverScreen({ state, me }: Props) {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const L = winner.saint ? SAINT_LIGHT[winner.saint] : SAINT_LIGHT.Moreau;

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: STONE_BG, color: PARCHMENT, overflow: 'hidden' }}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <StoneDefs id="go" />
        <rect width="1440" height="900" fill={STONE_BG} />
        <rect width="1440" height="900" filter="url(#go-stoneN)" opacity="0.7" />
        <LightFan cx={720} cy={-40} opacity={0.5} beams={[
          { angle: Math.PI * 0.5, width: 180, length: 900, color: L.warm },
          { angle: Math.PI * 0.35, width: 140, length: 900, color: L.cool },
          { angle: Math.PI * 0.65, width: 160, length: 900, color: L.accent },
          { angle: Math.PI * 0.2, width: 100, length: 900, color: L.warm },
          { angle: Math.PI * 0.8, width: 100, length: 900, color: L.cool },
        ]} />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, letterSpacing: 4, color: GOLD_INK, textTransform: 'uppercase' }}>
            The Cathedral Is Complete
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 52, color: PARCHMENT, lineHeight: 1, marginTop: 4 }}>
            {winner.id === me?.id ? 'Your window shines brightest.' : `${winner.name}'s window shines brightest.`}
          </div>
        </div>

        {/* Winner showcase */}
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', alignItems: 'flex-start', marginBottom: 40 }}>
          <div style={{ width: 300, height: 340 }}>
            {winner.saint && (
              <RoseWindow
                S={140}
                defsId="go-winner"
                colorMap={Object.fromEntries(Object.entries(winner.board).map(([k, v]) => [Number(k), v as TileType]))}
                saintKey={winner.saint}
                haloIntensity={1.2}
              />
            )}
          </div>
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD_INK, marginBottom: 6 }}>CHAMPION</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, color: PARCHMENT, lineHeight: 1 }}>{winner.name}</div>
            {winner.saint && (
              <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 20, color: GOLD_INK, marginTop: 4 }}>
                {SAINTS.find(s => s.key === winner.saint)?.name}
              </div>
            )}
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 72, color: GOLD_INK, textShadow: '0 0 24px rgba(255,210,140,0.5)', lineHeight: 1, marginTop: 12 }}>
              {winner.score}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(243,233,210,0.5)', marginTop: 4 }}>prestige</div>
          </div>
        </div>

        {/* All standings */}
        <div style={{ padding: '24px 28px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.2)', marginBottom: 32 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, letterSpacing: 3, color: GOLD_INK, textTransform: 'uppercase', marginBottom: 16 }}>
            Final Standings
          </div>
          {sorted.map((p, rank) => {
            const saintInfo = SAINTS.find(s => s.key === p.saint);
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '36px 72px 1fr auto', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: rank < sorted.length - 1 ? '1px solid rgba(255,210,140,0.08)' : 'none' }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 24, color: rank === 0 ? GOLD_INK : 'rgba(243,233,210,0.4)', textAlign: 'center' }}>
                  {rank + 1}
                </div>
                {p.saint ? (
                  <div style={{ width: 64, height: 72 }}>
                    <RoseWindow S={32} defsId={`go-${p.id}`} colorFn={PATTERNS[p.saint]} saintKey={p.saint} haloIntensity={0.7} />
                  </div>
                ) : <div style={{ width: 64 }} />}
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: rank === 0 ? PARCHMENT : 'rgba(243,233,210,0.8)' }}>
                    {p.name}{p.id === me?.id ? ' (you)' : ''}
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, color: GOLD_INK }}>{saintInfo?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: rank === 0 ? GOLD_INK : PARCHMENT, textShadow: rank === 0 ? '0 0 16px rgba(255,210,140,0.4)' : 'none', fontVariantNumeric: 'tabular-nums' }}>
                    {p.score}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(243,233,210,0.4)' }}>prestige</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/" style={{
            padding: '13px 36px', background: 'rgba(255,224,160,0.08)',
            border: '1px solid rgba(255,224,160,0.4)', color: PARCHMENT,
            letterSpacing: 4, fontSize: 13, textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Return to the Cathedral
          </Link>
        </div>
      </div>
    </div>
  );
}
