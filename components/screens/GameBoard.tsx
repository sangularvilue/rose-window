'use client';

import { useState, useMemo, useEffect } from 'react';
import type { GameState, Player, Color, TileType } from '@/lib/types';
import { COLORS } from '@/lib/types';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG, StoneDefs, LightFan, DustMotes, RoomLight, TraceryFrame } from '@/components/engine/SceneAtoms';
import { PATTERNS, SAINT_LIGHT, SAINTS, PALETTE, toRoman, buildTris, MEDALLION_SIDE, validatePlacementShape } from '@/lib/engine';
import RoseWindow from '@/components/engine/RoseWindow';
import GlassDefs from '@/components/engine/GlassDefs';
import type { Lot } from '@/lib/types';

interface Props {
  state: GameState;
  me: Player | null;
  isHost: boolean;
  sendAction: (a: Record<string, unknown>) => void;
  playerId: string;
}

// ─── Demand sidebar ──────────────────────────────────────────────────────────

function DemandBar({ color, value, threshold }: { color: Color; value: number; threshold: number }) {
  const p = PALETTE[color];
  const max = Math.max(threshold * 1.2, value * 1.1, 1);
  const pct = Math.min(1, value / max);
  const tpct = Math.min(1, threshold / max);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
      <div style={{ width: 10, height: 10, background: p.mid, flexShrink: 0 }} />
      <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.5)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${pct * 100}%`, background: p.mid }} />
        <div style={{ position: 'absolute', top: -2, bottom: -2, left: `${tpct * 100}%`, width: 1, background: '#ffd680' }} />
      </div>
      <div style={{ width: 24, textAlign: 'right', fontSize: 10, color: 'rgba(243,233,210,0.7)', flexShrink: 0 }}>{value}</div>
    </div>
  );
}

// ─── Lot shape preview ───────────────────────────────────────────────────────

function LotPreview({ lot }: { lot: Lot }) {
  const color = lot.color === 'pebble' ? 'pebble' : lot.color;
  return (
    <svg viewBox="-70 -60 140 120" width="80" height="68">
      <GlassDefs id={`lot-prev-${lot.id}`} />
      {lot.shape.triangles.map((tri, i) => {
        const pts = [];
        for (let j = 0; j < tri.length; j += 2) pts.push(`${tri[j]},${tri[j + 1]}`);
        return <polygon key={i} points={pts.join(' ')} fill={`url(#lot-prev-${lot.id}-g-${color})`} stroke="#0a0604" strokeWidth="1.4" />;
      })}
    </svg>
  );
}

// ─── Auction panel ───────────────────────────────────────────────────────────

function AuctionPanel({ state, me, sendAction }: { state: GameState; me: Player | null; sendAction: Props['sendAction'] }) {
  const [bids, setBids] = useState<Record<string, number>>({});
  const [revealIdx, setRevealIdx] = useState(-1);

  const myGold = me?.gold ?? 0;
  const alreadyBid = state.bids[me?.id ?? ''] !== undefined;
  const isReveal = state.phase === 'auction_reveal';

  useEffect(() => {
    if (!isReveal) { setRevealIdx(-1); return; }
    let i = 0;
    const step = () => {
      setRevealIdx(i);
      i++;
      if (i < state.auctionResults.length) setTimeout(step, 900);
    };
    const t = setTimeout(step, 400);
    return () => clearTimeout(t);
  }, [isReveal, state.auctionResults.length]);

  async function handleSubmit() {
    const bidMap: Record<string, number> = {};
    for (const lot of state.lots) bidMap[lot.id] = bids[lot.id] ?? 0;
    await sendAction({ type: 'SUBMIT_BIDS', bids: bidMap });
  }

  if (isReveal) {
    return (
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD_INK, marginBottom: 12 }}>THE CATHEDRAL SPEAKS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {state.auctionResults.map((res, i) => {
            const winner = state.players.find(p => p.id === res.winnerId);
            const lot = state.lots.find(l => l.id === res.lotId);
            const visible = i <= revealIdx;
            return (
              <div key={res.lotId} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                background: visible ? 'rgba(196,149,58,0.1)' : 'rgba(0,0,0,0.2)',
                border: `1px solid rgba(255,210,140,${visible ? '0.3' : '0.06'})`,
                transition: 'all 0.5s ease', opacity: visible ? 1 : 0.2,
              }}>
                {lot && <LotPreview lot={lot} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: visible ? PARCHMENT : 'rgba(243,233,210,0.3)' }}>
                    {visible ? (winner?.name ?? '—') : '???'}
                  </div>
                  <div style={{ fontSize: 11, color: visible ? GOLD_INK : 'rgba(196,149,58,0.3)' }}>
                    {visible ? `${lot?.label ?? ''} · paid ${res.price}g` : '…'}
                  </div>
                </div>
                {visible && <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: GOLD_INK }}>{res.price}g</div>}
              </div>
            );
          })}
        </div>
        {revealIdx >= state.auctionResults.length - 1 && (
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: 'rgba(243,233,210,0.5)', fontFamily: FONT_DISPLAY, fontStyle: 'italic' }}>
            Moving to placement…
          </div>
        )}
      </div>
    );
  }

  if (alreadyBid) {
    return (
      <div style={{ padding: '16px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 18, color: GOLD_INK, marginBottom: 6 }}>Bids sealed.</div>
        <div style={{ fontSize: 12, color: 'rgba(243,233,210,0.5)' }}>
          Waiting for {state.players.filter(p => state.bids[p.id] === undefined).map(p => p.name).join(', ') || 'all'}…
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD_INK, marginBottom: 4 }}>SEALED BIDS · {myGold}g available</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        {state.lots.map(lot => (
          <div key={lot.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,210,140,0.15)', minWidth: 90 }}>
            <LotPreview lot={lot} />
            <div style={{ fontSize: 10, color: 'rgba(243,233,210,0.7)', textAlign: 'center', lineHeight: 1.2 }}>{lot.label}</div>
            <input
              type="number" min={0} max={myGold} value={bids[lot.id] ?? 0}
              onChange={e => setBids(prev => ({ ...prev, [lot.id]: Math.min(myGold, Math.max(0, parseInt(e.target.value) || 0)) }))}
              style={{
                width: 52, padding: '4px 6px', textAlign: 'center',
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,210,140,0.3)',
                color: PARCHMENT, fontFamily: FONT_DISPLAY, fontSize: 18, outline: 'none',
              }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        style={{
          width: '100%', padding: '10px 0',
          background: 'rgba(255,224,160,0.1)', border: '1px solid rgba(255,224,160,0.5)',
          color: PARCHMENT, letterSpacing: 4, fontSize: 12, textTransform: 'uppercase',
        }}
      >
        Seal Bids
      </button>
    </div>
  );
}

// ─── Placement panel ─────────────────────────────────────────────────────────

function PlacementPanel({ state, me, sendAction, playerId, onHighlight, onSetInteractive }: {
  state: GameState; me: Player | null; sendAction: Props['sendAction']; playerId: string;
  onHighlight: (ids: Set<number>) => void;
  onSetInteractive: (fn: ((id: number) => void) | null) => void;
}) {
  const [selectedTris, setSelectedTris] = useState<number[]>([]);
  const [targetPlayerId, setTargetPlayerId] = useState('');
  const [shapeError, setShapeError] = useState('');

  const myResult = state.auctionResults.find(r => r.winnerId === playerId);
  const myLot = myResult ? state.lots.find(l => l.id === myResult.lotId) : null;
  const isMyTurn = state.pendingPlacements[0] === playerId;
  const waitingFor = state.pendingPlacements.filter(id => id !== playerId);
  const isPebble = myLot?.category === 'pebble';
  const neededCount = myLot?.shape.triangles.length ?? 1;
  const opponents = state.players.filter(p => p.id !== playerId);

  const allTris = useMemo(() => buildTris(220), []);
  const existingIds = useMemo(() => new Set(Object.keys(me?.board ?? {}).map(Number)), [me?.board]);
  const medallionIds = useMemo(() => new Set(allTris.filter(t => t.ring <= MEDALLION_SIDE).map(t => t.id)), [allTris]);

  useEffect(() => {
    onHighlight(new Set(selectedTris));
  }, [selectedTris, onHighlight]);

  useEffect(() => {
    if (!isMyTurn || !myLot || isPebble) {
      onSetInteractive(null);
      return;
    }
    onSetInteractive((id: number) => {
      if (existingIds.has(id) || medallionIds.has(id)) return;
      setShapeError('');
      setSelectedTris(prev => {
        if (prev.includes(id)) return prev.filter(x => x !== id);
        if (prev.length >= neededCount) return [...prev.slice(1), id];
        return [...prev, id];
      });
    });
    return () => onSetInteractive(null);
  }, [isMyTurn, myLot, isPebble, neededCount, existingIds, medallionIds, onSetInteractive]);

  async function handlePlace() {
    if (!myLot || !myResult) return;
    if (isPebble) {
      if (!targetPlayerId || selectedTris.length === 0) return;
      await sendAction({ type: 'PLACE_HOSTILE', targetPlayerId, triIds: selectedTris, lotId: myLot.id });
    } else {
      if (selectedTris.length !== neededCount) return;
      if (!validatePlacementShape(selectedTris, myLot.shape.triangles, allTris)) {
        setShapeError(`That's not the right shape. Select ${neededCount} cells matching the ${myLot.shape.kind} pattern.`);
        return;
      }
      await sendAction({ type: 'PLACE_TILE', triIds: selectedTris, lotId: myLot.id });
    }
    setSelectedTris([]);
    setShapeError('');
  }

  if (!myLot) {
    return (
      <div style={{ padding: '16px 20px' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, color: GOLD_INK, marginBottom: 4 }}>Watching…</div>
        <div style={{ fontSize: 12, color: 'rgba(243,233,210,0.5)' }}>
          Waiting for {waitingFor.map(id => state.players.find(p => p.id === id)?.name).join(', ')}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LotPreview lot={myLot} />
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD_INK }}>YOUR LOT</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: PARCHMENT }}>{myLot.label}</div>
            <div style={{ fontSize: 11, color: isPebble ? '#e89a8a' : 'rgba(243,233,210,0.6)' }}>
              {isPebble ? 'Hostile · place on a rival' : `${neededCount} cells · ${myLot.shape.kind}`}
            </div>
          </div>
        </div>

        {isMyTurn && (
          <div style={{ flex: 1, minWidth: 180 }}>
            {isPebble && opponents.length > 0 && (
              <div style={{ marginBottom: 8, display: 'flex', gap: 6 }}>
                {opponents.map(p => (
                  <button key={p.id} onClick={() => { setTargetPlayerId(p.id); setSelectedTris([]); }}
                    style={{
                      padding: '4px 10px', fontFamily: FONT_DISPLAY, fontSize: 13, color: PARCHMENT,
                      background: targetPlayerId === p.id ? 'rgba(255,90,90,0.2)' : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${targetPlayerId === p.id ? 'rgba(255,90,90,0.5)' : 'rgba(255,90,90,0.2)'}`,
                    }}
                  >{p.name}</button>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'rgba(243,233,210,0.5)', marginBottom: 8 }}>
              {isPebble
                ? (targetPlayerId ? `Click ${neededCount} cell(s) on their window.` : 'Pick a target above.')
                : `Click ${neededCount} cell(s) on your window. (${selectedTris.length}/${neededCount})`
              }
            </div>
            {shapeError && <div style={{ fontSize: 11, color: '#e89a8a', marginBottom: 6 }}>{shapeError}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handlePlace}
                disabled={isPebble ? (!targetPlayerId || selectedTris.length === 0) : selectedTris.length !== neededCount}
                style={{
                  padding: '8px 20px', background: 'rgba(255,224,160,0.1)',
                  border: '1px solid rgba(255,224,160,0.5)', color: PARCHMENT,
                  letterSpacing: 3, fontSize: 12, textTransform: 'uppercase',
                }}
              >Place</button>
              <button onClick={() => sendAction({ type: 'SKIP_PLACEMENT' })}
                style={{
                  padding: '8px 16px', background: 'transparent',
                  border: '1px solid rgba(255,210,140,0.15)', color: 'rgba(243,233,210,0.5)',
                  letterSpacing: 3, fontSize: 11, textTransform: 'uppercase',
                }}
              >Skip</button>
            </div>
          </div>
        )}
        {!isMyTurn && (
          <div style={{ fontSize: 12, color: 'rgba(243,233,210,0.5)', alignSelf: 'center' }}>
            Waiting for {waitingFor.map(id => state.players.find(p => p.id === id)?.name).join(', ')}…
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scoring panel ───────────────────────────────────────────────────────────

function ScoringPanel({ state }: { state: GameState }) {
  const threshold = state.thresholds[state.round - 1] ?? 25;
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  return (
    <div style={{ padding: '16px 20px', maxHeight: '38vh', overflowY: 'auto' }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD_INK, marginBottom: 10 }}>
        END OF ROUND {state.round} · RESOLUTION
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          {COLORS.map(c => {
            const v = state.demand[c]; const p = PALETTE[c];
            const met = v >= threshold;
            return (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, background: p.mid, flexShrink: 0 }} />
                <div style={{ flex: 1, height: 8, background: 'rgba(0,0,0,0.4)', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${Math.min(1, v / Math.max(threshold * 1.1, 1)) * 100}%`, background: p.mid }} />
                </div>
                <span style={{ fontSize: 10, color: met ? '#bde6a0' : 'rgba(243,233,210,0.5)', width: 32, textAlign: 'right' }}>{v}</span>
                <span style={{ fontSize: 10, color: met ? '#bde6a0' : '#e89a8a', width: 16 }}>{met ? '✓' : '✗'}</span>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          {sorted.map((p, i) => {
            const delta = p.roundScores[p.roundScores.length - 1] ?? 0;
            return (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,210,140,0.06)' }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: i === 0 ? GOLD_INK : PARCHMENT }}>{p.name}</span>
                <span style={{ fontSize: 12, color: delta >= 0 ? '#bde6a0' : '#e89a8a' }}>
                  {delta >= 0 ? '+' : ''}{delta} · {p.score}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Rule removal panel ──────────────────────────────────────────────────────

function RuleRemovalPanel({ state, sendAction, playerId }: { state: GameState; sendAction: Props['sendAction']; playerId: string }) {
  const isMyTurn = state.ruleRemovalPlayerId === playerId;
  const actor = state.players.find(p => p.id === state.ruleRemovalPlayerId);
  return (
    <div style={{ padding: '16px 20px', maxHeight: '40vh', overflowY: 'auto' }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD_INK, marginBottom: 4 }}>RULE REMOVAL</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: PARCHMENT, marginBottom: 10 }}>
        {isMyTurn ? 'Remove a rule card.' : `${actor?.name ?? '—'} removes a rule…`}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {state.activeRules.map(rule => {
          const eraColor = rule.era === 'Penalty' ? '#e89a8a' : rule.era === 'Bonus' ? '#bde6a0' : GOLD_INK;
          return (
            <div key={rule.id} style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,210,140,0.15)', width: 200 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: eraColor, marginBottom: 2 }}>{rule.era.toUpperCase()}</div>
              <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 15, color: PARCHMENT, marginBottom: 4 }}>{rule.title}</div>
              <div style={{ fontSize: 10, color: 'rgba(243,233,210,0.5)', lineHeight: 1.4, marginBottom: isMyTurn ? 8 : 0 }}>{rule.body}</div>
              {isMyTurn && (
                <button onClick={() => sendAction({ type: 'REMOVE_RULE', ruleId: rule.id })}
                  style={{
                    width: '100%', padding: '5px 0', background: 'rgba(255,90,90,0.1)',
                    border: '1px solid rgba(255,90,90,0.4)', color: '#e89a8a',
                    fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                  }}
                >Remove</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Game over panel ─────────────────────────────────────────────────────────

function GameOverPanel({ state }: { state: GameState }) {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  return (
    <div style={{ padding: '16px 20px', maxHeight: '45vh', overflowY: 'auto' }}>
      <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD_INK, marginBottom: 4 }}>THE COMMISSION IS COMPLETE</div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, color: PARCHMENT, marginBottom: 12 }}>
        {winner?.name} wins · {winner?.score} prestige
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {sorted.map((p, i) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: i === 0 ? 'rgba(196,149,58,0.1)' : 'transparent', border: '1px solid rgba(255,210,140,0.08)' }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: i === 0 ? GOLD_INK : PARCHMENT }}>
              {i + 1}. {p.name} · {SAINTS.find(s => s.key === p.saint)?.name ?? p.saint}
            </span>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: i === 0 ? GOLD_INK : 'rgba(243,233,210,0.7)' }}>{p.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main GameBoard ──────────────────────────────────────────────────────────

const PHASE_LABELS: Partial<Record<string, string>> = {
  income: 'Income', market: 'The Market Opens', auction: 'Sealed-Bid Auction',
  auction_reveal: 'The Verdict', placement: 'Placement', demand_update: 'Demand Updates',
  end_round: 'Resolution', rule_removal: 'Rule Removal', game_over: 'Game Over',
};

export default function GameBoard({ state, me, isHost, sendAction, playerId }: Props) {
  const saintKey = me?.saint ?? 'Moreau';
  const L = SAINT_LIGHT[saintKey] ?? SAINT_LIGHT.Moreau;
  const phase = state.phase;

  const [highlightTris, setHighlightTris] = useState(new Set<number>());
  const [onTriClick, setOnTriClick] = useState<((id: number) => void) | null>(null);

  const colorMap: Record<number, TileType> = useMemo(
    () => me?.board ? Object.fromEntries(Object.entries(me.board).map(([k, v]) => [Number(k), v as TileType])) : {},
    [me?.board],
  );

  const disabledTris = useMemo(() => {
    const s = new Set<number>();
    Object.keys(colorMap).forEach(k => s.add(Number(k)));
    return s;
  }, [colorMap]);

  const roundLabel = state.round ? `Round ${toRoman(state.round)} of ${toRoman(6)}` : '';
  const phaseLabel = PHASE_LABELS[phase] ?? '';
  const threshold = state.thresholds[state.round - 1] ?? 25;

  const bottomPanel = () => {
    switch (phase) {
      case 'auction':
      case 'auction_reveal':
        return <AuctionPanel state={state} me={me} sendAction={sendAction} />;
      case 'placement':
        return (
          <PlacementPanel
            state={state} me={me} sendAction={sendAction} playerId={playerId}
            onHighlight={setHighlightTris}
            onSetInteractive={(fn) => setOnTriClick(() => fn)}
          />
        );
      case 'end_round':
        return <ScoringPanel state={state} />;
      case 'rule_removal':
        return <RuleRemovalPanel state={state} sendAction={sendAction} playerId={playerId} />;
      case 'game_over':
        return <GameOverPanel state={state} />;
      default:
        return (
          <div style={{ padding: '16px 20px', fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, color: GOLD_INK }}>
            {phaseLabel || 'The cathedral waits…'}
          </div>
        );
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden', background: STONE_BG }}>

      {/* Cathedral background */}
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <StoneDefs id="gb" />
        <rect width="1440" height="900" fill={STONE_BG} />
        <rect width="1440" height="900" filter="url(#gb-stoneN)" opacity="0.7" />
        <ellipse cx="720" cy="420" rx="600" ry="500" fill="url(#rw-halo)" opacity="0.6" />
        <ellipse cx="720" cy="420" rx="380" ry="340" fill={L.warm} opacity="0.14" filter="url(#rw-bloom-lg)" />
        <RoomLight saintKey={saintKey} cx={720} cy={840} w={1200} h={320} opacity={0.5} />
        <g transform="translate(720,420)">
          <TraceryFrame S={280} defsId="gb-tr" showArch={false} />
        </g>
        <LightFan cx={720} cy={420} opacity={0.35} beams={[
          { angle: -Math.PI * 0.78, width: 120, length: 640, color: L.warm },
          { angle: -Math.PI * 0.5,  width: 80,  length: 560, color: L.accent },
          { angle: Math.PI * 0.78,  width: 130, length: 580, color: L.accent },
        ]} />
        <DustMotes x={200} y={80} w={1040} h={740} count={120} seed={7} saintKey={saintKey} />
      </svg>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        background: 'linear-gradient(to bottom, rgba(8,10,16,0.85), transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, letterSpacing: 3, color: GOLD_INK }}>{roundLabel}</span>
          <span style={{ fontSize: 11, color: 'rgba(243,233,210,0.5)', letterSpacing: 1 }}>{phaseLabel}</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3,4,5,6].map(r => (
            <div key={r} style={{ width: 6, height: 6, borderRadius: 3, background: r <= state.round ? GOLD_INK : 'rgba(196,149,58,0.2)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ fontSize: 11, color: 'rgba(243,233,210,0.7)' }}>{me?.gold ?? 0}g</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: GOLD_INK }}>{me?.score ?? 0}</span>
        </div>
      </div>

      {/* Left side: demand bars */}
      <div style={{
        position: 'absolute', left: 0, top: 48, bottom: 0, zIndex: 10,
        width: 160, padding: '16px 12px',
        background: 'linear-gradient(to right, rgba(8,10,16,0.75) 60%, transparent)',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD_INK, marginBottom: 8 }}>DEMAND · {threshold}</div>
        {COLORS.map(c => <DemandBar key={c} color={c} value={state.demand[c]} threshold={threshold} />)}
        <div style={{ marginTop: 12, fontSize: 9, letterSpacing: 2, color: 'rgba(196,149,58,0.5)' }}>RULES · {state.activeRules.length}</div>
        {state.activeRules.slice(0, 4).map(r => (
          <div key={r.id} style={{ marginTop: 4, fontSize: 9, color: 'rgba(243,233,210,0.45)', lineHeight: 1.3 }}>{r.title}</div>
        ))}
      </div>

      {/* Right side: opponents */}
      <div style={{
        position: 'absolute', right: 0, top: 48, bottom: 0, zIndex: 10,
        width: 150, padding: '16px 12px',
        background: 'linear-gradient(to left, rgba(8,10,16,0.75) 60%, transparent)',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD_INK, marginBottom: 8 }}>MASTERS</div>
        {state.players.filter(p => p.id !== playerId).map(p => (
          <div key={p.id} style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, color: 'rgba(243,233,210,0.8)' }}>{p.name}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 10, color: GOLD_INK }}>
              {SAINTS.find(s => s.key === p.saint)?.name ?? '—'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(243,233,210,0.5)' }}>{p.score} pts · {p.gold}g</div>
          </div>
        ))}
      </div>

      {/* Rose window — always centered, fills the space */}
      <div style={{
        position: 'absolute',
        inset: '48px 150px 0 160px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 5,
      }}>
        <div style={{
          width: 'min(100%, calc(100dvh * 0.82 * 0.87))',
          aspectRatio: '405 / 464',
          maxHeight: 'calc(100% - 16px)',
        }}>
          <RoseWindow
            S={220}
            defsId="gb-rw"
            colorMap={colorMap}
            saintKey={me?.saint ?? null}
            colorFn={me?.saint ? undefined : PATTERNS.Moreau}
            highlightTris={highlightTris}
            disabledTris={disabledTris}
            onTriClick={onTriClick ?? undefined}
          />
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: 'rgba(8,10,16,0.92)',
        borderTop: '1px solid rgba(255,210,140,0.18)',
        backdropFilter: 'blur(4px)',
        maxHeight: '42vh',
        overflowY: 'auto',
      }}>
        {bottomPanel()}
      </div>
    </div>
  );
}
