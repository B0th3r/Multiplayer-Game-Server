import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";

const SIZE = 3;
const makeEmptyBoard = () =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

function Cell({ value }) {
    const base =
        "flex items-center justify-center h-16 w-16 rounded-xl bg-white border shadow-sm text-2xl font-bold";
    const color =
        value === "X"
            ? "text-red-600 border-red-300"
            : value === "O"
                ? "text-yellow-600 border-yellow-300"
                : "text-slate-400 border-slate-300";
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

    useEffect(() => {
        if (conn === "connected" && roomId) {
            socket.emit("join", { roomId });
        }
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
                alert("Host has ended the game");
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

    const mySymbol = useMemo(() => {
        if (!you?.id) return null;
        return players.find((p) => p.id === you.id)?.symbol ?? null;
    }, [players, you?.id]);

    const status = useMemo(() => {
        if (conn !== "connected") return "Connecting…";
        if (!mySymbol) return "Spectating";
        if (winner === "draw") return "It's a draw.";
        if (winner === "X") return "X wins!";
        if (winner === "O") return "O wins!";
        return current === mySymbol ? "Your turn" : "Opponent's turn";
    }, [conn, mySymbol, winner, current]);

    const handlePlace = (r, c) => {
        if (conn !== "connected" || !mySymbol || winner) return;
        if (current !== mySymbol) return;
        // let the server validate occupied cells, bounds, turn, etc.
        socket.emit("action", { type: "place", r, c });
    };

    const reset = () => socket.emit("reset");

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-4">
                <header className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Tic Tac Toe</h1>
                    <div className="flex items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${winner
                                ? "border-emerald-400"
                                : mySymbol === "X"
                                    ? "border-red-400"
                                    : mySymbol === "O"
                                        ? "border-yellow-400"
                                        : "border-slate-300"
                                }`}
                        >
                            <span className="font-mono">{mySymbol ?? "—"}</span>
                            <span>{status}</span>
                        </span>
                        <button
                            onClick={reset}
                            className="rounded-xl border px-3 py-1 text-sm hover:bg-white"
                            disabled={conn !== "connected" || !mySymbol}
                        >
                            Reset
                        </button>
                    </div>
                </header>

                <div className="text-sm text-slate-600 flex items-center gap-3">
                    <button onClick={EndGame}>Back to Lobby</button>
                    <span>
                        Room: <code>{roomId}</code>
                    </span>
                    <span>
                        WS: {conn} • You: {mySymbol || "—"} • Players:{" "}
                        {players.map((p) => p.symbol ?? "—").join(", ") || "—"}
                    </span>
                </div>

                <div className="rounded-xl border bg-blue-50 p-4 shadow-md">
                    <div
                        className="grid gap-2"
                        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
                    >
                        {board.map((row, r) =>
                            row.map((cell, c) => (
                                <button
                                    key={`${r}-${c}`}
                                    onClick={() => handlePlace(r, c)}
                                    className="rounded-xl bg-blue-100 p-2 transition active:scale-[0.98] focus:outline-none focus:ring"
                                    disabled={conn !== "connected" || !!winner || !!cell || !mySymbol || current !== mySymbol}
                                    aria-label={`Row ${r + 1}, Column ${c + 1}`}
                                >
                                    <Cell value={cell} />
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 