import React, { useState, useEffect } from "react";
import { FiUser, FiBell, FiShield, FiAward, FiSend } from "react-icons/fi";
import { useTheme } from "../../../contexts/ThemeContext";
import axios from "axios";

export default function ReminderForm({ clients = [], onSubmit, refreshReminders }) {
    const { isDark } = useTheme();
    const [form, setForm] = useState({
        clientId: "", // ✅ correct field name
        nextService: "",
        insuranceRenewal: "",
        warrantyExpiry: "",
        notify: "SMS",
    });

    const [loading, setLoading] = useState(false);
    const [localClients, setLocalClients] = useState(clients);
    const [message, setMessage] = useState("");

    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

    // ✅ Helper for Authorization header
    const getAuthConfig = () => {
        const token = localStorage.getItem("token");
        return {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
            },
        };
    };

    // 🧩 Fetch clients if not provided by parent
    useEffect(() => {
        const fetchClients = async () => {
            if (clients.length === 0) {
                try {
                    const res = await axios.get(`${API_URL}/api/clients`, getAuthConfig());
                    setLocalClients(res.data.data || res.data);
                } catch (error) {
                    console.error("❌ Failed to load clients:", error);
                    if (error.response?.status === 401) {
                        alert("⚠️ Session expired. Please log in again.");
                        localStorage.removeItem("token");
                        window.location.href = "/login";
                    }
                }
            }
        };
        fetchClients();
    }, [clients]);

    // 🧠 Handle submit
    // 🧠 Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.clientId || !form.nextService) {
            alert("Please fill in required fields.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");
            
            const payload = {
                clientId: Number(form.clientId),
                nextService: form.nextService,
                insuranceRenewal: form.insuranceRenewal || null,
                warrantyExpiry: form.warrantyExpiry || null,
                notify: form.notify || "SMS",
                message: form.message, // ✅ added
            };


            const res = await axios.post(`${API_URL}/api/reminders`, payload, getAuthConfig());

            // ✅ Show success message immediately
            setMessage("✅ Reminder created successfully!");

            // ✅ Reset form fields
            setForm({
                clientId: "",
                nextService: "",
                insuranceRenewal: "",
                warrantyExpiry: "",
                message: "", // 👈 added
                notify: "SMS",
            });

            // ✅ Refresh reminders in parent list instantly
            if (refreshReminders) refreshReminders();

            // ✅ Keep message visible for a moment before clearing
            setTimeout(() => setMessage(""), 2500);

        } catch (error) {
            console.error("❌ Error creating reminder:", error);
            if (error.response?.status === 401) {
                alert("⚠️ Session expired. Please log in again.");
                localStorage.removeItem("token");
                window.location.href = "/login";
            } else {
                setMessage("❌ Failed to create reminder. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <form
            onSubmit={handleSubmit}
            className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                } rounded-3xl shadow-xl border overflow-hidden`}
        >
            {/* Header */}
            <div
                className={`p-6 border-b ${isDark
                    ? "border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700"
                    : "border-gray-200 bg-gradient-to-r from-orange-600 to-red-600"
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <FiBell className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Create New Reminder</h2>
                        <p className="text-sm text-white/80">Set up service and renewal reminders</p>
                    </div>
                </div>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Client Select */}
                    <div>
                        <label
                            className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                            <FiUser size={16} /> Client <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.clientId}
                            onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl font-medium border-2 transition-all ${isDark
                                ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                                : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                                }`}
                            required
                        >
                            <option value="">Select client</option>
                            {localClients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.fullName} (#{c.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Next Service */}
                    <div>
                        <label
                            className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                            <FiBell size={16} /> Next Service Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={form.nextService}
                            onChange={(e) => setForm({ ...form, nextService: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${isDark
                                ? "bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                                : "bg-white border-gray-300 text-gray-900 focus:border-orange-500"
                                }`}
                            required
                        />
                    </div>

                    {/* Insurance Renewal */}
                    <div>
                        <label
                            className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                            <FiShield size={16} /> Insurance Renewal
                        </label>
                        <input
                            type="date"
                            value={form.insuranceRenewal}
                            onChange={(e) => setForm({ ...form, insuranceRenewal: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${isDark
                                ? "bg-gray-700 border-gray-600 text-white focus:border-purple-500"
                                : "bg-white border-gray-300 text-gray-900 focus:border-purple-500"
                                }`}
                        />
                    </div>

                    {/* Warranty Expiry */}
                    <div>
                        <label
                            className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                            <FiAward size={16} /> Warranty Expiry
                        </label>
                        <input
                            type="date"
                            value={form.warrantyExpiry}
                            onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${isDark
                                ? "bg-gray-700 border-gray-600 text-white focus:border-green-500"
                                : "bg-white border-gray-300 text-gray-900 focus:border-green-500"
                                }`}
                        />
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label
                        className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                    >
                        Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={form.message || ""}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Enter reminder message..."
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${isDark
                            ? "bg-gray-700 border-gray-600 text-white focus:border-orange-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-orange-500"
                            }`}
                        required
                    />
                </div>


                {/* Notification Type */}
                <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Notification Channel
                    </label>
                    <select
                        value={form.notify}
                        onChange={(e) => setForm({ ...form, notify: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl font-medium border-2 transition-all ${isDark
                            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                            : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                            }`}
                    >
                        <option value="SMS">SMS</option>
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="All">All Channels</option>
                    </select>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all shadow-xl ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                            }`}
                    >
                        <FiSend size={18} />
                        {loading ? "Creating..." : "Create Reminder"}
                    </button>
                </div>

                {/* Feedback */}
                {message && (
                    <p
                        className={`text-center mt-3 font-medium ${message.startsWith("✅") ? "text-green-500" : "text-red-500"
                            }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </form>
    );
}
