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
  Hash
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
      isDark ? "bg-gray-900" : "bg-gray-50"
    }`}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="transform transition-all duration-300 hover:translate-x-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Service Management
            </h1>
            <p className={`text-sm mt-1 transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Track and manage all service records
            </p>
          </div>

          <button
            onClick={() => navigate("/bike-services/add")}
            className="group relative flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300 font-medium overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <PlusCircle size={18} className="transition-transform duration-300 group-hover:rotate-90" />
            <span className="relative">Add Service</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Wrench size={20} />}
          label="Total Services"
          value={services.length}
          color="blue"
          isDark={isDark}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Pending"
          value={pendingServices}
          color="orange"
          isDark={isDark}
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          label="Completed"
          value={completedServices}
          color="green"
          isDark={isDark}
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          label="Total Revenue"
          value={`₹${totalRevenue}`}
          color="emerald"
          isDark={isDark}
        />
      </div>

      {/* Search Bar */}
      <div className={`mb-6 p-4 rounded-lg transform transition-all duration-300 hover:scale-[1.01] ${
        isDark ? "bg-gray-800 hover:bg-gray-750" : "bg-white shadow-sm hover:shadow-md"
      }`}>
        <div className="relative group">
          <Search
            size={18}
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
              isDark ? "text-gray-400 group-focus-within:text-blue-500" : "text-gray-500 group-focus-within:text-blue-600"
            }`}
          />
          <input
            type="text"
            placeholder="Search by service, client, or registration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border transition-all duration-300 ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-650 focus:border-blue-500"
                : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-600"
            } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={`flex flex-col items-center justify-center py-20 rounded-lg animate-fadeIn ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}>
          <RefreshCw className="animate-spin text-blue-500 mb-3" size={40} />
          <p className={`animate-pulse ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading services...</p>
        </div>
      )}

      {/* Services List */}
      {!loading && (
        <div className="space-y-3">
          {filteredServices.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 rounded-lg transition-all duration-300 animate-fadeIn ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}>
              <Wrench size={48} className={`animate-bounce ${isDark ? "text-gray-600" : "text-gray-400"}`} />
              <p className={`mt-4 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {searchQuery ? "No services found" : "No services yet"}
              </p>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                {searchQuery ? "Try a different search" : "Add your first service"}
              </p>
            </div>
          ) : (
            filteredServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                isDark={isDark}
                onView={() => navigate(`/bike-services/${service.id}`)}
                onDelete={() => deleteService(service.id)}
                updateStatus={updateStatus}
                index={index}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Stats Card Component
const StatCard = ({ icon, label, value, color, isDark }) => {
  const colors = {
    blue: isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-100",
    orange: isDark ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-orange-50 text-orange-600 border-orange-100",
    green: isDark ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-50 text-green-600 border-green-100",
    emerald: isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  return (
    <div className={`group p-4 rounded-lg border transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer animate-slideUp ${
      isDark ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600" : "bg-white border-gray-200 hover:shadow-blue-100"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${colors[color]}`}>
          {icon}
        </div>
        <TrendingUp size={16} className={`transition-all duration-300 group-hover:translate-y-[-2px] ${isDark ? "text-gray-600" : "text-gray-400"}`} />
      </div>
      <p className={`text-xs mb-1 transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </p>
      <h3 className={`text-2xl font-bold transition-all duration-300 group-hover:scale-105 ${isDark ? "text-white" : "text-gray-900"}`}>
        {value}
      </h3>
    </div>
  );
};

// Service Card Component
const ServiceCard = ({ service, isDark, onView, onDelete, updateStatus, index }) => {
  const statusColors = {
    Completed: isDark ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-green-50 text-green-700 border-green-200",
    "In Progress": isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-blue-50 text-blue-700 border-blue-200",
    Pending: isDark ? "bg-orange-500/10 text-orange-400 border-orange-500/30" : "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div 
      className={`group p-4 rounded-lg border transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-slideUp ${
        isDark ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-blue-500/30 hover:shadow-blue-500/10" : "bg-white border-gray-200 hover:border-blue-500/30 hover:shadow-blue-100"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Left Section - Service Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ${
              isDark ? "bg-blue-500/10 group-hover:bg-blue-500/20" : "bg-blue-50 group-hover:bg-blue-100"
            }`}>
              <Wrench size={20} className="text-blue-500 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold truncate transition-colors duration-300 ${
                isDark ? "text-white group-hover:text-blue-400" : "text-gray-900 group-hover:text-blue-600"
              }`}>
                {service.subService?.name ||
                  service.subServiceText ||
                  service.category?.name ||
                  service.categoryText ||
                  "Service"}
              </h3>
              <p className={`text-sm transition-colors duration-300 ${isDark ? "text-gray-400 group-hover:text-gray-300" : "text-gray-600 group-hover:text-gray-700"}`}>
                {service.category?.name || service.categoryText || "—"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 group/item transition-all duration-300 hover:translate-x-1">
              <User size={14} className={`transition-colors duration-300 ${isDark ? "text-gray-500 group-hover/item:text-blue-400" : "text-gray-400 group-hover/item:text-blue-600"}`} />
              <span className={`truncate transition-colors duration-300 ${isDark ? "text-gray-300 group-hover/item:text-white" : "text-gray-700 group-hover/item:text-gray-900"}`}>
                {service.client?.ownerName || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 group/item transition-all duration-300 hover:translate-x-1">
              <Hash size={14} className={`transition-colors duration-300 ${isDark ? "text-gray-500 group-hover/item:text-blue-400" : "text-gray-400 group-hover/item:text-blue-600"}`} />
              <span className={`truncate transition-colors duration-300 ${isDark ? "text-gray-300 group-hover/item:text-white" : "text-gray-700 group-hover/item:text-gray-900"}`}>
                {service.client?.regNumber || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 group/item transition-all duration-300 hover:translate-x-1">
              <Calendar size={14} className={`transition-colors duration-300 ${isDark ? "text-gray-500 group-hover/item:text-blue-400" : "text-gray-400 group-hover/item:text-blue-600"}`} />
              <span className={`transition-colors duration-300 ${isDark ? "text-gray-300 group-hover/item:text-white" : "text-gray-700 group-hover/item:text-gray-900"}`}>
                {new Date(service.inDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 group/item transition-all duration-300 hover:translate-x-1">
              <Calendar size={14} className={`transition-colors duration-300 ${isDark ? "text-gray-500 group-hover/item:text-blue-400" : "text-gray-400 group-hover/item:text-blue-600"}`} />
              <span className={`transition-colors duration-300 ${isDark ? "text-gray-300 group-hover/item:text-white" : "text-gray-700 group-hover/item:text-gray-900"}`}>
                 {`${service.client?.bikeBrand || ""} ${service.client?.bikeModel || ""}`.trim()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Status, Amount, Actions */}
        <div className="flex flex-row lg:flex-col items-start lg:items-end gap-3">
          {/* Status Dropdown */}
          <select
            value={service.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => updateStatus(service.id, e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-md font-medium border cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md ${
              statusColors[service.status]
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Amount Info */}
          <div className="text-right transition-all duration-300 hover:scale-105">
            <p className={`text-md mb-0.5 transition-colors duration-300 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Total
            </p>
            <p className="text-xl font-bold text-emerald-600 transition-all duration-300 hover:text-emerald-500">
              ₹{Number(service.grandTotal || 0).toFixed(2)}
            </p>
            {service.balanceDue > 0 && (
              <p className="text-xs text-red-500 mt-1 animate-pulse">
                Due: ₹{Number(service.balanceDue || 0).toFixed(2)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className={`group/btn relative overflow-hidden px-3 py-1.5 text-md rounded-lg font-medium transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 ${
                isDark
                  ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:shadow-blue-500/50"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-blue-200"
              }`}
            >
              <span className="absolute inset-0 w-full h-full bg-blue-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></span>
              <span className="relative">View</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className={`group/btn relative overflow-hidden p-1.5 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:rotate-12 active:scale-95 active:rotate-0 ${
                isDark
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:shadow-red-500/50"
                  : "bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-red-200"
              }`}
              title="Delete"
            >
              <span className="absolute inset-0 w-full h-full bg-red-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></span>
              <Trash2 size={14} className="relative transition-transform duration-300 group-hover/btn:scale-110" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;