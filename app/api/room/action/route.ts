import { NextRequest, NextResponse } from 'next/server';
import { redis, roomKey, ROOM_TTL } from '@/lib/redis';
import type { GameState } from '@/lib/types';
import {
  setSaint, startGame, submitBid, placeTile, placeTileOnTarget,
  removeRule, resolveIncome,
} from '@/lib/game';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, playerId, action } = body;

    if (!roomId || !playerId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const raw = await redis.get<string>(roomKey(roomId));
    if (!raw) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    let state: GameState = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // Verify player is in room
    if (!state.players.find(p => p.id === playerId)) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 403 });
    }

    switch (action.type) {
      case 'SET_SAINT':
        state = setSaint(state, playerId, action.saint);
        break;

      case 'START_GAME':
        if (state.hostId !== playerId) {
          return NextResponse.json({ error: 'Only host can start' }, { status: 403 });
        }
        if (!state.players.every(p => p.saint !== null)) {
          return NextResponse.json({ error: 'All players must choose a saint' }, { status: 400 });
        }
        state = startGame(state);
        state = resolveIncome(state);
        break;

      case 'SUBMIT_BIDS':
        state = submitBid(state, playerId, action.bids);
        break;

      case 'PLACE_TILE':
        state = placeTile(state, playerId, action.triIds, action.lotId);
        break;

      case 'PLACE_HOSTILE':
        state = placeTileOnTarget(state, playerId, action.targetPlayerId, action.triIds, action.lotId);
        break;

      case 'SKIP_PLACEMENT': {
        // Player skips placing (e.g. no valid placement)
        const newPending = state.pendingPlacements.filter(id => id !== playerId);
        if (newPending.length === 0) {
          // Trigger demand update by using resolveIncome-like logic
          state = { ...state, pendingPlacements: [] };
          state = advanceTurn(state);
        } else {
          state = { ...state, pendingPlacements: newPending };
        }
        break;
      }

      case 'REMOVE_RULE':
        state = removeRule(state, playerId, action.ruleId);
        state = resolveIncome(state);
        break;

      case 'RESOLVE_INCOME':
        if (state.hostId !== playerId) break;
        state = resolveIncome(state);
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    await redis.set(roomKey(roomId), JSON.stringify(state), { ex: ROOM_TTL });
    return NextResponse.json(state);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

function advanceTurn(state: GameState): GameState {
  // Update demand
  const newDemand = { ...state.demand };
  for (const result of state.auctionResults) {
    const lot = state.lots.find(l => l.id === result.lotId);
    if (lot && lot.category === 'glass') {
      newDemand[lot.color as keyof typeof newDemand] =
        (newDemand[lot.color as keyof typeof newDemand] || 0) + result.price;
    }
  }

  const threshold = state.thresholds[state.round - 1];
  const roundEnds = Object.values(newDemand).some(v => v >= threshold);

  if (roundEnds) {
    // Import inline to avoid circular: handled by game.ts via resolveIncome which calls internal
    return { ...state, demand: newDemand, phase: 'end_round' };
  }

  return {
    ...state,
    demand: newDemand,
    phase: 'income',
    turn: state.turn + 1,
    lots: [],
    bids: {},
    bidsRevealed: false,
    auctionResults: [],
    pendingPlacements: [],
  };
}
