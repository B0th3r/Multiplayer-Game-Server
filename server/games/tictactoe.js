const SIZE = 3;
const makeBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

function checkWinner(board) {
    for (let i = 0; i < SIZE; i++) {
        if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) return board[i][0];
        if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) return board[0][i];
    }
    if (board[1][1]) {
        if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) return board[1][1];
        if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) return board[1][1];
    }
    const full = board.every(row => row.every(cell => cell != null));
    return full ? 'draw' : null;
}

const tictactoe = {
    id: 'tictactoe',
    minPlayers: 2,
    maxPlayers: 2,

    seatLabel(seat) { return seat === 0 ? 'X' : seat === 1 ? 'O' : null; },

    assignSeats(room) {
        room.players.forEach((p, i) => { p.seat = i < 2 ? i : null; });
    },

    initState() {
        return { board: makeBoard(), currentSeat: 0, winner: null, history: [] };
    },

    serialize(room) {
        const st = room.game.state;
        return {
            board: st.board,
            current: this.seatLabel(st.currentSeat),
            winner: st.winner,
            players: room.players.map(p => ({
                id: p.id, name: p.name, symbol: this.seatLabel(p.seat)
            })),
        };
    },

    canAct(room, userId, action) {
        if (room.phase !== `playing:${this.id}`) return false;
        if (!action || action.type !== 'place') return false;

        const me = room.players.find(p => p.id === userId);
        if (!me || me.seat == null) return false;                 // spectators can't play

        const st = room.game.state;
        if (st.winner) return false;
        if (me.seat !== st.currentSeat) return false;

        const { r, c } = action;
        if (!(Number.isInteger(r) && Number.isInteger(c))) return false;
        if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return false;
        if (st.board[r][c] != null) return false;

        return true;
    },

    reduce(room, action) {
        const st = room.game.state;
        const symbol = this.seatLabel(st.currentSeat);
        const { r, c } = action;

        st.board[r][c] = symbol;
        st.history.push({ r, c, symbol });

        const w = checkWinner(st.board);
        st.winner = w;
        if (!st.winner) st.currentSeat = st.currentSeat ^ 1;
    },

    isTerminal(room) { return !!room.game.state.winner; },
};

module.exports = { tictactoe };
