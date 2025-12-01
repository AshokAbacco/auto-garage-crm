// client/src/payment/PricingComponents.jsx
import React, { useState } from "react";
import {
  Check,
  X,
  Zap,
  Star,
  Crown,
  ChevronRight,
  CreditCard,
  Smartphone,
  ArrowRight,
  CheckCircle,
  Gift,
  Timer,
  HeartHandshake,
  BadgeCheck,
  Shield,
  Award,
  Sparkles,
  Users,
  Rocket,
  TrendingUp,
  Lock,
  MessageCircle,
} from "lucide-react";

// Hero Section Component
// --- ONLY UPDATED HERO COMPONENT (FULL FILE UNCHANGED EXCEPT THIS PART) ---

export const Hero = ({
  isDark,
  billingPeriod,
  setBillingPeriod,
  planType,
  setPlanType,
}) => (
  <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
    <div className="max-w-7xl mx-auto text-center space-y-6">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 backdrop-blur-sm">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span
          className={`text-sm font-medium ${
            isDark ? "text-violet-300" : "text-violet-700"
          }`}
        >
          Limited time offer - Save up to 10%
        </span>
      </div>

      {/* Main Heading */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          <span
            className={`block mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Pricing that scales
          </span>
          <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            with your business
          </span>
        </h1>

        <p
          className={`text-lg sm:text-xl max-w-2xl mx-auto ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Start free, upgrade when you need to. No hidden fees, no surprises.
        </p>
      </div>

      {/* Monthly / Yearly Switch */}
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
            setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")
          }
          className={`relative w-16 h-8 rounded-full transition ${
            billingPeriod === "yearly"
              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
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

      {/* Bike / Washing Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => setPlanType("car")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            planType === "car"
              ? "bg-violet-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Car Pricing Plan
        </button>
        <button
          onClick={() => setPlanType("bike")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            planType === "bike"
              ? "bg-violet-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Bike Pricing Plan
        </button>

        <button
          onClick={() => setPlanType("washing")}
          className={`px-4 py-2 rounded-xl font-semibold ${
            planType === "washing"
              ? "bg-violet-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Washing Pricing Plan
        </button>

        
      </div>
    </div>
  </section>
);

// Pricing Card Component
export const PricingCard = ({
  plan,
  billingPeriod,
  isDark,
  onSelect,
  isPopular,
}) => {
  const Icon = plan.icon;
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
    <div className={`relative ${isPopular ? "lg:scale-105 lg:-mt-4" : ""}`}>
      {/* Popular Badge */}
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-violet-500/25 flex items-center gap-1.5">
            <Star className="w-3 h-3 fill-current" />
            {plan.badge}
          </div>
        </div>
      )}

      <div
        className={`h-full rounded-3xl p-8 transition-all duration-300 hover:scale-[1.02] ${
          isPopular
            ? `bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-2xl shadow-violet-500/25 border-2 border-violet-400/50`
            : isDark
            ? "bg-gray-800/50 backdrop-blur-xl border-2 border-gray-700/50 hover:border-violet-500/50"
            : "bg-white border-2 border-gray-200 hover:border-violet-500/50 shadow-xl"
        }`}
      >
        {/* Icon */}
        <div
          className={`inline-flex p-3 rounded-2xl mb-6 ${
            isPopular
              ? "bg-white/20 backdrop-blur-sm"
              : "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
          }`}
        >
          <Icon
            className={`w-7 h-7 ${
              isPopular ? "text-white" : "text-violet-500"
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
            <span className="text-5xl font-bold">₹{monthlyEquivalent}</span>
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
          onClick={() => onSelect(plan)}
          className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            isPopular
              ? "bg-white text-violet-600 hover:bg-gray-50 shadow-lg"
              : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-violet-500/25"
          }`}
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Trust Section Component
export const TrustSection = ({ isDark }) => {
  const features = [
    { icon: Shield, label: "Bank-level Security", desc: "Your data is safe" },
    {
      icon: HeartHandshake,
      label: "24/7 Support",
      desc: "Always here to help",
    },
    { icon: BadgeCheck, label: "7-Day Guarantee", desc: "Risk-free trial" },
    { icon: Timer, label: "Instant Setup", desc: "Start in minutes" },
  ];

  return (
    <section
      className={`relative z-10 px-4 sm:px-6 py-16 ${
        isDark ? "bg-gray-900/50" : "bg-gray-50"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center space-y-3">
                <div
                  className={`inline-flex p-4 rounded-2xl ${
                    isDark ? "bg-violet-500/10" : "bg-violet-50"
                  }`}
                >
                  <Icon className="w-8 h-8 text-violet-500" />
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
  );
};

// Stats Component
export const StatsSection = ({ isDark }) => {
  const stats = [
    { value: "50K+", label: "Active Users", icon: Users },
    { value: "99.9%", label: "Uptime", icon: Rocket },
    { value: "4.9/5", label: "User Rating", icon: Star },
    { value: "24/7", label: "Support", icon: HeartHandshake },
  ];

  return (
    <section className="relative z-10 px-4 sm:px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div
          className={`rounded-3xl p-8 sm:p-12 ${
            isDark
              ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700"
              : "bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-100"
          }`}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center space-y-2">
                  <Icon className="w-8 h-8 mx-auto text-violet-500 mb-3" />
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonial Component
export const TestimonialSection = ({ isDark }) => {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Garage Owner",
      image: "👨‍💼",
      text: "This platform has transformed our workflow. OCR accuracy is impressive!",
    },
    {
      name: "Priya Sharma",
      role: "Fleet Manager",
      image: "👩‍💼",
      text: "Best investment for our business. Support team is incredibly responsive.",
    },
    {
      name: "Amit Patel",
      role: "Auto Service",
      image: "👨‍🔧",
      text: "The maintenance alerts feature has saved us thousands in repair costs.",
    },
  ];

  return (
    <section className="relative z-10 px-4 sm:px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              thousands
            </span>
          </h2>
          <p
            className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            See what our customers have to say
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl transition-all hover:scale-105 ${
                isDark
                  ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700"
                  : "bg-white border border-gray-200 shadow-lg"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{testimonial.image}</div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p
                    className={`text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                "{testimonial.text}"
              </p>
              <div className="flex gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// FAQ Component
export const FAQSection = ({ isDark }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Can I change my plan later?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept UPI, credit cards, debit cards, and net banking for your convenience.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "All plans come with a 7-day money-back guarantee. Try risk-free!",
    },
  ];

  return (
    <section className="relative z-10 px-4 sm:px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl overflow-hidden transition-all ${
                isDark
                  ? "bg-gray-800/50 backdrop-blur-xl border border-gray-700"
                  : "bg-white border border-gray-200 shadow-lg"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-violet-500/5 transition-colors"
              >
                <span className="font-semibold">{faq.question}</span>
                <ChevronRight
                  className={`w-5 h-5 transition-transform ${
                    openIndex === index ? "rotate-90" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div
                  className={`px-6 pb-6 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
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
