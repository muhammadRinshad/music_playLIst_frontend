import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!emailOrUsername.trim() && !password.trim()) return setError("All fields are required");
      if (!emailOrUsername.trim()) return setError("Email or username is required");
      if (!password.trim()) return setError("Password is required");

      await login(emailOrUsername, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      setError("Invalid email/username or password");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="w-full max-w-md relative z-10 animate-fadeSlideUp">
        <div className="glass-card p-8 sm:p-10 rounded-2xl shadow-2xl shadow-black/30">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              ♪
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome to <span className="gradient-text">MusicPlay</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-1">Sign in to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email or username</label>
              <input
                type="text"
                placeholder="you@example.com or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
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
              Sign In
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-emerald-500 font-medium hover:text-emerald-400 transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
