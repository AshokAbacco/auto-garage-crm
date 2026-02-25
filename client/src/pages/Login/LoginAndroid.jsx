import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiActivity,
  FiBox,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiChevronRight,
  FiShield,
  FiLogIn,
  FiCpu,
  FiChevronLeft,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

const LOGO_PATH = "/Logos/transLogo.png";

const CRM_TYPES = [
  { key: "car", label: "Car Node", icon: FiTruck },
  { key: "bike", label: "Bike Node", icon: FiActivity },
  { key: "wash", label: "Wash Node", icon: FiBox },
];

export default function LoginAndroid() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [crmType, setCrmType] = useState("car");
  const [loginMode, setLoginMode] = useState("owner");
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.identifier || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (loginMode === "staff" && !formData.identifier.includes("@")) {
      setError("Staff must login using email address");
      setLoading(false);
      return;
    }

    try {
      let loginUrl = "";
      let payload = {};

      const BASE_URL = import.meta.env.VITE_API_BASE_URL;

      // ================= STAFF LOGIN =================
      if (loginMode === "staff") {
        if (crmType === "wash") {
          loginUrl = `${BASE_URL}/api/teams/wash-staff/login`;
          payload = {
            email: formData.identifier.trim().toLowerCase(),
            password: formData.password,
          };
        } else if (crmType === "car") {
          loginUrl = `${BASE_URL}/api/staff-auth/login`;
          payload = {
            email: formData.identifier.trim().toLowerCase(),
            password: formData.password,
            crmType: "CAR",
          };
        } else {
          loginUrl = `${BASE_URL}/api/bikes-team/login`;
          payload = {
            email: formData.identifier.trim().toLowerCase(),
            password: formData.password,
            crmType: crmType.toUpperCase(),
          };
        }
      }

      // ================= OWNER LOGIN =================
      else {
        loginUrl = `${BASE_URL}/api/auth/login`;
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
        setLoading(false);
        return;
      }

      // Save auth
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("crmType", crmType);

      // Navigate
      navigate(`/${crmType}-dashboard`);
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col ${
        isDark ? "bg-[#000814] text-white" : "bg-white text-black"
      }`}
    >
      {/* --- Terminal Mobile Header --- */}
      <div
        className={`w-full py-4 px-5 border-b flex justify-between items-center ${
          isDark
            ? "border-white/5 bg-[#001F3F]/30"
            : "border-slate-100 bg-[#F8FAFC]"
        }`}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
        >
          <FiChevronLeft size={16} /> Home
        </button>
        <div className="flex items-center gap-2">
          <FiActivity className="text-green-500" size={14} />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
            Auth_Gateway: Live
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6">
        {/* --- System Registry Header --- */}
        <div className="text-center mb-8">
          <div className="w-24 h-auto mx-auto mb-4">
            <img
              src={LOGO_PATH}
              alt="MotorDesk"
              className="w-full h-full object-contain"
            />
          </div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border mb-4 ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#001F3F]">
              V1.0 Mobile Protocol
            </span>
          </div>
          <h1
            className={`text-3xl font-black tracking-tighter uppercase mb-2 ${
              isDark ? "text-white" : "text-[#001F3F]"
            }`}
          >
            Node{" "}
            <span className="font-light italic lowercase">Authentication.</span>
          </h1>
        </div>

        {/* --- Mobile Authentication Console --- */}
        <div
          className={`relative w-full max-w-sm rounded-[1.5rem] border-2 transition-all duration-500 overflow-hidden ${
            isDark
              ? "bg-[#001F3F] border-white/5 shadow-2xl"
              : "bg-white border-[#CBD5E1] shadow-xl"
          }`}
        >
          {/* OS Navigation UI Dots */}
          <div
            className={`px-4 py-2 border-b flex gap-1.5 ${isDark ? "bg-white/5" : "bg-[#F8FAFC]"}`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/80"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/80"></div>
          </div>

          <div className="p-6">
            {/* Infrastructure Selector HUB */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-1 grid grid-cols-3 gap-1 mb-6 shadow-inner">
              {CRM_TYPES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setCrmType(key)}
                  className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                    crmType === key
                      ? "bg-[#001F3F] text-white shadow-lg"
                      : "text-slate-400"
                  }`}
                >
                  <Icon className="mx-auto mb-1" size={14} />
                  {label}
                </button>
              ))}
            </div>

            {/* Login Mode Toggle Protocol */}
            <div className="relative flex w-full p-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg mb-8">
              <div
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded shadow transition-all duration-500 ${
                  loginMode === "staff" ? "translate-x-full" : "translate-x-0"
                } bg-[#001F3F]`}
              />

              <button
                onClick={() => setLoginMode("owner")}
                className={`relative z-10 flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                  loginMode === "owner" ? "text-white" : "text-slate-400"
                }`}
              >
                Owner Node
              </button>
              <button
                onClick={() => setLoginMode("staff")}
                className={`relative z-10 flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                  loginMode === "staff" ? "text-white" : "text-slate-400"
                }`}
              >
                Staff Node
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Identity ID"
                icon={<FiMail />}
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Username or Email"
                isDark={isDark}
              />

              <div className="space-y-2 relative">
                <label
                  className={`text-[9px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
                >
                  <FiLock className="text-blue-500" /> Access Protocol
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-all text-[11px] font-bold ${
                      isDark
                        ? "bg-white/5 border-white/10 focus:border-white text-white"
                        : "bg-[#F8FAFC] border-[#CBD5E1] focus:border-[#001F3F] text-[#001F3F]"
                    }`}
                    placeholder="Access Token"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <FiEyeOff size={14} />
                    ) : (
                      <FiEye size={14} />
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-xs rounded-lg mb-3">
                  {error}
                </div>
              )}
              {/* Initialize Command Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg bg-[#001F3F] text-white font-black text-[10px] uppercase tracking-[0.25em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <FiActivity className="animate-spin" />
                ) : (
                  <>
                    Initialize Node <FiLogIn />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <div className="flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                <FiShield className="text-green-500" />
                <span>Secure Transmission: 256-Bit</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Micro Registry Footer --- */}
        <p className="mt-8 text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">
          © MotorDesk Platform • Android V2.0
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
  <div className="space-y-2">
    <label
      className={`text-[9px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${isDark ? "text-slate-400" : "text-[#001F3F]"}`}
    >
      {React.cloneElement(icon, { size: 14, className: "text-blue-500" })}{" "}
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      required
      className={`w-full px-4 py-3 rounded-lg border-2 outline-none transition-all text-[11px] font-bold ${
        isDark
          ? "bg-white/5 border-white/10 focus:border-white text-white"
          : "bg-[#F8FAFC] border-[#CBD5E1] focus:border-[#001F3F] text-[#001F3F]"
      }`}
      placeholder={placeholder}
    />
  </div>
);
