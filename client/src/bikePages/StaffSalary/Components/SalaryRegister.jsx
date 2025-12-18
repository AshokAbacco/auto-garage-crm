//  client/src/bikePages/StaffSalary/Components/SalaryRegister.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const SalaryRegister = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const user = {
      username: username.trim(),
      password: password.trim(),
    };

    // SAVE EXACT KEY
    localStorage.setItem(
      "salaryRegisteredUser",
      JSON.stringify(user)
    );

    alert("Registration successful. Please login.");
    navigate("/salary-login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Salary Register
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

        <button className="w-full bg-green-600 text-white py-3 rounded">
          Register
        </button>

        <p className="text-center mt-4 text-sm">
          Already registered?{" "}
          <Link to="/salary-login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SalaryRegister;
