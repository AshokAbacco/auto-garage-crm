// RemindersList.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "../../components/SearchBar.jsx";
import { FiBell, FiPlus, FiX, FiCheckCircle } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import StatsDashboard from "./components/StatsDashboard.jsx";
import ReminderForm from "./components/ReminderForm.jsx";
import ReminderCard from "./components/ReminderCard.jsx";

export default function RemindersList() {
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(""); // ✅ success feedback
  const { isDark } = useTheme();

  // Backend API base URL
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  // 🔐 Helper: Build config with Authorization token
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
  };

  // 🔁 Fetch reminders & clients
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
      console.error("❌ Failed to fetch data:", error);
      if (error.response?.status === 401) {
        alert("⚠️ Unauthorized or session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // 🧠 Handle create reminder
  const handleSubmit = async (data) => {
    try {
      const payload = {
        clientId: Number(data.clientId),
        nextService: data.nextService,
        insuranceRenewal: data.insuranceRenewal || null,
        warrantyExpiry: data.warrantyExpiry || null,
        notify: data.notify || "SMS",
      };

      await axios.post(`${API_URL}/api/reminders`, payload, getAuthConfig());

      // ✅ Success message
      setSuccessMessage("✅ Reminder created successfully!");
      setShowForm(false);

      // ✅ Refresh reminder list instantly
      await fetchReminders();

      // ✅ Auto-hide message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error creating reminder:", error);
      if (error.response?.status === 401) {
        alert("⚠️ Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert("Failed to create reminder. Please try again.");
      }
    }
  };

  // 🗑️ Delete reminder
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;
    try {
      await axios.delete(`${API_URL}/api/reminders/${id}`, getAuthConfig());
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("❌ Error deleting reminder:", error);
      alert("Failed to delete reminder.");
    }
  };

  // 🔍 Filter & Search Logic
  const nameById = useMemo(
    () => Object.fromEntries(clients.map((c) => [String(c.id), c.fullName])),
    [clients]
  );

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    let results = reminders.filter((r) =>
      [nameById[String(r.clientId)] || "", r.nextService, r.insuranceRenewal, r.warrantyExpiry, r.notify]
        .some((v) => String(v).toLowerCase().includes(term))
    );

    if (filterStatus !== "all") {
      results = results.filter((r) => getReminderStatus(r.nextService).status === filterStatus);
    }

    return results;
  }, [q, reminders, nameById, filterStatus]);

  // 📊 Stats summary
  const stats = useMemo(() => {
    const total = reminders.length;
    const overdue = reminders.filter((r) => getReminderStatus(r.nextService).status === "overdue").length;
    const today = reminders.filter((r) => getReminderStatus(r.nextService).status === "today").length;
    const upcoming = reminders.filter((r) => {
      const status = getReminderStatus(r.nextService).status;
      return status === "soon" || status === "upcoming";
    }).length;
    return { total, overdue, today, upcoming };
  }, [reminders]);

  // 📅 Helper: Get reminder status
  function getReminderStatus(date) {
    if (!date) return { status: "unknown", color: "gray", label: "No Date" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reminderDate = new Date(date);
    reminderDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { status: "overdue", color: "red", label: "Overdue" };
    if (diffDays === 0) return { status: "today", color: "orange", label: "Today" };
    if (diffDays <= 7) return { status: "soon", color: "yellow", label: `${diffDays} days` };
    if (diffDays <= 30) return { status: "upcoming", color: "blue", label: `${diffDays} days` };
    return { status: "scheduled", color: "green", label: `${diffDays} days` };
  }

  // ⏳ Loading
  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-lg text-gray-500">
        Loading reminders...
      </div>
    );

  return (
    <div className="space-y-6 lg:ml-16">
      {/* Header */}
      <div
        className={`relative overflow-hidden ${isDark
          ? "bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800"
          : "bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700"
          } rounded-3xl p-8 shadow-2xl`}
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <FiBell className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-1">
              Reminders & Notifications
            </h1>
            <p className="text-white/90 text-lg">
              Stay on top of service schedules and renewals
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Success Message */}
      {successMessage && (
        <div
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-md text-white ${isDark ? "bg-green-700/80" : "bg-green-500"
            }`}
        >
          <FiCheckCircle />
          {successMessage}
        </div>
      )}

      {/* Stats */}
      <StatsDashboard stats={stats} />

      {/* Filters + Actions */}
      <div
        className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } rounded-2xl p-6 shadow-xl border`}
      >
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="w-full lg:flex-1">
            <SearchBar value={q} onChange={setQ} placeholder="Search reminders..." />
          </div>

          <div className="w-full lg:w-64">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl font-medium border-2 ${isDark
                ? "bg-gray-700 text-white border-gray-600"
                : "bg-white border-gray-300 text-gray-900"
                }`}
            >
              <option value="all">All Status</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="soon">Due Soon</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full lg:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl px-8 py-3 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transition-all"
          >
            {showForm ? <FiX /> : <FiPlus />}
            {showForm ? "Cancel" : "Add Reminder"}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <ReminderForm
          clients={clients}
          onSubmit={handleSubmit}
          refreshReminders={fetchReminders}
        />
      )}

      {/* List */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16">No reminders found</div>
        ) : (
          filtered.map((reminder, i) => (
            <ReminderCard
              key={reminder.id || i}
              reminder={reminder}
              client={clients.find((c) => c.id === reminder.clientId)}
              onDelete={handleDelete}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
}
