import React, { useEffect, useState } from "react";
import { FiBell, FiPlus, FiX, FiAlertCircle, FiCalendar, FiTrendingUp } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

import BikeReminderForm from "./BikeReminderForm";
import BikeReminderCard from "./BikeReminderCard";

export default function BikeReminders() {
  const { isDark } = useTheme();
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const getAuth = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  };

  const fetchBikeReminders = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/bike-reminders`,
        getAuth()
      );

      if (!res.ok) {
        throw new Error("Failed to fetch reminders");
      }

      const data = await res.json();
      
      if (data.success) {
        setReminders(data.data || []);
      } else {
        console.error("API returned success: false");
        setReminders([]);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikeReminders();
  }, []);

  // Calculate statistics
  const getStatistics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const stats = {
      total: reminders.length,
      today: 0,
      tomorrow: 0,
      upcoming: 0
    };

    reminders.forEach(reminder => {
      const reminderDate = new Date(reminder.remindDate);
      reminderDate.setHours(0, 0, 0, 0);

      if (reminderDate.getTime() === today.getTime()) {
        stats.today++;
      } else if (reminderDate.getTime() === tomorrow.getTime()) {
        stats.tomorrow++;
      } else if (reminderDate.getTime() >= dayAfterTomorrow.getTime()) {
        stats.upcoming++;
      }
    });

    return stats;
  };

  const stats = getStatistics();

  // Filter reminders based on search and status
  const filteredReminders = reminders.filter(reminder => {
    const matchesSearch = searchQuery === "" || 
      reminder.bike?.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.bike?.bikeModel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reminder.message?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "All Status") return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const reminderDate = new Date(reminder.remindDate);
    reminderDate.setHours(0, 0, 0, 0);

    if (statusFilter === "Today" && reminderDate.getTime() === today.getTime()) return true;
    if (statusFilter === "Tomorrow" && reminderDate.getTime() === tomorrow.getTime()) return true;
    if (statusFilter === "Upcoming" && reminderDate.getTime() >= dayAfterTomorrow.getTime()) return true;

    return false;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-gray-500 text-lg">
        Loading...
      </div>
    );

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Reminders & Notifications
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Stay on top of service schedules and renewals
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-down">
        {/* Total Reminders */}
        <div className={`p-6 rounded-2xl shadow-md hover:shadow-xl border-2 transition-all duration-300 ${
          isDark 
            ? "bg-gray-800 border-gray-700 hover:border-blue-500/50" 
            : "bg-white border-gray-100 hover:border-blue-500/30"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase mb-2 tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Total Reminders
              </p>
              <h3 className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>{stats.total}</h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiBell size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Today */}
        <div className={`p-6 rounded-2xl shadow-md hover:shadow-xl border-2 transition-all duration-300 ${
          isDark 
            ? "bg-gray-800 border-gray-700 hover:border-blue-600/50" 
            : "bg-white border-gray-100 hover:border-blue-600/30"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase mb-2 tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Due Today
              </p>
              <h3 className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>{stats.today}</h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiAlertCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Tomorrow */}
        <div className={`p-6 rounded-2xl shadow-md hover:shadow-xl border-2 transition-all duration-300 ${
          isDark 
            ? "bg-gray-800 border-gray-700 hover:border-blue-600/50" 
            : "bg-white border-gray-100 hover:border-blue-600/30"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase mb-2 tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Tomorrow
              </p>
              <h3 className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>{stats.tomorrow}</h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiCalendar size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className={`p-6 rounded-2xl shadow-md hover:shadow-xl border-2 transition-all duration-300 ${
          isDark 
            ? "bg-gray-800 border-gray-700 hover:border-green-500/50" 
            : "bg-white border-gray-100 hover:border-blue-500/30"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase mb-2 tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}>
                Upcoming
              </p>
              <h3 className={`text-4xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}>{stats.upcoming}</h3>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiTrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-8 animate-slide-down">
        {/* Search Input */}
        <div className="flex-1 relative w-full">
          <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-4 pl-12 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm"
            }`}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDark
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-900 shadow-sm"
          }`}
        >
          <option value="All Status">All Status</option>
          <option value="Today">Today</option>
          <option value="Tomorrow">Tomorrow</option>
          <option value="Upcoming">Upcoming</option>
        </select>

        {/* Add Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="group flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-medium whitespace-nowrap"
        >
          {showForm ? (
            <>
              <FiX size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Cancel
            </>
          ) : (
            <>
              <FiPlus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Add Reminder
            </>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <BikeReminderForm
          refresh={fetchBikeReminders}
          close={() => setShowForm(false)}
        />
      )}

      {/* List */}
      <div className="space-y-4 animate-fade-in">
        {filteredReminders.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed ${
            isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-white"
          }`}>
            <FiBell size={64} className={isDark ? "text-gray-600" : "text-gray-400"} />
            <p className={`mt-4 text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {searchQuery || statusFilter !== "All Status" 
                ? "No reminders match your filters" 
                : "No bike reminders found"}
            </p>
            <p className={`mt-2 text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              {!showForm && (searchQuery || statusFilter !== "All Status" 
                ? "Try adjusting your search or filters"
                : "Click 'Add Reminder' to create your first reminder")}
            </p>
          </div>
        ) : (
          filteredReminders.map((item, i) => (
            <BikeReminderCard
              key={item.id}
              reminder={item}
              refresh={fetchBikeReminders}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
}