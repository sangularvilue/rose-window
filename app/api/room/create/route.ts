import { NextRequest, NextResponse } from 'next/server';
import { redis, roomKey, ROOM_TTL } from '@/lib/redis';
import { createGame } from '@/lib/game';

export async function POST(req: NextRequest) {
  try {
    const { playerId, playerName } = await req.json();
    if (!playerId || !playerName) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const state = createGame(playerId, playerName);
    await redis.set(roomKey(state.roomId), JSON.stringify(state), { ex: ROOM_TTL });
    return NextResponse.json({ roomId: state.roomId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
