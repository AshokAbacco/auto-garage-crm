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
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  useEffect(() => {
    const loadPlan = async () => {
      try {
        // Debug: Log the email being used
        console.log("Fetching plan for email:", userEmail);
        setDebugInfo(prev => ({ ...prev, userEmail }));

        const res = await fetch(`${API_BASE}/api/payments/user-plan/${encodeURIComponent(userEmail)}`);
        const data = await res.json();

        // Debug: Log the response
        console.log("API Response:", data);
        setDebugInfo(prev => ({ ...prev, apiResponse: data }));

        if (data.success) {
          setPlanInfo(data.payment);
          setError(null);
        } else {
          setError(data.message || "No plan found");
          setPlanInfo(null);
        }
      } catch (err) {
        console.error("Plan fetch error:", err);
        setError("Failed to fetch plan information");
        setDebugInfo(prev => ({ ...prev, fetchError: err.message }));
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      loadPlan();
    } else {
      setLoading(false);
      setError("User email not found. Please log in again.");
      setDebugInfo(prev => ({ ...prev, userNotFound: true }));
    }
  }, [userEmail]);

  // Debug: Render debug information in development

  if (loading)
    return (
      <div
        className={`min-h-screen p-6 flex justify-center items-center ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
          }`}
      >
        Loading...
      </div>
    );

  if (error || !planInfo)
    return (
      <div
        className={`min-h-screen p-6 flex justify-center items-center ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
          }`}
      >
        <div
          className={`rounded-3xl p-8 shadow-lg text-center ${isDark ? "bg-gray-800" : "bg-white"
            }`}
        >
          <FiInfo className="mx-auto text-4xl mb-3 text-blue-400" />
          <h2 className="text-xl font-semibold">No Active Plan</h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {error || "You have not purchased any plan yet."}
          </p>
        </div>
      </div>
    );

  // Determine plan status and dates
  const isTrial = planInfo.status === "TRIAL";
  const isActive = planInfo.status === "ACTIVE";

  // Get the most relevant expiry date
  const getExpiryDate = () => {
    // For trial plans, use trialEndDate
    if (isTrial && planInfo.trialEndDate) {
      return new Date(planInfo.trialEndDate);
    }
    // For active plans, use expiryDate or nextBillingDate
    if (planInfo.expiryDate) {
      return new Date(planInfo.expiryDate);
    }
    if (planInfo.nextBillingDate) {
      return new Date(planInfo.nextBillingDate);
    }
    return null;
  };

  const expiryDate = getExpiryDate();
  const today = new Date();
  const daysLeft = expiryDate
    ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
    : 0;

  const isExpired = daysLeft <= 0;

  return (
    <div
      className={`min-h-screen p-6 lg:ml-16 ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div
          className={`rounded-3xl p-8 shadow-lg ${isDark ? "bg-gray-800" : "bg-white"
            }`}
        >
          <h1 className="text-3xl font-bold">Your Subscription Plan</h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
            View your plan, status & renewal details.
          </p>
          
        </div>

        {/* Status Messages */}
        {isExpired && (
          <div className="rounded-2xl p-5 shadow-lg bg-red-100 border border-red-400 text-red-800 flex items-center gap-3">
            <FiAlertTriangle className="text-2xl" />
            <p className="font-semibold">
              Your plan has expired. Please renew to continue using services.
            </p>
          </div>
        )}

        {isActive && daysLeft <= 3 && daysLeft > 0 && (
          <div className="rounded-2xl p-5 shadow-lg bg-yellow-100 border border-yellow-400 text-yellow-800 flex items-center gap-3">
            <FiAlertTriangle className="text-2xl" />
            <p className="font-semibold">
              Your plan expires in <b>{daysLeft} days</b>. Renewal upcoming.
            </p>
          </div>
        )}

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
          className={`rounded-3xl p-8 shadow-lg space-y-6 ${isDark ? "bg-gray-800" : "bg-white"
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
              value={expiryDate ? expiryDate.toLocaleDateString() : "Not available"}
              isDark={isDark}
            />

            {isActive && (
              <DetailItem
                icon={<FiCalendar />}
                title="Next Renewal"
                value={planInfo.nextBillingDate
                  ? new Date(planInfo.nextBillingDate).toLocaleDateString()
                  : "Not available"}
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
              className={`text-xl font-semibold ${isExpired
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
      className={`p-4 rounded-xl flex items-center gap-4 shadow ${isDark ? "bg-gray-700" : "bg-gray-50"
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