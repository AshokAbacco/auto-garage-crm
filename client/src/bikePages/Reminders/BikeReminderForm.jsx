import React, { useState, useEffect } from "react";
import { FiSend, FiX } from "react-icons/fi";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function BikeReminderForm({ refresh, close }) {
  const { isDark } = useTheme();
  const token = localStorage.getItem("token");

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [form, setForm] = useState({
    bikeClientId: "",
    message: "",
    remindDate: "",
    remindTime: "",
  });

  // Fetch bikes
  useEffect(() => {
    fetch(`${API}/api/bikes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setClients(data.data || []);
        setLoadingClients(false);
      })
      .catch(() => {
        alert("Failed to load clients");
        setLoadingClients(false);
      });
  }, []);

  // Submit form
  const submitForm = async (e) => {
    e.preventDefault();

    if (!form.bikeClientId || !form.message || !form.remindDate) {
      alert("Bike, message and date are required");
      return;
    }

    try {
      const payload = {
        bikeClientId: Number(form.bikeClientId),
        message: form.message.trim(),
        remindDate: form.remindDate,
        remindTime: form.remindTime || null,
      };

      const res = await fetch(`${API}/api/bike-reminders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create reminder");
      }

      refresh();
      close();
    } catch (err) {
      console.error("CREATE ERROR:", err);
      alert(err.message || "Failed to create reminder");
    }
  };

  return (
    <form
      onSubmit={submitForm}
      className={`p-6 rounded-2xl shadow-xl border-2 transition-all duration-300 ${
        isDark 
          ? "bg-gray-800 border-gray-700" 
          : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          Add Bike Reminder
        </h2>
        <button
          type="button"
          onClick={close}
          className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
            isDark 
              ? "hover:bg-gray-700 text-gray-400 hover:text-white" 
              : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"
          }`}
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="space-y-5">
        {/* Client Select */}
        <div>
          <label className={`block font-semibold mb-2 text-sm ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}>
            Bike Client <span className="text-red-500">*</span>
          </label>
          <select
            value={form.bikeClientId}
            onChange={(e) =>
              setForm({ ...form, bikeClientId: e.target.value })
            }
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-50 border-gray-200 text-gray-900 shadow-sm"
            }`}
            required
            disabled={loadingClients}
          >
            <option value="">
              {loadingClients ? "Loading clients..." : "Choose a client..."}
            </option>

            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ownerName} - {c.bikeModel} - {c.regNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className={`block font-semibold mb-2 text-sm ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}>
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 shadow-sm"
            }`}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Enter reminder message..."
          />
        </div>

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className={`block font-semibold mb-2 text-sm ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              Reminder Date <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="date"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900 shadow-sm"
              }`}
              value={form.remindDate}
              onChange={(e) =>
                setForm({ ...form, remindDate: e.target.value })
              }
            />
          </div>

          {/* Time */}
          <div>
            <label className={`block font-semibold mb-2 text-sm ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              Reminder Time <span className={`text-xs font-normal ${
                isDark ? "text-gray-500" : "text-gray-500"
              }`}>(Optional)</span>
            </label>
            <input
              type="time"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-200 text-gray-900 shadow-sm"
              }`}
              value={form.remindTime}
              onChange={(e) =>
                setForm({ ...form, remindTime: e.target.value })
              }
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FiSend size={18} /> 
            Save Reminder
          </button>
          
          <button
            type="button"
            onClick={close}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}