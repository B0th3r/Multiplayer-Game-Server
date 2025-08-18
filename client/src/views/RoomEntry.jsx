import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoomEntry() {
  const [roomId, setRoomId] = useState("test-room");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Enter a Room</h1>

        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room ID"
          className="w-full rounded-xl border px-3 py-2 text-sm"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-xl border px-3 py-2 text-sm"
        />

        <button
          onClick={() => navigate(`/room/${encodeURIComponent(roomId)}?name=${encodeURIComponent(name)}`)}
          disabled={!roomId}
          className="rounded-xl border px-3 py-2 text-sm hover:bg-white disabled:opacity-40"
        >
          Go to Lobby
        </button>
      </div>
    </div>
  );
}
