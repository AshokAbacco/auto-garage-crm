import React from "react";
import {
  Bell,
  Calendar,
  Clock,
  Wrench,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const Reminders = () => {
  const { isDark } = useTheme();

  const reminders = [
    {
      title: "Service follow-up",
      description: "Follow up with Rajesh for engine repair status.",
      date: "03 Dec 2025",
      time: "10:00 AM",
      priority: "high",
      icon: Wrench,
    },
    {
      title: "Pickup Reminder",
      description: "Customer Priya will pick up Activa.",
      date: "02 Dec 2025",
      time: "05:00 PM",
      priority: "medium",
      icon: Clock,
    },
    {
      title: "Pending Payment",
      description: "Amit needs to clear invoice #1025.",
      date: "04 Dec 2025",
      time: "12:30 PM",
      priority: "low",
      icon: AlertTriangle,
    },
    {
      title: "Service Booking Call",
      description: "Call Sneha about upcoming deep cleaning service.",
      date: "01 Dec 2025",
      time: "07:00 PM",
      priority: "medium",
      icon: Bell,
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark
          ? "bg-gray-900"
          : "bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100"
      }`}
    >
      {/* Header */}
      <div className="animate-fade-in mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl py-5 font-bold bg-gradient-to-r from-orange-600 to-red-600 text-transparent bg-clip-text">
            Reminders
          </h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Stay on track with follow-ups & important alerts
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
          <PlusCircle className="w-5 h-5" />
          Add Reminder
        </button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Today", count: 3, icon: Clock, color: "from-blue-500 to-blue-600" },
          { label: "Upcoming", count: 4, icon: Calendar, color: "from-green-500 to-green-600" },
          { label: "Urgent", count: 1, icon: AlertTriangle, color: "from-red-500 to-red-600" },
        ].map((box, i) => {
          const Icon = box.icon;
          return (
            <div
              key={i}
              className={`rounded-2xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${box.color} flex items-center justify-center text-white`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {box.count}
                </span>
              </div>
              <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                {box.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Reminder List */}
      <div
        className={`rounded-2xl shadow-lg p-6 ${
          isDark ? "bg-gray-800 border border-gray-700" : "bg-white"
        }`}
      >
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-gray-800"}`}>
          All Reminders
        </h2>

        <div className="space-y-5">
          {reminders.map((rem, index) => {
            const Icon = rem.icon;
            return (
              <div
                key={index}
                className={`p-5 rounded-xl hover:shadow-lg transition-all duration-300 animate-slide-up ${
                  isDark
                    ? "bg-gray-700/50 hover:bg-gray-700 border border-gray-600"
                    : "bg-orange-50 hover:bg-orange-100 border border-orange-200"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {rem.title}
                      </h3>
                      <p className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm`}>
                        {rem.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                      rem.priority
                    )}`}
                  >
                    {rem.priority.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <Calendar className="w-4 h-4" />
                    {rem.date}
                  </div>

                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <Clock className="w-4 h-4" />
                    {rem.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Reminders;
