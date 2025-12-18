// client/src/bikePages/StaffSalary/Components/SalaryLogin.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { salaryLogin } from "./auth";

const SalaryLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const stored = localStorage.getItem("salaryRegisteredUser");

    if (!stored) {
      alert("No registered user found. Please register.");
      return;
    }

    const savedUser = JSON.parse(stored);

    // 🔑 STRICT COMPARISON (TRIMMED)
    if (
      savedUser.username === username.trim() &&
      savedUser.password === password.trim()
    ) {
      salaryLogin(savedUser);
      navigate("/salary-manage");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Salary Login
        </h2>

        <input
          className="w-full border p-3 rounded mb-4"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          className="w-full border p-3 rounded mb-4"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-blue-600 text-white py-3 rounded">
          Login
        </button>

        <p className="text-center mt-4 text-sm">
          No account?{" "}
          <Link to="/salary-register" className="text-blue-600 font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SalaryLogin;
