const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const registerSocketEvents = require('./events');

const { connect4 } = require('./games/connect4');
const { tictactoe } = require('./games/tictactoe');
const { battleship } = require('./games/battleship');

function createServer({ injectedGames } = {}) {
    const app = express();
    const server = http.createServer(app);
    const parseOrigins = (s) =>
  new Set((s || '').split(',').map(o => o.trim()).filter(Boolean));
const ALLOWED_ORIGINS = parseOrigins(process.env.CORS_ORIGINS);
const originOK = (origin) => !origin || ALLOWED_ORIGINS.has(origin);

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => originOK(origin) ? cb(null, true) : cb(new Error('CORS: origin not allowed')),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: !!process.env.CORS_CREDENTIALS,
    maxAge: 86400,
  },
});
io.use((socket, next) => {
  const origin = socket.handshake.headers.origin;
  if (!originOK(origin)) return next(new Error('Origin blocked'));
  next();
});
    const MAX_NAME = 32;
    const reply = (ack, p) => typeof ack === 'function' && ack(p);
    const ok = (ack, extra = {}) => reply(ack, { ok: true, ...extra });
    const err = (ack, code, extra = {}) => reply(ack, { ok: false, code, ...extra });
    const cleanName = (s, fb) => (typeof s === 'string' && s.trim() ? s.trim().slice(0, MAX_NAME) : fb);
    const isRoomId = s => typeof s === 'string' && /^[\w-]{1,40}$/.test(s);

    const roomsMap = new Map();
    const getRoom = (id) => roomsMap.get(id);
    const ensureRoom = (id) => {
        let r = roomsMap.get(id);
        if (!r) { r = { id, hostId: null, players: [], phase: 'lobby', game: null }; roomsMap.set(id, r); }
        return r;
    };
    const ensureHost = (room) => { room.hostId = room.players[0]?.id || null; };
    const maybeDelete = (room) => { if (room.players.length === 0) roomsMap.delete(room.id); };

    const games = injectedGames || new Map([
        ['connect4', connect4],
        ['tictactoe', tictactoe],
        ['battleship', battleship],
    ]);

    const getCurrentGame = (room) => room?.game ? games.get(room.game.id) : null;
    const seatLabelFor = (room, seat) => {
        const g = getCurrentGame(room);
        return g ? g.seatLabel(seat) : null;
    };
    const serializeLobby = (room) => ({
        roomId: room.id,
        hostId: room.hostId,
        phase: room.phase,
        gameId: room.game?.id || null,
        players: room.players.map(p => ({ id: p.id, name: p.name, label: seatLabelFor(room, p.seat) })),
    });
    const broadcastLobby = (room) => io.to(room.id).emit('lobby', serializeLobby(room));
    const broadcastState = (room) => {
        const g = getCurrentGame(room); if (!g) return;
        room.players.forEach(p => {
            const payload = g.serialize(room, p.id);
            io.to(p.id).emit('state', payload);
        });
    };

    const rateOK = ((max = 30, ms = 2000) => {
        io.use((socket, next) => { socket.data.rl = { c: 0, t: Date.now() }; next(); });
        return (socket) => {
            const now = Date.now(); const rl = socket.data.rl;
            if (now - rl.t > ms) { rl.t = now; rl.c = 0; }
            rl.c += 1; return rl.c <= max;
        };
    })();

    registerSocketEvents(io, {
        games,
        rooms: { getRoom, ensureRoom, ensureHost, maybeDelete, getCurrentGame, broadcastLobby, broadcastState },
        h: { ok, err, cleanName, isRoomId },
        rateOK,
    });

    return {
        app, io, server,
        start(port = process.env.PORT || 4000, host = "0.0.0.0") {
   return new Promise(res => server.listen(port, host, () => res(server)));
 },
        stop() {
            return new Promise(res => io.close(() => server.close(() => res())));
        },
    };
}

if (require.main === module) {
    const srv = createServer();
    const PORT = process.env.PORT || 4000;
    srv.start(PORT).then(() =>
   console.log(`Server listening on http://0.0.0.0:${PORT}`)
);
}

module.exports = { createServer };