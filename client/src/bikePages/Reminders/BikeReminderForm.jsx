import React, { useState, useEffect } from "react";
import { FiSend, FiX } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function BikeReminderForm({ refresh, close }) {
  const { isDark } = useTheme();
  const token = localStorage.getItem("token");

  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bikes");
        return res.json();
      })
      .then((data) => {
        setClients(Array.isArray(data) ? data : data.data || []);
        setLoadingClients(false);
      })
      .catch((err) => {
        console.error("Fetch bikes error:", err);
        alert("Failed to load clients");
        setLoadingClients(false);
      });
  }, [token]);

  // Submit form
  const submitForm = async (e) => {
    e.preventDefault();

    if (!form.bikeClientId || !form.message || !form.remindDate) {
      alert("Bike, message and date are required");
      return;
    }

    setSubmitting(true);

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create reminder");
      }

      if (data.success) {
        refresh();
        close();
      } else {
        throw new Error(data.message || "Failed to create reminder");
      }
    } catch (err) {
      console.error("CREATE ERROR:", err);
      alert(err.message || "Failed to create reminder");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submitForm}
      className={`p-6 rounded-2xl shadow-xl border-2 transition-all duration-300 mb-8 ${
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
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
                {c.ownerName || c.fullName} - {c.bikeModel} ({c.regNumber})
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
            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none ${
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
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
            disabled={submitting}
            className={`flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FiSend size={18} /> 
            {submitting ? "Saving..." : "Save Reminder"}
          </button>
          
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
            } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}