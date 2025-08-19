const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const games = new Map();

const { connect4 } = require('./games/connect4');
const { tictactoe } = require('./games/tictactoe');

games.set(connect4.id, connect4);
games.set(tictactoe.id, tictactoe);

const rooms = new Map();

function getRoom(id) {
    return rooms.get(id);
}

function createRoom(id) {
    const room = {
        id,
        hostId: null,
        players: [],
        phase: 'lobby',
        game: null,
    };
    rooms.set(id, room);
    return room;
}

function ensureHost(room) {
    room.hostId = room.players[0]?.id || null;
}

function currentGame(room) {
    return room?.game ? games.get(room.game.id) : null;
}

function serializeLobby(room) {
    const game = currentGame(room);
    return {
        roomId: room.id,
        hostId: room.hostId,
        phase: room.phase,
        gameId: room.game?.id || null,
        players: room.players.map(p => ({
            id: p.id,
            name: p.name,
            // If a game is active show the adapter label
            label: game ? game.seatLabel(p.seat) : null,
        })),
    };
}

function broadcastLobby(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    io.to(roomId).emit('lobby', serializeLobby(room));
}

function broadcastState(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    const game = currentGame(room);
    if (!game) return;
    io.to(roomId).emit('state', game.serialize(room));
}

io.on('connection', (socket) => {
    socket.data.name = `User-${String(socket.id).slice(0, 4)}`;


    socket.on('join', ({ roomId, name }, ack) => {
        if (!roomId) return ack?.({ ok: false, code: 'NO_ROOM_ID' });

        const room = getRoom(roomId) || createRoom(roomId);

        let p = room.players.find(p => p.id === socket.id);
        if (!p) {
            p = { id: socket.id, name: name?.trim() || socket.data.name, seat: null };
            room.players.push(p);
        } else {
            p.name = name?.trim() || p.name;
        }

        ensureHost(room);

        const game = currentGame(room);
        if (game) game.assignSeats(room);

        socket.data.roomId = roomId;
        socket.join(roomId);

        ack?.({ ok: true });
        socket.emit('you', { id: socket.id, host: socket.id === room.hostId });

        broadcastLobby(roomId);
        if (game) broadcastState(roomId);
    });

    socket.on('set_name', ({ name }) => {
        const roomId = socket.data.roomId;
        if (!roomId) return;
        const room = getRoom(roomId);
        if (!room) return;

        const n = (name || '').trim();
        if (!n) return;

        socket.data.name = n;
        const p = room.players.find(p => p.id === socket.id);
        if (p) p.name = n;

        broadcastLobby(roomId);
        if (room.game) broadcastState(roomId);
    });

    socket.on('host_choose_game', ({ gameId }, ack) => {
        const room = getRoom(socket.data.roomId);
        if (!room) return ack?.({ ok: false, code: 'NO_ROOM' });
        if (socket.id !== room.hostId) return ack?.({ ok: false, code: 'NOT_HOST' });

        const game = games.get(gameId);
        if (!game) return ack?.({ ok: false, code: 'UNKNOWN_GAME' });

        if (room.players.length < game.minPlayers) {
            return ack?.({ ok: false, code: 'NEED_PLAYERS', need: game.minPlayers });
        }

        game.assignSeats(room);
        room.phase = `playing:${gameId}`;
        room.game = { id: gameId, state: game.initState() };

        io.to(room.id).emit('phase', {
            roomId: room.id,
            hostId: room.hostId,
            phase: room.phase,
            gameId: room.game.id,
        });

        broadcastState(room.id);
        ack?.({ ok: true });
    });
    socket.on('host_end_game', (ack) => {
        const room = getRoom(socket.data.roomId);
        if (!room) return ack?.({ ok: false, code: 'NO_ROOM' });
        if (socket.id !== room.hostId) return ack?.({ ok: false, code: 'NOT_HOST' });



        room.phase = `lobby`;

        io.to(room.id).emit('phase', {
            roomId: room.id,
            hostId: room.hostId,
            phase: room.phase,
            gameId: room.game.id,
        });

        broadcastState(room.id);
        ack?.({ ok: true });
    });

    socket.on('action', (action) => {
        const room = getRoom(socket.data.roomId);
        if (!room || !room.game) return;
        const game = currentGame(room);
        if (!game) return;

        if (!game.canAct(room, socket, action)) return;

        game.reduce(room, action);
        broadcastState(room.id);
    });

    socket.on('drop', ({ col }) => {
        const room = getRoom(socket.data.roomId);
        if (!room || !room.game) return;
        if (room.game.id !== 'connect4') return;
        const game = currentGame(room);
        const ok = game.canAct(room, socket, { type: 'drop', col });
        if (!ok) return;
        game.reduce(room, { type: 'drop', col });
        broadcastState(room.id);
    });

    socket.on('reset', () => {
        const room = getRoom(socket.data.roomId);
        if (!room || !room.game) return;
        const game = currentGame(room);
        if (!game) return;
        const p = room.players.find(p => p.id === socket.id);
        if (p.seat == null) {
            return;
        }
        game.assignSeats(room);
        room.game.state = game.initState();

        broadcastState(room.id);
    });

    function removeFromRoom() {
        const roomId = socket.data.roomId;
        if (!roomId) return;
        const room = getRoom(roomId);
        if (!room) return;

        room.players = room.players.filter(p => p.id !== socket.id);

        ensureHost(room);
        const game = currentGame(room);
        if (game) game.assignSeats(room);

        if (room.players.length === 0) {
            rooms.delete(roomId);
        } else {
            broadcastLobby(roomId);
            if (game) broadcastState(roomId);
        }
    }

    socket.on('leave_room', () => {
        const roomId = socket.data.roomId;
        socket.leave(roomId);
        socket.data.roomId = null;
        removeFromRoom();
        socket.emit('left');
    });

    socket.on('disconnect', () => {
        removeFromRoom();
    });
});

app.get('/', (_req, res) => res.send('Lobby server running'));
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
