'use client';

import { useState } from 'react';
import type { GameState, Player, Lot } from '@/lib/types';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG, StoneDefs, DustMotes } from '@/components/engine/SceneAtoms';
import { PALETTE, toRoman } from '@/lib/engine';
import GlassDefs from '@/components/engine/GlassDefs';

interface Props {
  state: GameState;
  me: Player | null;
  isHost: boolean;
  sendAction: (a: Record<string, unknown>) => void;
  playerId: string;
  revealed?: boolean;
}

function LotPreview({ lot }: { lot: Lot }) {
  const triangles = lot.shape.triangles;
  const color = lot.color === 'pebble' ? 'pebble' : lot.color;
  return (
    <svg viewBox="-70 -60 140 120" width="160" height="130">
      <GlassDefs id={`lot-${lot.id}`} />
      {triangles.map((tri, i) => {
        const pts = [];
        for (let j = 0; j < tri.length; j += 2) {
          pts.push(`${tri[j]},${tri[j+1]}`);
        }
        return (
          <polygon key={i} points={pts.join(' ')}
            fill={`url(#lot-${lot.id}-g-${color})`}
            stroke="#0a0604" strokeWidth="1.4" />
        );
      })}
    </svg>
  );
}

export default function AuctionScreen({ state, me, sendAction, revealed }: Props) {
  const [bids, setBids] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const myGold = me?.gold ?? 0;
  const alreadyBid = state.bids[me?.id ?? ''] !== undefined;
  const isWaiting = alreadyBid && !revealed;

  function handleBidChange(lotId: string, val: string) {
    const n = parseInt(val) || 0;
    setBids(prev => ({ ...prev, [lotId]: Math.min(myGold, Math.max(0, n)) }));
  }

  async function handleSubmit() {
    const bidMap: Record<string, number> = {};
    for (const lot of state.lots) {
      bidMap[lot.id] = bids[lot.id] ?? 0;
    }
    setSubmitted(true);
    await sendAction({ type: 'SUBMIT_BIDS', bids: bidMap });
  }

  const bidders = state.players.map(p => ({
    player: p,
    sealed: state.bids[p.id] !== undefined,
  }));

  // Get my winning lot if revealed
  const myResult = revealed ? state.auctionResults.find(r => r.winnerId === me?.id) : null;
  const myWonLot = myResult ? state.lots.find(l => l.id === myResult.lotId) : null;

  return (
    <div style={{ minHeight: '100dvh', background: STONE_BG, color: PARCHMENT, position: 'relative', overflow: 'hidden' }}>
      <svg viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <StoneDefs id="au" />
        <rect width="1280" height="800" fill={STONE_BG} />
        <rect width="1280" height="800" filter="url(#au-stoneN)" opacity="0.7" />
        <ellipse cx="640" cy="80" rx="700" ry="200" fill="url(#rw-halo)" opacity="0.4" />
        <DustMotes x={120} y={70} w={1040} h={350} count={70} seed={41} />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, letterSpacing: 4, color: GOLD_INK, textTransform: 'uppercase' }}>
            Round {toRoman(state.round)} · Sealed Bids
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: PARCHMENT, marginTop: 4 }}>
            {revealed ? 'The bids are revealed.' : "Today's lots are revealed."}
          </div>
          {!revealed && (
            <div style={{ fontSize: 13, color: 'rgba(243,233,210,0.55)', marginTop: 6 }}>
              Bid secretly on every lot. The highest bid anywhere wins; winner pays one more than second-highest.
            </div>
          )}
        </div>

        {revealed && myWonLot && myResult && (
          <div style={{ textAlign: 'center', marginBottom: 24, padding: '14px 24px', background: 'rgba(255,224,160,0.06)', border: '1px solid rgba(255,210,140,0.4)' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: PARCHMENT }}>
              You won: <span style={{ color: GOLD_INK }}>{myWonLot.label}</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(243,233,210,0.7)', marginTop: 4 }}>
              Price paid: {myResult.price} gold
            </div>
          </div>
        )}

        {/* Lots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'center', marginBottom: 36 }}>
          {state.lots.map((lot, i) => {
            const result = revealed ? state.auctionResults.find(r => r.lotId === lot.id) : null;
            const winner = result ? state.players.find(p => p.id === result.winnerId) : null;
            return (
              <div key={lot.id} style={{
                width: 220, padding: '20px 16px',
                background: 'linear-gradient(180deg, rgba(20,22,32,0.95), rgba(8,10,16,0.95))',
                border: `1px solid ${result?.winnerId === me?.id ? 'rgba(255,210,140,0.55)' : 'rgba(255,210,140,0.18)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative',
              }}>
                <div style={{ fontSize: 9, letterSpacing: 3, color: lot.category === 'pebble' ? '#e89a8a' : GOLD_INK }}>
                  {lot.category === 'pebble' ? 'HOSTILE' : 'GLASS'}
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, color: PARCHMENT, marginTop: 2, textAlign: 'center' }}>{lot.label}</div>
                <div style={{ marginTop: 10 }}><LotPreview lot={lot} /></div>
                {!revealed && !alreadyBid && (
                  <div style={{ marginTop: 10, width: '100%' }}>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD_INK, marginBottom: 4 }}>YOUR BID</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number"
                        min={0}
                        max={myGold}
                        value={bids[lot.id] ?? ''}
                        onChange={e => handleBidChange(lot.id, e.target.value)}
                        placeholder="0"
                        style={{
                          flex: 1, height: 36, border: '1px solid rgba(255,210,140,0.4)',
                          background: 'rgba(0,0,0,0.4)', color: PARCHMENT,
                          fontFamily: FONT_DISPLAY, fontSize: 22, textAlign: 'center', outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: 11, color: 'rgba(243,233,210,0.5)' }}>g</span>
                    </div>
                  </div>
                )}
                {(alreadyBid || submitted) && !revealed && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(243,233,210,0.5)' }}>
                    Bid sealed
                  </div>
                )}
                {revealed && result && (
                  <div style={{ marginTop: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: winner?.id === me?.id ? GOLD_INK : 'rgba(243,233,210,0.5)' }}>
                      {winner ? `${winner.name} · ${result.price}g` : 'Unclaimed'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit / status */}
        {!alreadyBid && !submitted && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleSubmit}
              style={{
                padding: '13px 44px', background: 'rgba(255,224,160,0.1)',
                border: '1px solid rgba(255,224,160,0.55)', color: PARCHMENT,
                letterSpacing: 4, fontSize: 13, textTransform: 'uppercase',
              }}
            >
              Seal &amp; Submit
            </button>
            <div style={{ fontSize: 11, color: 'rgba(243,233,210,0.45)', marginTop: 8 }}>
              You have {myGold} gold.
            </div>
          </div>
        )}

        {/* Bidder status */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 28 }}>
          {bidders.map(({ player, sealed }) => (
            <div key={player.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 26,
                background: sealed ? '#0a0c14' : 'rgba(255,224,160,0.12)',
                border: `1px solid ${player.id === me?.id ? GOLD_INK : 'rgba(255,210,140,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: PARCHMENT,
              }}>
                {sealed ? '🔏' : '✍️'}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, color: PARCHMENT }}>
                {player.name}{player.id === me?.id ? ' (you)' : ''}
              </div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: sealed ? 'rgba(243,233,210,0.5)' : GOLD_INK }}>
                {sealed ? 'SEALED' : 'BIDDING'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
