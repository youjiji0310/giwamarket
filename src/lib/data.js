// Sample data — replace with on-chain / indexer data later.
export const collections = [
  { slug: 'monochrome-kami', name: 'Monochrome Kami', creator: 'kami.studio', seed: 3, items: 2222, floor: 0.150, change: 24.9, volume: 1284, owners: 1044, royalty: 5, verified: true,
    blurb: 'Two thousand guardian spirits drawn in ink, each carrying its own roof tile, seal and aura.' },
  { slug: 'hanok-spirits', name: 'Hanok Spirits', creator: 'atelier hanok', seed: 11, items: 3333, floor: 0.084, change: 18.4, volume: 902, owners: 1912, royalty: 5, verified: true,
    blurb: 'Quiet architecture as character. Courtyards, timber and light, rendered in silver.' },
  { slug: 'seoul-static', name: 'Seoul Static', creator: 'n.signal', seed: 7, items: 5000, floor: 0.031, change: 7.2, volume: 615, owners: 2640, royalty: 4, verified: true,
    blurb: 'Night frequencies of a city that never fully sleeps.' },
  { slug: 'giwa-tiles', name: 'Giwa Tiles', creator: 'onggi lab', seed: 1, items: 10000, floor: 0.012, change: -4.6, volume: 488, owners: 4208, royalty: 3, verified: false,
    blurb: 'Ten thousand roof tiles. One of them holds the light.' },
  { slug: 'dancheong-codes', name: 'Dancheong Codes', creator: 'pattern house', seed: 13, items: 3000, floor: 0.026, change: 11.8, volume: 302, owners: 1330, royalty: 5, verified: true,
    blurb: 'Temple ornament translated into pure geometry.' },
  { slug: 'han-river-nights', name: 'Han River Nights', creator: 'lowtide', seed: 9, items: 4444, floor: 0.018, change: -9.3, volume: 211, owners: 2077, royalty: 5, verified: false,
    blurb: 'Moonlight on moving water, one frame at a time.' }
];

export const bySlug = Object.fromEntries(collections.map(c => [c.slug, c]));

export function itemsFor(slug, count = 16) {
  const c = bySlug[slug];
  return Array.from({ length: count }, (_, i) => {
    const id = ((c.seed * 131 + i * 977) % c.items) + 1;
    const listed = i % 5 !== 3;
    const price = listed ? +(c.floor * (1 + ((i * 37) % 29) / 40)).toFixed(3) : null;
    return { id, slug, collection: c.name, listed, price, rank: ((i * 271 + c.seed * 17) % c.items) + 1, seed: c.seed * 100 + i };
  });
}

export const drops = [
  { slug: 'monochrome-kami', title: 'Monochrome Kami II', creator: 'kami.studio', seed: 21, supply: 2222, minted: 1384, price: 0.02, phase: 'Public', endsInH: 5.2 },
  { slug: 'han-river-nights', title: 'Han River Nights: Dawn', creator: 'lowtide', seed: 34, supply: 4444, minted: 4120, price: 0, phase: 'Free mint', endsInH: 0.8 },
  { slug: 'dancheong-codes', title: 'Dancheong Codes — Gold', creator: 'pattern house', seed: 42, supply: 3000, minted: 310, price: 0.008, phase: 'Allowlist', endsInH: 2.1 }
];

export const latest = [
  ['monochrome-kami', 88, 0.162, 2], ['hanok-spirits', 1204, 0.091, 4], ['seoul-static', 4410, 0.033, 9],
  ['giwa-tiles', 7031, 0.014, 14], ['dancheong-codes', 2290, 0.029, 21], ['han-river-nights', 615, 0.020, 33],
  ['monochrome-kami', 1630, 0.171, 41], ['hanok-spirits', 310, 0.088, 56]
].map(([slug, id, price, mins], i) => ({ slug, id, price, mins, collection: bySlug[slug].name, seed: bySlug[slug].seed * 100 + i + 40 }));

export const eth = n => n === 0 ? 'Free' : `${n.toLocaleString('en-US', { maximumFractionDigits: 3 })} ETH`;
export const num = n => n.toLocaleString('en-US');
