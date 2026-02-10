
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
           if (!email.trim()&&!password.trim()) return setError("all field is required");
     if (!email.trim()) return setError("email is required");
          if (!password.trim()) return setError("password is required");
      
      await login(email, password);
      toast.success("loggin succesfull...");

      navigate("/dashboard");
    } catch {
      alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <form
        onSubmit={handleSubmit}
        className="bg-[#181818] p-8 rounded-lg w-full max-w-md shadow-lg"   >
        <h2 className="text-2xl font-bold text-center mb-6">
          Login to <span className="text-[#1DB954]">Music Playlist</span>
        </h2>
         {error && (
          <p className="mb-4 text-sm text-red-500 text-center">
            {error}
          </p>
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          onChange={(e) => setEmail(e.target.value)}
          required  />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          onChange={(e) => setPassword(e.target.value)}
          required   />

        <button
          type="submit"
          className="w-full bg-[#1DB954] text-black py-2 rounded-full font-semibold hover:scale-105 transition" >
          Login
        </button>
      </form>
    </div>
  );
}
