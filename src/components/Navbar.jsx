
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-[#121212] border-b border-gray-800">
 <h3 className="text-xl font-bold text-[#1DB954] flex items-center gap-2">
      🎵 Music Playlist
 </h3>
      <div className="flex items-center gap-6 text-sm font-medium">
        {!user && (
          <>
      <Link
              to="/"
              className="text-gray-300 hover:text-white transition"  >
              Login
     </Link>
      <Link
              to="/register"
              className="text-gray-300 hover:text-white transition" >
              Register
     </Link>
          </>
        )}

     {user && (
            <>
     <Link
     to="/dashboard"
    className="text-gray-300 hover:text-white transition"   >
     Dashboard
  </Link>

            <Link
              to="/upload"
              className="text-gray-300 hover:text-white transition">
              Upload Song
            </Link>

      <Link
    to="/playlists"
   className="text-gray-300 hover:text-white transition" >
             Playlists
     </Link>

            <button
              onClick={handleLogout}
              className="bg-[#1DB954] text-black px-4 py-1.5 rounded-full hover:scale-105 transition font-semibold" >
              Logout
         </button>
     </>
        )}
      </div>
    </nav>
  );
}

