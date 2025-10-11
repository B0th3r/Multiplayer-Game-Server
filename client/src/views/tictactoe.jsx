import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";
import { ArrowLeft, RefreshCw, PlugZap, Grid3X3 } from "lucide-react";

const SIZE = 3;
const makeEmptyBoard = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

function Cell({ value }) {
    const base = "h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center rounded-xl bg-slate-900 shadow-sm text-2xl font-bold";
    const color =
        value === "X"
            ? "text-red-400 border-red-400"
            : value === "O"
                ? "text-yellow-300 border-yellow-400"
                : "text-emerald-300/50 border-emerald-700/60";
    return <div className={`${base} ${color}`}>{value ?? ""}</div>;
}

export default function TicTacToe() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, conn, you } = useSocket();

    const [board, setBoard] = useState(makeEmptyBoard());
    const [current, setCurrent] = useState("X");
    const [winner, setWinner] = useState(null);
    const [players, setPlayers] = useState([]);

    const [cursor, setCursor] = useState(4); // center
    const gridRef = useRef(null);

    useEffect(() => {
        if (conn === "connected" && roomId) socket.emit("join", { roomId });
    }, [conn, roomId, socket]);

    useEffect(() => {
        const onState = (st) => {
            setBoard(st.board || makeEmptyBoard());
            setCurrent(st.current || "X");
            setWinner(st.winner ?? null);
            setPlayers(st.players || []);
        };
        const onPhase = ({ phase, roomId: rid }) => {
            if (phase === "lobby") {
                navigate(`/room/${encodeURIComponent(rid)}`, { replace: true });
            }
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

    const mySymbol = useMemo(() => {
        if (!you?.id) return null;
        return players.find((p) => p.id === you.id)?.symbol ?? null;
    }, [players, you?.id]);

    const status = useMemo(() => {
        if (conn !== "connected") return "Connecting…";
        if (!mySymbol) return "Spectating";
        if (winner === "draw") return "It’s a draw.";
        if (winner === "X") return "X wins!";
        if (winner === "O") return "O wins!";
        return current === mySymbol ? "Your turn" : "Opponent’s turn";
    }, [conn, mySymbol, winner, current]);

    const handlePlace = (r, c) => {
        if (conn !== "connected" || !mySymbol || winner) return;
        if (current !== mySymbol) return;
        if (board[r][c]) return;
        socket.emit("action", { type: "place", r, c });
    };

    const reset = () => socket.emit("reset");

    const winCells = useMemo(() => {
        const lines = [];
        for (let i = 0; i < 3; i++) lines.push([[i, 0], [i, 1], [i, 2]]);
        for (let j = 0; j < 3; j++) lines.push([[0, j], [1, j], [2, j]]);
        lines.push([[0, 0], [1, 1], [2, 2]]);
        lines.push([[0, 2], [1, 1], [2, 0]]);
        for (const line of lines) {
            const vals = line.map(([r, c]) => board[r][c]);
            if (vals[0] && vals.every((v) => v === vals[0])) return line;
        }
        return null;
    }, [board]);

    // keyboard controls
    useEffect(() => {
        const onKey = (e) => {
            if (document.activeElement && gridRef.current && gridRef.current.contains(document.activeElement)) {
                return;
            }
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"].includes(e.key)) e.preventDefault();
            if (e.key === "ArrowLeft") setCursor((i) => (i % 3 === 0 ? i + 2 : i - 1));
            if (e.key === "ArrowRight") setCursor((i) => (i % 3 === 2 ? i - 2 : i + 1));
            if (e.key === "ArrowUp") setCursor((i) => (i - 3 < 0 ? i + 6 : i - 3));
            if (e.key === "ArrowDown") setCursor((i) => (i + 3 > 8 ? i - 6 : i + 3));
            if (e.key === " " || e.key === "Enter") {
                const r = Math.floor(cursor / 3), c = cursor % 3;
                handlePlace(r, c);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [cursor, handlePlace]);

    return (
        <div className="min-h-screen supports-[height:100svh]:min-h-[100svh] w-full flex items-center justify-center p-4 bg-black">
            <div className="w-full max-w-md space-y-4 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/60 backdrop-blur shadow-[0_0_0_1px_rgba(16,185,129,0.08)_inset,0_10px_40px_-12px_rgba(16,185,129,0.15)]">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <button onClick={EndGame} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">End game</button>
                        <h1 className="mt-1 text-2xl font-semibold tracking-wider text-emerald-300 flex items-center gap-2"><Grid3X3 className="h-5 w-5" /> TIC‑TAC‑TOE</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-black/60 px-3 py-1 text-xs text-emerald-300 select-none"><PlugZap className="h-3.5 w-3.5" /> WS: {conn}</span>
                        <button onClick={reset} disabled={conn !== "connected" || !mySymbol} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10 disabled:opacity-40"><RefreshCw className="h-4 w-4" />Reset</button>
                    </div>
                </div>

                {/* Status */}
                <div className={`flex items-center justify-between gap-3 rounded-xl border border-emerald-700/40 bg-slate-900 p-3`}>
                    <div className="text-emerald-100 text-sm">
                        <span className="font-mono mr-2">{mySymbol ?? "—"}</span>
                        {status}
                    </div>
                    <div className="text-[11px] text-emerald-300/70">Room: <code>{roomId}</code></div>
                </div>

                {/* Board */}
                <div className="relative rounded-xl border border-emerald-700/40 bg-slate-800 p-4 shadow-md">
                    {winCells && (
                        <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {(() => {
                                const center = (idx) => {
                                    const r = idx[0], c = idx[1];
                                    const step = 100 / 3;
                                    return { x: c * step + step / 2, y: r * step + step / 2 };
                                };
                                const a = center(winCells[0]);
                                const b = center(winCells[2]);
                                return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgb(16 185 129)" strokeWidth="3" strokeLinecap="round" />;
                            })()}
                        </svg>
                    )}

                    <div ref={gridRef} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}>
                        {board.map((row, r) =>
                            row.map((cell, c) => {
                                const idx = r * 3 + c;
                                const canPlay = conn === "connected" && !winner && !cell && !!mySymbol && current === mySymbol;
                                const focused = cursor === idx;
                                return (
                                    <button
                                        key={`${r}-${c}`}
                                        onClick={() => handlePlace(r, c)}
                                        onMouseEnter={() => setCursor(idx)}
                                        className={`flex items-center justify-center rounded-xl bg-slate-700 p-2 transition active:scale-[0.98] focus:outline-none ${canPlay ? "hover:bg-emerald-700/30" : "opacity-90"
                                            } ${focused ? "ring-2 ring-emerald-400" : ""}`}
                                        disabled={!canPlay}
                                        aria-label={`Row ${r + 1}, Column ${c + 1}`}
                                    >
                                        <Cell value={cell} />
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <p className="text-[11px] text-emerald-300/70">Use ← → ↑ ↓ to move, Enter/Space to place. First to three in a row wins.</p>
            </div>
        </div>
    );
}
