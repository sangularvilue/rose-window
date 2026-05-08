'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { FONT_DISPLAY, GOLD_INK, PARCHMENT, STONE_BG } from '@/components/engine/SceneAtoms';

function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('rw-player-id');
  if (!id) { id = uuidv4(); localStorage.setItem('rw-player-id', id); }
  return id;
}

export default function LobbyScreen() {
  const params = useSearchParams();
  const router = useRouter();
  const action = params.get('action') || 'new';

  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('rw-player-name');
    if (saved) setName(saved);
  }, []);

  async function handleCreate() {
    if (!name.trim()) { setError('Enter your name'); return; }
    setLoading(true);
    setError('');
    try {
      const playerId = getOrCreatePlayerId();
      localStorage.setItem('rw-player-name', name.trim());
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, playerName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/room/${data.roomId}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) { setError('Enter your name'); return; }
    if (!roomCode.trim()) { setError('Enter room code'); return; }
    setLoading(true);
    setError('');
    try {
      const playerId = getOrCreatePlayerId();
      localStorage.setItem('rw-player-name', name.trim());
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: roomCode.trim().toUpperCase(), playerId, playerName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/room/${data.roomId}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  const isNew = action === 'new';

  return (
    <div style={{ minHeight: '100dvh', background: STONE_BG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, padding: '40px 36px', background: 'rgba(8,10,16,0.85)', border: '1px solid rgba(255,210,140,0.25)', boxShadow: '0 0 60px rgba(196,149,58,0.1)' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 14, letterSpacing: 4, color: GOLD_INK, textTransform: 'uppercase', marginBottom: 6 }}>
          {isNew ? 'Found a New Chamber' : 'Enter the Cathedral'}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 36, color: PARCHMENT, marginBottom: 28, lineHeight: 1.1 }}>
          {isNew ? 'Create a room' : 'Join a room'}
        </div>

        <label style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: GOLD_INK, textTransform: 'uppercase', marginBottom: 6 }}>
          Your name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Master glasswright..."
          maxLength={20}
          style={{
            width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,210,140,0.3)', color: PARCHMENT,
            fontFamily: FONT_DISPLAY, fontSize: 18, outline: 'none', marginBottom: 18,
          }}
          onKeyDown={e => e.key === 'Enter' && (isNew ? handleCreate() : handleJoin())}
        />

        {!isNew && (
          <>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: 3, color: GOLD_INK, textTransform: 'uppercase', marginBottom: 6 }}>
              Room code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABCDE"
              maxLength={5}
              style={{
                width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,210,140,0.3)', color: PARCHMENT,
                fontFamily: FONT_DISPLAY, fontSize: 24, letterSpacing: 8,
                outline: 'none', marginBottom: 18, textTransform: 'uppercase',
              }}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
          </>
        )}

        {error && (
          <div style={{ fontSize: 12, color: '#e89a8a', marginBottom: 14 }}>{error}</div>
        )}

        <button
          onClick={isNew ? handleCreate : handleJoin}
          disabled={loading}
          style={{
            width: '100%', padding: '13px 0',
            background: 'rgba(255,224,160,0.1)',
            border: '1px solid rgba(255,224,160,0.5)',
            color: PARCHMENT, letterSpacing: 4, fontSize: 13,
            textTransform: 'uppercase',
          }}
        >
          {loading ? 'Opening doors…' : isNew ? 'Create Room' : 'Enter Room'}
        </button>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'rgba(243,233,210,0.4)' }}>
          {isNew ? (
            <>Already have a code? <a href="/lobby?action=join" style={{ color: GOLD_INK, textDecoration: 'none' }}>Join instead</a></>
          ) : (
            <>No code? <a href="/lobby?action=new" style={{ color: GOLD_INK, textDecoration: 'none' }}>Create a room</a></>
          )}
        </div>
      </div>
    </div>
  );
}
