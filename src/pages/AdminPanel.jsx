import { useEffect, useState, useRef } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ImageCropModal from "../components/ImageCropModal";

export default function AdminPanel() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [songFile, setSongFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [songToDelete, setSongToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    API.get("/song/getAllSongs")
      .then((res) => setSongs(res.data))
      .catch(() => toast.error("Failed to load songs"));
    API.get("/getAllUsers")
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Failed to load users"));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !songFile) {
      toast.error("Fill all fields and select an MP3 file");
      return;
    }
    if (songFile.type !== "audio/mpeg") {
      toast.error("Only MP3 files allowed");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("uploadedBy", user.id);
      formData.append("song", songFile);
      if (coverFile) {
        formData.append("cover", coverFile, "cover.jpg");
      }
      await API.post("/song/uploadSong", formData);
      toast.success(`${title} uploaded!`);
      setTitle("");
      setArtist("");
      setSongFile(null);
      setCoverFile(null);
      setCoverPreview(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "audio/mpeg") setSongFile(file);
    else toast.error("Only MP3 files allowed");
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Select an image file (JPG, PNG)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = (blob) => {
    setCoverFile(blob);
    setCoverPreview(null);
    setShowCropModal(false);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleDeleteSong = async (songId) => {
    try {
      await API.post(`/song/deleteSong/${songId}`);
      setSongs((prev) => prev.filter((s) => s._id !== songId));
      setSongToDelete(null);
      toast.success("Song deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete song");
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await API.delete(`/removeUser/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setUserToRemove(null);
      toast.success("User removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove user");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Admin Panel
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Manage songs and view users</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("upload")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "upload"
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Upload Song
        </button>
        <button
          onClick={() => setActiveTab("songs")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "songs"
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          All Songs ({songs.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "users"
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {activeTab === "upload" && (
        <div className="glass-card p-6 rounded-2xl animate-fadeSlideUp">
          <h2 className="text-lg font-semibold mb-4">Upload a new song</h2>
          <form onSubmit={handleUpload} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Song title</label>
              <input
                placeholder="e.g. Midnight Dreams"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Artist</label>
              <input
                placeholder="e.g. Artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">MP3 file</label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition ${
                  isDragging ? "border-emerald-500 bg-emerald-500/10" : "border-zinc-600 hover:border-zinc-500"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,audio/mpeg"
                  onChange={(e) => setSongFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {songFile ? (
                  <span className="text-emerald-400 font-medium">{songFile.name}</span>
                ) : (
                  <span className="text-zinc-500 text-sm">Drag & drop or click to select MP3</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Cover image (optional)</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl border border-zinc-600 text-sm hover:bg-zinc-800/50 transition"
                >
                  {coverFile ? "Change cover" : "Add cover"}
                </button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverSelect}
                  className="hidden"
                />
                {coverFile && (
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800">
                      <img src={URL.createObjectURL(coverFile)} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                    <button type="button" onClick={handleRemoveCover} className="text-red-400 text-sm hover:underline">
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Square crop applied. JPG, PNG, WebP.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      )}

      {activeTab === "songs" && (
        <div className="glass-card rounded-2xl overflow-hidden animate-fadeSlideUp">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="font-semibold">All songs in library</h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {songs.length === 0 ? (
              <p className="p-6 text-zinc-400 text-sm text-center">No songs yet</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {songs.map((s, i) => (
                  <li key={s._id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/50">
                    <span className="text-zinc-500 text-sm w-6">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{s.title}</p>
                      <p className="text-xs text-zinc-400 truncate">{s.artist}</p>
                    </div>
                    {s.uploadedBy && (
                      <span className="text-xs text-zinc-500 truncate max-w-[120px]">
                        by {s.uploadedBy?.username || "—"}
                      </span>
                    )}
                    <button
                      onClick={() => setSongToDelete(s)}
                      className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/10 transition shrink-0"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="glass-card rounded-2xl overflow-hidden animate-fadeSlideUp">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="font-semibold">Registered users</h2>
            <p className="text-xs text-zinc-500 mt-1">Set isAdmin in database for admin access</p>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {users.length === 0 ? (
              <p className="p-6 text-zinc-400 text-sm text-center">No users</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {users.map((u) => (
                  <li key={u._id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">@{u.username}</p>
                      <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.isAdmin && (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">
                          Admin
                        </span>
                      )}
                      {u._id !== user?.id && (
                        <button
                          onClick={() => setUserToRemove(u)}
                          className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/10 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {showCropModal && coverPreview && (
        <ImageCropModal
          imageSrc={coverPreview}
          onComplete={handleCropComplete}
          onCancel={() => { setShowCropModal(false); setCoverPreview(null); }}
        />
      )}

      {songToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-sm animate-scaleIn">
            <h3 className="text-lg font-bold mb-2">Delete song?</h3>
            <p className="text-zinc-400 text-sm mb-2">
              {songToDelete.title} — {songToDelete.artist}
            </p>
            <p className="text-zinc-500 text-xs mb-6">
              This will remove the song from the library, playlists, and liked lists. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteSong(songToDelete._id)}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setSongToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-600 font-medium hover:bg-zinc-800/50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {userToRemove && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 rounded-2xl w-full max-w-sm animate-scaleIn">
            <h3 className="text-lg font-bold mb-2">Remove user?</h3>
            <p className="text-zinc-400 text-sm mb-2">
              @{userToRemove.username} ({userToRemove.email})
            </p>
            <p className="text-zinc-500 text-xs mb-6">
              Their playlists will be deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRemoveUser(userToRemove._id)}
                className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 transition"
              >
                Remove
              </button>
              <button
                onClick={() => setUserToRemove(null)}
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
