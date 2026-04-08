import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiLogIn,
  FiActivity,
  FiShield,
  FiCpu,
  FiLayout,
  FiTruck,
  FiBox,
  FiChevronLeft,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

export default function ModernLogin() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [crmType, setCrmType] = useState("car");
  const [loginMode, setLoginMode] = useState("owner");

  const CRM_CONFIG = {
    car: { label: "Car Garage", icon: FiTruck },
    bike: { label: "Bike Workshop", icon: FiActivity },
    wash: { label: "Wash Center", icon: FiBox },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.identifier || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Staff must login with email
    if (loginMode === "staff" && !formData.identifier.includes("@")) {
      setError("Staff must login using email address");
      setIsLoading(false);
      return;
    }

    try {
      let loginUrl = "";
      let payload = {};

      // =========================
      // 👷 STAFF LOGIN
      // =========================
      if (loginMode === "staff") {
        // 🚿 WASH STAFF
        if (crmType === "wash") {
          loginUrl = `${import.meta.env.VITE_API_BASE_URL}/api/teams/wash-staff/login`;
          payload = {
            email: formData.identifier.trim().toLowerCase(),
            password: formData.password,
          };
        }

        // 🚗 CAR STAFF
        else if (crmType === "car") {
          loginUrl = `${import.meta.env.VITE_API_BASE_URL}/api/staff-auth/login`;
          payload = {
            email: formData.identifier.trim().toLowerCase(),
            password: formData.password,
            crmType: "CAR",
          };
        }

        // 🏍 BIKE STAFF
        else {
          loginUrl = `${import.meta.env.VITE_API_BASE_URL}/api/bikes-team/login`;
          payload = {
            email: formData.identifier.trim().toLowerCase(),
            password: formData.password,
            crmType: crmType.toUpperCase(),
          };
        }
      }

      // =========================
      // 👤 OWNER LOGIN
      // =========================
      else {
        loginUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`;
        payload = {
          identifier: formData.identifier.trim(),
          password: formData.password,
          crmType,
        };
      }

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid login");
        setIsLoading(false);
        return;
      }

      // Save auth
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("crmType", crmType);
      // ✅ ADD THIS LINE (VERY IMPORTANT)
      localStorage.setItem("userId", data.user.id);
      
      // Redirect
      navigate(`/${crmType}-dashboard`);
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col ${
        isDark ? "bg-[#000814] text-white" : "bg-white text-black"
      }`}
    >
      {/* --- Terminal Navigation Bar --- */}
      <div
        className={`w-full py-4 px-6 border-b flex justify-between items-center ${
          isDark
            ? "border-white/5 bg-[#001F3F]/30"
            : "border-slate-100 bg-[#F8FAFC]"
        }`}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-black dark:hover:text-white transition-all"
        >
          <FiChevronLeft size={16} /> Back to System Home
        </button>
        <div className="flex items-center gap-2">
          <FiActivity className="text-green-500" size={14} />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Auth_Gateway: Active
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6">
        {/* --- System Header --- */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-lg border mb-6 ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#001F3F]">
              V1.0 Terminal Entry Protocol
            </span>
          </div>
          <h1
            className={`text-4xl lg:text-6xl font-black tracking-tighter mb-4 uppercase ${
              isDark ? "text-white" : "text-[#001F3F]"
            }`}
          >
            System{" "}
            <span className="font-light italic lowercase">Authentication.</span>
          </h1>
        </div>

        {/* --- Authentication Console (Browser Style) --- */}
        <div
          className={`relative w-full max-w-lg rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
            isDark
              ? "bg-[#001F3F] border-white/5 shadow-2xl"
              : "bg-white border-[#CBD5E1] shadow-xl"
          }`}
        >
          {/* Browser Navigation Controls */}
          <div
            className={`px-6 py-3 border-b flex gap-2 ${isDark ? "bg-white/5" : "bg-[#F8FAFC]"}`}
          >
            <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
          </div>

          <div className="p-10">
            {/* Infrastructure Selector HUB */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-1.5 grid grid-cols-3 gap-1.5 mb-10 shadow-inner">
              {Object.entries(CRM_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setCrmType(key)}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    crmType === key
                      ? "bg-[#001F3F] text-white shadow-lg"
                      : "text-slate-400 hover:text-[#001F3F]"
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>

            {/* Login Mode Toggle Protocol */}
            <div className="relative flex w-full p-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl mb-10">
              <div
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  loginMode === "staff" ? "translate-x-full" : "translate-x-0"
                } bg-[#001F3F]`}
              />

              <button
                onClick={() => setLoginMode("owner")}
                className={`relative z-10 flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                  loginMode === "owner" ? "text-white" : "text-slate-400"
                }`}
              >
                Owner Node
              </button>
              <button
                onClick={() => setLoginMode("staff")}
                className={`relative z-10 flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                  loginMode === "staff" ? "text-white" : "text-slate-400"
                }`}
              >
                Staff Node
              </button>
            </div>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-sm rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Identity Name"
                icon={<FiUser />}
                name="identifier"
                value={formData.identifier}
                onChange={handleInputChange}
                placeholder="Email or Username"
                isDark={isDark}
              />

              <div className="space-y-3 relative">
                <label
                  className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
                >
                  <FiLock className="text-blue-500" /> Access Protocol
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-5 py-4 rounded-xl border-2 outline-none transition-all text-[12px] font-bold ${
                      isDark
                        ? "bg-white/5 border-white/10 focus:border-white text-white"
                        : "bg-[#F8FAFC] border-[#CBD5E1] focus:border-[#001F3F] text-[#001F3F]"
                    }`}
                    placeholder="Security Token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#001F3F]"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Initialize Command Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 rounded-xl bg-[#001F3F] text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-black border border-white/10 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <FiActivity className="animate-spin" />
                ) : (
                  <>
                    Initialize Session <FiLogIn />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <FiShield className="text-green-500" />
                <span>Secure Transmission Active: 256-bit AES</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Micro Registry Footer --- */}
        <p className="mt-12 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
          © {new Date().getFullYear()} MotorDesk Platform • Node Entry
          Restricted
        </p>
      </div>
    </div>
  );
}

const InputField = ({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder,
  isDark,
}) => (
  <div className="space-y-3">
    <label
      className={`text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
    >
      {React.cloneElement(icon, { className: "text-blue-500" })} {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      required
      className={`w-full px-5 py-4 rounded-xl border-2 outline-none transition-all text-[12px] font-bold ${
        isDark
          ? "bg-white/5 border-white/10 focus:border-white text-white"
          : "bg-[#F8FAFC] border-[#CBD5E1] focus:border-[#001F3F] text-[#001F3F]"
      }`}
      placeholder={placeholder}
    />
  </div>
);
