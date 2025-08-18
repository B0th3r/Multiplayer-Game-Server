import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const Ctx = createContext(null);

export function SocketProvider({ children }) {
    const [socket] = useState(() => io(import.meta.env.VITE_WS_URL || "http://localhost:4000", { autoConnect: true }));
    const [conn, setConn] = useState(socket.connected ? "connected" : "disconnected");
    const [you, setYou] = useState(null);

    useEffect(() => {
        const onConnect = () => setConn("connected");
        const onDisconnect = () => { setConn("disconnected"); setYou(null); };
        const onYou = (payload) => setYou(payload);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("you", onYou);
        return () => { socket.off("connect", onConnect); socket.off("disconnect", onDisconnect); socket.off("you", onYou); };
    }, [socket]);

    const value = useMemo(() => ({ socket, conn, you }), [socket, conn, you]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSocket = () => useContext(Ctx);
