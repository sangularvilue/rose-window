'use client';

import { useState, useMemo } from 'react';
import type { GameState, Player } from '@/lib/types';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG, StoneDefs, RoomLight, TraceryFrame } from '@/components/engine/SceneAtoms';
import { PATTERNS, SAINT_LIGHT, SAINTS, buildTris, MEDALLION_SIDE, PALETTE } from '@/lib/engine';
import RoseWindow from '@/components/engine/RoseWindow';
import type { TileType } from '@/lib/types';

interface Props {
  state: GameState;
  me: Player | null;
  isHost: boolean;
  sendAction: (a: Record<string, unknown>) => void;
  playerId: string;
}

export default function PlacementScreen({ state, me, sendAction, playerId }: Props) {
  const myResult = state.auctionResults.find(r => r.winnerId === playerId);
  const myLot = myResult ? state.lots.find(l => l.id === myResult.lotId) : null;
  const isMyTurn = state.pendingPlacements[0] === playerId;

  const [selectedTris, setSelectedTris] = useState<number[]>([]);
  const [targetPlayerId, setTargetPlayerId] = useState<string>('');

  const saintKey = me?.saint || 'Moreau';
  const L = SAINT_LIGHT[saintKey] || SAINT_LIGHT.Moreau;

  const tris = useMemo(() => buildTris(220), []);
  const inMedallion = (id: number) => {
    const t = tris.find(t => t.id === id);
    return t ? t.ring <= MEDALLION_SIDE : false;
  };

  const colorMap: Record<number, TileType> = me?.board
    ? Object.fromEntries(Object.entries(me.board).map(([k, v]) => [Number(k), v as TileType]))
    : {};

  const disabledTris = useMemo(() => {
    const s = new Set<number>();
    for (const t of tris) {
      if (t.ring <= MEDALLION_SIDE) s.add(t.id);
      if (colorMap[t.id]) s.add(t.id);
    }
    return s;
  }, [tris, me?.board]);

  const highlightTris = useMemo(() => new Set(selectedTris), [selectedTris]);

  const neededCount = myLot?.shape.triangles.length ?? 1;

  function handleTriClick(triId: number) {
    if (!isMyTurn || !myLot) return;
    if (myLot.category === 'pebble') return; // handled separately
    setSelectedTris(prev => {
      if (prev.includes(triId)) return prev.filter(id => id !== triId);
      if (prev.length >= neededCount) return [...prev.slice(1), triId];
      return [...prev, triId];
    });
  }

  async function handlePlace() {
    if (!myLot || !myResult) return;
    if (myLot.category === 'pebble') {
      if (!targetPlayerId) return;
      await sendAction({ type: 'PLACE_HOSTILE', targetPlayerId, triIds: selectedTris, lotId: myLot.id });
    } else {
      if (selectedTris.length !== neededCount) return;
      await sendAction({ type: 'PLACE_TILE', triIds: selectedTris, lotId: myLot.id });
    }
    setSelectedTris([]);
  }

  async function handleSkip() {
    await sendAction({ type: 'SKIP_PLACEMENT' });
  }

  const opponents = state.players.filter(p => p.id !== playerId);
  const waitingFor = state.pendingPlacements.filter(id => id !== playerId);
  const saintInfo = SAINTS.find(s => s.key === saintKey);

  // Display for target player's board (hostile placement)
  const targetPlayer = opponents.find(p => p.id === targetPlayerId);
  const targetColorMap: Record<number, TileType> = targetPlayer?.board
    ? Object.fromEntries(Object.entries(targetPlayer.board).map(([k, v]) => [Number(k), v as TileType]))
    : {};

  if (!myLot) {
    // Not a winner — just watching
    return (
      <div style={{ minHeight: '100dvh', background: STONE_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: PARCHMENT }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontStyle: 'italic', color: GOLD_INK }}>
          Watching placement…
        </div>
        <div style={{ fontSize: 14, color: 'rgba(243,233,210,0.55)' }}>
          Waiting for {waitingFor.map(id => state.players.find(p => p.id === id)?.name).join(', ')}
        </div>
      </div>
    );
  }

  const isPebble = myLot.category === 'pebble';

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: STONE_BG, color: PARCHMENT, overflow: 'hidden' }}>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <StoneDefs id="pl" />
        <rect width="1440" height="900" fill={STONE_BG} />
        <rect width="1440" height="900" filter="url(#pl-stoneN)" opacity="0.65" />
        <RoomLight saintKey={saintKey} cx={720} cy={840} w={1100} h={300} opacity={0.45} />
        <g transform="translate(720,450)">
          <TraceryFrame S={240} defsId="pl-tr" showArch={false} />
        </g>
      </svg>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,10,16,0.8)', borderBottom: '1px solid rgba(255,210,140,0.1)' }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, letterSpacing: 3, color: GOLD_INK }}>Placement Phase</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: PARCHMENT }}>
            {isMyTurn ? `Place your ${myLot.label}` : 'Waiting for others…'}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(243,233,210,0.5)' }}>
          {waitingFor.length > 0 && `Waiting: ${waitingFor.map(id => state.players.find(p => p.id === id)?.name).join(', ')}`}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 16, padding: '80px 16px 16px', minHeight: '100dvh' }}>
        {/* Sidebar */}
        <div style={{ width: 260, flexShrink: 0 }}>
          {/* My won lot info */}
          <div style={{ padding: '18px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.3)', marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD_INK, marginBottom: 6 }}>YOUR LOT</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: PARCHMENT }}>{myLot.label}</div>
            <div style={{ marginTop: 4, fontSize: 12, color: isPebble ? '#e89a8a' : GOLD_INK }}>
              {isPebble ? 'Hostile · place on a rival\'s window' : `${neededCount} triangle${neededCount > 1 ? 's' : ''} to place`}
            </div>
            {myLot.color !== 'pebble' && (
              <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                <div style={{ width: 16, height: 16, background: PALETTE[myLot.color as string]?.mid, boxShadow: `0 0 8px ${PALETTE[myLot.color as string]?.core}`, border: '1px solid rgba(0,0,0,0.5)' }} />
                <span style={{ fontSize: 12, color: 'rgba(243,233,210,0.7)', textTransform: 'capitalize' }}>{String(myLot.color)}</span>
              </div>
            )}
            <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(243,233,210,0.4)' }}>
              Paid: {myResult?.price ?? 0} gold
            </div>
          </div>

          {/* Pebble target selector */}
          {isPebble && isMyTurn && opponents.length > 0 && (
            <div style={{ padding: '14px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,90,90,0.25)', marginBottom: 12 }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: '#e89a8a', marginBottom: 10 }}>TARGET WINDOW</div>
              {opponents.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setTargetPlayerId(p.id); setSelectedTris([]); }}
                  style={{
                    width: '100%', padding: '8px 10px', marginBottom: 6, textAlign: 'left',
                    background: targetPlayerId === p.id ? 'rgba(255,90,90,0.15)' : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${targetPlayerId === p.id ? 'rgba(255,90,90,0.5)' : 'rgba(255,90,90,0.15)'}`,
                    color: PARCHMENT, fontFamily: FONT_DISPLAY, fontSize: 16,
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}

          {/* Instruction */}
          {isMyTurn && (
            <div style={{ padding: '14px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.1)', marginBottom: 12, fontSize: 12, color: 'rgba(243,233,210,0.55)', lineHeight: 1.5 }}>
              {isPebble
                ? (targetPlayerId ? `Click ${neededCount} cell(s) on ${targetPlayer?.name}'s window.` : 'Select a target player first.')
                : `Click ${neededCount} empty cell(s) on your window. ${selectedTris.length}/${neededCount} selected.`
              }
            </div>
          )}

          {/* Action buttons */}
          {isMyTurn && (
            <>
              <button
                onClick={handlePlace}
                disabled={isPebble ? (selectedTris.length === 0 || !targetPlayerId) : selectedTris.length !== neededCount}
                style={{
                  width: '100%', padding: '11px 0', marginBottom: 8,
                  background: 'rgba(255,224,160,0.1)', border: '1px solid rgba(255,224,160,0.5)',
                  color: PARCHMENT, letterSpacing: 3, fontSize: 12, textTransform: 'uppercase',
                }}
              >
                Place
              </button>
              <button
                onClick={handleSkip}
                style={{
                  width: '100%', padding: '9px 0',
                  background: 'transparent', border: '1px solid rgba(255,210,140,0.15)',
                  color: 'rgba(243,233,210,0.5)', letterSpacing: 3, fontSize: 11, textTransform: 'uppercase',
                }}
              >
                Skip
              </button>
            </>
          )}
        </div>

        {/* Board */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isPebble && targetPlayerId && targetPlayer ? (
            <div style={{ width: '100%', maxWidth: 520, aspectRatio: '1/1.1' }}>
              <RoseWindow
                S={220}
                defsId="pl-target"
                colorMap={targetColorMap}
                saintKey={targetPlayer.saint}
                highlightTris={highlightTris}
                disabledTris={new Set(Object.keys(targetColorMap).map(Number))}
                onTriClick={isMyTurn ? (id) => {
                  setSelectedTris(prev => {
                    if (prev.includes(id)) return prev.filter(x => x !== id);
                    if (prev.length >= neededCount) return [...prev.slice(1), id];
                    return [...prev, id];
                  });
                } : undefined}
              />
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: 520, aspectRatio: '1/1.1' }}>
              <RoseWindow
                S={220}
                defsId="pl-rw"
                colorMap={colorMap}
                saintKey={saintKey}
                highlightTris={highlightTris}
                disabledTris={disabledTris}
                onTriClick={isMyTurn && !isPebble ? handleTriClick : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
