import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Calendar,
  User,
  Bell,
  Trash2,
  MessageSquare,
  Plus,
  Search,
  FileText,
  PhoneOutgoing,
  Car,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const isUnicode = (t) => /[^\u0000-\u007F]/.test(t);
const segments = (t) => {
  if (!t) return 0;
  const max = isUnicode(t) ? 70 : 160;
  return Math.ceil(t.length / max);
};

export default function SMSalert() {
  const { isDark } = useTheme();

  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [washingClientId, setWashingClientId] = useState("");
  const [nextWashDate, setNextWashDate] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const totalSegments = useMemo(() => segments(message), [message]);

  const token = localStorage.getItem("token");

  /* =========================
     LOAD REMINDERS
  ========================= */
  const loadReminders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/washing-reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setReminders(data.data);
      }
    } catch (err) {
      console.error("Failed to load reminders", err);
    }
  };

  /* =========================
     LOAD WASHING CLIENTS
  ========================= */
  const loadClients = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/washing-clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Failed to load clients", err);
    }
  };

  useEffect(() => {
    loadReminders();
    loadClients();
  }, []);

  /* =========================
     CREATE REMINDER
  ========================= */
  const createReminder = async () => {
    if (!washingClientId || !nextWashDate) {
      alert("Please select a client and date");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/washing-reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          washingClientId,
          nextWashDate,
          note,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWashingClientId("");
        setNextWashDate("");
        setNote("");
        loadReminders();
        alert("Reminder created successfully!");
      } else {
        alert("Failed to create reminder");
      }
    } catch (err) {
      alert("Error creating reminder");
    }
  };

  /* =========================
     DELETE REMINDER
  ========================= */
  const deleteReminder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reminder?"))
      return;

    try {
      await fetch(`${API_BASE}/api/washing-reminders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      loadReminders();
    } catch (err) {
      alert("Failed to delete reminder");
    }
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-slate-50"
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl shadow-lg ${
                isDark ? "bg-emerald-900" : "bg-emerald-100"
              }`}
            >
              <Bell
                className={`w-6 h-6 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
              />
            </div>
            <div>
              <h1
                className={`text-2xl md:text-3xl font-bold ${
                  isDark ? "text-white" : "text-slate-800"
                }`}
              >
                Washing Reminders
              </h1>
              <p
                className={`text-sm md:text-base ${
                  isDark ? "text-gray-400" : "text-slate-500"
                }`}
              >
                Manage upcoming service reminders & SMS drafts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Form & Tools */}
          <div className="lg:col-span-4 space-y-6">
            {/* CREATE REMINDER CARD */}
            <div
              className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 border-gray-700 shadow-gray-900/50"
                  : "bg-white border-slate-200 shadow-lg"
              }`}
            >
              <h2
                className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                  isDark ? "text-white" : "text-slate-800"
                }`}
              >
                <Plus className="w-5 h-5 text-emerald-500" />
                New Reminder
              </h2>

              <div className="space-y-4">
                {/* Client Select */}
                <div className="space-y-1.5">
                  <label
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    Client
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <select
                      value={washingClientId}
                      onChange={(e) => setWashingClientId(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <option value="">Select Client</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Date Picker */}
                <div className="space-y-1.5">
                  <label
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    Next Wash Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={nextWashDate}
                      onChange={(e) => setNextWashDate(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-emerald-500/50 ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    />
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <label
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      isDark ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    Note (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      placeholder="Add specific details..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-emerald-500/50 resize-none ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    />
                  </div>
                </div>

                <button
                  onClick={createReminder}
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Create Reminder
                </button>
              </div>
            </div>

            {/* SMS PREVIEW CARD */}
            <div
              className={`p-6 rounded-2xl shadow-sm border transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 border-gray-700 shadow-gray-900/50"
                  : "bg-white border-slate-200 shadow-lg"
              }`}
            >
              <h2
                className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                  isDark ? "text-white" : "text-slate-800"
                }`}
              >
                <MessageSquare className="w-5 h-5 text-blue-500" />
                SMS Composer
              </h2>

              <div className="space-y-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your message here..."
                  className={`w-full p-4 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-blue-500/50 resize-none text-sm ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-gray-200"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                />

                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-1 rounded-md font-medium ${
                      isUnicode(message)
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {isUnicode(message) ? "Unicode" : "GSM"}
                  </span>

                  <span
                    className={`font-mono font-medium ${
                      isDark ? "text-gray-400" : "text-slate-500"
                    }`}
                  >
                    {message.length} / {totalSegments} Segments
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: List */}
          <div className="lg:col-span-8">
            <div
              className={`p-6 rounded-2xl shadow-sm border h-full min-h-[500px] transition-all duration-300 ${
                isDark
                  ? "bg-gray-800 border-gray-700 shadow-gray-900/50"
                  : "bg-white border-slate-200 shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold flex items-center gap-2 ${
                    isDark ? "text-white" : "text-slate-800"
                  }`}
                >
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  Upcoming Schedule
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {reminders.length} Active
                </span>
              </div>

              <div className="space-y-3">
                {reminders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                      className={`p-4 rounded-full mb-4 ${
                        isDark ? "bg-gray-700" : "bg-slate-100"
                      }`}
                    >
                      <Bell
                        className={`w-8 h-8 ${
                          isDark ? "text-gray-500" : "text-slate-400"
                        }`}
                      />
                    </div>
                    <h3
                      className={`text-lg font-medium ${
                        isDark ? "text-gray-300" : "text-slate-600"
                      }`}
                    >
                      No Reminders Found
                    </h3>
                    <p
                      className={`text-sm max-w-xs mx-auto ${
                        isDark ? "text-gray-500" : "text-slate-400"
                      }`}
                    >
                      Create a new reminder to track upcoming wash services for
                      your clients.
                    </p>
                  </div>
                ) : (
                  reminders.map((r) => (
                    <div
                      key={r.id}
                      className={`group p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:scale-[1.01] flex items-center justify-between gap-4 ${
                        isDark
                          ? "bg-gray-750 border-gray-700 hover:border-gray-600"
                          : "bg-white border-slate-100 hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar / Icon */}
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                            isDark
                              ? "bg-gray-700 text-emerald-400"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {r.washingClient?.fullName?.charAt(0) || "?"}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-semibold text-base truncate ${
                              isDark ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {r.washingClient?.fullName}
                          </h4>
                          <div className="flex align-ceter gap-6 mt-2">
                            <p
                              className={`font-semibold text-sm truncate flex gap-2 align-center ${
                                isDark ? "text-white" : "text-slate-800"
                              }`}
                            >
                              <Car height={25} />
                              {r.washingClient?.regNumber}
                            </p>
                            <p
                              className={`font-semibold text-sm truncate flex gap-2 ${
                                isDark ? "text-white" : "text-slate-800"
                              }`}
                            >
                              <PhoneOutgoing height={18} />
                              {r.washingClient?.phone}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm">
                            <span
                              className={`flex items-center gap-1 ${
                                isDark ? "text-gray-400" : "text-slate-500"
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(r.nextWashDate).toLocaleDateString()}
                            </span>

                            {r.note && (
                              <span
                                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
                                  isDark
                                    ? "bg-gray-700 text-gray-300"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <FileText className="w-3 h-3" />
                                {r.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <button
                        onClick={() => deleteReminder(r.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
