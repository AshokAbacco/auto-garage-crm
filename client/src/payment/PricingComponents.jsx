import React, { useState } from "react";
import {
  FiCheck,
  FiZap,
  FiStar,
  FiAward,
  FiChevronRight,
  FiArrowRight,
  FiActivity,
  FiCpu,
  FiShield,
  FiUsers,
  FiClock,
  FiUser,
  FiTerminal,
  FiTruck,
  FiSettings,
  FiPercent,
} from "react-icons/fi";

// --- HERO COMPONENT ---
export const Hero = ({
  isDark,
  billingPeriod,
  setBillingPeriod,
  planType,
  setPlanType,
}) => (
  <section className="relative z-10 px-6 py-12 sm:py-20">
    <div className="max-w-7xl mx-auto text-center space-y-10 w-full">
      {/* Category Tag */}
      <span className="text-[#001F3F] font-black text-[10px] uppercase tracking-[0.4em] block mb-2">
        Pricing Plans
      </span>
      <div className="space-y-4">
        <h1
          className={`text-5xl lg:text-7xl font-black uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
        >
          Flexible Pricing for <br />
          <span className="font-light italic lowercase">
            Every Service Type.
          </span>
        </h1>
      </div>

      {/* --- 50% Off Welcome Protocol Banner --- */}
      <div className="max-w-7xl mx-auto relative group">
        <div
          className={`p-8 md:p-10 rounded-[2.5rem] border-2 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-500 ${isDark
              ? "bg-[#001F3F] border-white/10 shadow-2xl"
              : "bg-[#001F3F] border-[#001F3F] text-white shadow-xl"
            }`}
        >
          {/* Decorative Background Icon */}
          <FiCpu className="absolute right-[-5%] top-[-10%] w-64 h-64 opacity-5 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
              <FiPercent size={32} className="text-white" />
            </div>
            <div>
              <div className="inline-flex items-center bg-emerald-500 px-3 py-1 rounded-md mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-white">
                  Welcome Protocol Active
                </span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight italic mb-2">
                50% Discount Applied
              </h3>
              <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Exclusive deployment strategy for{" "}
                <span className="text-white">New Registrations</span> &{" "}
                <span className="text-amber-400">First-Time Payments</span>.{" "}
                <br />
                Your operational subscription cost is reduced by half
                automatically at checkout.
              </p>
            </div>
          </div>

          {/* Offer Status Widget */}
          <div className="relative z-10 border-2 border-white/20 bg-white/5 backdrop-blur-md p-6 rounded-2xl min-w-[240px] text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300 mb-1">
              Verification Status
            </p>
            <p className="text-xl font-black italic uppercase tracking-tighter text-emerald-400">
              50% Off Auto-Applied
            </p>
          </div>
        </div>
      </div>

      {/* Category Selector Tab */}
      <div className="mt-12 inline-grid grid-cols-2 sm:flex bg-[#F8FAFC] p-1.5 rounded-2xl border border-[#CBD5E1] w-full max-w-sm sm:max-w-max mx-auto gap-1 sm:gap-0 shadow-inner">
        {["car", "bike", "washing"].map((type) => (
          <button
            key={type}
            onClick={() => setPlanType(type)}
            className={`px-4 sm:px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${planType === type
                ? "bg-[#001F3F] text-white shadow-xl scale-[1.02] sm:scale-100"
                : "text-slate-400 hover:text-[#001F3F]"
              } ${type === "washing" ? "col-span-2 sm:col-span-1" : ""}`}
          >
            {type} CRM
          </button>
        ))}
      </div>

      {/* Billing Cycle Selector */}
      <div className="flex items-center justify-center gap-6">
        <span
          className={`text-[11px] font-black uppercase tracking-widest ${billingPeriod === "monthly" ? "text-[#001F3F]" : "text-slate-400"}`}
        >
          Monthly
        </span>
        <button
          onClick={() =>
            setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")
          }
          className="relative w-14 h-7 rounded-full bg-[#001F3F] p-1 transition-all"
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-all duration-300 ${billingPeriod === "yearly" ? "translate-x-7" : "translate-x-0"
              }`}
          />
        </button>
        <div className="flex items-center gap-3">
          <span
            className={`text-[11px] font-black uppercase tracking-widest ${billingPeriod === "yearly" ? "text-[#001F3F]" : "text-slate-400"}`}
          >
            Yearly
          </span>
          <span className="text-green-600 text-[10px] font-black uppercase tracking-widest">
            (Save 20%)
          </span>
        </div>
      </div>
    </div>
  </section>
);

// --- PRICING CARD COMPONENT ---
export const PricingCard = ({
  plan,
  billingPeriod,
  isDark,
  onSelect,
  isPopular,
}) => {
  const Icon = plan.icon;
  const isBasic = plan?.name?.toLowerCase().includes("basic");

  // 1. Calculate the standard original market price based on cycle rules
  const baseOriginalPrice =
    billingPeriod === "yearly"
      ? Math.round(plan.numericPrice * 12 * 0.8)
      : plan.numericPrice;

  const originalMonthlyEq =
    billingPeriod === "yearly"
      ? Math.round(baseOriginalPrice / 12)
      : baseOriginalPrice;

  // 2. Apply 50% discount rules for visual display layout (Standard / Premium)
  const discountedMonthlyEq = Math.round(originalMonthlyEq * 0.5);

  return (
    <div className="relative h-full flex flex-col">
      {/* Plan Ribbon Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-6 z-20">
          <div className="px-5 py-1.5 rounded-md bg-[#001F3F] text-white text-[9px] font-black uppercase tracking-[0.2em] shadow-md border border-white/10">
            {plan.badge}
          </div>
        </div>
      )}

      <div
        className={`h-full rounded-[2rem] border-2 p-10 flex flex-col transition-all duration-300 ${isPopular
            ? "border-[#001F3F] shadow-2xl bg-white scale-[1.02]"
            : isDark
              ? "bg-[#000814] border-slate-800"
              : "bg-white border-slate-100 shadow-sm"
          }`}
      >
        <div className="flex justify-between items-start mb-10">
          <div
            className={`p-4 rounded-xl ${isDark ? "bg-slate-800 text-white" : "bg-slate-50 text-[#001F3F]"}`}
          >
            <Icon size={24} />
          </div>
          <div className="text-right">
            <h3
              className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              {plan.name}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {plan.tagline}
            </p>
          </div>
        </div>

        {/* --- Pricing Interface --- */}
        <div className="mb-4 flex items-baseline gap-2 flex-wrap">
          {/* Main Display Price: ₹0 for Basic (Free Trial), Discounted Price for others */}
          <span
            className={`text-5xl font-black tracking-tighter ${isDark ? "text-white" : "text-[#001F3F]"}`}
          >
            ₹{isBasic ? "0" : discountedMonthlyEq}
          </span>

          {/* Original Market Price Struck-through (Shows standard cost for all plans now) */}
          <span className="text-xl font-bold text-slate-400 line-through opacity-60 tracking-tight">
            ₹{originalMonthlyEq}
          </span>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            /Month
          </span>
        </div>

        {/* Informative Trial / Verification Tag */}
        <div className="mb-10">
          {isBasic ? (
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              1 Month Free Trial
            </span>
          ) : (
            <span className="text-[9px] font-black uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">
              First Payment Only
            </span>
          )}
        </div>

        <ul className="space-y-5 mb-12 flex-1">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <FiCheck className="text-green-500 stroke-[4]" size={16} />
              <span
                className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-300" : "text-[#001F3F]"}`}
              >
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* --- Button Design --- */}
        <button
          onClick={() => onSelect(plan)}
          className={`w-full py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border-2 flex items-center justify-center gap-3 shadow-lg active:scale-95 ${isPopular
              ? "bg-[#001F3F] border-[#001F3F] text-white hover:bg-black"
              : isDark
                ? "bg-transparent border-slate-800 text-white hover:bg-slate-800"
                : "bg-white border-slate-200 text-[#001F3F] hover:border-black"
            }`}
        >
          Select {plan.name} Plan <FiArrowRight className="opacity-50" />
        </button>
      </div>
    </div>
  );
};

// --- TRUST FEATURES SECTION ---
export const TrustSection = ({ isDark }) => (
  <section
    className={`py-20 px-6 border-y ${isDark ? "bg-[#000814] border-slate-800" : "bg-slate-50 border-slate-100"}`}
  >
    <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
      {[
        { icon: FiShield, label: "Secure", desc: "Fully Encrypted Data" },
        { icon: FiActivity, label: "Reliable", desc: "24/7 Customer Support" },
        { icon: FiAward, label: "Guaranteed", desc: "Money-Back Policy" },
        { icon: FiClock, label: "Instant", desc: "Quick Account Setup" },
      ].map((item, i) => (
        <div key={i} className="space-y-2 group">
          <item.icon
            className={`mx-auto transition-colors ${isDark ? "text-slate-400 group-hover:text-white" : "text-slate-400 group-hover:text-[#001F3F]"}`}
            size={24}
          />
          <p
            className={`text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
          >
            {item.label}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  </section>
);

// --- TESTIMONIALS SECTION ---
export const TestimonialSection = ({ isDark }) => {
  const testimonials = [
    {
      name: "R. Kumar",
      role: "Business Owner",
      icon: <FiUser />,
      text: "Greatly improved our team's daily efficiency. The automated scanning is excellent.",
    },
    {
      name: "P. Sharma",
      role: "Operations Manager",
      icon: <FiTerminal />,
      text: "Outstanding customer service. Our account setup was finished in no time.",
    },
    {
      name: "A. Patel",
      role: "System Administrator",
      icon: <FiSettings />,
      text: "The software is highly dependable and easy to manage. The return on investment is clear.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2
            className={`text-3xl font-black uppercase tracking-tighter ${isDark ? "text-white" : "text-[#001F3F]"}`}
          >
            Trusted by{" "}
            <span className="font-light italic lowercase">thousands.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`p-10 rounded-[1.5rem] border-2 transition-all hover:-translate-y-2 ${isDark
                  ? "bg-[#001F3F]/10 border-slate-800"
                  : "bg-white border-slate-100 shadow-xl shadow-slate-100"
                }`}
            >
              <div className="flex items-center gap-5 mb-8">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${isDark
                      ? "bg-slate-800 text-white"
                      : "bg-slate-50 text-[#001F3F] border border-slate-100 shadow-inner"
                    }`}
                >
                  {t.icon}
                </div>
                <div>
                  <p
                    className={`text-xs font-black uppercase italic ${isDark ? "text-white" : "text-[#001F3F]"}`}
                  >
                    {t.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {t.role}
                  </p>
                </div>
              </div>
              <p
                className={`text-[10px] font-black uppercase tracking-widest leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}
              >
                "{t.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- STATS SECTION ---
export const StatsSection = ({ isDark }) => (
  <section className="py-24 px-6">
    <div
      className={`max-w-7xl mx-auto rounded-[2rem] p-12 border ${isDark ? "bg-[#001F3F] border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
        {[
          { label: "Active Businesses", val: "50K+" },
          { label: "Platform Uptime", val: "99.9%" },
          { label: "User Rating", val: "4.9/5" },
          { label: "System Speed", val: "<10ms" },
        ].map((stat, i) => (
          <div key={i}>
            <div
              className={`text-4xl font-black mb-1 uppercase ${isDark ? "text-white" : "text-[#001F3F]"}`}
            >
              {stat.val}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- FAQ SECTION ---
export const FAQSection = ({ isDark }) => {
  const [open, setOpen] = useState(null);
  const faqs = [
    {
      question: "Can I change my plan later?",
      answer:
        "Yes! You can upgrade or downgrade your plan tier at any time directly from your dashboard settings.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We support UPI, all major credit/debit cards, and net banking options.",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2
          className={`text-2xl font-black uppercase tracking-tighter italic mb-12 text-center ${isDark ? "text-white" : "text-[#001F3F]"}`}
        >
          Frequently Asked{" "}
          <span className="font-light italic lowercase">Questions (FAQ).</span>
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-xl border transition-all ${isDark ? "border-slate-800 bg-[#001F3F]/10" : "border-slate-100 bg-white"}`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full p-6 text-left flex justify-between items-center group"
              >
                <span
                  className={`text-[11px] font-black uppercase tracking-widest ${isDark ? "text-white" : "text-[#001F3F]"}`}
                >
                  {faq.question}
                </span>
                <FiChevronRight
                  className={`transition-transform duration-300 ${open === i ? "rotate-90" : ""} text-slate-400`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};