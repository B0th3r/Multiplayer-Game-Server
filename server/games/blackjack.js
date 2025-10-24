const MAX_SEATS = 4;
const MIN_BET = 10;
const NUM_DECKS = 4;
const REVEAL_MS = 3000;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUITS = ["♠", "♥", "♦", "♣"];

function newShoe(decks = NUM_DECKS) {
    const cards = [];
    for (let d = 0; d < decks; d++) {
        for (const r of RANKS) for (const s of SUITS) cards.push({ r, s });
    }
    return shuffle(cards);
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function draw(st) {
    if (st.shoe.length === 0) st.shoe = newShoe();
    return st.shoe.pop();
}

function handValue(hand) {
    let sum = 0, aces = 0;
    for (const c of hand) {
        if (!c || c.hidden) continue;
        if (c.r === "A") { sum += 11; aces++; }
        else if (["K", "Q", "J", "10"].includes(c.r)) sum += 10;
        else sum += parseInt(c.r, 10);
    }
    while (sum > 21 && aces > 0) { sum -= 10; aces--; }
    return sum;
}

function isBlackjack(hand) {
    return hand.filter(c => !c.hidden).length === 2 && handValue(hand) === 21;
}

function makeSeats() {
    return Array.from({ length: MAX_SEATS }, () => ({
        chips: 1000,
        bet: 0,
        hand: [],
        stood: false,
        bust: false,
        done: false,
        doubled: false,
    }));
}

function occupiedSeatIndices(room) {
    return room.players
        .filter(p => p.seat != null)
        .map(p => p.seat)
        .sort((a, b) => a - b);
}

function firstActingSeat(st, room) {
    const occ = occupiedSeatIndices(room);
    for (const i of occ) {
        const s = st.seats[i];
        if (!s) continue;
        if (s.bet > 0 && !s.done && !s.bust) return i;
    }
    return null;
}

function everyoneDone(st, room) {
    const occ = occupiedSeatIndices(room);
    for (const i of occ) {
        const s = st.seats[i];
        if (!s || s.bet === 0) continue;
        if (!s.done) return false;
    }
    return true;
}

function evaluateMatchWin(st, room) {
    if (!st.goal || !st.goal.enabled) return;

    const occ = occupiedSeatIndices(room);
    const eligible = occ.filter(i => st.seats[i]);
    if (eligible.length === 0) return;

    const reached = eligible.filter(i => st.seats[i].chips >= st.goal.targetChips);
    if (reached.length) {
        let best = reached[0];
        for (const i of reached) {
            if (st.seats[i].chips > st.seats[best].chips) best = i;
        }
        st.goal.winnerSeat = best;
        st.goal.reason = "TARGET_REACHED";
        return;
    }

    const alive = eligible.filter(i => st.seats[i].chips >= MIN_BET);
    if (alive.length === 1) {
        st.goal.winnerSeat = alive[0];
        st.goal.reason = "LAST_STANDING";
        return;
    }

    // if nobody can afford MIN_BET highest chips wins
    if (alive.length === 0) {
        let best = eligible[0];
        for (const i of eligible) {
            if (st.seats[i].chips > st.seats[best].chips) best = i;
        }
        st.goal.winnerSeat = best;
        st.goal.reason = "HIGHEST_CHIPS";
        return;
    }
}

function settle(st, room) {
    st.dealer.hand.forEach(c => (c.hidden = false));
    while (true) {
        const v = handValue(st.dealer.hand);
        if (v > 21) { st.dealer.bust = true; break; }
        const hasAce = st.dealer.hand.some(c => c.r === "A");
        const soft17 = v === 17 && hasAce;
        if (v < 17 || soft17) st.dealer.hand.push(draw(st));
        else break;
    }

    const dealerVal = handValue(st.dealer.hand);
    const dealerBJ = isBlackjack(st.dealer.hand);

    const occ = occupiedSeatIndices(room);
    for (const i of occ) {
        const s = st.seats[i];
        if (!s || s.bet === 0) continue;

        const pVal = handValue(s.hand);
        const pBJ = isBlackjack(s.hand);
        let payout = 0;

        if (s.bust) {
            payout = 0;
        } else if (pBJ && !dealerBJ) {
            payout = Math.floor(s.bet * 2.5);
        } else if (dealerBJ && !pBJ) {
            payout = 0;
        } else if (dealerVal > 21) {
            payout = s.bet * 2;
        } else if (pVal > dealerVal) {
            payout = s.bet * 2;
        } else if (pVal < dealerVal) {
            payout = 0;
        } else {
            payout = s.bet;
        }

        s.chips += payout;
        st.discard.push(...s.hand);
        s.bet = 0;
        s.stood = false;
        s.bust = false;
        s.done = false;
        s.doubled = false;
    }

    st.discard.push(...st.dealer.hand);

    st.phase = "reveal";
    st.revealEndsAt = Date.now() + REVEAL_MS;
    st.currentSeat = null;
    st.last = { type: "settle" };
    if (st.goal && st.goal.enabled) {
        evaluateMatchWin(st, room);
    }
}

function dealInitial(st, room) {
    st.dealer.hand = [];
    const occ = occupiedSeatIndices(room);
    for (let d = 0; d < 2; d++) {
        for (const i of occ) {
            const s = st.seats[i];
            if (!s || s.bet === 0) continue;
            s.hand.push(draw(st));
        }
        st.dealer.hand.push(d === 1 ? { ...draw(st), hidden: true } : draw(st));
    }
    st.phase = "acting";
    st.currentSeat = firstActingSeat(st, room);
}

const blackjack = {
    id: "blackjack",
    minPlayers: 1,
    maxPlayers: MAX_SEATS,

    seatLabel(seat) {
        return seat == null ? "G" : `P${seat + 1}`;
    },

    assignSeats(room) {
        room.players.forEach((p, i) => { p.seat = i < MAX_SEATS ? i : null; });
    },

    initState() {
        return {
            phase: "betting",
            shoe: newShoe(),
            discard: [],
            dealer: { hand: [], bust: false },
            seats: makeSeats(),
            currentSeat: null,
            round: 1,
            last: null,
            revealEndsAt: null,
            goal: {
                enabled: true,         // turn off to play endless regular blackjack
                targetChips: 5000,
                winnerSeat: null,
                reason: null
            },
        };
    },

    serialize(room) {
        const st = room.game.state;
        const players = room.players.map(p => ({ id: p.id, name: p.name, seat: this.seatLabel(p.seat) }));

        const seats = st.seats.map((s, i) => {
            if (!s) return null;
            return {
                label: this.seatLabel(i),
                chips: s.chips,
                bet: s.bet,
                hand: s.hand.map(c => (c.hidden ? { hidden: true } : c)),
                value: handValue(s.hand),
                bust: s.bust,
                stood: s.stood,
                done: s.done,
                doubled: s.doubled,
                eliminated: st.phase === "betting"
                    ? (s.bet === 0 && s.chips < MIN_BET)   // only if they can't post a bet now
                    : false,

            };
        });
        const goal = st.goal ? {
            enabled: !!st.goal.enabled,
            targetChips: st.goal.targetChips,
            winner: st.goal.winnerSeat != null ? this.seatLabel(st.goal.winnerSeat) : null,
            reason: st.goal.reason || null,
        } : null;
        const dealer = {
            hand: st.dealer.hand.map((c, idx) =>
                (st.phase === "acting" && idx === 1)
                    ? { hidden: true }
                    : { ...c, hidden: !!c.hidden && !["settle", "reveal"].includes(st.phase) }
            ),
            value: ["settle", "reveal"].includes(st.phase) ? handValue(st.dealer.hand) : null,
            bust: st.dealer.bust || false,
        };

        return {
            phase: st.phase,
            current: this.seatLabel(st.currentSeat),
            players,
            seats,
            dealer,
            last: st.last,
            round: st.round,
            revealEndsAt: st.phase === "reveal" ? st.revealEndsAt : null,
            goal,
        };
    },

    canAct(room, userId, action) {
        if (room.phase !== `playing:${this.id}`) return false;
        const p = room.players.find(p => p.id === userId);
        if (!p) return false;
        const st = room.game.state;

        if (st.phase === "betting") {
            if (p.seat == null) return false;
            if (action.type === "bet" && typeof action.amount === "number") return true;
            if (action.type === "deal") {
                const someBet = occupiedSeatIndices(room).some(i => st.seats[i]?.bet > 0);
                return someBet;
            }
            return false;
        }

        if (st.phase === "acting") {
            if (p.seat !== st.currentSeat) return false;
            const seat = st.seats[p.seat];
            if (!seat || seat.done) return false;
            if (action.type === "hit" || action.type === "stand") return true;
            if (action.type === "double") {
                return seat.hand.length === 2 && seat.chips >= seat.bet;
            }
            return false;
        }

        if (st.phase === "reveal") {
            if (action.type !== "next_round") return false;
            return Date.now() >= (st.revealEndsAt || 0);
        }

        if (st.phase === "match_over") {
            return action.type === "reset_match";
        }

        return false;
    },

    reduce(room, action) {
        const st = room.game.state;

        if (st.phase === "betting") {
            if (action.type === "bet") {
                const seatIdx = room.players.find(p => p.id === action._by)?.seat;
                if (seatIdx == null) return;
                const s = st.seats[seatIdx];
                const amt = Math.floor(Math.max(0, action.amount | 0));
                if (amt === 0) {
                    s.bet = 0;
                    st.last = { type: "sit_out", seat: seatIdx };
                    return;
                }
                if (amt < MIN_BET || amt > s.chips) return;
                s.chips -= amt; s.bet = amt; s.hand = []; s.bust = s.stood = s.done = s.doubled = false;
                st.last = { type: "bet", seat: seatIdx, amount: amt };
                return;
            }

            if (action.type === "deal") {
                dealInitial(st, room);
                st.last = { type: "deal" };
                return;
            }
        }

        if (st.phase === "acting") {
            const seatIdx = room.players.find(p => p.id === action._by)?.seat;
            if (seatIdx == null || seatIdx !== st.currentSeat) return;
            const s = st.seats[seatIdx];

            if (action.type === "hit") {
                s.hand.push(draw(st));
                if (handValue(s.hand) > 21) { s.bust = true; s.done = true; }
                st.last = { type: "hit", seat: seatIdx };
            }

            if (action.type === "stand") {
                s.stood = true; s.done = true;
                st.last = { type: "stand", seat: seatIdx };
            }

            if (action.type === "double") {
                if (s.hand.length === 2 && s.chips >= s.bet) {
                    s.chips -= s.bet; s.bet *= 2; s.doubled = true;
                    s.hand.push(draw(st));
                    if (handValue(s.hand) > 21) s.bust = true;
                    s.done = true;
                    st.last = { type: "double", seat: seatIdx };
                }
            }

            const occ = occupiedSeatIndices(room);
            let next = null;
            for (const i of occ) {
                if (i <= seatIdx) continue;
                const si = st.seats[i];
                if (si && si.bet > 0 && !si.done) { next = i; break; }
            }

            if (next != null) st.currentSeat = next;
            else if (!everyoneDone(st, room)) {
                st.currentSeat = firstActingSeat(st, room);
            } else {
                settle(st, room);
            }
            return;
        }

        if (st.phase === "reveal" && action.type === "next_round") {
            if (Date.now() < (st.revealEndsAt || 0)) return; // still revealing
            if (st.goal?.enabled && st.goal.winnerSeat != null) {
                st.phase = "match_over";
                st.currentSeat = null;
                st.revealEndsAt = null;
                st.last = { type: "match_over", seat: st.goal.winnerSeat, reason: st.goal.reason };
                return;
            }
            for (const s of st.seats) {
                if (!s) continue;
                s.hand = [];
                s.stood = false;
                s.bust = false;
                s.done = false;
                s.doubled = false;
            }
            st.dealer = { hand: [], bust: false };
            st.revealEndsAt = null;

            st.phase = "betting";
            st.currentSeat = null;
            st.round += 1;
            st.last = { type: "next_round", round: st.round };
            return;
        }
        if (st.phase === "match_over" && action.type === "reset_match") {
            for (let i = 0; i < st.seats.length; i++) {
                const s = st.seats[i];
                if (!s) continue;
                st.seats[i] = { chips: 1000, bet: 0, hand: [], stood: false, bust: false, done: false, doubled: false };
            }
            st.shoe = newShoe();
            st.discard = [];
            st.dealer = { hand: [], bust: false };
            st.currentSeat = null;
            st.round = 1;
            st.revealEndsAt = null;
            st.goal.winnerSeat = null;
            st.goal.reason = null;
            st.phase = "betting";
            st.last = { type: "reset_match" };
            return;
        }

    },

    isTerminal(room) {
        return room.game.state.phase === "match_over";
    },
};

module.exports = { blackjack };
