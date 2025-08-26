import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OverlayIntro from "../components/OverlayIntro.jsx";

export default function RoomEntry() {
    const [roomId, setRoomId] = useState("test-room");
    const [name, setName] = useState("");
    const [showIntro, setShowIntro] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const seen = sessionStorage.getItem("introSeen");
        if (!seen) setShowIntro(true);
    }, []);

    const handleIntroFinish = () => {
        sessionStorage.setItem("introSeen", "1");
        setShowIntro(false);
    };

    return (
        <div className="flex items-center justify-center">
            {showIntro && (
                <OverlayIntro
                    onFinish={handleIntroFinish}
                    message={`Welcome, Player.\nMultiplayer session detected.\nPRESS START_`}
                />
            )}

            <div className="w-full max-w-md space-y-4 p-6 sm:p-8 rounded-xl border border-green-700/40 bg-black/40">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-wider">
                    &gt; ENTER <span className="text-green-500">ROOM ID</span> TO CONNECT
                </h1>

                <label className="block text-sm">
                    ROOM ID
                    <input
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="e.g. connect4-room-1"
                        className="mt-1 w-full bg-black text-green-200 placeholder-green-600/70 border border-green-700/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 rounded"
                    />
                </label>

                <label className="block text-sm">
                    NAME (OPTIONAL)
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name (optional)"
                        className="mt-1 w-full bg-black text-green-200 placeholder-green-600/70 border border-green-700/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 rounded"
                    />
                </label>

                <button
                    onClick={() =>
                        navigate(
                            `/room/${encodeURIComponent(roomId)}?name=${encodeURIComponent(
                                name
                            )}`
                        )
                    }
                    disabled={!roomId}
                    className="w-full inline-flex items-center justify-center gap-2 border border-green-600/70 text-green-200 px-3 py-2 text-sm rounded hover:bg-green-600/10 active:translate-y-[1px] disabled:opacity-40"
                    aria-label="Connect to lobby"
                >
                    [ CONNECT ]
                </button>

            </div>
        </div>
    );
}
