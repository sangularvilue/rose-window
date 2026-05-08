import { NextRequest, NextResponse } from 'next/server';
import { redis, roomKey, ROOM_TTL } from '@/lib/redis';
import { addPlayer } from '@/lib/game';
import type { GameState } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { roomId, playerId, playerName } = await req.json();
    if (!roomId || !playerId || !playerName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const raw = await redis.get<string>(roomKey(roomId));
    if (!raw) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const state: GameState = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (state.players.find(p => p.id === playerId)) {
      return NextResponse.json({ roomId });
    }
    const newState = addPlayer(state, playerId, playerName);
    await redis.set(roomKey(roomId), JSON.stringify(newState), { ex: ROOM_TTL });
    return NextResponse.json({ roomId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
