const ROWS = 6, COLS = 7;
const makeBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));
const inBounds = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;
const nextOpenRow = (board, col) => { for (let r = ROWS - 1; r >= 0; r--) if (board[r][col] == null) return r; return -1; };
function checkWinner(board) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const cell = board[r][c]; if (!cell) continue;
        for (const [dr, dc] of dirs) {
            let k = 1; while (k < 4) {
                const nr = r + dr * k, nc = c + dc * k;
                if (!inBounds(nr, nc) || board[nr][nc] !== cell) break; k++;
            }
            if (k >= 4) return cell;
        }
    }
    const full = board[0].every(x => x != null);
    return full ? 'draw' : null;
}

const connect4 = {
    id: 'connect4',
    minPlayers: 2,
    maxPlayers: 2,

    seatLabel: (seat) => (seat === 0 ? 'R' : seat === 1 ? 'Y' : null),

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
                id: p.id,
                name: p.name,
                color: this.seatLabel(p.seat)
            }))
        };
    },

    canAct(room, socket, action) {
        if (room.phase !== `playing:${this.id}`) return false;
        const p = room.players.find(p => p.id === socket.id);
        if (!p || p.seat == null) return false;
        const st = room.game.state;
        if (st.winner) return false;
        return p.seat === st.currentSeat && action.type === 'drop' && typeof action.col === 'number';
    },

    reduce(room, action) {
        const st = room.game.state;
        const col = action.col;
        const r = nextOpenRow(st.board, col);
        if (r < 0) return;

        const color = this.seatLabel(st.currentSeat);
        st.board[r][col] = color;
        st.history.push({ r, c: col, color });

        const w = checkWinner(st.board);
        st.winner = w;
        if (!st.winner) st.currentSeat = st.currentSeat === 0 ? 1 : 0;
    },

    isTerminal(room) {
        return !!room.game.state.winner;
    },
};

module.exports = { connect4 };
