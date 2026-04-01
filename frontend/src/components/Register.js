import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {

      const res = await axios.post(
        "https://loan-backend-fy3w.onrender.com/register/",   // ✅ FIXED URL
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

      alert(res.data.message || "Registration successful");

      navigate("/");

    } catch (error) {

      console.error("Register error:", error);

      if (error.response) {
        alert(error.response.data.error || "Registration failed");
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

        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p>
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>

      </div>

    </div>

  );
}

export default Register;