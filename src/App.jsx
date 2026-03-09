import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import NowPlayingBar from "./components/NowPlayingBar";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routs/routs";
import AdminRoute from "./routs/adminRoute";
import PublicRoute from "./routs/publicRouts";
import { PlayerProvider } from "./context/PlayerContext";
import LiveBackground from "./components/LiveBackground";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Playlists = lazy(() => import("./pages/Playlists"));
const PlaylistDetails = lazy(() => import("./pages/PlaylistDetails"));
const LikedSongs = lazy(() => import("./pages/LikedSongs"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const SongDetail = lazy(() => import("./pages/SongDetail"));

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Toaster position="top-right" />
        <div className="flex flex-col min-h-screen relative">
          <LiveBackground />
          <Navbar />
          <main className="flex-1 overflow-y-auto pb-16 sm:pb-[4.5rem] md:pb-20">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
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
          </Suspense>
          </main>
          <NowPlayingBar />
        </div>
      </PlayerProvider>
    </BrowserRouter>
  );
}
