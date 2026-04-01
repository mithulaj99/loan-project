import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "https://loan-backend-fy3w.onrender.com/login/",   // ✅ FIXED URL
        {
          username: username,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if (res.status === 200) {
        alert(res.data.message || "Login successful");
        navigate("/loan");
      }

    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        alert(error.response.data.error || "Invalid credentials");
      } else if (error.request) {
        alert("No response from backend");
      } else {
        alert("Error: " + error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Loan Predictor Login</h2>

        <form onSubmit={handleLogin}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p>
          Don't have an account?{" "}
          <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;