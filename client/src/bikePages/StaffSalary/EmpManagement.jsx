import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Users,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Briefcase,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../utils/axiosInstance";
import AddEditStaffModal from "./AddEditStaffModal";

const StaffManagement = () => {
  const { isDark } = useTheme();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [salaryStats, setSalaryStats] = useState({ pending: 0, paid: 0 });

  useEffect(() => {
    fetchStaff();
    fetchSalaryStats();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/staff");
      setStaff(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryStats = async () => {
    try {
      const res = await api.get("/api/bike-staff-salary");
      const salaryData = Array.isArray(res.data) ? res.data : [];
      setSalaryStats({
        pending: salaryData.filter((s) => s.status === "pending").length,
        paid: salaryData.filter((s) => s.status === "paid").length,
      });
    } catch (err) {
      console.error("Fetch salary stats error:", err);
    }
  };

  const handleSaveStaff = async (formData) => {
    try {
      if (selectedStaff) {
        await api.put(`/api/staff/${selectedStaff.id}`, formData);
        toast.success("Staff updated successfully");
      } else {
        await api.post("/api/staff", formData);
        toast.success("Staff added successfully");
      }
      fetchStaff();
      setShowAddModal(false);
      setSelectedStaff(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save staff");
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/api/staff/${id}`);
      toast.success("Staff deleted successfully");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete staff");
    }
  };

  const filteredStaff = staff.filter((s) =>
    [s.name, s.email, s.phone, s.role].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ animation: "slideDown 0.5s ease-out" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="text-blue-500" size={32} />
              Staff Management
            </h1>
            <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Manage your team members efficiently
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedStaff(null);
              setShowAddModal(true);
            }}
            className={`group relative px-6 py-3 rounded-xl font-semibold shadow-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 ${
              isDark
                ? "bg-gradient-to-r from-blue-600 to-blue-600 text-white hover:shadow-blue-500/50"
                : "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:shadow-blue-400/50"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <span className="relative flex items-center gap-2">
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Add Staff
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Users size={22} />} label="Total Employees" value={staff.length} color="blue" isDark={isDark} />
        <StatCard icon={<Clock size={22} />} label="Salary Pending" value={salaryStats.pending} color="orange" isDark={isDark} />
        <StatCard icon={<CheckCircle size={22} />} label="Salary Paid" value={salaryStats.paid} color="green" isDark={isDark} />
      </div>

      {/* Search Bar */}
      <div
        className={`p-4 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
          isDark
            ? "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
            : "bg-white/70 border-gray-200 hover:bg-white"
        }`}
      >
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`} size={20} />
          <input
            type="text"
            placeholder="Search by name, email, phone, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
              isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="relative inline-flex">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          <p className={`mt-4 font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading staff...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div
          className={`text-center py-16 rounded-2xl border ${
            isDark ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <Users size={56} className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-400"}`} />
          <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {searchQuery ? "No staff members found" : "No staff members yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStaff.map((s, index) => (
            <StaffCard
              key={s.id}
              staff={s}
              isDark={isDark}
              index={index}
              onEdit={() => {
                setSelectedStaff(s);
                setShowAddModal(true);
              }}
              onDelete={() => handleDeleteStaff(s.id, s.name)}
            />
          ))}
        </div>
      )}

    {showAddModal && (
      <AddEditStaffModal
        staff={selectedStaff}
        staffList={staff}   // ✅ FIXED HERE
        onClose={() => {
          setShowAddModal(false);
          setSelectedStaff(null);
        }}
        onSave={handleSaveStaff}
        isDark={isDark}
      />
    )}


      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, isDark }) => {
  const colors = {
    blue: isDark ? "from-blue-600/20 to-blue-800/20 border-blue-500/30" : "from-blue-50 to-blue-100/50 border-blue-200",
    orange: isDark ? "from-orange-600/20 to-orange-800/20 border-orange-500/30" : "from-orange-50 to-orange-100/50 border-orange-200",
    green: isDark ? "from-green-600/20 to-green-800/20 border-green-500/30" : "from-green-50 to-green-100/50 border-green-200",
  };

  const iconColors = {
    blue: "text-blue-500",
    orange: "text-orange-500",
    green: "text-green-500",
  };

  return (
    <div
      className={`group relative p-5 rounded-2xl border bg-gradient-to-br overflow-hidden transition-all duration-300 hover:scale-80 hover:shadow-xl cursor-pointer ${colors[color]}`}
      style={{ animation: `slideUp 0.5s ease-out forwards` }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="relative flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-white/10 backdrop-blur-sm ${iconColors[color]} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          {icon}
        </div>
      </div>
      <p className={`text-sm mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
      <h3 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} group-hover:scale-105 transition-transform`}>
        {value}
      </h3>
    </div>
  );
};

const StaffCard = ({ staff, isDark, index, onEdit, onDelete }) => {
  return (
    <div
      className={`group relative p-6 rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
        isDark
          ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 hover:border-blue-500/50"
          : "bg-white/90 border-gray-200 hover:border-blue-400/50 hover:shadow-blue-100"
      }`}
      style={{ animation: `slideUp 0.5s ease-out ${index * 0.05}s backwards` }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700"></div>

      {/* Header */}
      <div className="relative flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              {staff.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
          </div>
          <div>
            <h3 className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"} group-hover:text-blue-500 transition-colors`}>
              {staff.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Briefcase size={14} className={isDark ? "text-gray-500" : "text-gray-400"} />
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{staff.role}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDark ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <Edit2 size={16} className="group-hover:rotate-12 transition-transform" />
          </button>
          <button
            onClick={onDelete}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95 ${
              isDark ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="relative space-y-3 mb-5">
        {[
          { icon: Mail, text: staff.email || "No email" },
          { icon: Phone, text: staff.phone || "No phone" },
          { icon: MapPin, text: staff.address || "No address" },
        ].map(({ icon: Icon, text }, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:translate-x-2 ${
              isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
            }`}
          >
            <Icon size={16} className={isDark ? "text-gray-500" : "text-gray-400"} />
            <span className={`text-sm truncate ${isDark ? "text-gray-300" : "text-gray-700"}`}>{text}</span>
          </div>
        ))}
      </div>

      {/* Salary */}
      <div
        className={`relative pt-4 border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>Annual Salary</span>
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xl group-hover:scale-110 transition-transform">
            <IndianRupee size={18} />
            <span>{staff.annualSalary.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;