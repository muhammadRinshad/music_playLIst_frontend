
import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function Playlists() {
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState([]);
  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [error, setError] = useState("");



  useEffect(() => {
    if (!user) return;

    API.get(`/getPlayLists/${user.id}`)
      .then((res) => setPlaylists(res.data))
      .catch(console.error);
  }, [user]);

  const openModal = (playlistId) => {
    setSelectedPlaylistId(playlistId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlaylistId(null);
  };

  const createPlaylist = async () => {
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }

    const res = await API.post(
      `/playlist/createPlayList/${user.id}`,
      { title }
    );

    setPlaylists([...playlists, res.data.value]);
    toast.success(`Playlist created: ${title}`);
    setTitle("");
  };

  const removePlaylist = async () => {
    try {
      await API.delete(`/playlist/removePlayList/${selectedPlaylistId}`);

      setPlaylists(
        playlists.filter((p) => p._id !== selectedPlaylistId)
      );

      toast.success("Playlist removed");
      closeModal();
    } catch (err) {
      toast.error("Failed to remove playlist");
    }
  };

  return (
    <div className="p-6">
    <h2 className="text-2xl font-bold mb-6">My Playlists</h2>

  <div className="flex gap-3 mb-8">
   <input
      placeholder="New playlist title"
      value={title}
        onChange={(e) => setTitle(e.target.value)}
     className="bg-black text-white px-4 py-2 rounded w-64"
        />
        <button
          onClick={createPlaylist}
          className="bg-[#1DB954] text-black px-5 py-2 rounded-full font-semibold"  >
          Create
      </button>
      </div>

      {playlists.length === 0 ? (
        <p className="text-gray-400">No playlists created yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {playlists.map((p) => (
            <div
              key={p._id}
              className="bg-[#181818] p-4 rounded-lg hover:bg-[#222] transition group"  >
        <Link to={`/playlist/${p._id}`}>
        <div className="h-32 bg-black rounded mb-3 flex items-center justify-center text-4xl">
                  🎶
           </div>
    <h4 className="font-semibold truncate">{p.title}</h4>
      <p className="text-sm text-gray-400">Playlist</p>
       </Link>

        <button
        onClick={(e) => {
         e.preventDefault();
        openModal(p._id);
         }}
         className="mt-3 text-red-500 text-sm opacity-0 group-hover:opacity-100 transition" >
            Delete
        </button>
       </div>
          ))}
        </div>
      )}

      {showModal && (
   <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-[#121212] p-6 rounded-xl w-full max-w-sm">
      <h3 className="text-xl font-bold mb-4">
              Are you sure you want to remove this playlist?
       </h3>

       <button
         onClick={removePlaylist}
        className="w-full mb-3 py-2 rounded-full bg-red-600 text-white" >
         Remove
       </button>

        <button
          onClick={closeModal}
        className="w-full py-2 rounded-full border border-gray-600" >
           Cancel
     </button>
    </div>
     </div>
      )}
    </div>
  );
}
