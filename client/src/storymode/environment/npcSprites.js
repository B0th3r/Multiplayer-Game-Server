const npcStand = import.meta.glob("../assets/sprites/npcs/**/sheet.png", {
  eager: true,
  as: "url",
});

function npcIdFromPath(path) {
  const parts = path.split("/");
  const i = parts.lastIndexOf("npcs");
  return i >= 0 ? parts[i + 1] : null;
}

export const NPC_SPRITES = (() => {
  const out = {};
  for (const path in npcStand) {
    const id = npcIdFromPath(path);
    if (!id) continue;
    out[id] = npcStand[path];
  }
  return out;
})();

export function getNpcSprite(id) {
  return NPC_SPRITES[id] ?? null;
}
