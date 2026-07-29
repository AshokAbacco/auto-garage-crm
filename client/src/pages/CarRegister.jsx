//CarRegister.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle,
  UserPlus,
  AlertTriangle,
  XCircle,
  Truck,
} from "lucide-react";

// Note: You'll need to import these from your actual components
// import PublicLayout from "../components/PublicLayout";
// import { useTheme } from "../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Temporary mock for demo purposes
const PublicLayout = ({ children }) => children;
const useTheme = () => ({ isDark: false }); // Locked to light-mode presentation

const CarRegister = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const paymentData = location.state?.paymentData;

  // Redirect if no payment data
  useEffect(() => {
    if (!paymentData) {
      navigate("/");
    }
  }, [paymentData, navigate]);

  // ⭐ Block browser back button
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
      setShowBackWarning(true);
      setTimeout(() => setShowBackWarning(false), 4000);
    };

    // Push initial state
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // ⭐ Warn before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue =
        "You haven't completed your registration. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const [formData, setFormData] = useState({
    userId: paymentData?.userId, // ⭐ REQUIRED
    username: paymentData?.formData.name || "",
    email: paymentData?.formData.email || "",
    phone: paymentData?.formData.phone || "",
    password: "",
    role: "user",
    crmType: "CAR",
    pickupDrop: false,
    towingService: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showBackWarning, setShowBackWarning] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, formData);

      setMessage("Registration successful!");

      // Remove beforeunload listener before navigation
      window.removeEventListener("beforeunload", () => {});

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Registration failed. Try again.";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden transition-all duration-700 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/70">
      {/* ⭐ Back Button Warning Toast */}
      {showBackWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl shadow-red-100/50 border border-red-200 bg-white/95 backdrop-blur-xl">
            <div className="p-2 rounded-full bg-red-500 shadow-sm shadow-red-500/20">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-red-600">
                Navigation Blocked
              </p>
              <p className="text-xs text-red-500 font-medium">
                Please complete your registration first
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Ambient Orbs */}
        <div
          className="absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-3xl opacity-40 bg-indigo-300 mix-blend-multiply animate-pulse"
          style={{ animationDuration: "10s" }}
        ></div>
        <div
          className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full blur-3xl opacity-40 bg-purple-300 mix-blend-multiply animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "1s" }}
        ></div>

        {/* Floating Background Accent Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6,
              animation: `float ${7 + Math.random() * 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          ></div>
        ))}

        {/* Tailored Micro-Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(79, 70, 229, 0.4) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>

      {/* Mouse Follow Ambient Aura */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(99, 102, 241, 0.06), 
            transparent 60%)`,
        }}
      />

      {/* Main Content Scaffold */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-5 sm:p-8 lg:p-12">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Structural Hero Section */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              {/* Branding Unit */}
              <div className="inline-flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-300"></div>
                  <div className="relative p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transform group-hover:scale-105 transition-all duration-300">
                    <Car
                      className="w-9 h-9 text-indigo-600"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Motor
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                      Desk
                    </span>
                  </h1>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Next-Gen Garage Management
                  </p>
                </div>
              </div>

              {/* Title Copy */}
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  Activate Your
                  <span className="block mt-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                    Premium Interface
                  </span>
                </h2>
                <p className="text-base text-slate-500 font-medium leading-relaxed max-w-md">
                  You are one finalizing choice away from opening your
                  specialized environment and automated tooling.
                </p>
              </div>

              {/* ⭐ Guardrail Notice Container */}
              <div className="relative p-5 rounded-2xl border border-orange-200 bg-gradient-to-br from-amber-50/60 to-orange-50/40 shadow-sm shadow-orange-100/50 overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl"></div>
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md shadow-orange-500/20">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                      Action Required
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-600 font-medium">
                      Your transactional verification cleared perfectly. Do not
                      close this terminal layout without creating administrative
                      credentials below.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-600 pt-1">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>
                        Workspace session is locked until confirmation is
                        complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional Attributes Component */}
              <div className="space-y-3 max-w-md">
                {[
                  {
                    icon: Shield,
                    text: "Transaction Framework Cleared",
                    color: "from-emerald-500 to-teal-600",
                  },
                  {
                    icon: CheckCircle,
                    text: "Garage Engine Set Up Active",
                    color: "from-blue-500 to-indigo-600",
                  },
                  {
                    icon: Sparkles,
                    text: "All Modules Ready For Distribution",
                    color: "from-purple-500 to-pink-600",
                  },
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:border-slate-200 transition-all duration-300"
                    >
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${feature.color} shadow-sm`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-sm text-slate-700">
                        {feature.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Verification Configuration Container */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* ⭐ Responsive Navigation Warning Card */}
            <div className="lg:hidden mb-6 p-4 rounded-2xl border border-orange-200 bg-orange-50/80 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-600 animate-pulse" />
                <div>
                  <p className="font-bold text-sm text-slate-900 mb-0.5">
                    Account Activation Required
                  </p>
                  <p className="text-xs text-slate-600 font-medium">
                    Payment successfully cleared. Finalize credentials below to
                    access your premium desk environment.
                  </p>
                </div>
              </div>
            </div>

            {/* Principal Identity Card */}
            <div className="relative rounded-3xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
              {/* Ornamental Floating Icon Accent */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-40"></div>
                  <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-lg">
                    <UserPlus
                      className="w-5 h-5 text-indigo-600"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-10 mt-4 space-y-6">
                {/* Structural Labeling */}
                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Establish Access
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    Provision administrative account configuration
                  </p>
                </div>

                {/* API Warning Interactivity Panel */}
                {message && (
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 animate-fadeIn ${
                      message.includes("successful")
                        ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50/50 border-rose-200 text-rose-800"
                    }`}
                  >
                    {message.includes("successful") ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-semibold leading-snug">
                      {message}
                    </p>
                  </div>
                )}

                {/* Interactive Data Entry Frame */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Field Object: Username */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Username{" "}
                      <span className="text-[10px] font-medium text-slate-400 lowercase">
                        (customizable configuration)
                      </span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                        className="w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all duration-200"
                        placeholder="e.g. Speedline Garage"
                      />
                    </div>
                  </div>

                  {/* Field Object: Email (Readonly Isolation) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Email Destination{" "}
                      <span className="text-[10px] font-medium text-slate-400 lowercase">
                        (locked from invoice)
                      </span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-400 bg-slate-100/70 border border-slate-200/80 rounded-xl cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                  {/* Field Object: Phone (Readonly Isolation) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Contact Phone{" "}
                      <span className="text-[10px] font-medium text-slate-400 lowercase">
                        (locked from invoice)
                      </span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        disabled
                        className="w-full pl-11 pr-4 py-3 text-sm font-medium text-slate-400 bg-slate-100/70 border border-slate-200/80 rounded-xl cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                  {/* Field Object: Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      System Password
                    </label>
                    <div className="relative group">
                      <Lock
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-200 ${
                          focusedInput === "password"
                            ? "text-indigo-600 scale-105"
                            : "text-slate-400"
                        }`}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Determine secure login code"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        onFocus={() => setFocusedInput("password")}
                        onBlur={() => setFocusedInput("")}
                        required
                        className="w-full pl-11 pr-11 py-3 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ⭐ STYLED NEW SECTION: SERVICES AVAILABLE AT YOUR GARAGE */}
                  <div className="pt-4 pb-1 border-t border-slate-100 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider block text-indigo-600">
                      Services Available At Your Garage
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {/* Pickup & Drop Switch-Box */}
                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                          formData.pickupDrop
                            ? "bg-indigo-50/40 border-indigo-200 shadow-sm"
                            : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg transition-colors ${formData.pickupDrop ? "bg-indigo-600 text-white" : "bg-slate-200/60 text-slate-500"}`}
                          >
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            Pickup & Drop Service Available
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.pickupDrop}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              pickupDrop: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 transition-all cursor-pointer"
                        />
                      </label>

                      {/* Towing Switch-Box */}
                      <label
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                          formData.towingService
                            ? "bg-purple-50/40 border-purple-200 shadow-sm"
                            : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg transition-colors ${formData.towingService ? "bg-purple-600 text-white" : "bg-slate-200/60 text-slate-500"}`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            Towing Service Available
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.towingService}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              towingService: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/30 transition-all cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Form Submission Execution Trigger */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-transform duration-300 group-hover:scale-[1.03]"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Provisioning Workspace...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Setup</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </form>

                {/* Footnote Informational Display */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 mb-0.5">
                        Account Sync Confirmed
                      </p>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">
                        Verification layer completed via original registration
                        structure. Settings can be altered via user profile
                        post-authentication.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Visual Brand Footer */}
            <div className="lg:hidden mt-8 text-center">
              <div className="inline-flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <Car className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <h1 className="text-base font-bold text-slate-900">
                    Motor<span className="text-indigo-600">Desk</span>
                  </h1>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Garage System Framework
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Styled JSX Dynamic Context Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-16px) translateX(8px);
          }
          50% {
            transform: translateY(-8px) translateX(-8px);
          }
          75% {
            transform: translateY(-24px) translateX(4px);
          }
        }

        @keyframes slideDown {
          from {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default CarRegister;
