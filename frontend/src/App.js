import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard"; // ✅ NEW

function App() {
  return (
    <Router>
      <Routes>

        {/* ✅ Default route → Login */}
        <Route path="/" element={<Login />} />

        {/* ✅ Register page */}
        <Route path="/register" element={<Register />} />

        {/* ✅ Dashboard (contains LoanForm inside) */}
        <Route path="/loan" element={<Dashboard />} />

        {/* ✅ Handle unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;