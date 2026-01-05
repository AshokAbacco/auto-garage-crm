import React, { useState } from "react";
import { FiTrash2, FiCalendar, FiClock, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

export default function BikeReminderCard({ reminder, index, refresh }) {
  const { isDark } = useTheme();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    message: reminder.message || "",
    remindDate: reminder.remindDate ? new Date(reminder.remindDate).toISOString().split('T')[0] : "",
    remindTime: reminder.remindTime || "",
    isDone: reminder.isDone || false
  });

  const getAuth = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    };
  };

  const deleteReminder = async () => {
    if (!confirm("Delete this reminder?")) return;

    try {
      const response = await fetch(
        `${API_URL}/api/bike-reminders/${reminder.id}`,
        {
          method: "DELETE",
          ...getAuth()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete reminder");
      }

      if (data.success) {
        refresh();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete reminder");
    }
  };

  const updateReminder = async () => {
    try {
      const payload = {
        message: editForm.message.trim(),
        remindDate: editForm.remindDate,
        remindTime: editForm.remindTime || null,
        isDone: editForm.isDone
      };

      const response = await fetch(
        `${API_URL}/api/bike-reminders/${reminder.id}`,
        {
          method: "PUT",
          ...getAuth(),
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update reminder");
      }

      if (data.success) {
        setIsEditing(false);
        refresh();
      }
    } catch (error) {
      console.error("Update error:", error);
      alert(error.message || "Failed to update reminder");
    }
  };

  const toggleDone = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/bike-reminders/${reminder.id}`,
        {
          method: "PUT",
          ...getAuth(),
          body: JSON.stringify({ isDone: !reminder.isDone })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      if (data.success) {
        refresh();
      }
    } catch (error) {
      console.error("Toggle error:", error);
      alert(error.message || "Failed to update status");
    }
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
        reminder.isDone
          ? isDark 
            ? "bg-gray-800/50 border-gray-700/50 opacity-75" 
            : "bg-gray-50 border-gray-200 opacity-75"
          : isDark 
            ? "bg-gray-800 border-gray-700 hover:border-blue-600/50" 
            : "bg-white border-gray-100 hover:border-blue-600/30"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {isEditing ? (
        // Edit Mode
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              Message
            </label>
            <textarea
              value={editForm.message}
              onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                Date
              </label>
              <input
                type="date"
                value={editForm.remindDate}
                onChange={(e) => setEditForm({ ...editForm, remindDate: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                Time
              </label>
              <input
                type="time"
                value={editForm.remindTime}
                onChange={(e) => setEditForm({ ...editForm, remindTime: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={updateReminder}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FiCheck size={18} /> Save
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditForm({
                  message: reminder.message || "",
                  remindDate: reminder.remindDate ? new Date(reminder.remindDate).toISOString().split('T')[0] : "",
                  remindTime: reminder.remindTime || "",
                  isDone: reminder.isDone || false
                });
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FiX size={18} />
            </button>
          </div>
        </div>
      ) : (
        // View Mode
        <div className="flex items-start gap-4">
          {/* Avatar/Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300 ${
            reminder.isDone 
              ? "bg-gradient-to-br from-green-500 to-green-600" 
              : "bg-gradient-to-br from-blue-500 to-blue-600"
          }`}>
            {reminder.bike?.ownerName?.charAt(0)?.toUpperCase() || "?"}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Client + Bike */}
            <h3 className={`text-lg font-bold mb-1 ${
              reminder.isDone ? "line-through" : ""
            } ${isDark ? "text-white" : "text-gray-900"}`}>
              {reminder.bike
                ? `${reminder.bike.ownerName}`
                : "Unknown Client"}
            </h3>
            
            <p className={`text-sm mb-3 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              {reminder.bike?.bikeModel || "Unknown Bike"} {reminder.bike?.regNumber ? `• ${reminder.bike.regNumber}` : ""}
            </p>

            {/* Message */}
            <div className={`flex items-start gap-2 mb-3 p-3 rounded-lg ${
              isDark ? "bg-gray-700/50" : "bg-gray-50"
            }`}>
              <span className="text-yellow-500 mt-0.5">📌</span>
              <p className={`text-sm italic ${
                reminder.isDone ? "line-through" : ""
              } ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {reminder.message || "No message"}
              </p>
            </div>

            {/* Date & Time */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isDark 
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" 
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
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

              {reminder.isDone && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400">
                  <FiCheck size={16} />
                  <span className="font-medium">Completed</span>
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={toggleDone}
              className={`p-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                reminder.isDone
                  ? isDark
                    ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                    : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                  : isDark
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
              }`}
              title={reminder.isDone ? "Mark as pending" : "Mark as done"}
            >
              <FiCheck size={18} />
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className={`p-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDark
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
              title="Edit reminder"
            >
              <FiEdit2 size={18} />
            </button>

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
      )}
    </motion.div>
  );
}