// client/src/washPages/WashDashboard.jsx
import React, { useState } from "react";
import {
  Droplets,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Star,
  Calendar,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const WashDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const { isDark, toggleTheme } = useTheme();

  const stats = [
    {
      icon: Droplets,
      label: "Total Washes",
      value: "186",
      change: "+15%",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: Clock,
      label: "In Progress",
      value: "12",
      change: "+5%",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: "174",
      change: "+18%",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Users,
      label: "New Customers",
      value: "89",
      change: "+32%",
      color: "from-purple-500 to-pink-600",
    },
  ];

  const activeWashes = [
    {
      id: "#WH3847",
      customer: "Vikram Singh",
      vehicle: "Honda City",
      type: "Premium Wash",
      time: "15 mins",
      progress: 65,
    },
    {
      id: "#WH3846",
      customer: "Ananya Iyer",
      vehicle: "Hyundai i20",
      type: "Basic Wash",
      time: "8 mins",
      progress: 85,
    },
    {
      id: "#WH3845",
      customer: "Rohit Verma",
      vehicle: "Toyota Innova",
      type: "Deep Clean",
      time: "25 mins",
      progress: 45,
    },
    {
      id: "#WH3844",
      customer: "Kavita Das",
      vehicle: "Maruti Swift",
      type: "Quick Wash",
      time: "5 mins",
      progress: 92,
    },
  ];

  const services = [
    {
      name: "Premium Wash",
      bookings: 58,
      revenue: "₹17,400",
      rating: 4.8,
      color: "from-blue-400 to-blue-600",
    },
    {
      name: "Basic Wash",
      bookings: 72,
      revenue: "₹10,800",
      rating: 4.6,
      color: "from-green-400 to-green-600",
    },
    {
      name: "Deep Clean",
      bookings: 34,
      revenue: "₹20,400",
      rating: 4.9,
      color: "from-purple-400 to-purple-600",
    },
    {
      name: "Quick Wash",
      bookings: 22,
      revenue: "₹4,400",
      rating: 4.5,
      color: "from-orange-400 to-orange-600",
    },
  ];

  const upcomingBookings = [
    {
      time: "11:00 AM",
      customer: "Arjun Mehta",
      vehicle: "BMW 3 Series",
      type: "Premium",
    },
    {
      time: "11:30 AM",
      customer: "Sanjana Roy",
      vehicle: "Audi A4",
      type: "Deep Clean",
    },
    {
      time: "12:00 PM",
      customer: "Karthik Rao",
      vehicle: "Honda Civic",
      type: "Basic",
    },
    {
      time: "12:30 PM",
      customer: "Neha Gupta",
      vehicle: "Hyundai Creta",
      type: "Premium",
    },
  ];

  return (
    <div
      className={`min-h-screen pl-[7%] p-6 bg-gradient-to-br ${isDark
        ? "from-slate-900 via-slate-900 to-slate-950 text-white"
        : "from-slate-50 via-cyan-50 to-blue-50 text-slate-900"
        }`}
    >
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
              Washing Dashboard
            </h1>
            <p className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              Manage your washing operations efficiently
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}


            {["today", "week", "month"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${selectedPeriod === period
                  ? isDark
                    ? "bg-gradient-to-r from-slate-700 to-slate-500 text-white shadow-lg scale-105"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105"
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
            <p className={`mb-1 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
              {stat.label}
            </p>
            <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
        {/* Active Washes */}
        <div className={`p-6 transition-all duration-300 lg:col-span-2 rounded-2xl hover:shadow-xl ${isDark
          ? "bg-slate-800 shadow-gray-900/50"
          : "bg-white shadow-lg"
          }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
              Active Washes
            </h2>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${isDark
              ? "bg-green-900/40 text-green-300"
              : "bg-green-100 text-green-700"
              }`}>
              {activeWashes.length} in progress
            </span>
          </div>
          <div className="space-y-4">
            {activeWashes.map((wash, index) => (
              <div
                key={index}
                className={`p-4 transition-all duration-300 border rounded-xl ${isDark
                  ? "bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600"
                  : "bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 hover:from-cyan-100 hover:to-blue-100"
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
                      {wash.customer.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                        {wash.customer}
                      </p>
                      <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                        {wash.vehicle}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                      {wash.id}
                    </p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {wash.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className={`flex items-center justify-between mb-1 text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      <span>Progress</span>
                      <span className="font-semibold">{wash.progress}%</span>
                    </div>
                    <div className={`w-full h-2 overflow-hidden rounded-full ${isDark ? "bg-slate-700" : "bg-gray-200"
                      }`}>
                      <div
                        className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{ width: `${wash.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${isDark ? "text-cyan-300" : "text-cyan-600"
                    }`}>
                    <Clock className="w-4 h-4" />
                    {wash.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className={`p-6 transition-all duration-300 rounded-2xl hover:shadow-xl ${isDark
          ? "bg-slate-800 shadow-gray-900/50"
          : "bg-white shadow-lg"
          }`}>
          <h2 className={`mb-6 text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            Upcoming
          </h2>
          <div className="space-y-3">
            {upcomingBookings.map((booking, index) => (
              <div
                key={index}
                className={`p-3 transition-all duration-300 border rounded-lg ${isDark
                  ? "bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600"
                  : "bg-gradient-to-r from-slate-50 to-cyan-50 border-slate-200 hover:border-cyan-300"
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-cyan-600" />
                  <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    {booking.time}
                  </span>
                </div>
                <p className={`text-sm font-medium ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                  {booking.customer}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    {booking.vehicle}
                  </p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDark
                    ? "bg-cyan-900/40 text-cyan-200"
                    : "bg-cyan-100 text-cyan-700"
                    }`}>
                    {booking.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Service list */}
        <div className={`p-6 transition-all duration-300 lg:col-span-2 rounded-2xl hover:shadow-xl ${isDark
          ? "bg-slate-800 shadow-gray-900/50"
          : "bg-white shadow-lg"
          }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
              Service Performance
            </h2>
            <span className={`flex items-center gap-1 text-sm ${isDark ? "text-amber-400" : "text-amber-500"
              }`}>
              <AlertCircle className="w-4 h-4" />
              {selectedPeriod === "today"
                ? "Live view of today's performance"
                : `Showing ${selectedPeriod}ly performance`}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {services.map((service, index) => (
              <div
                key={index}
                className={`p-4 transition-all duration-300 border rounded-xl hover:shadow-lg hover:-translate-y-1 ${isDark
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
                  : "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200"
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                      {service.name}
                    </p>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
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
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Revenue
                    </p>
                    <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                      {service.revenue}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{service.rating}</span>
                  </div>
                </div>

                <div className={`w-full h-1.5 overflow-hidden rounded-full ${isDark ? "bg-slate-700" : "bg-gray-200"
                  }`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{ width: `${(service.bookings / 80) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary card */}
        <div className={`p-6 transition-all duration-300 rounded-2xl hover:shadow-xl ${isDark
          ? "bg-slate-800 shadow-gray-900/50"
          : "bg-white shadow-lg"
          }`}>
          <h2 className={`mb-4 text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
            Today's Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Total Revenue
                </p>
                <p className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                  ₹52,000
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isDark
                ? "bg-green-900/40 text-green-300"
                : "bg-green-100 text-green-600"
                }`}>
                +24% vs yesterday
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Avg. Rating
                </p>
                <p className={`flex items-center gap-1 text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  4.7
                </p>
              </div>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                128 reviews today
              </p>
            </div>

            <div>
              <p className={`mb-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Capacity Utilization
              </p>
              <div className={`w-full h-2 overflow-hidden rounded-full ${isDark ? "bg-slate-700" : "bg-gray-200"
                }`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: "78%" }}
                />
              </div>
              <p className={`mt-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                78% of washing slots booked
              </p>
            </div>
          </div>
        </div>
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