import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";
import { PlugZap, RefreshCw, Brain, ArrowRightCircle } from "lucide-react";

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

function Card({ c, onFlip, canFlip }) {
  const faceUp = c.revealed || c.matched;
  return (
    <button
      onClick={() => canFlip && onFlip(c.idx)}
      disabled={!canFlip || c.matched || (faceUp && !c.revealed)}
      className={`aspect-[5/7] w-full rounded-xl border text-xl md:text-2xl flex items-center justify-center select-none transition-transform active:scale-95
        ${faceUp ? "bg-white border-slate-300 text-slate-900" : "bg-slate-800 border-slate-600 text-slate-300"}`}
    >
      {faceUp ? (c.val || "") : ""}
    </button>
  );
}

export default function Memory() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, conn, you } = useSocket();

  const [phase, setPhase] = useState("playing");
  const [current, setCurrent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [board, setBoard] = useState([]);
  const [scores, setScores] = useState([]);
  const [remainingPairs, setRemainingPairs] = useState(0);
  const [round, setRound] = useState(1);
  const [last, setLast] = useState(null);
  const [autoNextAt, setAutoNextAt] = useState(null);
  const [now, setNow] = useState(Date.now());
  const autoNextTimeoutRef = useRef(null);
  const tickRef = useRef(null);

  const secsLeft = useMemo(() => {
    if (!autoNextAt) return 0;
    const ms = Math.max(0, autoNextAt - now);
    return Math.ceil(ms / 1000);
  }, [autoNextAt, now]);

  useEffect(() => { if (conn === "connected" && roomId) socket.emit("join", { roomId }); }, [conn, roomId, socket]);

  useEffect(() => {
    const onState = (st) => {
      setPhase(st.phase);
      setCurrent(st.current);
      setPlayers(st.players || []);
      setBoard(st.board || []);
      setScores(st.scores || []);
      setRemainingPairs(st.remainingPairs ?? 0);
      setRound(st.round || 1);
      setLast(st.last || null);
      if (st.phase === "reveal") {
        const deadline = Date.now() + 3000;
        setAutoNextAt(deadline);
        setNow(Date.now());
      } else {
        setAutoNextAt(null);
      }
    };
    const onPhase = ({ phase, roomId: rid }) => { if (phase === "lobby") navigate(`/room/${encodeURIComponent(rid)}`, { replace: true }); };
    socket.on("state", onState);
    socket.on("phase", onPhase);
    return () => { socket.off("state", onState); socket.off("phase", onPhase); };
  }, [socket, navigate]);

  // Countdown ticker while in reveal
  useEffect(() => {
    if (!autoNextAt) return;
    tickRef.current && clearInterval(tickRef.current);
    tickRef.current = setInterval(() => setNow(Date.now()), 200);
    return () => { tickRef.current && clearInterval(tickRef.current); tickRef.current = null; };
  }, [autoNextAt]);

  useEffect(() => {
    if (!autoNextAt) return;
    const delay = Math.max(0, autoNextAt - Date.now());
    autoNextTimeoutRef.current && clearTimeout(autoNextTimeoutRef.current);
    autoNextTimeoutRef.current = setTimeout(() => {
      socket.emit("action", { type: "next" });
      setAutoNextAt(null);
    }, delay);
    return () => {
      autoNextTimeoutRef.current && clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    };
  }, [autoNextAt, socket]);
  const displayNameForSeat = useCallback((label) => {
    const p = players.find(x => x?.seat === label);
    const name = p?.name?.trim();
    if (name) return name;
    if (p?.id) return p.id.slice(0, 6);
    return label;
  }, [players]);
  const myLabel = useMemo(() => {
    if (!you?.id) return null;
    return players.find(p => p.id === you.id)?.seat ?? null; 
  }, [players, you?.id]);

  const mySeatIdx = useMemo(() => {
    if (!myLabel) return null;
    if (!myLabel.startsWith("P")) return null;
    return parseInt(myLabel.slice(1), 10) - 1;
  }, [myLabel]);

  const myTurn = current && myLabel && current === myLabel && phase === "playing";

  const flip = (idx) => socket.emit("action", { type: "flip", idx });

  const next = () => {
    // Manual continue cancels auto
    if (autoNextTimeoutRef.current) { clearTimeout(autoNextTimeoutRef.current); autoNextTimeoutRef.current = null; }
    setAutoNextAt(null);
    socket.emit("action", { type: "next" });
  };

  const newGame = () => socket.emit("action", { type: "new_game" });
  const reset = () => socket.emit("reset");

  const endGame = () => {
    if (!confirm("Return to lobby?")) return;
    socket.emit("host_end_game", (resp) => { if (!resp?.ok) alert(resp?.code || "Could not end"); });
  };

  const cols = useMemo(() => {
    const n = board?.length || 16;
    if (n % 6 === 0) return 6;
    if (n % 5 === 0) return 5;
    if (n % 4 === 0) return 4;
    return Math.ceil(Math.sqrt(n));
  }, [board]);

  return (
    <div className="min-h-screen supports-[height:100svh]:min-h-[100svh] w-full relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.06),transparent_60%)]" />

      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-4 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/60 shadow-[0_0_0_1px_rgba(16,185,129,0.08)_inset,0_10px_40px_-12px_rgba(16,185,129,0.15)] backdrop-blur">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="mt-1 text-2xl font-semibold tracking-wider text-emerald-300 flex items-center gap-2"><Brain className="h-5 w-5" /> MEMORY</h1>
            <div className="flex items-center gap-2">
              <StatusPill conn={conn} text={`WS: ${conn} · Players: ${players.length}`} />
              <button onClick={endGame} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">End game</button>
              <button onClick={reset} disabled={conn !== "connected"} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10 disabled:opacity-40"><RefreshCw className="h-4 w-4" />Reset</button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-700/40 bg-black/40 p-3">
            <div className="text-emerald-100 text-sm">
              {phase === "playing" && (<>Turn: <span className="font-semibold">{displayNameForSeat(current)}</span>. Flip two cards.</>)}
              {phase === "reveal" && (
                <>Review the pair, then continue.{" "}
                  {autoNextAt && <span className="opacity-80">Auto-continue in {secsLeft}s…</span>}
                </>
              )}
              {phase === "finished" && (<>All pairs found. Start a new game when ready.</>)}
            </div>
            <div className="text-[11px] text-emerald-300/70 truncate">Pairs left: {remainingPairs} • Round {round}</div>
          </div>

          {/* Scoreboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(players?.length ? players.map(p => p.seat)
              : Array.from({ length: Math.max(4, scores?.length || 0) }, (_, i) => `P${i + 1}`))
              .map((label) => {
                const i = Math.max(0, parseInt(label.slice(1), 10) - 1);
                return (
                  <div
                    key={label}
                    className={`rounded-xl border p-2 ${current === label && phase === 'playing'
                        ? 'border-emerald-400 bg-emerald-600/10'
                        : 'border-emerald-700/40 bg-slate-800'
                      }`}
                  >
                    <div className="text-emerald-100 text-sm font-semibold">
                      {displayNameForSeat(label)}
                    </div>
                    <div className="text-xs text-emerald-300/80">
                      Score: {scores?.[i] ?? 0}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Board */}
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {board?.map((c) => (
              <Card key={c.idx} c={c} onFlip={(idx) => flip(idx)} canFlip={myTurn && phase === 'playing'} />
            ))}
          </div>

          {/* Controls */}
          <div className="rounded-xl border border-emerald-700/40 bg-black/40 p-3 flex flex-wrap items-center gap-2">
            {phase === "reveal" && (
              <button onClick={next} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">
                Continue <ArrowRightCircle className="h-4 w-4" />
              </button>
            )}
            {phase === "finished" && (
              <button onClick={newGame} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">
                New Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
