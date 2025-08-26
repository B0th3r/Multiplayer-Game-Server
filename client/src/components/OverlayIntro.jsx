import { useEffect, useRef, useState } from "react";

export default function OverlayIntro({ onFinish, message }) {
    const [text, setText] = useState("");
    const [done, setDone] = useState(false);
    const intervalRef = useRef(null);
    const full = message ?? `Welcome, Player.\nMultiplayer session detected.\nPRESS START_`;

    useEffect(() => {
        let i = 0;
        intervalRef.current = setInterval(() => {
            i += 1;
            setText(full.slice(0, i));
            if (i >= full.length) {
                clearInterval(intervalRef.current);
                setDone(true);
            }
        }, 45);
        return () => clearInterval(intervalRef.current);
    }, [full]);

    const interact = () => {
        if (!done) {
            // fast-forward
            if (intervalRef.current) clearInterval(intervalRef.current);
            setText(full);
            setDone(true);
            return;
        }
        onFinish?.();
    };

    useEffect(() => {
        const key = () => interact();
        window.addEventListener("keydown", key);
        return () => window.removeEventListener("keydown", key);
    }, []);


    return (
        <div
            onClick={interact}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-green-400 font-mono text-base sm:text-lg md:text-2xl whitespace-pre-wrap cursor-pointer select-none"
        >
            <div className="pointer-events-none absolute inset-0 opacity-15 [background:repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_3px)]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            <div className="relative px-6">
                <div>
                    {text}
                    {!done && <span className="ml-1 animate-pulse">█</span>}
                </div>
                {done && (
                    <div className="mt-4 text-xs sm:text-sm text-green-500/70">
                        (click or press any key)
                    </div>
                )}
            </div>
        </div>
    );
}
