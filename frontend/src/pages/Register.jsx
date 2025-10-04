import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api"; // backend base URL

function Register() {
  const [form, setForm] = useState({ username: "", password: "", role: "player" });
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  // Username validation
  const validateUsername = (username) => {
    if (!username || username.length < 3 || username.length > 20) return "3-20 chars required";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Only letters, numbers, _ allowed";
    return "";
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password || password.length < 6) return "Min 6 characters";
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) return "Must contain at least one letter and one number";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "username") setErrors({ ...errors, username: validateUsername(value) });
    if (name === "password") setErrors({ ...errors, password: validatePassword(value) });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  const usernameError = validateUsername(form.username);
  const passwordError = validatePassword(form.password);

  if (usernameError || passwordError) {
    setErrors({ username: usernameError, password: passwordError });
    setMsg("❌ Fix validation errors");
    return;
  }

  setIsLoading(true);
  setMsg("");

  try {
    // Single API endpoint for all roles
    const res = await axios.post(`${API_BASE}/auth/register`, form);
    const { message, role } = res.data; // assuming API returns role

    setMsg("✅ " + message);
    setIsLoading(false);

    // Redirect based on role after 2 seconds
    setTimeout(() => {
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/login"); // regular user goes to login
      }
    }, 2000);
  } catch (err) {
    const errorMsg = err.response?.data?.message || "Registration failed";
    setMsg("❌ " + errorMsg);
    setIsLoading(false);
  }
};

  const isFormValid = () => form.username && form.password && !errors.username && !errors.password;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center text-purple-600">Create Account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="username"
            placeholder="Username (3-20 chars)"
            value={form.username}
            onChange={handleChange}
            className={`border-2 rounded-lg p-3 focus:outline-none ${errors.username ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}

          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars, letter + number)"
            value={form.password}
            onChange={handleChange}
            className={`border-2 rounded-lg p-3 focus:outline-none ${errors.password ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border-2 rounded-lg p-3 focus:outline-none border-gray-300"
          >
            <option value="player">🎮 Player</option>
            <option value="admin">👑 Admin</option>
          </select>

          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="bg-purple-600 text-white p-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {msg && (
          <p className={`mt-4 text-center p-2 rounded ${msg.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {msg}
          </p>
        )}

        <p className="text-center mt-4 text-gray-500 text-sm">
          Already have an account?{" "}
          <span className="text-purple-600 cursor-pointer hover:underline" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
