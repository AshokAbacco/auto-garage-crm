import React, { useState } from "react";
import { X, User, Briefcase, Phone, IndianRupee, Loader2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const API = import.meta.env.VITE_API_BASE_URL;

export default function StaffCreateModal({ onClose, onSaved }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    baseSalary: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.baseSalary)
      return alert("Name and Salary are required");

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/car-staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create staff");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden transform transition-all scale-100 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-5 border-b ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Add New Staff
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Enter employee details below.
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={save} className="p-6 space-y-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label
              className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Full Name
            </label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>

          {/* Role Field */}
          <div className="space-y-1.5">
            <label
              className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Role / Position
            </label>
            <div className="relative">
              <Briefcase
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g. Mechanic"
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400"
                    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone Field */}
            <div className="space-y-1.5">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Phone
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="98765..."
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>

            {/* Salary Field */}
            <div className="space-y-1.5">
              <label
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Base Salary
              </label>
              <div className="relative">
                <IndianRupee
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  name="baseSalary"
                  type="number"
                  value={form.baseSalary}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div
          className={`p-5 border-t flex justify-end gap-3 ${
            isDark
              ? "border-slate-800 bg-slate-800/50"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              isDark
                ? "text-slate-300 hover:bg-slate-700 border border-slate-600"
                : "text-slate-600 hover:bg-white border border-slate-200"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating..." : "Create Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}
