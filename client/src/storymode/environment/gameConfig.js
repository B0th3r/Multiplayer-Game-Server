const City_TMJ = new URL('../assets/maps/bar_district.tmj', import.meta.url).href;
const Neighborhood_TMJ = new URL('../assets/maps/neighborhood.tmj', import.meta.url).href;
const Bar_TMJ = new URL('../assets/maps/bar.tmj', import.meta.url).href;
const JimDonnasHouse_TMJ = new URL('../assets/maps/JimDonnasHouse.tmj', import.meta.url).href;
const JohnsHouse_TMJ = new URL('../assets/maps/JohnsHouse.tmj', import.meta.url).href;
const Office_TMJ = new URL('../assets/maps/office.tmj', import.meta.url).href;
const PD_TMJ = new URL('../assets/maps/PD.tmj', import.meta.url).href;
const Shop_TMJ = new URL('../assets/maps/flower_shop.tmj', import.meta.url).href;
const PLAYER_PNG = new URL('../assets/sprites/npcs/player/sheet.png', import.meta.url).href;

export const GAME = {
  flags: new Set(),
  clues: new Set(),
  claims: {},
  metadata: new Map()
};

export const MAPS = {
  office: {
    path: Office_TMJ,
    start: { x: 3, y: 5 },
    autoStartDialogue: "lieutenant",
    npcs: [
    ],
    exits: [
      { x: 0, y: 10, to: "pd", toStart: { x: 18, y: 4 } },
    ],
  },
  pd: {
    path: PD_TMJ,
    start: { x: 18, y: 4 },
    npcs: [{ id: "lucas", x: 14, y: 3, gid: 1105, dialogueId: "lucas", spriteId: "lucas" },
    { id: "bobby", x: 1, y: 9, gid: 1105, dialogueId: "bobbyMarcus" },
    { id: "jack", x: 2, y: 20, gid: 1105, dialogueId: "jackAlex" },
    { id: "alex", x: 2, y: 21, gid: 1105, dialogueId: "jackAlex" },
    { id: "maya", x: 2, y: 4, gid: 1105, },
    { id: "ace", x: 10, y: 24, gid: 1105, dialogueId: "ace" }
    ],
  },
  bar: {
    path: Bar_TMJ,
    start: { x: 9, y: 21 },
    npcs: [{ id: "jane", name: "jane", x: 4, y: 8, gid: 3428, dialogueId: "jane" },
    { id: "bartender", x: 1, y: 14, gid: 3428 },
    { id: "marcus", gid: 106 },
    { id: "gambler", x: 15, y: 5, gid: 3586, dialogueId: "gambler" },
    { id: "maya", x: 15, y: 15, gid: 3586, dialogueId: "mayaBar" },
    ],
    exits: [
      { x: 9, y: 21, to: "city", toStart: { x: 7, y: 6 } },
    ],
  },
  shop: {
    path: Shop_TMJ,
    start: { x: 4, y: 7 },
    npcs: [{ id: "florist", name: "florist", x: 4, y: 2, gid: 106, dialogueId: "florist" },
    ],
    exits: [
      { x: 4, y: 9, to: "city", toStart: { x: 21, y: 6 } },
    ],
  },
  city: {
    path: City_TMJ,
    start: { x: 4, y: 8 },
    autoStartRequires: { flagsAny: ["BobbyDirty", "BobbyGood"] },
    autoStartDialogue: "marcus",
    autoStartRequires: { flagsAll: ["poem_passed"] },
    autoStartDialogue: "maya",
    npcs: [
      { id: "lucas", name: "lucas", x: 14, y: 5, gid: 106, dialogueId: "lucasCity", spriteId: "lucas" },
      { id: "bobby", name: "bobby", x: 3, y: 6, gid: 106, dialogueId: "bobby" },
      { id: "delivery_girl", x: 4, y: 7, gid: 106, dialogueId: "bobby" },
      { id: "marcus", gid: 106, dialogueId: "marcus" },
      { id: "maya", gid: 106, dialogueId: "maya" },
      { id: "flower_promoter", name: "flower promoter", x: 21, y: 6, gid: 106, dialogueId: "flower_promoter" },
    ],
    exits: [
      { x: 8, y: 6, to: "bar", toStart: { x: 9, y: 21 } },
      { x: 24, y: 6, to: "shop", toStart: { x: 4, y: 7 } },
      { x: 0, y: 7, to: "neighborhood", toStart: { x: 44, y: 20 } },
    ],
  },
  neighborhood: {
    path: Neighborhood_TMJ,
    start: { x: 5, y: 10 },
    npcs: [
      { id: "hayes", name: "Detective Hayes", x: 3, y: 8, gid: 437, dialogueId: "hayes" },
      { id: "tim", name: "Tim", x: 24, y: 8, gid: 451, dialogueId: "tim" },
      { id: "sam", name: "Sam", x: 39, y: 16, gid: 438, dialogueId: "sam" },
    ],
    exits: [
      { x: 53, y: 8, to: "jimDonnasHouse", toStart: { x: 13, y: 4 } },
      { x: 26, y: 20, to: "johnsHouse", toStart: { x: 2, y: 1 } },
      { x: 64, y: 20, to: "city", toStart: { x: 0, y: 7 } },
    ],
  },
  jimDonnasHouse: {
    path: JimDonnasHouse_TMJ,
    start: { x: 5, y: 5 },
    npcs: [{ id: "jimDonna", name: "Jim", x: 10, y: 4, gid: 424, dialogueId: "jimDonna" },
    { id: "donna", name: "Donna", x: 11, y: 4, gid: 439, dialogueId: "jimDonna" }
    ],
    exits: [
      { x: 13, y: 2, to: "neighborhood", toStart: { x: 53, y: 8 } },
    ],
  },
  johnsHouse: {
    path: JohnsHouse_TMJ,
    start: { x: 5, y: 5 },
    npcs: [{ id: "john", name: "John", x: 10, y: 8, gid: 1605, dialogueId: "john" },],
    exits: [
      { x: 0, y: 2, to: "neighborhood", toStart: { x: 24, y: 20 } },
    ],
  },
};

export const SPRITE = {
  fw: 16,
  fh: 32,
  idleCols: 1,
  walkCols: 4,
  rows: {
    down: 0,
    side: 1,
    up: 2,
  },

  msPerFrame: { idle: 250, walk: 110 },
  src: PLAYER_PNG,
};
