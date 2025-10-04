import React, { useState } from "react";
import { loginUser, setAuthToken } from "../utils/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setMsg("");

  try {
    console.log("Attempting login with:", form); // Debug log
    const response = await loginUser(form);
    console.log("Login response:", response.data); // Debug log

    const { token, role } = response.data; // assuming API returns role

    if (!token) {
      throw new Error("No token received from server");
    }

    // Store the token properly
    setAuthToken(token);
    console.log("Token stored in localStorage"); // Debug log

    setMsg("✅ Login successful! Redirecting...");

    // Navigate based on role
    setTimeout(() => {
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/game");
      }
    }, 1500);
  } catch (err) {
    console.error("Login error:", err); // Debug log
    const errorMsg = err.response?.data?.message || err.message || "Login failed";
    setMsg("❌ " + errorMsg);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full border-2 rounded-lg p-3 focus:outline-none focus:border-purple-500 border-gray-300"
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border-2 rounded-lg p-3 focus:outline-none focus:border-purple-500 border-gray-300"
            required
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {msg && (
          <p className={`mt-4 text-center p-2 rounded ${
            msg.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {msg}
          </p>
        )}

        <p className="text-center mt-4 text-gray-500">
          Don't have an account?{" "}
          <span 
            className="text-purple-600 cursor-pointer hover:underline" 
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;