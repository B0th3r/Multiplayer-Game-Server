import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainMenu from "./views/MainMenu.jsx";
import StoryMode from "./storymode/StoryMode.jsx";
import RoomEntry from "./views/RoomEntry.jsx";
import Lobby from "./views/Lobby.jsx";
import ConnectFour from "./views/ConnectFour.jsx";
import TicTacToe from "./views/TicTacToe.jsx";
import Battleship from "./views/Battleship.jsx";
import Blackjack from "./views/Blackjack.jsx";
import MemoryMatching from "./views/MemoryMatching.jsx";
import Riichi from "./views/Riichi.jsx";
function AppShell() {
  return (
    <div className="relative min-h-dvh flex flex-col text-green-300 font-mono">

      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-black"
      />

      <header className="fixed inset-x-0 top-0 h-12 md:sticky md:top-0 z-50 border-b border-green-700/30 supports-[backdrop-filter]:bg-black/80 bg-black/90 backdrop-blur-sm [padding-top:env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
          <span className="tracking-wider animate-pulse">BOB'S ARCADE</span>
          <span className="text-xs text-green-500/70">v2.0</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6
                       pt-12 md:pt-4
                       pb-10 md:pb-4">
        <Outlet />
      </main>
      <footer className="fixed inset-x-0 bottom-0 h-10 md:sticky md:bottom-0 z-50 border-t border-green-700/30 supports-[backdrop-filter]:bg-black/80 bg-black/90 backdrop-blur-sm [padding-bottom:env(safe-area-inset-bottom)]">
        <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between text-xs">
          <span className="text-green-500/70">© 2025 Keshawn Bryant</span>
          <span className="tracking-widest">[PRESS START]</span>
        </div>
      </footer>
    </div>
  );
}



export default function App() {
  return (
    <Routes>
      <Route path="/single" element={<StoryMode />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<MainMenu />} />
        <Route path="/multi" element={<RoomEntry />} />
        <Route path="/room/:roomId" element={<Lobby />} />
        <Route path="/connect4/:roomId" element={<ConnectFour />} />
        <Route path="/TicTacToe/:roomId" element={<TicTacToe />} />
        <Route path="/Battleship/:roomId" element={<Battleship />} />
        <Route path="/Blackjack/:roomId" element={<Blackjack />} />
        <Route path="/MemoryMatching/:roomId" element={<MemoryMatching />} />
        <Route path="/Riichi/:roomId" element={<Riichi />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
