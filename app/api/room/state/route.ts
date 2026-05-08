import { NextRequest, NextResponse } from 'next/server';
import { redis, roomKey } from '@/lib/redis';
import type { GameState } from '@/lib/types';

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'Missing roomId' }, { status: 400 });
  const raw = await redis.get<string>(roomKey(roomId));
  if (!raw) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  const state: GameState = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return NextResponse.json(state);
}
