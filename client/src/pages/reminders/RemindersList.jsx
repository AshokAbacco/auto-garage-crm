// RemindersList.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "../../components/SearchBar.jsx";
import {
  FiBell,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiInbox,
  FiFilter,
} from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import StatsDashboard from "./components/StatsDashboard.jsx"; // Ensure this is simplified too
import ReminderForm from "./components/ReminderForm.jsx";
import ReminderCard from "./components/ReminderCard.jsx";

export default function RemindersList() {
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const { isDark } = useTheme();

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

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const [remRes, clientRes] = await Promise.all([
        axios.get(`${API_URL}/api/reminders`, getAuthConfig()),
        axios.get(`${API_URL}/api/clients`, getAuthConfig()),
      ]);
      setReminders(remRes.data.data || remRes.data);
      setClients(clientRes.data.data || clientRes.data);
    } catch (error) {
      console.error("❌ Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const nameById = useMemo(
    () => Object.fromEntries(clients.map((c) => [String(c.id), c.fullName])),
    [clients],
  );

  const filtered = useMemo(() => {
    let results = reminders.filter((r) =>
      [nameById[String(r.clientId)] || "", r.note || "", r.serviceDate].some(
        (v) => String(v).toLowerCase().includes(q.toLowerCase()),
      ),
    );
    if (filterStatus !== "all") {
      results = results.filter(
        (r) => getReminderStatus(r.serviceDate).status === filterStatus,
      );
    }
    return results;
  }, [q, reminders, nameById, filterStatus]);

  function getReminderStatus(date) {
    if (!date) return { status: "unknown", label: "No Date" };
    const today = new Date();
    const serviceDate = new Date(date);
    const diffDays = Math.ceil((serviceDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { status: "overdue", label: "Overdue" };
    if (diffDays === 0) return { status: "today", label: "Today" };
    return { status: "upcoming", label: `${diffDays} days` };
  }

  const stats = useMemo(
    () => ({
      total: reminders.length,
      overdue: reminders.filter(
        (r) => getReminderStatus(r.serviceDate).status === "overdue",
      ).length,
      today: reminders.filter(
        (r) => getReminderStatus(r.serviceDate).status === "today",
      ).length,
      upcoming: reminders.filter(
        (r) => getReminderStatus(r.serviceDate).status === "upcoming",
      ).length,
    }),
    [reminders],
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4 animate-pulse">
        <div
          className={`w-12 h-12 border-4 rounded-full border-t-transparent ${isDark ? "border-blue-400" : "border-blue-600"}`}
        ></div>
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>
          Syncing Reminders...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="lg:ml-[4rem] mx-auto px-4 py-8 md:px-8">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-semibold tracking-tight">
              Reminders
            </h1>
            <p
              className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Manage your service alerts and client communications.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95 ${
              showForm
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showForm ? <FiX size={18} /> : <FiPlus size={18} />}
            {showForm ? "Close Form" : "New Reminder"}
          </button>
        </header>

        {/* STATS STRIP */}
        <div className="mb-8">
          <StatsDashboard stats={stats} />
        </div>

        {/* UTILITY BAR */}
        <div
          className={`flex flex-col md:flex-row items-center gap-3 p-2 rounded-xl border mb-6 ${
            isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="relative w-full md:flex-1">
            <SearchBar
              value={q}
              onChange={setQ}
              placeholder="Filter by name or note..."
              className="border-none bg-transparent"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}
            >
              <FiFilter className="text-gray-400" size={14} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>
        </div>

        {/* FEEDBACK */}
        {successMessage && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 animate-in fade-in slide-in-from-top-4">
            <FiCheckCircle size={20} />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {/* FORM DRAWER */}
        {showForm && (
          <div className="mb-8 animate-in zoom-in-95 duration-200">
            <ReminderForm
              clients={clients}
              onSubmit={async (data) => {
                await handleSubmit(data);
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* LIST CONTAINER */}
        <div
          className={`rounded-xl overflow-hidden border ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-40">
              <FiInbox size={48} className="mb-4" />
              <p className="text-lg">No reminders found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {filtered.map((reminder, i) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  client={clients.find((c) => c.id === reminder.clientId)}
                  onDelete={fetchReminders}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
