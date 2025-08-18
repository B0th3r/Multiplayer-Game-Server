import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";

const COLS = 7;
const ROWS = 6;

const makeEmptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

function Disc({ value }) {
    const base = "mx-auto h-12 w-12 rounded-full border shadow-sm";
    const color = !value
        ? "bg-white border-gray-300"
        : value === "R"
            ? "bg-red-500 border-red-600"
            : value === "G"
                ? "bg-green-500 border-green-600"
                : "bg-yellow-400 border-yellow-500";
    return <div className={`${base} ${color}`} />;
}

function ColumnHeader({ onClick, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="h-8 w-full rounded-t-md border-b text-sm font-medium transition active:scale-[0.98] disabled:opacity-40"
        >
            Drop
        </button>
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
    useEffect(() => {
        if (conn === "connected" && roomId) {
            socket.emit("join", { roomId });
        }
    }, [conn, roomId, socket]);


    useEffect(() => {
        const onState = (st) => {
            setBoard(st.board || makeEmptyBoard());
            setCurrent(st.current || "R");
            setWinner(st.winner ?? null);
            setPlayers(st.players || []);
        };

        const onPhase = ({ phase, roomId: rid }) => {
            if (phase === "lobby") {
                alert("Host has ended the game")
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
        socket.emit("host_end_game", (resp) => {
            if (!resp?.ok) alert(resp?.code || "Could not end");
        });
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
        if (myColor === "G") return "spectating"
        return current === myColor ? "Your turn" : "Opponent's turn";
    }, [conn, myColor, winner, current]);

    const handleDrop = (col) => {
        if (conn !== "connected" || !myColor || winner) return;
        if (current !== myColor) return;
        socket.emit('action', { type: 'drop', col });
    };

    const reset = () => socket.emit("reset");

    const nextOpenRowLocal = (b, col) => {
        for (let r = ROWS - 1; r >= 0; r--) if (b[r][col] === null) return r;
        return -1;
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-3xl space-y-4">
                <header className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Connect Four</h1>
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${winner
                                ? "border-emerald-400"
                                : myColor === "R"
                                    ? "border-red-400"
                                    : myColor === "G"
                                        ? "border-green-400"
                                        : "border-yellow-400"
                                }`}
                        >
                            <Disc value={winner ? (winner === "draw" ? null : winner) : myColor} />
                            <span>{status}</span>
                        </span>
                        <button
                            onClick={reset}
                            className="rounded-xl border px-3 py-1 text-sm hover:bg-white"

                            disabled={conn !== "connected" || !myColor}
                        >
                            Reset
                        </button>
                    </div>
                </header>

                <div className="text-sm text-slate-600 flex items-center gap-3">
                    <button
                        onClick={EndGame}>
                        Back to Lobby
                    </button>
                    <span>Room: <code>{roomId}</code></span>
                    <span>
                        WS: {conn} • You: {myColor || "—"} • Players: {players.map(p => p.color).join(", ") || "—"}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <div className="rounded-xl border bg-blue-50 p-2 shadow-md" role="grid" aria-label="Connect Four board">
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: COLS }).map((_, c) => (
                                <ColumnHeader
                                    key={`h-${c}`}
                                    onClick={() => handleDrop(c)}
                                    disabled={
                                        conn !== "connected" ||
                                        !myColor ||
                                        !!winner ||
                                        nextOpenRowLocal(board, c) < 0 ||
                                        current !== myColor
                                    }
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2 p-2 bg-blue-100 rounded-b-xl">
                            {board.map((row, r) =>
                                row.map((cell, c) => (
                                    <button
                                        key={`${r}-${c}`}
                                        onClick={() => handleDrop(c)}
                                        className="aspect-square rounded-xl bg-blue-200 p-2 transition active:scale-[0.98] focus:outline-none focus:ring"
                                        aria-label={`Row ${r + 1}, Column ${c + 1}`}
                                        disabled={conn !== "connected" || !myColor || !!winner || current !== myColor}
                                    >
                                        <Disc value={cell} />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                    Open this URL in two tabs to play. The server is authoritative; clicks only request moves.
                </p>
            </div>
        </div>
    );
}
