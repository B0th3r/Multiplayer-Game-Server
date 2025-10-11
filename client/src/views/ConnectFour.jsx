import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";
import { ArrowLeft, PlugZap, RefreshCw, Crown, Grid3X3, Info } from "lucide-react";

const COLS = 7;
const ROWS = 6;
const makeEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

function Disc({ value, size = "board", highlight = false, ghost = false }) {
    const base =
        size === "status"
            ? "w-4 h-4 rounded-full border"
            : size === "ghost"
                ? "w-8 h-8 md:w-10 md:h-10 rounded-full border"
                : "w-[72%] h-[72%] md:w-[75%] md:h-[75%] rounded-full border";

    const palette = !value
        ? "bg-transparent border-transparent"
        : value === "R"
            ? "bg-red-500 border-red-600"
            : value === "Y"
                ? "bg-yellow-400 border-yellow-500"
                : "bg-emerald-500 border-emerald-600"; // fallback / spectator

    const glow = highlight
        ? "ring-2 ring-offset-2 ring-offset-slate-900 " +
        (value === "R"
            ? "ring-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.75)]"
            : "ring-yellow-500 drop-shadow-[0_0_12px_rgba(250,204,21,0.75)]")
        : "";

    const ghosty = ghost ? "opacity-40" : "";

    return <div className={`${base} ${palette} ${glow} ${ghosty}`} />;
}

function StatusPill({ conn, text }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-black/60 px-3 py-1 text-xs text-emerald-300 select-none">
            <span className={`relative inline-flex h-2 w-2 rounded-full ${conn === "connected" ? "bg-emerald-400" : "bg-rose-500"}`}>
                <span className={`absolute inset-0 rounded-full ${conn === "connected" ? "bg-emerald-400" : "bg-rose-500"} opacity-50 animate-ping`} />
            </span>
            <PlugZap className="h-3.5 w-3.5" />
            {text}
        </span>
    );
}

export default function ConnectFour() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, conn, you } = useSocket();

    const [board, setBoard] = useState(makeEmptyBoard());
    const [current, setCurrent] = useState("R");
    const [winner, setWinner] = useState(null);
    const [players, setPlayers] = useState([]);
    const [lastMove, setLastMove] = useState(null);

    // UX bits
    const [hoverCol, setHoverCol] = useState(null); // for drop preview
    const [focusCol, setFocusCol] = useState(0); // keyboard nav
    const gridRef = useRef(null);

    useEffect(() => {
        if (conn === "connected" && roomId) socket.emit("join", { roomId });
    }, [conn, roomId, socket]);

    useEffect(() => {
        const onState = (st) => {
            setBoard(st.board || makeEmptyBoard());
            setCurrent(st.current || "R");
            setWinner(st.winner ?? null);
            setPlayers(st.players || []);
            setLastMove(st.last || null);
        };

        const onPhase = ({ phase, roomId: rid }) => {
            if (phase === "lobby") navigate(`/room/${encodeURIComponent(rid)}`, { replace: true });
        };

        socket.on("state", onState);
        socket.on("phase", onPhase);
        return () => {
            socket.off("state", onState);
            socket.off("phase", onPhase);
        };
    }, [socket, navigate]);

    const EndGame = () => {
        if (!confirm("Return to lobby?")) return;
        socket.emit("host_end_game", (resp) => { if (!resp?.ok) alert(resp?.code || "Could not end"); });
    };

    const myColor = useMemo(() => {
        if (!you?.id) return null;
        return players.find((p) => p.id === you.id)?.color ?? null;
    }, [players, you?.id]);

    const status = useMemo(() => {
        if (conn !== "connected") return "Connecting…";
        if (!myColor) return "Waiting for assignment…";
        if (winner === "draw") return "It's a draw.";
        if (winner === "R") return "Red wins!";
        if (winner === "Y") return "Yellow wins!";
        if (myColor === "G") return "Spectating";
        return current === myColor ? "Your turn" : "Opponent's turn";
    }, [conn, myColor, winner, current]);

    const handleDrop = (col) => {
        if (conn !== "connected" || !myColor || winner) return;
        if (current !== myColor) return;
        socket.emit("action", { type: "drop", col });
    };

    const reset = () => socket.emit("reset");

    const nextOpenRowLocal = (b, col) => {
        for (let r = ROWS - 1; r >= 0; r--) if (b[r][col] === null) return r;
        return -1;
    };

    // Keyboard controls
    const onKey = (e) => {
        if (winner || conn !== "connected") return;
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            setFocusCol((c) => (c + COLS - 1) % COLS);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            setFocusCol((c) => (c + 1) % COLS);
        } else if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            handleDrop(focusCol);
        }
    };

    const canDrop = (c) =>
        conn === "connected" && myColor && !winner && current === myColor && nextOpenRowLocal(board, c) >= 0;

    const shareText = `Room: ${roomId}  •  You: ${myColor || "—"}  •  Players: ${players.map((p) => p.color).join(", ") || "—"}`;

    return (
        <div className="min-h-screen supports-[height:100svh]:min-h-[100svh] w-full relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.06),transparent_60%)]" />

            <div className="flex items-center justify-center p-4">
                <div className="w-full max-w-4xl space-y-4 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/60 shadow-[0_0_0_1px_rgba(16,185,129,0.08)_inset,0_10px_40px_-12px_rgba(16,185,129,0.15)] backdrop-blur">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="mt-1 text-2xl font-semibold tracking-wider text-emerald-300 flex items-center gap-2">
                                <Grid3X3 className="h-5 w-5" /> CONNECT FOUR
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusPill conn={conn} text={`WS: ${conn} · Players: ${players.length}`} />
                            <button onClick={reset} disabled={conn !== "connected" || !myColor} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10 disabled:opacity-40"><RefreshCw className="h-4 w-4" />Reset</button>
                            <button onClick={EndGame} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">End game</button>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-700/40 bg-black/40 p-3">
                        <div className="flex items-center gap-2">
                            <Disc value={winner ? (winner === "draw" ? null : winner) : myColor} size="status" />
                            <span className="text-emerald-100 text-sm">{status}</span>
                            {players[0]?.id && (
                                <span className="ml-2 text-[11px] text-emerald-300/70 inline-flex items-center gap-1">
                                    <Crown className="h-3.5 w-3.5 text-amber-300" /> host: {players[0].name || players[0].id.slice(0, 6)}
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-emerald-300/70 truncate" title={shareText}>{shareText}</div>
                    </div>

                    {/* Board */}
                    <div
                        ref={gridRef}
                        tabIndex={0}
                        onKeyDown={onKey}
                        role="grid"
                        aria-label="Connect Four board"
                        className="rounded-xl border border-emerald-700/40 bg-slate-800 p-2 outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                        {/* Column headers */}
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: COLS }).map((_, c) => {
                                const openRow = nextOpenRowLocal(board, c);
                                const disabled = !canDrop(c);
                                const isFocus = focusCol === c;
                                return (
                                    <button
                                        key={`h-${c}`}
                                        onMouseEnter={() => setHoverCol(c)}
                                        onMouseLeave={() => setHoverCol(null)}
                                        onFocus={() => setFocusCol(c)}
                                        onClick={() => handleDrop(c)}
                                        disabled={disabled}
                                        aria-disabled={disabled}
                                        className={`relative h-9 w-full rounded-t-md border text-xs font-medium transition active:scale-[0.98] ${disabled
                                                ? "opacity-40 border-slate-700 text-slate-400"
                                                : "border-emerald-700/60 text-emerald-200 hover:bg-emerald-600/10"
                                            } ${isFocus ? "ring-2 ring-emerald-400" : ""}`}
                                        aria-label={`Drop in column ${c + 1}${openRow >= 0 ? `, row ${openRow + 1} available` : ", column full"}`}
                                    >
                                        Drop
                                        {/* Ghost disc preview */}
                                        {hoverCol === c && openRow >= 0 && (
                                            <span className="absolute left-1/2 top-[110%] -translate-x-1/2 pointer-events-none">
                                                <Disc value={current} size="ghost" ghost />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-7 gap-2 p-2 rounded-b-xl">
                            {board.map((row, r) =>
                                row.map((cell, c) => (
                                    <button
                                        key={`${r}-${c}`}
                                        onMouseEnter={() => setHoverCol(c)}
                                        onMouseLeave={() => setHoverCol(null)}
                                        onClick={() => handleDrop(c)}
                                        className="aspect-square flex items-center justify-center rounded-xl bg-slate-900 transition active:scale-[0.98] focus:outline-none focus:ring"
                                        aria-label={`Row ${r + 1}, Column ${c + 1}`}
                                        disabled={conn !== "connected" || !myColor || !!winner || current !== myColor}
                                    >
                                        <Disc value={cell} highlight={!!cell && lastMove?.r === r && lastMove?.c === c} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Help */}
                    <div className="text-[11px] text-emerald-300/70 inline-flex items-center gap-2"><Info className="h-3.5 w-3.5" />Use ← → to pick a column, Enter/Space to drop.</div>
                </div>
            </div>
        </div>
    );
}
