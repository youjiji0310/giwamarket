// Sample marketplace data. Deterministic so pages stay stable between reloads.
// Replace with indexer / on-chain data when the contracts are live.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const CATEGORIES = ['All', 'Art', 'PFPs', 'Photography', 'Gaming', 'Music', 'Generative'];
export const RANGES = ['1h', '6h', '24h', '7d', '30d'];

const BASE = [
  ['monochrome-kami', 'Monochrome Kami', 'kami.studio', 'PFPs', 2222, 0.150, true, 'Two thousand guardian spirits drawn in ink, each carrying its own roof tile, seal and aura.'],
  ['hanok-spirits', 'Hanok Spirits', 'atelier hanok', 'Art', 3333, 0.084, true, 'Quiet architecture as character. Courtyards, timber and light, rendered in silver.'],
  ['seoul-static', 'Seoul Static', 'n.signal', 'Generative', 5000, 0.031, true, 'Night frequencies of a city that never fully sleeps.'],
  ['giwa-tiles', 'Giwa Tiles', 'onggi lab', 'Generative', 10000, 0.012, false, 'Ten thousand roof tiles. One of them holds the light.'],
  ['dancheong-codes', 'Dancheong Codes', 'pattern house', 'Art', 3000, 0.026, true, 'Temple ornament translated into pure geometry.'],
  ['han-river-nights', 'Han River Nights', 'lowtide', 'Photography', 4444, 0.018, false, 'Moonlight on moving water, one frame at a time.'],
  ['l2-lads', 'Layer Two Lads', 'rollup club', 'PFPs', 7777, 0.009, false, 'Seven thousand characters who settle faster than you.'],
  ['pixel-dokkaebi', 'Pixel Dokkaebi', 'goblin works', 'Gaming', 5555, 0.022, true, 'Mischievous spirits, playable in the Dokkaebi arena.'],
  ['bell-tones', 'Bell Tones', 'temple audio', 'Music', 1111, 0.064, true, 'Generative bronze bells. Every token rings differently.'],
  ['moon-gate', 'Moon Gate', 'circle press', 'Photography', 888, 0.210, true, 'Eight hundred and eighty-eight moon gates photographed at dusk.'],
  ['ink-protocol', 'Ink Protocol', 'brushline', 'Generative', 2048, 0.047, false, 'Brush strokes computed from block hashes.'],
  ['arena-relics', 'Arena Relics', 'goblin works', 'Gaming', 9999, 0.006, false, 'In-game relics for the Dokkaebi arena, tradable anywhere.']
];

export const collections = BASE.map(([slug, name, creator, category, items, floor, verified, blurb], i) => {
  const r = rng(i * 97 + 13);
  const change = { '1h': (r() - 0.45) * 6, '6h': (r() - 0.45) * 14, '24h': (r() - 0.4) * 32, '7d': (r() - 0.4) * 60, '30d': (r() - 0.35) * 120 };
  const vol24 = +(floor * (40 + r() * 600)).toFixed(2);
  const spark = Array.from({ length: 24 }, (_, k) => floor * (0.85 + 0.3 * Math.sin(k / 3 + i) * r() + k * 0.006));
  return {
    slug, name, creator, category, items, floor, verified, blurb, seed: i * 2 + 1,
    change, vol24,
    volume: { '1h': +(vol24 / 20).toFixed(2), '6h': +(vol24 / 4).toFixed(2), '24h': vol24, '7d': +(vol24 * 6.4).toFixed(1), '30d': +(vol24 * 24).toFixed(1) },
    sales24: Math.round(vol24 / floor),
    totalVolume: Math.round(vol24 * (40 + r() * 80)),
    owners: Math.round(items * (0.35 + r() * 0.3)),
    listedPct: +(2 + r() * 9).toFixed(1),
    topOffer: +(floor * (0.9 + r() * 0.06)).toFixed(4),
    royalty: [3, 4, 5][i % 3],
    created: ['Jul 2026', 'Aug 2026', 'Sep 2026'][i % 3],
    contract: '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join(''),
    spark
  };
});
export const bySlug = Object.fromEntries(collections.map(c => [c.slug, c]));

const TRAITS = {
  Background: ['Ink', 'Bone', 'Ash', 'Night', 'Mist'],
  Tile: ['Black giwa', 'Silver', 'Clay', 'Jade', 'None'],
  Seal: ['Moon', 'Crane', 'Pine', 'Wave'],
  Aura: ['Silver', 'Smoke', 'None', 'Halo'],
  Eyes: ['Closed', 'Open', 'Calm', 'Fierce']
};
export const TRAIT_TYPES = Object.keys(TRAITS);
export const traitValues = t => TRAITS[t];

export function itemsFor(slug, count = 40) {
  const c = bySlug[slug];
  return Array.from({ length: count }, (_, i) => {
    const r = rng(c.seed * 1000 + i);
    const id = ((c.seed * 131 + i * 977) % c.items) + 1;
    const listed = r() > 0.28;
    const price = listed ? +(c.floor * (1 + r() * r() * 1.6)).toFixed(4) : null;
    const traits = Object.fromEntries(TRAIT_TYPES.map(t => [t, TRAITS[t][Math.floor(r() * TRAITS[t].length)]]));
    return {
      id, slug, collection: c.name, listed, price, seed: c.seed * 100 + i,
      rank: ((i * 271 + c.seed * 17) % c.items) + 1,
      lastSale: +(c.floor * (0.8 + r() * 0.5)).toFixed(4),
      bestOffer: +(c.floor * (0.85 + r() * 0.1)).toFixed(4),
      traits
    };
  });
}

export function itemDetail(slug, id) {
  const c = bySlug[slug];
  const r = rng(c.seed * 7919 + Number(id));
  const price = +(c.floor * (1 + r() * 0.6)).toFixed(4);
  const traits = Object.fromEntries(TRAIT_TYPES.map(t => [t, TRAITS[t][Math.floor(r() * TRAITS[t].length)]]));
  const history = Array.from({ length: 14 }, (_, k) => ({
    t: Date.now() - (14 - k) * 6 * 86400e3,
    p: +(c.floor * (0.55 + k * 0.035 + r() * 0.25)).toFixed(4)
  }));
  return {
    c, id: Number(id), price, traits, history,
    seed: c.seed * 100 + (Number(id) % 50),
    views: Math.round(200 + r() * 3000), likes: Math.round(10 + r() * 240),
    rank: Math.round(1 + r() * c.items),
    owner: addr(r), offers: Array.from({ length: 4 }, () => ({ price: +(price * (0.78 + r() * 0.17)).toFixed(4), from: addr(r), exp: `${1 + Math.floor(r() * 6)} days` })).sort((a, b) => b.price - a.price)
  };
}

function addr(r) { return '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(r() * 16)]).join(''); }

const EVENTS = ['Sale', 'Sale', 'Sale', 'List', 'List', 'Offer', 'Transfer', 'Mint'];
export function activityFeed(count = 30, onlySlug) {
  const r = rng(onlySlug ? bySlug[onlySlug].seed * 31 : 4242);
  return Array.from({ length: count }, (_, i) => {
    const c = onlySlug ? bySlug[onlySlug] : collections[Math.floor(r() * collections.length)];
    const ev = EVENTS[Math.floor(r() * EVENTS.length)];
    const id = Math.floor(r() * c.items) + 1;
    return {
      ev, c, id, seed: c.seed * 100 + (id % 40),
      price: ev === 'Transfer' ? null : +(c.floor * (0.9 + r() * 0.5)).toFixed(4),
      from: ev === 'Mint' ? '0x0000000000000000000000000000000000000000' : addr(r),
      to: ev === 'List' || ev === 'Offer' ? null : addr(r),
      mins: Math.floor(i * 3 + r() * 6) + 1
    };
  });
}

export const drops = [
  { slug: 'monochrome-kami', title: 'Monochrome Kami II', creator: 'kami.studio', seed: 21, supply: 2222, minted: 1384, price: 0.02, phase: 'Live', stage: 'Public', endsInH: 5.2 },
  { slug: 'han-river-nights', title: 'Han River Nights: Dawn', creator: 'lowtide', seed: 34, supply: 4444, minted: 4120, price: 0, phase: 'Live', stage: 'Free mint', endsInH: 0.8 },
  { slug: 'dancheong-codes', title: 'Dancheong Codes Gold', creator: 'pattern house', seed: 42, supply: 3000, minted: 310, price: 0.008, phase: 'Live', stage: 'Allowlist', endsInH: 2.1 },
  { slug: 'bell-tones', title: 'Bell Tones: Second Peal', creator: 'temple audio', seed: 57, supply: 1111, minted: 0, price: 0.03, phase: 'Upcoming', stage: 'Public', startsInH: 26 },
  { slug: 'moon-gate', title: 'Moon Gate Winter', creator: 'circle press', seed: 61, supply: 500, minted: 0, price: 0.05, phase: 'Upcoming', stage: 'Allowlist', startsInH: 72 }
];

export const eth = n => (n == null ? '—' : n === 0 ? 'Free' : `${n.toLocaleString('en-US', { maximumFractionDigits: n < 0.01 ? 4 : 3 })} ETH`);
export const ethShort = n => (n == null ? '—' : n.toLocaleString('en-US', { maximumFractionDigits: n < 0.01 ? 4 : n < 1 ? 3 : 2 }));
export const num = n => n.toLocaleString('en-US');
export const compact = n => n.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 });
export const pct = n => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
export const shortAddr = a => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '—');
export const ago = mins => (mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ago` : `${Math.floor(mins / 1440)}d ago`);
