import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiPackage,
  FiShoppingCart,
  FiCpu,
  FiLayout,
  FiShield,
  FiZap,
  FiSettings,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiTool,
  FiBox,
  FiActivity,
  FiStar,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

export default function CarSpareParts() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: FiBox,
      title: "Smart Stocking",
      desc: "AI-driven auto-restock protocols based on node usage trends.",
    },
    {
      icon: FiCpu,
      title: "Performance Nodes",
      desc: "Access a wide range of tuning and OEM components for modern fleets.",
    },
    {
      icon: FiShoppingCart,
      title: "Supply Chain Sync",
      desc: "Sync with Tier-1 suppliers for real-time availability metadata.",
    },
  ];

  const categories = [
    {
      icon: FiSettings,
      title: "Engine Management",
      desc: "Pistons, filters, and ECU infrastructure.",
      items: ["Oil Filters", "Air Filters", "Spark Plugs", "Timing Belts"],
    },
    {
      icon: FiShield,
      title: "Braking Infrastructure",
      desc: "Complete safety components for vehicle deceleration.",
      items: ["Brake Pads", "Brake Discs", "Brake Calipers", "Brake Fluid"],
    },
    {
      icon: FiZap,
      title: "Power & Electrical",
      desc: "High-capacity batteries and lighting systems.",
      items: ["Car Batteries", "Headlights", "Alternators", "Starter Motors"],
    },
    {
      icon: FiTool,
      title: "Suspension Hub",
      desc: "Shock absorbers and precision steering nodes.",
      items: ["Shock Absorbers", "Coil Springs", "Control Arms", "Ball Joints"],
    },
  ];

  const featuredProducts = [
    {
      name: "Synthetic Engine Oil",
      brand: "Mobil-1",
      price: "₹1,299",
      rating: "4.8",
    },
    {
      name: "Performance Brake Pads",
      brand: "Bosch",
      price: "₹3,499",
      rating: "4.7",
    },
    {
      name: "Car Battery",
      brand: "Exide-Edge",
      price: "₹5,499",
      rating: "4.9",
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
            {/* VISIBILITY FIX: Theme-aware badge text */}
            <span
              className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              V1.0 Inventory Hub Protocols
            </span>
          </div>
          <h1
            className={`text-6xl lg:text-8xl font-black tracking-tighter mb-6 uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
          >
            Car Spare <br />
            <span className="font-light italic lowercase">Parts Console.</span>
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Initialize procurement cycles and manage high-performance components
            through a high-density administrative ecosystem.
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
                {/* VISIBILITY FIX: Feature Icons theme-aware */}
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

        {/* --- Component Categories Browser --- */}
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
              Node Categories
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
                  {/* VISIBILITY FIX: Icon background theme-aware */}
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

        {/* --- Component Stream Registry (Locked Dimensions) --- */}
        <div className="mb-32 overflow-hidden">
          <div className="flex items-center gap-4 mb-12">
            {/* VISIBILITY FIX: Section Icon theme-aware */}
            <FiActivity
              className={isDark ? "text-white" : "text-[#001F3F]"}
              size={20}
            />
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Featured Stream
            </h2>
            <div className="flex-1 h-[1px] bg-slate-200 opacity-20"></div>
          </div>

          <div className="flex animate-scroll whitespace-nowrap">
            {[
              ...featuredProducts,
              ...featuredProducts,
              ...featuredProducts,
            ].map((product, i) => (
              <div
                key={i}
                className={`inline-block w-80 h-[460px] mx-4 p-1 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden flex-shrink-0 ${
                  isDark
                    ? "bg-[#001F3F] border-white/5 shadow-2xl"
                    : "bg-white border-[#CBD5E1] shadow-sm"
                }`}
              >
                <div
                  className={`px-6 py-3 border-b flex justify-between items-center ${isDark ? "bg-white/5 border-white/5" : "bg-[#F8FAFC] border-[#CBD5E1]"}`}
                >
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">
                    DATA_NODE.OBJ
                  </span>
                </div>

                <div className="p-8 flex flex-col h-[calc(100%-48px)]">
                  <div
                    className={`h-40 w-full rounded-2xl mb-6 flex items-center justify-center border-2 border-dashed transition-colors ${
                      isDark
                        ? "bg-[#000814] border-white/10"
                        : "bg-[#F8FAFC] border-[#CBD5E1]"
                    }`}
                  >
                    {/* VISIBILITY FIX: Dynamic Package Icon color */}
                    <FiPackage
                      className={`w-12 h-12 ${isDark ? "text-white/20" : "text-[#001F3F]/10"}`}
                    />
                  </div>

                  <div className="flex-1">
                    <h3
                      className={`text-[13px] font-black uppercase tracking-widest italic mb-1 whitespace-normal line-clamp-2 leading-snug ${isDark ? "text-white" : "text-[#001F3F]"}`}
                    >
                      {product.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Origin: {product.brand}
                    </p>
                  </div>

                  <div
                    className={`mt-auto pt-6 border-t ${isDark ? "border-white/5" : "border-slate-100"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          Protocol Value
                        </span>
                        <span
                          className={`text-xl font-black ${isDark ? "text-white" : "text-[#001F3F]"}`}
                        >
                          {product.price}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-500">
                          <FiStar size={10} className="fill-current" />
                          <span className="text-[10px] font-black tracking-widest">
                            {product.rating}
                          </span>
                        </div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          Node_Rank
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
              Join the network of professional car workshops that have
              streamlined their procurement cycles with the MotorDesk platform.
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

      <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 30s linear infinite;
                }
            `}</style>
    </div>
  );
}
