import type { Triangle, SaintKey, Color, TileType } from './types';

export const SIDE = 12;
export const MEDALLION_SIDE = 3;

export function buildTris(S: number = SIDE): Triangle[] {
  const tris: Triangle[] = [];
  let id = 0;
  for (let k = 0; k < 6; k++) {
    const a1 = -Math.PI / 3 + k * Math.PI / 3;
    const a2 = -Math.PI / 3 + (k + 1) * Math.PI / 3;
    const V1 = { x: S * Math.cos(a1), y: S * Math.sin(a1) };
    const V2 = { x: S * Math.cos(a2), y: S * Math.sin(a2) };
    const P = (i: number, j: number) => ({
      x: (i * V1.x + j * V2.x) / SIDE,
      y: (i * V1.y + j * V2.y) / SIDE,
    });
    for (let i = 0; i < SIDE; i++) {
      for (let j = 0; j < SIDE - i; j++) {
        tris.push({
          id: id++, sector: k, i, j, type: 'up',
          ring: i + j + 1,
          points: [P(i, j), P(i + 1, j), P(i, j + 1)],
        });
      }
    }
    for (let i = 0; i < SIDE - 1; i++) {
      for (let j = 0; j < SIDE - 1 - i; j++) {
        tris.push({
          id: id++, sector: k, i, j, type: 'down',
          ring: i + j + 2,
          points: [P(i + 1, j), P(i, j + 1), P(i + 1, j + 1)],
        });
      }
    }
  }
  return tris;
}

export const PALETTE: Record<string, { core: string; mid: string; edge: string; leadTint: string }> = {
  red:    { core: '#ff8b9c', mid: '#d6263b', edge: '#5a0814', leadTint: '#1a0408' },
  blue:   { core: '#a3c8ff', mid: '#3863d8', edge: '#0a1a55', leadTint: '#04081f' },
  gold:   { core: '#fff5c4', mid: '#e7b045', edge: '#724107', leadTint: '#1c1004' },
  green:  { core: '#c0eaa0', mid: '#4a9650', edge: '#143d1a', leadTint: '#040e06' },
  purple: { core: '#e8c2f0', mid: '#8c3fc4', edge: '#330757', leadTint: '#0c0218' },
  empty:  { core: '#3b2f23', mid: '#231a13', edge: '#0e0a07', leadTint: '#000' },
  pebble: { core: '#2a2a2e', mid: '#0c0c10', edge: '#000', leadTint: '#000' },
};

export const SAINT_LIGHT: Record<SaintKey, { warm: string; cool: string; accent: string }> = {
  Moreau:      { warm: '#ffe39a', cool: '#7faaff', accent: '#ffd56a' },
  Brigid:      { warm: '#ffe39a', cool: '#a8e090', accent: '#ffcf5c' },
  Lawrence:    { warm: '#ff8a6a', cool: '#d180ff', accent: '#ff6f5a' },
  Francis:     { warm: '#cfe9ad', cool: '#7fb6e6', accent: '#bfe09a' },
  Dionysius:   { warm: '#caa3e0', cool: '#3a2754', accent: '#9b6dc4' },
  Christopher: { warm: '#ffb89a', cool: '#7faaff', accent: '#ff9676' },
};

export const SAINTS = [
  { key: 'Moreau' as SaintKey,     name: 'Bl. Basil Moreau',    epithet: 'Hope to Bring',    colors: ['blue','gold'] as Color[],   line: "Mission, Holy Cross, the world's great need.",  ability: 'Holy Cross',        abilityDesc: 'Blue and gold lots cost 10% less.' },
  { key: 'Brigid' as SaintKey,     name: 'St. Brigid',           epithet: 'The Living Cross', colors: ['green','gold'] as Color[],  line: 'Long green arms, kindled by gold.',             ability: 'Ladies First',      abilityDesc: 'Wins all auction ties. Green and gold lots cost 10% less.' },
  { key: 'Lawrence' as SaintKey,   name: 'St. Lawrence',         epithet: 'Trial by Fire',    colors: ['red','purple'] as Color[],  line: 'Red-majority rows, purple martyrdom, gridiron.',ability: 'Seed of the Church', abilityDesc: 'Red lots cost 10% less.' },
  { key: 'Francis' as SaintKey,    name: 'St. Francis',          epithet: 'All Creatures',    colors: ['green','blue'] as Color[],  line: 'A living cluster, gathered around creation.',   ability: 'Sister Poverty',    abilityDesc: 'Pays the exact second-highest bid — never the +1 overpayment.' },
  { key: 'Dionysius' as SaintKey,  name: 'Ps.-Dionysius',        epithet: 'Via Negativa',     colors: ['purple'] as Color[],        line: 'Sacred absence, divine darkness, the unseen.', ability: 'Via Negativa',      abilityDesc: 'Pebbles and rocks cost 10% less.' },
  { key: 'Christopher' as SaintKey, name: 'St. Christopher',     epithet: 'The Crossing',     colors: ['blue','red'] as Color[],    line: 'Pilgrimage, reaching new rings, the crossing.', ability: 'The Crossing',      abilityDesc: 'Blue and red lots cost 10% less.' },
];

export type PatternFn = (t: Triangle) => Color | null;

export const PATTERNS: Record<SaintKey, PatternFn> = {
  Moreau: (t) => {
    const onSpoke = t.i === 0 || t.j === 0;
    const out = SIDE - t.ring;
    if (onSpoke) return t.ring % 2 ? 'gold' : 'blue';
    if (out === 0) return (t.i + t.j) % 2 ? 'gold' : 'blue';
    if (out === 1) return 'blue';
    if (out === 2) return t.type === 'up' ? 'red' : 'blue';
    if (out === 3) return 'gold';
    if (out === 4) return t.type === 'up' ? 'purple' : 'blue';
    if (out === 5) return 'blue';
    if (out === 6) return 'gold';
    if (out === 7) return t.type === 'up' ? 'red' : 'blue';
    return 'blue';
  },
  Brigid: (t) => {
    const onSpoke = t.i === 0 || t.j === 0;
    const out = SIDE - t.ring;
    if (onSpoke) return 'gold';
    if (out === 0) return t.type === 'up' ? 'red' : 'gold';
    if (out === 1) return 'green';
    if (out === 4) return t.type === 'down' ? 'gold' : 'green';
    return t.type === 'up' && (t.i + t.j) % 3 === 0 ? 'gold' : 'green';
  },
  Lawrence: (t) => {
    const onSpoke = t.i === 0 || t.j === 0;
    const out = SIDE - t.ring;
    if (onSpoke && out >= 2) return 'gold';
    if (out === 0) return t.type === 'up' ? 'purple' : 'red';
    if (out === 1) return 'purple';
    if (out === 4) return t.type === 'down' ? 'gold' : 'red';
    if (out === 6) return t.type === 'up' ? 'purple' : 'red';
    if ((t.ring + t.sector) % 3 === 0 && t.type === 'down') return 'purple';
    return 'red';
  },
  Francis: (t) => {
    const out = SIDE - t.ring;
    if (out === 0) return 'gold';
    if (out === 1) return t.type === 'up' ? 'gold' : 'blue';
    if (out === 2) return 'blue';
    if (out === 3) return t.type === 'up' && (t.i + t.j) % 2 ? 'red' : 'blue';
    if (out === 4) return 'green';
    if (out === 6) return t.type === 'up' && (t.i + t.j) % 2 ? 'red' : 'green';
    if (out === 7) return t.type === 'down' && (t.i % 2) ? 'purple' : 'green';
    return 'green';
  },
  Dionysius: (t) => {
    const out = SIDE - t.ring;
    const negative = (out === 1 || out === 3 || out === 5) && t.type === 'down';
    const hardEmpty = out === 2 && (t.i + t.j) % 2 === 0;
    if (negative || hardEmpty) return null;
    if (out === 0) return t.type === 'up' ? 'purple' : null;
    if (out === 4) return t.type === 'up' ? 'purple' : 'red';
    if (out === 7) return t.type === 'up' ? 'red' : 'purple';
    return 'purple';
  },
  Christopher: (t) => {
    const out = SIDE - t.ring;
    if (out === 0) return 'gold';
    if (out === 1) return t.type === 'up' ? 'gold' : 'red';
    if (t.ring % 2) return 'blue';
    return 'red';
  },
};

export function toRoman(num: number): string {
  const map: [string, number][] = [
    ['M',1000],['CM',900],['D',500],['CD',400],['C',100],
    ['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1],
  ];
  let s = '';
  for (const [r, v] of map) { while (num >= v) { s += r; num -= v; } }
  return s || 'O';
}

export function beamPolyPoints({ cx, cy, angle, width, length }: {
  cx: number; cy: number; angle: number; width: number; length: number;
}): string {
  const c = Math.cos(angle), s = Math.sin(angle);
  const nx = -s, ny = c;
  const half = width / 2;
  const x1 = cx + nx * half * 0.35, y1 = cy + ny * half * 0.35;
  const x2 = cx - nx * half * 0.35, y2 = cy - ny * half * 0.35;
  const x3 = cx + c * length - nx * half * 1.6, y3 = cy + s * length - ny * half * 1.6;
  const x4 = cx + c * length + nx * half * 1.6, y4 = cy + s * length + ny * half * 1.6;
  return `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
}

// Get all triangles adjacent to a given triangle
export function getAdjacentTriIds(tris: Triangle[], triId: number): number[] {
  const tri = tris.find(t => t.id === triId);
  if (!tri) return [];
  const neighbors: number[] = [];
  for (const other of tris) {
    if (other.id === tri.id) continue;
    // Two triangles are adjacent if they share an edge (2 vertices)
    const sharedVerts = tri.points.filter(p =>
      other.points.some(op => Math.abs(op.x - p.x) < 0.01 && Math.abs(op.y - p.y) < 0.01)
    ).length;
    if (sharedVerts >= 2) neighbors.push(other.id);
  }
  return neighbors;
}

// Build adjacency map for scoring
export function buildAdjacency(tris: Triangle[]): Map<number, number[]> {
  const map = new Map<number, number[]>();
  for (const t of tris) {
    map.set(t.id, getAdjacentTriIds(tris, t.id));
  }
  return map;
}

// Check if a set of selected triangle IDs forms the same shape as a lot's
// template under any of the 12 hex isometries (6 rotations × 2 reflections).
// Returns true for single-triangle lots (any one empty cell is valid).
export function validatePlacementShape(
  selectedIds: number[],
  lotTriangles: number[][],
  allTris: Triangle[],
): boolean {
  const n = lotTriangles.length;
  if (selectedIds.length !== n) return false;
  if (n <= 1) return true;

  const centroid3 = (pts: { x: number; y: number }[]) => ({
    x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
    y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
  });

  // Centroids of selected grid triangles
  const selCentroids = selectedIds.map(id => {
    const t = allTris.find(t => t.id === id)!;
    return centroid3(t.points);
  });

  // Centroids of lot template (pixel coords: [x1,y1,x2,y2,x3,y3])
  const lotCentroids = lotTriangles.map(tri => ({
    x: (tri[0] + tri[2] + tri[4]) / 3,
    y: (tri[1] + tri[3] + tri[5]) / 3,
  }));

  const normalize = (pts: { x: number; y: number }[]) => {
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    return pts.map(p => ({ x: p.x - cx, y: p.y - cy }));
  };

  const normSel = normalize(selCentroids);
  const normLot = normalize(lotCentroids);

  // Scale: ratio of RMS distances from centroid
  const rms = (pts: { x: number; y: number }[]) =>
    Math.sqrt(pts.reduce((s, p) => s + p.x * p.x + p.y * p.y, 0) / pts.length);
  const rmsLot = rms(normLot);
  const rmsSel = rms(normSel);
  if (rmsLot < 1e-6) return true;
  const scale = rmsSel / rmsLot;

  const matchesSets = (a: { x: number; y: number }[], b: { x: number; y: number }[], tol: number) => {
    const used = new Set<number>();
    for (const pa of a) {
      let found = false;
      for (let i = 0; i < b.length; i++) {
        if (used.has(i)) continue;
        const dx = pa.x - b[i].x, dy = pa.y - b[i].y;
        if (Math.sqrt(dx * dx + dy * dy) < tol) { used.add(i); found = true; break; }
      }
      if (!found) return false;
    }
    return true;
  };

  const tol = rmsSel * 0.35;
  const scaledLot = normLot.map(p => ({ x: p.x * scale, y: p.y * scale }));

  for (let k = 0; k < 6; k++) {
    const theta = k * Math.PI / 3;
    const cos = Math.cos(theta), sin = Math.sin(theta);
    // Rotation
    const rot = scaledLot.map(p => ({ x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos }));
    if (matchesSets(rot, normSel, tol)) return true;
    // Reflection (flip x) then rotation
    const ref = scaledLot.map(p => ({ x: -(p.x * cos - p.y * sin), y: p.x * sin + p.y * cos }));
    if (matchesSets(ref, normSel, tol)) return true;
  }
  return false;
}
