export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Image failed: ${src}`));
    img.src = src;
  });
}

function resolveURL(rel, base) {
  const u = new URL(rel, base);
  if (process.env.NODE_ENV !== "production") {
    console.debug("[resolveURL]", {
      rel,
      base: base.toString(),
      resolved: u.toString(),
    });
  }
  return u;
}

function toGrid(arr, width) {
  const grid = [];
  for (let y = 0; y < arr.length / width; y++) {
    grid.push(arr.slice(y * width, (y + 1) * width));
  }
  return grid;
}

const FLIP_MASK = 0x1fffffff;

export async function loadTMJ(url, opts = {}) {
  const mapUrl = new URL(url, location.href);
  if (process.env.NODE_ENV !== "production") {
    console.debug("[loadTMJ] mapUrl", mapUrl.toString());
  }

  const map = await (await fetch(mapUrl, opts)).json();
  const tilesets = [];

  for (const ts of map.tilesets) {
    if (ts.source) {
      const tsUrl = resolveURL(ts.source, mapUrl);
      const tsj = await (await fetch(tsUrl, opts)).json();

      const imgUrl = resolveURL(tsj.image, tsUrl);
      const img = await loadImage(imgUrl.toString());
      const cols = Math.floor(img.width / tsj.tilewidth);

      tilesets.push({
        firstgid: ts.firstgid,
        img,
        cols,
        tw: tsj.tilewidth,
        th: tsj.tileheight,
        name: tsj.name,
      });
    } else {
      const imgUrl = resolveURL(ts.image, mapUrl);
      const img = await loadImage(imgUrl.toString());
      const cols = Math.floor(img.width / ts.tilewidth);

      tilesets.push({
        firstgid: ts.firstgid,
        img,
        cols,
        tw: ts.tilewidth,
        th: ts.tileheight,
        name: ts.name,
      });
    }
  }

  tilesets.sort((a, b) => a.firstgid - b.firstgid);

  const tileLayers = map.layers.filter((l) => l.type === "tilelayer");
  const layers = tileLayers.map((l) => ({
    name: l.name,
    width: map.width,
    height: map.height,
    grid: toGrid(l.data, map.width),
  }));

  return {
    width: map.width,
    height: map.height,
    tilewidth: map.tilewidth,
    tileheight: map.tileheight,
    tilesets,
    layers,
  };
}

export function gidToDrawInfo(rawGid, tilesets) {
  if (!rawGid) return null;
  const gid = rawGid & FLIP_MASK;
  let chosen = null;
  for (const ts of tilesets) {
    if (gid >= ts.firstgid) chosen = ts;
    else break;
  }
  if (!chosen) return null;
  const local = gid - chosen.firstgid;
  const sx = (local % chosen.cols) * chosen.tw;
  const sy = Math.floor(local / chosen.cols) * chosen.th;
  return { img: chosen.img, sx, sy, sw: chosen.tw, sh: chosen.th };
}
