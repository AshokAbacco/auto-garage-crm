import React, { useState } from "react";
import {
  Car,
  Bike,
  Droplets,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  UserCircle2,
  Building2,
} from "lucide-react";
import PublicLayout from "../../components/PublicLayout";

// Update this path if needed
const LOGO_PATH = "/Logos/transLogo.png";

const CRM_TYPES = [
  {
    key: "car",
    label: "Car",
    icon: Car,
    activeClass:
      "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600",
  },
  {
    key: "bike",
    label: "Bike",
    icon: Bike,
    activeClass:
      "border-orange-600 bg-orange-50 text-orange-700 ring-1 ring-orange-600",
  },
  {
    key: "wash",
    label: "Wash",
    icon: Droplets,
    activeClass:
      "border-cyan-600 bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600",
  },
];

export default function LoginAndroid() {
  const [crmType, setCrmType] = useState("car");
  const [loginMode, setLoginMode] = useState("owner"); // owner | staff
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
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
      setError("Staff must login using email");
      setLoading(false);
      return;
    }

    try {
      let loginUrl = "";
      let payload = {};

      // 👷 STAFF LOGIN
      if (loginMode === "staff") {
        if (crmType === "wash") {
          loginUrl = `${
            import.meta.env.VITE_API_BASE_URL
          }/api/teams/wash-staff/login`;
          payload = {
            email: formData.identifier.toLowerCase(),
            password: formData.password,
          };
        } else if (crmType === "car") {
          loginUrl = `${
            import.meta.env.VITE_API_BASE_URL
          }/api/staff-auth/login`;
          payload = {
            email: formData.identifier.toLowerCase(),
            password: formData.password,
            crmType: "CAR",
          };
        } else {
          loginUrl = `${
            import.meta.env.VITE_API_BASE_URL
          }/api/bikes-team/login`;
          payload = {
            email: formData.identifier.toLowerCase(),
            password: formData.password,
            crmType: crmType.toUpperCase(),
          };
        }
      }
      // 👤 OWNER LOGIN
      else {
        loginUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`;
        payload = {
          identifier: formData.identifier,
          password: formData.password,
          crmType,
        };
      }

      const res = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid login credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("crmType", crmType);

      window.location.href = `/${crmType}-dashboard`;
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white text-slate-800 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm flex flex-col gap-6">
          {/* === HEADER SECTION === */}
          {/* Added a bottom border and padding to separate it cleanly from the form */}
          <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-100">
            <div className="w-32 h-auto mb-3">
              <img
                src={LOGO_PATH}
                alt="The Motor Desk"
                className="w-full h-full object-contain"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Sign in to manage your garage
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* === SELECTORS === */}
            <div className="space-y-4">
              {/* 1. CRM Type Selector (Cards) */}
              {/* Borders are now slate-300 (darker) by default for better visibility */}
              <div className="grid grid-cols-3 gap-3">
                {CRM_TYPES.map(({ key, label, icon: Icon, activeClass }) => {
                  const isSelected = crmType === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCrmType(key)}
                      className={`relative py-3 px-2 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-2
                      ${
                        isSelected
                          ? activeClass + " shadow-sm"
                          : "bg-white border-slate-300 text-slate-400 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={22} strokeWidth={2} />
                      <span className="text-[11px] font-bold uppercase tracking-wide">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 2. Login Mode Toggle */}
              <div className="bg-slate-100 p-1.5 rounded-xl flex relative border border-slate-200">
                <div
                  className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-white shadow-sm border border-slate-200 rounded-lg transition-all duration-300 ease-out
                ${
                  loginMode === "staff"
                    ? "translate-x-[100%] left-1.5"
                    : "translate-x-0 left-1.5"
                }
                `}
                />
                <button
                  type="button"
                  onClick={() => setLoginMode("owner")}
                  className={`flex-1 relative z-10 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors
                  ${
                    loginMode === "owner" ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  <Building2 size={16} /> Owner
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode("staff")}
                  className={`flex-1 relative z-10 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors
                  ${
                    loginMode === "staff" ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  <UserCircle2 size={16} /> Staff
                </button>
              </div>
            </div>

            {/* === INPUT FIELDS === */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">
                  {loginMode === "staff" ? "Staff Email" : "Username / Email"}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  {/* Darker border (slate-300) for inputs */}
                  <input
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder={
                      loginMode === "staff" ? "employee@example.com" : "admin"
                    }
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  {/* Darker border (slate-300) for inputs */}
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-medium text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* === ERROR & SUBMIT === */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-md shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="text-center space-y-2 pt-4">
            <p className="text-[10px] text-slate-400 font-medium">
              © Abacco Technology • V2.0 Mobile
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
