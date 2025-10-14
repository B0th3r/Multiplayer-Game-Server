const MAX_SEATS = 4;
const DEFAULT_PAIRS = 8;

const SYMBOLS = [
  "🍎", "🍌", "🍒", "🍇", "🍍", "🍉", "🥝", "🍑",
  "🥥", "🍓", "🫐", "🍋", "🥕", "🍪", "🥨", "🍰",
  "🧀", "🍩", "🍔", "🍟", "🌮", "🍣", "🍕", "🥐",
];

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeBoard(pairs = DEFAULT_PAIRS) {
  const vals = Array.from({ length: pairs }, (_, i) => SYMBOLS[i % SYMBOLS.length]);
  const deck = shuffle([...vals, ...vals]).map((v, idx) => ({
    idx,
    val: v,
    revealed: false,
    matched: false,
  }));
  return deck;
}

function occupiedSeatIndices(room) {
  return room.players.filter(p => p.seat != null).map(p => p.seat).sort((a, b) => a - b);
}

function nextOccupiedSeat(room, seatIdx) {
  const occ = occupiedSeatIndices(room);
  if (occ.length === 0) return null;
  const pos = occ.indexOf(seatIdx);
  const next = occ[(pos + 1) % occ.length];
  return next;
}

const memoryMatching = {
  id: "memoryMatching",
  minPlayers: 1,
  maxPlayers: MAX_SEATS,

  seatLabel(seat) { return seat == null ? "G" : `P${seat + 1}`; },

  assignSeats(room) {
    room.players.forEach((p, i) => { p.seat = i < MAX_SEATS ? i : null; });
  },

  initState(opts = {}) {
    const pairs = Number.isInteger(opts.pairs) ? Math.max(2, Math.min(12, opts.pairs)) : DEFAULT_PAIRS;
    return {
      board: makeBoard(pairs),
      phase: "playing",
      picks: [], // indices of currently revealed this turn
      currentSeat: 0,
      scores: Array.from({ length: MAX_SEATS }, () => 0),
      remainingPairs: pairs,
      last: null,
      round: 1,
      config: { pairs },
    };
  },

  serialize(room) {
    const st = room.game.state;
    const players = room.players.map(p => ({ id: p.id, name: p.name, seat: this.seatLabel(p.seat) }));
    const revealSet = new Set([...(st.picks || [])]);
    const board = st.board.map((c) => ({
      idx: c.idx,
      matched: c.matched,
      revealed: c.matched || revealSet.has(c.idx),
      val: (c.matched || revealSet.has(c.idx)) ? c.val : null,
    }));

    return {
      phase: st.phase,
      current: this.seatLabel(st.currentSeat),
      players,
      board,
      scores: st.scores,
      remainingPairs: st.remainingPairs,
      last: st.last,
      round: st.round,
      config: st.config,
    };
  },

  canAct(room, userId, action) {
    if (room.phase !== `playing:${this.id}`) return false;
    const p = room.players.find(p => p.id === userId);
    if (!p) return false;
    const st = room.game.state;

    if (st.phase === "playing") {
      if (p.seat !== st.currentSeat) return false;
      if (action.type === "flip") {
        const idx = action.idx;
        if (!Number.isInteger(idx)) return false;
        const card = st.board[idx];
        if (!card || card.matched || st.picks.includes(idx)) return false;
        if (st.picks.length >= 2) return false;
        return true;
      }
      return false;
    }

    if (st.phase === "reveal") {
      return action.type === "next" && p.seat === st.currentSeat;
    }

    if (st.phase === "finished") {
      return action.type === "new_game";
    }

    return false;
  },

  reduce(room, action) {
    const st = room.game.state;

    if (st.phase === "playing") {
      if (action.type === "flip") {
        const seatIdx = room.players.find(p => p.id === action._by)?.seat;
        if (seatIdx == null || seatIdx !== st.currentSeat) return;
        const idx = action.idx;
        const card = st.board[idx];
        if (!card || card.matched || st.picks.includes(idx)) return;

        // reveal
        st.picks.push(idx);
        st.last = { type: "flip", seat: seatIdx, idx };

        if (st.picks.length === 2) {
          const [a, b] = st.picks.map(i => st.board[i]);
          const match = a.val === b.val;
          if (match) {
            a.matched = b.matched = true;
            st.scores[seatIdx] = (st.scores[seatIdx] || 0) + 1;
            st.remainingPairs -= 1;
            st.last = { type: "reveal", match: true, pair: a.val, picks: [...st.picks] };
          } else {
            st.last = { type: "reveal", match: false, picks: [...st.picks] };
          }
          st.phase = "reveal";
        }
        return;
      }
    }

    if (st.phase === "reveal") {
      if (action.type === "next") {
        const [i1, i2] = st.picks;
        const a = st.board[i1];
        const b = st.board[i2];
        const wasMatch = a && b && a.val === b.val;
        st.picks = [];

        if (!wasMatch) {
          st.phase = "playing";
          st.currentSeat = nextOccupiedSeat(room, st.currentSeat);
          st.last = { type: "turn", to: st.currentSeat };
        } else {
          if (st.remainingPairs <= 0) {
            st.phase = "finished";
            st.last = { type: "finished", scores: st.scores };
          } else {
            st.phase = "playing";
          }
        }
        return;
      }
    }

    if (st.phase === "finished") {
      if (action.type === "new_game") {
        const pairs = st.config?.pairs || DEFAULT_PAIRS;
        st.board = makeBoard(pairs);
        st.picks = [];
        st.phase = "playing";
        st.currentSeat = 0;
        st.scores = Array.from({ length: MAX_SEATS }, () => 0);
        st.remainingPairs = pairs;
        st.round += 1;
        st.last = { type: "new_game", round: st.round };
      }
    }
  },

  isTerminal(room) { return false; },
};

module.exports = { memoryMatching };