import { useState, useRef } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function UploadSong() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Title is required");
    if (!artist.trim()) return setError("Artist is required");
    if (!song) return setError("Please select an MP3 file");
    if (song.type !== "audio/mpeg") return setError("Only MP3 files are allowed");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("uploadedBy", user.id);
      formData.append("song", song);

      await API.post("/song/uploadSong", formData);
      toast.success(`${title} added to your library!`);
      setTitle("");
      setArtist("");
      setSong(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "audio/mpeg") setSong(file);
    else setError("Only MP3 files are allowed");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="animate-fadeSlideUp">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-emerald-500/25">
            ↑
          </div>
          <h2 className="text-2xl font-bold">Upload a song</h2>
          <p className="text-zinc-400 text-sm mt-1">MP3 format only</p>
        </div>

        <div className="glass-card p-8 rounded-2xl shadow-xl">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Song title</label>
              <input
                placeholder="e.g. Midnight Dreams"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Artist</label>
              <input
                placeholder="e.g. Artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Audio file</label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-500/10"
                    : song
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-zinc-600 hover:border-zinc-500 bg-zinc-900/40"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,audio/mpeg"
                  onChange={(e) => setSong(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {song ? (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">♪</span>
                    <span className="font-medium text-emerald-400">{song.name}</span>
                    <span className="text-zinc-500 text-sm">— Click to change</span>
                  </div>
                ) : (
                  <>
                    <span className="text-4xl block mb-2">📁</span>
                    <p className="text-zinc-400">Drag & drop your MP3 here</p>
                    <p className="text-zinc-500 text-sm mt-1">or click to browse</p>
                  </>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                "Upload song"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
