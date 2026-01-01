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
        <div className={`ml-[4rem] sm:ml-0 min-h-screen p-4 sm:p-1 transition-colors duration-300 ${isDark ? " text-white" : "bg-gray-50 text-gray-900"}`}>
            <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-6xl font-extrabold">Referral Program</h1>
                        <p className={`mt-4 ml-1 text-md font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                            Invite friends and earn rewards when they subscribe.
                        </p>
                    </div>
                </div>

                {/* Top Grid: Code & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 1. The Hero Card (Referral Code) */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 shadow-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-transparent dark:border-gray-700">
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-white opacity-10 blur-3xl"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-indigo-100 bg-white/10 w-fit px-3 py-1 rounded-full text-sm backdrop-blur-md border border-white/20">
                                    <Share2 size={14} />
                                    <span>Your Unique Code</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                                    {loading ? "..." : referralCode}
                                </h2>
                                <p className="text-indigo-100 max-w-md">
                                    Share this code with your network. You earn rewards for every successful signup!
                                </p>
                            </div>

                            <button
                                onClick={copyCode}
                                className="group relative flex items-center gap-3 bg-white text-indigo-600 px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition-all active:scale-95"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span>Copy Code</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 2. Stats Column */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
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
                            <div className={`p-4 rounded-2xl ${isDark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                                <Wallet size={28} />
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
                        <h3 className="text-xl font-bold flex items-center gap-2">
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