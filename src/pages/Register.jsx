
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";


export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  //////////////////////////////////////
  const [error, setError] = useState("");
///////////////////////////////////////////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();
    //////////////////////////////////////////////
    if (name.trim().length<=3) return setError("name must be more than 3 charectors");
    if (password.trim().length<=6) return setError("atleast 6 charectors needed in password");

 ///////////////////////////////////////////////
    try {
      const res= await API.post("/addUser", {
        name,
        email,
        password,
      });

    //   alert("Registration successful");
    toast.success("registration successfull");

      navigate("/");
    } catch (error) {
  if (error.response) {
    toast.error(error.response.data);
  } else {
    toast.error("Something went wrong");
  }
}

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212]">
      <div className="bg-[#181818] p-8 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create your <span className="text-[#1DB954]">account</span>
        </h2>
{/* ////////////////////////////// */}
        {error && (
          <p className="mb-4 text-sm text-red-500 text-center">
            {error}
          </p>
        )}
        {/* //////////////////////////////////////////////////////////// */}
        <form onSubmit={handleSubmit}>
     <input
   type="text"
   placeholder="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
            required
            className="w-full mb-4 px-4 py-2 rounded bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]" />

          <input
          type="email"
          placeholder="Email"
          value={email}
         onChange={(e) => setEmail(e.target.value)}
          required
        className="w-full mb-4 px-4 py-2 rounded bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"  />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mb-6 px-4 py-2 rounded bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"  />

          <button
            type="submit"
            className="w-full bg-[#1DB954] text-black py-2 rounded-full font-semibold hover:scale-105 transition"   >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
     <Link to="/" className="text-[#1DB954] hover:underline">
            Login
          </Link>
      </p>
      </div>
    </div>
  );
}
