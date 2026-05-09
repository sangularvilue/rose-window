'use client';

import { useState } from 'react';
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

export default function WaitingLobby({ state, me, isHost, sendAction, playerId }: Props) {
  const [joinName, setJoinName] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  const allReady = state.players.length >= 2 && state.players.every(p => p.saint !== null);

  async function handleJoin() {
    if (!joinName.trim()) { setJoinError('Enter your name'); return; }
    if (state.players.length >= 3) { setJoinError('Room is full'); return; }
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: state.roomId, playerId, playerName: joinName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('rw-player-name', joinName.trim());
    } catch (e) {
      setJoinError(String(e));
    } finally {
      setJoining(false);
    }
  }

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

        {/* Join form for visitors not yet in the room */}
        {!me && state.players.length < 3 && (
          <div style={{ marginBottom: 24, padding: '20px', background: 'rgba(196,149,58,0.06)', border: '1px solid rgba(196,149,58,0.25)' }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: GOLD_INK, marginBottom: 12 }}>ENTER THE CATHEDRAL</div>
            <input
              type="text"
              value={joinName}
              onChange={e => setJoinName(e.target.value)}
              placeholder="Your name…"
              maxLength={20}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              style={{
                width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,210,140,0.3)', color: PARCHMENT,
                fontFamily: FONT_DISPLAY, fontSize: 18, outline: 'none',
                marginBottom: joinError ? 8 : 12, boxSizing: 'border-box',
              }}
            />
            {joinError && <div style={{ fontSize: 12, color: '#e89a8a', marginBottom: 8 }}>{joinError}</div>}
            <button
              onClick={handleJoin}
              disabled={joining}
              style={{
                width: '100%', padding: '11px 0',
                background: 'rgba(255,224,160,0.1)', border: '1px solid rgba(255,224,160,0.5)',
                color: PARCHMENT, letterSpacing: 4, fontSize: 12, textTransform: 'uppercase',
              }}
            >
              {joining ? 'Entering…' : 'Join Room'}
            </button>
          </div>
        )}

        {!me && state.players.length >= 3 && (
          <div style={{ marginBottom: 24, textAlign: 'center', fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, color: 'rgba(243,233,210,0.5)' }}>
            This room is full.
          </div>
        )}

        {/* Saint selector for self */}
        {me && !me.saint && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: GOLD_INK, marginBottom: 12 }}>CHOOSE YOUR SAINT</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {SAINTS.map(s => {
                const taken = state.players.some(p => p.id !== me.id && p.saint === s.key);
                return (
                  <button
                    key={s.key}
                    onClick={() => !taken && sendAction({ type: 'SET_SAINT', saint: s.key })}
                    disabled={taken}
                    style={{
                      padding: '10px 6px',
                      background: taken ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.4)',
                      border: `1px solid rgba(255,210,140,${taken ? '0.08' : '0.2'})`,
                      color: taken ? 'rgba(243,233,210,0.3)' : PARCHMENT,
                      textAlign: 'center', cursor: taken ? 'default' : 'pointer',
                    }}
                  >
                    <div style={{ width: 60, height: 68, margin: '0 auto 6px', opacity: taken ? 0.3 : 1 }}>
                      <RoseWindow S={30} defsId={`wl-sel-${s.key}`} colorFn={PATTERNS[s.key]} saintKey={s.key} haloIntensity={0.8} />
                    </div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, lineHeight: 1.2 }}>{s.name}</div>
                    <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 11, color: taken ? 'rgba(196,149,58,0.3)' : GOLD_INK }}>
                      {taken ? 'Taken' : s.epithet}
                    </div>
                  </button>
                );
              })}
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
        {me && !isHost && (
          <div style={{ textAlign: 'center', fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 15, color: 'rgba(243,233,210,0.5)' }}>
            Waiting for host to begin…
          </div>
        )}
      </div>
    </div>
  );
}
