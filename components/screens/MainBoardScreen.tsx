'use client';

import type { GameState, Player, Color } from '@/lib/types';
import { COLORS } from '@/lib/types';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG, StoneDefs, LightFan, DustMotes, RoomLight, TraceryFrame } from '@/components/engine/SceneAtoms';
import { PATTERNS, SAINT_LIGHT, SAINTS, toRoman, PALETTE } from '@/lib/engine';
import RoseWindow from '@/components/engine/RoseWindow';

interface Props {
  state: GameState;
  me: Player | null;
  isHost: boolean;
  sendAction: (a: Record<string, unknown>) => void;
  playerId: string;
  waiting?: boolean;
}

function DemandBar({ color, value, threshold }: { color: Color; value: number; threshold: number }) {
  const p = PALETTE[color];
  const max = Math.max(threshold * 1.2, value * 1.1);
  const pct = Math.min(1, value / max);
  const tpct = Math.min(1, threshold / max);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <div style={{ width: 14, height: 14, background: p.mid, boxShadow: `0 0 10px ${p.core}`, border: '1px solid rgba(0,0,0,0.5)', flexShrink: 0 }} />
      <div style={{ flex: 1, height: 18, background: 'rgba(0,0,0,0.4)', position: 'relative', border: '1px solid rgba(255,210,140,0.15)' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${pct * 100}%`, background: `linear-gradient(90deg, ${p.edge}, ${p.mid}, ${p.core})`, boxShadow: `inset 0 0 8px ${p.core}` }} />
        <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${tpct * 100}%`, width: 1, background: '#ffd680' }} />
      </div>
      <div style={{ width: 36, textAlign: 'right', fontSize: 12, color: 'rgba(243,233,210,0.85)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{value}</div>
    </div>
  );
}

export default function MainBoardScreen({ state, me, isHost, sendAction, waiting }: Props) {
  const saintKey = me?.saint || 'Moreau';
  const L = SAINT_LIGHT[saintKey] || SAINT_LIGHT.Moreau;
  const threshold = state.thresholds[state.round - 1] ?? 25;
  const saintInfo = SAINTS.find(s => s.key === saintKey);
  const others = state.players.filter(p => p.id !== me?.id);

  const colorMap = me?.board
    ? Object.fromEntries(Object.entries(me.board).map(([k, v]) => [Number(k), v]))
    : {};

  const phaseNames: Partial<Record<string, string>> = {
    income: 'Income Phase', market: 'The Market Opens', demand_update: 'Demand Updates',
    auction: 'Awaiting Auction', placement: 'Placement Phase',
  };
  const phaseName = phaseNames[state.phase] ?? 'The Cathedral';

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', overflow: 'hidden', background: STONE_BG, color: PARCHMENT }}>
      {/* Background SVG */}
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <StoneDefs id="mb" />
        <rect width="1440" height="900" fill={STONE_BG} />
        <rect width="1440" height="900" filter="url(#mb-stoneN)" opacity="0.65" />
        <ellipse cx="720" cy="460" rx="540" ry="420" fill="url(#rw-halo)" opacity="0.7" />
        <ellipse cx="720" cy="460" rx="380" ry="340" fill={L.warm} opacity="0.18" filter="url(#rw-bloom-lg)" style={{ mixBlendMode: 'screen' }} />
        <RoomLight saintKey={saintKey} cx={720} cy={840} w={1100} h={300} opacity={0.55} />
        <g transform="translate(720,460)">
          <TraceryFrame S={250} defsId="mb-tr" showArch={false} />
        </g>
        <LightFan cx={720} cy={460} opacity={0.45} beams={[
          { angle: -Math.PI * 0.78, width: 120, length: 600, color: L.warm },
          { angle: -Math.PI * 0.5,  width: 80,  length: 540, color: L.accent },
          { angle: Math.PI * 0.78,  width: 130, length: 540, color: L.accent },
        ]} />
        <DustMotes x={300} y={150} w={840} h={620} count={100} seed={29} saintKey={saintKey} />
      </svg>

      {/* Responsive layout wrapper */}
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'min(300px,28%) 1fr min(300px,28%)', minHeight: '100dvh', gap: 0, padding: '80px 16px 16px' }}>
        {/* Left: Demand + Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 12 }}>
          <div style={{ padding: '18px 18px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.15)' }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 12, letterSpacing: 3, color: GOLD_INK, textTransform: 'uppercase', marginBottom: 4 }}>Public Demand</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: PARCHMENT, marginBottom: 12 }}>Threshold · {threshold}</div>
            {COLORS.map(c => <DemandBar key={c} color={c} value={state.demand[c]} threshold={threshold} />)}
            <div style={{ fontSize: 10, color: 'rgba(243,233,210,0.4)', letterSpacing: 1, marginTop: 10 }}>
              First to reach {threshold} ends the round.
            </div>
          </div>
          <div style={{ padding: '16px 18px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.15)', flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 12, letterSpacing: 3, color: GOLD_INK, textTransform: 'uppercase', marginBottom: 10 }}>
              Rules · {state.activeRules.length} active
            </div>
            {state.activeRules.map((r, i) => (
              <div key={r.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < state.activeRules.length - 1 ? '1px solid rgba(255,210,140,0.06)' : 'none' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 9, letterSpacing: 2, color: r.era === 'Income' ? '#ffd680' : '#c98ee0' }}>{r.era.toUpperCase()}</span>
                  <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 15, color: PARCHMENT }}>{r.title}</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(243,233,210,0.5)', marginTop: 1 }}>{r.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Board */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 520, aspectRatio: '1/1.1' }}>
            <RoseWindow
              S={240}
              defsId="mb-rw"
              colorMap={colorMap}
              saintKey={saintKey}
            />
          </div>
          {waiting && (
            <div style={{ marginTop: 16, fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, color: GOLD_INK, textAlign: 'center' }}>
              {phaseName}…
            </div>
          )}
        </div>

        {/* Right: Saint card + opponents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 12 }}>
          {/* My saint */}
          <div style={{ padding: '18px 18px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.35)', boxShadow: '0 0 30px rgba(255,210,140,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 72, height: 80 }}>
                <RoseWindow S={36} defsId="mb-saintcard" colorFn={PATTERNS[saintKey]} saintKey={saintKey} haloIntensity={0.7} />
              </div>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD_INK }}>YOUR SAINT</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: PARCHMENT, lineHeight: 1.1 }}>{saintInfo?.name}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 12, color: GOLD_INK }}>{saintInfo?.epithet}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 18 }}>
              {[['Gold', me?.gold ?? 0], ['Score', me?.score ?? 0]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(243,233,210,0.5)' }}>{String(l).toUpperCase()}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: GOLD_INK }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Opponents */}
          {others.length > 0 && (
            <div style={{ padding: '14px 18px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.15)' }}>
              <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD_INK, marginBottom: 10 }}>OTHER MASTERS</div>
              {others.map(o => {
                const oSaint = SAINTS.find(s => s.key === o.saint);
                return (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,210,140,0.06)' }}>
                    <div>
                      <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, color: 'rgba(243,233,210,0.85)' }}>{o.name}</div>
                      <div style={{ fontSize: 10, color: GOLD_INK }}>{oSaint?.name}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(243,233,210,0.55)' }}>{o.gold}g · {o.score}pts</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(8,10,16,0.7)', borderBottom: '1px solid rgba(255,210,140,0.08)' }}>
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 13, letterSpacing: 4, color: GOLD_INK, textTransform: 'uppercase' }}>
            Round {toRoman(state.round)} of VI
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: PARCHMENT, lineHeight: 1 }}>{phaseName}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3,4,5,6].map(r => (
            <div key={r} style={{ width: 10, height: 10, borderRadius: 5, background: r < state.round ? 'rgba(255,210,140,0.4)' : r === state.round ? GOLD_INK : 'rgba(255,255,255,0.08)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
