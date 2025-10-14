import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";
import { PlugZap, RefreshCw, HandMetal, DollarSign, ChevronRight, Hourglass } from "lucide-react";

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

function Card({ c }) {
    if (!c) return null;
    if (c.hidden) return <div className="w-10 h-14 md:w-12 md:h-16 rounded border border-slate-600 bg-slate-800" />;
    const red = c.s === "♥" || c.s === "♦";
    return (
        <div className={`w-10 h-14 md:w-12 md:h-16 rounded border bg-white flex items-center justify-center ${red ? "border-rose-300 text-rose-600" : "border-slate-300 text-slate-800"}`}>
            <span className="text-sm md:text-base font-semibold">{c.r}{c.s}</span>
        </div>
    );
}

function Stack({ hand }) {
    return (
        <div className="flex items-center gap-2">
            {hand?.map((c, i) => <Card key={i} c={c} />)}
        </div>
    );
}

export default function Blackjack() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { socket, conn, you } = useSocket();

    const [phase, setPhase] = useState("betting");
    const [current, setCurrent] = useState(null);
    const [players, setPlayers] = useState([]);
    const [seats, setSeats] = useState([]);
    const [dealer, setDealer] = useState({ hand: [] });
    const [round, setRound] = useState(1);
    const [last, setLast] = useState(null);
    const [revealEndsAt, setRevealEndsAt] = useState(null);
    const [now, setNow] = useState(Date.now());
    const secsLeft = useMemo(() => {
        if (!revealEndsAt) return 0;
        const ms = Math.max(0, revealEndsAt - now);
        return Math.ceil(ms / 1000);
    }, [revealEndsAt, now]);
    const canNext = phase === "reveal" ? (revealEndsAt ? Date.now() >= revealEndsAt : true) : false;

    const [betAmt, setBetAmt] = useState(10);

    useEffect(() => { if (conn === "connected" && roomId)
         socket.emit("join", { roomId });
        }, [conn, roomId, socket]);

    useEffect(() => {
        const onState = (st) => {
            setPhase(st.phase);
            setCurrent(st.current);
            setPlayers(st.players || []);
            setSeats(st.seats || []);
            setDealer(st.dealer || { hand: [] });
            setRound(st.round || 1);
            setLast(st.last || null);
            setRevealEndsAt(st.revealEndsAt || null);
            if (st.phase === "reveal") setNow(Date.now());
        };
        const onPhase = ({ phase, roomId: rid }) => { if (phase === "lobby") navigate(`/room/${encodeURIComponent(rid)}`, { replace: true }); };
        socket.on("state", onState);
        socket.on("phase", onPhase);
        return () => { socket.off("state", onState); socket.off("phase", onPhase); };
    }, [socket, navigate]);

    useEffect(() => {
        if (phase !== "reveal") return;
        const id = setInterval(() => setNow(Date.now()), 200);
        return () => clearInterval(id);
    }, [phase]);

    const myLabel = useMemo(() => {
        if (!you?.id) return null;
        return players.find(p => p.id === you.id)?.seat ?? null;
    }, [players, you?.id]);

    const mySeatIdx = useMemo(() => {
        if (!myLabel) return null;
        if (!myLabel.startsWith("P")) return null;
        return parseInt(myLabel.slice(1), 10) - 1;
    }, [myLabel]);

    const me = mySeatIdx != null ? seats?.[mySeatIdx] : null;
    const myTurn = current && myLabel && current === myLabel && phase === "acting" && me && !me.done;

    const placeBet = () => 
        { if (conn === "connected") 
            socket.emit("action", { type: "bet", amount: betAmt });
        };
    const startDeal = () => socket.emit("action", { type: "deal" });
    const hit = () => socket.emit("action", { type: "hit" });
    const stand = () => socket.emit("action", { type: "stand" });
    const dbl = () => socket.emit("action", { type: "double" });
    const nextRound = () => socket.emit("action", { type: "next_round" });
    const reset = () => socket.emit("reset");

    const endGame = () => {
        if (!confirm("Return to lobby?")) return;
        socket.emit("host_end_game", (resp) => { if (!resp?.ok) alert(resp?.code || "Could not end"); });
    };

    const shareText = `Room: ${roomId} • You: ${myLabel || "—"} • Round ${round}`;

    return (
        <div className="min-h-screen supports-[height:100svh]:min-h-[100svh] w-full relative overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.06),transparent_60%)]" />

            <div className="flex items-center justify-center p-4">
                <div className="w-full max-w-4xl space-y-4 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/60 shadow-[0_0_0_1px_rgba(16,185,129,0.08)_inset,0_10px_40px_-12px_rgba(16,185,129,0.15)] backdrop-blur">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="mt-1 text-2xl font-semibold tracking-wider text-emerald-300 flex items-center gap-2"><HandMetal className="h-5 w-5" /> BLACKJACK</h1>
                        <div className="flex items-center gap-2">
                            <StatusPill conn={conn} text={`WS: ${conn} · Players: ${players.length}`} />
                            <button onClick={endGame} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">End game</button>
                            <button onClick={reset} disabled={conn !== "connected"} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10 disabled:opacity-40"><RefreshCw className="h-4 w-4" />Reset</button>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-700/40 bg-black/40 p-3">
                        <div className="text-emerald-100 text-sm">
                            {phase === "betting" && (<>Place bets to start the round.</>)}
                            {phase === "acting" && (<>Turn: <span className="font-semibold">{current}</span></>)}
                            {phase === "reveal" && (
                                <span className="inline-flex items-center gap-2">
                                    <Hourglass className="h-4 w-4" />
                                    Revealing results… {secsLeft > 0 ? <span className="opacity-80">(Next in {secsLeft}s)</span> : <span className="opacity-80">(Ready)</span>}
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-emerald-300/70 truncate" title={shareText}>{shareText}</div>
                    </div>

                    {/* Dealer */}
                    <div className="rounded-xl border border-emerald-700/40 bg-slate-800 p-4">
                        <div className="text-emerald-200 text-sm mb-2">Dealer</div>
                        <div className="flex items-center justify-between">
                            <Stack hand={dealer?.hand || []} />
                            {dealer?.value != null && (
                                <div className="text-emerald-200 text-sm">Value: {dealer.value}</div>
                            )}
                        </div>
                    </div>

                    {/* Seats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {seats?.map((s, i) => (
                            <div key={i} className={`rounded-xl border p-3 ${current === `P${i + 1}` && phase === 'acting' ? 'border-emerald-400 bg-emerald-600/10' : 'border-emerald-700/40 bg-slate-800'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-emerald-100 text-sm font-semibold">P{i + 1}</div>
                                    <div className="text-xs text-emerald-300/80">Chips: {s?.chips ?? 0}</div>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs text-emerald-200">Bet: {s?.bet ?? 0}</div>
                                    <div className="text-xs text-emerald-200">{s?.bust ? 'BUST' : `Value: ${s?.value ?? '-'}`}</div>
                                </div>
                                <Stack hand={s?.hand || []} />
                            </div>
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="rounded-xl border border-emerald-700/40 bg-black/40 p-3 space-y-3">
                        {phase === "betting" && (
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded border border-emerald-700/60 bg-black/40 px-3 py-2 text-xs text-emerald-200">
                                    <DollarSign className="h-4 w-4" />
                                    <input type="number" min={1} step={1} value={betAmt} onChange={e => setBetAmt(parseInt(e.target.value || "0", 10))} className="w-20 bg-transparent outline-none" />
                                </div>
                                <button onClick={placeBet} disabled={!myLabel || conn !== "connected"} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">
                                    Place Bet
                                </button>
                                <button onClick={startDeal} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">
                                    Start Deal <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {phase === "acting" && (
                            <div className="flex flex-wrap items-center gap-2">
                                <button onClick={hit} disabled={!myTurn} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">
                                    Hit
                                </button>
                                <button onClick={stand} disabled={!myTurn} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">
                                    Stand
                                </button>
                                <button onClick={dbl} disabled={!myTurn || !me || me.hand?.length !== 2 || (me?.chips ?? 0) < (me?.bet ?? 0)} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">
                                    Double
                                </button>
                            </div>
                        )}

                        {phase === "reveal" && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={nextRound}
                                    disabled={!canNext}
                                    className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10 disabled:opacity-40"
                                    title={canNext ? "Start next round" : "Waiting for reveal timer"}
                                >
                                    Next Round
                                </button>
                                {!canNext && (
                                    <span className="text-xs text-emerald-300/80">Available in {secsLeft}s…</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
