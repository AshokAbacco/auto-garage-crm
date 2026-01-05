// client/src/components/UpgradePlans.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import PaymentModal from "../../payment/PaymentModal.jsx";
import {
  Zap,
  Star,
  Crown,
  ArrowRight,
  Check,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  X,
} from "lucide-react";

export default function UpgradePlans() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planType, setPlanType] = useState("car");
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user's plan
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!token || !user?.email) {
          setLoading(false);
          return;
        }

        const API =
          window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : "https://auto-garage-crm-zrxc.onrender.com";

        const response = await fetch(`${API}/api/payments/user-plan/${user.email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success && data.payment) {
          setCurrentPlan(data.payment);
        }
      } catch (error) {
        console.error("Error fetching current plan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentPlan();
  }, []);

  // Car Plans
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

  // Bike Plans
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

  // Washing Plans
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

  // Get active plans based on selected type
  let activePlans = bikePlans;
 

  const handlePlanSelect = (plan) => {
    // Check if trying to select current plan
    if (currentPlan && currentPlan.plan.toLowerCase() === plan.name.toLowerCase()) {
      alert("You are already subscribed to this plan!");
      return;
    }

    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePaymentComplete = () => {
    setShowModal(false);
    // Redirect to dashboard after successful payment
    navigate("/bike-dashboard");
    // Refresh the page to load new plan data
    window.location.reload();
  };

  // Check if a plan is the current active plan
  const isCurrentPlan = (plan) => {
    return currentPlan && currentPlan.plan.toLowerCase() === plan.name.toLowerCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-b from-white via-gray-50 to-white text-gray-900"
      }`}
    >
      {/* Header Section */}
      <section className="relative z-10 px-4 sm:px-6 py-12">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span
              className={`text-sm font-medium ${
                isDark ? "text-blue-300" : "text-blue-700"
              }`}
            >
              Upgrade your plan to unlock more features
            </span>
          </div>

          {/* Current Plan Badge */}
          {currentPlan && (
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                isDark
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">
                Current Plan: {currentPlan.plan} ({currentPlan.status})
              </span>
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              <span
                className={`block mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Choose Your Perfect Plan
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                Scale as you grow
              </span>
            </h1>

            <p
              className={`text-lg max-w-2xl mx-auto ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Flexible pricing that adapts to your business needs
            </p>
          </div>

          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <span
              className={`text-sm font-medium ${
                billingPeriod === "monthly" ? "text-white" : "text-gray-500"
              }`}
            >
              Monthly
            </span>

            <button
              onClick={() =>
                setBillingPeriod(
                  billingPeriod === "monthly" ? "yearly" : "monthly"
                )
              }
              className={`relative w-16 h-8 rounded-full transition ${
                billingPeriod === "yearly"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                  : "bg-gray-700"
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${
                  billingPeriod === "yearly" ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </button>

            <span
              className={`text-sm font-medium ${
                billingPeriod === "yearly" ? "text-white" : "text-gray-500"
              }`}
            >
              Yearly
            </span>

            <span className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
              Save 10%
            </span>
          </div>

          {/* Plan Type Selector */}
          <div className="flex justify-center gap-4 mt-6">
            
            <button
              onClick={() => setPlanType("bike")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                planType === "bike"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : isDark
                  ? "bg-gray-800 text-gray-300 border border-gray-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Bike Plans
            </button>
           
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative z-10 px-4 sm:px-6 pb-20 pt-12">
        <div
          className={`max-w-7xl mx-auto gap-8 ${
            activePlans.length === 1
              ? "flex justify-center"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {activePlans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.badge === "POPULAR";
            const isCurrent = isCurrentPlan(plan);
            const yearlyDiscount = 0.1;
            const finalPrice =
              billingPeriod === "yearly"
                ? Math.round(plan.numericPrice * 12 * (1 - yearlyDiscount))
                : plan.numericPrice;
            const monthlyEquivalent =
              billingPeriod === "yearly"
                ? Math.round(finalPrice / 12)
                : plan.numericPrice;

            return (
              <div
                key={plan.id}
                className={`relative ${
                  isPopular ? "lg:scale-105 lg:-mt-4" : ""
                } ${activePlans.length === 1 ? "w-full max-w-[400px]" : ""}`}
              >
                {/* Popular/Current Badge */}
                {(plan.badge || isCurrent) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div
                      className={`px-4 py-1.5 rounded-full text-white text-xs font-bold shadow-lg flex items-center gap-1.5 ${
                        isCurrent
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : "bg-gradient-to-r from-blue-500 to-blue-600"
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-3 h-3" />
                          CURRENT PLAN
                        </>
                      ) : (
                        <>
                          <Star className="w-3 h-3 fill-current" />
                          {plan.badge}
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div
                  className={`h-full rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                    isCurrent
                      ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50"
                      : isPopular
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl shadow-blue-500/25 border-2 border-blue-400/50"
                      : isDark
                      ? "bg-gray-800/50 backdrop-blur-xl border-2 border-gray-700/50 hover:border-blue-500/50"
                      : "bg-white border-2 border-gray-200 hover:border-blue-500/50 shadow-xl"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex p-3 rounded-2xl mb-6 ${
                      isPopular
                        ? "bg-white/20 backdrop-blur-sm"
                        : "bg-gradient-to-br from-blue-500/10 to-blue-600/10"
                    }`}
                  >
                    <Icon
                      className={`w-7 h-7 ${
                        isPopular ? "text-white" : "text-blue-500"
                      }`}
                    />
                  </div>

                  {/* Plan Name */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p
                      className={`text-sm ${
                        isPopular
                          ? "text-white/80"
                          : isDark
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-bold">
                        ₹{monthlyEquivalent}
                      </span>
                      <span
                        className={`text-lg ${
                          isPopular
                            ? "text-white/70"
                            : isDark
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        /mo
                      </span>
                    </div>
                    {billingPeriod === "yearly" && (
                      <p
                        className={`text-sm ${
                          isPopular
                            ? "text-white/70"
                            : isDark
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        ₹{finalPrice} billed annually
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                            isPopular ? "bg-white/20" : "bg-green-500/10"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 ${
                              isPopular ? "text-white" : "text-green-500"
                            }`}
                          />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isCurrent}
                    className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? "bg-gray-500 text-white cursor-not-allowed opacity-60"
                        : isPopular
                        ? "bg-white text-violet-600 hover:bg-gray-50 shadow-lg"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/25"
                    }`}
                  >
                    <span>{isCurrent ? "Current Plan" : "Upgrade Now"}</span>
                    {!isCurrent && <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Indicators */}
      <section
        className={`relative z-10 px-4 sm:px-6 py-12 ${
          isDark ? "bg-gray-900/50" : "bg-gray-50"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, label: "Secure Payment", desc: "Bank-level encryption" },
              { icon: Clock, label: "Instant Access", desc: "Start immediately" },
              { icon: TrendingUp, label: "Cancel Anytime", desc: "No commitments" },
              { icon: Star, label: "24/7 Support", desc: "Always here to help" },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center space-y-3">
                  <div
                    className={`inline-flex p-4 rounded-2xl ${
                      isDark ? "bg-blue-500/10" : "bg-blue-50"
                    }`}
                  >
                    <Icon className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p
                      className={`font-semibold mb-1 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        show={showModal}
        plan={selectedPlan}
        billingPeriod={billingPeriod}
        isDark={isDark}
        planType={planType}
        onClose={() => setShowModal(false)}
        onComplete={handlePaymentComplete}
        userData={user}            // <-- added
        isUpgradePage={true}       // <-- added flag
      />

    </div>
  );
}