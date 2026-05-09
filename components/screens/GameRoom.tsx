'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Player } from '@/lib/types';
import WaitingLobby from './WaitingLobby';
import GameBoard from './GameBoard';
import { FONT_DISPLAY, GOLD_INK } from '@/components/engine/SceneAtoms';

function getPlayerId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('rw-player-id') || '';
}

export default function GameRoom({ roomId }: { roomId: string }) {
  const [state, setState] = useState<GameState | null>(null);
  const [error, setError] = useState('');
  const playerId = useRef<string>('');
  const pollRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    playerId.current = getPlayerId();
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/room/state?roomId=${roomId}`);
      if (!res.ok) { setError('Room not found'); return; }
      const data: GameState = await res.json();
      setError('');
      setState(data);
    } catch (_e) {
      setError('Connection lost');
    }
  }, [roomId]);

  useEffect(() => {
    fetchState();
    const poll = () => {
      pollRef.current = setTimeout(async () => {
        await fetchState();
        poll();
      }, 2500);
    };
    poll();
    return () => clearTimeout(pollRef.current);
  }, [fetchState]);

  async function sendAction(action: Record<string, unknown>) {
    try {
      const res = await fetch('/api/room/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, playerId: playerId.current, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState(data);
    } catch (e) {
      setError(String(e));
      setTimeout(() => setError(''), 4000);
    }
  }

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e89a8a', fontFamily: FONT_DISPLAY, fontSize: 24 }}>
        {error}
      </div>
    );
  }

  if (!state) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_INK, fontFamily: FONT_DISPLAY, fontSize: 24, fontStyle: 'italic' }}>
        The cathedral opens its doors…
      </div>
    );
  }

  const me = state.players.find(p => p.id === playerId.current);
  const isHost = state.hostId === playerId.current;

  const commonProps = { state, me: me ?? null, isHost, sendAction, playerId: playerId.current };

  if (state.phase === 'lobby' || state.phase === 'saint_select') {
    return <WaitingLobby {...commonProps} />;
  }
  return <GameBoard {...commonProps} />;
}
