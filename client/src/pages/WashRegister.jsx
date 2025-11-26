import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Droplets, User, Lock, Eye, EyeOff, ArrowRight,
  Sparkles, Shield, Mail, Phone, AlertCircle,
  Loader2, CheckCircle, UserPlus, AlertTriangle,
  XCircle
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const WashRegister = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = true;
  
  const paymentData = location.state?.paymentData;

  // Redirect if no payment data
  useEffect(() => {
    if (!paymentData) {
      navigate("/");
    }
  }, [paymentData, navigate]);

  // Block browser back button
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href);
      setShowBackWarning(true);
      setTimeout(() => setShowBackWarning(false), 4000);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Warn before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "You haven't completed your registration. Are you sure you want to leave?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const [formData, setFormData] = useState({
    userId: paymentData?.userId,
    username: paymentData?.formData.name || "",
    email: paymentData?.formData.email || "",
    phone: paymentData?.formData.phone || "",
    password: "",
    role: "user",
    crmType: "WASH"
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
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        formData
      );

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
    <div className="min-h-screen relative overflow-hidden transition-all duration-700 bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">

      {showBackWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-xl bg-red-500/10 border-red-500/30">
            <div className="p-2 rounded-full bg-red-500">
              <XCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-red-400">Navigation Blocked</p>
              <p className="text-xs text-red-300">Please complete your registration first</p>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse bg-violet-600" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse bg-fuchsia-600" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse bg-purple-600" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5,
              animation: `float ${5 + Math.random() * 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15), transparent 50%)`
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          <div className="hidden lg:block space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-4 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
                  <div className="relative p-4 rounded-2xl backdrop-blur-xl border bg-white/10 border-white/20 shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                    <Droplets className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    Wash<span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">Master</span>
                  </h1>
                  <p className="text-sm text-gray-400">Premium Car Wash Service CRM</p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-5xl font-bold leading-tight text-white">
                  Complete Your
                  <span className="block mt-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 bg-clip-text text-transparent">
                    Registration
                  </span>
                </h2>
                <p className="text-lg leading-relaxed text-gray-400">
                  You're one step away from accessing the most sophisticated car wash management platform.
                </p>
              </div>
              
              <div className="relative p-5 rounded-2xl border-2 backdrop-blur-sm overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                    <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-orange-400">⚠️ Important Notice</h4>
                    <p className="text-sm leading-relaxed text-orange-300">
                      <strong>Please do not skip this step!</strong> Your payment has been processed successfully. 
                      Complete this registration to activate your account and access all premium features.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-orange-400">
                      <XCircle className="w-4 h-4" />
                      <span>Navigation is blocked until registration is complete</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Shield, text: "Secure Payment Verified", color: "violet" },
                  { icon: CheckCircle, text: "Account Almost Ready", color: "fuchsia" },
                  { icon: Sparkles, text: "Premium Features Awaiting", color: "purple" }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm border bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-200">{feature.text}</span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="lg:hidden mb-6 p-4 rounded-2xl border-2 backdrop-blur-sm bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-orange-400 animate-pulse" />
                <div>
                  <p className="font-bold text-sm mb-1 text-orange-400">⚠️ Complete Registration Required</p>
                  <p className="text-xs text-orange-300">Your payment is verified. Please complete this form to activate your account.</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl backdrop-blur-2xl border shadow-2xl transition-all duration-500 bg-white/10 border-white/20">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                  <div className="relative w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-xl border-4 shadow-2xl bg-slate-300 border-white/20">
                    <UserPlus className="w-8 h-8 text-violet-500" strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-10 mt-8 space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-bold text-white">Create Account</h3>
                  <p className="text-sm text-gray-400">Complete your registration to get started</p>
                </div>

                {message && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${
                    message.includes("successful")
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    {message.includes("successful") ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm font-medium ${
                      message.includes("successful") ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {message}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">
                      Username <span className="text-xs text-gray-500">(from payment)</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.username}
                        disabled
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 cursor-not-allowed bg-white/5 border-white/10 text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">
                      Email Address <span className="text-xs text-gray-500">(from payment)</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 cursor-not-allowed bg-white/5 border-white/10 text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">
                      Phone Number <span className="text-xs text-gray-500">(from payment)</span>
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="tel"
                        value={formData.phone}
                        disabled
                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 cursor-not-allowed bg-white/5 border-white/10 text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-300">Password</label>
                    <div className="relative group">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${
                        focusedInput === 'password' ? 'text-violet-500 scale-110' : 'text-gray-100'
                      }`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput('')}
                        required
                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all duration-300 ${
                          focusedInput === 'password'
                            ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.01]'
                            : 'bg-white/5 border-white/10'
                        } focus:outline-none focus:border-violet-500 text-white placeholder-gray-100`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-gray-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full py-4 rounded-xl font-bold text-white shadow-2xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 transition-transform duration-300 group-hover:scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </div>
                  </button>
                </form>

                <div className="p-4 rounded-xl border-2 bg-violet-500/10 border-violet-500/30">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold mb-1 text-violet-400">Payment Verified ✓</p>
                      <p className="text-xs text-violet-300">Your payment has been successfully processed. Complete registration to access your account.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:hidden mt-8 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur-lg opacity-60"></div>
                  <div className="relative p-3 rounded-xl backdrop-blur-xl border bg-white/10 border-white/20">
                    <Droplets className="w-6 h-6 text-violet-500" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-white">
                    Wash<span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">Master</span>
                  </h1>
                  <p className="text-xs text-gray-400">Car Wash Service CRM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default WashRegister;