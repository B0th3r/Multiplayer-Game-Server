import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import RoomEntry from "./views/RoomEntry.jsx";
import Lobby from "./views/Lobby.jsx";
import ConnectFour from "./views/ConnectFour.jsx";
import TicTacToe from "./views/TicTacToe.jsx";
import Battleship from "./views/Battleship.jsx";

function AppShell() {
    return (
        <div className="min-h-screen flex flex-col bg-black text-green-300 font-mono selection:bg-green-600/20">
            <header className="sticky top-0 z-50 px-4 py-3 border-b border-green-700/30 bg-black/80 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <span className="tracking-wider animate-pulse">PORTFOLIO ARCADE</span>
                    <span className="text-xs text-green-500/70">v1.0</span>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto p-4 sm:p-6">
                <Outlet />
            </main>

            <footer className="sticky bottom-0 z-50 px-4 py-2 border-t border-green-700/30 bg-black/80 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between text-xs">
                    <span className="text-green-500/70">© 2025 Your Name</span>
                    <span className="tracking-widest">[PRESS START]</span>
                </div>
            </footer>
        </div>
    );
}

export default function App() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path="/" element={<RoomEntry />} />
                <Route path="/room/:roomId" element={<Lobby />} />
                <Route path="/connect4/:roomId" element={<ConnectFour />} />
                <Route path="/TicTacToe/:roomId" element={<TicTacToe />} />
                <Route path="/Battleship/:roomId" element={<Battleship />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
