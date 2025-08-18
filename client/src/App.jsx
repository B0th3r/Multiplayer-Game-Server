import { Routes, Route, Navigate } from "react-router-dom";
import RoomEntry from "./views/RoomEntry.jsx";
import Lobby from "./views/Lobby.jsx";
import ConnectFour from "./views/ConnectFour.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<RoomEntry />} />
            <Route path="/room/:roomId" element={<Lobby />} />
            <Route path="/connect4/:roomId" element={<ConnectFour />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
