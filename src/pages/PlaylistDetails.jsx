import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import SongCard from "../components/SongCard";
import toast from "react-hot-toast";

export default function PlaylistDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      API.get(`/playList/getSongsOnPlayList/${id}`),
      API.get(`/song/getSongs/${user.id}`, { params: { limit: 500 } }),
    ])
      .then(([playlistRes, songsRes]) => {
        setPlaylist(playlistRes.data);
        setAllSongs(songsRes.data.songs || songsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, user]);

  const likedMap = useMemo(() => {
    const m = {};
    allSongs.forEach((s) => { m[s._id] = s.isLiked; });
    return m;
  }, [allSongs]);

  const songsWithLiked = useMemo(() => {
    if (!playlist?.songs) return [];
    return playlist.songs.map((s) => ({ ...s, isLiked: likedMap[s._id] ?? false }));
  }, [playlist?.songs, likedMap]);

  const playlistSongIds = useMemo(() => (playlist?.songs ?? []).map((s) => s._id), [playlist?.songs]);
  const availableSongs = useMemo(
    () => allSongs.filter((song) => !playlistSongIds.includes(song._id)),
    [allSongs, playlistSongIds]
  );

  const addSong = async (songId) => {
    await API.put(`/playList/addToPlayList/${id}`, { song: songId });
    const res = await API.get(`/playList/getSongsOnPlayList/${id}`);
    setPlaylist(res.data);
  };

  const removeSong = async (songId) => {
    await API.put(`/playList/removeFromPlayList/${id}`, { song: songId });
    const res = await API.get(`/playList/getSongsOnPlayList/${id}`);
    setPlaylist(res.data);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(songsWithLiked);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const songIds = items.map((s) => s._id);
    try {
      await API.put(`/playList/reorderPlaylist/${id}`, { songIds });
      const res = await API.get(`/playList/getSongsOnPlayList/${id}`);
      setPlaylist(res.data);
      toast.success("Playlist reordered");
    } catch {
      toast.error("Failed to reorder");
    }
  };

  if (loading || !playlist) {
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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 mb-10 animate-fadeSlideUp">
        <div className="w-full sm:w-48 aspect-square sm:aspect-auto sm:h-48 rounded-2xl bg-gradient-to-br from-emerald-900/50 to-zinc-800 flex items-center justify-center text-6xl sm:text-7xl shadow-xl">
          ♪
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-1">
            Playlist
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold truncate">
            {playlist.title}
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            {playlist.songs.length} song{playlist.songs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Songs in playlist */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>Tracks</span>
          <span className="text-zinc-500 text-sm font-normal">
            ({playlist.songs.length})
          </span>
        </h2>
        {playlist.songs.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-zinc-400 text-sm">No songs in this playlist yet</p>
            <p className="text-zinc-500 text-xs mt-1">Add some below</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="playlist-tracks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-1"
                >
                  {songsWithLiked.map((song, idx) => (
                    <Draggable key={song._id} draggableId={song._id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group flex items-center gap-3 p-3 rounded-xl transition ${
                            snapshot.isDragging
                              ? "bg-zinc-700/80 dark:bg-zinc-700/80 shadow-lg"
                              : "hover:bg-zinc-200 dark:hover:bg-zinc-800/60"
                          }`}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-zinc-400 dark:text-zinc-400 p-1 shrink-0"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 6h2v2H8V6zm0 5h2v2H8v-2zm0 5h2v2H8v-2zm5-10h2v2h-2V6zm0 5h2v2h-2v-2zm0 5h2v2h-2v-2z" />
                            </svg>
                          </div>
                          <span className="text-zinc-500 dark:text-zinc-500 text-sm w-6 tabular-nums shrink-0">
                            {idx + 1}
                          </span>
                          <SongCard song={song} variant="row" />
                          <button
                            onClick={() => removeSong(song._id)}
                            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/10 transition shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </section>

      {/* Add songs */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Add songs</h2>
        {availableSongs.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-zinc-400 text-sm">All your songs are in this playlist</p>
            <p className="text-zinc-500 text-xs mt-1">Upload more to add</p>
          </div>
        ) : (
          <div className="space-y-1">
            {availableSongs.map((song) => (
              <div
                key={song._id}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/60 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-zinc-400 truncate">{song.artist}</p>
                </div>
                <button
                  onClick={() => addSong(song._id)}
                  className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium text-sm hover:bg-emerald-500/30 transition shrink-0"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
