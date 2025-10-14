const DEV_MODE = process.env.DEV_MODE === '1';
function isDevHost(room, userId) {
    const hostId = room.host?.id ?? room.players[0]?.id;
    return DEV_MODE && userId === hostId;
}


function nextOccupiedSeat(room, i) {
    const occupied = room.players
        .filter((p) => p.seat != null)
        .map((p) => p.seat)
        .sort((a, b) => a - b);

    if (occupied.length === 0) return null;

    const pos = occupied.indexOf(i);
    if (pos === -1) return occupied[0];
    return occupied[(pos + 1) % occupied.length];
}

const MAX_SEATS = 2;
const START_POINTS = 25_000;


const TILE_NAMES = [
    // Man
    '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
    // Pin
    '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p',
    // Sou
    '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s',
    // honors
    'E', 'S', 'W', 'N', 'Wh', 'G', 'R',
];


function seatAfter(i) {
    return (i + 1) % MAX_SEATS;
}



function isSuit(i) {
    return i >= 0 && i <= 26;
}

function numOf(i) {
    return isSuit(i) ? (i % 9) + 1 : 0;
}

function isHonor(i) {
    return i >= 27;
}

function isTerminal(i) {
    return (isSuit(i) && (numOf(i) === 1 || numOf(i) === 9)) || isHonor(i);
}


function makeWall() {
    const tiles = [];
    for (let t = 0; t < 34; t++) {
        for (let c = 0; c < 4; c++) tiles.push(t);
    }
    return shuffle(tiles);
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function drawFromWall(state) {
    if (state.liveWall.length === 0) return null;
    return state.liveWall.pop();
}

function countsFromHand(arr) {
    const c = new Array(34).fill(0);
    for (const x of arr) c[x]++;
    return c;
}

function nextOf(tile) {
    if (isSuit(tile)) {
        const n = numOf(tile);
        const base = tile - (n - 1);
        const nextNum = n === 9 ? 1 : n + 1;
        return base + (nextNum - 1);
    }
    // Winds E(27)->S(28)->W(29)->N(30)->E
    if (tile >= 27 && tile <= 30) return tile === 30 ? 27 : tile + 1;
    // Dragons Wh(31)->G(32)->R(33)->Wh(31)
    if (tile >= 31 && tile <= 33) return tile === 33 ? 31 : tile + 1;
    return tile;
}

function isAgari14(counts) {
    const key = counts.join(',');
    if (isAgari14.cache.has(key)) return isAgari14.cache.get(key);

    let ok = false;
    for (let i = 0; i < 34; i++) {
        if (counts[i] >= 2) {
            counts[i] -= 2;
            if (canMakeMelds(counts)) {
                ok = true;
                counts[i] += 2;
                break;
            }
            counts[i] += 2;
        }
    }
    isAgari14.cache.set(key, ok);
    return ok;
}

isAgari14.cache = new Map();

function canMakeMelds(counts) {
    const key = 'M:' + counts.join(',');
    if (canMakeMelds.cache.has(key)) return canMakeMelds.cache.get(key);

    let i = 0;
    while (i < 34 && counts[i] === 0) i++;

    if (i === 34) {
        canMakeMelds.cache.set(key, true);
        return true;
    }

    if (counts[i] >= 3) {
        counts[i] -= 3;
        if (canMakeMelds(counts)) {
            counts[i] += 3;
            canMakeMelds.cache.set(key, true);
            return true;
        }
        counts[i] += 3;
    }

    // Try sequence if suited
    if (isSuit(i)) {
        const n = numOf(i);
        if (n <= 7 && counts[i + 1] > 0 && counts[i + 2] > 0) {
            counts[i]--;
            counts[i + 1]--;
            counts[i + 2]--;
            if (canMakeMelds(counts)) {
                counts[i]++;
                counts[i + 1]++;
                counts[i + 2]++;
                canMakeMelds.cache.set(key, true);
                return true;
            }
            counts[i]++;
            counts[i + 1]++;
            counts[i + 2]++;
        }
    }

    canMakeMelds.cache.set(key, false);
    return false;
}

canMakeMelds.cache = new Map();

function waitingTiles13(counts) {
    const waits = [];
    for (let t = 0; t < 34; t++) {
        if (counts[t] === 4) continue;
        counts[t]++;
        if (isAgari14(counts)) waits.push(t);
        counts[t]--;
    }
    return waits;
}

function isTenpai13(counts) {
    return waitingTiles13(counts).length > 0;
}

function hanForHand({ counts14, closed, riichi, tsumo, doraActual }) {
    let han = 0;

    if (riichi) han += 1;
    if (tsumo && closed) han += 1;
    let allSimples = true;
    for (let i = 0; i < 34; i++) {
        if (counts14[i] > 0 && isTerminal(i)) {
            allSimples = false;
            break;
        }
    }
    if (allSimples) han += 1;

    let dora = 0;
    if (typeof doraActual === 'number') dora = counts14[doraActual] || 0;
    han += dora;

    return { han, dora };
}

function baseFromHan(h) {
    if (h <= 0) return 0;
    if (h === 1) return 1000;
    if (h === 2) return 2000;
    if (h === 3) return 3900;
    if (h === 4) return 7700;
    return 12000;
}

function initialDeal(state) {
    for (let r = 0; r < 3; r++) {
        for (let s = 0; s < MAX_SEATS; s++) {
            for (let k = 0; k < 4; k++) state.hands[s].push(drawFromWall(state));
        }
    }

    for (let s = 0; s < MAX_SEATS; s++) state.hands[s].push(drawFromWall(state));

    state.doraIndicator = state.deadWall[4];

    state.hands[state.dealer].push(drawFromWall(state));
    state.turn = state.dealer;
    state.phase = 'playing';
    state.last = { type: 'start', dealer: state.dealer };
}

function setupHand(state) {
    const wall = makeWall();

    state.deadWall = wall.slice(0, 14);
    state.liveWall = wall.slice(14);

    state.hands = Array.from({ length: MAX_SEATS }, () => []);
    state.rivers = Array.from({ length: MAX_SEATS }, () => []);
    state.riichi = Array.from({ length: MAX_SEATS }, () => false);
    state.furiten = Array.from({ length: MAX_SEATS }, () => false);

    state.lastDiscard = null;
    state.claim = null;

    initialDeal(state);
}

function computeFuriten(state, seat) {
    const counts = countsFromHand(state.hands[seat]);
    const waits = new Set(waitingTiles13(counts));
    const river = state.rivers[seat];
    for (const t of river) if (waits.has(t)) return true;
    return false;
}


const riichi = {
    id: 'riichi',
    minPlayers: 1,
    maxPlayers: MAX_SEATS,

    seatLabel(seat) {
        return seat == null ? 'G' : `P${seat + 1}`;
    },

    assignSeats(room) {
        room.players.forEach((p, i) => {
            p.seat = i < MAX_SEATS ? i : null;
        });
    },

    initState() {
        const state = {
            phase: 'setup',
            liveWall: [],
            deadWall: [],
            doraIndicator: null,
            hands: [],
            rivers: [],
            riichi: [],
            furiten: [],
            dealer: 0,
            turn: 0,
            points: Array.from({ length: MAX_SEATS }, () => START_POINTS),
            riichiSticks: 0,
            claim: null,
            last: null,
            round: 1,
        };
        setupHand(state);
        return state;
    },

    serialize(room, viewerId) {
        const state = room.game.state;
        const viewerSeat = room.players.find(p => p.id === viewerId)?.seat;

        const hands = state.hands.map((h, s) =>
            s === viewerSeat ? h.map(t => TILE_NAMES[t]) : new Array(h.length).fill('??')
        );
        const players = room.players.map((p) => ({
            id: p.id,
            name: p.name,
            color: this.seatLabel(p.seat),
        }));

        const rivers = state.rivers.map((r) => r.map((t) => TILE_NAMES[t]));

        let eligibleRonSeats = [];
        if (state.phase === 'claim' && state.claim) {
            eligibleRonSeats = state.claim.eligible.slice();
        }

        return {
            phase: state.phase,
            current: this.seatLabel(state.turn),
            players,
            hands,
            rivers,
            riichi: state.riichi,
            furiten: state.furiten,
            points: state.points,
            dealer: this.seatLabel(state.dealer),
            doraIndicator: state.doraIndicator != null ? TILE_NAMES[state.doraIndicator] : null,
            doraActual: state.doraIndicator != null ? TILE_NAMES[nextOf(state.doraIndicator)] : null,
            riichiSticks: state.riichiSticks,
            lastDiscard: state.lastDiscard
                ? { seat: this.seatLabel(state.lastDiscard.seat), tile: TILE_NAMES[state.lastDiscard.tile] }
                : null,
            claim: state.phase === 'claim'
                ? { from: this.seatLabel(state.claim.from), eligible: eligibleRonSeats.map((s) => this.seatLabel(s)) }
                : null,
            last: state.last,
            round: state.round,
        };
    },

    canAct(room, userId, action) {
        if (room.phase !== `playing:${this.id}`) return false;
        if (
            isDevHost(room, userId) &&
            (action.type === 'dev_skip_others' ||
                action.type === 'dev_seed_tsumo' ||
                action.type === 'dev_seed_ron')
        ) {
            return true;
        }

        const player = room.players.find((x) => x.id === userId);
        if (!player) return false;

        const state = room.game.state;
        const seat = player.seat;

        if (state.phase === 'playing') {
            if (seat !== state.turn) return false;

            if (action.type === 'discard') {
                const i = action.index;
                return Number.isInteger(i) && i >= 0 && i < state.hands[seat].length;
            }

            if (action.type === 'riichi') {
                if (state.riichi[seat]) return false;
                if (state.points[seat] < 1000) return false;
                const counts = countsFromHand(state.hands[seat]);
                return isTenpai13(counts);
            }

            if (action.type === 'tsumo') {
                const counts14 = countsFromHand(state.hands[seat]);
                return isAgari14(counts14);
            }

            return false;
        }

        if (state.phase === 'claim') {
            if (action.type === 'ron') {
                if (seat === state.claim.from) return false;
                return state.claim.eligible.includes(seat);
            }
            if (action.type === 'no_ron') {
                return seat !== state.claim.from;
            }
            return false;
        }

        if (state.phase === 'finished') {
            return action.type === 'next_hand';
        }

        return false;
    },

    reduce(room, action) {
        const state = room.game.state;
        const seatOf = (uid) => room.players.find((p) => p.id === uid)?.seat;
        if (isDevHost(room, action._by)) {
            if (action.type === 'dev_seed_tsumo') {
                const seat = Number(action.seat) ?? 0;
                state.phase = 'playing';
                state.turn = seat;
                state.rivers = state.rivers.map(() => []);
                state.riichi = state.riichi.map(() => false);
                state.furiten = state.furiten.map(() => false);
                state.hands[seat] = (action.tiles14 || []).slice(0, 14);
                state.last = { type: 'dev_seed_tsumo', seat };
                return;
            }

            if (action.type === 'dev_seed_ron') {
                const w = Number(action.winnerSeat) ?? 0;
                const d = Number(action.discarderSeat) ?? 1;
                const tile = action.discardTile;

                state.phase = 'claim';
                state.rivers = state.rivers.map(() => []);
                state.riichi = state.riichi.map(() => false);
                state.furiten = state.furiten.map(() => false);

                state.hands[w] = (action.winner13 || []).slice(0, 13);
                state.hands[d] = state.hands[d] || [];
                state.hands[d].push(tile);

                const idx = state.hands[d].lastIndexOf(tile);
                const disc = state.hands[d].splice(idx, 1)[0];
                state.rivers[d].push(disc);

                state.lastDiscard = { tile: disc, seat: d };
                state.claim = { from: d, eligible: [w], noRon: new Set() };
                state.turn = d;
                state.last = { type: 'dev_seed_ron', winner: w, from: d, tile: disc };
                return;
            }

            if (action.type === 'dev_skip_others') {
                const meSeat = seatOf(action._by);
                if (meSeat == null) return;

                let safety = 0;
                while (state.phase !== 'finished' && state.turn !== meSeat && safety++ < 200) {
                    if (state.phase === 'claim') {
                        const from = state.claim.from;
                        const next = nextOccupiedSeat(room, from);
                        state.turn = next;
                        state.phase = 'playing';
                        state.claim = null;

                        const draw = drawFromWall(state);
                        if (!draw) {
                            state.phase = 'finished';
                            state.last = { type: 'ryuukyoku' };
                            break;
                        }
                        state.hands[next].push(draw);
                        state.last = { type: 'draw', seat: next };
                        continue;
                    }

                    const s = state.turn;
                    const hand = state.hands[s];
                    if (!hand || hand.length === 0) break;

                    const idx = hand.length - 1;
                    const tile = hand.splice(idx, 1)[0];
                    state.rivers[s].push(tile);
                    state.lastDiscard = { tile, seat: s };

                    const next = nextOccupiedSeat(room, s);
                    state.turn = next;

                    const draw = drawFromWall(state);
                    if (!draw) {
                        state.phase = 'finished';
                        state.last = { type: 'ryuukyoku' };
                        break;
                    }
                    state.hands[next].push(draw);
                    state.phase = 'playing';
                    state.claim = null;
                    state.last = { type: 'draw', seat: next };
                }
                return;
            }
        }

        if (state.phase === 'playing') {
            const seat = seatOf(action._by);
            if (state.turn !== seat) return;

            if (action.type === 'riichi') {
                state.riichi[seat] = true;
                state.points[seat] -= 1000;
                state.riichiSticks += 1;
                state.last = { type: 'riichi', seat };
                return;
            }

            if (action.type === 'tsumo') {
                const counts14 = countsFromHand(state.hands[seat]);
                if (!isAgari14(counts14)) return;

                const { han } = hanForHand({
                    counts14,
                    closed: true,
                    riichi: state.riichi[seat],
                    tsumo: true,
                    doraActual: nextOf(state.doraIndicator),
                });

                const base = baseFromHan(han);
                const each = Math.ceil(base / 3);

                let total = 0;
                for (let s = 0; s < MAX_SEATS; s++) {
                    if (s !== seat) {
                        state.points[s] -= each;
                        total += each;
                    }
                }

                state.points[seat] += total + state.riichiSticks * 1000;
                state.riichiSticks = 0;
                state.last = { type: 'tsumo', seat, han, base };
                state.phase = 'finished';
                return;
            }

            if (action.type === 'discard') {
                const s = seat;
                const hand = state.hands[s];
                const idx = action.index;
                const tile = hand.splice(idx, 1)[0];

                state.rivers[s].push(tile);
                state.lastDiscard = { tile, seat: s };

                for (let u = 0; u < MAX_SEATS; u++) state.furiten[u] = computeFuriten(state, u);

                // Claim phase where only Ron allowed
                const eligible = [];
                for (let u = 0; u < MAX_SEATS; u++) {
                    if (u === s) continue;
                    if (state.furiten[u]) continue;

                    const c = countsFromHand(state.hands[u]);
                    c[tile]++;
                    if (isAgari14(c)) eligible.push(u);
                }

                if (eligible.length === 0) {
                    state.turn = seatAfter(s);
                    const draw = drawFromWall(state);
                    if (draw == null) {
                        state.phase = 'finished';
                        state.last = { type: 'ryuukyoku' };
                        return;
                    }

                    state.hands[state.turn].push(draw);
                    state.last = { type: 'draw', seat: state.turn };
                } else {
                    state.phase = 'claim';
                    state.claim = { from: s, eligible, noRon: new Set() };
                    state.last = { type: 'discard', seat: s, tile };
                }
                return;
            }
        }

        if (state.phase === 'claim') {
            const seat = seatOf(action._by);

            if (action.type === 'ron') {
                if (!state.claim || !state.claim.eligible.includes(seat)) return;
                const tile = state.lastDiscard.tile;
                const c = countsFromHand(state.hands[seat]);
                c[tile]++;
                if (!isAgari14(c)) return;

                const { han } = hanForHand({
                    counts14: c,
                    closed: true,
                    riichi: state.riichi[seat],
                    tsumo: false,
                    doraActual: nextOf(state.doraIndicator),
                });

                const base = baseFromHan(han);

                // Ron payout: discarder pays base winner takes pot
                state.points[state.claim.from] -= base;
                state.points[seat] += base + state.riichiSticks * 1000;
                state.riichiSticks = 0;
                state.last = { type: 'ron', winner: seat, from: state.claim.from, han, base };
                state.phase = 'finished';
                return;
            }

            if (action.type === 'no_ron') {
                if (!state.claim) return;
                if (seat === state.claim.from) return;

                state.claim.noRon.add(seat);

                let allPass = true;
                for (let u = 0; u < MAX_SEATS; u++) {
                    if (u === state.claim.from) continue;
                    if (state.claim.eligible.includes(u)) {
                        if (!state.claim.noRon.has(u)) {
                            allPass = false;
                            break;
                        }
                    }
                }

                if (allPass) {
                    const next = seatAfter(state.claim.from);
                    state.turn = next;
                    state.phase = 'playing';
                    state.claim = null;

                    const draw = drawFromWall(state);
                    if (draw == null) {
                        state.phase = 'finished';
                        state.last = { type: 'ryuukyoku' };
                        return;
                    }

                    state.hands[next].push(draw);
                    state.last = { type: 'draw', seat: next };
                }
                return;
            }
        }

        if (state.phase === 'finished') {
            if (action.type === 'next_hand') {
                let dealerWins = false;
                if (state.last && (state.last.type === 'tsumo' || state.last.type === 'ron')) {
                    dealerWins =
                        (state.last.type === 'tsumo' && state.last.seat === state.dealer) ||
                        (state.last.type === 'ron' && state.last.winner === state.dealer);
                }

                if (!dealerWins) state.dealer = seatAfter(state.dealer);

                setupHand(state);
                state.round += 1;
                state.last = { type: 'next_hand', round: state.round };
            }
        }
    },

    isTerminal() {
        return false;
    },
};

module.exports = { riichi };
