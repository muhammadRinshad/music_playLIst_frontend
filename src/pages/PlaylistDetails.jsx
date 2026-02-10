
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function PlaylistDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);

  useEffect(() => {
    if (!user) return;

    API.get(`/playlist/getSongsOnPlayList/${id}`)
      .then((res) => setPlaylist(res.data))
      .catch(console.error);

    API.get(`/song/getSongs/${user.id}`)
      .then((res) => setAllSongs(res.data))
      .catch(console.error);
  }, [id, user]);

  const addSong = async (songId) => {
    await API.put(`/playlist/addToPlayList/${id}`, { song: songId });
    refreshPlaylist();
  };

  const removeSong = async (songId) => {
    await API.put(`/playlist/removeFromPlayList/${id}`, { song: songId });
    refreshPlaylist();
  };

  const refreshPlaylist = async () => {
    const res = await API.get(`/playlist/getSongsOnPlayList/${id}`);
    setPlaylist(res.data);
  };

  if (!playlist)
    return <p className="p-6 text-gray-400">Loading playlist...</p>;

  const playlistSongIds = playlist.songs.map((s) => s._id);
  const availableSongs = allSongs.filter(
    (song) => !playlistSongIds.includes(song._id)
  );

  return (
    <div className="p-6">
 <div className="flex items-center gap-6 mb-8">
   <div className="h-40 w-40 bg-black flex items-center justify-center text-5xl rounded">
          🎧
   </div>
  <div>
  <p className="text-sm uppercase text-gray-400">Playlist</p>
   <h2 className="text-4xl font-bold">{playlist.title}</h2>
   <p className="text-gray-400 mt-2">
   {playlist.songs.length} songs
     </p>
        </div>
  </div>
  <h3 className="text-xl font-semibold mb-4">Songs in Playlist</h3>

      {playlist.songs.length === 0 && (
        <p className="text-gray-400 mb-6">
          No songs in this playlist
        </p>
      )}

      <div className="space-y-2">
        {playlist.songs.map((song) => (
          <div
            key={song._id}
            className="flex justify-between items-center p-3 rounded hover:bg-[#181818] transition"   >
     <div>
     <p className="font-medium">{song.title}</p>
       <p className="text-sm text-gray-400">
       {song.artist}
      </p>
      <audio controls src={song.filePath} className="mt-2" />
     </div>

            <button
              onClick={() => removeSong(song._id)}
              className="text-red-500 hover:text-red-400 text-sm"  >
              Remove
            </button>
          </div>
        ))}
      </div>

      <hr className="my-8 border-gray-800" />

      <h3 className="text-xl font-semibold mb-4">
        Add Songs
      </h3>

      {availableSongs.length === 0 && (
        <p className="text-gray-400">
          No more songs to add
        </p>
      )}

      <div className="space-y-2">
        {availableSongs.map((song) => (
          <div
            key={song._id}
            className="flex justify-between items-center p-3 rounded hover:bg-[#181818] transition"  >
            <div>
              <p className="font-medium">{song.title}</p>
              <p className="text-sm text-gray-400">
                {song.artist}
              </p>
            </div>

            <button
              onClick={() => addSong(song._id)}
              className="text-[#1DB954] hover:underline text-sm font-medium"  >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
