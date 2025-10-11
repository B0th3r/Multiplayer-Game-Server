import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";
import OverlayIntro from "../components/OverlayIntro.jsx";
import { RefreshCw, LogIn, Plus, Search, Users, Loader2, PlugZap, Lock, Globe, Dice5 } from "lucide-react";

export default function RoomEntry() {
    const { socket, conn } = useSocket();
    const navigate = useNavigate();
    const [tab, setTab] = useState("browse");
    const [roomId, setRoomId] = useState("test-room");
    const [name, setName] = useState(localStorage.getItem("GamerTag") || "");
    const [showIntro, setShowIntro] = useState(false);

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const pollRef = useRef(null);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        const seen = sessionStorage.getItem("introSeen");
        if (!seen) setShowIntro(true);
    }, []);
    const handleIntroFinish = () => {
        sessionStorage.setItem("introSeen", "1");
        setShowIntro(false);
    };

    useEffect(() => {
        const trimmed = name.trim();
        if (trimmed) localStorage.setItem("GamerTag", trimmed);
    }, [name]);

    const fetchRooms = () => {
        if (!socket || conn !== "connected") return;
        setLoading(true);
        socket.timeout(3000).emit("rooms:list", (err, res) => {
            setLoading(false);
            setRefreshTick(0);
            if (err) {
                setRooms([]);
                return;
            }
            if (res?.ok) setRooms(res.rooms || []);
            else setRooms([]);
        });
    };

    useEffect(() => {
        if (tab !== "browse" || conn !== "connected") return;
        fetchRooms();
        pollRef.current = setInterval(fetchRooms, 10000);
        const tick = setInterval(() => setRefreshTick((s) => Math.min(10, s + 1)), 1000);
        return () => {
            clearInterval(pollRef.current);
            pollRef.current = null;
            clearInterval(tick);
        };
    }, [tab, conn, socket]);

    const sortedRooms = useMemo(() => {
        return [...rooms].sort((a, b) => {
            const rank = (x) => (x?.phase || "").startsWith("playing:") ? 1 : 0;
            const pr = rank(a) - rank(b);
            if (pr !== 0) return pr;
            return (b.playerCount || 0) - (a.playerCount || 0);
        });
    }, [rooms]);

    const filteredRooms = useMemo(() => {
        const q = query.trim().toLowerCase();
        return sortedRooms.filter((r) => {
            const inQuery = !q
                || (r.name || r.id || "").toLowerCase().includes(q)
                || (r.hostName || "").toLowerCase().includes(q);
            const phase = String(r.phase || "lobby");
            const isPlaying = phase.startsWith("playing:");
            const isOpen = !isPlaying;
            const passFilter =
                filter === "all" || (filter === "open" && isOpen) || (filter === "playing" && isPlaying);
            return inQuery && passFilter;
        });
    }, [sortedRooms, query, filter]);

    const goJoin = (rid) => {
        if (!rid) return;
        const trimmed = name.trim();
        if (trimmed) localStorage.setItem("GamerTag", trimmed);
        navigate(`/room/${encodeURIComponent(rid)}?name=${encodeURIComponent(trimmed || "")}`);
    };

    const createLobby = () => {
        if (!roomId) return;
        const trimmed = name.trim();
        if (trimmed) localStorage.setItem("GamerTag", trimmed);
        navigate(`/room/${encodeURIComponent(roomId)}?name=${encodeURIComponent(trimmed || "")}`);
    };

    const searchRef = useRef(null);
    useEffect(() => {
        const onK = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onK);
        return () => window.removeEventListener("keydown", onK);
    }, []);

    const status = conn !== "connected" ? "offline" : loading ? "refreshing" : "online";
    const statusCopy =
        status === "offline"
            ? "WS: offline"
            : status === "refreshing"
                ? "Refreshing…"
                : `Rooms: ${rooms.length}  · next in ${Math.max(0, 10 - refreshTick)}s`;

    const randomRoomId = () => {
        const slug = Math.random().toString(36).slice(2, 8);
        setRoomId(`room-${slug}`);
    };

    return (
        <div className="min-h-[100dvh] w-full relative overflow-hidden">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.06),transparent_60%)]"
            />
            <div className="flex items-center justify-center p-4">
                {showIntro && (
                    <OverlayIntro onFinish={handleIntroFinish} message="Welcome to the Bother Arcade" />
                )}

                <div className="max-w-3xl space-y-6 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/50 shadow-[0_0_0_1px_rgba(16,185,129,0.08)_inset,0_10px_40px_-12px_rgba(16,185,129,0.15)] backdrop-blur">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-wider flex items-center gap-2">
                                <span className="text-emerald-400">&gt;</span>
                                <span className="text-emerald-300">JOIN</span>
                                <span className="opacity-80">PORTAL</span>
                            </h1>
                            <p className="text-xs text-emerald-300/70 mt-1">
                                Name saves automatically · <kbd className="px-1 py-0.5 border border-emerald-500/40 rounded">Ctrl</kbd>
                                <span>+</span>
                                <kbd className="px-1 py-0.5 border border-emerald-500/40 rounded">K</kbd> to search
                            </p>
                        </div>
                        <StatusPill status={status} copy={statusCopy} />
                    </div>

                    <label className="block text-sm">
                        DISPLAY NAME
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && tab === "create") createLobby();
                            }}
                            placeholder="Your name"
                            className="mt-1 w-full bg-black text-emerald-100 placeholder-emerald-600/70 border border-emerald-700/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                        />
                    </label>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 border-b border-emerald-800/30 pb-2">
                        <TabButton active={tab === "browse"} onClick={() => setTab("browse")}>Browse Lobbies</TabButton>
                        <TabButton active={tab === "create"} onClick={() => setTab("create")}>Create Lobby</TabButton>
                        {tab === "browse" && (
                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={fetchRooms}
                                    disabled={conn !== "connected"}
                                    className="inline-flex items-center gap-2 px-2.5 py-1 text-xs rounded border border-emerald-600/70 text-emerald-200 hover:bg-emerald-600/10 disabled:opacity-40"
                                >
                                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                                    Refresh
                                </button>
                            </div>
                        )}
                    </div>
                    {tab === "create" ? (
                        <div className="space-y-4">
                            <label className="block text-sm">
                                LOBBY NAME / ID
                                <div className="mt-1 flex items-center gap-2">
                                    <input
                                        value={roomId}
                                        onChange={(e) => setRoomId(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && createLobby()}
                                        placeholder="e.g. connect4-room-1"
                                        className="flex-1 bg-black text-emerald-100 placeholder-emerald-600/70 border border-emerald-700/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Random room id"
                                        onClick={randomRoomId}
                                        className="inline-flex items-center justify-center rounded border border-emerald-700/60 p-2 hover:bg-emerald-600/10"
                                    >
                                        <Dice5 className="h-4 w-4" />
                                    </button>
                                </div>
                            </label>

                            <button
                                onClick={createLobby}
                                disabled={!roomId}
                                className="w-full inline-flex items-center justify-center gap-2 border border-emerald-600/70 text-emerald-100 px-3 py-2 text-sm rounded hover:bg-emerald-600/10 active:translate-y-[1px] disabled:opacity-40"
                                aria-label="Create lobby"
                            >
                                <Plus className="h-4 w-4" /> [ CREATE LOBBY ]
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Search */}
                            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/70" />
                                    <input
                                        ref={searchRef}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search by lobby or host…"
                                        className="w-full pl-8 pr-3 py-2 bg-black text-emerald-100 placeholder-emerald-600/70 border border-emerald-700/50 text-sm rounded focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    />
                                </div>
                                <div className="flex items-center gap-1">
                                    <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All</FilterChip>
                                    <FilterChip active={filter === "open"} onClick={() => setFilter("open")}>Open</FilterChip>
                                    <FilterChip active={filter === "playing"} onClick={() => setFilter("playing")}>
                                        In-Game
                                    </FilterChip>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {!loading && filteredRooms.length === 0 && (
                                    <EmptyState />
                                )}

                                {(loading ? Array.from({ length: 4 }).map((_, i) => ({ _skeleton: i })) : filteredRooms).map((r, idx) => (
                                    <div key={r._skeleton ? `s-${idx}` : `room-${r.id}`} className="rounded-xl border border-emerald-700/40 bg-black/40 p-3 flex flex-col gap-2">
                                        {r._skeleton ? (
                                            <SkeletonCard />
                                        ) : (
                                            <RoomCard r={r} onJoin={goJoin} name={name} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* manual join */}
                            <div className="pt-2 border-t border-emerald-800/30">
                                <label className="block text-sm">
                                    JOIN BY ID
                                    <div className="mt-1 flex items-center gap-2">
                                        <input
                                            value={roomId}
                                            onChange={(e) => setRoomId(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && goJoin(roomId)}
                                            placeholder="paste a lobby ID"
                                            className="flex-1 bg-black text-emerald-100 placeholder-emerald-600/70 border border-emerald-700/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
                                        />
                                        <button
                                            onClick={() => goJoin(roomId)}
                                            disabled={!roomId}
                                            className="inline-flex items-center justify-center gap-2 border border-emerald-600/70 text-emerald-100 px-3 py-2 text-sm rounded hover:bg-emerald-600/10 active:translate-y-[1px] disabled:opacity-40"
                                        >
                                            <LogIn className="h-4 w-4" /> Join
                                        </button>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusPill({ status, copy }) {
    const color =
        status === "offline" ? "bg-rose-500" : status === "refreshing" ? "bg-amber-400" : "bg-emerald-400";
    return (
        <div
            className="select-none inline-flex items-center gap-2 rounded-full border border-emerald-700/40 bg-black/60 px-3 py-1 text-xs text-emerald-300"
            aria-live="polite"
        >
            <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`}>
                <span className={`absolute inset-0 rounded-full ${color} opacity-50 animate-ping`} />
            </span>
            <PlugZap className="h-3.5 w-3.5" />
            <span className="truncate max-w-[12rem] break-words whitespace-normal" title={copy}>
                {copy}
            </span>
        </div>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            className={`relative px-3 py-1.5 text-sm rounded border transition-colors ${active
                    ? "border-emerald-500 text-emerald-300"
                    : "border-emerald-700/40 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-500/60"
                }`}
            onClick={onClick}
        >
            {children}
            {active && <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 h-[2px] w-10 bg-emerald-400" />}
        </button>
    );
}

function FilterChip({ active, onClick, children }) {
    return (
        <button
            className={`px-2.5 py-1 text-xs rounded-full border ${active
                    ? "border-emerald-500 text-emerald-300 bg-emerald-500/10"
                    : "border-emerald-700/40 text-emerald-400/80 hover:text-emerald-300 hover:border-emerald-500/60"
                }`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse space-y-2">
            <div className="h-4 bg-emerald-900/30 rounded w-2/3" />
            <div className="h-3 bg-emerald-900/20 rounded w-1/2" />
            <div className="h-3 bg-emerald-900/10 rounded w-1/3" />
            <div className="h-8 bg-emerald-900/20 rounded" />
        </div>
    );
}

function RoomCard({ r, onJoin, name }) {
    const phase = String(r.phase || "lobby");
    const isPlaying = phase.startsWith("playing:");
    const players = r.playerCount ?? 0;
    const cap = r.maxPlayers ?? Math.max(2, players);
    const pct = Math.max(0, Math.min(100, (players / cap) * 100));
    const isLocked = r.locked || r.private || r.isPrivate;


    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <div className="truncate">
                    <div className="font-semibold text-emerald-300 truncate flex items-center gap-1.5">
                        {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                        <span className="truncate" title={r.name || r.id}>{r.name || r.id}</span>
                    </div>
                    <div className="text-xs text-emerald-400/80 truncate">Host: {r.hostName || "—"}</div>
                </div>
                <div className="text-xs px-2 py-1 rounded border border-emerald-700/60 text-emerald-300 whitespace-nowrap inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {players}/{cap}
                </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-400/80">
                <Badge tone={isPlaying ? "amber" : "emerald"}>{phase}</Badge>
                <div className="flex-1 h-1.5 bg-emerald-900/30 rounded ml-3 overflow-hidden">
                    <div
                        className="h-full bg-emerald-400/80"
                        style={{ width: `${pct}%` }}
                        aria-hidden
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
                <button
                    onClick={() => onJoin(r.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 border border-emerald-600/70 text-emerald-100 px-3 py-2 text-sm rounded hover:bg-emerald-600/10 active:translate-y-[1px]"
                >
                    <LogIn className="h-4 w-4" /> [ JOIN ]
                </button>
            </div>
        </div>
    );
}

function Badge({ children, tone = "emerald" }) {
    const map = {
        emerald: "text-emerald-300 border-emerald-700/60 bg-emerald-500/5",
        amber: "text-amber-200 border-amber-500/40 bg-amber-500/5",
    };
    return (
        <span className={`inline-flex items-center gap-1 uppercase tracking-wide px-2 py-0.5 rounded border ${map[tone] || map.emerald
            }`}
        >
            {children}
        </span>
    );
}

function EmptyState() {
    return (
        <div className="col-span-full text-emerald-300/80 text-sm border border-dashed border-emerald-700/50 rounded p-5 flex items-center justify-between gap-4">
            <div>
                <div className="font-medium">No active lobbies right now.</div>
                <div className="opacity-80">Create one, or try adjusting filters.</div>
            </div>
            <div className="shrink-0">
                <Loader2 className="h-5 w-5 animate-spin opacity-70" />
            </div>
        </div>
    );
}
