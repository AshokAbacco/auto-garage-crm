import React from "react";
import { FiTrash2, FiCalendar, FiClock, FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

export default function BikeReminderCard({ reminder, index, refresh }) {
  const { isDark } = useTheme();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const getAuth = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  };

  const deleteReminder = async () => {
    if (!confirm("Delete this reminder?")) return;

    await axios.delete(
      `${API_URL}/api/bike-reminders/${reminder.id}`,
      getAuth()
    );

    refresh();
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const reminderDate = new Date(date);
    reminderDate.setHours(0, 0, 0, 0);
    
    const diffTime = reminderDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group p-6 rounded-2xl shadow-md hover:shadow-2xl border-2 transition-all duration-300 animate-slide-up ${
        isDark 
          ? "bg-gray-800 border-gray-700 hover:border-orange-500/50" 
          : "bg-white border-gray-100 hover:border-orange-500/30"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar/Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
          {reminder.bike?.ownerName?.charAt(0)?.toUpperCase() || "?"}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Client + Bike */}
          <h3 className={`text-lg font-bold mb-1 ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            {reminder.bike
              ? `${reminder.bike.ownerName}`
              : "Unknown Client"}
          </h3>
          
          <p className={`text-sm mb-3 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}>
            {reminder.bike?.bikeModel || "Unknown Bike"}
          </p>

          {/* Message */}
          <div className={`flex items-start gap-2 mb-3 p-3 rounded-lg ${
            isDark ? "bg-gray-700/50" : "bg-gray-50"
          }`}>
            <span className="text-yellow-500 mt-0.5">📝</span>
            <p className={`text-sm italic ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              {reminder.message || "No message"}
            </p>
          </div>

          {/* Date & Time */}
          <div className="flex flex-wrap gap-3 text-sm">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              isDark 
                ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" 
                : "bg-orange-50 text-orange-600 hover:bg-orange-100"
            }`}>
              <FiCalendar size={16} />
              <span className="font-medium">
                {formatDate(reminder.remindDate)}
              </span>
            </span>

            {reminder.remindTime && (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isDark 
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" 
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}>
                <FiClock size={16} />
                <span className="font-medium">
                  {reminder.remindTime}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={deleteReminder}
            className={`p-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
            title="Delete reminder"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}