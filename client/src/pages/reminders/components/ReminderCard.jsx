// client/src/pages/reminders/components/ReminderCard.jsx
import React from "react";
import { FiBell, FiUser, FiCalendar, FiTrash2, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { useTheme } from "../../../contexts/ThemeContext";
import axios from "axios";

export default function ReminderCard({ reminder, client, onDelete, index, refreshReminders }) {
    const { isDark } = useTheme();
    const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

    const handleMarkDone = async () => {
        try {
            await axios.put(`${API_URL}/api/reminders/${reminder.id}`, { sent: true });
            refreshReminders && refreshReminders();
        } catch (err) {
            console.error("Error marking done:", err);
            alert("Failed to mark reminder as done.");
        }
    };

    const reminderDate = reminder.remindAt
        ? new Date(reminder.remindAt).toLocaleDateString()
        : "No Date";

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-2xl p-6 border shadow-md flex flex-col sm:flex-row justify-between items-center ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
        >
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
                    <FiUser size={22} />
                </div>

                <div>
                    <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-800"}`}>
                        {client?.fullName || `Client #${reminder.clientId}`}
                    </h3>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {client?.vehicleMake} {client?.vehicleModel}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0 text-sm">
                <div className="flex items-center gap-2 mb-2">
                    <FiCalendar className="text-orange-500" />
                    <span className="font-semibold">{reminderDate}</span>
                </div>
                <div className="italic text-gray-600 dark:text-gray-400">
                    🗒️ {reminder.message}
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleMarkDone}
                        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                        title="Mark as done"
                    >
                        <FiCheckCircle size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(reminder.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        title="Delete"
                    >
                        <FiTrash2 size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
