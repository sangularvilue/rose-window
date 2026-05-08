import type { Lot, Color, LotShape, TileType } from './types';
import { COLORS } from './types';
import { v4 as uuidv4 } from 'uuid';

const u = 22;
const h = u * Math.sqrt(3) / 2;

const SHAPES: Record<string, LotShape> = {
  tri: {
    kind: 'tri',
    triangles: [[-u, 0, u, 0, 0, -h * 2]],
  },
  diamond: {
    kind: 'diamond',
    triangles: [
      [-u, 0, 0, 0, -u / 2, -h],
      [0, 0, -u / 2, -h, u / 2, -h],
    ],
  },
  strip3: {
    kind: 'strip3',
    triangles: [
      [-u, 0, 0, 0, -u / 2, -h],
      [0, 0, -u / 2, -h, u / 2, -h],
      [0, 0, u, 0, u / 2, -h],
    ],
  },
  wedge: {
    kind: 'wedge',
    triangles: [
      [-u, 0, 0, 0, -u / 2, -h],
      [0, 0, -u / 2, -h, u / 2, -h],
      [-u / 2, -h, u / 2, -h, 0, -2 * h],
    ],
  },
  rhomb4: {
    kind: 'rhomb4',
    triangles: [
      [-u, 0, 0, 0, -u / 2, -h],
      [0, 0, -u / 2, -h, u / 2, -h],
      [0, 0, u, 0, u / 2, -h],
      [0, 0, u, 0, u / 2, h],
    ],
  },
};

const GLASS_SHAPES = ['tri', 'diamond', 'strip3', 'wedge', 'rhomb4'];

function glassLabel(color: Color, shape: string): string {
  const colorNames: Record<Color, string> = {
    red: 'Crimson', blue: 'Cobalt', gold: 'Honey', green: 'Verdant', purple: 'Amethyst',
  };
  const shapeNames: Record<string, string> = {
    tri: 'triangle', diamond: 'diamond', strip3: 'strip', wedge: 'wedge', rhomb4: 'rhombus',
  };
  return `${colorNames[color]} ${shapeNames[shape]}`;
}

export function buildLotDeck(playerCount: number): Lot[] {
  const deck: Lot[] = [];
  // Each color gets many tiles of different shapes
  for (const color of COLORS) {
    for (const shape of GLASS_SHAPES) {
      for (let i = 0; i < 4; i++) {
        deck.push({
          id: uuidv4(),
          category: 'glass',
          color,
          shape: SHAPES[shape],
          label: glassLabel(color, shape),
        });
      }
    }
  }
  // Add pebbles
  for (let i = 0; i < 12; i++) {
    deck.push({
      id: uuidv4(),
      category: 'pebble',
      color: 'pebble',
      shape: SHAPES['tri'],
      label: 'River pebble',
    });
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawLots(deck: Lot[], count: number): { drawn: Lot[]; remaining: Lot[] } {
  return {
    drawn: deck.slice(0, count),
    remaining: deck.slice(count),
  };
}
