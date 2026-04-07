// StaffEditModal.jsx
import React, { useState } from "react";
import {
  X,
  User,
  Briefcase,
  Mail,
  Lock,
  IndianRupee,
  TrendingDown,
  Loader2,
  Save,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const API = import.meta.env.VITE_API_BASE_URL;

export default function StaffEditModal({ staff, onClose, onSaved }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ...staff,
    email: staff.login?.email || "",
    password: "", // Default empty means "don't change"
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/car-staff/${staff.id}`, {
        method: "PUT",
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
        alert(err.message || "Failed to update staff");
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
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-5 border-b z-10 ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-100 bg-white"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Edit Staff Details
            </h2>
            <p
              className={`text-sm mt-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Update information for{" "}
              <span className="font-medium text-indigo-600">{staff.name}</span>
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

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Section 1: Identity & Access */}
          <div className="space-y-4">
            <h3
              className={`text-sm font-bold border-b pb-2 ${
                isDark
                  ? "text-slate-100 border-slate-800"
                  : "text-slate-900 border-slate-100"
              }`}
            >
              Identity & Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="Full Name"
                name="name"
                icon={User}
                value={form.name}
                onChange={handleChange}
                isDark={isDark}
                placeholder="Staff Name"
              />
              <InputGroup
                label="Role / Position"
                name="role"
                icon={Briefcase}
                value={form.role}
                onChange={handleChange}
                isDark={isDark}
                placeholder="Job Title"
              />
              <InputGroup
                label="Login Email"
                name="email"
                icon={Mail}
                value={form.email}
                onChange={handleChange}
                isDark={isDark}
                placeholder="email@example.com"
              />
              <InputGroup
                label="Password"
                name="password"
                icon={Lock}
                type="password"
                value={form.password}
                onChange={handleChange}
                isDark={isDark}
                placeholder="Leave empty to keep current"
              />
            </div>
          </div>

          {/* Section 2: Payroll Configuration */}
          <div className="space-y-4">
            <h3
              className={`text-sm font-bold border-b pb-2 ${
                isDark
                  ? "text-slate-100 border-slate-800"
                  : "text-slate-900 border-slate-100"
              }`}
            >
              Payroll Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup
                label="Base Salary"
                name="baseSalary"
                icon={IndianRupee}
                type="number"
                value={form.baseSalary}
                onChange={handleChange}
                isDark={isDark}
                placeholder="0.00"
              />
              <InputGroup
                label="Monthly Bonus"
                name="bonusDefault"
                icon={IndianRupee}
                type="number"
                value={form.bonusDefault}
                onChange={handleChange}
                isDark={isDark}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Section 3: Deductions & Attendance */}
          <div className="space-y-4">
            <h3
              className={`text-sm font-bold border-b pb-2 ${
                isDark
                  ? "text-slate-100 border-slate-800"
                  : "text-slate-900 border-slate-100"
              }`}
            >
              Deductions & Attendance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputGroup
                label="Deduction Per Leave"
                name="deductionPerLeave"
                icon={TrendingDown}
                type="number"
                value={form.deductionPerLeave}
                onChange={handleChange}
                isDark={isDark}
                placeholder="0.00"
              />
              <InputGroup
                label="Extra Deductions"
                name="extraDeductionsDefault"
                icon={TrendingDown}
                type="number"
                value={form.extraDeductionsDefault}
                onChange={handleChange}
                isDark={isDark}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-5 border-t flex justify-end gap-3 z-10 ${
            isDark
              ? "border-slate-800 bg-slate-800/50"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <button
            onClick={onClose}
            type="button"
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
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform active:scale-95"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ MOVED OUTSIDE: This prevents the component from re-mounting on every keystroke
const InputGroup = ({
  label,
  name,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  isDark,
  className = "",
}) => (
  <div className={`space-y-1.5 ${className}`}>
    <label
      className={`text-xs font-semibold uppercase tracking-wider ${
        isDark ? "text-slate-400" : "text-slate-500"
      }`}
    >
      {label}
    </label>
    <div className="relative group">
      <Icon
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
        size={18}
      />
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
          isDark
            ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400"
            : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
        }`}
      />
    </div>
  </div>
);
