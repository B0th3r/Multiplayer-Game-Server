
const BAR_TMJ = new URL('../assets/maps/bar_district.tmj', import.meta.url).href;
const RPG_TMJ = new URL('../assets/maps/neighborhood.tmj', import.meta.url).href;
const IDLE_PNG = new URL('../assets/sprites/Idle.png', import.meta.url).href;
const WALK_PNG = new URL('../assets/sprites/Walk.png', import.meta.url).href;

export const GAME = {
  flags: new Set(),
  clues: new Set(),
  claims: {},
};

export const MAPS = {
  bar: {
    path: BAR_TMJ,
    start: { x: 4, y: 8 },
    npcs: [],
    exits: [
      { x: 0, y: 7, to: "neighborhood", toStart: { x: 44, y: 20 } },
    ],
  },
  neighborhood: {
    path: RPG_TMJ,
    start: { x: 2, y: 8 },
    npcs: [
      { id: "jim",  name: "Jim",  x: 10, y: 7, gid: 423, dialogueId: "jim" },
      { id: "sam",  name: "Sam",  x: 14, y: 10, gid: 438, dialogueId: "sam" },
      { id: "john", name: "John", x: 6, y: 9, gid: 438, dialogueId: "john" },
    ],
    exits: [
      { x: 44, y: 20, to: "bar", toStart: { x: 0, y: 7 } },
    ],
  },
};

export const SPRITE = {
  fw: 32,
  fh: 32,
  idleCols: 4,
  walkCols: 6,
  rows: { down: 0, up: 1, side: 2 }, // row order in the sheets
  msPerFrame: { idle: 240, walk: 100 },
  src: { idle: IDLE_PNG, walk: WALK_PNG },
};
