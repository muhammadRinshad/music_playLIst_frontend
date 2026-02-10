

import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";


export default function Dashboard() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    if (!user) return;

    API.get(`/song/getSongs/${user.id}`)
      .then((res) => setSongs(res.data))
      .catch(console.error);

    API.get(`/getPlayLists/${user.id}`)
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
    try{
    await API.put(`/playlist/addToPlayList/${playlistId}`, {
      song: selectedSong._id,
    });

    closeModal();
    // alert("Song added to playlist");
    toast.success("Song added to playlist 🎵");

  }catch(err){
        toast.error("already in the play list");
        closeModal();

  }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Your Songs</h2>

      {songs.length === 0 ? (
        <p className="text-gray-400">No songs uploaded yet</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {songs.map((song) => (
            <div
              key={song._id}
              className="bg-[#181818] p-4 rounded-lg hover:bg-[#222] transition"
            >
              <div className="h-32 bg-black rounded mb-3 flex items-center justify-center text-3xl">
                🎵
              </div>

              <h4 className="font-semibold truncate">{song.title}</h4>
              <p className="text-sm text-gray-400 truncate">
                {song.artist}
              </p>
              <audio controls src={song.filePath} className="w-full mt-3" />
              <button
                onClick={() => openModal(song)}
                className="mt-3 text-sm text-[#1DB954] hover:underline"
              >
                ➕ Add to Playlist
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-[#121212] p-6 rounded-xl w-full max-w-sm shadow-2xl animate-scaleIn">
      
      <h3 className="text-xl font-bold mb-1">
        Add to playlist
      </h3>
      <p className="text-sm text-gray-400 mb-5 truncate">
        {selectedSong?.title}
      </p>

      {playlists.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No playlists found
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
          {playlists.map((p) => (
            <button
              key={p._id}
              onClick={() => addToPlaylist(p._id)}
              className="
                w-full flex items-center gap-3
                px-4 py-3 rounded-md  hover:bg-[#1a1a1a]  active:bg-[#222]  transition ">
              <div className="h-10 w-10 bg-black rounded flex items-center justify-center">
                🎶
              </div>

              <span className="font-medium truncate">
                {p.title}
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={closeModal}
        className="
          mt-5 w-full py-2 rounded-full border border-gray-600
          text-sm font-medium hover:border-white hover:text-white transition">
        Cancel
      </button>
    </div>
  </div>
)}

    </div>
  );
}
