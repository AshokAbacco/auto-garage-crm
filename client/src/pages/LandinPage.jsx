import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  FiArrowRight,
  FiPlay,
  FiShield,
  FiZap,
  FiUsers,
  FiBarChart,
  FiCheckCircle,
  FiStar,
  FiClock,
  FiSettings,
  FiActivity,
  FiCpu,
  FiCreditCard,
  FiTerminal,
  FiDollarSign,
  FiPlayCircle,
  FiCalendar,
  FiFileText,
  FiBell,
  FiBox,
  FiHeadphones,
} from "react-icons/fi";
import Footer from "../components/Footer.jsx";
import WatchDemo from "../components/WatchDemo.jsx";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [activeFeature, setActiveFeature] = useState(0);
  const [openDemo, setOpenDemo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { value: "10,000+", label: "ACTIVE NODES", icon: FiCpu },
    { value: "2M+", label: "JOBS VERIFIED", icon: FiCheckCircle },
    { value: "99.9%", label: "UPTIME SLA", icon: FiActivity },
    { value: "4.9/5", label: "STABILITY RATING", icon: FiStar },
  ];

  const features = [
    {
      icon: FiTerminal,
      title: "Smart Scheduling",
      description:
        "AI-powered job scheduling and tracking with real-time updates",
      stats: "50% FASTER WORKFLOW",
    },
    {
      icon: FiUsers,
      title: "Customer Node",
      description: "Give customers real-time updates on their vehicle status",
      stats: "98% SATISFACTION RATE",
    },
    {
      icon: FiBarChart,
      title: "Data Analytics",
      description: "Deep insights into your business performance and growth",
      stats: "3X REVENUE GROWTH",
    },
    {
      icon: FiShield,
      title: "Secure Registry",
      description: "Bank-level encryption and automated backups",
      stats: "99.9% UPTIME SLA",
    },
  ];

  // DATA FOR THE UPLOADED SCREENSHOT SECTION
  const garageTools = [
    {
      icon: FiCalendar,
      title: "Smart Scheduling",
      desc: "AI-powered appointment system that maximizes your bay utilization.",
    },
    {
      icon: FiFileText,
      title: "Digital Invoicing",
      desc: "Create and send professional invoices in seconds.",
    },
    {
      icon: FiBell,
      title: "Automated Reminders",
      desc: "Never miss a service appointment with smart notifications.",
    },
    {
      icon: FiCreditCard,
      title: "Payment Processing",
      desc: "Accept all payment methods with integrated POS solutions.",
    },
    {
      icon: FiBox,
      title: "Inventory Management",
      desc: "Track parts and supplies with automatic reorder alerts.",
    },
    {
      icon: FiHeadphones,
      title: "24/7 Support",
      desc: "Get help whenever you need it from our dedicated expert team.",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#000814] text-white" : "bg-white text-black"}`}
    >
      {/* --- System Deployment (Hero) --- */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#001F3F] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-[#001F3F]/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div
              className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-lg border ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}
            >
              {/* VISIBILITY FIX: Switched from static #001F3F to dynamic white/navy */}
              <span
                className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
              >
                V1.0 PERFORMANCE UPDATE LIVE
              </span>
            </div>

            {/* Title Correction: Applied #001F3F for Light Mode */}
            <h1
              className={`text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              The Operating <br />
              <span className="font-light italic lowercase">System.</span>
            </h1>

            <p
              className={`text-lg max-w-lg leading-relaxed font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              A precision-engineered CRM to manage bike, car, and washing
              services. Automate your workflow with professional node tiers.
            </p>

            <div className="flex flex-wrap gap-5">
              <button
                onClick={() => navigate("/pricing")}
                className="group px-10 py-4 rounded-xl bg-[#001F3F] text-white font-bold text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center gap-3 active:scale-95 border border-white/10"
              >
                Initialize Network{" "}
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setOpenDemo(true)}
                className={`px-10 py-4 rounded-xl border-2 font-bold text-[11px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 ${isDark ? "border-white/10 hover:bg-white/5" : "border-[#CBD5E1] hover:bg-slate-50 text-[#001F3F]"}`}
              >
                <FiPlayCircle size={18} />
                Watch Demo
              </button>
            </div>

            <div className="space-y-3 pt-4">
              {[
                "Automated Service & Invoice Ledger",
                "One-Click WhatsApp Approval Flow",
                "Integrated Referral & Revenue Network",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <FiCheckCircle className="text-green-500" size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Interface Hub */}
          <div className="relative group">
            <div
              className={`rounded-[2rem] border-2 overflow-hidden shadow-2xl transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5" : "bg-white border-[#CBD5E1]"}`}
            >
              <div
                className={`p-1.5 border-b flex gap-2 ${isDark ? "bg-white/5 border-white/5" : "bg-[#F8FAFC] border-[#CBD5E1]"}`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              </div>
              <div className="p-10">
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {features.map((feature, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`p-6 rounded-2xl transition-all border-2 ${
                        activeFeature === index
                          ? "bg-[#001F3F] border-[#001F3F] text-white shadow-xl"
                          : isDark
                            ? "bg-white/5 border-white/5 text-slate-500"
                            : "bg-[#F8FAFC] border-[#CBD5E1] text-slate-400"
                      }`}
                    >
                      <feature.icon className="w-5 h-5 mx-auto mb-3" />
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] leading-none">
                        {feature.title}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <h3
                    className={`text-2xl font-bold uppercase italic ${isDark ? "text-white" : "text-[#001F3F]"}`}
                  >
                    {features[activeFeature].title}
                  </h3>
                  <p
                    className={`text-[12px] font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    {features[activeFeature].description}
                  </p>
                  <div
                    className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg border ${isDark ? "bg-white/5 border-white/10" : "bg-[#F8FAFC] border-[#CBD5E1]"}`}
                  >
                    <FiActivity className="text-[#001F3F]" size={14} />
                    <span
                      className={`text-[9px] font-bold uppercase tracking-[0.25em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
                    >
                      {features[activeFeature].stats}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settlement Widget Node */}
            <div
              className={`absolute -bottom-6 -left-10 p-5 rounded-2xl border-2 shadow-2xl animate-bounce-slow ${isDark ? "bg-[#000814] border-white/10" : "bg-white border-[#CBD5E1]"}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center">
                  <FiDollarSign />
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                    Settlement
                  </p>
                  <p
                    className={`text-sm font-black tracking-tight ${isDark ? "text-white" : "text-[#001F3F]"}`}
                  >
                    ₹1,24,500.00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`py-3 px-6 ${isDark ? "bg-[#000814]" : "bg-slate-50/50"}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2
              className={`text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Everything You Need to <br />
              <span className="text-indigo-500 lowercase italic font-light">
                Run Your Garage
              </span>
            </h2>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em]">
              Comprehensive tools designed specifically for modern automotive
              workshops
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {garageTools.map((tool, i) => (
              <div
                key={i}
                className={`p-10 rounded-[2rem] border-2 transition-all duration-500 group hover:-translate-y-2 ${
                  isDark
                    ? "bg-[#001F3F] border-white/5 hover:border-indigo-500/50 shadow-2xl"
                    : "bg-white border-slate-100 hover:border-indigo-500/30 shadow-sm hover:shadow-xl"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-colors ${
                    isDark
                      ? "bg-indigo-500/20 text-indigo-400"
                      : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                  }`}
                >
                  <tool.icon size={28} />
                </div>
                <h3
                  className={`text-lg font-black uppercase tracking-tight mb-3 ${isDark ? "text-white" : "text-[#001F3F]"}`}
                >
                  {tool.title}
                </h3>
                <p
                  className={`text-[13px] font-medium leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {tool.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Feature Intelligence Hub --- */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            {/* VISIBILITY FIX: Applied dynamic text color for Dark Mode visibility */}
            <span
              className={`font-bold text-[11px] uppercase tracking-[0.4em] block mb-3 ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Core Architecture
            </span>
            <h2
              className={`text-4xl font-bold tracking-tight uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Engineered for Service Excellence.
            </h2>
          </div>
          <p className="text-slate-500 text-[13px] font-medium max-w-sm">
            Our modular system adapts to your workflow, providing deep insights
            into every service job and transaction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<FiSettings />}
            title="Service Management"
            desc="Real-time tracking of service lifecycles, progress milestones, and automated digital approvals."
            isDark={isDark}
          />
          <FeatureCard
            icon={<FiUsers />}
            title="Resource Allocation"
            desc="Comprehensive staff profiles, efficiency metrics, and automated payroll for your mechanical teams."
            isDark={isDark}
          />
          <FeatureCard
            icon={<FiDollarSign />}
            title="Financial Ledger"
            desc="Generate precision-grade invoices and track revenue streams with granular reporting tools."
            isDark={isDark}
          />
        </div>
      </section>

      {/* --- Stats Ledger Protocol --- */}
      <section
        className={`py-24 px-6 border-y ${isDark ? "bg-[#001F3F]/20 border-white/5" : "bg-[#F8FAFC] border-[#CBD5E1]"}`}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-3 group">
              <stat.icon className="w-5 h-5 mx-auto text-slate-400 group-hover:text-[#001F3F] transition-colors" />
              <div
                className={`text-5xl font-black tracking-tighter ${isDark ? "text-white" : "text-[#001F3F]"}`}
              >
                {stat.value}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
      <WatchDemo isOpen={openDemo} onClose={() => setOpenDemo(false)} />
    </div>
  );
}

const FeatureCard = ({ icon, title, desc, isDark }) => (
  <div
    className={`p-8 rounded-2xl border transition-all group ${
      isDark
        ? "bg-white/5 border-white/10 hover:border-[#001F3F]"
        : "bg-white border-[#CBD5E1] hover:border-[#001F3F]"
    }`}
  >
    <div className="w-12 h-12 bg-[#F8FAFC] text-[#001F3F] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#001F3F] group-hover:text-white transition-all shadow-sm">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <h3
      className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-3 ${isDark ? "text-white" : "text-[#001F3F]"}`}
    >
      {title}
    </h3>
    <p className="text-slate-500 text-[13px] leading-relaxed font-medium">
      {desc}
    </p>
  </div>
);
