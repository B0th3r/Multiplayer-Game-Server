import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";

function Cell({ className = "", children }) {
    return (
        <div
            className={
                "flex items-center justify-center rounded-md border text-xs font-medium " +
                className
            }
        >
            {children}
        </div>
    );
}

function LegendDot({ kind }) {
    const cls =
        kind === "ship"
            ? "bg-slate-700"
            : kind === "hit"
                ? "bg-red-500"
                : kind === "miss"
                    ? "bg-white border-slate-300"
                    : "bg-transparent";
    return <span className={`inline-block h-3 w-3 rounded-full border ${cls}`} />;
}

export default function Battleship() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, conn } = useSocket();

    const [st, setSt] = useState(null);


    const [selectedShip, setSelectedShip] = useState(0);
    const [dir, setDir] = useState("H"); // 'H' | 'V'
    const [hover, setHover] = useState(null);
    const [clientPlaced, setClientPlaced] = useState(new Map());

    const firstStateLogged = useRef(false);
    const joinedOnce = useRef(false);

    useEffect(() => {
        if (!socket) return;
        const onState = (payload) => {
            if (!firstStateLogged.current) {
                firstStateLogged.current = true;
            }
            setSt(payload);

            try {
                const m =
                    payload?.me ??
                    (typeof payload?.meSeat === "number"
                        ? payload?.players?.[payload.meSeat]
                        : null);
                if (m?.ships) {
                    setClientPlaced((prev) => {
                        const next = new Map(prev);
                        m.ships.forEach((s, i) => { if (s?.placed) next.delete(i); });
                        return next;
                    });
                }
            } catch { }
        };

        const onPhase = ({ phase, roomId: rid }) => {
            if (phase === "lobby") {
                alert("Host has ended the game");
                navigate(`/room/${encodeURIComponent(rid)}`, { replace: true });
            }
        };

        socket.on("state", onState);
        socket.on("phase", onPhase);

        if (!joinedOnce.current && conn === "connected" && roomId) {
            joinedOnce.current = true;

            socket.emit("join", { roomId }, (initial) => { });
        }

        return () => {
            socket.off("state", onState);
            socket.off("phase", onPhase);
        };
    }, [socket, conn, roomId, navigate]);

    const EndGame = () => {
        socket.emit("host_end_game", (resp) => {
            if (!resp?.ok) alert(resp?.code || "Could not end");
        });
    };
    const reset = () =>
        socket.emit("reset", (resp) => {
            if (!resp?.ok) alert(resp?.code || "Could not reset");
        });

    const size = st?.size ?? 10;
    const meSeat = st?.meSeat ?? null;
    const myTurn = st?.phase === "battle" && st?.currentSeat === meSeat;
    const iAmPlayer = meSeat === 0 || meSeat === 1;
    const isSpectator = !iAmPlayer;

    const shotsAgainstSeat = useMemo(() => {
        if (!isSpectator) return new Map();

        const mk = (arr) => {
            const mm = new Map();
            (arr || []).forEach(({ k, result }) => mm.set(k, result));
            return mm;
        };

        const p0Taken = mk(st?.spectator?.p1?.shots);
        const p1Taken = mk(st?.spectator?.p0?.shots);

        const m = new Map();
        m.set(0, p0Taken);
        m.set(1, p1Taken);
        return m;
    }, [isSpectator, st]);



    const me = useMemo(() => {
        if (!st) return null;
        if (st.me) return st.me;
        if (typeof st.meSeat === "number" && st.players?.[st.meSeat])
            return st.players[st.meSeat];
        return null;
    }, [st]);

    const myOcc = useMemo(() => {
        if (!me?.ships) return new Set();
        const s = new Set();
        me.ships.forEach((ship) => {
            (ship.cells || []).forEach(({ r, c }) => s.add(`${r}:${c}`));
        });
        return s;
    }, [me]);

    const myHits = useMemo(() => {
        if (!me?.ships) return new Set();
        const s = new Set();
        me.ships.forEach((ship) => {
            (ship.hits || []).forEach((k) => s.add(k));
        });
        return s;
    }, [me]);

    const myShots = useMemo(() => {
        const m = new Map();
        (me?.shots || []).forEach(({ k, result }) => m.set(k, result));
        return m;
    }, [me]);

    const oppShots = useMemo(() => {
        const m = new Map();
        (st?.opponent?.shots || []).forEach(({ k, result }) => m.set(k, result));
        return m;
    }, [st]);

    // optimistic overlay
    const myOccOptimistic = useMemo(() => {
        const s = new Set(myOcc);
        clientPlaced.forEach(({ cells }) => {
            for (const { r, c } of cells || []) s.add(`${r}:${c}`);
        });
        return s;
    }, [myOcc, clientPlaced]);

    const placeAt = (r, c) => {
        if (conn !== "connected" || st?.phase !== "setup" || !iAmPlayer) return;
        const ship = me?.ships?.[selectedShip];
        if (!ship) return;

        const cells = [];
        for (let i = 0; i < ship.len; i++) {
            const rr = dir === "H" ? r : r + i;
            const cc = dir === "H" ? c + i : c;
            cells.push({ r: rr, c: cc });
        }

        socket.emit(
            "action",
            { type: "place", shipIndex: selectedShip, r, c, dir },
            (resp) => {
                if (!resp?.ok) {
                    console.warn("Place rejected:", resp);
                    alert(resp?.code || "Could not place ship");
                    return;
                }
                setClientPlaced((prev) => {
                    const next = new Map(prev);
                    next.set(selectedShip, { cells });
                    return next;
                });
            }
        );
    };

    const renderSpectatorCell = (r, c, seat) => {
        const k = `${r}:${c}`;
        const shots = shotsAgainstSeat.get(seat) || new Map();
        const result = shots.get(k);
        const bg =
            result === "hit" ? "bg-red-500"
                : result === "miss" ? "bg-white"
                    : "bg-blue-200";
        const border =
            result === "hit" ? "border-red-600"
                : result === "miss" ? "border-slate-300"
                    : "border-blue-300";
        return (
            <div key={k} className={`aspect-square ${bg} ${border}`}>
                <Cell className="bg-transparent border-0">
                    {result === "hit" ? "✕" : result === "miss" ? "•" : ""}
                </Cell>
            </div>
        );
    };

    const fireAt = (r, c) => {
        if (conn !== "connected" || st?.phase !== "battle" || !iAmPlayer) return;
        if (!myTurn) return;
        socket.emit("action", { type: "fire", r, c }, (resp) => {
            if (!resp?.ok) {
                console.warn("Fire rejected:", resp);
                alert(resp?.code || "Could not fire");
            }
        });
    };

    const clearAll = () => {
        if (st?.phase !== "setup") return;
        socket.emit("action", { type: "clear" }, (resp) => {
            if (!resp?.ok) alert(resp?.code || "Could not clear");
        });
        setClientPlaced(new Map());
    };

    const readyUp = () => {
        if (st?.phase !== "setup") return;
        socket.emit("action", { type: "ready" }, (resp) => {
            if (!resp?.ok) alert(resp?.code || "Could not ready");
        });
    };

    const previewCells = useMemo(() => {
        if (!st || st.phase !== "setup" || hover == null) return [];
        const ship = me?.ships?.[selectedShip];
        if (!ship) return [];
        const cells = [];
        for (let i = 0; i < ship.len; i++) {
            const rr = dir === "H" ? hover.r : hover.r + i;
            const cc = dir === "H" ? hover.c + i : hover.c;
            cells.push({ r: rr, c: cc, k: `${rr}:${cc}` });
        }
        return cells;
    }, [st, hover, selectedShip, dir, me]);

    const previewValid = useMemo(() => {
        if (!st || st.phase !== "setup" || hover == null) return false;
        const gridSize = st.size || 10;
        for (const { r, c, k } of previewCells) {
            if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
            // replacing same ship
            const oldCells = new Set(
                (me?.ships?.[selectedShip]?.cells || []).map(({ r, c }) => `${r}:${c}`)
            );
            if (!oldCells.has(k) && myOcc.has(k)) return false;
        }
        return previewCells.length > 0;
    }, [st, hover, previewCells, myOcc, selectedShip, me]);

    const status = useMemo(() => {
        if (conn !== "connected") return "Connecting…";
        if (!st) return "Waiting for state…";
        if (!iAmPlayer) return "Spectating";
        if (st.phase === "setup") {
            const mineReady = !!me?.ready;
            const oppReady = !!st.opponent?.ready;
            if (mineReady && oppReady) return "Starting battle…";
            if (mineReady) return "Waiting for opponent to ready…";
            return "Place ships and Ready up";
        }
        if (st.phase === "battle") {
            if (myTurn) return "Your turn — pick a target";
            return "Opponent's turn";
        }
        if (st.phase === "over") {
            if (st.winner === meSeat) return "Victory!";
            if (st.winner != null) return "Defeat.";
            return "Game over";
        }
        return "…";
    }, [conn, st, myTurn, iAmPlayer, meSeat, me]);

    const renderMyBoardCell = (r, c) => {
        const k = `${r}:${c}`;
        const hasShip = myOccOptimistic.has(k);
        const gotHit = myHits.has(k);

        const inPreview = previewCells.some((pc) => pc.k === k);

        let base =
            "aspect-square transition active:scale-[0.98] border border-blue-300 rounded-md";
        let bg = "bg-blue-200";
        let ring = "";
        let text = "";

        if (hasShip) bg = "bg-slate-700";
        if (gotHit) (ring = "ring-2 ring-red-400"), (text = "✕");

        if (st?.phase === "setup" && inPreview) {
            if (previewValid) {
                bg = hasShip ? "bg-slate-700" : "bg-emerald-300/70";
                ring = "ring-2 ring-emerald-500";
            } else {
                bg = "bg-rose-300/70";
                ring = "ring-2 ring-rose-500";
            }
        }

        return (
            <button
                key={k}
                onMouseEnter={() => iAmPlayer && setHover({ r, c })}
                onMouseLeave={() => iAmPlayer && setHover(null)}
                onClick={() => {
                    if (st?.phase === "setup" && iAmPlayer) placeAt(r, c);
                }}
                disabled={conn !== "connected" || !iAmPlayer || st?.phase !== "setup"}
                className={`${base} ${bg} ${ring}`}
                aria-label={`Your board r${r + 1} c${c + 1}`}
            >
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {text}
                </div>
            </button>
        );
    };

    const renderTargetCell = (r, c) => {
        const k = `${r}:${c}`;
        const shot = myShots.get(k);
        const bg =
            shot === "hit"
                ? "bg-red-500"
                : shot === "miss"
                    ? "bg-white"
                    : "bg-blue-200";
        const border =
            shot === "hit"
                ? "border-red-600"
                : shot === "miss"
                    ? "border-slate-300"
                    : "border-blue-300";

        return (
            <button
                key={k}
                onClick={() => fireAt(r, c)}
                disabled={
                    conn !== "connected" || !iAmPlayer || st?.phase !== "battle" || !myTurn || !!shot
                }
                className={`aspect-square ${bg} ${border} transition active:scale-[0.98]`}
                aria-label={`Target r${r + 1} c${c + 1}`}
            >
                <Cell className="bg-transparent border-0">
                    {shot === "hit" ? "✕" : shot === "miss" ? "•" : ""}
                </Cell>
            </button>
        );
    };
    if (isSpectator && (st?.phase === "battle" || st?.phase === "over")) {
        return (
            <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
                <div className="w-full max-w-5xl space-y-4">
                    <header className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Battleship</h1>
                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                            <span>
                                {st?.phase === "battle"
                                    ? "Spectating — battle in progress"
                                    : st?.winner != null
                                        ? `Spectating — ${st.winner === 0 ? "P0" : "P1"} wins`
                                        : "Spectating — game over"}
                            </span>
                        </span>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Board: Player 0 with shots from P1 */}
                        <div className="rounded-xl border bg-blue-50 p-3 shadow-md">
                            <div className="font-semibold mb-2">Player 0 — hits & misses taken</div>
                            <div
                                className="grid gap-1"
                                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                            >
                                {Array.from({ length: size }).map((_, r) =>
                                    Array.from({ length: size }).map((_, c) =>
                                        renderSpectatorCell(r, c, 0)
                                    )
                                )}
                            </div>
                        </div>

                        {/* Board: Player 0 with shots from P1  */}
                        <div className="rounded-xl border bg-blue-50 p-3 shadow-md">
                            <div className="font-semibold mb-2">Player 1 — hits & misses taken</div>
                            <div
                                className="grid gap-1"
                                style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                            >
                                {Array.from({ length: size }).map((_, r) =>
                                    Array.from({ length: size }).map((_, c) =>
                                        renderSpectatorCell(r, c, 1)
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-3 w-3 rounded-full border bg-red-500" />
                            Hit
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="inline-block h-3 w-3 rounded-full border bg-white border-slate-300" />
                            Miss
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    if (st?.phase === "setup" && isSpectator) {
        return (
            <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center space-y-4">
                    <h1 className="text-2xl font-bold">Battleship</h1>
                    <div className="rounded-2xl border bg-white p-6 shadow-sm">
                        <p className="text-slate-300 font-medium">Players are placing ships…</p>
                        <p className="text-slate-500 text-sm mt-1">
                            You're spectating this match. The battle view will appear when setup is complete.
                        </p>
                    </div>
                    <div className="text-sm text-slate-300 flex items-center justify-center gap-3">
                        <button onClick={EndGame} className="underline">
                            End game
                        </button>
                        <span>
                            Room: <code>{roomId}</code>
                        </span>
                        <span>WS: {conn}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-slate-700 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl space-y-4">
                <header className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Battleship</h1>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                            <span>
                                {conn !== "connected"
                                    ? "Connecting…"
                                    : st?.phase === "setup"
                                        ? (iAmPlayer ? "Place ships and Ready up" : "Spectating")
                                        : st?.phase === "battle"
                                            ? (myTurn ? "Your turn — pick a target" : "Opponent's turn")
                                            : st?.phase === "over"
                                                ? (st?.winner === meSeat ? "Victory!" : st?.winner != null ? "Defeat." : "Game over")
                                                : "…"}
                            </span>
                        </span>
                        <button
                            onClick={reset}
                            className="rounded-xl border px-3 py-1 text-sm hover:bg-white"
                            disabled={conn !== "connected" || !iAmPlayer}
                        >
                            Reset
                        </button>
                    </div>
                </header>

                <div className="text-sm text-slate-300 flex items-center gap-3">
                    <button onClick={EndGame}>Back to Lobby</button>
                    <span>
                        Room: <code>{roomId}</code>
                    </span>
                    <span>
                        WS: {conn} • You: {iAmPlayer ? `P${meSeat}` : "—"} • Phase: {st?.phase || "—"}
                    </span>
                </div>

                {/* Controls */}
                <div className="rounded-xl border p-3">
                    <div className="font-semibold mb-2">Controls</div>

                    {st?.phase === "setup" ? (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-300">Ship:</span>
                                <select
                                    className="rounded-lg border px-2 py-1 text-sm"
                                    value={selectedShip}
                                    onChange={(e) => setSelectedShip(Number(e.target.value))}
                                    disabled={!iAmPlayer}
                                >
                                    {(me?.ships || []).map((s, i) => (
                                        <option key={i} value={i}>
                                            #{i + 1} — len {s.len} {s.placed ? "✓" : "•"}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Direction:</span>
                                <div className="flex gap-1">
                                    <button
                                        className={`rounded-lg border px-2 py-1 text-sm ${dir === "H" ? "bg-slate-100" : ""
                                            }`}
                                        onClick={() => setDir("H")}
                                        disabled={!iAmPlayer}
                                    >
                                        Horizontal
                                    </button>
                                    <button
                                        className={`rounded-lg border px-2 py-1 text-sm ${dir === "V" ? "bg-slate-100" : ""
                                            }`}
                                        onClick={() => setDir("V")}
                                        disabled={!iAmPlayer}
                                    >
                                        Vertical
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={clearAll}
                                className="rounded-xl border px-3 py-1 text-sm hover:bg-slate-50"
                                disabled={!iAmPlayer}
                            >
                                Clear All
                            </button>

                            <button
                                onClick={readyUp}
                                className="rounded-xl border px-3 py-1 text-sm hover:bg-emerald-50"
                                disabled={
                                    !iAmPlayer || !((me?.ships || []).every((s) => s.placed)) || me?.ready
                                }
                            >
                                {me?.ready ? "Ready ✓" : "Ready"}
                            </button>

                            <div className="ml-auto flex items-center gap-3 text-xs text-slate-300">
                                <span className="flex items-center gap-1">
                                    <LegendDot kind="ship" /> Your ships
                                </span>
                                <span className="flex items-center gap-1">
                                    <LegendDot kind="hit" /> Hit
                                </span>
                                <span className="flex items-center gap-1">
                                    <LegendDot kind="miss" /> Miss
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-slate-600">
                            {st?.phase === "battle" && (
                                <span>Click a cell on the right board to fire.</span>
                            )}
                            {st?.phase === "over" && (
                                <span>
                                    {st.winner === meSeat
                                        ? "You win!"
                                        : st.winner != null
                                            ? "You lose."
                                            : "Game over."}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Boards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Your Board */}
                    <div className="rounded-xl border bg-blue-50 p-3 shadow-md bg-slate-800 ">
                        <div className="font-semibold mb-2">Your Board</div>
                        <div
                            className="grid gap-1"
                            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                        >
                            {Array.from({ length: size }).map((_, r) =>
                                Array.from({ length: size }).map((_, c) =>
                                    renderMyBoardCell(r, c)
                                )
                            )}
                        </div>
                    </div>

                    {/* Target Board */}
                    <div className="rounded-xl border bg-blue-50 p-3 shadow-md bg-slate-800 ">
                        <div className="font-semibold mb-2">Target Board</div>
                        <div
                            className="grid gap-1"
                            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                        >
                            {Array.from({ length: size }).map((_, r) =>
                                Array.from({ length: size }).map((_, c) =>
                                    renderTargetCell(r, c)
                                )
                            )}
                        </div>
                    </div>
                </div>

                <p className="mt-3 text-xs text-slate-300">
                    Setup: select ship & direction, click on your board to place. Hit “Ready” when
                    all ships placed. Battle: click on the target board to fire. Server is
                    authoritative; UI only sends intents.
                </p>

                <div className="text-xs text-slate-500">
                    <Link to={`/room/${encodeURIComponent(roomId)}`} className="underline">
                        Back
                    </Link>
                </div>
            </div>
        </div>
    );
}
