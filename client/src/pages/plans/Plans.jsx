import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiClock,
  FiInfo,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Plans() {
  const { isDark } = useTheme();
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/user-plan/${userEmail}`);
        const data = await res.json();

        if (data.success) {
          setPlanInfo(data.payment);
        }

        setLoading(false);
      } catch (err) {
        console.error("Plan fetch error:", err);
        setLoading(false);
      }
    };

    if (userEmail) loadPlan();
  }, [userEmail]);

  if (loading)
    return (
      <div
        className={`min-h-screen p-6 flex justify-center items-center ${
          isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        Loading...
      </div>
    );

  if (!planInfo)
    return (
      <div
        className={`min-h-screen p-6 flex justify-center items-center ${
          isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div
          className={`rounded-3xl p-8 shadow-lg text-center ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <FiInfo className="mx-auto text-4xl mb-3 text-blue-400" />
          <h2 className="text-xl font-semibold">No Active Plan</h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
            You have not purchased any plan yet.
          </p>
        </div>
      </div>
    );

  // ------------------------------------------------------
  // 🔥 Unified expiry logic: trialEndDate or expiryDate
  // ------------------------------------------------------
  const trialEnd = planInfo.trialEndDate ? new Date(planInfo.trialEndDate) : null;
  const expiry = planInfo.expiryDate ? new Date(planInfo.expiryDate) : null;

  const today = new Date();

  let finalExpiryDate = expiry || trialEnd;
  let daysLeft = finalExpiryDate
    ? Math.ceil((finalExpiryDate - today) / (1000 * 60 * 60 * 24))
    : 0;

  const isTrial = planInfo.status === "TRIAL";
  const isActive = planInfo.status === "ACTIVE";
  const isExpired = daysLeft <= 0;

  return (
    <div
      className={`min-h-screen p-6 lg:ml-16 ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div
          className={`rounded-3xl p-8 shadow-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h1 className="text-3xl font-bold">Your Subscription Plan</h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
            View your plan, status & renewal details.
          </p>
        </div>

        {/* ⚠️ Expired */}
        {isExpired && (
          <div className="rounded-2xl p-5 shadow-lg bg-red-100 border border-red-400 text-red-800 flex items-center gap-3">
            <FiAlertTriangle className="text-2xl" />
            <p className="font-semibold">
              Your plan has expired. Please renew to continue using services.
            </p>
          </div>
        )}

        {/* ⚠️ Active but about to expire */}
        {isActive && daysLeft <= 3 && daysLeft > 0 && (
          <div className="rounded-2xl p-5 shadow-lg bg-yellow-100 border border-yellow-400 text-yellow-800 flex items-center gap-3">
            <FiAlertTriangle className="text-2xl" />
            <p className="font-semibold">
              Your plan expires in <b>{daysLeft} days</b>. Renewal upcoming.
            </p>
          </div>
        )}

        {/* ⚠️ Trial message */}
        {isTrial && !isExpired && (
          <div className="rounded-2xl p-5 shadow-lg bg-blue-100 border border-blue-400 text-blue-800 flex items-center gap-3">
            <FiClock className="text-2xl" />
            <p className="font-semibold">
              You are on a <b>7-day free trial</b>.  
              {daysLeft > 0 ? (
                <> <b>{daysLeft} days</b> remaining.</>
              ) : (
                "Trial ended."
              )}
            </p>
          </div>
        )}

        {/* MAIN PLAN CARD */}
        <div
          className={`rounded-3xl p-8 shadow-lg space-y-6 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <FiCreditCard className="text-green-500" />
            {planInfo.plan} Plan
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <DetailItem
              icon={<FiUser />}
              title="Customer Name"
              value={planInfo.customerName}
              isDark={isDark}
            />

            <DetailItem
              icon={<FiClock />}
              title="Billing Period"
              value={planInfo.billingPeriod}
              isDark={isDark}
            />

            {planInfo.paidAt && (
              <DetailItem
                icon={<FiCalendar />}
                title="Purchased On"
                value={new Date(planInfo.paidAt).toLocaleDateString()}
                isDark={isDark}
              />
            )}

            <DetailItem
              icon={<FiCalendar />}
              title={isTrial ? "Trial Ends On" : "Plan Expiry Date"}
              value={finalExpiryDate.toLocaleDateString()}
              isDark={isDark}
            />

            {isActive && (
              <DetailItem
                icon={<FiCalendar />}
                title="Next Renewal"
                value={new Date(planInfo.nextBillingDate).toLocaleDateString()}
                isDark={isDark}
              />
            )}

            <DetailItem
              icon={<FiCheckCircle />}
              title="Status"
              value={planInfo.status}
              isDark={isDark}
            />

            {planInfo.amount && (
              <DetailItem
                icon={<FiCreditCard />}
                title="Amount"
                value={`₹${planInfo.amount}`}
                isDark={isDark}
              />
            )}
          </div>

          {/* Days Left Message */}
          <div className="text-center pt-4">
            <p
              className={`text-xl font-semibold ${
                isExpired
                  ? "text-red-500"
                  : daysLeft <= 3
                  ? "text-yellow-500"
                  : "text-green-500"
              }`}
            >
              {isExpired
                ? "Plan Expired"
                : daysLeft > 0
                ? `${daysLeft} Days Remaining`
                : "Trial Ended"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Detail Card Component */
function DetailItem({ icon, title, value, isDark }) {
  return (
    <div
      className={`p-4 rounded-xl flex items-center gap-4 shadow ${
        isDark ? "bg-gray-700" : "bg-gray-50"
      }`}
    >
      <div className="text-green-500 text-2xl">{icon}</div>
      <div>
        <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>
          {title}
        </p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}
