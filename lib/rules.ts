import type { RuleCard } from './types';

export const ALL_RULES: RuleCard[] = [
  // Income cards
  {
    id: 'mosaic_guild',
    era: 'Income',
    title: 'Mosaic Guild',
    body: 'Gain 1 gold for each glass color represented on your board. Maximum: 5 gold.',
    flavor: '"The guild rewards variety above all."',
    swatches: ['red', 'blue', 'gold', 'green', 'purple'],
    status: 'active',
  },
  {
    id: 'golden_patronage',
    era: 'Income',
    title: 'Golden Patronage',
    body: 'Gain 1 gold for each gold tile on your board. Maximum: 5 gold.',
    flavor: '"Gold draws gold — so say the patrons."',
    swatches: ['gold'],
    status: 'active',
  },
  {
    id: 'purple_vespers',
    era: 'Income',
    title: 'Purple Vespers',
    body: 'Gain 1 gold for each purple tile on your board. Maximum: 5 gold.',
    flavor: '"Evening prayer richly rewarded."',
    swatches: ['purple'],
    status: 'active',
  },
  {
    id: 'verdant_offering',
    era: 'Income',
    title: 'Verdant Offering',
    body: 'Gain 2 gold if you have at least 3 green tiles. Maximum: 2 gold.',
    flavor: '"Nature speaks its own devotion."',
    swatches: ['green'],
    status: 'active',
  },
  {
    id: 'rose_tithe',
    era: 'Income',
    title: 'Rose Tithe',
    body: 'Gain 1 gold for each red tile on your board. Maximum: 5 gold.',
    flavor: '"Martyrdom purchases heaven\'s treasury."',
    swatches: ['red'],
    status: 'active',
  },
  // Scoring cards
  {
    id: 'choir_rows',
    era: 'Scoring',
    title: 'Choir Rows',
    body: 'Score 1 point for every 3 glass tiles on your board.',
    flavor: '"The choir sings for each stone laid."',
    swatches: ['blue', 'gold'],
    status: 'active',
  },
  {
    id: 'crimson_windows',
    era: 'Scoring',
    title: 'Crimson Windows',
    body: 'Score 2 points for each red tile placed this round.',
    flavor: '"Martyrdom burns brightest in the glass."',
    swatches: ['red'],
    status: 'active',
  },
  {
    id: 'royal_fire',
    era: 'Scoring',
    title: 'Royal Fire',
    body: 'Score 3 points if you have both red and purple tiles on your board.',
    flavor: '"Fire purified the royal blood."',
    swatches: ['red', 'purple'],
    status: 'active',
  },
  {
    id: 'golden_halo',
    era: 'Scoring',
    title: 'Golden Halo',
    body: 'Score 2 points for every 2 gold tiles on your board.',
    flavor: '"Gold marks the sanctified."',
    swatches: ['gold'],
    status: 'active',
  },
  {
    id: 'living_world',
    era: 'Scoring',
    title: 'Living World',
    body: 'Score 1 point for every 2 green tiles on your board.',
    flavor: '"Creation flourishes in every pane."',
    swatches: ['green'],
    status: 'active',
  },
  {
    id: 'fivefold_light',
    era: 'Scoring',
    title: 'Fivefold Light',
    body: 'Score 10 points if all five colors are present on your board.',
    flavor: '"Five wounds, five lights, one cathedral."',
    swatches: ['red', 'blue', 'gold', 'green', 'purple'],
    status: 'active',
  },
  {
    id: 'crown_of_demand',
    era: 'Scoring',
    title: 'Crown of Demand',
    body: 'Score 1 point for each tile you have in the current highest-demand color.',
    flavor: '"The market crowns its own saint."',
    swatches: ['gold'],
    status: 'active',
  },
  {
    id: 'divine_darkness',
    era: 'Scoring',
    title: 'Divine Darkness',
    body: 'Score 3 points for each pebble on your board (maximum 9).',
    flavor: '"Even ruin has its holiness."',
    swatches: ['pebble'],
    status: 'active',
  },
];

export function dealStartingRules(): RuleCard[] {
  const income = ALL_RULES.filter(r => r.era === 'Income');
  const scoring = ALL_RULES.filter(r => r.era === 'Scoring');
  const shuffle = <T>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
  return [
    ...shuffle(income).slice(0, 1),
    ...shuffle(scoring).slice(0, 3),
    ...shuffle([...shuffle(income).slice(1), ...shuffle(scoring).slice(3)]).slice(0, 2),
  ];
}
