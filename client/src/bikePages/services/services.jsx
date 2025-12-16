import React, { useEffect, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  Search, 
  RefreshCw, 
  AlertCircle,
  Calendar,
  IndianRupee,
  Wrench,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Services = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/bike-services`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setServices(data.services || data || []);
    } catch (err) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const paidServices = services.filter(s => s.status === "Paid").length;
  const pendingServices = services.filter(s => s.status === "Pending").length;
  const totalRevenue = services
    .reduce((sum, s) => sum + Number(s.cost || 0), 0)
    .toFixed(2);

  const filteredServices = services.filter((s) =>
    [
      s.subService?.name,
      s.category?.name,
      s.client?.ownerName,
      s.client?.regNumber,
      s.status
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-6 lg:ml-16 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent`}>
              Service Management
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Track and manage all service records
            </p>
          </div>

          <button
            onClick={() => navigate("/bike-services/add")}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-medium"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Add New Service
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-down">
        {/* Total Services */}
        <div className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${
          isDark
            ? "bg-gray-800 border-gray-700 hover:border-blue-500/50"
            : "bg-white border-gray-100 hover:border-blue-500/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              isDark ? "bg-blue-500/20" : "bg-blue-50"
            }`}>
              <Wrench size={24} className="text-blue-500" />
            </div>
            <TrendingUp size={20} className={`${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-blue-500 transition-colors`} />
          </div>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Total Services
          </p>
          <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {services.length}
          </h2>
        </div>

        {/* Pending Services */}
        <div className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${
          isDark
            ? "bg-gray-800 border-gray-700 hover:border-orange-500/50"
            : "bg-white border-gray-100 hover:border-orange-500/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              isDark ? "bg-orange-500/20" : "bg-orange-50"
            }`}>
              <Clock size={24} className="text-orange-500" />
            </div>
            <AlertCircle size={20} className={`${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-orange-500 transition-colors`} />
          </div>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Pending Services
          </p>
          <h2 className="text-3xl font-bold text-orange-500">
            {pendingServices}
          </h2>
        </div>

        {/* Paid Services */}
        <div className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${
          isDark
            ? "bg-gray-800 border-gray-700 hover:border-green-500/50"
            : "bg-white border-gray-100 hover:border-green-500/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              isDark ? "bg-green-500/20" : "bg-green-50"
            }`}>
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <CheckCircle size={20} className={`${isDark ? "text-gray-500" : "text-gray-400"} group-hover:text-green-500 transition-colors`} />
          </div>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Completed Services
          </p>
          <h2 className="text-3xl font-bold text-green-500">
            {paidServices}
          </h2>
        </div>

        {/* Total Revenue */}
        <div className={`group rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-2 ${
          isDark
            ? "bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700/50 hover:border-green-500/50"
            : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 hover:border-green-500/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${
              isDark ? "bg-green-500/30" : "bg-green-100"
            }`}>
              <IndianRupee size={24} className="text-green-600" />
            </div>
            <TrendingUp size={20} className={`${isDark ? "text-green-400" : "text-green-500"} group-hover:scale-110 transition-transform`} />
          </div>
          <p className={`text-sm mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Total Revenue
          </p>
          <h2 className="text-3xl font-bold text-green-600">
            ₹{totalRevenue}
          </h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 animate-slide-down">
        <div className="relative max-w-2xl">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`} size={20} />
          <input
            type="text"
            placeholder="Search by service, client, registration, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm"
            }`}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="animate-spin text-green-500" size={40} />
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading services...
            </p>
          </div>
        </div>
      )}

      {/* Services List */}
      {!loading && (
        <div className="space-y-4 animate-fade-in">
          {filteredServices.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed ${
              isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-white"
            }`}>
              <Wrench size={64} className={isDark ? "text-gray-600" : "text-gray-400"} />
              <p className={`mt-4 text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {searchQuery ? "No services found" : "No services yet"}
              </p>
              <p className={`mt-2 text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                {searchQuery ? "Try adjusting your search" : "Add your first service to get started"}
              </p>
            </div>
          ) : (
            filteredServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                isDark={isDark}
                index={index}
                onClick={() => navigate(`/bike-services/${service.id}`)}
              />
            ))
          )}
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
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
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

function ServiceCard({ service, isDark, index, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer flex flex-col md:flex-row gap-6 items-start md:items-center rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border-2 animate-slide-up ${
        isDark
          ? "bg-gray-800 border-gray-700 hover:border-green-500/50"
          : "bg-white border-gray-100 hover:border-green-500/30"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Service Icon */}
      <div className={`p-4 rounded-xl ${
        isDark ? "bg-green-500/20" : "bg-gradient-to-br from-green-50 to-emerald-50"
      } group-hover:scale-110 transition-transform duration-300`}>
        <Wrench size={32} className="text-green-500" />
      </div>

      {/* Service Info */}
      <div className="flex-1 space-y-2 min-w-0">
        <h2 className={`text-xl font-bold truncate ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          {service.subService?.name || service.category?.name}
        </h2>

        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {service.category?.name}
        </p>

        <div className="flex flex-wrap gap-3 items-center">
          <div className={`flex items-center gap-2 text-sm ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}>
            <span className="truncate">
              {service.client?.ownerName} ({service.client?.regNumber})
            </span>
          </div>

          <div className={`flex items-center gap-1 text-xs ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}>
            <Calendar size={14} />
            {new Date(service.date).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Status and Cost */}
      <div className="flex flex-col items-end gap-3 min-w-fit">
        <span
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
            service.status === "Paid"
              ? isDark
                ? "bg-green-500/20 text-green-400 group-hover:bg-green-500/30"
                : "bg-green-100 text-green-700 group-hover:bg-green-200"
              : isDark
              ? "bg-orange-500/20 text-orange-400 group-hover:bg-orange-500/30"
              : "bg-orange-100 text-orange-700 group-hover:bg-orange-200"
          }`}
        >
          {service.status === "Paid" ? "Completed" : "Pending"}
        </span>

        <div className="text-right">
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mb-1`}>
            Total Amount
          </p>
          <p className="text-2xl font-bold text-green-600">
            ₹{service.cost}
          </p>
        </div>

        <span className={`text-sm font-medium ${
          isDark ? "text-green-400" : "text-green-600"
        } group-hover:translate-x-1 transition-transform duration-300`}>
          View Details →
        </span>
      </div>
    </div>
  );
}

export default Services;