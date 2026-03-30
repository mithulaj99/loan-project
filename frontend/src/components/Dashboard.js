import React from "react";
import LoanForm from "./LoanForm";

function Dashboard() {
  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>Loan AI</h2>

        <ul style={styles.menu}>
          <li style={styles.menuItem}>🏠 Dashboard</li>
          <li style={styles.menuItem}>💰 Loan</li>
          <li style={styles.menuItem}>📊 History</li>
          <li style={styles.menuItem}>⚙️ Settings</li>
          <li style={styles.menuItem}>🚪 Logout</li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>
        <h1 style={styles.title}>Loan Prediction Dashboard</h1>

        {/* Loan Form inside dashboard */}
        <LoanForm />
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: "220px",
    background: "#1e293b",
    color: "#fff",
    padding: "20px",
  },
  logo: {
    marginBottom: "30px",
  },
  menu: {
    listStyle: "none",
    padding: 0,
  },
  menuItem: {
    padding: "10px",
    marginBottom: "10px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  main: {
    flex: 1,
    padding: "20px",
    background: "#f1f5f9",
  },
  title: {
    marginBottom: "20px",
  },
};

export default Dashboard;