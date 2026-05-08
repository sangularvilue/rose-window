import { v4 as uuidv4 } from 'uuid';
import type { GameState, Player, SaintKey, Phase, Color, TileType, Lot, AuctionResult } from './types';
import { COLORS } from './types';
import { buildLotDeck, drawLots } from './lots';
import { dealStartingRules, ALL_RULES } from './rules';

const THRESHOLDS = [25, 50, 100, 200, 300, 99999];
const STARTING_GOLD = 10;

export function createGame(hostId: string, hostName: string): GameState {
  const host: Player = {
    id: hostId, name: hostName, saint: null, gold: STARTING_GOLD,
    score: 0, board: {}, roundScores: [], ready: false,
  };
  return {
    roomId: generateRoomCode(),
    hostId,
    createdAt: Date.now(),
    status: 'lobby',
    phase: 'lobby',
    round: 0,
    turn: 0,
    players: [host],
    demand: { red: 0, blue: 0, gold: 0, green: 0, purple: 0 },
    thresholds: THRESHOLDS,
    activeRules: [],
    lots: [],
    bids: {},
    bidsRevealed: false,
    auctionResults: [],
    pendingPlacements: [],
    ruleRemovalPlayerId: null,
    lotDeck: [],
    scoringLog: [],
  };
}

export function addPlayer(state: GameState, playerId: string, name: string): GameState {
  if (state.players.length >= 3) throw new Error('Room is full');
  if (state.status !== 'lobby') throw new Error('Game already started');
  const player: Player = {
    id: playerId, name, saint: null, gold: STARTING_GOLD,
    score: 0, board: {}, roundScores: [], ready: false,
  };
  return { ...state, players: [...state.players, player] };
}

export function setSaint(state: GameState, playerId: string, saint: SaintKey): GameState {
  return {
    ...state,
    players: state.players.map(p =>
      p.id === playerId ? { ...p, saint, ready: true } : p
    ),
  };
}

export function startGame(state: GameState): GameState {
  const deck = buildLotDeck(state.players.length);
  const rules = dealStartingRules();
  return {
    ...state,
    status: 'playing',
    phase: 'income',
    round: 1,
    turn: 1,
    activeRules: rules,
    lotDeck: deck,
    scoringLog: [],
  };
}

export function resolveIncome(state: GameState): GameState {
  const newPlayers = state.players.map(p => {
    let income = 0;
    // Base income: 3 gold per turn
    income += 3;
    // Public income card bonuses
    for (const rule of state.activeRules) {
      if (rule.era !== 'Income') continue;
      const tiles = Object.values(p.board);
      const pebbles = tiles.filter(t => t === 'pebble').length;
      switch (rule.id) {
        case 'mosaic_guild': {
          const colors = new Set(tiles.filter(t => COLORS.includes(t as Color)));
          income += Math.min(5, colors.size);
          break;
        }
        case 'golden_patronage':
          income += Math.min(5, tiles.filter(t => t === 'gold').length);
          break;
        case 'purple_vespers':
          income += Math.min(5, tiles.filter(t => t === 'purple').length);
          break;
        case 'verdant_offering':
          if (tiles.filter(t => t === 'green').length >= 3) income += 2;
          break;
        case 'rose_tithe':
          income += Math.min(5, tiles.filter(t => t === 'red').length);
          break;
      }
      // Saint-specific income
      if (p.saint) income += saintIncome(p, rule.id);
    }
    return { ...p, gold: p.gold + income };
  });
  // Reveal market
  const lotCount = state.players.length + 1;
  const { drawn, remaining } = drawLots(state.lotDeck, lotCount);
  return {
    ...state,
    players: newPlayers,
    phase: 'auction',
    lots: drawn,
    lotDeck: remaining,
    bids: {},
    bidsRevealed: false,
    auctionResults: [],
  };
}

function saintIncome(p: Player, _ruleId: string): number {
  if (!p.saint) return 0;
  const tiles = Object.values(p.board);
  switch (p.saint) {
    case 'Moreau': {
      const blues = tiles.filter(t => t === 'blue').length;
      const golds = tiles.filter(t => t === 'gold').length;
      return Math.min(3, Math.floor((blues + golds) / 4));
    }
    case 'Brigid': {
      const greens = tiles.filter(t => t === 'green').length;
      return Math.min(2, Math.floor(greens / 5));
    }
    case 'Lawrence': {
      const reds = tiles.filter(t => t === 'red').length;
      return Math.min(2, Math.floor(reds / 4));
    }
    case 'Francis': {
      const greens = tiles.filter(t => t === 'green').length;
      return Math.min(2, Math.floor(greens / 4));
    }
    case 'Dionysius': {
      const pebbles = tiles.filter(t => t === 'pebble').length;
      return Math.min(3, pebbles);
    }
    case 'Christopher': return 0; // Christopher gets burst income on ring reach
    default: return 0;
  }
}

export function submitBid(state: GameState, playerId: string, lotBids: Record<string, number>): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error('Player not found');
  // Validate bids
  for (const [lotId, amount] of Object.entries(lotBids)) {
    if (amount < 0 || amount > player.gold) throw new Error('Invalid bid');
    if (!state.lots.find(l => l.id === lotId)) throw new Error('Invalid lot');
  }
  const newBids = { ...state.bids, [playerId]: lotBids };
  // Check if all players have bid
  const allBid = state.players.every(p => newBids[p.id] !== undefined);
  if (allBid) {
    return resolveAuction({ ...state, bids: newBids });
  }
  return { ...state, bids: newBids };
}

function resolveAuction(state: GameState): GameState {
  const results: AuctionResult[] = [];
  const remainingLots = [...state.lots];
  const eligiblePlayers = new Set(state.players.map(p => p.id));
  const newPlayers = state.players.map(p => ({ ...p }));

  while (eligiblePlayers.size > 0 && remainingLots.length > 0) {
    // Find the single highest bid across all eligible players and all lots
    let bestBid = -1;
    let bestPlayerId = '';
    let bestLotId = '';

    for (const playerId of eligiblePlayers) {
      const playerBids = state.bids[playerId] || {};
      for (const lot of remainingLots) {
        const bid = playerBids[lot.id] ?? 0;
        if (bid > bestBid) {
          bestBid = bid;
          bestPlayerId = playerId;
          bestLotId = lot.id;
        }
      }
    }

    if (bestPlayerId === '' || bestBid < 0) break;

    // Find second-highest bid on the winning lot
    let secondBid = 0;
    for (const playerId of eligiblePlayers) {
      if (playerId === bestPlayerId) continue;
      const bid = (state.bids[playerId] || {})[bestLotId] ?? 0;
      if (bid > secondBid) secondBid = bid;
    }
    const price = secondBid + 1;

    // Winner pays price, wins lot
    const winner = newPlayers.find(p => p.id === bestPlayerId)!;
    winner.gold = Math.max(0, winner.gold - price);
    results.push({ lotId: bestLotId, winnerId: bestPlayerId, price });

    // Remove winner and lot from next iteration
    eligiblePlayers.delete(bestPlayerId);
    const lotIdx = remainingLots.findIndex(l => l.id === bestLotId);
    if (lotIdx !== -1) remainingLots.splice(lotIdx, 1);
  }

  // Remaining eligible players get a free lot (fallback)
  for (const playerId of eligiblePlayers) {
    if (remainingLots.length === 0) break;
    results.push({ lotId: remainingLots[0].id, winnerId: playerId, price: 0 });
    remainingLots.splice(0, 1);
  }

  return {
    ...state,
    players: newPlayers,
    auctionResults: results,
    bidsRevealed: true,
    phase: 'placement',
    pendingPlacements: results
      .filter(r => r.winnerId !== null)
      .map(r => r.winnerId as string),
  };
}

export function placeTile(
  state: GameState,
  playerId: string,
  triIds: number[],
  lotId: string
): GameState {
  const result = state.auctionResults.find(r => r.lotId === lotId && r.winnerId === playerId);
  if (!result) throw new Error('Player did not win this lot');
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot) throw new Error('Lot not found');

  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error('Player not found');

  // Place tiles on board
  const newBoard = { ...player.board };
  const isHostile = lot.category === 'pebble';

  if (isHostile) {
    // Pebble: place on a target player's board (triIds[0] is targetPlayerId encoded, triIds[1..] are tri IDs)
    // For simplicity: triIds are the tri IDs on target player's board, plus we store target player id separately
    // Actually let's keep it simple: triIds contains the board tri IDs, targetPlayerId is in the extra field
    // We'll handle this in the action API
  } else {
    for (const triId of triIds) {
      newBoard[triId] = lot.color as TileType;
    }
  }

  const newPlayers = state.players.map(p =>
    p.id === playerId ? { ...p, board: newBoard } : p
  );

  const newPending = state.pendingPlacements.filter(id => id !== playerId);

  if (newPending.length === 0) {
    return updateDemand({ ...state, players: newPlayers, pendingPlacements: [] });
  }

  return { ...state, players: newPlayers, pendingPlacements: newPending };
}

export function placeTileOnTarget(
  state: GameState,
  placingPlayerId: string,
  targetPlayerId: string,
  triIds: number[],
  lotId: string,
): GameState {
  const result = state.auctionResults.find(r => r.lotId === lotId && r.winnerId === placingPlayerId);
  if (!result) throw new Error('Player did not win this lot');
  const lot = state.lots.find(l => l.id === lotId);
  if (!lot) throw new Error('Lot not found');

  const targetPlayer = state.players.find(p => p.id === targetPlayerId);
  if (!targetPlayer) throw new Error('Target player not found');

  const newBoard = { ...targetPlayer.board };
  for (const triId of triIds) {
    newBoard[triId] = 'pebble';
  }

  const newPlayers = state.players.map(p =>
    p.id === targetPlayerId ? { ...p, board: newBoard } : p
  );

  const newPending = state.pendingPlacements.filter(id => id !== placingPlayerId);

  if (newPending.length === 0) {
    return updateDemand({ ...state, players: newPlayers, pendingPlacements: [] });
  }

  return { ...state, players: newPlayers, pendingPlacements: newPending };
}

function updateDemand(state: GameState): GameState {
  const newDemand = { ...state.demand };
  for (const result of state.auctionResults) {
    const lot = state.lots.find(l => l.id === result.lotId);
    if (lot && lot.category === 'glass' && COLORS.includes(lot.color as Color)) {
      newDemand[lot.color as Color] = (newDemand[lot.color as Color] || 0) + result.price;
    }
  }

  const threshold = state.thresholds[state.round - 1];
  const roundEnds = COLORS.some(c => newDemand[c] >= threshold);

  if (roundEnds) {
    const scored = resolveRoundScoring({ ...state, demand: newDemand });
    return scored;
  }

  // Continue to next turn
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

function resolveRoundScoring(state: GameState): GameState {
  const log: string[] = [];
  const newPlayers = state.players.map(p => {
    let roundScore = 0;
    const tiles = Object.values(p.board);
    const colorCounts: Record<string, number> = {};
    for (const t of tiles) {
      if (COLORS.includes(t as Color)) {
        colorCounts[t] = (colorCounts[t] || 0) + 1;
      }
    }
    const pebbleCount = tiles.filter(t => t === 'pebble').length;
    const totalGlass = tiles.filter(t => COLORS.includes(t as Color)).length;

    for (const rule of state.activeRules) {
      if (rule.era !== 'Scoring') continue;
      let pts = 0;
      switch (rule.id) {
        case 'choir_rows':
          pts = Math.floor(totalGlass / 3);
          break;
        case 'crimson_windows':
          pts = (colorCounts['red'] || 0) * 2;
          break;
        case 'royal_fire':
          pts = (colorCounts['red'] && colorCounts['purple']) ? 3 : 0;
          break;
        case 'golden_halo':
          pts = Math.floor((colorCounts['gold'] || 0) / 2) * 2;
          break;
        case 'living_world':
          pts = Math.floor((colorCounts['green'] || 0) / 2);
          break;
        case 'fivefold_light':
          pts = COLORS.every(c => (colorCounts[c] || 0) > 0) ? 10 : 0;
          break;
        case 'crown_of_demand': {
          const maxDemand = Math.max(...COLORS.map(c => state.demand[c]));
          const topColor = COLORS.find(c => state.demand[c] === maxDemand);
          pts = topColor ? (colorCounts[topColor] || 0) : 0;
          break;
        }
        case 'divine_darkness':
          pts = Math.min(9, pebbleCount * 3);
          break;
      }
      roundScore += pts;
    }

    // Saint endgame-ish bonus (simplified for mid-game): +1 per 3 favored tiles
    if (p.saint) {
      const bonus = saintRoundBonus(p, colorCounts);
      roundScore += bonus;
    }

    log.push(`${p.name}: +${roundScore} (Round ${state.round})`);
    return {
      ...p,
      score: p.score + roundScore,
      roundScores: [...p.roundScores, roundScore],
    };
  });

  // Check game over
  if (state.round >= 6) {
    const withFinal = addFinalScores(newPlayers);
    return {
      ...state,
      players: withFinal,
      phase: 'game_over',
      status: 'over',
      scoringLog: [...state.scoringLog, ...log],
    };
  }

  // Find last-place player for rule removal
  const sorted = [...newPlayers].sort((a, b) => a.score - b.score);
  const lastPlace = sorted[0];

  return {
    ...state,
    players: newPlayers,
    phase: 'rule_removal',
    ruleRemovalPlayerId: lastPlace.id,
    scoringLog: [...state.scoringLog, ...log],
  };
}

function saintRoundBonus(p: Player, colorCounts: Record<string, number>): number {
  switch (p.saint) {
    case 'Moreau': return Math.floor(((colorCounts['blue'] || 0) + (colorCounts['gold'] || 0)) / 6);
    case 'Brigid': return Math.floor((colorCounts['green'] || 0) / 5);
    case 'Lawrence': return Math.floor((colorCounts['red'] || 0) / 4);
    case 'Francis': return Math.floor((colorCounts['green'] || 0) / 4);
    case 'Dionysius': return 0;
    case 'Christopher': return Math.floor(((colorCounts['blue'] || 0) + (colorCounts['red'] || 0)) / 6);
    default: return 0;
  }
}

function addFinalScores(players: Player[]): Player[] {
  return players.map(p => {
    const tiles = Object.values(p.board);
    const colorCounts: Record<string, number> = {};
    for (const t of tiles) {
      if (COLORS.includes(t as Color)) {
        colorCounts[t] = (colorCounts[t] || 0) + 1;
      }
    }
    let bonus = 0;
    // Saint endgame bonus
    switch (p.saint) {
      case 'Moreau':
        bonus += (colorCounts['blue'] || 0) * 2 + (colorCounts['gold'] || 0);
        break;
      case 'Brigid':
        bonus += (colorCounts['green'] || 0) * 2 + (colorCounts['gold'] || 0);
        break;
      case 'Lawrence':
        bonus += (colorCounts['red'] || 0) * 2 + (colorCounts['purple'] || 0) * 2;
        break;
      case 'Francis':
        bonus += (colorCounts['green'] || 0) + (colorCounts['blue'] || 0);
        break;
      case 'Dionysius': {
        const pebbles = tiles.filter(t => t === 'pebble').length;
        bonus += pebbles * 3;
        break;
      }
      case 'Christopher':
        bonus += (colorCounts['blue'] || 0) + (colorCounts['red'] || 0);
        break;
    }
    return { ...p, score: p.score + bonus };
  });
}

export function removeRule(state: GameState, playerId: string, ruleId: string): GameState {
  if (state.ruleRemovalPlayerId !== playerId) throw new Error('Not your turn to remove a rule');
  const newRules = state.activeRules.filter(r => r.id !== ruleId);
  return {
    ...state,
    activeRules: newRules,
    phase: 'income',
    round: state.round + 1,
    turn: 1,
    ruleRemovalPlayerId: null,
    lots: [],
    bids: {},
    bidsRevealed: false,
    auctionResults: [],
    pendingPlacements: [],
  };
}

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}
