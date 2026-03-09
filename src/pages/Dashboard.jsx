import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import SongCard from "../components/SongCard";
import { useInView } from "../hooks/useInView";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("q") || "";
  const [songs, setSongs] = useState([]);
  const [mostLiked, setMostLiked] = useState([]);
  const [mostPlayed, setMostPlayed] = useState([]);
  const [popular, setPopular] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [songsPage, setSongsPage] = useState(1);
  const [songsHasMore, setSongsHasMore] = useState(true);
  const [songsLoadingMore, setSongsLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const SONGS_PER_PAGE = 12;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setSongsPage(1);
    const params = { page: 1, limit: SONGS_PER_PAGE };
    if (search.trim()) params.search = search.trim();
    API.get(`/song/getSongs/${user.id}`, { params })
      .then((res) => {
        setSongs(res.data.songs);
        setTotal(res.data.total);
        setSongsHasMore((res.data.songs?.length || 0) < (res.data.total || 0));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, search]);

  const loadMoreSongs = useCallback(() => {
    if (!user || songsLoadingMore || !songsHasMore) return;
    setSongsLoadingMore(true);
    const nextPage = songsPage + 1;
    const params = { page: nextPage, limit: SONGS_PER_PAGE };
    if (search.trim()) params.search = search.trim();
    API.get(`/song/getSongs/${user.id}`, { params })
      .then((res) => {
        const newSongs = res.data.songs || [];
        const totalCount = res.data.total;
        setSongs((prev) => {
          const combined = [...prev, ...newSongs];
          setSongsHasMore(combined.length < totalCount);
          return combined;
        });
        setSongsPage(nextPage);
      })
      .catch(console.error)
      .finally(() => setSongsLoadingMore(false));
  }, [user, search, songsPage, songsLoadingMore, songsHasMore]);

  const [sectionPage, setSectionPage] = useState({ mostLiked: 1, mostPlayed: 1, popular: 1 });
  const [sectionHasMore, setSectionHasMore] = useState({ mostLiked: true, mostPlayed: true, popular: true });
  const [sectionLoading, setSectionLoading] = useState({ mostLiked: false, mostPlayed: false, popular: false });

  const loadSection = useCallback((section, page = 1, append = false) => {
    if (!user) return;
    setSectionLoading((p) => ({ ...p, [section]: true }));
    API.get(`/song/getSongsBySection/${user.id}`, { params: { section, limit: 8, page } })
      .then((res) => {
        const items = res.data.songs || [];
        const upd = append ? (prev) => [...prev, ...items] : () => items;
        if (section === "mostLiked") setMostLiked(upd);
        else if (section === "mostPlayed") setMostPlayed(upd);
        else setPopular(upd);
        setSectionHasMore((p) => ({ ...p, [section]: res.data.hasMore }));
        setSectionPage((p) => ({ ...p, [section]: page }));
      })
      .catch(console.error)
      .finally(() => setSectionLoading((p) => ({ ...p, [section]: false })));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadSection("mostLiked", 1);
    loadSection("mostPlayed", 1);
    loadSection("popular", 1);
  }, [user, loadSection]);

  useEffect(() => {
    API.get(`/getPlayLists/${user?.id}`)
      .then((res) => setPlaylists(res.data))
      .catch(console.error);
  }, [user]);

  const openModal = (song) => {
    setSelectedSong(song);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSong(null);
    setShowModal(false);
  };

  const addToPlaylist = async (playlistId) => {
    try {
      await API.put(`/playList/addToPlayList/${playlistId}`, {
        song: selectedSong._id,
      });
      closeModal();
      toast.success("Added to playlist!");
    } catch {
      toast.error("Already in playlist");
      closeModal();
    }
  };

  const handleLikeChange = (songId, isLiked, likeCount) => {
    const upd = (s) =>
      s._id === songId ? { ...s, isLiked, ...(likeCount != null && { likeCount }) } : s;
    setSongs((prev) => prev.map(upd));
    setMostLiked((prev) => prev.map(upd));
    setMostPlayed((prev) => prev.map(upd));
    setPopular((prev) => prev.map(upd));
  };

  const gridClass = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 min-w-0 [&>*]:min-w-0";
  const [loadMoreRef, loadMoreInView] = useInView("300px");

  useEffect(() => {
    if (loadMoreInView && songsHasMore && !songsLoadingMore && songs.length > 0) {
      loadMoreSongs();
    }
  }, [loadMoreInView, songsHasMore, songsLoadingMore, songs.length, loadMoreSongs]);

  if (loading) {
    return (
      <div className="p-3 sm:p-5 md:p-6 max-w-7xl mx-auto w-full min-w-0">
        <div className="h-6 sm:h-8 w-40 sm:w-48 bg-zinc-800 rounded-lg animate-pulse mb-6 sm:mb-8" />
        <div className={gridClass}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 rounded-xl p-4 animate-pulse">
              <div className="aspect-square bg-zinc-800 rounded-lg mb-3" />
              <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 md:p-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
            Music Library
          </h1>
          <p className="text-zinc-400 dark:text-zinc-400 text-xs sm:text-sm mt-1">
            {total} song{total !== 1 ? "s" : ""} in catalog
          </p>
        </div>
      </div>

      {songs.length === 0 && !search ? (
        <div className="glass-card rounded-2xl p-12 sm:p-16 text-center animate-fadeSlideUp">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl mx-auto mb-6">
            ♪
          </div>
          <h3 className="text-xl font-semibold mb-2">No songs in library</h3>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            Songs are added by admins. Check back later.
          </p>
        </div>
      ) : songs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <p className="text-zinc-400 dark:text-zinc-400">{search ? `No results for "${search}"` : "No songs"}</p>
        </div>
      ) : (
        <>
        {!search && (mostLiked.length > 0 || mostPlayed.length > 0 || popular.length > 0) && (
          <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10">
            {mostLiked.length > 0 && (
              <section className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-pink-500">♥</span> Most Liked
                </h2>
                <div className={gridClass}>
                  {mostLiked.map((song) => (
                    <SongCard
                      key={song._id}
                      song={song}
                      showAddToPlaylist
                      onAddToPlaylist={openModal}
                      onLikeChange={handleLikeChange}
                      animateWhenPlaying
                    />
                  ))}
                </div>
                {sectionHasMore.mostLiked && (
                  <button
                    onClick={() => loadSection("mostLiked", sectionPage.mostLiked + 1, true)}
                    disabled={sectionLoading.mostLiked}
                    className="mt-3 sm:mt-4 py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium disabled:opacity-50"
                  >
                    {sectionLoading.mostLiked ? "Loading..." : "Load more"}
                  </button>
                )}
              </section>
            )}
            {mostPlayed.length > 0 && (
              <section className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <span>▶</span> Most Played
                </h2>
                <div className={gridClass}>
                  {mostPlayed.map((song) => (
                    <SongCard
                      key={song._id}
                      song={song}
                      showAddToPlaylist
                      onAddToPlaylist={openModal}
                      onLikeChange={handleLikeChange}
                      animateWhenPlaying
                    />
                  ))}
                </div>
                {sectionHasMore.mostPlayed && (
                  <button
                    onClick={() => loadSection("mostPlayed", sectionPage.mostPlayed + 1, true)}
                    disabled={sectionLoading.mostPlayed}
                    className="mt-3 sm:mt-4 py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium disabled:opacity-50"
                  >
                    {sectionLoading.mostPlayed ? "Loading..." : "Load more"}
                  </button>
                )}
              </section>
            )}
            {popular.length > 0 && (
              <section className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-emerald-500">★</span> Popular
                </h2>
                <div className={gridClass}>
                  {popular.map((song) => (
                    <SongCard
                      key={song._id}
                      song={song}
                      showAddToPlaylist
                      onAddToPlaylist={openModal}
                      onLikeChange={handleLikeChange}
                      animateWhenPlaying
                    />
                  ))}
                </div>
                {sectionHasMore.popular && (
                  <button
                    onClick={() => loadSection("popular", sectionPage.popular + 1, true)}
                    disabled={sectionLoading.popular}
                    className="mt-3 sm:mt-4 py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium disabled:opacity-50"
                  >
                    {sectionLoading.popular ? "Loading..." : "Load more"}
                  </button>
                )}
              </section>
            )}
          </div>
        )}
        <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{search ? "Search results" : "All songs"}</h2>
        <div className={gridClass}>
          {songs.map((song) => (
            <SongCard
              key={song._id}
              song={song}
              showAddToPlaylist
              onAddToPlaylist={openModal}
              onLikeChange={handleLikeChange}
              animateWhenPlaying
            />
          ))}
        </div>
        {songsHasMore && (
          <div ref={loadMoreRef} className="flex justify-center mt-6 sm:mt-8 py-4">
            {songsLoadingMore ? (
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <button
                onClick={loadMoreSongs}
                className="px-6 py-3 rounded-xl bg-zinc-800 dark:bg-zinc-800 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-700 transition"
              >
                See more
              </button>
            )}
          </div>
        )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-scaleIn overflow-y-auto">
          <div className="glass-card p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-scaleIn">
            <h3 className="text-xl font-bold mb-1">Add to playlist</h3>
            <p className="text-sm text-zinc-400 mb-5 truncate">
              {selectedSong?.title} — {selectedSong?.artist}
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
              onClick={closeModal}
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
