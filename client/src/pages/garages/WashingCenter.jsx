import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDroplet,
  FiCalendar,
  FiUsers,
  FiActivity,
  FiShield,
  FiClock,
  FiTruck,
  FiZap,
  FiStar,
  FiCheckCircle,
  FiLayout,
  FiCpu,
  FiAlertTriangle,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

export default function WashingCenter() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  // State to track which button is showing "Coming Soon"
  const [activeBookingIdx, setActiveBookingIdx] = useState(null);

  const handleBookingClick = (index) => {
    setActiveBookingIdx(index);
    // Reset the button text after 2 seconds
    setTimeout(() => setActiveBookingIdx(null), 2000);
  };

  const features = [
    {
      icon: FiCalendar,
      title: "Booking Scheduler",
      desc: "Automate customer wash appointments and schedule synchronization.",
    },
    {
      icon: FiActivity,
      title: "Real-time Queue",
      desc: "Monitor washing bay availability and node status in real-time.",
    },
    {
      icon: FiUsers,
      title: "Identity Database",
      desc: "Maintain loyalty programs, customer history, and reward metrics.",
    },
  ];

  const washingServices = [
    {
      icon: FiDroplet,
      title: "Exterior Washing",
      desc: "Comprehensive exterior cleaning services for all vehicle types.",
      items: [
        "Foam Wash",
        "Pre-Wash Rinse",
        "Wheel Cleaning",
        "Underbody Wash",
      ],
      duration: "30-45 min",
      popular: true,
    },
    {
      icon: FiZap,
      title: "Interior Cleaning",
      desc: "Deep interior cleaning to restore hygiene and node freshness.",
      items: [
        "Vacuum Cleaning",
        "Dashboard Polish",
        "Seat Shampoo",
        "Carpet Cleaning",
      ],
      duration: "45-60 min",
      popular: true,
    },
    {
      icon: FiShield,
      title: "Protective Coatings",
      desc: "Advanced protection treatments to preserve vehicle finish integrity.",
      items: [
        "Wax Coating",
        "Sealant Application",
        "Ceramic Coating",
        "Paint Protection Film",
      ],
      duration: "60-90 min",
      popular: false,
    },
    {
      icon: FiActivity,
      title: "Detailing Packages",
      desc: "Complete detailing solutions for showroom-grade performance.",
      items: [
        "Basic Detail",
        "Premium Detail",
        "Showroom Detail",
        "Seasonal Protection",
      ],
      duration: "90-120 min",
      popular: false,
    },
  ];

  const specializedServices = [
    {
      icon: FiActivity,
      title: "Bike Washing Hub",
      features: ["Bike Foam Wash", "Chain Cleaning", "Engine Detailing"],
    },
    {
      icon: FiZap,
      title: "Express Protocols",
      features: ["15-Minute Wash", "Exterior Quick Clean", "Interior Refresh"],
    },
    {
      icon: FiStar,
      title: "Premium Treatments",
      features: ["Ceramic Coating", "Paint Correction", "Leather Cond."],
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-32 pb-24 ${
        isDark ? "bg-[#000814] text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* --- System Deployment Header --- */}
        <div className="text-center mb-24">
          <div
            className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-lg border mb-8 ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <span
              className={`text-[9px] font-black uppercase tracking-[0.3em] ${
                isDark ? "text-white" : "text-[#001F3F]"
              }`}
            >
              V1.0 Operational Protocols
            </span>
          </div>
          <h1
            className={`text-6xl lg:text-8xl font-black tracking-tighter mb-6 uppercase ${
              isDark ? "text-white" : "text-[#001F3F]"
            }`}
          >
            Washing Center <br />
            <span className="font-light italic lowercase">CRM Console.</span>
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto font-medium ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Manage customer queues, automated bookings, and financial billing
            through a high-density administrative ecosystem.
          </p>
        </div>

        {/* --- Infrastructure Features Nodes --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <FiLayout
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${
                isDark ? "text-white" : "text-[#001F3F]"
              }`}
            >
              System Infrastructure
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className={`p-10 rounded-[2.5rem] border-2 transition-all duration-500 hover:-translate-y-2 ${
                  isDark
                    ? "bg-[#001F3F] border-white/5 shadow-2xl"
                    : "bg-white border-[#CBD5E1] shadow-sm hover:border-[#001F3F]"
                }`}
              >
                <f.icon
                  className={`w-10 h-10 mb-8 ${isDark ? "text-white" : "text-[#001F3F]"}`}
                />
                <h3
                  className={`text-[11px] font-black uppercase tracking-widest mb-4 italic ${
                    isDark ? "text-white" : "text-[#001F3F]"
                  }`}
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

        {/* --- Operational Services Browser --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <FiCpu
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${
                isDark ? "text-white" : "text-[#001F3F]"
              }`}
            >
              Operational Services
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {washingServices.map((service, i) => (
              <div
                key={i}
                className={`relative group p-10 rounded-[3rem] border-2 transition-all duration-500 ${
                  isDark
                    ? "bg-[#001F3F] border-white/5 shadow-2xl"
                    : "bg-white border-[#CBD5E1]"
                }`}
              >
                <div
                  className={`px-6 py-3 border-b flex gap-2 ${
                    isDark ? "bg-white/5" : "bg-[#F8FAFC]"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="p-10 pt-16">
                  <div className="flex justify-between items-start mb-8">
                    <div
                      className={`p-4 rounded-2xl shadow-lg ${
                        isDark
                          ? "bg-white text-[#001F3F]"
                          : "bg-[#001F3F] text-white"
                      }`}
                    >
                      <service.icon size={24} />
                    </div>
                    {service.popular && (
                      <span className="bg-amber-500 text-[#001F3F] text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full">
                        High Demand
                      </span>
                    )}
                  </div>
                  <h3
                    className={`text-2xl font-black uppercase tracking-tighter mb-2 italic ${
                      isDark ? "text-white" : "text-[#001F3F]"
                    }`}
                  >
                    {service.title}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-8">
                    {service.desc}
                  </p>

                  <div
                    className={`flex items-center gap-2 mb-8 ${
                      isDark ? "text-white" : "text-[#001F3F]"
                    }`}
                  >
                    <FiClock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Protocol Duration: {service.duration}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 mb-10">
                    {service.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 group/item"
                      >
                        <FiCheckCircle className="text-green-500" size={14} />
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* UPDATE: Conditional "Coming Soon" Button Logic */}
                  <button
                    onClick={() => handleBookingClick(i)}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 ${
                      activeBookingIdx === i
                        ? "bg-amber-500 text-black border-amber-600"
                        : isDark
                          ? "bg-white text-[#001F3F] hover:bg-blue-50"
                          : "bg-[#000814] text-white hover:bg-black"
                    }`}
                  >
                    {activeBookingIdx === i ? (
                      <>
                        <FiAlertTriangle className="animate-pulse" />
                        Status: Module Coming Soon
                      </>
                    ) : (
                      "Initialize Booking"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Final CTA Deployment --- */}
        {/* --- Final CTA Deployment --- */}
        <div
          className={`p-16 rounded-[3rem] text-center relative overflow-hidden ${
            isDark
              ? "bg-[#001F3F] border border-white/5 shadow-2xl shadow-black"
              : "bg-[#001F3F] text-white shadow-2xl"
          }`}
        >
          <div className="relative z-10">
            <FiCpu className="w-16 h-16 mx-auto mb-8 text-blue-300 opacity-50" />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 italic text-white">
              Ready to Initialize <br /> Your Wash Node?
            </h2>
            <p className="text-blue-100/60 text-[11px] font-bold uppercase tracking-[0.3em] mb-12 max-w-xl mx-auto leading-relaxed">
              Join the global network of washing centers that have streamlined
              their operations with the MotorDesk platform.
            </p>

            <div className="relative inline-block">
              <button
                onClick={() => {
                  // Trigger the 'Syncing' state for visual feedback
                  setActiveBookingIdx("cta");
                  // Navigate to pricing after a short delay for 'Operating System' feel
                  setTimeout(() => {
                    navigate("/pricing");
                    setActiveBookingIdx(null);
                  }, 600);
                }}
                className="bg-white text-[#001F3F] px-12 py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 shadow-xl border border-white/10"
              >
                {activeBookingIdx === "cta"
                  ? "Syncing Network..."
                  : "Initialize Network"}
              </button>

              {activeBookingIdx === "cta" && (
                <div className="absolute -bottom-8 left-0 w-full text-[9px] font-black text-amber-400 uppercase tracking-widest animate-pulse">
                  Establishing Connection...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
