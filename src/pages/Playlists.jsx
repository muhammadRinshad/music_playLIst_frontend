import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Playlists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [likedCount, setLikedCount] = useState(0);
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    if (openMenuId) document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [openMenuId]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      API.get(`/getPlayLists/${user.id}`),
      API.get("/song/getLikedSongs")
    ])
      .then(([playlistsRes, likedRes]) => {
        setPlaylists(playlistsRes.data);
        setLikedCount(likedRes.data?.length ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const openModal = (playlistId) => {
    setSelectedPlaylistId(playlistId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlaylistId(null);
  };

  const createPlaylist = async (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      toast.error("Enter a playlist name");
      return;
    }
    try {
      const res = await API.post(`/playList/createPlayList/${user.id}`, { title });
      setPlaylists((prev) => [...prev, res.data.value]);
      toast.success(`Created "${title}"`);
      setTitle("");
    } catch {
      toast.error("Failed to create playlist");
    }
  };

  const removePlaylist = async () => {
    try {
      await API.delete(`/playList/removePlayList/${selectedPlaylistId}`);
      setPlaylists((prev) => prev.filter((p) => p._id !== selectedPlaylistId));
      toast.success("Playlist removed");
      closeModal();
    } catch {
      toast.error("Failed to remove playlist");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 rounded-xl p-4 animate-pulse">
              <div className="aspect-square bg-zinc-800 rounded-lg mb-3" />
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            My Playlists
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
          </p>
        </div>
        <form
          onSubmit={createPlaylist}
          className="flex flex-wrap gap-2 sm:ml-auto"
        >
          <input
            placeholder="New playlist name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 min-w-[160px] px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 text-sm"
          />
          <button
            type="submit"
            onClick={createPlaylist}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-semibold hover:from-emerald-400 hover:to-emerald-500 transition shadow-lg shadow-emerald-500/20"
          >
            Create
          </button>
        </form>
      </div>

      {playlists.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 sm:p-16 text-center animate-fadeSlideUp">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl mx-auto mb-6">
            ♪
          </div>
          <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto mb-8">
            Create a playlist above to organize your music
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: single column list */}
          <div className="flex flex-col gap-1 sm:hidden">
            <Link
              to="/liked"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 transition"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-900/40 to-zinc-800 flex items-center justify-center text-xl shrink-0">
                ♥
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate text-sm">Liked Songs</h4>
                <p className="text-xs text-zinc-400">{likedCount} song{likedCount !== 1 ? "s" : ""}</p>
              </div>
            </Link>
            {playlists.map((p) => (
              <div
                key={p._id}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 transition"
              >
                <Link to={`/playlist/${p._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-900/40 to-zinc-800 flex items-center justify-center text-xl shrink-0">
                    ♪
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate text-sm">{p.title}</h4>
                    <p className="text-xs text-zinc-400">{p.songs?.length ?? 0} song{(p.songs?.length ?? 0) !== 1 ? "s" : ""}</p>
                  </div>
                </Link>
                <div
                  ref={openMenuId === p._id ? menuRef : null}
                  className="relative shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenuId((id) => (id === p._id ? null : p._id));
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                  {openMenuId === p._id && (
                    <div className="absolute right-0 top-full mt-1 py-1.5 min-w-[140px] rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenMenuId(null);
                          openModal(p._id);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-zinc-700/80 transition rounded-lg mx-1"
                      >
                        Delete playlist
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & tablet: grid */}
          <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Link
              to="/liked"
              className="block group relative bg-zinc-900/50 hover:bg-zinc-800/80 rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02] p-4"
            >
              <div className="aspect-square bg-gradient-to-br from-pink-900/40 to-zinc-800 rounded-lg mb-3 flex items-center justify-center text-4xl">
                ♥
              </div>
              <h4 className="font-semibold truncate text-sm">Liked Songs</h4>
              <p className="text-xs text-zinc-400">{likedCount} song{likedCount !== 1 ? "s" : ""}</p>
            </Link>
            {playlists.map((p) => (
              <div
                key={p._id}
                className="group relative bg-zinc-900/50 hover:bg-zinc-800/80 rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.02]"
              >
                <Link to={`/playlist/${p._id}`} className="block p-4">
                  <div className="aspect-square bg-gradient-to-br from-emerald-900/40 to-zinc-800 rounded-lg mb-3 flex items-center justify-center text-4xl">
                    ♪
                  </div>
                  <h4 className="font-semibold truncate text-sm">{p.title}</h4>
                  <p className="text-xs text-zinc-400">{p.songs?.length ?? 0} song{(p.songs?.length ?? 0) !== 1 ? "s" : ""}</p>
                </Link>
                <div
                  ref={openMenuId === p._id ? menuRef : null}
                  className={`absolute top-2 right-2 z-10 ${openMenuId === p._id ? "pointer-events-auto" : "pointer-events-none group-hover:pointer-events-auto"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenMenuId((id) => (id === p._id ? null : p._id));
                    }}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                  {openMenuId === p._id && (
                    <div className="absolute right-0 top-full mt-1 py-1.5 min-w-[140px] rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenMenuId(null);
                          openModal(p._id);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-zinc-700/80 transition rounded-lg mx-1"
                      >
                        Delete playlist
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold mb-4">
              Delete this playlist?
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={removePlaylist}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition"
              >
                Delete
              </button>
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-zinc-600 font-medium hover:bg-zinc-800/50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
