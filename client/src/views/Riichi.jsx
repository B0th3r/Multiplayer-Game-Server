import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../lib/SocketProvider.jsx";
import Tile from "../components/Tile.jsx";
import { PlugZap, RefreshCw, Sword, RectangleVertical, FlagTriangleRight, CheckCircle, XCircle } from "lucide-react";

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
const TILE_NAMES = [
  '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
  '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p',
  '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s',
  'E', 'S', 'W', 'N', 'Wh', 'G', 'R',
];
const NAME_TO_INDEX = new Map(TILE_NAMES.map((n, i) => [n, i]));
const toIndex = (v) => (typeof v === 'number' ? v : (NAME_TO_INDEX.get(v) ?? -1));

export default function RiichiMVP() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, conn, you } = useSocket();

  const [phase, setPhase] = useState("playing");
  const [current, setCurrent] = useState(null);
  const [players, setPlayers] = useState([]);
  const [hands, setHands] = useState([]);
  const [rivers, setRivers] = useState([]);
  const [riichi, setRiichi] = useState([false, false, false, false]);
  const [furiten, setFuriten] = useState([false, false, false, false]);
  const [points, setPoints] = useState([25000, 25000, 25000, 25000]);
  const [dealer, setDealer] = useState("P1");
  const [doraIndicator, setDoraIndicator] = useState(null);
  const [doraActual, setDoraActual] = useState(null);
  const [riichiSticks, setRiichiSticks] = useState(0);
  const [lastDiscard, setLastDiscard] = useState(null);
  const [claim, setClaim] = useState(null);
  const [round, setRound] = useState(1);
  const [last, setLast] = useState(null);
  const [activeSeats, setActiveSeats] = useState([]);
  const [meSeat, setMeSeat] = useState(null);

  useEffect(() => { if (conn === 'connected' && roomId) socket.emit('join', { roomId }); }, [conn, roomId, socket]);
  useEffect(() => {
    const onState = (st) => {
      setPhase(st.phase);
      setCurrent(st.current);
      setPlayers(st.players || []);
      setHands(st.hands || []);
      setRivers(st.rivers || []);
      setRiichi(st.riichi || [false, false, false, false]);
      setFuriten(st.furiten || [false, false, false, false]);
      setPoints(st.points || [25000, 25000, 25000, 25000]);
      setDealer(st.dealer || 'P1');
      setDoraIndicator(st.doraIndicator || null);
      setDoraActual(st.doraActual || null);
      setRiichiSticks(st.riichiSticks || 0);
      setLastDiscard(st.lastDiscard || null);
      setClaim(st.claim || null);
      setRound(st.round || 1);
      setLast(st.last || null);
      setActiveSeats(st.activeSeats ?? (st.players || []).filter(p => p.color?.startsWith('P')).map(p => parseInt(p.color.slice(1), 10) - 1));
      setMeSeat(st.meSeat ?? null);
    };
    const onPhase = ({ phase, roomId: rid }) => { if (phase === "lobby") navigate(`/room/${encodeURIComponent(rid)}`, { replace: true }); };
    socket.on('state', onState);
    socket.on('phase', onPhase);
    return () => { socket.off('state', onState); socket.off('phase', onPhase); };
  }, [socket, navigate]);
  const myLabel = useMemo(() => {
    if (!you?.id) return null;
    return players.find(p => p.id === you.id)?.color ?? null;
  }, [players, you?.id]);
  const seatLabel = (i) => `P${i + 1}`;
  const labelToIndex = (label) => {
    if (typeof label !== "string") return null;
    const m = /^P(\d+)$/.exec(label.trim());
    return m ? Number(m[1]) - 1 : null;
  };
  const displayNameFor = useCallback((seatOrLabel) => {
    const idx = typeof seatOrLabel === "number" ? seatOrLabel : labelToIndex(seatOrLabel);
    if (idx == null || idx < 0) return String(seatOrLabel ?? "");
    const label = seatLabel(idx);

    const p = players.find(x =>
      x?.color === label || x?.seat === idx || x?.seat === label
    );

    const name = p?.name?.trim();
    if (name) return name;
    if (p?.id) return p.id.slice(0, 6);
    return label;
  }, [players]);
  const mySeatIdx = useMemo(() => {
    if (meSeat != null) return meSeat;
    if (!myLabel) return null;
    if (!myLabel.startsWith('P')) return null;
    return parseInt(myLabel.slice(1), 10) - 1;
  }, [meSeat, myLabel]);

  const myTurn = current && myLabel && current === myLabel && phase === 'playing';

  const discard = (index) => socket.emit('action', { type: 'discard', index });
  const riichiAct = () => socket.emit('action', { type: 'riichi' });
  const tsumo = () => socket.emit('action', { type: 'tsumo' });
  const ron = () => socket.emit('action', { type: 'ron' });
  const noRon = () => socket.emit('action', { type: 'no_ron' });
  const nextHand = () => socket.emit('action', { type: 'next_hand' });
  const reset = () => socket.emit('reset');
  const EndGame = () => {
    if (!confirm("Return to lobby?")) return;
    socket.emit("host_end_game", (resp) => { if (!resp?.ok) alert(resp?.code || "Could not end"); });
  };

  return (
    <div className="min-h-screen supports-[height:100svh]:min-h-[100svh] w-full relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(16,185,129,0.06),transparent_60%)]" />

      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-5xl space-y-4 p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-black/60 shadow-[0_0_0_1px_rgba(16,185,129,0.08)_inset,0_10px_40px_-12px_rgba(16,185,129,0.15)] backdrop-blur">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="mt-1 text-2xl font-semibold tracking-wider text-emerald-300 flex items-center gap-2"><RectangleVertical className="h-5 w-5" /> RIICHI (MVP)</h1>
            <div className="flex items-center gap-2">
              <StatusPill conn={conn} text={`WS: ${conn} · Players: ${players.length}`} />
              <button onClick={EndGame} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">End game</button>
              <button onClick={reset} disabled={conn !== "connected"} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10 disabled:opacity-40"><RefreshCw className="h-4 w-4" />Reset</button>
            </div>
          </div>

          {/* Top info */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-700/40 bg-black/40 p-3 text-emerald-100 text-sm">
            <div>
              Turn: <span className="font-semibold">{displayNameFor(current)}</span>
              • Dealer: {dealer}
              • Dora: {doraIndicator ? `${doraIndicator} → ${doraActual}` : '—'}
              • Riichi sticks: {riichiSticks}
            </div>

            <div>Round {round}</div>
          </div>

          {/* Rivers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSeats.map((seatIndex) => (
              <div key={seatIndex} className={`rounded-xl border p-3 ${current === `P${seatIndex + 1}` && phase === 'playing' ? 'border-emerald-400 bg-emerald-600/10' : 'border-emerald-700/40 bg-slate-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-emerald-100 text-sm font-semibold">
                    {displayNameFor(seatIndex)} 
                    <span className="ml-2 text-emerald-300/70">({seatLabel(seatIndex)})</span>
                    {riichi?.[seatIndex] ? ' (Riichi)' : ''} {furiten?.[seatIndex] ? '• Furiten' : ''}
                  </div>

                  <div className="text-xs text-emerald-300/80">Points: {points?.[seatIndex] ?? 0}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(rivers?.[seatIndex] ?? []).map((t, i) => (
                    <Tile
                      key={i}
                      index={toIndex(t)}
                      masked={false}       // public
                      size={40}
                    />
                  ))}

                </div>
              </div>
            ))}
          </div>

          {/* Hands (viewer-private) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSeats.map((seatIndex) => (
              <div key={seatIndex} className="rounded-xl border border-emerald-700/40 bg-slate-800 p-3">
                <div className="text-emerald-100 text-sm font-semibold mb-2">
                  {displayNameFor(seatIndex)} <span className="text-emerald-300/70">({seatLabel(seatIndex)})</span> {seatIndex === mySeatIdx ? '(You)' : ''}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(hands?.[seatIndex] ?? []).map((idx, i) => (
                    <Tile
                      key={i}
                      index={toIndex(idx)}
                      masked={seatIndex !== mySeatIdx}
                      onClick={() => (myTurn && seatIndex === mySeatIdx) ? discard(i) : undefined}
                      size={48}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Claim banner */}
          {phase === 'claim' && (
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/20 p-3 flex items-center justify-between">
              <div className="text-emerald-100 text-sm">
                Claim on discard from {claim?.from}: Eligible → {(claim?.eligible || []).join(', ') || '—'}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={ron} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10"><CheckCircle className="h-4 w-4" />Ron</button>
                <button onClick={noRon} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10"><XCircle className="h-4 w-4" />No Ron</button>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="rounded-xl border border-emerald-700/40 bg-black/40 p-3 flex flex-wrap items-center gap-2">
            <button onClick={riichiAct} disabled={!myTurn} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10"> <FlagTriangleRight className="h-4 w-4" />Riichi</button>
            <button onClick={tsumo} disabled={!myTurn} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10"> <Sword className="h-4 w-4" />Tsumo</button>
            {phase === 'finished' && (
              <button onClick={nextHand} className="inline-flex items-center gap-2 rounded border border-emerald-700/60 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-600/10">Next Hand</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}