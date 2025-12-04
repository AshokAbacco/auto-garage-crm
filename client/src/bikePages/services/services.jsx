import React from "react";
import {
  Wrench,
  Settings,
  Gauge,
  BatteryCharging,
  LucideSearch,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const Services = () => {
  const { isDark } = useTheme();

  const services = [
    {
      name: "General Service",
      description: "Full body checkup, oil change, filter cleaning, tuning",
      price: "₹1,200",
      icon: Settings,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Engine Repair",
      description: "Complete engine inspection & part replacements",
      price: "₹4,500",
      icon: Wrench,
      color: "from-red-500 to-red-600",
    },
    {
      name: "Brake Service",
      description: "Disc/pad change, brake fluid replacement, tuning",
      price: "₹850",
      icon: Gauge,
      color: "from-green-500 to-green-600",
    },
    {
      name: "Electrical Work",
      description: "Battery, wiring, indicators, headlight repairs",
      price: "₹600",
      icon: BatteryCharging,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Deep Cleaning",
      description: "Foam wash, polish, chain lube, metal shining",
      price: "₹450",
      icon: CheckCircle,
      color: "from-orange-500 to-red-500",
    },
  ];

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
            Services
          </h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Manage all bike services & pricing
          </p>
        </div>

        {/* Add Service Button */}
        <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
          <PlusCircle className="w-5 h-5" />
          Add New Service
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg w-full max-w-md ${
            isDark
              ? "bg-gray-800 border border-gray-700"
              : "bg-white border border-gray-200"
          }`}
        >
          <LucideSearch className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            className={`w-full outline-none bg-transparent ${
              isDark ? "text-white" : "text-gray-700"
            }`}
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={index}
              className={`rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-md mb-4`}
              >
                <Icon className="w-7 h-7" />
              </div>

              <h2
                className={`text-xl font-semibold mb-1 ${
                  isDark ? "text-white" : "text-gray-800"
                }`}
              >
                {service.name}
              </h2>

              <p
                className={`text-sm mb-3 ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {service.description}
              </p>

              <p
                className={`font-bold text-lg ${
                  isDark ? "text-orange-400" : "text-orange-700"
                }`}
              >
                {service.price}
              </p>

              <button
                className={`w-full mt-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isDark
                    ? "bg-gray-700 text-white hover:bg-gray-600"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                }`}
              >
                Edit Service
              </button>
            </div>
          );
        })}
      </div>

      {/* Animations */}
      <style jsx>{`
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
          animation-fill-mode: both;
        }
        .animate-fade-in {
          animation: fade-in 0.7s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Services;
