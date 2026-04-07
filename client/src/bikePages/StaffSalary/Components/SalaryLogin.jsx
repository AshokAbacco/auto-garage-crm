import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { salaryLogin } from "./auth";
import api from "../../../utils/axiosInstance";
import { Mail, Lock, LogIn, Sun, Moon, DollarSign, CheckCircle, Shield, Crown } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

const SalaryLogin = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!identifier || !password) {
      setError("Email/Username and password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/login", {
        identifier,
        password,
        crmType: "bike",
      });

      const user = res.data.user;

      // 🔐 STRICT ACCESS RULES
      if (user.role !== "user") {
        setError("Only ADMIN can access Salary module");
        setLoading(false);
        return;
      }

      if (user.plan !== "PREMIUM") {
        setError("Premium plan required to access Salary module");
        setLoading(false);
        return;
      }

      // ✅ Login success
      salaryLogin();
      localStorage.setItem("token", res.data.token);

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/salary-manage");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100 ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Login Successful!
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Redirecting to salary management...
              </p>
              <div className="mt-4">
                <div className="w-8 h-8 border-4 border-[#023067] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`min-h-screen flex items-center justify-center px-4 py-8 transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gradient-to-br from-blue-50 via-white to-blue-50"}`}>
        
        {/* Theme Toggle Button */}
      

        <div className={`w-full max-w-md rounded-3xl shadow-2xl p-8 transition-all duration-300 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}`}>
          
          {/* Logo/Header Section */}
          <div className="flex flex-col items-center mb-8">
            <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${isDark ? "bg-gradient-to-br from-[#023067] to-[#034a9f]" : "bg-gradient-to-br from-[#023067] to-[#045aa8]"}`}>
              <DollarSign className="text-white" size={40} />
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Salary Admin Login</h2>
            <p className={`text-sm text-center ${isDark ? "text-gray-400" : "text-gray-600"}`}>Access salary management system</p>
            
            {/* Access Requirements Badges */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${isDark ? "bg-blue-900/30 text-blue-400 border border-blue-800" : "bg-blue-100 text-blue-700 border border-blue-200"}`}>
                <Shield size={14} />
                <span>Admin Only</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${isDark ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800" : "bg-yellow-100 text-yellow-700 border border-yellow-200"}`}>
                <Crown size={14} />
                <span>Premium</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-xl border transition-all duration-300 ${isDark ? "bg-red-900/20 border-red-800 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email/Username Input */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Email or Username
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-[#023067]`} size={20} />
                <input
                  type="text"
                  placeholder="Enter your email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onKeyPress={handleKeyPress}
                  required
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-[#023067] focus:bg-gray-750" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#023067] focus:bg-blue-50/30"} hover:border-[#023067] focus:shadow-lg focus:shadow-[#023067]/20`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-[#023067]`} size={20} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  required
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-300 outline-none ${isDark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-[#023067] focus:bg-gray-750" : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#023067] focus:bg-blue-50/30"} hover:border-[#023067] focus:shadow-lg focus:shadow-[#023067]/20`}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#023067] to-[#045aa8] hover:from-[#034a9f] hover:to-[#0670c9] hover:shadow-xl hover:shadow-[#023067]/30 hover:scale-[1.02] active:scale-[0.98]"}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogIn size={20} />
                  <span>Login to Salary Module</span>
                </div>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className={`text-center text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              <p className="mb-1">⚠️ Restricted Access Module</p>
              <p>Requires Admin role & Premium plan</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalaryLogin;