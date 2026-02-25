import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTool,
  FiLayers,
  FiPackage,
  FiShoppingCart,
  FiActivity,
  FiShield,
  FiZap,
  FiSettings,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiAward,
  FiCpu,
  FiLayout,
  FiChevronRight,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

export default function BikeSpareParts() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: FiLayers,
      title: "Quality Components",
      desc: "Genuine OEM and aftermarket nodes for professional repair.",
    },
    {
      icon: FiPackage,
      title: "Inventory Logic",
      desc: "Track part availability and stock levels across the ecosystem.",
    },
    {
      icon: FiShoppingCart,
      title: "Procurement Protocol",
      desc: "Initialize restocking orders with a single command.",
    },
  ];

  const categories = [
    {
      icon: FiSettings,
      title: "Engine Systems",
      desc: "Pistons, cylinders, and critical gaskets.",
      items: ["Spark Plugs", "Air Filters", "Oil Filters", "Gasket Kits"],
    },
    {
      icon: FiShield,
      title: "Braking Nodes",
      desc: "Complete safety components for node deceleration.",
      items: ["Brake Pads", "Brake Discs", "Brake Shoes", "Brake Cables"],
    },
    {
      icon: FiZap,
      title: "Power Infrastructure",
      desc: "Batteries, lighting, and wiring components.",
      items: ["Batteries", "Headlights", "Indicators", "Wiring Harness"],
    },
    {
      icon: FiActivity,
      title: "Transmission Node",
      desc: "Chains, sprockets, and clutch assemblies.",
      items: ["Drive Chains", "Sprockets", "Clutch Plates", "Gear Levers"],
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
            {/* VISIBILITY FIX: Theme-aware text color */}
            <span
              className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              V1.0 Inventory Hub Protocols
            </span>
          </div>
          <h1
            className={`text-6xl lg:text-8xl font-black tracking-tighter mb-6 uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
          >
            Bike Spare <br />
            <span className="font-light italic lowercase">Parts Hub.</span>
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Initialize procurement and manage your spare parts inventory through
            a high-density administrative ecosystem.
          </p>
        </div>

        {/* --- Infrastructure Features Nodes --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            {/* VISIBILITY FIX: Section icon theme-aware */}
            <FiLayout
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              System Features
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className={`p-10 rounded-[2rem] border-2 transition-all duration-500 hover:-translate-y-2 ${isDark ? "bg-[#001F3F] border-white/5 shadow-2xl" : "bg-white border-[#CBD5E1] shadow-sm hover:border-[#001F3F]"}`}
              >
                {/* VISIBILITY FIX: Feature icons theme-aware */}
                <f.icon
                  className={`w-10 h-10 mb-8 ${isDark ? "text-white" : "text-[#001F3F]"}`}
                />
                <h3
                  className={`text-[11px] font-black uppercase tracking-widest mb-4 italic ${isDark ? "text-white" : "text-[#001F3F]"}`}
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

        {/* --- Component Matrix Browser --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            {/* VISIBILITY FIX: Section icon theme-aware */}
            <FiCpu
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Component Categories
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, i) => (
              <div
                key={i}
                className={`relative group p-1 rounded-[2rem] border-2 transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5 shadow-xl" : "bg-white border-[#CBD5E1]"}`}
              >
                <div
                  className={`px-5 py-2.5 border-b flex gap-1.5 ${isDark ? "bg-white/5" : "bg-[#F8FAFC]"}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </div>
                <div className="p-8">
                  {/* VISIBILITY FIX: Category icon box theme-aware */}
                  <div
                    className={`p-3 rounded-xl w-fit mb-6 shadow-lg ${isDark ? "bg-white text-[#001F3F]" : "bg-[#001F3F] text-white"}`}
                  >
                    <category.icon size={18} />
                  </div>
                  <h3
                    className={`text-[13px] font-black uppercase tracking-widest italic mb-2 ${isDark ? "text-white" : "text-[#001F3F]"}`}
                  >
                    {category.title}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-tight leading-relaxed">
                    {category.desc}
                  </p>
                  <div className="space-y-3">
                    {category.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 group/item"
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${isDark ? "bg-white/40" : "bg-[#001F3F]/40"} group-hover/item:bg-[#001F3F] transition-colors`}
                        ></div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover/item:text-[#001F3F] transition-colors">
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

        {/* --- Integrity Protocols --- */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            {/* VISIBILITY FIX: Section icon theme-aware */}
            <FiCheckCircle
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Integrity Protocols
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FiAward,
                title: "100% Genuine",
                desc: "Authentic products with manufacturer warranty nodes.",
              },
              {
                icon: FiClock,
                title: "Rapid Logistics",
                desc: "Same-day deployment for orders prior to 14:00.",
              },
              {
                icon: FiTruck,
                title: "Priority Shipping",
                desc: "Complimentary for high-volume ecosystem orders.",
              },
              {
                icon: FiShield,
                title: "Quality Audit",
                desc: "All components tested for performance and node durability.",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className={`p-8 rounded-[2rem] border-2 transition-all duration-500 hover:shadow-xl ${isDark ? "bg-[#001F3F] border-white/5" : "bg-white border-[#CBD5E1] shadow-sm"}`}
              >
                {/* VISIBILITY FIX: Benefit icons theme-aware */}
                <benefit.icon
                  className={`w-6 h-6 mb-4 ${isDark ? "text-white" : "text-[#001F3F]"}`}
                />
                <h3
                  className={`text-[11px] font-black uppercase tracking-widest mb-2 italic ${isDark ? "text-white" : "text-[#001F3F]"}`}
                >
                  {benefit.title}
                </h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- Final CTA Deployment --- */}
        <div
          className={`p-16 rounded-[3rem] text-center relative overflow-hidden ${isDark ? "bg-[#001F3F] border border-white/5 shadow-2xl shadow-black" : "bg-[#001F3F] text-white shadow-2xl shadow-blue-900/20"}`}
        >
          <div className="relative z-10">
            <FiShoppingCart className="w-16 h-16 mx-auto mb-8 text-blue-300 opacity-50" />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 italic text-white">
              Initialize Spare <br /> Hub Integration?
            </h2>
            <p className="text-blue-100/60 text-[11px] font-bold uppercase tracking-[0.3em] mb-12 max-w-xl mx-auto leading-relaxed">
              Join the network of professional workshops that have streamlined
              their procurement cycles with the MotorDesk platform.
            </p>
            <button
              onClick={() => navigate("/pricing")}
              className="bg-white text-[#001F3F] px-12 py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 shadow-xl border border-white/10"
            >
              Initialize Network
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
