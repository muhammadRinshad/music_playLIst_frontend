import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import toast from "react-hot-toast";

export default function SongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { play, pause, currentSong, isPlaying, togglePlay } = usePlayer();
  const [song, setSong] = useState(location.state?.song ?? null);
  const [loading, setLoading] = useState(!song);
  const [isLiked, setIsLiked] = useState(song?.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(song?.likeCount ?? 0);
  const [playlists, setPlaylists] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (song) {
      setIsLiked(song.isLiked ?? false);
      setLikeCount(song.likeCount ?? 0);
    }
  }, [song]);

  useEffect(() => {
    if (song) return;
    API.get(`/song/getSong/${id}`)
      .then((res) => setSong(res.data))
      .catch(() => {
        toast.error("Song not found");
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [id, song, navigate]);

  useEffect(() => {
    if (!song) return;
    if (!currentSong || currentSong._id !== song._id) {
      play(song, { autoPlay: false });
    } else {
      pause();
    }
  }, [song, currentSong, play, pause]);

  useEffect(() => {
    if (!user) return;
    API.get(`/getPlayLists/${user.id}`)
      .then((res) => setPlaylists(res.data || []))
      .catch(console.error);
  }, [user]);

  const addToPlaylist = async (playlistId) => {
    try {
      await API.put(`/playList/addToPlayList/${playlistId}`, { song: song._id });
      setShowAddModal(false);
      toast.success("Added to playlist!");
    } catch {
      toast.error("Already in playlist");
      setShowAddModal(false);
    }
  };

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    try {
      const res = await API.post(`/song/toggleLike/${song._id}`);
      setIsLiked(res.data.isLiked);
      if (res.data.likeCount != null) setLikeCount(res.data.likeCount);
      setSong((s) => ({ ...s, isLiked: res.data.isLiked, likeCount: res.data.likeCount }));
      toast.success(res.data.isLiked ? "Added to Liked Songs" : "Removed from Liked Songs", { duration: 2000 });
    } catch {
      toast.error("Could not update like");
    }
  };

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const HeartIcon = ({ size = "w-6 h-6" }) => (
    <svg
      className={`${size} transition-colors ${isLiked ? "fill-pink-500 text-pink-500" : "fill-none text-zinc-400"}`}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  if (loading || !song) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-8">
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-zinc-800 animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-zinc-800 rounded w-20 mb-4 animate-pulse" />
            <div className="h-10 bg-zinc-800 rounded w-3/4 mb-4 animate-pulse" />
            <div className="h-5 bg-zinc-800 rounded w-1/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto animate-fadeSlideUp">
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
        <div className="w-full sm:w-56 sm:aspect-square rounded-2xl bg-gradient-to-br from-zinc-800 to-emerald-950/40 overflow-hidden shadow-xl shrink-0" data-song-id={song._id}>
          {song.coverUrl ? (
            <img src={song.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-zinc-500">♪</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">Song</p>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{song.title}</h1>
          <p className="text-zinc-400 text-base mt-1 truncate">{song.artist}</p>
          {song.duration != null && song.duration > 0 && (
            <p className="text-zinc-500 text-sm mt-2">{formatDuration(song.duration)}</p>
          )}
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <button
              onClick={togglePlay}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shrink-0 now-playing-bar__play-btn ${isPlaying ? "now-playing-bar__play-btn--playing" : ""}`}
            >
              {isPlaying ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleToggleLike}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-zinc-800/80 transition text-zinc-400 hover:text-pink-400"
            >
              <HeartIcon />
              <span className="font-medium tabular-nums">{likeCount}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 p-3 rounded-xl hover:bg-zinc-800/80 transition text-zinc-400 hover:text-emerald-400"
              title="Add to playlist"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Add to playlist</span>
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-scaleIn overflow-y-auto">
          <div className="glass-card p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold mb-1">Add to playlist</h3>
            <p className="text-sm text-zinc-400 mb-5 truncate">
              {song.title} — {song.artist}
            </p>
            {playlists.length === 0 ? (
              <p className="text-zinc-400 text-sm py-4">
                Create a playlist first from the Playlists page
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1 -mr-1">
                {playlists.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => addToPlaylist(p._id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-800/80 active:bg-zinc-700 transition text-left"
                  >
                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg">
                      ♪
                    </div>
                    <span className="font-medium truncate">{p.title}</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowAddModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl border border-zinc-600 text-sm font-medium hover:border-zinc-500 hover:bg-zinc-800/50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
