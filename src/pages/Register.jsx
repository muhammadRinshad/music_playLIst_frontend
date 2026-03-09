import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (username.trim().length < 3) return setError("Username must be at least 3 characters");
    if (username.trim().length > 20) return setError("Username must be at most 20 characters");
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      return setError("Username can only contain letters, numbers, and underscores");
    }
    if (!email.trim()) return setError("Email is required");
    if (password.trim().length <= 6) return setError("Password needs at least 6 characters");

    try {
      await API.post("/addUser", { username: username.trim(), email, password });
      await login(email, password);
      toast.success("Account created! Welcome.");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Something went wrong";
      setError(typeof msg === "string" ? msg : "Something went wrong");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="w-full max-w-md relative z-10 animate-fadeSlideUp">
        <div className="glass-card p-8 sm:p-10 rounded-2xl shadow-2xl shadow-black/30">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              ♪
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Create your <span className="gradient-text">account</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1">Start building your playlist</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Username</label>
              <input
                type="text"
                placeholder="e.g. johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
              <p className="text-xs text-zinc-500 mt-1">3-20 characters, letters, numbers, underscores only</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900/80 border border-zinc-700/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-semibold hover:from-emerald-400 hover:to-emerald-500 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/" className="text-emerald-500 font-medium hover:text-emerald-400 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
