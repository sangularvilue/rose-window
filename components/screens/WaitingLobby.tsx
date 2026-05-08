'use client';

import type { GameState, Player } from '@/lib/types';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG } from '@/components/engine/SceneAtoms';
import { SAINTS } from '@/lib/engine';
import RoseWindow from '@/components/engine/RoseWindow';
import { PATTERNS } from '@/lib/engine';

interface Props {
  state: GameState;
  me: Player | null;
  isHost: boolean;
  sendAction: (a: Record<string, unknown>) => void;
  playerId: string;
}

export default function WaitingLobby({ state, me, isHost, sendAction }: Props) {
  const allReady = state.players.length >= 2 && state.players.every(p => p.saint !== null);
  const mySaint = me?.saint;

  return (
    <div style={{ minHeight: '100dvh', background: STONE_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 640, padding: '40px 36px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.25)' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, letterSpacing: 4, color: GOLD_INK, textTransform: 'uppercase', marginBottom: 4 }}>
          Room · {state.roomId}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: PARCHMENT, marginBottom: 6, lineHeight: 1.1 }}>
          The Cathedral Awaits
        </div>
        <div style={{ fontSize: 12, color: 'rgba(243,233,210,0.5)', marginBottom: 28, letterSpacing: 1 }}>
          Share the room code · up to 3 players
        </div>

        {/* Room code display */}
        <div style={{ textAlign: 'center', marginBottom: 32, padding: '18px 0', border: '1px solid rgba(255,210,140,0.15)', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD_INK, marginBottom: 8 }}>ROOM CODE</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 56, letterSpacing: 14, color: PARCHMENT, lineHeight: 1 }}>
            {state.roomId}
          </div>
        </div>

        {/* Players */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: GOLD_INK, marginBottom: 12 }}>MASTERS ({state.players.length}/3)</div>
          {state.players.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid rgba(255,210,140,0.08)' }}>
              {p.saint ? (
                <div style={{ width: 48, height: 52 }}>
                  <RoseWindow S={24} defsId={`wl-${p.id}`} colorFn={PATTERNS[p.saint]} saintKey={p.saint} haloIntensity={0.7} />
                </div>
              ) : (
                <div style={{ width: 48, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,210,140,0.2)', color: 'rgba(243,233,210,0.3)', fontSize: 11 }}>?</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: p.id === me?.id ? PARCHMENT : 'rgba(243,233,210,0.7)' }}>
                  {p.name} {p.id === me?.id ? '(you)' : ''}
                  {state.hostId === p.id && <span style={{ fontSize: 10, letterSpacing: 2, color: GOLD_INK, marginLeft: 8 }}>HOST</span>}
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, color: GOLD_INK }}>
                  {p.saint ? (SAINTS.find(s => s.key === p.saint)?.name || p.saint) : 'Choosing saint…'}
                </div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: p.saint ? '#bde6a0' : 'rgba(255,255,255,0.15)' }} />
            </div>
          ))}
          {state.players.length < 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', opacity: 0.3 }}>
              <div style={{ width: 48, height: 52, border: '1px dashed rgba(255,210,140,0.2)' }} />
              <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, color: PARCHMENT }}>
                Waiting for another master…
              </div>
            </div>
          )}
        </div>

        {/* Saint selector for self */}
        {me && !me.saint && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: GOLD_INK, marginBottom: 12 }}>CHOOSE YOUR SAINT</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {SAINTS.map(s => (
                <button
                  key={s.key}
                  onClick={() => sendAction({ type: 'SET_SAINT', saint: s.key })}
                  style={{
                    padding: '10px 6px',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,210,140,0.2)',
                    color: PARCHMENT, textAlign: 'center',
                  }}
                >
                  <div style={{ width: 60, height: 68, margin: '0 auto 6px' }}>
                    <RoseWindow S={30} defsId={`wl-sel-${s.key}`} colorFn={PATTERNS[s.key]} saintKey={s.key} haloIntensity={0.8} />
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, lineHeight: 1.2 }}>{s.name}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 11, color: GOLD_INK }}>{s.epithet}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isHost && (
          <button
            onClick={() => sendAction({ type: 'START_GAME' })}
            disabled={!allReady}
            style={{
              width: '100%', padding: '13px 0',
              background: allReady ? 'rgba(255,224,160,0.12)' : 'rgba(255,224,160,0.04)',
              border: `1px solid rgba(255,224,160,${allReady ? '0.5' : '0.15'})`,
              color: PARCHMENT, letterSpacing: 4, fontSize: 13, textTransform: 'uppercase',
            }}
          >
            {allReady ? 'Begin the Commission' : 'Waiting for all saints…'}
          </button>
        )}
        {!isHost && (
          <div style={{ textAlign: 'center', fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 15, color: 'rgba(243,233,210,0.5)' }}>
            Waiting for host to begin…
          </div>
        )}
      </div>
    </div>
  );
}
