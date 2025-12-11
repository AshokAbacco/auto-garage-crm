import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

import {
    FiAlertTriangle,
    FiCheckCircle,
    FiCalendar,
    FiUser,
    FiCreditCard,
    FiClock,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Plans() {
    const { isDark } = useTheme();
    const [planInfo, setPlanInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openIndex, setOpenIndex] = useState(null); // accordion state

    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = user?.email;

    useEffect(() => {
        const loadPlan = async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/api/payments/user-plan/${encodeURIComponent(
                        userEmail
                    )}`
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
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );

    if (!planInfo)
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="p-8 bg-white shadow rounded-xl">
                    <h2>No Active Plans</h2>
                    <p>{error}</p>
                </div>
            </div>
        );

    return (
        <div
            className={`min-h-screen p-6 ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
                }`}
        >
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Current Plan */}
                {planInfo.current && (
                    <PlanCard
                        title="Current Plan"
                        data={planInfo.current}
                        isDark={isDark}
                    />
                )}

                {/* Previous Plan */}
                {planInfo.previous && (
                    <PlanCard
                        title="Previous Plan"
                        data={planInfo.previous}
                        isDark={isDark}
                    />
                )}

                {/* History Section */}
                {planInfo.history && planInfo.history.length > 2 && (
                    <div className={`rounded-3xl p-8 shadow-lg mt-6 ${isDark ? "bg-gray-800" : "bg-white"}`}>

                        <h2 className="mb-4 text-2xl font-bold">Plan History</h2>

                        <div className="space-y-4">
                            {planInfo.history.map((item, index) => (
                                <div key={index} className="overflow-hidden border rounded-xl">
                                    {/* Header */}
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                        onClick={() =>
                                            setOpenIndex(openIndex === index ? null : index)
                                        }
                                    >
                                        <div>
                                            <p className="text-lg font-semibold">{item.plan}</p>
                                            <p className="text-sm text-gray-500">{item.status}</p>
                                        </div>
                                        <span className="text-xl">
                                            {openIndex === index ? "▲" : "▼"}
                                        </span>
                                    </div>

                                    {/* Expanded Details */}
                                    {openIndex === index && (
                                        <div
                                            className={`p-4 space-y-2 ${isDark ? "bg-gray-700" : "bg-gray-50"
                                                }`}
                                        >
                                            <HistDetail label="Billing Period" value={item.billingPeriod} />
                                            <HistDetail label="Amount" value={`₹${item.amount}`} />
                                            <HistDetail label="Subscription ID" value={item.subscriptionId} />
                                            <HistDetail label="Payment ID" value={item.paymentId || "Not Available"} />
                                            <HistDetail
                                                label="Paid At"
                                                value={
                                                    item.paidAt
                                                        ? new Date(item.paidAt).toLocaleString()
                                                        : "Pending"
                                                }
                                            />
                                            <HistDetail
                                                label="Expiry Date"
                                                value={
                                                    item.expiryDate
                                                        ? new Date(item.expiryDate).toLocaleDateString()
                                                        : "N/A"
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* -------------------------------
   REUSABLE PLAN CARD (UPDATED)
--------------------------------*/
function PlanCard({ title, data, isDark }) {
    const paidAt = data.paidAt
        ? new Date(data.paidAt).toLocaleString()
        : "Not Paid Yet";

    const expiryDate = data.expiryDate
        ? new Date(data.expiryDate).toLocaleDateString()
        : "N/A";

    const nextBilling = data.nextBillingDate
        ? new Date(data.nextBillingDate).toLocaleDateString()
        : "N/A";

    // Countdown Logic
    const daysLeft =
        data.expiryDate &&
        Math.ceil(
            (new Date(data.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        );

    const countdown =
        daysLeft > 0 ? `${daysLeft} days remaining` : "Expired";

    // Color-coded status badge
    const statusColor = {
        ACTIVE: "text-green-500",
        TRIAL: "text-yellow-500",
        PENDING: "text-blue-500",
        CANCELLED: "text-red-500",
    }[data.status] || "text-gray-400";

    return (
        <div
            className={`rounded-3xl p-8 shadow-lg ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                }`}
        >
            <h2 className="mb-6 text-2xl font-bold">
                {title}: {data.plan}{" "}
                <span className={`ml-3 text-sm font-semibold ${statusColor}`}>
                    ● {data.status}
                </span>
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
                <DetailItem icon={<FiUser />} title="Customer Name" value={data.customerName} isDark={isDark} />

                <DetailItem icon={<FiClock />} title="Billing Period" value={data.billingPeriod} isDark={isDark} />

                <DetailItem icon={<FiCreditCard />} title="Amount" value={`₹${data.amount}`} isDark={isDark} />

                <DetailItem icon={<FiCalendar />} title="Paid At" value={paidAt} isDark={isDark} />

                <DetailItem icon={<FiCalendar />} title="Expiry Date" value={expiryDate} isDark={isDark} />

                <DetailItem icon={<FiCalendar />} title="Next Billing Date" value={nextBilling} isDark={isDark} />

                <DetailItem icon={<FiAlertTriangle />} title="Countdown" value={countdown} isDark={isDark} />
            </div>
        </div>
    );
}

/* Reusable Detail Item */
function DetailItem({ icon, title, value, isDark }) {
    return (
        <div
            className={`p-4 rounded-xl flex items-center gap-4 shadow ${isDark ? "bg-gray-700" : "bg-gray-50"
                }`}
        >
            <div className="text-2xl text-green-500">{icon}</div>
            <div>
                <p className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}>
                    {title}
                </p>
                <p className="text-lg font-semibold">{value}</p>
            </div>
        </div>
    );
}

/* History Detail Line */
function HistDetail({ label, value }) {
    return (
        <p>
            <b>{label}:</b> {value}
        </p>
    );
}
