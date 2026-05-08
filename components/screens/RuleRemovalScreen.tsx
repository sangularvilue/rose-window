'use client';

import type { GameState, Player } from '@/lib/types';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG } from '@/components/engine/SceneAtoms';

interface Props {
  state: GameState;
  me: Player | null;
  isHost: boolean;
  sendAction: (a: Record<string, unknown>) => void;
  playerId: string;
}

export default function RuleRemovalScreen({ state, me, sendAction, playerId }: Props) {
  const isMyTurn = state.ruleRemovalPlayerId === playerId;
  const actor = state.players.find(p => p.id === state.ruleRemovalPlayerId);

  return (
    <div style={{ minHeight: '100dvh', background: STONE_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, color: PARCHMENT }}>
      <div style={{ width: '100%', maxWidth: 680 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, letterSpacing: 4, color: GOLD_INK, textTransform: 'uppercase', marginBottom: 6 }}>
          End of Round {state.round}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: PARCHMENT, marginBottom: 6 }}>
          {isMyTurn ? 'Remove a rule card.' : `${actor?.name ?? 'Last place'} removes a rule.`}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(243,233,210,0.5)', marginBottom: 28 }}>
          {isMyTurn
            ? 'You are in last place. Choose one active rule to remove from the game.'
            : 'Waiting for the last-place master to choose…'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {state.activeRules.map((rule, i) => {
            const eraColor = rule.era === 'Penalty' ? '#e89a8a' : rule.era === 'Bonus' ? '#bde6a0' : GOLD_INK;
            return (
              <div
                key={rule.id}
                style={{
                  padding: '20px 20px 16px',
                  background: 'linear-gradient(180deg, rgba(28,22,12,0.92) 0%, rgba(14,10,6,0.92) 100%)',
                  border: '1px solid rgba(255,210,140,0.22)',
                  position: 'relative',
                  transform: `rotate(${(i % 3 - 1) * 0.5}deg)`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 10, letterSpacing: 4, color: eraColor, textTransform: 'uppercase' }}>
                    {rule.era}
                  </span>
                </div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: PARCHMENT, lineHeight: 1.1, marginBottom: 10 }}>{rule.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(243,233,210,0.8)', lineHeight: 1.5, marginBottom: 10 }}>{rule.body}</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 12, color: GOLD_INK }}>{rule.flavor}</div>
                {isMyTurn && (
                  <button
                    onClick={() => sendAction({ type: 'REMOVE_RULE', ruleId: rule.id })}
                    style={{
                      marginTop: 14, width: '100%', padding: '8px 0',
                      background: 'rgba(232,154,138,0.1)', border: '1px solid rgba(232,154,138,0.4)',
                      color: '#e89a8a', letterSpacing: 2, fontSize: 11, textTransform: 'uppercase',
                    }}
                  >
                    Remove this rule
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
