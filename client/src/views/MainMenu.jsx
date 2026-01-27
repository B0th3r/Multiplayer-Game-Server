import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OverlayIntro from "../components/OverlayIntro.jsx";
import {
  Gamepad2,
  Users,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Swords,
} from "lucide-react";
export default function Landing() {
  const navigate = useNavigate();

  const [showIntro, setShowIntro] = useState(false);

  const [armed, setArmed] = useState(false);


  const trimmed = useMemo(() => name.trim(), [name]);

  useEffect(() => {
    const seen = sessionStorage.getItem("introSeen");
    if (!seen) setShowIntro(true);
    else setArmed(true);
  }, []);

  const handleIntroFinish = () => {
    sessionStorage.setItem("introSeen", "1");
    setShowIntro(false);
    setArmed(true);
  };

  const persistName = () => {
    if (trimmed) localStorage.setItem("GamerTag", trimmed);
  };

  const goSingle = () => {
    persistName();
    navigate(`/single?name=${encodeURIComponent(trimmed || "")}`);
  };

  const goMulti = () => {
    persistName();
    navigate(`/multi?name=${encodeURIComponent(trimmed || "")}`);
  };

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-black">
      {/* atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.30),transparent_60%),radial-gradient(circle_at_bottom,rgba(6,95,70,0.22),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(120deg,#fff_1px,transparent_1px),linear-gradient(0deg,#fff_1px,transparent_1px)] bg-[length:180px_180px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-[radial-gradient(circle,rgba(16,185,129,0.35),transparent_60%)]"
      />

      {showIntro && (
        <OverlayIntro
          onFinish={handleIntroFinish}
          message="Welcome to the Bother Arcade"
        />
      )}

      <div className="relative z-10 flex items-center justify-center px-4 py-10">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-black/40 px-4 py-1 text-xs text-emerald-100/70 mx-auto">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            BOTHER ARCADE
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-emerald-50 drop-shadow-sm">
              {"Step into the case."}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/60">
              Choose your mode.
            </p>
          </div>

          {!armed ? (
            <div className="grid place-items-center pt-6">
              <button
                onClick={() => setArmed(true)}
                className="group relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-black/50 px-7 py-4 text-emerald-50 hover:bg-emerald-500/10 transition active:translate-y-[1px]"
              >
                <span className="relative z-10 inline-flex items-center gap-2 font-semibold tracking-wide">
                  <Swords className="h-5 w-5 text-emerald-200" />
                  PRESS START
                  <ChevronRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition" />
                </span>
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle,rgba(16,185,129,0.25),transparent_60%)] transition" />
              </button>

              <div className="mt-3 text-[11px] text-emerald-100/35">
                Tip: Press <span className="text-emerald-100/60">Enter</span>{" "}
                to start · Press <span className="text-emerald-100/60">Esc</span>{" "}
                for intro
              </div>
            </div>
          ) : (
            <>
             
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Single Player*/}
                <button
                  onClick={goSingle}
                  className="group relative overflow-hidden rounded-2xl border border-emerald-400/50 bg-emerald-500/5 p-5 text-left hover:bg-emerald-500/10 transition active:translate-y-[1px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-emerald-400/15 border border-emerald-400/50 flex items-center justify-center">
                        <Gamepad2 className="h-5 w-5 text-emerald-100" />
                      </div>
                      <div>
                        <div className="text-base font-semibold text-emerald-50 tracking-wide">
                          Single Player
                        </div>
                        <div className="text-xs text-emerald-100/55">
                          Story mode · Voice acting · Branching outcomes
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/25 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-100/80">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      BETA
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-emerald-100/60">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
                      Full story mode
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
                      Multiple endings
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
                      Voice acting
                    </li>
                  </ul>

                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-50">
                    Enter Story Mode
                    <ChevronRight className="h-4 w-4 opacity-80 group-hover:translate-x-0.5 transition" />
                  </div>

                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_55%)] transition" />
                </button>
                {/* Multiplayer */}
                <button
                  onClick={goMulti}
                  className="group relative overflow-hidden rounded-2xl border border-emerald-200/40 bg-black/40 p-5 text-left hover:bg-emerald-500/10 transition active:translate-y-[1px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-emerald-400/10 border border-emerald-200/40 flex items-center justify-center">
                        <Users className="h-5 w-5 text-emerald-50" />
                      </div>
                      <div>
                        <div className="text-base font-semibold text-emerald-50 tracking-wide">
                          Multiplayer
                        </div>

                      </div>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-emerald-100/60">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
                      Browse lobbies and jump in with friends
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
                      Quick matches
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
                      Play classic games
                    </li>
                  </ul>

                  <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-emerald-50">
                    Enter Multiplayer
                    <ChevronRight className="h-4 w-4 opacity-80 group-hover:translate-x-0.5 transition" />
                  </div>

                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle,rgba(16,185,129,0.20),transparent_60%)] transition" />
                </button>

              </div>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 z-10 px-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between text-[10px] text-emerald-100/35">
          <span>© Bother Arcade</span>
        </div>
      </div>
    </div>
  );
}
