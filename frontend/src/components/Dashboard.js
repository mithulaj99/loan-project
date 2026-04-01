import React, { useState } from "react";
import LoanForm from "./LoanForm";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("loan");
  const [history, setHistory] = useState([]);
  const [latestResult, setLatestResult] = useState(null);

  const handleLogout = () => {
    window.location.href = "/";
  };

  // 🔹 Receive result from LoanForm
  const handleNewResult = (result) => {
    setLatestResult(result);
    setHistory([result, ...history]);
    setActiveTab("dashboard");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return latestResult ? (
          <div style={styles.card}>
            <h3>Latest Prediction</h3>
            <p><b>Approval:</b> {latestResult.probability_of_paying_back}%</p>
            <p><b>Interest:</b> {latestResult.predicted_interest_rate_percent}%</p>
            <p><b>EMI:</b> ₹{latestResult.predicted_monthly_installment}</p>
          </div>
        ) : (
          <h3>No prediction yet</h3>
        );

      case "loan":
        return <LoanForm onResult={handleNewResult} />;

      case "history":
        return history.length === 0 ? (
          <h3>No history found</h3>
        ) : (
          history.map((item, index) => (
            <div key={index} style={styles.card}>
              <p><b>Approval:</b> {item.probability_of_paying_back}%</p>
              <p><b>Interest:</b> {item.predicted_interest_rate_percent}%</p>
              <p><b>EMI:</b> ₹{item.predicted_monthly_installment}</p>
            </div>
          ))
        );

      case "settings":
        return (
          <div style={styles.card}>
            <h3>Loan Settings</h3>

            <label>Default Interest Range</label>
            <input style={styles.input} placeholder="e.g. 8% - 16%" />

            <label>Max Loan Amount</label>
            <input style={styles.input} placeholder="e.g. 10,00,000" />

            <label>Preferred Loan Type</label>
            <select style={styles.input}>
              <option>Personal</option>
              <option>Home</option>
              <option>Car</option>
              <option>Business</option>
            </select>

            <button style={styles.saveBtn}>Save Settings</button>
          </div>
        );

      default:
        return <h2>Dashboard</h2>;
    }
  };

  return (
    <div style={styles.container}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>Loan AI</h2>

        <ul style={styles.menu}>
          

          <li
            style={activeTab === "loan" ? styles.active : styles.item}
            onClick={() => setActiveTab("loan")}
          >
            💰 Loan
          </li>

        


          <li
            style={activeTab === "settings" ? styles.active : styles.item}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ Settings
          </li>

          <li style={styles.item} onClick={handleLogout}>
            🚪 Logout
          </li>
        </ul>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h1 style={styles.title}>Loan Prediction Dashboard</h1>
        {renderContent()}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh" },

  sidebar: {
    width: "220px",
    background: "#1e293b",
    color: "#fff",
    padding: "20px",
  },

  logo: { marginBottom: "30px" },

  menu: { listStyle: "none", padding: 0 },

  item: {
    padding: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    borderRadius: "5px",
  },

  active: {
    padding: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    borderRadius: "5px",
    background: "#334155",
  },

  main: {
    flex: 1,
    padding: "20px",
    background: "#f1f5f9",
  },

  title: { marginBottom: "20px" },

  card: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  input: {
    width: "100%",
    padding: 8,
    marginBottom: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
  },

  saveBtn: {
    background: "#0be412",
    color: "#fff",
    padding: 10,
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
};

export default Dashboard;