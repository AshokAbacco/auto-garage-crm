import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { X, Mail, Lock, User, Loader2, ShieldCheck } from "lucide-react";

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

  const submit = async (e) => {
    e.preventDefault(); // Prevent form default submission

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

  // Theme classes helper
  const inputBaseClass = `w-full pl-10 pr-4 py-3 rounded-lg border outline-none transition-all duration-200 ${
    isDark
      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
  }`;

  const iconClass = `absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${
    isDark ? "text-slate-500" : "text-gray-400"
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg transform rounded-2xl shadow-2xl transition-all ${
          isDark ? "bg-slate-900 border border-slate-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? "border-slate-800" : "border-gray-100"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Create Staff Access
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Set up login credentials for this employee.
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? "hover:bg-slate-800 text-slate-400"
                : "hover:bg-gray-100 text-slate-500"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {/* Staff Identity Badge */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              isDark
                ? "bg-slate-800/50 border-slate-700"
                : "bg-blue-50 border-blue-100"
            }`}
          >
            <div
              className={`p-2 rounded-full ${
                isDark ? "bg-slate-700" : "bg-white"
              }`}
            >
              <User
                size={20}
                className={isDark ? "text-slate-300" : "text-blue-600"}
              />
            </div>
            <div>
              <p
                className={`text-xs font-medium uppercase tracking-wider ${
                  isDark ? "text-slate-400" : "text-blue-600"
                }`}
              >
                Assigning to
              </p>
              <p
                className={`font-semibold ${
                  isDark ? "text-slate-200" : "text-slate-900"
                }`}
              >
                {staff.name}
              </p>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <div className="relative">
              <Mail className={iconClass} />
              <input
                type="email"
                name="email"
                placeholder="Work Email Address"
                value={form.email}
                onChange={handleChange}
                className={inputBaseClass}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className={inputBaseClass}
                />
              </div>

              <div className="relative">
                <ShieldCheck className={iconClass} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={inputBaseClass}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "text-slate-600 hover:bg-gray-100 hover:text-slate-900"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
