import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadSong from "./pages/UploadSong";
import Playlists from "./pages/Playlists";
import PlaylistDetails from "./pages/PlaylistDetails";
import Navbar from "./components/Navbar"
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./routs/routs";
import PublicRoute from "./routs/publicRouts";

export default function App() {
  return (
    <BrowserRouter>
    <Toaster position="top-right" />
      <Navbar />
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadSong /></ProtectedRoute>} />
        <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
        <Route path="/playlist/:id" element={<ProtectedRoute><PlaylistDetails /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
