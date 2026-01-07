//login.jsx
import React, { useState, useEffect, useRef } from "react";

import {
  Car,
  Bike,
  Droplets,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Users,
  Star,
  Server,
  TrendingUp,
  Settings,
  Calendar,
  Wrench,
  Zap,
  Sparkles,
} from "lucide-react";
import PublicLayout from "../components/PublicLayout";

export default function ModernLogin() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [crmType, setCrmType] = useState("car");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [transitioning, setTransitioning] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);
  const [particles, setParticles] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [loginMode, setLoginMode] = useState("owner");
  const containerRef = useRef(null);

  const CRM_CONFIG = {
    car: {
      label: "Car Garage",
      icon: Car,
      gradient: "from-blue-600 via-cyan-500 to-blue-400",
      bgGradient: "from-slate-950 via-blue-950 to-indigo-950",
      accentColor: "#3b82f6",
      lightAccent: "rgba(59, 130, 246, 0.3)",
      particleColor: "#60a5fa",
      title: "Drive Your Business Forward",
      subtitle: "Professional automotive service management",
      features: [
        { icon: Wrench, text: "Service Management", color: "text-blue-400" },
        { icon: Users, text: "Customer Database", color: "text-cyan-400" },
        { icon: Calendar, text: "Smart Scheduling", color: "text-blue-300" },
        { icon: Settings, text: "Inventory Control", color: "text-cyan-300" },
      ],
      stats: [
        { icon: Users, value: "50K+", label: "Active Users" },
        { icon: Star, value: "4.9", label: "Rating" },
        { icon: Server, value: "99.9%", label: "Uptime" },
        { icon: TrendingUp, value: "2x", label: "Growth" },
      ],
    },
    bike: {
      label: "Bike Workshop",
      icon: Bike,
      gradient: "from-blue-600 via-blue-500 to-cyan-500",
      bgGradient: "from-blue-900 via-blue-800 to-cyan-900",
      lightBgGradient: "from-blue-50 via-cyan-50 to-white",
      accentColor: "#2563EB", // blue-600
      lightAccent: "#3B82F6", // blue-500
      particleColor: "#06B6D4", // cyan-500
      glowColor: "rgba(37, 99, 235, 0.3)", // blue glow
      borderColor: "#60A5FA", // blue-400
      title: "Rev Up Your Workshop",
      subtitle: "Expert CRM for Two-Wheeler Service Centers",
      features: [
        { icon: Wrench, text: "Repair Tracking", color: "text-white" },
        { icon: Users, text: "Customer Profiles", color: "text-blue-100" },
        { icon: Calendar, text: "Service Reminders", color: "text-cyan-100" },
        { icon: Settings, text: "Parts Management", color: "text-blue-200" },
      ],
      stats: [
        {
          icon: Users,
          value: "30K+",
          label: "Active Users",
          color: "text-blue-400",
        },
        { icon: Star, value: "4.8", label: "Rating", color: "text-cyan-400" },
        {
          icon: Server,
          value: "99.8%",
          label: "Uptime",
          color: "text-blue-300",
        },
        {
          icon: TrendingUp,
          value: "2.5x",
          label: "Growth",
          color: "text-cyan-300",
        },
      ],
      // Blur effects
      blurEffects: {
        backdrop: "backdrop-blur-xl",
        glassEffect: "bg-white/10 backdrop-blur-lg",
        cardBlur:
          "backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
      },
    },

    wash: {
      label: "Vehicle Washing",
      icon: Droplets,
      gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
      bgGradient: "from-slate-950 via-purple-950 to-fuchsia-950",
      accentColor: "#8b5cf6",
      lightAccent: "rgba(139, 92, 246, 0.3)",
      particleColor: "#a78bfa",
      title: "Shine Bright Every Day",
      subtitle: "Complete car wash business management",
      features: [
        { icon: Droplets, text: "Service Packages", color: "text-violet-400" },
        { icon: Users, text: "Loyalty Programs", color: "text-purple-400" },
        { icon: Calendar, text: "Booking System", color: "text-fuchsia-300" },
        { icon: Zap, text: "Quick Checkout", color: "text-violet-300" },
      ],
      stats: [
        { icon: Users, value: "20K+", label: "Active Users" },
        { icon: Star, value: "4.7", label: "Rating" },
        { icon: Server, value: "99.7%", label: "Uptime" },
        { icon: TrendingUp, value: "3x", label: "Growth" },
      ],
    },
  };

  const currentConfig = CRM_CONFIG[crmType];

  // Initialize floating elements and particles
  useEffect(() => {
    const elements = Array(25)
      .fill()
      .map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 80 + 30,
        duration: Math.random() * 25 + 20,
        delay: Math.random() * -20,
      }));
    setFloatingElements(elements);

    const particleElements = Array(50)
      .fill()
      .map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 30 + 20,
        delay: Math.random() * -10,
      }));
    setParticles(particleElements);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleCrmChange = (type) => {
    if (type === crmType) return;

    // Create ripple effect from button
    const newRipple = {
      id: Date.now(),
      x: 50,
      y: 50,
    };
    setRipples((prev) => [...prev, newRipple]);

    setTransitioning(true);
    setTimeout(() => {
      setCrmType(type);
      // Re-generate particles with new colors
      const particleElements = Array(50)
        .fill()
        .map((_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          duration: Math.random() * 30 + 20,
          delay: Math.random() * -10,
        }));
      setParticles(particleElements);

      setTimeout(() => setTransitioning(false), 50);
    }, 400);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 2000);
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

    // 🚫 Staff must use email
    if (loginMode === "staff" && !formData.identifier.includes("@")) {
      setError("Staff must login using email address");
      setIsLoading(false);
      return;
    }

    try {
      let loginUrl = "";
      let payload = {};

      // 👷 STAFF LOGIN
      if (loginMode === "staff") {
        // 🚿 WASH STAFF LOGIN
        if (crmType === "wash") {
          loginUrl = `${
            import.meta.env.VITE_API_BASE_URL
          }/api/teams/wash-staff/login`;
          payload = {
            email: formData.identifier.trim().toLowerCase(),
            password: formData.password,
          };
        }

        // 🚗 CAR STAFF LOGIN
        else if (crmType === "car") {
          loginUrl = `${
            import.meta.env.VITE_API_BASE_URL
          }/api/staff-auth/login`;
          payload = {
            email: formData.identifier.trim().toLowerCase(),
            password: formData.password,
            crmType: "CAR",
          };
        }

        // 🏍 BIKE STAFF / FUTURE STAFF (UNCHANGED FALLBACK)
        else {
          loginUrl = `${
            import.meta.env.VITE_API_BASE_URL
          }/api/staff-auth/login`;
          payload = {
            email: formData.identifier.trim().toLowerCase(),
            password: formData.password,
            crmType: crmType.toUpperCase(),
          };
        }
      }

      // 👤 OWNER LOGIN
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

      // ✅ SAVE AUTH (ONLY PLACE)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("crmType", crmType);

      // ✅ CORRECT REDIRECT
      if (loginMode === "staff") {
        window.location.href = `/${crmType}-dashboard`;
      } else {
        window.location.href = `/${crmType}-dashboard`;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const IconComponent = currentConfig.icon;

  return (
    <PublicLayout>
      <div
        ref={containerRef}
        className={`min-h-screen pt-[12%] relative overflow-hidden transition-all duration-1000 bg-gradient-to-br ${currentConfig.bgGradient}`}
      >
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {floatingElements.map((elem) => (
            <div
              key={elem.id}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                left: `${elem.x}%`,
                top: `${elem.y}%`,
                width: `${elem.size}px`,
                height: `${elem.size}px`,
                background: `radial-gradient(circle, ${currentConfig.accentColor}, transparent)`,
                animation: `float ${elem.duration}s infinite ease-in-out ${elem.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Animated Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full opacity-40"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: currentConfig.particleColor,
                animation: `particleFloat ${particle.duration}s infinite ease-in-out ${particle.delay}s`,
                boxShadow: `0 0 10px ${currentConfig.particleColor}`,
              }}
            />
          ))}
        </div>

        {/* Transition Ripples */}
        {ripples.map((ripple) => (
          <div
            key={ripple.id}
            className="absolute rounded-full pointer-events-none opacity-30"
            style={{
              left: `${ripple.x}%`,
              top: `${ripple.y}%`,
              width: "20px",
              height: "20px",
              background: `radial-gradient(circle, ${currentConfig.accentColor}, transparent)`,
              animation: "ripple 2s ease-out forwards",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}

        {/* Mouse Tracking Gradient */}
        <div
          className="absolute inset-0 transition-all duration-500 opacity-40"
          style={{
            background: `radial-gradient(circle 800px at ${mousePosition.x}% ${mousePosition.y}%, ${currentConfig.lightAccent}, transparent 70%)`,
          }}
        />

        {/* Animated Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${currentConfig.accentColor} 1.5px, transparent 1.5px), linear-gradient(90deg, ${currentConfig.accentColor} 1.5px, transparent 1.5px)`,
            backgroundSize: "60px 60px",
            animation: "gridMove 20s linear infinite",
          }}
        />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Left Panel - Information */}
            <div
              className={`hidden lg:flex flex-col justify-center transition-all duration-700 ${
                transitioning
                  ? "opacity-0 -translate-x-20 scale-95"
                  : "opacity-100 translate-x-0 scale-100"
              }`}
            >
              {/* Logo and Title */}
              <div className="mb-10 space-y-1">
                <div className="flex items-center mb-6 group">
                  <div
                    className={`relative p-5 rounded-2xl bg-gradient-to-br ${currentConfig.gradient} shadow-2xl transform hover:scale-110 hover:rotate-6 transition-all duration-500`}
                    style={{
                      boxShadow: `0 25px 70px ${currentConfig.lightAccent}`,
                    }}
                  >
                    <IconComponent className="w-12 h-12 text-white" />
                    <div className="absolute inset-0 transition-opacity duration-300 bg-white opacity-0 rounded-2xl group-hover:opacity-20" />
                  </div>
                  <div className="ml-5">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-5xl font-black tracking-tight text-white">
                        {currentConfig.label}
                      </h1>
                      <Sparkles
                        className="text-yellow-400 w-7 h-7 animate-pulse"
                        style={{
                          animation:
                            "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium tracking-wide text-gray-400">
                      CRM Platform
                    </p>
                  </div>
                </div>

                <h2 className="mb-5 text-6xl font-black leading-tight text-transparent text-white bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  {currentConfig.title}
                </h2>
                <p className="text-xl font-light text-gray-300">
                  {currentConfig.subtitle}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-5 mb-12">
                {currentConfig.features.map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="relative p-6 transition-all duration-500 border group bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl hover:bg-white/10 hover:scale-105 hover:-translate-y-1"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${
                          index * 100
                        }ms backwards`,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div
                        className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-2xl bg-gradient-to-br group-hover:opacity-10"
                        style={{
                          background: `linear-gradient(to bottom right, ${currentConfig.accentColor}, transparent)`,
                        }}
                      />
                      <div className="relative z-10 flex items-start space-x-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${currentConfig.gradient} opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}
                          style={{
                            boxShadow: `0 10px 30px ${currentConfig.lightAccent}`,
                          }}
                        >
                          <FeatureIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p
                            className={`font-bold text-base ${feature.color} group-hover:text-white transition-colors duration-300`}
                          >
                            {feature.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-5">
                {currentConfig.stats.map((stat, index) => {
                  const StatIcon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="relative p-5 text-center transition-all duration-500 border group bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl hover:bg-white/10 hover:scale-110 hover:-translate-y-2"
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${
                          (index + 4) * 100
                        }ms backwards`,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                      }}
                    >
                      <div
                        className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-2xl group-hover:opacity-100"
                        style={{
                          background: `linear-gradient(to bottom, ${currentConfig.lightAccent}, transparent)`,
                        }}
                      />
                      <div className="relative z-10">
                        <StatIcon className="mx-auto mb-3 text-white transition-all duration-300 w-7 h-7 opacity-80 group-hover:opacity-100 group-hover:scale-110" />
                        <div className="mb-1 text-3xl font-black text-white transition-transform duration-300 group-hover:scale-110">
                          {stat.value}
                        </div>
                        <div className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Panel - Login Form */}
            <div
              className={`flex items-center justify-center transition-all duration-700 ${
                transitioning
                  ? "opacity-0 translate-x-20 scale-95 rotate-3"
                  : "opacity-100 translate-x-0 scale-100 rotate-0"
              }`}
            >
              <div className="w-full max-w-md">
                {/* Glass Card */}
                <div className="relative p-8 transition-all duration-500 border shadow-2xl bg-white/10 backdrop-blur-2xl border-white/20 rounded-3xl hover:border-white/30">
                  {/* Glowing Border Effect */}
                  <div
                    className="absolute -inset-0.5 rounded-3xl opacity-30 blur-xl transition-opacity duration-500 group-hover:opacity-50"
                    style={{
                      background: `linear-gradient(45deg, ${currentConfig.accentColor}, transparent, ${currentConfig.accentColor})`,
                    }}
                  />

                  <div className="relative">
                    {/* Mobile Header */}
                    <div className="mb-8 text-center lg:hidden">
                      <div className="inline-flex items-center mb-4 space-x-3">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${currentConfig.gradient} animate-pulse`}
                          style={{
                            animation:
                              "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          }}
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white">
                          {currentConfig.label}
                        </h2>
                      </div>
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-8 text-center">
                      <h3 className="mb-2 text-3xl font-black text-transparent text-white bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-300">
                        Welcome Back
                      </h3>
                      <p className="font-light text-gray-300">
                        Sign in to continue to your dashboard
                      </p>
                    </div>

                    {/* CRM Type Selector */}
                    <div className="relative mb-8">
                      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-1.5 grid grid-cols-3 gap-1.5 shadow-xl">
                        {Object.entries(CRM_CONFIG).map(([key, config]) => {
                          const TabIcon = config.icon;
                          return (
                            <button
                              key={key}
                              onClick={() => handleCrmChange(key)}
                              className={`relative py-3 px-4 rounded-xl font-semibold transition-all duration-500 flex flex-col items-center justify-center space-y-1.5 ${
                                crmType === key
                                  ? "text-white scale-105"
                                  : "text-gray-400 hover:text-gray-200 hover:scale-105"
                              }`}
                            >
                              {crmType === key && (
                                <>
                                  <div
                                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.gradient} transition-all duration-500`}
                                    style={{
                                      boxShadow: `0 15px 40px ${config.lightAccent}`,
                                    }}
                                  />
                                  <div
                                    className="absolute inset-0 bg-white opacity-0 rounded-xl animate-pulse"
                                    style={{
                                      animation:
                                        "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                                    }}
                                  />
                                </>
                              )}
                              <TabIcon
                                className={`w-5 h-5 relative z-10 transition-transform duration-300 ${
                                  crmType === key ? "scale-110" : ""
                                }`}
                              />
                              <span className="relative z-10 text-xs font-bold">
                                {config.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Email Field */}
                      <div className="group">
                        <label className="block mb-2 text-sm font-semibold text-gray-300">
                          Email or Username
                        </label>
                        <div className="relative">
                          <Mail className="absolute w-5 h-5 text-gray-400 transition-all duration-300 -translate-y-1/2 left-4 top-1/2 group-focus-within:text-white group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-300 focus:bg-white/10 focus:border-white/30 focus:scale-[1.02]"
                            style={{
                              boxShadow: formData.identifier
                                ? `0 0 30px ${currentConfig.lightAccent}`
                                : "none",
                            }}
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="group">
                        <label className="block mb-2 text-sm font-semibold text-gray-300">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute w-5 h-5 text-gray-400 transition-all duration-300 -translate-y-1/2 left-4 top-1/2 group-focus-within:text-white group-focus-within:scale-110" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            className="w-full pl-12 pr-12 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 outline-none transition-all duration-300 focus:bg-white/10 focus:border-white/30 focus:scale-[1.02]"
                            style={{
                              boxShadow: formData.password
                                ? `0 0 30px ${currentConfig.lightAccent}`
                                : "none",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute text-gray-400 transition-all duration-300 -translate-y-1/2 right-4 top-1/2 hover:text-white hover:scale-110"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="p-4 text-sm text-red-200 border bg-red-500/20 border-red-500/50 rounded-xl animate-shake">
                          {error}
                        </div>
                      )}
                      <div className="relative flex w-full p-1 bg-gray-900 rounded-xl border border-white/10 shadow-2xl">
                        {/* 1. THE GLOWING BACKGROUND (The Slider) */}
                        <div
                          className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-lg shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${
          loginMode === "staff"
            ? "translate-x-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-teal-500/25" // Staff Color (Green/Teal)
            : "translate-x-0 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-indigo-500/25" // Owner Color (Purple/Indigo)
        }`}
                        >
                          {/* Adds a subtle sheen effect on top of the gradient */}
                          <div className="absolute inset-0 bg-white/10 rounded-lg"></div>
                        </div>

                        {/* 2. OWNER BUTTON */}
                        <button
                          type="button"
                          onClick={() => setLoginMode("owner")}
                          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold tracking-wide transition-colors duration-300
        ${
          loginMode === "owner"
            ? "text-white drop-shadow-md"
            : "text-gray-500 hover:text-gray-300"
        }`}
                        >
                          {/* Crown Icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-300 ${
                              loginMode === "owner" ? "scale-110" : "scale-100"
                            }`}
                          >
                            <path d="m2 4 3 12h14l3-12-6 7-4-3-4 3-6-7z" />
                          </svg>
                          Owner
                        </button>

                        {/* 3. STAFF BUTTON */}
                        <button
                          type="button"
                          onClick={() => setLoginMode("staff")}
                          className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold tracking-wide transition-colors duration-300
        ${
          loginMode === "staff"
            ? "text-white drop-shadow-md"
            : "text-gray-500 hover:text-gray-300"
        }`}
                        >
                          {/* ID Badge Icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-300 ${
                              loginMode === "staff" ? "scale-110" : "scale-100"
                            }`}
                          >
                            <rect width="18" height="12" x="3" y="8" rx="2" />
                            <path d="M12 11v6" />
                            <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          Staff
                        </button>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`group w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${currentConfig.gradient} shadow-xl transition-all duration-500 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 relative overflow-hidden`}
                        style={{
                          boxShadow: `0 20px 60px ${currentConfig.lightAccent}`,
                        }}
                      >
                        <span className="relative z-10 flex items-center space-x-2">
                          {isLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>
                                Logging in as{" "}
                                {loginMode === "staff" ? "Staff" : "Owner"}...
                              </span>
                            </>
                          ) : (
                            <>
                              <span>
                                {loginMode === "staff"
                                  ? "Login as Staff"
                                  : "Login to Dashboard"}
                              </span>
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                            </>
                          )}
                        </span>

                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 space-y-3 text-center">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                        <Shield
                          className="w-4 h-4 animate-pulse"
                          style={{
                            animation:
                              "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                          }}
                        />
                        <span>Secured with 256-bit encryption</span>
                      </div>
                      <p className="text-gray-100 text-xs">
                        © {new Date().getFullYear()} {currentConfig.label} CRM.
                        All rights reserved. Powered by Moto Desk.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(30px, -30px) scale(1.1);
            }
            50% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            75% {
              transform: translate(20px, 10px) scale(1.05);
            }
          }

          @keyframes particleFloat {
            0%,
            100% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0.4;
            }
            25% {
              transform: translate(40px, -40px) rotate(90deg);
              opacity: 0.6;
            }
            50% {
              transform: translate(-30px, 30px) rotate(180deg);
              opacity: 0.3;
            }
            75% {
              transform: translate(30px, -20px) rotate(270deg);
              opacity: 0.5;
            }
          }

          @keyframes ripple {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 0.6;
            }
            100% {
              transform: translate(-50%, -50%) scale(100);
              opacity: 0;
            }
          }

          @keyframes gridMove {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 60px 60px;
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            10%,
            30%,
            50%,
            70%,
            90% {
              transform: translateX(-5px);
            }
            20%,
            40%,
            60%,
            80% {
              transform: translateX(5px);
            }
          }
        `}</style>
      </div>
    </PublicLayout>
  );
}
