import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { usePlayer } from "../context/PlayerContext";

export default function SongCard({
  song,
  onLikeChange,
  showAddToPlaylist,
  onAddToPlaylist,
  variant = "card",
  animateWhenPlaying = false,
  showRemoveInMenu = false,
  onRemove,
  playOnly = false
}) {
  const navigate = useNavigate();
  const { play, currentSong, isPlaying } = usePlayer();
  const [isLiked, setIsLiked] = useState(song.isLiked || false);
  const [likeCount, setLikeCount] = useState(song.likeCount ?? 0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    setIsLiked(song.isLiked || false);
    setLikeCount(song.likeCount ?? 0);
  }, [song.isLiked, song.likeCount]);

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      const res = await API.post(`/song/toggleLike/${song._id}`);
      setIsLiked(res.data.isLiked);
      if (res.data.likeCount != null) setLikeCount(res.data.likeCount);
      onLikeChange?.(song._id, res.data.isLiked, res.data.likeCount);
      toast.success(res.data.isLiked ? "Added to Liked Songs" : "Removed from Liked Songs", { duration: 2000 });
    } catch {
      toast.error("Could not update like");
    } finally {
      setLoadingLike(false);
    }
  };

  const handleCardClick = (e) => {
    if (menuRef.current?.contains(e.target)) return;
    play(song);
    if (!playOnly) navigate(`/song/${song._id}`, { state: { song } });
  };

  const HeartIcon = ({ size = "w-5 h-5" }) => (
    <svg
      className={`${size} transition-colors ${isLiked ? "fill-pink-500 text-pink-500" : "fill-none text-zinc-400"}`}
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  const ThreeDotsIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );

  const isCurrentPlaying = currentSong?._id === song._id && isPlaying;
  const showPlayingAnimation = isCurrentPlaying && animateWhenPlaying;

  if (variant === "row") {
    const hasMenu = showAddToPlaylist || showRemoveInMenu;
    return (
      <div
        onClick={handleCardClick}
        className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer group/row"
        data-song-id={song._id}
      >
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center group-hover/row:ring-2 group-hover/row:ring-emerald-500/30 transition ${showPlayingAnimation ? "song-card--playing" : ""}`}>
          {song.coverUrl ? (
            <img src={song.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="text-base sm:text-lg opacity-60">♪</span>
          )}
        </div>
        <button
          onClick={handleToggleLike}
          disabled={loadingLike}
          className="song-card__like-btn p-1.5 rounded-lg hover:bg-zinc-700/50 transition shrink-0 disabled:opacity-50 flex items-center gap-1 sm:gap-1.5"
        >
          <HeartIcon />
          <span className="song-card__like-count text-xs sm:text-sm tabular-nums">{likeCount}</span>
        </button>
        <div className="flex-1 min-w-0">
          <p className="song-card__title font-medium truncate text-sm sm:text-base">{song.title}</p>
          <p className="song-card__artist text-xs truncate">{song.artist}</p>
        </div>
        {hasMenu && (
          <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              className="p-2 rounded-lg hover:bg-zinc-700/50 transition text-zinc-400 hover:text-white"
            >
              <ThreeDotsIcon />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 min-w-[160px] rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl z-50">
                {showAddToPlaylist && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToPlaylist?.(song); setMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-700/80 transition flex items-center gap-2"
                  >
                    <span>+</span> Add to playlist
                  </button>
                )}
                {showRemoveInMenu && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove?.(song); setMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-500/20 text-red-400 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove from playlist
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group song-card relative rounded-xl sm:rounded-2xl overflow-hidden min-w-0 transition-all duration-300 ease-out cursor-pointer ${showPlayingAnimation ? "song-card--playing" : ""}`}
      data-song-id={song._id}
    >
      <div className="relative aspect-square bg-gradient-to-br from-zinc-800 via-zinc-800/95 to-emerald-950/40 flex items-center justify-center overflow-hidden">
        {song.coverUrl ? (
          <img
            src={song.coverUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" onClick={(e) => e.stopPropagation()}>
          {showAddToPlaylist && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
                className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white/90 hover:bg-black/80 hover:text-white border border-white/10 transition-all"
              >
                <ThreeDotsIcon />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 py-1.5 min-w-[160px] rounded-xl bg-zinc-800/95 backdrop-blur-xl border border-zinc-700/80 shadow-2xl shadow-black/40 z-50">
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToPlaylist?.(song); setMenuOpen(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-zinc-700/80 transition flex items-center gap-2.5 text-zinc-200 rounded-lg mx-1"
                  >
                    <span className="text-emerald-400 font-semibold">+</span> Add to playlist
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="song-card__content p-3.5 sm:p-4">
        <h4 className="song-card__title font-semibold truncate text-sm sm:text-base mb-0.5 tracking-tight">{song.title}</h4>
        <p className="song-card__artist text-xs sm:text-sm truncate mb-3">{song.artist}</p>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleToggleLike}
            disabled={loadingLike}
            className="song-card__like-btn p-2 -m-2 rounded-xl transition shrink-0 disabled:opacity-50 flex items-center gap-1.5 active:scale-95"
            title={isLiked ? "Unlike" : "Like"}
          >
            <HeartIcon size="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium tabular-nums">{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
