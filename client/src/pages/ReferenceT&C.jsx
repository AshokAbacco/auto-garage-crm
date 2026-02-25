import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiFileText,
  FiCheckCircle,
  FiZap,
  FiStar,
  FiDollarSign,
  FiRepeat,
} from "react-icons/fi"; // Switched to Feather icons for OS consistency
import { GiQueenCrown } from "react-icons/gi";
import { IoRocketOutline } from "react-icons/io5";
import { useTheme } from "../contexts/ThemeContext";
import Footer from "../components/Footer.jsx";

const ReferralProgram = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("monthly");

  const plans = [
    {
      name: "Standard Node",
      monthly: "₹2,000",
      annual: "1,200",
      reward: "₹100",
      icon: FiStar,
      features: ["Basic Features", "Monthly Rewards", "Standard Support"],
    },
    {
      name: "Premium Node",
      monthly: "₹3,000",
      annual: "2,400",
      reward: "₹200",
      icon: GiQueenCrown,
      features: ["All Features", "Higher Rewards", "Priority Support"],
      popular: true,
    },
  ];

  const stats = [
    { icon: FiDollarSign, value: "₹100-200", label: "PER NODE MONTHLY" },
    { icon: FiRepeat, value: "UNLIMITED", label: "REFERRALS ACTIVE" },
    { icon: FiZap, value: "₹1,200+", label: "ANNUAL BONUS" },
  ];

  const sections = [
    {
      icon: FiUsers,
      title: "Eligibility",
      points: [
        "Open to all active, paying customers",
        "Must have an active subscription tier",
        "Maintain integrity with the platform",
      ],
    },
    {
      icon: FiFileText,
      title: "Unique Referral ID",
      points: [
        "Each customer receives a unique referral ID",
        "ID must be entered during initialization",
        "Cannot be applied post-activation",
      ],
    },
    {
      icon: FiCheckCircle,
      title: "Valid Criteria",
      points: [
        "Referred customer must be new to ecosystem",
        "Successful purchase of Standard/Premium plan",
        "Maintain active subscription status",
      ],
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-32 pb-24 ${isDark ? "bg-[#000814] text-white" : "bg-white text-black"}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* --- System Header --- */}
        <div className="text-center mb-24">
          <div
            className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-lg border mb-8 ${isDark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"}`}
          >
            {/* VISIBILITY FIX: Theme-aware badge text */}
            <span
              className={`text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              V1.0 Referral Protocols Active
            </span>
          </div>
          <h1
            className={`text-6xl lg:text-8xl font-black tracking-tighter mb-6 uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
          >
            Reference <br />
            <span className="font-light italic lowercase">Bounce.</span>
          </h1>
          <p
            className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Initialize growth protocols. Receive automated cashback rewards for
            every friend who joins the MotorDesk ecosystem.
          </p>
        </div>

        {/* --- Stats Registry Hub --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`p-8 rounded-[2rem] border-2 transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5 shadow-2xl" : "bg-white border-[#CBD5E1] shadow-sm"}`}
            >
              {/* VISIBILITY FIX: Icon theme-aware */}
              <stat.icon
                className={`w-8 h-8 mb-6 ${isDark ? "text-white" : "text-[#001F3F]"}`}
              />
              <div
                className={`text-4xl font-black mb-2 uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
              >
                {stat.value}
              </div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* --- Potential Matrix Browser --- */}
        <div className="mb-32">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-flex bg-[#F8FAFC] p-1.5 rounded-2xl border border-[#CBD5E1] mb-10">
              {["monthly", "annual"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? "bg-[#001F3F] text-white shadow-xl" : "text-slate-400 hover:text-[#001F3F]"}`}
                >
                  {tab} Protocols
                </button>
              ))}
            </div>
            <h2
              className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              Earning Possibilities
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative group p-1 rounded-[2.5rem] border-2 transition-all duration-500 ${isDark ? "bg-[#001F3F] border-white/5 shadow-2xl" : "bg-white border-[#CBD5E1]"}`}
              >
                {/* Browser UI Protocol */}
                <div
                  className={`px-6 py-3 border-b flex gap-2 ${isDark ? "bg-white/5" : "bg-[#F8FAFC]"}`}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-10">
                    <div
                      className={`p-4 rounded-xl shadow-lg ${isDark ? "bg-white text-[#001F3F]" : "bg-[#001F3F] text-white"}`}
                    >
                      <plan.icon size={24} />
                    </div>
                    {plan.popular && (
                      <span className="bg-amber-500 text-[#001F3F] text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full">
                        High Demand
                      </span>
                    )}
                  </div>
                  <h3
                    className={`text-2xl font-black uppercase tracking-tighter mb-2 italic ${isDark ? "text-white" : "text-[#001F3F]"}`}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-8">
                    Base: {plan.monthly}/month
                  </p>

                  <div
                    className={`p-6 rounded-2xl mb-8 ${isDark ? "bg-white/5" : "bg-[#F8FAFC] border border-[#CBD5E1]"}`}
                  >
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      CASHBACK_YIELD
                    </p>
                    <p
                      className={`text-4xl font-black ${isDark ? "text-white" : "text-[#001F3F]"}`}
                    >
                      {activeTab === "monthly"
                        ? plan.reward
                        : "₹" + plan.annual}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {plan.features.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <FiCheckCircle className="text-green-500" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {f}
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
          className={`p-16 rounded-[3rem] text-center relative overflow-hidden ${isDark ? "bg-[#001F3F] border border-white/5 shadow-2xl" : "bg-[#001F3F] text-white shadow-2xl"}`}
        >
          <div className="relative z-10">
            <IoRocketOutline className="w-16 h-16 mx-auto mb-8 text-blue-300 opacity-50" />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 italic text-white">
              Ready to Initialize <br /> Referral Node?
            </h2>
            <p className="text-blue-100/60 text-[11px] font-bold uppercase tracking-[0.3em] mb-12 max-w-xl mx-auto leading-relaxed">
              Join the MotorDesk growth network. Transmit your code and receive
              automated cashback settlements.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-[#001F3F] px-12 py-4 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all active:scale-95 shadow-xl border border-white/10"
            >
              Initialize Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;
