import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";

export default function Lobby() {
    const { roomId } = useParams();
    const [search] = useSearchParams();
    const nameFromUrl = search.get("name") || "";
    const navigate = useNavigate();

    const { socket, conn, you } = useSocket();

    const [players, setPlayers] = useState([]);
    const [name, setName] = useState(nameFromUrl);

    useEffect(() => {
        if (!socket) return;

        const onLobby = (state) => setPlayers(state.players || []);
        const onPhase = ({ phase, gameId, roomId }) => {
            if (phase?.startsWith("playing:")) {
                navigate(`/${gameId}/${encodeURIComponent(roomId)}`, { replace: true });
            }
        };
        const onLeft = () => {
            setPlayers([]);
            navigate("/", { replace: true });
        };

        socket.on("lobby", onLobby);
        socket.on("phase", onPhase);
        socket.on("left", onLeft);

        return () => {
            socket.off("lobby", onLobby);
            socket.off("phase", onPhase);
            socket.off("left", onLeft);
        };
    }, [socket, navigate]);

    useEffect(() => {
        if (conn !== "connected" || !roomId) return;
        socket.emit("join", { roomId, name: name || undefined }, (resp) => {
            if (!resp?.ok) {
                alert(resp?.message || "Could not join");
                navigate("/", { replace: true });
            }
        });
    }, [socket, conn, roomId, name, navigate]);

    const youRow = useMemo(
        () => (you ? players.find((p) => p.id === you.id) : null),
        [players, you?.id]
    );

    const isReady = !!you?.host && players.length >= 2;

    const startGame = (gameId) => {
        socket.emit("host_choose_game", { gameId }, (resp) => {
            if (!resp?.ok) alert(resp?.code || "Could not start");
        });
    };

    const updateName = () => {
        if (!name) return;
        socket.emit("set_name", { name });
    };

    const leave = () => {
        socket.emit("leave_room");
        navigate("/", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-lg space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Lobby: <code>{roomId}</code></h1>
                    <Link to="/" className="underline text-sm">Back</Link>
                </div>

                <p className="text-sm text-slate-600">
                    WS: {conn} • You: {you?.id ? (you?.host ? "Host" : "Guest") : "(joining…)"}
                </p>

                <div className="rounded-xl border p-3 bg-white">
                    <div className="font-semibold mb-2">Players</div>
                    <ul className="space-y-1">
                        {players.map((p) => (
                            <li key={p.id} className="flex items-center justify-between">
                                <span>{p.name} {p.id === you?.id ? "(you)" : ""}</span>
                                {p.id === players[0]?.id && <span className="text-xs text-slate-500">host</span>}
                            </li>
                        ))}
                        {!players.length && <li className="text-slate-500 text-sm">No one here yet.</li>}
                    </ul>
                </div>

                <div className="rounded-xl border p-3 bg-white space-y-2">
                    <div className="font-semibold">Your name</div>
                    <div className="flex gap-2">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Type a display name"
                            className="flex-1 rounded-xl border px-3 py-2 text-sm"
                        />
                        <button onClick={updateName} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                            Save
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={leave} className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50">
                        Leave Room
                    </button>
                </div>

                <div className="rounded-xl border p-3 bg-white space-y-2">
                    <div className="font-semibold mb-2">Pick a game (host only)</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => startGame("connect4")}
                            disabled={!isReady}
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                        >
                            Start Connect Four
                        </button>
                        <button
                            onClick={() => startGame("tictactoe")}
                            disabled={!isReady}
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                        >
                            Start TicTacToe
                        </button>
                    </div>
                    {!isReady && (
                        <p className="text-xs text-slate-500">
                            {you?.host ? "Need exactly 2 players to start." : "Waiting for host…"}
                        </p>
                    )}
                </div>

                <p className="text-xs text-slate-500">
                    This lobby shows live players. First to join becomes host. If host leaves, next player becomes host.
                </p>
            </div>
        </div>
    );
}
