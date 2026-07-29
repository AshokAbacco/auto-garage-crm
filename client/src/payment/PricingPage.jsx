import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  Hero,
  PricingCard,
  TrustSection,
  StatsSection,
  TestimonialSection,
  FAQSection,
} from "./PricingComponents";
import PaymentModal from "./PaymentModal";
import { FiZap, FiStar, FiAward, FiCpu } from "react-icons/fi";
import Footer from "../components/Footer.jsx";

export default function ModernPricingPage() {
  const { isDark } = useTheme();
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planType, setPlanType] = useState("car");

  // --- Plan Metadata (Standardized pricing nodes) ---
  const carPlans = [
    {
      id: "basic",
      name: "Basic Package",
      tagline: "1 Month Free Trial Infrastructure",
      numericPrice: 1000,
      icon: FiZap,
      features: [
        "First 30 Days 100% Free",
        "100% CHARGE APPLICABLE FROM 2ND MONTH",
        "RC Image Uploads (10/day)",
        "Standard OCR Extraction",
        "Local History Cache",
        "Export CSV/PDF",
        "Technical Support",
      ],
    },
    {
      id: "standard",
      name: "Standard Package",
      tagline: "Optimized for high-volume",
      numericPrice: 2000,
      icon: FiStar,
      badge: "POPULAR",
      features: [
        "Unlimited Node Uploads",
        "High-Precision OCR",
        "Priority Support Tier",
        "Advanced Data Export",
        "SMS/WhatsApp Protocols",
        "Team Access (3 Logins)",
      ],
    },
    {
      id: "premium",
      name: "Premium Package",
      tagline: "Enterprise-grade control",
      numericPrice: 3000,
      icon: FiAward,
      badge: "BEST VALUE",
      features: [
        "Full Standard Features",
        "Team Access (10 Logins)",
        "Maintenance Alert Logic",
        "Bulk Processing Engine",
        "Dedicated Account Manager",
        "Automated Invoicing",
        "Payroll Management",
        "Integrated Gateways",
      ],
    },
  ];

  const bikePlans = [
    {
      id: "basic",
      name: "Basic Package",
      tagline: "1 Month Free Trial Setup",
      numericPrice: 600,
      icon: FiZap,
      features: [
        "First 30 Days 100% Free",
        "100% CHARGE APPLICABLE FROM 2ND MONTH",
        "RC Image Uploads (10/day)",
        "Standard OCR Extraction",
        "Local History Cache",
        "Export CSV/PDF",
        "Technical Support",
      ],
    },
    {
      id: "standard",
      name: "Standard Package",
      tagline: "Enhanced efficiency",
      numericPrice: 1200,
      icon: FiStar,
      badge: "POPULAR",
      features: [
        "Unlimited Node Uploads",
        "High-Precision OCR",
        "Priority Support Tier",
        "Advanced Data Export",
        "SMS/WhatsApp Protocols",
        "Team Access (3 Logins)",
      ],
    },
    {
      id: "premium",
      name: "Premium Package",
      tagline: "Elite fleet management",
      numericPrice: 2000,
      icon: FiAward,
      badge: "BEST VALUE",
      features: [
        "Full Standard Features",
        "Team Access (10 Logins)",
        "Maintenance Alert Logic",
        "Bulk Processing Engine",
        "Dedicated Account Manager",
        "Automated Invoicing",
        "Payroll Management",
        "Integrated Gateways",
      ],
    },
  ];

  const washingPlans = [
    {
      id: "standard",
      name: "Standard Package",
      tagline: "Queue management ready",
      numericPrice: 500,
      icon: FiStar,
      badge: "POPULAR",
      features: [
        "Unlimited Queue Uploads",
        "Priority Support Tier",
        "Advanced Data Export",
        "SMS/WhatsApp Protocols",
        "Team Access (3 Logins)",
      ],
    },
    {
      id: "premium",
      name: "Premium Package",
      tagline: "Scale-ready infrastructure",
      numericPrice: 1000,
      icon: FiAward,
      badge: "BEST VALUE",
      features: [
        "Full Standard Features",
        "Team Access (10 Logins)",
        "Maintenance Alert Logic",
        "Bulk Processing Engine",
        "Dedicated Account Manager",
        "Automated Invoicing",
        "Payroll Management",
        "Integrated Gateways",
      ],
    },
  ];

  let activePlans =
    planType === "bike"
      ? bikePlans
      : planType === "washing"
        ? washingPlans
        : carPlans;

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 pt-32 ${isDark ? "bg-[#000814] text-white" : "bg-white text-[#001F3F]"
        }`}
    >
      {/* --- Section Header --- */}
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <div
          className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border mb-8 ${isDark
            ? "bg-white/5 border-white/10"
            : "bg-slate-50 border-slate-200"
            }`}
        >
          <span
            className={`flex gap-3 text-[9px] font-black uppercase tracking-[0.3em] ${isDark ? "text-white" : "text-[#001F3F]"}`}
          >
            <FiCpu size={18} />
            Subscription Protocols
          </span>
        </div>

        {/* Color Correction: Applied #001F3F for Light Mode Headings */}
        <h1
          className={`text-5xl lg:text-7xl font-black tracking-tighter mb-6 uppercase ${isDark ? "text-white" : "text-[#001F3F]"
            }`}
        >
          Pricing{" "}
          <span className="font-light italic lowercase">Infrastructure.</span>
        </h1>

        <p
          className={`text-lg max-w-2xl mx-auto font-medium ${isDark ? "text-slate-400" : "text-slate-500"
            }`}
        >
          Select the operational tier that aligns with your garage nodes.
          Flexible billing cycles for global scalability.
        </p>
      </div>

      {/* --- Control HUD (Billing & Plan Type) --- */}
      <div className="max-w-7xl mx-auto mb-16 px-6">
        <Hero
          isDark={isDark}
          billingPeriod={billingPeriod}
          setBillingPeriod={setBillingPeriod}
          planType={planType}
          setPlanType={setPlanType}
        />
      </div>

      {/* --- Pricing Matrix --- */}
      <section className="relative z-10 px-6 pb-24">
        <div
          className={`max-w-7xl mx-auto gap-8 ${activePlans.length === 1
            ? "flex justify-center"
            : activePlans.length === 2
              ? "grid grid-cols-1 md:grid-cols-2 lg:max-w-4xl"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
        >
          {activePlans.map((plan) => (
            <div
              key={plan.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <PricingCard
                plan={plan}
                billingPeriod={billingPeriod}
                isDark={isDark}
                onSelect={handlePlanSelect}
                isPopular={plan.badge === "POPULAR"}
              />
            </div>
          ))}
        </div>
      </section>

      {/* --- Supplemental Registry Sections --- */}
      <div
        className={`border-t ${isDark ? "border-white/5 bg-[#001F3F]/20" : "border-slate-100 bg-slate-50"}`}
      >
        <StatsSection isDark={isDark} />
      </div>

      <TrustSection isDark={isDark} />

      <div className={isDark ? "bg-[#000814]" : "bg-white"}>
        <TestimonialSection isDark={isDark} />
      </div>

      <FAQSection isDark={isDark} />

      {/* --- Transmission Components --- */}
      <PaymentModal
        show={showModal}
        plan={selectedPlan}
        billingPeriod={billingPeriod}
        isDark={isDark}
        planType={planType}
        onClose={() => setShowModal(false)}
        onComplete={() => setShowModal(false)}
      />
    </div>
  );
}