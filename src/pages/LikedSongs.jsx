import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SongCard from "../components/SongCard";

export default function LikedSongs() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    API.get("/song/getLikedSongs")
      .then((res) => setSongs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleLikeChange = (songId, isLiked) => {
    if (!isLiked) {
      setSongs((prev) => prev.filter((s) => s._id !== songId));
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex gap-6 mb-8">
          <div className="w-40 h-40 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="flex-1">
            <div className="h-6 bg-zinc-800 rounded w-24 mb-4" />
            <div className="h-10 bg-zinc-800 rounded w-48 mb-2" />
            <div className="h-4 bg-zinc-800 rounded w-20" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-10 animate-fadeSlideUp">
        <div className="w-full sm:w-48 aspect-square sm:aspect-auto sm:h-48 rounded-2xl bg-gradient-to-br from-pink-900/40 via-zinc-800 to-emerald-900/30 flex items-center justify-center text-6xl sm:text-7xl shadow-xl">
          <span className="opacity-90">♥</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Playlist</p>
          <h1 className="text-3xl sm:text-4xl font-bold">Liked Songs</h1>
          <p className="text-zinc-400 text-sm mt-2">
            {songs.length} song{songs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 sm:p-16 text-center animate-fadeSlideUp">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl mx-auto mb-6">
            ♥
          </div>
          <h3 className="text-xl font-semibold mb-2">No liked songs yet</h3>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            Like songs from the Music Library to add them here
          </p>
        </div>
      ) : (
        <div className="space-y-1">
            {songs.map((song) => (
              <div key={song._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/60">
                <SongCard
                  song={song}
                  variant="row"
                  onLikeChange={handleLikeChange}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
