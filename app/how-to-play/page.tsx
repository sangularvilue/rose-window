import Link from 'next/link';

const FD = '"Cormorant Garamond", "EB Garamond", Georgia, serif';
const GI = '#c4953a';
const P = '#f3e9d2';

export default function HowToPlay() {
  return (
    <div style={{ minHeight: '100dvh', background: '#0f1218', color: P, padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 12, letterSpacing: 3, color: GI, textDecoration: 'none', textTransform: 'uppercase' }}>
          ← Back
        </Link>
        <div style={{ fontFamily: FD, fontSize: 52, color: P, marginTop: 16, lineHeight: 1 }}>How to Play</div>
        <div style={{ fontFamily: FD, fontStyle: 'italic', fontSize: 18, color: GI, marginTop: 4, marginBottom: 36 }}>
          Rose Window · A game of stained glass & sealed bids
        </div>

        {[
          ['Overview', 'Rose Window is a 6-round stained-glass auction game for 1–3 players. You compete to design the most celebrated stained-glass window for a cathedral. Each round you gain gold, bid on lots of colored glass, place tiles on your hexagonal window, and score points based on active public rules.'],
          ['Your Window', 'Each player has a personal hexagonal board made of triangular cells. You fill it with colored glass tiles over the course of 6 rounds. The center medallion is occupied by your saint and cannot be filled.'],
          ['Colors', 'There are five glass colors: Red, Blue, Gold, Green, and Purple. Each color has a public demand total that grows as tiles are purchased.'],
          ['Each Turn', '1. Income: gain gold from base income + active rules + your saint\'s ability.\n2. Auction: everyone secretly bids on all revealed lots. The highest bidder anywhere wins their lot, paying one more than the second-highest bid on that lot.\n3. Placement: place your won lot on your window (or a rival\'s for hostile pieces).\n4. Demand Update: purchased glass adds to its color\'s demand total.'],
          ['Demand & Rounds', 'A round ends when any color\'s demand reaches the threshold. Thresholds rise each round (25→50→100→200→300). At round end, players score active public rules, and the last-place player removes one rule card.'],
          ['Saints', 'Each player chooses a saint who provides a unique income style and endgame bonus. Saints favor certain colors and reward specific board patterns. Choose wisely — your saint defines your strategy.'],
          ['Winning', 'After 6 rounds, the player with the highest total prestige wins. Final saint bonuses are added at game end.'],
          ['Hostile Pieces', 'Pebbles (small hostile tiles) can be placed on rival windows. Pebbles permanently block triangular cells — rivals cannot build over them.'],
        ].map(([title, body]) => (
          <div key={title} style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: FD, fontSize: 28, color: P, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 15, color: 'rgba(243,233,210,0.75)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{body}</div>
          </div>
        ))}

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/lobby?action=new" style={{
            padding: '13px 36px', background: 'rgba(255,224,160,0.08)',
            border: '1px solid rgba(255,224,160,0.4)', color: P,
            letterSpacing: 4, fontSize: 13, textTransform: 'uppercase', textDecoration: 'none',
          }}>
            Start Playing
          </Link>
        </div>
      </div>
    </div>
  );
}
