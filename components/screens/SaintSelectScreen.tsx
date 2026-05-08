'use client';

import type { GameState, Player } from '@/lib/types';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG, StoneDefs } from '@/components/engine/SceneAtoms';
import { SAINTS, PATTERNS, PALETTE } from '@/lib/engine';
import RoseWindow from '@/components/engine/RoseWindow';

interface Props {
  state: GameState;
  me: Player | null;
  isHost: boolean;
  sendAction: (a: Record<string, unknown>) => void;
  playerId: string;
}

export default function SaintSelectScreen({ state, me, sendAction }: Props) {
  const selected = me?.saint;

  return (
    <div style={{ minHeight: '100dvh', background: STONE_BG, overflow: 'auto', padding: '40px 24px' }}>
      <svg viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <StoneDefs id="ss" />
        <rect width="1280" height="800" fill={STONE_BG} />
        <rect width="1280" height="800" filter="url(#ss-stoneN)" opacity="0.7" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, letterSpacing: 4, color: GOLD_INK, textTransform: 'uppercase' }}>
            Choose Your Patron
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, color: PARCHMENT, marginTop: 4, lineHeight: 1 }}>
            Six saints await commission.
          </div>
          <div style={{ fontSize: 13, color: 'rgba(243,233,210,0.45)', marginTop: 6 }}>
            Each saint shapes how the cathedral sees your window.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {SAINTS.map((s, i) => {
            const isFeatured = selected === s.key;
            const isChosen = state.players.some(p => p.id !== me?.id && p.saint === s.key);
            return (
              <button
                key={s.key}
                onClick={() => !isChosen && sendAction({ type: 'SET_SAINT', saint: s.key })}
                disabled={isChosen}
                style={{
                  background: isFeatured
                    ? 'linear-gradient(180deg, #1c1d2a 0%, #0d0e16 100%)'
                    : '#0e1118',
                  border: isFeatured
                    ? '1px solid rgba(255,210,140,0.55)'
                    : isChosen
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(255,210,140,0.12)',
                  boxShadow: isFeatured ? '0 0 60px rgba(255,200,120,0.25), inset 0 0 0 1px rgba(255,210,140,0.15)' : 'none',
                  padding: '22px 18px',
                  textAlign: 'center',
                  opacity: isChosen ? 0.4 : 1,
                  position: 'relative',
                  cursor: isChosen ? 'default' : 'pointer',
                }}
              >
                <div style={{ width: 160, height: 180, margin: '0 auto 12px' }}>
                  <RoseWindow S={80} defsId={`ss-${s.key}`} colorFn={PATTERNS[s.key]} saintKey={s.key} haloIntensity={0.9} />
                </div>
                <div style={{ position: 'absolute', top: 12, left: 14, fontSize: 10, letterSpacing: 3, color: 'rgba(255,210,140,0.5)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                {isFeatured && (
                  <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 10, letterSpacing: 3, color: GOLD_INK, textTransform: 'uppercase' }}>
                    Selected
                  </div>
                )}
                {isChosen && (
                  <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 10, letterSpacing: 3, color: 'rgba(243,233,210,0.4)', textTransform: 'uppercase' }}>
                    Taken
                  </div>
                )}
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: PARCHMENT, lineHeight: 1.1 }}>{s.name}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 15, color: GOLD_INK, marginTop: 3 }}>{s.epithet}</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 10 }}>
                  {s.colors.map(c => (
                    <div key={c} style={{ width: 16, height: 16, background: PALETTE[c].mid, border: '1px solid rgba(0,0,0,0.6)', boxShadow: `0 0 8px ${PALETTE[c].core}` }} />
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(243,233,210,0.55)', lineHeight: 1.4 }}>{s.line}</div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div style={{ textAlign: 'center', marginTop: 32, fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 18, color: GOLD_INK }}>
            Waiting for all masters to choose their saints…
          </div>
        )}
      </div>
    </div>
  );
}
