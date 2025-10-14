import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";
import { PlugZap, Crown, Users, Save, LogOut, Gamepad2, Grid3X3, Ship, CircleDot, Loader2 } from "lucide-react";

export default function Lobby() {
    const { roomId } = useParams();
    const [search] = useSearchParams();
    const nameFromUrl = search.get("name") || "";
    const navigate = useNavigate();

    const { socket, conn, you } = useSocket();
    const [players, setPlayers] = useState([]);
    const [name, setName] = useState(nameFromUrl);
    const [saving, setSaving] = useState(false);

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

    const isHost = useMemo(() => players[0]?.id === you?.id, [players, you]);
    const isReady = isHost && players.length >= 2;

    const startGame = (gameId) => {
        socket.emit("host_choose_game", { gameId }, (resp) => {
            if (!resp?.ok) alert(resp?.code || "Could not start");
        });
    };

    const updateName = () => {
        const trimmed = (name || "").trim();
        if (!trimmed) return;
        setSaving(true);
        socket.emit("set_name", { name: trimmed }, () => setSaving(false));
        try { localStorage.setItem("GamerTag", trimmed); } catch { }
    };

    const leave = () => {
        if (!confirm("Leave this room?")) return;
        socket.emit("leave_room");
        navigate("/", { replace: true });
    };

    const status = conn !== "connected" ? "offline" : "online";
    const statusCopy = status === "offline" ? "WS: offline" : `WS: online · Players: ${players.length}`;

    return (
        <div className="min-h-screen supports-[height:100svh]:min-h-[100svh] w-full relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.06),transparent_60%)]" />

            <div className="flex items-center justify-center p-4">
                <div className="w-full max-w-2xl space-y-5 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/60 shadow-[0_0_0_1px_rgba(16,185,129,0.08)_inset,0_10px_40px_-12px_rgba(16,185,129,0.15)] backdrop-blur">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm text-emerald-300/80">
                            </div>
                            <h1 className="mt-1 text-2xl font-semibold tracking-wider text-emerald-300">
                                <span className="opacity-70">{roomId}</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusPill status={status} copy={statusCopy} />
                        </div>
                    </div>

                    <p className="text-xs text-emerald-300/70">
                        You: {you?.id ? (you?.host ? "Host" : "Guest") : "(joining…)"}
                    </p>

                    <section className="rounded-xl border border-emerald-700/40 bg-black/40 p-3">
                        <div className="font-semibold text-emerald-200 mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" /> Players
                        </div>
                        <ul className="space-y-1">
                            {players.map((p, i) => (
                                <li key={p.id} className="flex items-center justify-between text-emerald-100">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {i === 0 ? <Crown className="h-4 w-4 text-amber-300" /> : <CircleDot className="h-3.5 w-3.5 text-emerald-400" />}
                                        <span className="truncate" title={p.id}>
                                            {p.name || "Anon"} {p.id === you?.id && <em className="text-emerald-300/70">(you)</em>}
                                        </span>
                                    </div>

                                </li>
                            ))}
                            {players.length === 0 && (
                                <li className="text-emerald-300/70 text-sm">No one here yet.</li>
                            )}
                        </ul>
                    </section>

                    <section className="rounded-xl border border-emerald-700/40 bg-black/40 p-3 space-y-2">
                        <div className="font-semibold text-emerald-200">Your name</div>
                        <div className="flex gap-2">
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && updateName()}
                                placeholder="Type a display name"
                                className="flex-1 rounded border border-emerald-700/50 bg-black px-3 py-2 text-base sm:text-sm text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                            <button onClick={updateName} className="rounded border border-emerald-700/60 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-600/10 inline-flex items-center gap-2">
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
                            </button>
                        </div>
                    </section>

                    <div className="flex gap-2">
                        <button onClick={leave} className="rounded border border-emerald-700/60 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-600/10 inline-flex items-center gap-2">
                            <LogOut className="h-4 w-4" /> Leave Room
                        </button>
                    </div>

                    <section className="rounded-xl border border-emerald-700/40 bg-black/40 p-3 space-y-3">
                        <div className="font-semibold text-emerald-200 mb-1">Pick a game {isHost ? "(host)" : "(host only)"}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <GameCard
                                title="Connect Four"
                                icon={<Grid3X3 className="h-5 w-5" />}
                                onClick={() => startGame("connect4")}
                                disabled={!isReady}
                            />
                            <GameCard
                                title="Tic-Tac-Toe"
                                icon={<Gamepad2 className="h-5 w-5" />}
                                onClick={() => startGame("tictactoe")}
                                disabled={!isReady}
                            />
                            <GameCard
                                title="Battleship"
                                icon={<Ship className="h-5 w-5" />}
                                onClick={() => startGame("battleship")}
                                disabled={!isReady}
                            />
                            <GameCard
                                title="Blackjack"
                                icon={<Gamepad2 className="h-5 w-5" />}
                                onClick={() => startGame("blackjack")}
                                disabled={!isReady}
                            />
                            <GameCard
                                title="Memory Matching"
                                icon={<Gamepad2 className="h-5 w-5" />}
                                onClick={() => startGame("memoryMatching")}
                                disabled={!isReady}
                            />
                            <GameCard
                            title="Riichi Mahjong"
                            icon={<Gamepad2 className="h-5 w-5" />}
                            onClick={() => startGame("riichi")}
                            disabled={!isReady}
                            ></GameCard>
                        </div>
                        {!isReady && (
                            <p className="text-xs text-emerald-300/70">
                                {isHost ? "Need at least 2 players to start." : "Waiting for host…"}
                            </p>
                        )}
                    </section>

                    <p className="text-[11px] text-emerald-300/60">
                        First to join becomes host. If host leaves, next player becomes host automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}

function StatusPill({ status, copy }) {
    const color = status === "offline" ? "bg-rose-500" : "bg-emerald-400";
    return (
        <div className="select-none inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-black/60 px-3 py-1 text-xs text-emerald-300" aria-live="polite">
            <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`}>
                <span className={`absolute inset-0 rounded-full ${color} opacity-50 animate-ping`} />
            </span>
            <PlugZap className="h-3.5 w-3.5" />
            <span className="truncate max-w-[9rem] sm:max-w-[12rem] break-words whitespace-normal" title={copy}>{copy}</span>
        </div>
    );
}

function GameCard({ title, icon, onClick, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group rounded-lg border border-emerald-700/50 bg-black/40 p-3 text-left hover:bg-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-100">
                    <span>{icon}</span>
                    <span className="font-medium">{title}</span>
                </div>
                <span className="text-[11px] text-emerald-300/70">{disabled ? "waiting" : "ready"}</span>
            </div>
        </button>
    );
}
