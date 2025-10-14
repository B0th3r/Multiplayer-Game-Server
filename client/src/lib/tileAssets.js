import { TILE_NAMES } from '../../../shared/mahjong.js';

const files = import.meta.glob('/tiles/*.svg', { eager: true, as: 'url' });
const byName = {};
for (const [path, url] of Object.entries(files)) {
  const name = path.split('/').pop().replace('.svg','');
  byName[name] = url;
}

export function urlForTileIndex(i) {
  const name = TILE_NAMES[i];
  return byName[name] || null;
}
