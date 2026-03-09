import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Playlists from "./pages/Playlists";
import PlaylistDetails from "./pages/PlaylistDetails";
import LikedSongs from "./pages/LikedSongs";
import AdminPanel from "./pages/AdminPanel";
import SongDetail from "./pages/SongDetail";
import Navbar from "./components/Navbar";
import NowPlayingBar from "./components/NowPlayingBar";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routs/routs";
import AdminRoute from "./routs/adminRoute";
import PublicRoute from "./routs/publicRouts";
import { PlayerProvider } from "./context/PlayerContext";
import LiveBackground from "./components/LiveBackground";

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Toaster position="top-right" />
        <div className="flex flex-col min-h-screen relative">
          <LiveBackground />
          <Navbar />
          <main className="flex-1 overflow-y-auto pb-16 sm:pb-[4.5rem] md:pb-20">
          <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
        <Route path="/liked" element={<ProtectedRoute><LikedSongs /></ProtectedRoute>} />
        <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
        <Route path="/playlist/:id" element={<ProtectedRoute><PlaylistDetails /></ProtectedRoute>} />
        <Route path="/song/:id" element={<ProtectedRoute><SongDetail /></ProtectedRoute>} />
          </Routes>
          </main>
          <NowPlayingBar />
        </div>
      </PlayerProvider>
    </BrowserRouter>
  );
}
