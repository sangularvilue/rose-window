'use client';

import type { GameState, Player, Color } from '@/lib/types';
import { COLORS } from '@/lib/types';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG, StoneDefs, LightFan } from '@/components/engine/SceneAtoms';
import { PALETTE, toRoman, PATTERNS } from '@/lib/engine';
import RoseWindow from '@/components/engine/RoseWindow';
import type { TileType } from '@/lib/types';

interface Props {
  state: GameState;
  me: Player | null;
  isHost: boolean;
  sendAction: (a: Record<string, unknown>) => void;
  playerId: string;
}

export default function ScoringScreen({ state, me, isHost, sendAction }: Props) {
  const threshold = state.thresholds[state.round - 1] ?? 25;

  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const colorMap: Record<number, TileType> = me?.board
    ? Object.fromEntries(Object.entries(me.board).map(([k, v]) => [Number(k), v as TileType]))
    : {};

  const lastRoundScores = state.players.reduce<Record<string, number>>((acc, p) => {
    acc[p.id] = p.roundScores[p.roundScores.length - 1] ?? 0;
    return acc;
  }, {});

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: STONE_BG, color: PARCHMENT, overflow: 'hidden' }}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <StoneDefs id="sc" />
        <rect width="1440" height="900" fill={STONE_BG} />
        <rect width="1440" height="900" filter="url(#sc-stoneN)" opacity="0.7" />
        <LightFan cx={720} cy={-40} opacity={0.35} beams={[
          { angle: Math.PI * 0.5, width: 100, length: 700, color: '#ffd680' },
          { angle: Math.PI * 0.35, width: 80, length: 700, color: '#ffe39a' },
          { angle: Math.PI * 0.65, width: 110, length: 700, color: '#7faaff' },
        ]} />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, letterSpacing: 4, color: GOLD_INK, textTransform: 'uppercase' }}>
              Round {toRoman(state.round)} of VI · Resolution
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: PARCHMENT, lineHeight: 1.1 }}>
              The Cathedral Inspects Your Window
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3,4,5,6].map(r => (
              <div key={r} style={{ width: 10, height: 10, borderRadius: 5, background: r <= state.round ? GOLD_INK : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Left: window */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '100%', maxWidth: 460, aspectRatio: '1/1.1', position: 'relative' }}>
              <RoseWindow S={200} defsId="sc-rw" colorMap={colorMap} saintKey={me?.saint ?? null} />
              {/* Score callouts */}
              {me?.roundScores.length && (
                <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                  fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 44,
                  color: (lastRoundScores[me.id] ?? 0) >= 0 ? GOLD_INK : '#e89a8a',
                  textShadow: '0 0 24px rgba(255,224,160,0.5)', whiteSpace: 'nowrap' }}>
                  {(lastRoundScores[me.id] ?? 0) >= 0 ? '+' : ''}{lastRoundScores[me.id] ?? 0}
                </div>
              )}
            </div>
          </div>

          {/* Right: demand ledger */}
          <div style={{ padding: '24px 24px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.18)' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, letterSpacing: 3, color: GOLD_INK, textTransform: 'uppercase' }}>Demand Ledger</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: PARCHMENT, marginBottom: 16 }}>
              Threshold met where light has gathered.
            </div>
            {COLORS.map(color => {
              const p = PALETTE[color];
              const demand = state.demand[color] ?? 0;
              const max = Math.max(threshold, demand) * 1.05;
              const pct = Math.min(1, demand / max);
              const tpct = Math.min(1, threshold / max);
              return (
                <div key={color} style={{ display: 'grid', gridTemplateColumns: '20px 80px 1fr 60px', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,210,140,0.06)' }}>
                  <div style={{ width: 16, height: 16, background: p.mid, boxShadow: `0 0 8px ${p.core}` }} />
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: PARCHMENT, textTransform: 'capitalize' }}>{color}</div>
                  <div style={{ position: 'relative', height: 8, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,140,0.08)' }}>
                    <div style={{ position: 'absolute', inset: 0, width: `${pct * 100}%`, background: `linear-gradient(90deg, ${p.edge}, ${p.mid}, ${p.core})` }} />
                    <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${tpct * 100}%`, width: 1, background: '#ffd680' }} />
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, textAlign: 'right', color: demand >= threshold ? '#bde6a0' : PARCHMENT, fontVariantNumeric: 'tabular-nums' }}>
                    {demand}
                  </div>
                </div>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,210,140,0.2)' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: PARCHMENT }}>Net prestige</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 48, color: (lastRoundScores[me?.id ?? ''] ?? 0) >= 0 ? '#d6eba8' : '#e89a8a', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {(lastRoundScores[me?.id ?? ''] ?? 0) >= 0 ? '+' : ''}{lastRoundScores[me?.id ?? ''] ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Standings */}
        <div style={{ padding: '14px 22px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.18)', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 12, letterSpacing: 3, color: GOLD_INK, textTransform: 'uppercase', flexShrink: 0 }}>Standings</div>
          <div style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {sorted.map((p, rank) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: 12, color: p.id === me?.id ? GOLD_INK : 'rgba(243,233,210,0.65)', letterSpacing: 1 }}>
                  {rank + 1}. {p.name}
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: PARCHMENT, fontVariantNumeric: 'tabular-nums' }}>{p.score}</div>
                <div style={{ fontSize: 11, color: (lastRoundScores[p.id] ?? 0) >= 0 ? '#bde6a0' : '#e89a8a' }}>
                  {(lastRoundScores[p.id] ?? 0) >= 0 ? '+' : ''}{lastRoundScores[p.id] ?? 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note: round end handled by game.ts auto-advancing to rule_removal */}
        <div style={{ textAlign: 'center', marginTop: 20, fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 15, color: 'rgba(243,233,210,0.4)' }}>
          The last-place master will now remove a rule card…
        </div>
      </div>
    </div>
  );
}
