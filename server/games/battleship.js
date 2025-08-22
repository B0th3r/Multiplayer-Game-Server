
const SIZE = 10;
const SHIPS = [5, 4, 3, 3, 2]; // Carrier, Battleship, Cruiser, Sub, Destroyer
const DIR = { H: "H", V: "V" };

const keyOf = (r, c) => `${r}:${c}`;
const inBounds = (r, c) => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

const makePlayerState = () => ({
    ready: false,
    ships: SHIPS.map(len => ({
        len,
        cells: [],          // [{r,c}]
        hits: new Set(),    // keys of hit cells
        placed: false,
    })),
    occ: new Set(),        // occupied cells (keys)
    shots: new Map(),      // key -> "hit" | "miss"
});

function allSunk(pstate) {
    return pstate.ships.every(s => s.placed && s.hits.size === s.len);
}

function placeShip(pstate, shipIndex, r, c, dir) {
    const ship = pstate.ships[shipIndex];
    if (!ship) return false;

    // Build cells
    const cells = [];
    for (let i = 0; i < ship.len; i++) {
        const rr = dir === DIR.H ? r : r + i;
        const cc = dir === DIR.H ? c + i : c;
        if (!inBounds(rr, cc)) return false;
        const k = keyOf(rr, cc);
        // Disallow overlap
        if (pstate.occ.has(k)) return false;
        cells.push({ r: rr, c: cc, k });
    }

    // Remove old placement (if re-placing)
    if (ship.placed) {
        for (const cell of ship.cells) pstate.occ.delete(keyOf(cell.r, cell.c));
    }

    // Commit
    ship.cells = cells.map(({ r, c }) => ({ r, c }));
    ship.placed = true;
    ship.hits = new Set();
    for (const { k } of cells) pstate.occ.add(k);

    // Changing a ship invalidates "ready"
    pstate.ready = false;
    return true;
}

function clearPlacement(pstate) {
    pstate.occ.clear();
    pstate.ships.forEach(s => {
        s.cells = [];
        s.hits = new Set();
        s.placed = false;
    });
    pstate.ready = false;
}

function tryFire(attacker, defender, r, c) {
    const k = keyOf(r, c);
    if (!inBounds(r, c)) return { ok: false };
    if (attacker.shots.has(k)) return { ok: false }; // already shot

    // Hit or miss?
    const hit = defender.occ.has(k);
    attacker.shots.set(k, hit ? "hit" : "miss");

    if (hit) {
        // Mark hit on the exact ship
        for (const s of defender.ships) {
            for (const cell of s.cells) {
                if (cell.r === r && cell.c === c) {
                    s.hits.add(k);
                    break;
                }
            }
        }
    }
    return { ok: true, result: hit ? "hit" : "miss" };
}

const battleship = {
    id: "battleship",
    minPlayers: 2,
    maxPlayers: 2,

    seatLabel(seat) {
        return seat === 0 ? "P0" : seat === 1 ? "P1" : null;
    },

    assignSeats(room) {
        room.players.forEach((p, i) => { p.seat = i < 2 ? i : null; });
    },

    initState() {
        return {
            phase: "setup",       // "setup" | "battle" | "over"
            currentSeat: 0,       // who fires next (used in "battle")
            winner: null,         // 0 | 1 | null
            p: [makePlayerState(), makePlayerState()],
        };
    },

    // Personalized serializer — pass viewerId
    serialize(room, viewerId) {
        const st = room.game.state;
        const meSeat = room.players.find(p => p.id === viewerId)?.seat ?? null;

        const viewForSeat = (seat) => {
            const ps = st.p[seat];
            return {
                ready: ps.ready,
                ships: ps.ships.map(s => ({
                    len: s.len,
                    placed: s.placed,
                    sunk: s.placed && s.hits.size === s.len,
                    // Only reveal cells/hits to the seated player viewing themselves
                    cells: (meSeat === seat) ? s.cells : undefined,
                    hits: (meSeat === seat) ? Array.from(s.hits) : undefined,
                })),
                // Shots are public knowledge: (coord key, "hit" | "miss")
                shots: Array.from(ps.shots.entries()).map(([k, v]) => ({ k, result: v })),
            };
        };

        // Spectator-safe redaction: show shots + non-revealing ship status for both seats
        const spectatorView = (meSeat === null)
            ? {
                p0: {
                    shots: Array.from(st.p[0].shots.entries()).map(([k, v]) => ({ k, result: v })),
                    ships: st.p[0].ships.map(s => ({
                        len: s.len, placed: s.placed, sunk: s.placed && s.hits.size === s.len
                    })),
                },
                p1: {
                    shots: Array.from(st.p[1].shots.entries()).map(([k, v]) => ({ k, result: v })),
                    ships: st.p[1].ships.map(s => ({
                        len: s.len, placed: s.placed, sunk: s.placed && s.hits.size === s.len
                    })),
                },
            }
            : null;

        return {
            gameId: this.id,
            size: SIZE,
            ships: SHIPS,
            phase: st.phase,
            currentSeat: st.phase === "battle" ? st.currentSeat : null,
            winner: st.winner,
            players: room.players.map(p => ({
                id: p.id,
                name: p.name,
                seat: p.seat,
                label: this.seatLabel(p.seat),
            })),
            meSeat,
            me: (meSeat === 0 || meSeat === 1) ? viewForSeat(meSeat) : null,
            opponent: (meSeat === 0 || meSeat === 1) ? viewForSeat(meSeat ^ 1) : null,
            spectator: meSeat === null ? {
                p0: {
                    shots: Array.from(st.p[0].shots.entries()).map(([k, v]) => ({ k, result: v })),
                    ships: st.p[0].ships.map(s => ({ len: s.len, placed: s.placed, sunk: s.placed && s.hits.size === s.len })),
                },
                p1: {
                    shots: Array.from(st.p[1].shots.entries()).map(([k, v]) => ({ k, result: v })),
                    ships: st.p[1].ships.map(s => ({ len: s.len, placed: s.placed, sunk: s.placed && s.hits.size === s.len })),
                },
            } : null,
        };
    },

    canAct(room, socket, action) {
        const me = room.players.find(p => p.id === socket.id);
        if (!me || me.seat == null) return false;
        const st = room.game.state;

        if (action?.type === "place") {
            if (st.phase !== "setup") return false;
            const { shipIndex, r, c, dir } = action;
            if (!Number.isInteger(shipIndex) || shipIndex < 0 || shipIndex >= SHIPS.length) return false;
            if (!(Number.isInteger(r) && Number.isInteger(c))) return false;
            if (!(dir === DIR.H || dir === DIR.V)) return false;
            return true;
        }

        if (action?.type === "clear") {
            return st.phase === "setup";
        }

        if (action?.type === "ready") {
            if (st.phase !== "setup") return false;
            // Must have all ships placed
            const ps = st.p[me.seat];
            return ps.ships.every(s => s.placed);
        }

        if (action?.type === "fire") {
            if (st.phase !== "battle") return false;
            if (st.currentSeat !== me.seat) return false;
            const { r, c } = action;
            if (!(Number.isInteger(r) && Number.isInteger(c))) return false;
            if (!inBounds(r, c)) return false;
            return true;
        }

        return false;
    },

    reduce(room, action) {
        const st = room.game.state;
        const meSeat = room.players.find(p => p.id === action._by)?.seat;
        if (meSeat == null) return;

        if (action.type === "place") {
            const { shipIndex, r, c, dir } = action;
            placeShip(st.p[meSeat], shipIndex, r, c, dir);
            return;
        }

        if (action.type === "clear") {
            clearPlacement(st.p[meSeat]);
            return;
        }

        if (action.type === "ready") {
            st.p[meSeat].ready = true;
            if (st.p[0].ready && st.p[1].ready) {
                st.phase = "battle";
                st.currentSeat = 0;
            }
            return;
        }

        if (action.type === "fire") {
            const attacker = st.p[meSeat];
            const defender = st.p[meSeat ^ 1];

            const { r, c } = action;
            const res = tryFire(attacker, defender, r, c);
            if (!res.ok) return;

            // Check victory
            if (allSunk(defender)) {
                st.phase = "over";
                st.winner = meSeat;
                return;
            }

            // Alternate turns every shot (simple rule)
            st.currentSeat = st.currentSeat ^ 1;
            return;
        }
    },

    isTerminal(room) {
        return room.game.state.phase === "over";
    },
};

module.exports = { battleship };
