module.exports = function registerSocketEvents(io, deps) {
    const {
        games,
        rooms,
        h,
        rateOK = null,
    } = deps;

    const {
        getRoom, ensureRoom, ensureHost, maybeDelete, getCurrentGame,
        broadcastLobby, broadcastState,
    } = rooms;

    const { ok, err, cleanName, isRoomId } = h;

    io.on('connection', (socket) => {
        socket.data.name = `User-${String(socket.id).slice(0, 4)}`;
        socket.data.roomId = null;

        const guard = (ack) => {
            if (!rateOK) return true;
            if (rateOK(socket)) return true;
            err(ack, 'RATE_LIMIT');
            return false;
        };

        socket.on('join', (payload, ack) => {
            if (!guard(ack)) return;

            const roomId = payload?.roomId;
            if (!isRoomId(roomId)) return err(ack, 'BAD_INPUT', { field: 'roomId' });

            const name = cleanName(payload?.name, socket.data.name);
            socket.data.name = name;

            const room = ensureRoom(roomId);
            let me = room.players.find(p => p.id === socket.id);
            if (!me) room.players.push(me = { id: socket.id, name, seat: null });
            else me.name = name;

            ensureHost(room);

            const game = getCurrentGame(room);
            if (game) game.assignSeats(room);

            socket.join(roomId);
            socket.data.roomId = roomId;

            ok(ack);
            socket.emit('you', { id: socket.id, host: socket.id === room.hostId });

            broadcastLobby(room);
            if (game) {broadcastState(room);}
            else {socket.emit('phase', { roomId: room.id, hostId: room.hostId, phase: room.phase, gameId: null});}
        });

        socket.on('set_name', ({ name } = {}, ack) => {
            if (!guard(ack)) return;

            const roomId = socket.data.roomId; if (!roomId) return err(ack, 'NO_ROOM');
            const room = getRoom(roomId); if (!room) return err(ack, 'NO_ROOM');

            const clean = cleanName(name, null);
            if (!clean) return err(ack, 'BAD_INPUT', { field: 'name' });

            socket.data.name = clean;
            const me = room.players.find(p => p.id === socket.id);
            if (me) me.name = clean;

            broadcastLobby(room);
            if (room.game) broadcastState(room);
            ok(ack);
        });

        socket.on('host_choose_game', ({ gameId } = {}, ack) => {
            if (!guard(ack)) return;

            const room = socket.data.roomId && getRoom(socket.data.roomId);
            if (!room) return err(ack, 'NO_ROOM');
            if (socket.id !== room.hostId) return err(ack, 'NOT_HOST');

            const game = games.get(gameId);
            if (!game) return err(ack, 'UNKNOWN_GAME');

            if (room.players.length < game.minPlayers) {
                return err(ack, 'NEED_PLAYERS', { need: game.minPlayers });
            }

            game.assignSeats(room);
            room.phase = `playing:${gameId}`;
            room.game = { id: gameId, state: game.initState() };

            io.to(room.id).emit('phase', { roomId: room.id, hostId: room.hostId, phase: room.phase, gameId: room.game.id });
            broadcastState(room);
            ok(ack);
        });

        socket.on('host_end_game', (ack) => {
            if (!guard(ack)) return;

            const room = socket.data.roomId && getRoom(socket.data.roomId);
            if (!room) return err(ack, 'NO_ROOM');
            if (socket.id !== room.hostId) return err(ack, 'NOT_HOST');

            room.phase = 'lobby';
            room.game = null;
            room.players.forEach(p => { p.seat = null; });

            io.to(room.id).emit('phase', { roomId: room.id, hostId: room.hostId, phase: room.phase, gameId: null });
            broadcastLobby(room);
            ok(ack);
        });

        socket.on('action', (action, ack) => {
            if (!guard(ack)) return;

            const room = socket.data.roomId && getRoom(socket.data.roomId);
            if (!room || !room.game) return err(ack, 'NO_GAME');

            const game = getCurrentGame(room);
            if (!game) return err(ack, 'UNKNOWN_GAME');

            const a = { ...action, _by: socket.id };
            const can = game.canAct ? !!game.canAct(room, socket, a) : true;
            if (!can) return err(ack, 'CANNOT_ACT');

            try {
                const res = game.reduce(room, a);
                broadcastState(room);
                ok(ack, { res });
            } catch (e) {
                console.error('reduce error', e);
                err(ack, 'REDUCE_ERROR');
            }
        });

        socket.on('reset', (ack) => {
            if (!guard(ack)) return;

            const room = socket.data.roomId && getRoom(socket.data.roomId);
            if (!room || !room.game) return err(ack, 'NO_GAME');

            const game = getCurrentGame(room);
            if (!game) return err(ack, 'UNKNOWN_GAME');

            const me = room.players.find(p => p.id === socket.id);
            if (!me || me.seat == null) return err(ack, 'NOT_A_PLAYER');

            game.assignSeats(room);
            room.game.state = game.initState();

            broadcastState(room);
            ok(ack);
        });

        socket.on('leave_room', () => {
            leaveRoomAndMaybeDelete();
            socket.emit('left');
        });

        socket.on('disconnect', () => {
            leaveRoomAndMaybeDelete();
        });

        function leaveRoomAndMaybeDelete() {
            const roomId = socket.data.roomId; if (!roomId) return;
            const room = getRoom(roomId); if (!room) return;

            socket.leave(roomId);
            socket.data.roomId = null;

            room.players = room.players.filter(p => p.id !== socket.id);
            ensureHost(room);

            const game = getCurrentGame(room);
            if (game) game.assignSeats(room);

            if (room.players.length === 0) return maybeDelete(room);

            broadcastLobby(room);
            if (game) broadcastState(room);
        }
    });
};
