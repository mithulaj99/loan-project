import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

function LoanForm() {
  const [form, setForm] = useState({
    age: "",
    annual_income: "",
    employment_status: "Employed",
    credit_score: "",
    loan_amount: "",
    loan_purpose: "Personal",
    loan_term: "",
  });

  const [files, setFiles] = useState({
    identity_file: null,
    income_file: null,
    address_file: null,
  });

  const [docType, setDocType] = useState({
    identity_type: "Aadhaar Card",
    income_type: "Bank Statement (6 months)",
    address_type: "Ration Card",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleDocTypeChange = (e) => {
    setDocType({ ...docType, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.age || form.age < 18) return "Age must be 18+";
    if (!form.annual_income) return "Income required";
    if (!form.credit_score) return "Credit score required";
    if (!form.loan_amount) return "Loan amount required";
    return null;
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);

    // ✅ FILE VALIDATION
    if (!files.identity_file) return setError("Upload Identity Proof first");
    if (!files.income_file) return setError("Upload Income Proof");
    if (!files.address_file) return setError("Upload Address Proof");

    // ✅ FORM VALIDATION
    const validationError = validateForm();
    if (validationError) return setError(validationError);

    setLoading(true);

    try {
      const formData = new FormData();

      // form fields
      Object.keys(form).forEach((key) =>
        formData.append(key, form[key])
      );

      // document types
      Object.keys(docType).forEach((key) =>
        formData.append(key, docType[key])
      );

      // files
      formData.append("identity_file", files.identity_file);
      formData.append("income_file", files.income_file);
      formData.append("address_file", files.address_file);

      const res = await fetch(
        "https://loan-backend-fy3w.onrender.com/predict/",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Server not reachable");
    }

    setLoading(false);
  };

  const chartData =
    result && {
      labels: result.bank_recommendation.map((b) => b.bank),
      datasets: [
        {
          label: "Interest Rate (%)",
          data: result.bank_recommendation.map(
            (b) => b.interest_rate
          ),
        },
      ],
    };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Loan Prediction System</h2>

        {/* DOCUMENT SECTION */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Upload Documents</p>

          {/* Identity */}
          <label>Identity Proof</label>
          <select
            name="identity_type"
            onChange={handleDocTypeChange}
            style={styles.input}
          >
            <option>Aadhaar Card</option>
            <option>Voter ID</option>
            <option>Passport</option>
          </select>
          <input
            type="file"
            name="identity_file"
            onChange={handleFileChange}
          />

          {/* Income */}
          <label style={{ marginTop: 10 }}>Income Proof</label>
          <select
            name="income_type"
            onChange={handleDocTypeChange}
            style={styles.input}
            disabled={!files.identity_file}
          >
            <option>Bank Statement (6 months)</option>
            <option>Salary Slips (3 months)</option>
          </select>
          <input
            type="file"
            name="income_file"
            onChange={handleFileChange}
            disabled={!files.identity_file}
          />

          {/* Address */}
          <label style={{ marginTop: 10 }}>Address Proof</label>
          <select
            name="address_type"
            onChange={handleDocTypeChange}
            style={styles.input}
            disabled={!files.income_file}
          >
            <option>Ration Card</option>
            <option>Electricity Bill</option>
            <option>Rental Agreement</option>
          </select>
          <input
            type="file"
            name="address_file"
            onChange={handleFileChange}
            disabled={!files.income_file}
          />
        </div>

        {/* FORM INPUTS */}
        <div style={styles.section}>
          <p style={styles.sectionTitle}>Enter Details</p>

          <input style={styles.input} type="number" placeholder="Age" name="age" onChange={handleChange} />
          <input style={styles.input} type="number" placeholder="Annual Income" name="annual_income" onChange={handleChange} />
          <input style={styles.input} type="number" placeholder="Credit Score" name="credit_score" onChange={handleChange} />
          <input style={styles.input} type="number" placeholder="Loan Amount" name="loan_amount" onChange={handleChange} />

          <select style={styles.input} name="employment_status" onChange={handleChange}>
            <option>Employed</option>
            <option>Self employed</option>
            <option>Unemployed</option>
          </select>

          <select style={styles.input} name="loan_purpose" onChange={handleChange}>
            <option>Personal</option>
            <option>Home</option>
            <option>Car</option>
            <option>Business</option>
          </select>

          <input style={styles.input} type="number" placeholder="Loan Term (months)" name="loan_term" onChange={handleChange} />
        </div>

        {/* BUTTON */}
        <button style={styles.button} onClick={handleSubmit}>
          {loading ? "Predicting..." : "Predict Loan"}
        </button>

        {/* ERROR */}
        {error && <p style={styles.error}>{error}</p>}

        {/* RESULT */}
        {result && (
          <div style={styles.resultBox}>
            <h3>Prediction Result</h3>

            <p><b>Approval:</b> {result.probability_of_paying_back}%</p>
            <p><b>Interest:</b> {result.predicted_interest_rate_percent}%</p>
            <p><b>Term:</b> {result.predicted_loan_term_months} months</p>
            <p><b>EMI:</b> ₹{result.predicted_monthly_installment}</p>

            {/* BEST BANK */}
            <div style={styles.bestBank}>
              <h4>🏆 Best Bank</h4>
              <img src={result.best_bank.logo} alt="" style={styles.logo} />
              <a href={result.best_bank.link} target="_blank" rel="noreferrer">
                {result.best_bank.bank}
              </a>
              <p>{result.best_bank.interest_rate}%</p>
            </div>

            {/* BANK LIST */}
            <h4>All Bank Options</h4>
            {result.bank_recommendation.map((bank, i) => (
              <div key={i} style={styles.bankCard}>
                <img src={bank.logo} alt="" style={styles.logo} />
                <a href={bank.link} target="_blank" rel="noreferrer">
                  {bank.bank}
                </a>
                <span>{bank.interest_rate}%</span>
              </div>
            ))}

            {/* CHART */}
            <h4>Interest Comparison</h4>
            <Bar data={chartData} />

            {/* PDF */}
            <button
              style={styles.pdfButton}
              onClick={() =>
                window.open("https://loan-backend-fy3w.onrender.com/download-report/")
              }
            >
              Download Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(to right, #667eea, #764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#fff",
    padding: 25,
    borderRadius: 12,
    width: 420,
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
  },
  heading: { textAlign: "center", marginBottom: 15 },
  section: { marginBottom: 15 },
  sectionTitle: { fontWeight: "bold", marginBottom: 5 },
  input: {
    width: "100%",
    padding: 8,
    marginBottom: 8,
    borderRadius: 5,
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    background: "#f1f1f1",
    borderRadius: 10,
  },
  bestBank: {
    background: "#d4edda",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  bankCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    background: "#fff",
    marginTop: 5,
    borderRadius: 6,
  },
  logo: { width: 35 },
  pdfButton: {
    marginTop: 10,
    width: "100%",
    padding: 10,
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: 5,
  },
  error: { color: "red", marginTop: 10 },
};

export default LoanForm;