import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        "http://localhost:8000/api/register/",
        {
          username,
          password
        }
      );

      alert(res.data.message);

      navigate("/");

    } catch (error) {

      if (error.response) {
        alert(error.response.data.error);
      } else {
        alert("Backend not reachable");
      }

    }

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

          <button type="submit">Register</button>

        </form>

        <p>
          Already have an account?  
          <Link to="/">Login</Link>
        </p>

      </div>

    </div>

  );
}

export default Register;