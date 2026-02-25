import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiShield,
  FiSettings,
  FiUsers,
  FiClock,
  FiCalendar,
  FiTool,
  FiAlertTriangle,
  FiZap,
  FiCircle,
  FiDroplet,
  FiCpu,
  FiLayout,
  FiClipboard,
  FiFileText,
  FiPackage,
  FiMessageSquare,
  FiBarChart,
  FiSmartphone,
  FiActivity,
  FiChevronRight,
  FiCheckCircle,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

export default function CarGarage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: FiUsers,
      title: "Identity Management",
      desc: "Store complete customer records, track vehicle history, and access service recommendations.",
    },
    {
      icon: FiClipboard,
      title: "Workflow Tracking",
      desc: "Create job cards in seconds, assign technicians, and track progress in real-time.",
    },
    {
      icon: FiFileText,
      title: "Billing Protocols",
      desc: "Send professional estimates and invoices with one click and accept online payments.",
    },
    {
      icon: FiPackage,
      title: "Inventory Control",
      desc: "Monitor stock levels, set low-inventory alerts, and track part usage across all jobs.",
    },
    {
      icon: FiMessageSquare,
      title: "Automated Comms",
      desc: "Reduce missed appointments with automated service reminders and marketing campaigns.",
    },
    {
      icon: FiBarChart,
      title: "Advanced Analytics",
      desc: "View revenue trends, technician productivity, and job profitability nodes.",
    },
    {
      icon: FiSmartphone,
      title: "Mobile Node Access",
      desc: "Technicians can update job status and upload photos directly from mobile devices.",
    },
  ];

  const services = [
    {
      icon: FiCalendar,
      title: "Periodic Maintenance",
      desc: "Comprehensive maintenance services including oil changes and fluid checks.",
      items: [
        "Engine Oil & Filter",
        "Air Filter",
        "Brake Fluid",
        "Battery Check",
      ],
    },
    {
      icon: FiTool,
      title: "Running Repairs",
      desc: "Expert repairs for all mechanical and electrical issues to restore node performance.",
      items: [
        "Engine Repair",
        "Brake System",
        "Clutch Overhaul",
        "Electrical Repairs",
      ],
    },
    {
      icon: FiAlertTriangle,
      title: "Accidental Repair",
      desc: "Professional bodywork and collision repair services for vehicle restoration.",
      items: [
        "Dent & Paint Work",
        "Panel Replacement",
        "Chassis Alignment",
        "Windshield Replacement",
      ],
    },
    {
      icon: FiZap,
      title: "Electrical & Diagnostics",
      desc: "Advanced diagnostics and electrical repairs for modern vehicle systems.",
      items: [
        "OBD-II Scanning",
        "Battery Replacement",
        "Sensor Replacement",
        "Wiring Repair",
      ],
    },
    {
      icon: FiDroplet,
      title: "AC & Cooling",
      desc: "Keep your vehicle cool with our AC repair and cooling system maintenance.",
      items: [
        "AC Gas Refill",
        "Compressor Repair",
        "Radiator Replacement",
        "Cooling Coil Service",
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
            Car Garage <br />
            <span className="font-light italic lowercase">Management.</span>
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Streamline your infrastructure with MotorDesk. Manage customers,
            jobs, and billing through a high-density administrative interface.
          </p>
        </div>

        {/* --- Software Infrastructure Nodes --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            {/* VISIBILITY FIX: Icon switches based on theme */}
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
                {/* VISIBILITY FIX: Feature icons switch based on theme */}
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

        {/* --- Service Capability Browser --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <FiSettings
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Operational Nodes
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, i) => (
              <div
                key={i}
                className={`relative group p-1 rounded-[2.5rem] border-2 transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5" : "bg-white border-[#CBD5E1]"}`}
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
                    <div
                      className={`p-3 rounded-xl shadow-lg ${isDark ? "bg-white text-[#001F3F]" : "bg-[#001F3F] text-white"}`}
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
                  <div className="grid grid-cols-1 gap-4">
                    {service.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 group/item"
                      >
                        <FiCheckCircle className="text-green-500" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/item:text-[#001F3F] transition-colors">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Final Infrastructure CTA --- */}
        <div
          className={`p-16 rounded-[3rem] text-center relative overflow-hidden ${isDark ? "bg-[#001F3F] border border-white/5 shadow-2xl" : "bg-[#001F3F] text-white shadow-2xl"}`}
        >
          <div className="relative z-10">
            <FiCpu className="w-16 h-16 mx-auto mb-8 text-blue-300 opacity-50" />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 italic text-white">
              Initialize Your <br /> Infrastructure Protocol?
            </h2>
            <p className="text-blue-100/60 text-[11px] font-bold uppercase tracking-[0.3em] mb-12 max-w-xl mx-auto">
              Join hundreds of automotive nodes that have transformed their
              workspace with the MotorDesk ecosystem.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="bg-white text-[#001F3F] px-12 py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 shadow-xl border border-white/10"
            >
              Initialize Network
            </button>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FiSettings size={300} className="animate-spin-slow text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
