import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useTheme } from "../../contexts/ThemeContext";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiClock,
  FiActivity,
  FiArrowUpCircle,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Plans() {
  const { isDark } = useTheme();
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null); // Accordion state for history

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/payments/user-plan/${encodeURIComponent(userEmail)}`,
        );
        const data = await res.json();

        if (data.currentPlan || data.previousPlan) {
          setPlanInfo({
            current: data.currentPlan,
            previous: data.previousPlan,
            history: data.history || [],
          });
          setError(null);
        } else {
          setError(data.message || "No plans found");
        }
      } catch (err) {
        setError("Failed to fetch plan info");
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) loadPlan();
  }, [userEmail]);

  if (loading)
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${isDark ? " text-white" : "bg-gray-50 text-gray-900"}`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          <p>Loading Plan Details...</p>
        </div>
      </div>
    );

  if (!planInfo)
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div
          className={`p-8 rounded-xl shadow-lg text-center ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
        >
          <h2 className="text-xl font-bold mb-2">No Active Plans Found</h2>
          <p className="text-gray-500">
            {error || "Please subscribe to a plan to see details here."}
          </p>
        </div>
      </div>
    );

  return (
    <div
      className={`min-h-screen p-1 transition-colors duration-300 ${isDark ? " text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Subscription & Billing</h1>
          <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Manage your current plan and view billing history.
          </p>
        </div>

        {/* Current Plan Section */}
        {planInfo.current && (
          <PlanCard
            title="Current Plan"
            data={planInfo.current}
            isDark={isDark}
            isActive={true}
          />
        )}

        {/* Previous Plan Section (if exists) */}
        {planInfo.previous && (
          <div className="opacity-75">
            <PlanCard
              title="Previous Plan"
              data={planInfo.previous}
              isDark={isDark}
              isActive={false}
            />
          </div>
        )}

        {/* Billing History Accordion */}
        {planInfo.history && planInfo.history.length > 0 && (
          <div
            className={`rounded-3xl shadow-lg border overflow-hidden ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiClock /> Billing History
              </h2>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {planInfo.history.map((item, index) => (
                <HistoryItem
                  key={index}
                  item={item}
                  isOpen={openIndex === index}
                  toggle={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  isDark={isDark}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   COMPONENT: PlanCard (Handles Logic for Trial vs Active)
---------------------------------------------------------------- */
function PlanCard({ title, data, isDark, isActive }) {
  // 1. Determine Status Type
  const status = data.status || "PENDING";
  const isTrial = status === "TRIAL";
  const isCancelled = status === "CANCELLED";

  // 2. LOGIC: Determine the correct End Date
  // If Trial -> Use trialEndDate.
  // If Active -> Use nextBillingDate (or expiryDate as fallback).
  let endDateRaw = isTrial
    ? data.trialEndDate
    : data.nextBillingDate || data.expiryDate;

  // 3. Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const crmType = localStorage.getItem("crmType"); // car | bike | washing

  const getUpgradePath = (crmType) => {
    switch (crmType) {
      case "bike":
        return "/bike-plans";
      case "wash":
        return "/washing-upgrade";
      case "car":
      default:
        return "/upgrade";
    }
  };

  // 4. Calculate Countdown & Progress
  const today = new Date();
  const end = endDateRaw ? new Date(endDateRaw) : null;
  const start = new Date(data.createdAt); // Used for progress calculation

  let daysRemaining = 0;
  let progressPercent = 0;
  let statusText = status;

  if (end) {
    const totalDuration = end - start;
    const elapsed = today - start;
    const diffTime = end - today;

    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate progress bar percentage (0% to 100%)
    if (totalDuration > 0) {
      progressPercent = Math.min(
        100,
        Math.max(0, (elapsed / totalDuration) * 100),
      );
    }

    if (daysRemaining < 0) {
      statusText = "EXPIRED";
      daysRemaining = 0;
      progressPercent = 100;
    }
  }

  // 5. Dynamic Styles based on Status
  const themeStyles = {
    TRIAL: {
      bg: isDark ? "bg-orange-900/10" : "bg-orange-50",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-600 dark:text-orange-400",
      bar: "bg-orange-500",
      badge: "bg-orange-100 text-orange-700 border-orange-200",
      btn: "bg-orange-600 hover:bg-orange-700",
    },
    ACTIVE: {
      bg: isDark ? "bg-gray-800" : "bg-white",
      border: "border-green-200 dark:border-green-900",
      text: "text-green-600 dark:text-green-400",
      bar: "bg-green-500",
      badge: "bg-green-100 text-green-700 border-green-200",
      btn: "bg-green-600 hover:bg-green-700",
    },
    CANCELLED: {
      bg: isDark ? "bg-red-900/10" : "bg-red-50",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-600 dark:text-red-400",
      bar: "bg-red-500",
      badge: "bg-red-100 text-red-700 border-red-200",
      btn: "bg-gray-600 hover:bg-gray-700",
    },
  };

  const currentTheme = themeStyles[status] || themeStyles.ACTIVE;

  // 6. Dynamic Labels
  const amountLabel = isTrial ? "Trial Value" : "Amount Paid";
  const dateLabel = isTrial ? "Trial Ends On" : "Next Payment / Expiry";
  const startedLabel = isTrial ? "Trial Started" : "Payment Date";

  // Use paidAt for active plans, createdAt for trials
  const startedDateValue = isTrial
    ? data.createdAt
    : data.paidAt || data.createdAt;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-8 shadow-lg border ${currentTheme.border} ${currentTheme.bg} ${isDark ? "text-white" : "text-gray-900"}`}
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase opacity-60 mb-1">
            {title}
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">{data.plan}</h2>
            {isTrial && (
              <span className="text-xs px-2 py-1 rounded bg-black text-white dark:bg-white dark:text-black font-bold">
                PRO
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span
            className={`px-4 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${currentTheme.badge}`}
          >
            ● {statusText}
          </span>
          {isActive && daysRemaining > 0 && (
            <span className={`text-sm mt-2 font-medium ${currentTheme.text}`}>
              {daysRemaining} Days Remaining
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar (Only for Active/Trial) */}
      {isActive && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${currentTheme.bar}`}
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      )}

      {/* Grid Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailBox
          icon={<FiUser />}
          label="Customer"
          value={data.customerName || "N/A"}
          isDark={isDark}
        />

        <DetailBox
          icon={<FiCreditCard />}
          label={amountLabel}
          value={`₹${data.amount?.toLocaleString()}`}
          isDark={isDark}
        />

        <DetailBox
          icon={<FiCalendar />}
          label={startedLabel}
          value={formatDate(startedDateValue)}
          isDark={isDark}
        />

        <DetailBox
          icon={<FiClock />}
          label={dateLabel}
          value={formatDate(endDateRaw)}
          highlight={daysRemaining <= 3 && isActive} // Red highlight if expiring soon
          isDark={isDark}
        />

        <DetailBox
          icon={<FiActivity />}
          label="Billing Period"
          value={data.billingPeriod || "Monthly"}
          isDark={isDark}
        />

        <DetailBox
          icon={<FiCheckCircle />}
          label="Payment Status"
          value={
            data.paidAt ? "Successful" : isTrial ? "Free Trial" : "Pending"
          }
          isDark={isDark}
        />
      </div>

      {/* CTA Section for Trial Users */}
      {isTrial && isActive && (
        <div
          className={`mt-8 p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? "bg-gray-800 border-gray-600" : "bg-white/50 border-gray-200"}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
              <FiArrowUpCircle size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">Trial ends soon!</p>
              <p className="text-xs opacity-70">
                Upgrade now to keep your data and features.
              </p>
            </div>
          </div>

          <Link to={getUpgradePath(crmType)}>
            <button
              className={`px-6 py-2 rounded-lg text-white text-sm font-bold shadow-lg transition-transform hover:scale-105 ${currentTheme.btn}`}
            >
              Upgrade Plan
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   COMPONENT: DetailBox (Individual Stats)
---------------------------------------------------------------- */
function DetailBox({ icon, label, value, highlight, isDark }) {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
        highlight
          ? "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
          : "bg-transparent"
      }`}
    >
      <div
        className={`text-2xl ${highlight ? "text-red-500" : isDark ? "text-gray-400" : "text-gray-400"}`}
      >
        {icon}
      </div>
      <div>
        <p
          className={`text-xs uppercase font-bold tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          {label}
        </p>
        <p
          className={`text-lg font-semibold ${highlight ? "text-red-600 dark:text-red-400" : ""}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   COMPONENT: HistoryItem (Accordion)
---------------------------------------------------------------- */
function HistoryItem({ item, isOpen, toggle, isDark }) {
  return (
    <div className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div
        onClick={toggle}
        className="p-4 cursor-pointer flex justify-between items-center"
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-2 rounded-lg ${item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
          >
            <FiCreditCard />
          </div>
          <div>
            <p className="font-bold text-sm">{item.plan}</p>
            <p className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold">₹{item.amount}</span>
          <span
            className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            ▼
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div
          className={`px-4 pb-4 pt-0 text-sm grid grid-cols-2 gap-y-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}
        >
          <p>
            <b>Payment ID:</b> {item.paymentId || "-"}
          </p>
          <p>
            <b>Sub ID:</b> {item.subscriptionId || "-"}
          </p>
          <p>
            <b>Period:</b> {item.billingPeriod}
          </p>
          <p>
            <b>Status:</b> {item.status}
          </p>
          <p className="col-span-2 text-xs opacity-50 mt-2">
            Invoice generated on {new Date(item.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
