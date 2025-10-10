module.exports = function registerSocketEvents(io, deps) {
  const { games, rooms, h, rateOK = null } = deps;
  const {
    getRoom, ensureRoom, ensureHost, maybeDelete, getCurrentGame,
    broadcastLobby, broadcastState,
  } = rooms;

  const { ok, err, cleanName, isRoomId } = h;
  const GRACE_MS = deps?.graceMs ?? 15_000;
  const pendingDisconnects = new Map();
  const presence = new Map();
  
  const getUserSet = (roomId, uid, create = false) => {
    let roomMap = presence.get(roomId);
    if (!roomMap && create) { roomMap = new Map(); presence.set(roomId, roomMap); }
    if (!roomMap) return null;
    let set = roomMap.get(uid);
    if (!set && create) { set = new Set(); roomMap.set(uid, set); }
    return set || null;
  };
  const addPresence = (roomId, uid, socketId) => {
    const set = getUserSet(roomId, uid, true);
    set.add(socketId);
  };
  const removePresence = (roomId, uid, socketId) => {
    const set = getUserSet(roomId, uid, false);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) {
      const roomMap = presence.get(roomId);
      roomMap.delete(uid);
      if (roomMap.size === 0) presence.delete(roomId);
    }
  };
  const hasPresence = (roomId, uid) => {
    const set = getUserSet(roomId, uid, false);
    return !!(set && set.size > 0);
  };

  io.on('connection', (socket) => {
    const { userId } = socket.handshake.auth || {};
    socket.data.name = `User-${String(userId).slice(0, 4)}`;
    socket.data.roomId = null;

    const guard = (ack) => {
      if (!rateOK) return true;
      if (rateOK(socket)) return true;
      err(ack, 'RATE_LIMIT');
      return false;
    };

    const finalizeLeave = (roomId, uid) => {
      if (hasPresence(roomId, uid)) return;

      const room = getRoom(roomId); if (!room) return;
      if (!room.players.some(p => p.id === uid)) return;

      room.players = room.players.filter(p => p.id !== uid);
      ensureHost(room);

      const game = getCurrentGame(room);
      if (game) game.assignSeats(room);

      if (room.players.length === 0) return maybeDelete(room);

      broadcastLobby(room);
      if (game) broadcastState(room);
    };

    const startGrace = (room, uid) => {
      // If the user is still present via another socket, skip grace entirely.
      if (hasPresence(room.id, uid)) return;

      // Avoid double timers
      if (pendingDisconnects.has(uid)) clearTimeout(pendingDisconnects.get(uid).timeout);

      const me = room.players.find(p => p.id === uid);
      if (me) me.disconnected = true;
      broadcastLobby(room);

      const timeout = setTimeout(() => {
        pendingDisconnects.delete(uid);
        finalizeLeave(room.id, uid);
      }, GRACE_MS);

      pendingDisconnects.set(uid, { roomId: room.id, timeout, at: Date.now() });
    };

    const cancelGrace = (uid) => {
      const pd = pendingDisconnects.get(uid);
      if (!pd) return;
      clearTimeout(pd.timeout);
      pendingDisconnects.delete(uid);

      const room = getRoom(pd.roomId);
      if (!room) return;
      const me = room.players.find(p => p.id === uid);
      if (me && me.disconnected) {
        delete me.disconnected;
        broadcastLobby(room);
      }
    };
socket.on('rooms:list', (ack) => {
  try {
    const list = rooms.listRooms().map((r) => {
      const players = Array.isArray(r.players) ? r.players : [];
      const host = players.find(p => p.id === r.hostId) || null;

      return {
        id: r.id,
        name: r.name || r.id,                  
        hostName: host?.name || null,
        playerCount: players.length,
        maxPlayers: r.game?.maxPlayers ?? r.maxPlayers ?? null,
        phase: r.phase || 'lobby',
      };
    });
    if (typeof ack === 'function') ack({ ok: true, rooms: list });
  } catch (e) {
    console.error('rooms:list failed:', e);
    if (typeof ack === 'function') ack({ ok: false, code: 'LIST_FAILED' });
  }
});

    socket.on('join', (payload, ack) => {
      if (!guard(ack)) return;

      socket.join(userId);
      const roomId = payload?.roomId;
      if (!isRoomId(roomId)) return err(ack, 'BAD_INPUT', { field: 'roomId' });

      const name = cleanName(payload?.name, socket.data.name);
      socket.data.name = name;

      const pd = pendingDisconnects.get(userId);
      if (pd && pd.roomId !== roomId) {
        clearTimeout(pd.timeout);
        pendingDisconnects.delete(userId);
        finalizeLeave(pd.roomId, userId);
      }

      if (socket.data.roomId && socket.data.roomId !== roomId) {
        removePresence(socket.data.roomId, userId, socket.id);
        socket.leave(socket.data.roomId);
      }

      const room = ensureRoom(roomId);
      let me = room.players.find(p => p.id === userId);
      if (!me) room.players.push(me = { id: userId, name, seat: null });
      else me.name = name;

      cancelGrace(userId);

      ensureHost(room);

      const game = getCurrentGame(room);
      if (game && me.seat == null) game.assignSeats(room);

      socket.join(roomId);
      socket.data.roomId = roomId;

      // Track presence for this tab
      addPresence(roomId, userId, socket.id);

      ok(ack);
      socket.emit('you', { id: userId, host: userId === room.hostId });

      broadcastLobby(room);
      if (game) { broadcastState(room); }
      else { socket.emit('phase', { roomId: room.id, hostId: room.hostId, phase: room.phase, gameId: null }); }
    });

    socket.on('set_name', ({ name } = {}, ack) => {
      if (!guard(ack)) return;

      const roomId = socket.data.roomId; if (!roomId) return err(ack, 'NO_ROOM');
      const room = getRoom(roomId); if (!room) return err(ack, 'NO_ROOM');

      const clean = cleanName(name, null);
      if (!clean) return err(ack, 'BAD_INPUT', { field: 'name' });

      socket.data.name = clean;
      const me = room.players.find(p => p.id === userId);
      if (me) me.name = clean;

      broadcastLobby(room);
      if (room.game) broadcastState(room);
      ok(ack);
    });

    socket.on('host_choose_game', ({ gameId } = {}, ack) => {
      if (!guard(ack)) return;

      const room = socket.data.roomId && getRoom(socket.data.roomId);
      if (!room) return err(ack, 'NO_ROOM');
      if (userId !== room.hostId) return err(ack, 'NOT_HOST');

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
      if (userId !== room.hostId) return err(ack, 'NOT_HOST');

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

      const a = { ...action, _by: userId };
      const can = game.canAct ? !!game.canAct(room, userId, a) : true;
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

      const me = room.players.find(p => p.id === userId);
      if (!me || me.seat == null) return err(ack, 'NOT_A_PLAYER');

      game.assignSeats(room);
      room.game.state = game.initState();
      broadcastState(room);
      ok(ack);
    });

    socket.on('leave_room', () => {
      const roomId = socket.data.roomId;
      if (roomId) {
        // this tab leaves the room
        removePresence(roomId, userId, socket.id);
        socket.leave(roomId);
        socket.data.roomId = null;

        // Explicit leave = immediate removal (regardless of other tabs)
        cancelGrace(userId);
        finalizeLeave(roomId, userId);
      }
      socket.emit('left');
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      const room = getRoom(roomId); if (!room) return;

      removePresence(roomId, userId, socket.id);
      socket.leave(roomId);
      socket.data.roomId = null;

      if (!hasPresence(roomId, userId)) {
        startGrace(room, userId);
      }
    });
  });
};
