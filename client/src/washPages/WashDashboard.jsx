// client/src/washPages/WashDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Droplets,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Star,
  Calendar,
  AlertCircle,
  RefreshCw,
  Wrench
} from "lucide-react";

import { useTheme } from "../contexts/ThemeContext";





const StatItem = ({ icon, label, value, rowBg, danger }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl ${rowBg}`}>
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg shadow">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </div>

    <span
      className={`font-bold ${danger ? "text-red-600" : "text-gray-900"
        }`}
    >
      {value}
    </span>
  </div>
);


const API = import.meta.env.VITE_API_BASE_URL;
const QuickStats = ({ clients, services, billings, isDark }) => {
  const now = new Date();

  const servicesThisMonth = services.filter(s => {
    if (!s.date) return false;
    const d = new Date(s.date);
    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const pendingReminders = services.filter(
    s => s.status === "PENDING"
  ).length;

  const overdueBills = billings.some(
    b => b.status !== "PAID"
  );

  const cardBg = isDark ? "bg-slate-800" : "bg-white";
  const rowBg = isDark ? "bg-slate-700/40" : "bg-gray-50";
  const muted = isDark ? "text-gray-300" : "text-gray-500";

  return (
    <div className={`p-6 rounded-2xl shadow-lg ${cardBg}`}>
      <h3 className="text-lg font-bold">Quick Stats</h3>
      <p className={`text-sm mb-5 ${muted}`}>
        Key metrics at a glance
      </p>

      <div className="space-y-4">
        <StatItem
          icon={<Users className="text-blue-500" />}
          label="Active Clients"
          value={clients.length}
          rowBg={rowBg}
        />
        <StatItem
          icon={<Wrench className="text-blue-500" />}
          label="Services This Month"
          value={servicesThisMonth}
          rowBg={rowBg}
        />

        <StatItem
          icon={<AlertCircle className="text-blue-500" />}
          label="Overdue Bills"
          value={overdueBills ? "Yes" : "No"}
          rowBg={rowBg}
          danger={overdueBills}
        />
      </div>
    </div>
  );
};


const WashDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const { isDark } = useTheme();

  // State for data
  const [services, setServices] = useState([]);
  const [billings, setBillings] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);


  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [servicesRes, billingsRes, clientsRes] = await Promise.all([
          fetch(`${API}/api/washing-services`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/wash-billing`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API}/api/washing-clients`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const servicesData = await servicesRes.json();
        const billingsData = await billingsRes.json();
        const clientsData = await clientsRes.json();

        setServices(Array.isArray(servicesData) ? servicesData : []);
        setBillings(Array.isArray(billingsData) ? billingsData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data by period
  const filterByPeriod = (data, dateField = "createdAt") => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return data.filter((item) => {
      const itemDate = new Date(item[dateField]);
      if (selectedPeriod === "today") return itemDate >= today;
      if (selectedPeriod === "week") return itemDate >= weekAgo;
      if (selectedPeriod === "month") return itemDate >= monthAgo;
      return true;
    });
  };

  // Calculate stats
  const filteredServices = filterByPeriod(services, "date");
  const filteredBillings = filterByPeriod(billings, "createdAt");

  const totalWashes = filteredServices.length;
  const inProgressServices = filteredServices.filter(
    (s) => s.status === "PENDING" || s.status === "IN_PROGRESS"
  ).length;
  const completedServices = filteredServices.filter(
    (s) => s.status === "COMPLETED"
  ).length;
  const totalClients = clients.length;

  // Calculate total revenue from billings
  const totalRevenue = filteredBillings
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + Number(b.grandTotal || 0), 0);

  // Get active washes (in progress services with details)
  const activeWashes = services
    .filter((s) => s.status === "PENDING" || s.status === "IN_PROGRESS")
    .slice(0, 4)
    .map((service) => {
      const cost = Number(service.partsCost || 0);
      const gst = Number(service.partsGst || 0);
      const total = cost + (cost * gst) / 100;

      // Calculate progress based on status
      const progress =
        service.status === "IN_PROGRESS"
          ? 50
          : service.status === "PENDING"
            ? 25
            : 100;

      // Calculate estimated time remaining
      const createdDate = new Date(service.date);
      const now = new Date();
      const minutesPassed = Math.floor((now - createdDate) / (1000 * 60));
      const estimatedTime = Math.max(30 - minutesPassed, 5);

      return {
        id: `#WS${service.id}`,
        customer: service.client?.fullName || "Unknown Customer",
        vehicle: `${service.client?.vehicleMake || ""} ${service.client?.vehicleModel || ""
          }`.trim() || "Vehicle",
        type: service.subService?.name || service.category?.name || "Service",
        time: `${estimatedTime} mins`,
        progress: progress,
      };
    });

  // Service performance by category
  const servicePerformance = services.reduce((acc, service) => {
    const categoryName =
      service.category?.name || service.subService?.name || "Other";
    const cost = Number(service.partsCost || 0);
    const gst = Number(service.partsGst || 0);
    const revenue = cost + (cost * gst) / 100;

    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        bookings: 0,
        revenue: 0,
        rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      };
    }

    acc[categoryName].bookings += 1;
    acc[categoryName].revenue += revenue;

    return acc;
  }, {});

  const topServices = Object.values(servicePerformance)
    .sort((a, b) => b.bookings - b.bookings)
    .slice(0, 4)
    .map((service, index) => ({
      ...service,
      revenue: `₹${service.revenue.toFixed(0)}`,
      color:
        index === 0
          ? "from-blue-400 to-blue-600"
          : index === 1
            ? "from-green-400 to-green-600"
            : index === 2
              ? "from-purple-400 to-purple-600"
              : "from-orange-400 to-orange-600",
    }));

  // Calculate average rating
  const avgRating = topServices.length > 0
    ? (topServices.reduce((sum, s) => sum + s.rating, 0) / topServices.length).toFixed(1)
    : "4.7";

  // Calculate capacity utilization (completed vs total slots)
  const totalSlots = 100; // Assuming 100 slots per period
  const capacityUtilization = Math.min(
    (filteredServices.length / totalSlots) * 100,
    100
  ).toFixed(0);

  const stats = [
    {
      icon: Droplets,
      label: "Total Washes",
      value: totalWashes.toString(),
      change: "+15%",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Clock,
      label: "In Progress",
      value: inProgressServices.toString(),
      change: "+5%",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: completedServices.toString(),
      change: "+18%",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      label: "Total Clients",
      value: totalClients.toString(),
      change: "+32%",
      color: "from-blue-500 to-blue-600",
    },
  ];

  if (loading) {
    return (
      <div
        className={`min-h-screen pl-[7%] p-6 flex items-center justify-center ${isDark ? "bg-slate-900" : "bg-slate-50"
          }`}
      >
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
          <p className={isDark ? "text-gray-300" : "text-gray-600"}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }





  return (

    <div
      className={`min-h-screen pl-[] p-6 bg-gradient-to-br ${isDark
        ? "from-slate-900 via-slate-900 to-slate-950 text-white"
        : "from-slate-50 via-blue-50 to-blue-50 text-slate-900"
        }`}
    >
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text">
              Washing Dashboard
            </h1>
            <p className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Manage your washing operations efficiently
            </p>
          </div>
          <div className="flex items-center gap-2">
            {["today", "week", "month"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${selectedPeriod === period
                  ? isDark
                    ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-lg scale-105"
                    : "bg-gradient-to-r from-blue-500 to-blue-500 text-white shadow-lg scale-105"
                  : isDark
                    ? "bg-slate-800 text-gray-200 hover:bg-slate-700"
                    : "bg-white/90 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 transition-all duration-300 rounded-2xl hover:shadow-xl hover:-translate-y-1 animate-slide-up ${isDark
              ? "bg-slate-800 shadow-gray-900/50"
              : "bg-white shadow-lg"
              }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-green-500">
                <TrendingUp className="w-4 h-4" />
                {stat.change}
              </span>
            </div>
            <p
              className={`mb-1 text-sm ${isDark ? "text-gray-300" : "text-gray-600"
                }`}
            >
              {stat.label}
            </p>
            <p
              className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"
                }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
        {/* Active Washes */}
        <div
          className={`p-6 transition-all duration-300 lg:col-span-2 rounded-2xl hover:shadow-xl ${isDark
            ? "bg-slate-800 shadow-gray-900/50"
            : "bg-white shadow-lg"
            }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"
                }`}
            >
              Active Washes
            </h2>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${isDark
                ? "bg-blue-900/40 text-blue-300"
                : "bg-blue-100 text-blue-700"
                }`}
            >
              {activeWashes.length} in progress
            </span>
          </div>
          <div className="space-y-4">
            {activeWashes.length === 0 ? (
              <div
                className={`p-8 text-center rounded-xl ${isDark ? "bg-slate-900/50" : "bg-gray-50"
                  }`}
              >
                <Clock
                  className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-400"
                    }`}
                />
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  No active washes at the moment
                </p>
              </div>
            ) : (
              activeWashes.map((wash, index) => (
                <div
                  key={index}
                  className={`p-4 transition-all duration-300 border rounded-xl ${isDark
                    ? "bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600"
                    : "bg-gradient-to-r from-blue-50 to-blue-50 border-blue-200 hover:from-blue-100 hover:to-blue-100"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-blue-400 to-blue-500">
                        {wash.customer.charAt(0)}
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${isDark ? "text-white" : "text-gray-800"
                            }`}
                        >
                          {wash.customer}
                        </p>
                        <p
                          className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"
                            }`}
                        >
                          {wash.vehicle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-800"
                          }`}
                      >
                        {wash.id}
                      </p>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        {wash.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div
                        className={`flex items-center justify-between mb-1 text-xs ${isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                      >
                        <span>Progress</span>
                        <span className="font-semibold">{wash.progress}%</span>
                      </div>
                      <div
                        className={`w-full h-2 overflow-hidden rounded-full ${isDark ? "bg-slate-700" : "bg-gray-200"
                          }`}
                      >
                        <div
                          className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-blue-500 to-blue-500"
                          style={{ width: `${wash.progress}%` }}
                        />
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${isDark ? "text-blue-300" : "text-blue-600"
                        }`}
                    >
                      <Clock className="w-4 h-4" />
                      {wash.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div
          className={`p-6 transition-all duration-300 rounded-2xl hover:shadow-xl ${isDark
            ? "bg-slate-800 shadow-gray-900/50"
            : "bg-white shadow-lg"
            }`}
        >
          <h2
            className={`mb-4 text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"
              }`}
          >
            Today's Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  Total Revenue
                </p>
                <p
                  className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"
                    }`}
                >
                  ₹{totalRevenue.toFixed(0)}
                </p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${isDark
                  ? "bg-blue-900/40 text-blue-300"
                  : "bg-blue-100 text-blue-600"
                  }`}
              >
                +24% vs yesterday
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                >
                  Avg. Rating
                </p>
                <p
                  className={`flex items-center gap-1 text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"
                    }`}
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  {avgRating}
                </p>
              </div>
              <p
                className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                Based on {topServices.length} services
              </p>
            </div>

            <div>
              <p
                className={`mb-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                Capacity Utilization
              </p>
              <div
                className={`w-full h-2 overflow-hidden rounded-full ${isDark ? "bg-slate-700" : "bg-gray-200"
                  }`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${capacityUtilization}%` }}
                />
              </div>
              <p
                className={`mt-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                {capacityUtilization}% of washing slots booked
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Performance */}
      {/* Service Performance + Quick Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">

        {/* LEFT: Service Performance */}
        <div
          className={`p-6 transition-all duration-300 lg:col-span-2 rounded-2xl hover:shadow-xl ${isDark
            ? "bg-slate-800 shadow-gray-900/50"
            : "bg-white shadow-lg"
            }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2
              className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"
                }`}
            >
              Service Performance
            </h2>

            <span
              className={`flex items-center gap-1 text-sm ${isDark ? "text-blue-400" : "text-blue-500"
                }`}
            >
              <AlertCircle className="w-4 h-4" />
              {selectedPeriod === "today"
                ? "Live view of today's performance"
                : `Showing ${selectedPeriod}ly performance`}
            </span>
          </div>

          {topServices.length === 0 ? (
            <div
              className={`p-8 text-center rounded-xl ${isDark ? "bg-slate-900/50" : "bg-gray-50"
                }`}
            >
              <Droplets
                className={`w-12 h-12 mx-auto mb-3 ${isDark ? "text-gray-600" : "text-gray-400"
                  }`}
              />
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                No service data available
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {topServices.map((service, index) => (
                <div
                  key={index}
                  className={`p-4 transition-all duration-300 border rounded-xl hover:shadow-lg hover:-translate-y-1 ${isDark
                    ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
                    : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p
                        className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {service.name}
                      </p>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        {service.bookings} bookings
                      </p>
                    </div>

                    <div
                      className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${service.color} text-white`}
                    >
                      Top Service
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p
                        className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                      >
                        Revenue
                      </p>
                      <p
                        className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {service.revenue}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-medium text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{service.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div
                    className={`w-full h-1.5 overflow-hidden rounded-full ${isDark ? "bg-slate-700" : "bg-gray-200"
                      }`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-500"
                      style={{
                        width: `${Math.min(
                          (service.bookings /
                            Math.max(...topServices.map(s => s.bookings))) *
                          100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Quick Stats */}
        <QuickStats
          clients={clients}
          services={services}
          billings={billings}
          isDark={isDark}
        />
      </div>


      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default WashDashboard;