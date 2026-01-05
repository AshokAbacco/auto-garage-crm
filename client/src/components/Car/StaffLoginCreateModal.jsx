import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

const API = import.meta.env.VITE_API_BASE_URL;

export default function StaffLoginCreateModal({ staff, onClose, onSaved }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const submit = async () => {
    if (!form.email || !form.password) {
      return setError("Email and password are required");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/staff-auth/create/${staff.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create login");
        return;
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div
        className={`w-96 rounded-lg p-6 ${
          isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        } border`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`}
        >
          Create Staff Login
        </h2>

        <div
          className={`mb-3 text-sm ${
            isDark ? "text-slate-400" : "text-gray-600"
          }`}
        >
          Staff:{" "}
          <strong className={isDark ? "text-slate-100" : "text-slate-900"}>
            {staff.name}
          </strong>
        </div>

        <input
          type="email"
          name="email"
          placeholder="Login Email"
          value={form.email}
          onChange={handleChange}
          className={`border p-2 w-full mb-2 ${
            isDark
              ? "bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
              : "bg-white border-gray-300 text-slate-900"
          }`}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className={`border p-2 w-full mb-2 ${
            isDark
              ? "bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
              : "bg-white border-gray-300 text-slate-900"
          }`}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          className={`border p-2 w-full mb-2 ${
            isDark
              ? "bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-400"
              : "bg-white border-gray-300 text-slate-900"
          }`}
        />

        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded transition-colors ${
              isDark
                ? "border-slate-600 text-slate-300 hover:bg-slate-800"
                : "border-gray-300 text-slate-700 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? "Creating..." : "Create Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
