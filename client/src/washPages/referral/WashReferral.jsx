import React, { useEffect, useState, useMemo } from "react";
import {
    Copy,
    CheckCircle,
    Users,
    Trophy,
    Wallet,
    ArrowUpRight,
    Share2,
    Calendar
} from "lucide-react";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext"; // Imported Theme Context

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Reference = () => {
    const { isDark } = useTheme(); // Access Theme State
    const [referralCode, setReferralCode] = useState("");
    const [referrals, setReferrals] = useState([]);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/api/referral/my-referrals`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReferralCode(res.data.referralCode);
            setReferrals(res.data.referrals || []);
        } catch (err) {
            console.error("Referral fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        if (!referralCode) return;
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Calculate Stats on the fly
    const stats = useMemo(() => {
        const totalEarned = referrals.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        return {
            count: referrals.length,
            earnings: totalEarned
        };
    }, [referrals]);

    return (
        <div className={`ml-[4rem] min-h-screen p-6 transition-colors duration-300 ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="mx-auto space-y-8 max-w-7xl animate-fade-in-up">

                {/* Header Section */}
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-6xl font-extrabold">Referral Program</h1>
                        <p className={`mt-4 ml-1 text-md font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            Invite friends and earn rewards when they subscribe.
                        </p>
                    </div>
                </div>

                {/* Top Grid: Code & Stats */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* 1. The Hero Card (Referral Code) */}
                    <div className="relative p-8 overflow-hidden text-white border border-transparent shadow-xl lg:col-span-2 rounded-3xl bg-gradient-to-r from-blue-600 to-blue-600 dark:border-blue-700">
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 -mt-16 -mr-16 bg-white rounded-full opacity-10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 -mb-16 -ml-16 bg-white rounded-full opacity-10 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-3 py-1 text-sm text-blue-100 border rounded-full bg-white/10 w-fit backdrop-blur-md border-white/20">
                                    <Share2 size={14} />
                                    <span>Your Unique Code</span>
                                </div>
                                <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                                    {loading ? "..." : referralCode}
                                </h2>
                                <p className="max-w-md text-indigo-100">
                                    Share this code with your network. You earn rewards for every successful signup!
                                </p>
                            </div>

                            <button
                                onClick={copyCode}
                                className="relative flex items-center gap-3 px-6 py-4 font-bold text-blue-600 transition-all shadow-lg bg-blue group rounded-xl hover:bg-blue-100 active:scale-95"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5 transition-transform group-hover:scale-110" />
                                        <span>Copy Code</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 2. Stats Column */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
                        {/* Stat Card 1: Users */}
                        <div className={`p-6 rounded-3xl shadow-sm border flex items-center gap-5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                            <div className={`p-4 rounded-2xl ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                                <Users size={28} />
                            </div>
                            <div>
                                <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Referred</p>
                                <h3 className="text-3xl font-bold">{stats.count}</h3>
                            </div>
                        </div>

                        {/* Stat Card 2: Earnings */}
                        <div className={`p-6 rounded-3xl shadow-sm border flex items-center gap-5 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                            <div className={`p-4 rounded-2xl ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                                <Wallet size={28} className="text-blue-600 stroke-[2.5]" />

                            </div>
                            <div>
                                <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Earnings</p>
                                <h3 className="text-3xl font-bold">₹{stats.earnings.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referrals Table Section */}
                <div className={`rounded-3xl shadow-sm border overflow-hidden ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                    <div className={`p-6 border-b flex justify-between items-center ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                        <h3 className="flex items-center gap-2 text-xl font-bold">
                            <Trophy className="text-yellow-500" size={20} />
                            Referral History
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`text-xs uppercase tracking-wider ${isDark ? "bg-gray-700/50 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                                    <th className="p-5 font-semibold">User</th>
                                    <th className="p-5 font-semibold">Plan Details</th>
                                    <th className="p-5 font-semibold">Reward</th>
                                    <th className="p-5 font-semibold">Status</th>
                                    <th className="p-5 font-semibold">Joined Date</th>
                                    <th className="p-5 font-semibold">Payment Date</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-100"}`}>
                                {referrals.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className={`p-4 rounded-full mb-4 ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                                                    <Users className={`w-8 h-8 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                                                </div>
                                                <p className={`${isDark ? "text-gray-300" : "text-gray-500"} font-medium`}>No referrals yet.</p>
                                                <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Share your code to get started!</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    referrals.map((user, idx) => (
                                        <tr key={idx} className={`transition-colors group ${isDark ? "hover:bg-gray-700/30" : "hover:bg-gray-50"}`}>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar Initials */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isDark ? "bg-indigo-900 text-indigo-300" : "bg-indigo-100 text-indigo-600"}`}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{user.name}</p>
                                                        <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${isDark ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                                    {user.plan} • {user.billing}
                                                </span>
                                            </td>
                                            <td className="p-5">
                                                <div className={`flex items-center gap-1 font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                                                    <span>₹{user.amount}</span>
                                                    <ArrowUpRight size={14} />
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {user.paidAt ? (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800"}`}>
                                                        ● Paid
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? "bg-yellow-900/30 text-yellow-400" : "bg-yellow-100 text-yellow-800"}`}>
                                                        ● Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`p-5 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                {new Date(user.joiningDate).toLocaleDateString()}
                                            </td>
                                            <td className={`p-5 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                <div className="flex items-center gap-2">
                                                    {user.paidAt ? (
                                                        <>
                                                            <Calendar size={14} />
                                                            {new Date(user.paidAt).toLocaleDateString()}
                                                        </>
                                                    ) : (
                                                        <span className="opacity-50">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reference;