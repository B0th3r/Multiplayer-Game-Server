import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";
import { ArrowLeft, PlugZap, RefreshCw, RotateCw, Ship, Crosshair, Check, ChevronLeft, ChevronRight, Info } from "lucide-react";

function Cell({ className = "", children }) {
    return (
        <div className={"flex items-center justify-center rounded-md border text-xs font-medium " + className}>
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

const hint = (t) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-700/50 text-[11px] text-emerald-300 bg-black/40 select-none">
        <Info className="h-3.5 w-3.5" /> {t}
    </span>
);

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
            if (!firstStateLogged.current) firstStateLogged.current = true;
            setSt(payload);
            try {
                const m = payload?.me ?? (typeof payload?.meSeat === "number" ? payload?.players?.[payload.meSeat] : null);
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
                navigate(`/room/${encodeURIComponent(rid)}`, { replace: true });
            }
        };

        socket.on("state", onState);
        socket.on("phase", onPhase);

        if (!joinedOnce.current && conn === "connected" && roomId) {
            joinedOnce.current = true;
            socket.emit("join", { roomId }, () => { });
        }

        return () => {
            socket.off("state", onState);
            socket.off("phase", onPhase);
        };
    }, [socket, conn, roomId, navigate]);

    const EndGame = () => {
        if (!confirm("Return to lobby?")) return;
        socket.emit("host_end_game", (resp) => { if (!resp?.ok) alert(resp?.code || "Could not end"); });
    };
    const reset = () => socket.emit("reset", (resp) => { if (!resp?.ok) alert(resp?.code || "Could not reset"); });

    const size = st?.size ?? 10;
    const meSeat = st?.meSeat ?? null;
    const myTurn = st?.phase === "battle" && st?.currentSeat === meSeat;
    const iAmPlayer = meSeat === 0 || meSeat === 1;
    const isSpectator = !iAmPlayer;

    const me = useMemo(() => {
        if (!st) return null;
        if (st.me) return st.me;
        if (typeof st.meSeat === "number" && st.players?.[st.meSeat]) return st.players[st.meSeat];
        return null;
    }, [st]);

    const myOcc = useMemo(() => {
        if (!me?.ships) return new Set();
        const s = new Set();
        me.ships.forEach((ship) => (ship.cells || []).forEach(({ r, c }) => s.add(`${r}:${c}`)));
        return s;
    }, [me]);

    const myHits = useMemo(() => {
        if (!me?.ships) return new Set();
        const s = new Set();
        me.ships.forEach((ship) => (ship.hits || []).forEach((k) => s.add(k)));
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
        clientPlaced.forEach(({ cells }) => { for (const { r, c } of cells || []) s.add(`${r}:${c}`); });
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
                if (!resp?.ok) { alert(resp?.code || "Could not place ship"); return; }
                setClientPlaced((prev) => { const next = new Map(prev); next.set(selectedShip, { cells }); return next; });
            }
        );
    };

    const fireAt = (r, c) => {
        if (conn !== "connected" || st?.phase !== "battle" || !iAmPlayer) return;
        if (!myTurn) return;
        const k = `${r}:${c}`;
        if (myShots.has(k)) return;
        socket.emit("action", { type: "fire", r, c }, (resp) => {
            if (!resp?.ok) { alert(resp?.code || "Could not fire"); }
            try { if (window?.navigator?.vibrate) navigator.vibrate(10); } catch { }
        });
    };

    const clearAll = () => {
        if (st?.phase !== "setup") return;
        socket.emit("action", { type: "clear" }, (resp) => { if (!resp?.ok) alert(resp?.code || "Could not clear"); });
        setClientPlaced(new Map());
    };

    const readyUp = () => {
        if (st?.phase !== "setup") return;
        socket.emit("action", { type: "ready" }, (resp) => { if (!resp?.ok) alert(resp?.code || "Could not ready"); });
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
            const oldCells = new Set((me?.ships?.[selectedShip]?.cells || []).map(({ r, c }) => `${r}:${c}`));
            if (!oldCells.has(k) && myOcc.has(k)) return false;
        }
        return previewCells.length > 0;
    }, [st, hover, previewCells, myOcc, selectedShip, me]);

    const status = useMemo(() => {
        if (conn !== "connected") return "Connecting…";
        if (!st) return "Waiting for state…";
        if (!iAmPlayer) return "Spectating";
        if (st.phase === "setup") {
            const mineReady = !!me?.ready; const oppReady = !!st.opponent?.ready;
            if (mineReady && oppReady) return "Starting battle…";
            if (mineReady) return "Waiting for opponent to ready…";
            return "Place ships and Ready up";
        }
        if (st.phase === "battle") return myTurn ? "Your turn — pick a target" : "Opponent’s turn";
        if (st.phase === "over") return st.winner === meSeat ? "Victory!" : st.winner != null ? "Defeat." : "Game over";
        return "…";
    }, [conn, st, myTurn, iAmPlayer, meSeat, me]);

    // Spectator board 
    const renderSpectatorCell = (r, c, seat) => {
        const k = `${r}:${c}`;
        const shots = new Map((st?.spectator?.[seat === 0 ? "p1" : "p0"]?.shots || []).map(({ k, result }) => [k, result]));
        const result = shots.get(k);
        const bg = result === "hit" ? "bg-red-500" : result === "miss" ? "bg-white" : "bg-blue-200";
        const border = result === "hit" ? "border-red-600" : result === "miss" ? "border-slate-300" : "border-blue-300";
        return (
            <div key={k} className={`aspect-square ${bg} ${border}`}>
                <Cell className="bg-transparent border-0">{result === "hit" ? "✕" : result === "miss" ? "•" : ""}</Cell>
            </div>
        );
    };


    const renderMyBoardCell = (r, c) => {
        const k = `${r}:${c}`;
        const hasShip = myOccOptimistic.has(k);
        const gotHit = myHits.has(k);
        const inPreview = previewCells.some((pc) => pc.k === k);

        let base = "aspect-square transition active:scale-[0.98] border border-emerald-300 rounded-md";
        let bg = "bg-emerald-200/80"; // water
        let ring = ""; let text = "";

        if (hasShip) bg = "bg-slate-700";
        if (gotHit) { ring = "ring-2 ring-red-400"; text = "✕"; }

        if (st?.phase === "setup" && inPreview) {
            if (previewValid) { bg = hasShip ? "bg-slate-700" : "bg-emerald-300/70"; ring = "ring-2 ring-emerald-500"; }
            else { bg = "bg-rose-300/70"; ring = "ring-2 ring-rose-500"; }
        }

        return (
            <button
                key={k}
                onMouseEnter={() => iAmPlayer && setHover({ r, c })}
                onMouseLeave={() => iAmPlayer && setHover(null)}
                onClick={() => { if (st?.phase === "setup" && iAmPlayer) placeAt(r, c); }}
                disabled={conn !== "connected" || !iAmPlayer || st?.phase !== "setup"}
                className={`${base} ${bg} ${ring}`}
                aria-label={`Your board r${r + 1} c${c + 1}`}
            >
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{text}</div>
            </button>
        );
    };

    const renderTargetCell = (r, c) => {
        const k = `${r}:${c}`;
        const shot = myShots.get(k);
        const bg = shot === "hit" ? "bg-red-500" : shot === "miss" ? "bg-white" : "bg-emerald-200/80";
        const border = shot === "hit" ? "border-red-600" : shot === "miss" ? "border-slate-300" : "border-emerald-300";

        return (
            <button
                key={k}
                onClick={() => fireAt(r, c)}
                disabled={conn !== "connected" || !iAmPlayer || st?.phase !== "battle" || !myTurn || !!shot}
                className={`aspect-square ${bg} ${border} transition active:scale-[0.98] rounded-md`}
                aria-label={`Target r${r + 1} c${c + 1}`}
            >
                <Cell className="bg-transparent border-0">{shot === "hit" ? "✕" : shot === "miss" ? "•" : ""}</Cell>
            </button>
        );
    };

    // Keyboard shortcuts
    useEffect(() => {
        const onKey = (e) => {
            if (!iAmPlayer || conn !== "connected") return;
            if (st?.phase === "setup") {
                if (e.key.toLowerCase() === "r") setDir((d) => (d === "H" ? "V" : "H"));
                if (e.key === "[") setSelectedShip((i) => Math.max(0, i - 1));
                if (e.key === "]") setSelectedShip((i) => Math.min((st?.me?.ships?.length ?? 1) - 1, i + 1));
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [iAmPlayer, conn, st]);

    // Spectator battle/over
    if (isSpectator && (st?.phase === "battle" || st?.phase === "over")) {
        return (
            <div className="min-h-screen supports-[height:100svh]:min-h-[100svh] w-full bg-black flex items-center justify-center p-6">
                <div className="w-full max-w-5xl space-y-4 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/60 backdrop-blur">
                    <header className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold tracking-wider text-emerald-300 flex items-center gap-2"><Ship className="h-5 w-5" /> BATTLESHIP</h1>
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-black/60 px-3 py-1 text-xs text-emerald-300">
                            <PlugZap className="h-3.5 w-3.5" /> WS: {conn}
                        </span>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-emerald-700/40 bg-slate-900 p-3 shadow-md">
                            <div className="font-semibold text-emerald-200 mb-2">Player 0 — hits & misses taken</div>
                            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                                {Array.from({ length: size }).map((_, r) => Array.from({ length: size }).map((_, c) => renderSpectatorCell(r, c, 0)))}
                            </div>
                        </div>
                        <div className="rounded-xl border border-emerald-700/40 bg-slate-900 p-3 shadow-md">
                            <div className="font-semibold text-emerald-200 mb-2">Player 1 — hits & misses taken</div>
                            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                                {Array.from({ length: size }).map((_, r) => Array.from({ length: size }).map((_, c) => renderSpectatorCell(r, c, 1)))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-emerald-300/80">
                        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full border bg-red-500" />Hit</span>
                        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full border bg-white border-slate-300" />Miss</span>
                    </div>
                </div>
            </div>
        );
    }

    // Spectator during setup
    if (st?.phase === "setup" && isSpectator) {
        return (
            <div className="min-h-screen supports-[height:100svh]:min-h-[100svh] w-full bg-black flex items-center justify-center p-6">
                <div className="w-full max-w-md text-center space-y-4 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/60">
                    <h1 className="text-2xl font-semibold tracking-wider text-emerald-300"><Ship className="inline h-5 w-5 mr-2" />BATTLESHIP</h1>
                    <div className="rounded-2xl border border-emerald-700/40 bg-slate-900 p-6 shadow-sm">
                        <p className="text-emerald-300 font-medium">Players are placing ships…</p>
                        <p className="text-emerald-300/70 text-sm mt-1">You’re spectating. The battle view will appear when setup is complete.</p>
                    </div>
                    <div className="text-sm text-emerald-300/70 flex items-center justify-center gap-3">
                        <button onClick={EndGame} className="underline">End game</button>
                        <span>Room: <code>{roomId}</code></span>
                        <span>WS: {conn}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Player view
    return (
        <div className="min-h-screen supports-[height:100svh]:min-h-[100svh] w-full bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-5xl space-y-4 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/60 shadow-[0_0_0_1px_rgba(16,185,129,0.08)_inset,0_10px_40px_-12px_rgba(16,185,129,0.15)] backdrop-blur">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="mt-1 text-2xl font-semibold tracking-wider text-emerald-300 flex items-center gap-2"><Ship className="h-5 w-5" /> BATTLESHIP</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-black/60 px-3 py-1 text-xs text-emerald-300 select-none"><PlugZap className="h-3.5 w-3.5" /> WS: {conn}</span>
                        <button onClick={reset} disabled={conn !== "connected" || !iAmPlayer} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10 disabled:opacity-40"><RefreshCw className="h-4 w-4" />Reset</button>
                        <button onClick={EndGame} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">Back</button>
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-700/40 bg-slate-900 p-3">
                    <div className="text-emerald-100 text-sm">{status}</div>
                    <div className="flex items-center gap-2 text-[11px] text-emerald-300/70">
                        <span>Room: <code>{roomId}</code></span>
                        <span>Phase: {st?.phase || "—"}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="rounded-xl border border-emerald-700/40 bg-slate-900 p-3">
                    {st?.phase === "setup" ? (
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-emerald-300/80">Ship:</span>
                                <div className="inline-flex items-center gap-1">
                                    <button onClick={() => setSelectedShip((i) => Math.max(0, i - 1))} className="rounded border border-emerald-700/60 p-1"><ChevronLeft className="h-4 w-4" /></button>
                                    <select className="rounded-lg border border-emerald-700/60 bg-black px-2 py-1 text-sm text-emerald-100" value={selectedShip} onChange={(e) => setSelectedShip(Number(e.target.value))} disabled={!iAmPlayer}>
                                        {(me?.ships || []).map((s, i) => (
                                            <option key={i} value={i}>#{i + 1} — len {s.len} {s.placed ? "✓" : "•"}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => setSelectedShip((i) => Math.min((me?.ships?.length ?? 1) - 1, i + 1))} className="rounded border border-emerald-700/60 p-1"><ChevronRight className="h-4 w-4" /></button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-emerald-300/80">Direction:</span>
                                <div className="flex gap-1">
                                    <button className={`rounded-lg border px-2 py-1 text-sm ${dir === "H" ? "border-emerald-500 bg-emerald-500/10" : "border-emerald-700/60"}`} onClick={() => setDir("H")} disabled={!iAmPlayer}>Horizontal</button>
                                    <button className={`rounded-lg border px-2 py-1 text-sm ${dir === "V" ? "border-emerald-500 bg-emerald-500/10" : "border-emerald-700/60"}`} onClick={() => setDir("V")} disabled={!iAmPlayer}>Vertical</button>
                                    <button className="rounded-lg border border-emerald-700/60 px-2 py-1 text-sm inline-flex items-center gap-1" onClick={() => setDir((d) => (d === "H" ? "V" : "H"))}><RotateCw className="h-4 w-4" />Rotate <span className="opacity-70">(R)</span></button>
                                </div>
                            </div>

                            <button onClick={clearAll} className="rounded-xl border border-emerald-700/60 px-3 py-1 text-sm text-emerald-100 hover:bg-emerald-600/10" disabled={!iAmPlayer}>Clear All</button>

                            <button onClick={readyUp} className="rounded-xl border border-emerald-700/60 px-3 py-1 text-sm text-emerald-100 hover:bg-emerald-600/10 disabled:opacity-50" disabled={!iAmPlayer || !((me?.ships || []).every((s) => s.placed)) || me?.ready}>
                                {me?.ready ? (<span className="inline-flex items-center gap-1"><Check className="h-4 w-4" /> Ready</span>) : "Ready"}
                            </button>

                            <div className="ml-auto flex items-center gap-3 text-xs text-emerald-300/80">
                                <span className="flex items-center gap-1"><LegendDot kind="ship" /> Your ships</span>
                                <span className="flex items-center gap-1"><LegendDot kind="hit" /> Hit</span>
                                <span className="flex items-center gap-1"><LegendDot kind="miss" /> Miss</span>
                                {hint("Click your board to place ships")}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-sm text-emerald-300/80">
                            <Crosshair className="h-4 w-4" />
                            {myTurn ? "Pick a target on the right board" : "Waiting for opponent…"}
                            {hint("You can only fire once per turn")}
                        </div>
                    )}
                </div>

                {/* Boards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Your Board */}
                    <div className="rounded-xl border border-emerald-700/40 bg-slate-900 p-3 shadow-md">
                        <div className="font-semibold text-emerald-200 mb-2">Your Board</div>
                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                            {Array.from({ length: size }).map((_, r) => Array.from({ length: size }).map((_, c) => renderMyBoardCell(r, c)))}
                        </div>
                    </div>

                    {/* Target Board */}
                    <div className="rounded-xl border border-emerald-700/40 bg-slate-900 p-3 shadow-md">
                        <div className="font-semibold text-emerald-200 mb-2">Target Board</div>
                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                            {Array.from({ length: size }).map((_, r) => Array.from({ length: size }).map((_, c) => renderTargetCell(r, c)))}
                        </div>
                    </div>
                </div>

                <p className="mt-3 text-[11px] text-emerald-300/70">Setup: select ship & direction, click on your board to place. Press <kbd className='px-1 border border-emerald-700/60 rounded'>R</kbd> to rotate. Battle: click the target board to fire. Server is authoritative; UI only sends intents.</p>

                <div className="text-xs text-emerald-300/70"><Link to={`/room/${encodeURIComponent(roomId)}`} className="underline">Back</Link></div>
            </div>
        </div>
    );
}
