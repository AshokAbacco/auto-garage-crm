import React from "react";
import { Users, Phone, MapPin, Wrench, PlusCircle } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const Clients = () => {
  const { isDark } = useTheme();

  const clients = [
    {
      name: "Rajesh Kumar",
      phone: "9876543210",
      bike: "Royal Enfield Classic 350",
      address: "Bangalore, MG Road",
      service: "Engine Repair",
    },
    {
      name: "Priya Sharma",
      phone: "9876501234",
      bike: "Honda Activa 6G",
      address: "Indiranagar, BLR",
      service: "Brake Service",
    },
    {
      name: "Amit Patel",
      phone: "9001234500",
      bike: "Yamaha FZ-S",
      address: "Koramangala 5th Block",
      service: "Suspension Repair",
    },
    {
      name: "Sneha Reddy",
      phone: "9988776655",
      bike: "TVS Jupiter",
      address: "JP Nagar, BLR",
      service: "General Service",
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
      <div className="animate-fade-in mb-8">
        <h1 className="text-4xl py-5 font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Clients List
        </h1>
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Manage all customer details & service history
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end mb-6">
        <button className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
          <PlusCircle className="w-5 h-5" />
          Add New Client
        </button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client, index) => (
          <div
            key={index}
            className={`rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-white"
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p
                  className={`text-xl font-semibold ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {client.name}
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {client.bike}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p
                className={`flex items-center gap-2 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Phone className="w-4 h-4 text-orange-600" />
                {client.phone}
              </p>

              <p
                className={`flex items-center gap-2 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <MapPin className="w-4 h-4 text-orange-600" />
                {client.address}
              </p>

              <p
                className={`flex items-center gap-2 text-sm font-medium ${
                  isDark ? "text-orange-400" : "text-orange-700"
                }`}
              >
                <Wrench className="w-4 h-4" />
                {client.service}
              </p>
            </div>
          </div>
        ))}
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

export default Clients;
