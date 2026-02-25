import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiCpu,
  FiUsers,
  FiSettings,
  FiStar,
  FiTool,
  FiShield,
  FiZap,
  FiCircle,
  FiTruck,
  FiCalendar,
  FiClock,
  FiDroplet,
  FiLayout,
  FiChevronRight,
  FiCheckCircle,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

export default function BikeGarage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: FiActivity,
      title: "Speed Optimization",
      desc: "Track and manage service time efficiently to maximize throughput.",
    },
    {
      icon: FiUsers,
      title: "Identity Management",
      desc: "Easily handle repeat clients and automated service appointments.",
    },
    {
      icon: FiSettings,
      title: "Maintenance Logic",
      desc: "Access detailed job and part configurations for precision repair.",
    },
    {
      icon: FiStar,
      title: "Feedback Protocol",
      desc: "Collect and track customer satisfaction ratings per service node.",
    },
  ];

  const mainServices = [
    {
      icon: FiCalendar,
      title: "Periodic Maintenance",
      desc: "Essential maintenance services to keep your bike running smoothly and safely.",
      items: [
        "Engine Oil & Filter",
        "Air Filter",
        "Brake Fluid",
        "Battery Check",
      ],
    },
    {
      icon: FiTool,
      title: "Engine & Performance",
      desc: "Expert engine services to optimize power, efficiency, and reliability.",
      items: ["Engine Repair", "Clutch Overhaul", "Spark Plug", "Fuel System"],
    },
    {
      icon: FiShield,
      title: "Brake & Suspension",
      desc: "Critical safety systems maintenance for high-confidence riding.",
      items: [
        "Brake System",
        "Suspension Check",
        "Brake Pad",
        "Clutch Adjustment",
      ],
    },
    {
      icon: FiZap,
      title: "Electrical & Diagnostics",
      desc: "Advanced diagnostics and electrical repairs for all bike systems.",
      items: [
        "Battery Replacement",
        "Lights & Electrical",
        "Wiring Harness",
        "Sensor Diagnosis",
      ],
    },
  ];

  const specializedServices = [
    {
      icon: FiCircle,
      title: "Tyre & Wheel Hub",
      desc: "Complete tyre care for safety, performance, and longevity.",
      features: [
        "Tyre Replacement",
        "Puncture Repair",
        "Wheel Balancing",
        "Nitrogen Filling",
      ],
    },
    {
      icon: FiShield,
      title: "Safety Audit",
      desc: "Thorough inspections to ensure bikes meet industrial safety standards.",
      features: [
        "General Health Check",
        "Road Test",
        "Brake Inspection",
        "Emission Check",
      ],
    },
    {
      icon: FiDroplet,
      title: "Cooling Systems",
      desc: "Maintain optimal operating temperatures and critical fluid levels.",
      features: [
        "Coolant Check",
        "Brake Fluid",
        "Oil Top-Up",
        "Fluid Replacement",
      ],
    },
    {
      icon: FiCpu,
      title: "Performance Upgrades",
      desc: "Enhance bike performance with professional modification nodes.",
      features: [
        "Air Filter Upgrade",
        "Exhaust Tuning",
        "ECU Remapping",
        "Performance Parts",
      ],
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-32 pb-24 ${isDark ? "bg-[#000814] text-white" : "bg-white text-black"}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* --- System Deployment Header --- */}
        <div className="text-center mb-24">
          <div
            className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-lg border mb-8 ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}
          >
            {/* VISIBILITY FIX: Switched from static #001F3F to theme-aware white/navy */}
            <span
              className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              V1.0 Operational Protocols
            </span>
          </div>
          <h1
            className={`text-6xl lg:text-8xl font-black tracking-tighter mb-6 uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
          >
            Bike Garage <br />
            <span className="font-light italic lowercase">Solutions.</span>
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Simplify your two-wheeler operations. Manage service jobs, customer
            identities, and inventory through a high-density administrative
            interface.
          </p>
        </div>

        {/* --- Infrastructure Features Nodes --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            {/* VISIBILITY FIX: Section Icon theme-aware */}
            <FiLayout
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              System Infrastructure
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`p-8 rounded-[2rem] border-2 transition-all duration-500 hover:-translate-y-2 ${isDark ? "bg-[#001F3F] border-white/5 shadow-2xl" : "bg-white border-[#CBD5E1] shadow-sm hover:border-[#001F3F]"}`}
              >
                {/* VISIBILITY FIX: Infrastructure icons theme-aware */}
                <f.icon
                  className={`w-8 h-8 mb-6 ${isDark ? "text-white" : "text-[#001F3F]"}`}
                />
                <h3
                  className={`text-[11px] font-black uppercase tracking-widest mb-3 italic ${isDark ? "text-white" : "text-[#001F3F]"}`}
                >
                  {f.title}
                </h3>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight opacity-80">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Operational Capabilities Browser --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            {/* VISIBILITY FIX: Section Icon theme-aware */}
            <FiSettings
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Operational Capabilities
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainServices.map((service, i) => (
              <div
                key={i}
                className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5 shadow-xl" : "bg-white border-[#CBD5E1] shadow-sm"}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  {/* VISIBILITY FIX: Badge color inverted in dark mode */}
                  <div
                    className={`p-2.5 rounded-xl shadow-lg ${isDark ? "bg-white text-[#001F3F]" : "bg-[#001F3F] text-white"}`}
                  >
                    <service.icon size={18} />
                  </div>
                  <h3
                    className={`text-[13px] font-black uppercase tracking-widest italic ${isDark ? "text-white" : "text-[#001F3F]"}`}
                  >
                    {service.title}
                  </h3>
                </div>
                <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-tight leading-relaxed">
                  {service.desc}
                </p>
                <div className="space-y-2">
                  {service.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-white/40" : "bg-[#001F3F]/40"}`}
                      ></div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Specialized Nodes Browser --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            {/* VISIBILITY FIX: Section Icon theme-aware */}
            <FiCpu
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Specialized Nodes
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
            {specializedServices.map((service, i) => (
              <div
                key={i}
                className={`relative group p-1 rounded-[2.5rem] border-2 transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5 shadow-2xl" : "bg-white border-[#CBD5E1]"}`}
              >
                <div
                  className={`px-6 py-3 border-b flex gap-2 ${isDark ? "bg-white/5" : "bg-[#F8FAFC]"}`}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                    {/* VISIBILITY FIX: Specialized icons theme-aware */}
                    <div
                      className={`p-3 rounded-xl shadow-inner ${isDark ? "bg-white/10 text-white" : "bg-slate-900 text-white"}`}
                    >
                      <service.icon size={20} />
                    </div>
                    <h3
                      className={`text-lg font-black uppercase tracking-widest italic ${isDark ? "text-white" : "text-[#001F3F]"}`}
                    >
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mb-8 uppercase tracking-tight">
                    {service.desc}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 group/item"
                      >
                        <FiCheckCircle className="text-green-500" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/item:text-[#001F3F] transition-colors">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Final CTA Deployment --- */}
        <div
          className={`p-16 rounded-[3rem] text-center relative overflow-hidden ${isDark ? "bg-[#001F3F] border border-white/5 shadow-2xl shadow-black" : "bg-[#001F3F] text-white shadow-2xl"}`}
        >
          <div className="relative z-10">
            <FiActivity className="w-16 h-16 mx-auto mb-8 text-blue-300 opacity-50" />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 italic text-white">
              Initialize Your Bike <br /> Garage Protocol?
            </h2>
            <p className="text-blue-100/60 text-[11px] font-bold uppercase tracking-[0.3em] mb-12 max-w-xl mx-auto leading-relaxed">
              Join the network of high-performance bike garages that have
              streamlined their operations with the MotorDesk platform.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="bg-white text-[#001F3F] px-12 py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 shadow-xl border border-white/10"
            >
              Initialize Network
            </button>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FiCpu size={300} className="animate-spin-slow text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
