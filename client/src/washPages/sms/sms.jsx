import React, { useState, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext"; // Import theme context

// --- Simple demo data ---
const CLIENTS = [
    { id: 1, name: "Ravi", phone: "+919876543210" },
    { id: 2, name: "Neha", phone: "+919812345678" },
];

const TEMPLATES = [
    { id: "t1", name: "Welcome", body: "Hi name, welcome!" },
    { id: "t2", name: "Ready", body: "Hi name, your car is ready." },
];

// --- Helpers ---
const isUnicode = (t) => /[^\u0000-\u007F]/.test(t);
const segments = (t) => {
    if (!t) return 0;
    const max = isUnicode(t) ? 70 : 160;
    return Math.ceil(t.length / max);
};

export default function SMSalert() {
    const { isDark } = useTheme(); // Get theme state
    const [message, setMessage] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [manual, setManual] = useState("");
    const [recipients, setRecipients] = useState([]); // phones only
    const [jobs, setJobs] = useState([]);

    const totalSegments = useMemo(() => segments(message), [message]);

    function applyTemplate(id) {
        const t = TEMPLATES.find((x) => x.id === id);
        if (t) {
            setTemplateId(id);
            setMessage(t.body);
        }
    }

    function addRecipient(phone) {
        if (!phone) return;
        setRecipients((r) => (r.includes(phone) ? r : [...r, phone]));
    }

    function sendSMS() {
        if (!message || recipients.length === 0) {
            alert("Message or recipients missing");
            return;
        }
        setJobs((j) => [
            { id: Date.now(), total: recipients.length, status: "sent" },
            ...j,
        ]);
        setRecipients([]);
        setManual("");
    }

    return (
        <div className={`min-h-screen p-6 space-y-6 transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-slate-50"}`}>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : ""}`}>SMS Alerts</h1>

            {/* Compose */}
            <div className={`p-4 space-y-3 rounded-lg transition-all duration-300 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
                }`}>
                <select
                    value={templateId}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className={`w-full p-2 rounded transition-all duration-300 outline-none ${isDark
                        ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        } border`}
                >
                    <option value="">Select template</option>
                    {TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className={`w-full p-2 rounded transition-all duration-300 outline-none resize-none ${isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        } border`}
                    placeholder="Type SMS message"
                />
                <div className={`text-xs ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                    {isUnicode(message) ? "Unicode" : "GSM"} • Segments: {totalSegments}
                </div>
            </div>

            {/* Recipients */}
            <div className={`p-4 space-y-3 rounded-lg transition-all duration-300 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
                }`}>
                <div className="flex gap-2">
                    <input
                        value={manual}
                        onChange={(e) => setManual(e.target.value)}
                        placeholder="+91XXXXXXXXXX"
                        className={`flex-1 p-2 rounded transition-all duration-300 outline-none ${isDark
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            } border`}
                    />
                    <button
                        onClick={() => addRecipient(manual)}
                        className={`px-4 py-2 text-white rounded transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${isDark
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {CLIENTS.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => addRecipient(c.phone)}
                            className={`px-3 py-1 rounded transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${isDark
                                ? "bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                <div className={`text-sm ${isDark ? "text-gray-400" : "text-slate-600"}`}>
                    Recipients: {recipients.length}
                </div>
            </div>

            {/* Actions */}
            <button
                onClick={sendSMS}
                className={`px-6 py-2 text-white rounded transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${isDark
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-emerald-500 hover:bg-emerald-600"
                    }`}
            >
                Send SMS
            </button>

            {/* Logs */}
            <div className={`p-4 rounded-lg transition-all duration-300 ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white shadow"
                }`}>
                <h2 className={`mb-2 font-semibold ${isDark ? "text-white" : ""}`}>Logs</h2>
                {jobs.length === 0 ? (
                    <div className={`text-xs ${isDark ? "text-gray-400" : "text-slate-400"}`}>No jobs</div>
                ) : (
                    jobs.map((j) => (
                        <div key={j.id} className={`text-sm ${isDark ? "text-gray-300" : ""}`}>
                            Job #{j.id} • {j.total} msgs • {j.status}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}