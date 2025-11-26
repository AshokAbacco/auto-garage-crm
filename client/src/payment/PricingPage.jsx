// --- FULL FINAL CODE FOR PricingPage.jsx ---

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
import { Zap, Star, Crown, ArrowRight, MessageCircle } from "lucide-react";
import Footer from "../components/Footer.jsx";

export default function ModernPricingPage() {
  const { isDark } = useTheme();
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // 🔹 planType = car | bike | washing
  const [planType, setPlanType] = useState("car");

  // =========================
  // 🚗 CAR PLANS (Default)
  // =========================
  const carPlans = [
    {
      id: "basic",
      name: "Basic",
      tagline: "For small garages",
      numericPrice: 1000,
      icon: Zap,
      features: [
        "Upload RC images (up to 10/day)",
        "Basic OCR extraction",
        "Save history locally",
        "CSV/EXCEL, PDF export",
        "Email support",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      tagline: "Most popular choice",
      numericPrice: 2000,
      icon: Star,
      badge: "POPULAR",
      features: [
        "Unlimited uploads",
        "High-accuracy OCR",
        "Priority support",
        "Export CSV, PDF",
        "SMS/WhatsApp Alerts",
        "Team accounts (up to 3)",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      tagline: "For growing businesses",
      numericPrice: 3000,
      icon: Crown,
      badge: "BEST VALUE",
      features: [
        "Everything in Standard",
        "Team accounts (up to 10)",
        "Maintenance Alert SMS",
        "Bulk processing",
        "Dedicated manager",
        "Auto Invoice",
        "Staff Salary Management",
        "Online Payment Options",
      ],
    },
  ];

  // =========================
  // 🏍 BIKE PLANS
  // =========================
  const bikePlans = [
    {
      id: "basic",
      name: "Basic",
      tagline: "For small garages",
      numericPrice: 600,
      icon: Zap,
      features: [
        "Upload RC images (up to 10/day)",
        "Basic OCR extraction",
        "Save history locally",
        "CSV/EXCEL, PDF export",
        "Email support",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      tagline: "Most popular choice",
      numericPrice: 1200,
      icon: Star,
      badge: "POPULAR",
      features: [
        "Unlimited uploads",
        "High-accuracy OCR",
        "Priority support",
        "Export CSV, PDF",
        "SMS/WhatsApp Alerts",
        "Team accounts (up to 3)",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      tagline: "For growing businesses",
      numericPrice: 2000,
      icon: Crown,
      badge: "BEST VALUE",
      features: [
        "Everything in Standard",
        "Team accounts (up to 10)",
        "Maintenance Alert SMS",
        "Bulk processing",
        "Dedicated manager",
        "Auto Invoice",
        "Staff Salary Management",
        "Online Payment Options",
      ],
    },
  ];

  // =========================
  // 🚿 WASHING PLANS
  // =========================
  const washingPlans = [
    {
      id: "standard",
      name: "Standard",
      tagline: "Most popular choice",
      numericPrice: 500,
      icon: Star,
      badge: "POPULAR",
      features: [
        "Unlimited uploads",
        "High-accuracy OCR",
        "Priority support",
        "Export CSV, PDF",
        "SMS/WhatsApp Alerts",
        "Team accounts (up to 3)",
      ],
    },
  ];

  // ================ PLAN SWITCHING ================
  let activePlans = carPlans;
  if (planType === "bike") activePlans = bikePlans;
  if (planType === "washing") activePlans = washingPlans;

  // ====================================================
  // 🎯 On Plan Select → open payment modal
  // ====================================================
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  // Parent does NOT redirect (Option B)
  const handlePaymentComplete = () => {
    setShowModal(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 mt-[5%] ${
        isDark
          ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-b from-white via-gray-50 to-white text-gray-900"
      }`}
    >
      {/* Hero Section */}
      <Hero
        isDark={isDark}
        billingPeriod={billingPeriod}
        setBillingPeriod={setBillingPeriod}
        planType={planType}
        setPlanType={setPlanType}
      />

      {/* Pricing Cards */}
      <section className="relative z-10 px-4 sm:px-6 pb-20">
        <div
          className={`max-w-7xl mx-auto gap-8 
                ${
                  activePlans.length === 1
                    ? "flex justify-center"
                    : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
        >
          {activePlans.map((plan) => (
            <div
              key={plan.id}
              className={`${
                activePlans.length === 1
                  ? "w-full max-w-[350px]" // <-- increase width here
                  : ""
              }`}
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

      <StatsSection isDark={isDark} />
      <TrustSection isDark={isDark} />
      <TestimonialSection isDark={isDark} />
      <FAQSection isDark={isDark} />

      {/* Payment Modal */}
      <PaymentModal
        show={showModal}
        plan={selectedPlan}
        billingPeriod={billingPeriod}
        isDark={isDark}
        planType={planType} // <-- Important for Option B
        onClose={() => setShowModal(false)}
        onComplete={handlePaymentComplete}
      />

      <Footer />
    </div>
  );
}
