
import { useState } from "react";
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

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()&&!artist.trim()&&!song) return setError("all field is required");
    if (!title.trim()&&!artist.trim()) return setError("artist and title is required");
    if (!title.trim()&&!song) return setError("title and song is required");
    if (!artist.trim()&&!song) return setError("artist and song is required");
    if (!title.trim()) return setError("Title is required");
    if (!artist.trim()) return setError("Artist is required");
    if (!song) return setError("Please select an MP3 file");
    if (song.type !== "audio/mpeg")
      return setError("Only MP3 files are allowed");

    try {
      setLoading(true);

  const formData = new FormData();
  formData.append("title", title);
  formData.append("artist", artist);
  formData.append("uploadedBy", user.id);
  formData.append("song", song);

    await API.post("/song/uploadSong", formData);

    // alert("Song uploaded successfully");
 toast.success(`song added.....${title}`);

      setTitle("");
      setArtist("");
      setSong(null);
    } catch (err) {
    setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <form
      onSubmit={handleUpload}
      className="bg-[#181818] p-8 rounded-lg w-full max-w-md shadow-lg"  >
    <h2 className="text-2xl font-bold mb-6 text-center">
          Upload <span className="text-[#1DB954]">Song</span>
   </h2>

        {error && (
          <p className="mb-4 text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <input
          placeholder="Song Title"
       value={title}
     onChange={(e) => setTitle(e.target.value)}
    className="w-full mb-4 px-4 py-2 rounded bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]" />

        <input
          placeholder="Artist Name"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"  />

        <input
      type="file"
       accept=".mp3"
      onChange={(e) => setSong(e.target.files[0])}
      className="w-full mb-6 text-sm text-gray-300"   />

  <button
         disabled={loading}
        className="w-full bg-[#1DB954] text-black py-2 rounded-full font-semibold hover:scale-105 transition disabled:opacity-60"   >
      {loading ? "Uploading..." : "Upload"}
      </button>
      </form>
    </div>
  );
}
