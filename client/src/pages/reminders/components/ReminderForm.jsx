import React, { useState, useEffect } from "react";
import { FiUser, FiCalendar, FiFileText, FiSend, FiInfo } from "react-icons/fi";
import { useTheme } from "../../../contexts/ThemeContext";
import axios from "axios";

export default function ReminderForm({
  clients = [],
  refreshReminders,
  onCancel,
}) {
  const { isDark } = useTheme();

  const [form, setForm] = useState({
    clientId: "",
    serviceDate: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [localClients, setLocalClients] = useState(clients);
  const [message, setMessage] = useState("");

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    const fetchClients = async () => {
      if (clients.length === 0) {
        try {
          const res = await axios.get(
            `${API_URL}/api/clients`,
            getAuthConfig(),
          );
          setLocalClients(res.data.data || res.data);
        } catch (error) {
          console.error("❌ Failed to load clients:", error);
        }
      }
    };
    fetchClients();
  }, [clients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientId || !form.serviceDate) return;

    try {
      setLoading(true);
      setMessage("");

      await axios.post(
        `${API_URL}/api/reminders`,
        {
          clientId: Number(form.clientId),
          serviceDate: form.serviceDate,
          note: form.note,
        },
        getAuthConfig(),
      );

      setMessage("✅ Reminder set successfully.");
      setForm({ clientId: "", serviceDate: "", note: "" });
      refreshReminders && refreshReminders();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("❌ Error saving reminder.");
    } finally {
      setLoading(false);
    }
  };

  // Shared input styles for classic look
  const inputBaseClass = `w-full px-4 py-2.5 rounded-lg border transition-all outline-none text-sm ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
  }`;

  const labelClass = `flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 ${
    isDark ? "text-gray-400" : "text-gray-500"
  }`;

  return (
    <div
      className={`overflow-hidden border rounded-xl shadow-sm ${
        isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      {/* MINIMAL HEADER */}
      <div
        className={`px-6 py-4 border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiCalendar className="text-blue-500" />
          Schedule New Reminder
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CLIENT SELECT */}
          <div className="space-y-1">
            <label className={labelClass}>
              <FiUser size={14} /> Client Selection
            </label>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className={inputBaseClass}
              required
            >
              <option value="">Choose a client...</option>
              {localClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.regNumber}
                </option>
              ))}
            </select>
          </div>

          {/* DATE PICKER */}
          <div className="space-y-1">
            <label className={labelClass}>
              <FiCalendar size={14} /> Service Schedule
            </label>
            <input
              type="datetime-local"
              value={form.serviceDate}
              onChange={(e) =>
                setForm({ ...form, serviceDate: e.target.value })
              }
              className={inputBaseClass}
              required
            />
          </div>

          {/* NOTE - FULL WIDTH */}
          <div className="md:col-span-2 space-y-1">
            <label className={labelClass}>
              <FiFileText size={14} /> Internal Notes
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="E.g. Customer prefers morning appointments..."
              className={`${inputBaseClass} resize-none`}
              rows={2}
            />
          </div>
        </div>

        {/* INFO BOX */}
        <div
          className={`mt-6 flex items-start gap-3 p-3 rounded-lg text-xs ${
            isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700"
          }`}
        >
          <FiInfo size={16} className="shrink-0 mt-0.5" />
          <p>
            The system will automatically dispatch WhatsApp notifications to the
            client at the <strong>15-day</strong> and <strong>7-day</strong>{" "}
            intervals prior to the selected service date.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="mt-8 flex items-center justify-between border-t pt-6 border-transparent">
          <div>
            {message && (
              <span
                className={`text-sm font-medium ${message.includes("✅") ? "text-green-500" : "text-red-500"}`}
              >
                {message}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDark
                  ? "text-gray-400 hover:bg-gray-800"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm ${
                loading ? "opacity-50 cursor-not-allowed" : "active:scale-95"
              }`}
            >
              <FiSend size={16} />
              {loading ? "Processing..." : "Save Reminder"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
