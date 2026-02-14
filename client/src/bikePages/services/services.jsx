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
  TrendingUp,
  Edit,
  Trash2,
  User,
  Hash,
  Sparkles,
  Shield,
  Activity,
  Filter,
  ArrowRight
} from "lucide-react";

import { Toaster, toast } from "react-hot-toast";
import api from "../../utils/axiosInstance";

const Services = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/bike-services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch services error:", err);
      toast.error(err.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const completedServices = services.filter(s => s.status === "Completed").length;
  const pendingServices = services.filter(s => s.status === "Pending").length;
  const inProgressServices = services.filter(s => s.status === "In Progress").length;
  const totalRevenue = services
    .reduce((sum, s) => sum + Number(s.grandTotal || 0), 0)
    .toFixed(2);

  const filteredServices = services.filter((s) =>
    [
      s.subService?.name,
      s.subServiceText,
      s.category?.name,
      s.categoryText,
      s.client?.ownerName,
      s.client?.regNumber,
      s.status
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const updateStatus = async (serviceId, newStatus) => {
    try {
      const service = services.find((s) => s.id === serviceId);
      if (!service) return;

      await api.put(`/api/bike-services/${serviceId}`, {
        clientId: service.clientId,
        categoryId: service.categoryId,
        subServiceId: service.subServiceId,
        inDate: service.inDate,
        outDate: service.outDate || null,
        expectedDelivery: service.expectedDelivery || null,
        status: newStatus,
        priority: service.priority || "Normal",
        assignedMechanic: service.assignedMechanic || "",
        notes: service.notes || "",
        discountType: service.discountType || "Fixed Amount",
        discountValue: service.discountValue || 0,
        advancePaid: Number(service.advancePaid || 0),
        invoiceStatus: service.invoiceStatus || "draft",
        parsedServiceItems: service.serviceItems || [],
      });

      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, status: newStatus } : s
        )
      );

      toast.success("Status updated successfully");
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await api.delete(`/api/bike-services/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("Service deleted successfully");
    } catch (err) {
      console.error("Delete service error:", err);
      toast.error(err.response?.data?.message || "Failed to delete service");
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 transition-colors duration-300 ${
      isDark 
        ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" 
        : "bg-gradient-to-b from-white via-gray-50 to-white"
    }`}>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="mb-8">
        <div className="mb-6 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 backdrop-blur-sm animate-fade-in mb-4">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${isDark ? "text-blue-400" : "text-blue-600"}`}>
              Service Management System
            </span>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            Service Management
          </h1>
          
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Track and manage all service records efficiently
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-md">
            <Search 
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"}`} 
              size={18} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services, clients, or status..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 ${
                isDark 
                  ? "bg-gray-800/50 backdrop-blur-xl border-gray-700 text-white placeholder-gray-400 focus:border-blue-500" 
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 shadow-sm"
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={fetchServices}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                isDark 
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700" 
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
              }`}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            <button
              onClick={() => navigate("/bike-services/add")}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <PlusCircle size={18} />
              <span>Add Service</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-7xl mx-auto">
        <StatCard
          icon={Wrench}
          label="Total Services"
          value={services.length}
          color="blue"
          isDark={isDark}
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={pendingServices}
          color="orange"
          isDark={isDark}
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={completedServices}
          color="green"
          isDark={isDark}
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={`₹${totalRevenue}`}
          color="emerald"
          isDark={isDark}
          highlight
        />
      </div>

      {/* Services List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={24} />
            </div>
            <p className={`mt-4 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading services...
            </p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="space-y-4">
            {filteredServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                isDark={isDark}
                onView={() => navigate(`/bike-services/${service.id}`)}
                onDelete={() => deleteService(service.id)}
                updateStatus={updateStatus}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${
            isDark ? "bg-gray-800/30 border-gray-700" : "bg-gray-50 border-gray-300"
          }`}>
            <div className={`inline-flex p-6 rounded-full mb-4 ${
              isDark ? "bg-gray-700/50" : "bg-gray-100"
            }`}>
              <AlertCircle className={`w-16 h-16 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              No services found
            </h3>
            <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {searchQuery ? "Try adjusting your search" : "Get started by adding a new service"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate("/bike-services/add")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
              >
                <PlusCircle size={18} />
                <span>Add First Service</span>
              </button>
            )}
          </div>
        )}
      </div>

     

      {/* Custom Styles */}
      <style jsx>{`
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
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Stats Card Component
const StatCard = ({ icon: Icon, label, value, color, isDark, highlight = false }) => {
  const colors = {
    blue: isDark 
      ? "from-blue-500/20 to-blue-600/10 border-blue-500/30" 
      : "from-blue-50 to-blue-100 border-blue-200",
    orange: isDark 
      ? "from-orange-500/20 to-orange-600/10 border-orange-500/30" 
      : "from-orange-50 to-orange-100 border-orange-200",
    green: isDark 
      ? "from-green-500/20 to-green-600/10 border-green-500/30" 
      : "from-green-50 to-green-100 border-green-200",
    emerald: isDark 
      ? "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30" 
      : "from-emerald-50 to-emerald-100 border-emerald-200",
  };

  const iconColors = {
    blue: "text-blue-500",
    orange: "text-orange-500",
    green: "text-green-500",
    emerald: "text-emerald-500",
  };

  return (
    <div className={`relative group p-6 rounded-2xl border-2 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer overflow-hidden ${
      highlight 
        ? `bg-gradient-to-br ${colors[color]} shadow-lg` 
        : isDark 
        ? "bg-gray-800/50 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50" 
        : "bg-white border-gray-200 hover:border-blue-500/50"
    }`}>
      {highlight && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
            isDark ? "bg-gray-700/50" : "bg-white/80"
          }`}>
            <Icon className={`w-6 h-6 ${iconColors[color]}`} />
          </div>
          <TrendingUp 
            size={18} 
            className={`transition-all duration-300 group-hover:translate-y-[-4px] ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`} 
          />
        </div>
        
        <p className={`text-sm mb-2 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {label}
        </p>
        
        <h3 className={`text-3xl font-bold transition-all duration-300 group-hover:scale-105 ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          {value}
        </h3>
      </div>
    </div>
  );
};

// Service Card Component
const ServiceCard = ({ service, isDark, onView, onDelete, updateStatus, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = {
    Completed: isDark 
      ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20" 
      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
    "In Progress": isDark 
      ? "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20" 
      : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
    Pending: isDark 
      ? "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20" 
      : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
  };

  return (
    <div 
      className={`group p-6 rounded-2xl border-2 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-slide-up ${
        isDark 
          ? "bg-gray-800/50 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50" 
          : "bg-white border-gray-200 hover:border-blue-500/50"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Left Section - Service Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`relative p-3 rounded-xl transition-all duration-300 ${
              isHovered ? "scale-110 rotate-6" : ""
            } ${
              isDark ? "bg-blue-500/10" : "bg-blue-50"
            }`}>
              <Wrench size={24} className={`text-blue-500 transition-transform duration-300 ${
                isHovered ? "rotate-12" : ""
              }`} />
              {isHovered && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl font-bold truncate mb-1 transition-colors duration-300 ${
                isDark 
                  ? "text-white group-hover:text-blue-400" 
                  : "text-gray-900 group-hover:text-blue-600"
              }`}>
                {service.subService?.name ||
                  service.subServiceText ||
                  service.category?.name ||
                  service.categoryText ||
                  "Service"}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                {service.category?.name || service.categoryText || "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoItem
              icon={User}
              value={service.client?.ownerName || "—"}
              isDark={isDark}
            />
            <InfoItem
              icon={Hash}
              value={service.client?.regNumber || "—"}
              isDark={isDark}
            />
            <InfoItem
              icon={Calendar}
              value={new Date(service.inDate).toLocaleDateString()}
              isDark={isDark}
            />
            <InfoItem
              icon={Wrench}
              value={`${service.client?.bikeBrand || ""} ${service.client?.bikeModel || ""}`.trim() || "—"}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Right Section - Status, Amount, Actions */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4">
          {/* Status Dropdown */}
          <select
            value={service.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => updateStatus(service.id, e.target.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              statusColors[service.status]
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Amount Info */}
          <div className={`text-right p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
            isDark ? "bg-emerald-500/10" : "bg-emerald-50"
          }`}>
            <p className={`text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Total Amount
            </p>
            <p className="text-2xl font-bold text-emerald-600 transition-all duration-300 hover:text-emerald-500">
              ₹{Number(service.grandTotal || 0).toFixed(2)}
            </p>
            {service.balanceDue > 0 && (
              <p className="text-xs text-red-500 mt-2 font-medium animate-pulse">
                Due: ₹{Number(service.balanceDue || 0).toFixed(2)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className={`relative overflow-hidden px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 flex items-center gap-2 ${
                isDark
                  ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              <span>View</span>
              <ArrowRight size={14} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className={`relative overflow-hidden p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:rotate-12 active:scale-95 active:rotate-0 ${
                isDark
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                  : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              }`}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Info Item Component
const InfoItem = ({ icon: Icon, value, isDark }) => {
  return (
    <div className="flex items-center gap-3 group/item transition-all duration-300 hover:translate-x-1">
      <div className={`p-2 rounded-lg transition-all duration-300 group-hover/item:scale-110 ${
        isDark ? "bg-gray-700/50" : "bg-gray-100"
      }`}>
        <Icon 
          size={14} 
          className={`transition-colors duration-300 ${
            isDark 
              ? "text-gray-400 group-hover/item:text-blue-400" 
              : "text-gray-500 group-hover/item:text-blue-600"
          }`} 
        />
      </div>
      <span className={`text-sm truncate transition-colors duration-300 ${
        isDark 
          ? "text-gray-300 group-hover/item:text-white" 
          : "text-gray-700 group-hover/item:text-gray-900"
      }`}>
        {value}
      </span>
    </div>
  );
};

export default Services;