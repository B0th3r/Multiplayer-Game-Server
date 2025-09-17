import { useEffect, useRef, useState, useCallback } from "react";

export default function OverlayIntro({ onFinish, message }) {
    const [text, setText] = useState("");
    const [done, setDone] = useState(false);
    const intervalRef = useRef(null);
    const full = message ?? "Welcome";

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

    const interact = useCallback(() => {
        if (!done) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setText(full);
            setDone(true);
            return;
        }
        onFinish?.();
    }, [done, full, onFinish]);

    useEffect(() => {
        const key = () => interact();
        window.addEventListener("keydown", key);
        return () => window.removeEventListener("keydown", key);
    }, [interact]);

    return (
        <div
            onClick={interact}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-start pt-20
      bg-gradient-to-b from-black via-green-950 to-black 
      text-green-400 font-mono text-base sm:text-lg md:text-2xl 
      whitespace-pre-wrap cursor-pointer select-none overflow-hidden"
        >
            <MatrixRain />

            {/* Scanline overlay */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40 
        [background:repeating-linear-gradient(0deg,rgba(0,255,0,0.15)_0px,rgba(0,255,0,0.15)_1px,transparent_1px,transparent_3px)]"
            />

            {/* CRT sweep */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute left-0 right-0 h-28 -translate-y-1/3
          bg-[linear-gradient(to_bottom,transparent,rgba(0,255,120,0.45),rgba(0,255,120,0.12),transparent)]
          blur-[6px] will-change-transform animate-crt-sweep"
                />
            </div>

            <h1 className="text-center self-center mx-auto mt-16 mb-6 text-5xl sm:text-6xl font-bold
        text-green-500 drop-shadow-[0_0_8px_rgba(0,255,0,0.75)]">
                BOB'S ARCADE
            </h1>

            <div className="relative px-6 text-center">
                {text}
                {!done && <span className="ml-1 animate-pulse">█</span>}
                {done && (
                    <div className="mt-30 text-lg text-green-500/70 animate-press-key">
                        press any key to start
                    </div>
                )}
            </div>
        </div>
    );
}

function MatrixRain() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();

        const katakana = "アカサタナハマヤラワガザダバパイキシチニヒミリ";
        const numbers = "0123456789";
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const chars = (katakana.repeat(2) + numbers + letters).split("");

        const fontSize = 16;
        const columns = () => Math.floor(canvas.width / fontSize);
        let drops = new Array(columns()).fill(0);
        let raf;

        const draw = () => {
            ctx.fillStyle = "rgba(0,0,0,0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#00ff80";
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                } else {
                    drops[i]++;
                }
            }
            raf = requestAnimationFrame(draw);
        };

        draw();

        const debounce = (fn, ms) => {
            let t;
            return () => {
                clearTimeout(t);
                t = setTimeout(fn, ms);
            };
        };
        const onResize = debounce(() => {
            resize();
            drops = new Array(columns()).fill(0);
        }, 150);

        window.addEventListener("resize", resize);
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 opacity-35" aria-hidden />;
}
