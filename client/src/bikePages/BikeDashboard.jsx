import React, { useEffect, useMemo, useState } from "react";
import {
  Wrench,
  Clock,
  CheckCircle,
  IndianRupee,
  TrendingUp,
  Users,
  Settings,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function BikeDashboard() {
  const { isDark } = useTheme();

  const [services, setServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  };

  // ===============================
  // FETCH BACKEND DATA
  // ===============================
  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/bike-services`, authHeaders).then((r) => r.json()),
      fetch(`${API}/api/bike-invoices`, authHeaders).then((r) => r.json()),
      fetch(`${API}/api/bike-reminders`, authHeaders).then((r) => r.json()),
    ])
      .then(([servicesRes, invoiceRes, reminderRes]) => {
        setServices(servicesRes.services || servicesRes || []);
        setInvoices(invoiceRes || []);
        setReminders(reminderRes.data || reminderRes || []);
      })
      .catch((err) => console.error("Dashboard Load Error:", err))
      .finally(() => setLoading(false));
  }, []);

  // ===============================
  // DASHBOARD STATS
  // ===============================
// Total Repairs: all services (Pending + Paid)
const totalRepairs = services.length;

// In Service: only pending services
const inService = services.filter((s) => s.status === "Pending").length;

// Completed: count of PAID invoices (same as billing page paidInvoices)
const completed = invoices.filter((inv) => inv.status === "Paid").length;

// Total Revenue: sum of PAID invoices (same as billing page totalRevenue)
const revenue = useMemo(() => {
  return invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + Number(inv.grandTotal || 0), 0)
    .toFixed(2);
}, [invoices]);

  // ===============================
  // ACTIVE REPAIRS
  // ===============================
  const activeRepairs = services.filter((s) => s.status === "Pending");

  // ===============================
  // SERVICE CATEGORY SUMMARY
  // ===============================
  const serviceCategories = useMemo(() => {
    const map = {};
    services.forEach((s) => {
      const name = s.category?.name || "Other";
      if (!map[name]) map[name] = { name, count: 0, revenue: 0 };
      map[name].count += 1;
      map[name].revenue += Number(s.cost || 0);
    });
    return Object.values(map);
  }, [services]);

  // ===============================
  // TODAY REMINDERS
  // ===============================
  const todayDate = new Date().toISOString().split("T")[0];
  const todayReminders = reminders.filter(
    (r) => r.remindDate?.split("T")[0] === todayDate
  );

  // ===============================
  // PRIORITY COLOR
  // ===============================
  const getPriorityColor = (priority) => {
    if (isDark) {
      if (priority === "high") return "bg-red-900/30 text-red-400";
      if (priority === "medium") return "bg-yellow-900/30 text-yellow-400";
      return "bg-green-900/30 text-green-400";
    } else {
      if (priority === "high") return "bg-red-100 text-red-700";
      if (priority === "medium") return "bg-yellow-100 text-yellow-700";
      return "bg-green-100 text-green-700";
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400 text-lg">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gray-900"
          : "bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100"
      } p-6`}
    >
      {/* ================= HEADER ================= */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl py-5 font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Bike Garage Dashboard
            </h1>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
              Manage repairs, service & maintenance
            </p>
          </div>

          <div className="flex gap-2">
            {["today", "week", "month"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedPeriod === period
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105"
                    : isDark
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Wrench} label="Total Repairs" value={totalRepairs} color="from-blue-500 to-blue-600" isDark={isDark} />
        <StatCard icon={Clock} label="In Service" value={inService} color="from-orange-500 to-orange-600" isDark={isDark} />
        <StatCard icon={CheckCircle} label="Completed" value={completed} color="from-green-500 to-green-600" isDark={isDark} />
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${revenue}`} color="from-purple-500 to-purple-600" isDark={isDark} />
      </div>

      {/* ================= ACTIVE REPAIRS + REMINDERS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Active Repairs */}
        <div className={`lg:col-span-2 ${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Active Repairs</h2>
            <span className={`px-3 py-1 ${isDark ? "bg-orange-900/30 text-orange-400" : "bg-orange-100 text-orange-700"} rounded-full text-sm font-semibold`}>
              {activeRepairs.length} in progress
            </span>
          </div>

          <div className="space-y-4">
            {activeRepairs.map((repair, index) => (
              <div key={index} className={`p-4 rounded-xl ${isDark ? "bg-gray-700/50 border border-gray-600" : "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{repair.client?.ownerName}</p>
                      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{repair.client?.regNumber}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor("medium")}`}>
                    Pending
                  </span>
                </div>

                <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  <Settings className="w-4 h-4 inline mr-1" />
                  {repair.subService?.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Reminders */}
        <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg p-6`}>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-6`}>
            Today's Reminders
          </h2>

          <div className="space-y-3">
            {todayReminders.length === 0 ? (
              <p className="text-gray-400 text-sm">No reminders for today</p>
            ) : (
              todayReminders.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg ${isDark ? "bg-gray-700/50 border border-gray-600" : "bg-gradient-to-r from-slate-50 to-orange-50 border border-slate-200"}`}>
                  <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{r.bike?.ownerName}</p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>{r.message}</p>
                  <p className="text-xs text-orange-600 font-medium">{r.remindTime}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= INSIGHTS + SERVICE CATEGORIES ================= */}
      <div className="grid grid-cols-1   gap-6 mt-8">
        {/* Service Category Progress */}
        <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg p-6`}>
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"} mb-6`}>Service Categories</h2>

          <div className="space-y-5">
            {serviceCategories.map((service, index) => {
              const percent = Math.min(service.count * 8, 100);

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>{service.name}</p>
                    <span className="text-sm font-medium text-green-600">₹{service.revenue}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-2 text-gray-500">
                    <span>{service.count} repairs</span>
                    <span>{percent}% capacity</span>
                  </div>

                  <div className={`w-full h-2 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden`}>
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

/* ===============================
   STAT CARD COMPONENT
=============================== */
function StatCard({ icon: Icon, label, value, color, isDark }) {
  return (
    <div className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-green-500 text-sm font-semibold flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
        </span>
      </div>

      <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm mb-1`}>{label}</p>
      <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>{value}</p>
    </div>
  );
}
