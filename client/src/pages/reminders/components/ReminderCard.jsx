// client/src/pages/reminders/components/ReminderCard.jsx
import React from "react";
import {
  FiUser,
  FiCalendar,
  FiTrash2,
  FiCheckCircle,
  FiMessageSquare,
  FiClock,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useTheme } from "../../../contexts/ThemeContext";
import axios from "axios";

export default function ReminderCard({
  reminder,
  client,
  onDelete,
  index,
  refreshReminders,
}) {
  const { isDark } = useTheme();
  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

  const handleMarkDone = async () => {
    try {
      await axios.put(`${API_URL}/api/reminders/${reminder.id}`, {
        sent: true,
      });
      refreshReminders && refreshReminders();
    } catch (err) {
      console.error("Error marking done:", err);
    }
  };

  // Uses serviceDate or remindAt depending on your backend field name
  const dateObj = new Date(reminder.serviceDate || reminder.remindAt);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isSent = reminder.sent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group flex flex-col md:flex-row items-start md:items-center justify-between p-5 transition-colors ${
        isDark
          ? "hover:bg-gray-800/40 border-gray-800 text-gray-100"
          : "hover:bg-gray-50 border-gray-100 text-gray-900"
      } ${index !== 0 ? "border-t" : ""}`}
    >
      {/* SECTION 1: CLIENT & VEHICLE */}
      <div className="flex items-start gap-4 w-full md:w-1/4">
        <div
          className={`hidden sm:flex w-10 h-10 rounded-lg items-center justify-center shrink-0 mt-1 ${
            isDark ? "bg-gray-800 text-blue-400" : "bg-blue-50 text-blue-600"
          }`}
        >
          <FiUser size={20} />
        </div>
        <div className="overflow-hidden">
          <h3 className="font-bold text-sm md:text-base truncate">
            {client?.fullName || `Client #${reminder.clientId}`}
          </h3>
          <p
            className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {client?.vehicleMake} {client?.vehicleModel}
          </p>
        </div>
      </div>

      {/* SECTION 2: NOTE (Your 'hlloooooo' message) */}
      <div className="flex-1 w-full md:px-6 mt-3 md:mt-0">
        {/* Changed from reminder.note to reminder.message to match your screenshot */}
        {reminder.message || reminder.note ? (
          <div
            className={`flex items-start gap-2 p-3 rounded-xl border border-dashed text-sm leading-relaxed ${
              isDark
                ? "bg-gray-900/50 border-gray-700 text-gray-300"
                : "bg-gray-50 border-gray-200 text-gray-600"
            }`}
          >
            <FiMessageSquare
              size={16}
              className="mt-0.5 shrink-0 opacity-60 text-blue-500"
            />
            <span className="break-all">
              {reminder.message || reminder.note}
            </span>
          </div>
        ) : (
          <div className="text-xs italic opacity-30 px-3">No note provided</div>
        )}
      </div>

      {/* SECTION 3: DATE & STATUS */}
      <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 w-full md:w-auto">
        {/* DATE DISPLAY */}
        <div className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
          <FiCalendar className="text-blue-500" size={14} />
          {formattedDate}
        </div>

        {/* STATUS & ACTIONS */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isSent
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
            }`}
          >
            {isSent ? "Sent" : "Pending"}
          </div>

          <div className="flex items-center gap-1">
            {!isSent && (
              <button
                onClick={handleMarkDone}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? "hover:bg-green-500/20 text-gray-400 hover:text-green-500"
                    : "hover:bg-green-100 text-green-500 hover:text-green-700"
                }`}
              >
                <FiCheckCircle size={18} />
              </button>
            )}
            <button
              onClick={() => onDelete(reminder.id)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-red-500/20 text-gray-400 hover:text-red-500"
                  : "hover:bg-red-100 text-red-500 hover:text-red-700"
              }`}
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
