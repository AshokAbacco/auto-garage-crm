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
  TrendingUp,
  CheckCircle,
  Clock,
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
  const [salaryStats, setSalaryStats] = useState({
    pending: 0,
    paid: 0,
  });

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
      console.error("Fetch staff error:", err);
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
      console.error("Save staff error:", err);
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
      console.error("Delete staff error:", err);
      toast.error(err.response?.data?.message || "Failed to delete staff");
    }
  };

  const filteredStaff = staff.filter((s) =>
    [s.name, s.email, s.phone, s.role]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="transform transition-all duration-300 hover:translate-x-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Staff Management
            </h1>
            <p
              className={`text-sm mt-1 transition-colors duration-300 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Manage employee information and details
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedStaff(null);
              setShowAddModal(true);
            }}
            className="group relative flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300 font-medium overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
            <PlusCircle
              size={18}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            <span className="relative">Add Staff</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<Users size={20} />}
          label="Total Employees"
          value={staff.length}
          color="blue"
          isDark={isDark}
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Salary Pending"
          value={salaryStats.pending}
          color="orange"
          isDark={isDark}
        />
        <StatCard
          icon={<CheckCircle size={20} />}
          label="Salary Paid"
          value={salaryStats.paid}
          color="green"
          isDark={isDark}
        />
      </div>

      {/* Search Bar */}
      <div
        className={`p-4 rounded-xl border mb-6 transition-all duration-300 ${
          isDark
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name, email, phone, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? "bg-gray-900 border-gray-700 text-white placeholder-gray-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p
            className={`mt-4 transition-colors duration-300 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Loading staff...
          </p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div
          className={`text-center py-12 rounded-xl border transition-all duration-300 ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <Users
            size={48}
            className={`mx-auto mb-4 transition-colors duration-300 ${
              isDark ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p
            className={`transition-colors duration-300 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {searchQuery ? "No staff members found" : "No staff members yet"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                setSelectedStaff(null);
                setShowAddModal(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Add Your First Staff Member
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredStaff.map((member, index) => (
            <StaffCard
              key={member.id}
              staff={member}
              isDark={isDark}
              index={index}
              onEdit={() => {
                setSelectedStaff(member);
                setShowAddModal(true);
              }}
              onDelete={() => handleDeleteStaff(member.id, member.name)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddEditStaffModal
          staff={selectedStaff}
          onClose={() => {
            setShowAddModal(false);
            setSelectedStaff(null);
          }}
          onSave={handleSaveStaff}
          isDark={isDark}
        />
      )}
    </div>
  );
};

// Stats Card Component
const StatCard = ({ icon, label, value, color, isDark }) => {
  const colors = {
    blue: isDark
      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
      : "bg-blue-50 text-blue-600 border-blue-100",
    orange: isDark
      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
      : "bg-orange-50 text-orange-600 border-orange-100",
    green: isDark
      ? "bg-green-500/10 text-green-400 border-green-500/20"
      : "bg-green-50 text-green-600 border-green-100",
  };

  return (
    <div
      className={`group p-4 rounded-lg border transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer animate-slideUp ${
        isDark
          ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600"
          : "bg-white border-gray-200 hover:shadow-blue-100"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${colors[color]}`}
        >
          {icon}
        </div>
        <TrendingUp
          size={16}
          className={`transition-all duration-300 group-hover:translate-y-[-2px] ${
            isDark ? "text-gray-600" : "text-gray-400"
          }`}
        />
      </div>
      <p
        className={`text-xs mb-1 transition-colors duration-300 ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      <h3
        className={`text-2xl font-bold transition-all duration-300 group-hover:scale-105 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </h3>
    </div>
  );
};

// Staff Card Component
const StaffCard = ({ staff, isDark, index, onEdit, onDelete }) => {
  return (
    <div
      className={`group p-5 rounded-xl border transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-slideUp ${
        isDark
          ? "bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-blue-500/30 hover:shadow-blue-500/10"
          : "bg-white border-gray-200 hover:border-blue-500/30 hover:shadow-blue-100"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header with Avatar and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              {staff.name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
          </div>
          <div>
            <h3
              className={`font-bold text-lg transition-colors duration-300 ${
                isDark
                  ? "text-white group-hover:text-blue-400"
                  : "text-gray-900 group-hover:text-blue-600"
              }`}
            >
              {staff.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Briefcase
                size={12}
                className={`transition-colors duration-300 ${
                  isDark ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <p
                className={`text-sm transition-colors duration-300 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {staff.role}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className={`group/btn relative overflow-hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDark
                ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
            title="Edit"
          >
            <span className="absolute inset-0 w-full h-full bg-blue-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></span>
            <Edit2
              size={16}
              className="relative transition-transform duration-300 group-hover/btn:rotate-12"
            />
          </button>
          <button
            onClick={onDelete}
            className={`group/btn relative overflow-hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12 active:scale-95 active:rotate-0 ${
              isDark
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
            title="Delete"
          >
            <span className="absolute inset-0 w-full h-full bg-red-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></span>
            <Trash2
              size={16}
              className="relative transition-transform duration-300 group-hover/btn:scale-110"
            />
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 group/item transition-all duration-300 hover:translate-x-1">
          <Mail
            size={14}
            className={`transition-colors duration-300 ${
              isDark
                ? "text-gray-500 group-hover/item:text-blue-400"
                : "text-gray-400 group-hover/item:text-blue-600"
            }`}
          />
          <span
            className={`text-sm transition-colors duration-300 ${
              isDark
                ? "text-gray-300 group-hover/item:text-white"
                : "text-gray-700 group-hover/item:text-gray-900"
            }`}
          >
            {staff.email || "No email"}
          </span>
        </div>
        <div className="flex items-center gap-2 group/item transition-all duration-300 hover:translate-x-1">
          <Phone
            size={14}
            className={`transition-colors duration-300 ${
              isDark
                ? "text-gray-500 group-hover/item:text-blue-400"
                : "text-gray-400 group-hover/item:text-blue-600"
            }`}
          />
          <span
            className={`text-sm transition-colors duration-300 ${
              isDark
                ? "text-gray-300 group-hover/item:text-white"
                : "text-gray-700 group-hover/item:text-gray-900"
            }`}
          >
            {staff.phone || "No phone"}
          </span>
        </div>
        <div className="flex items-center gap-2 group/item transition-all duration-300 hover:translate-x-1">
          <MapPin
            size={14}
            className={`transition-colors duration-300 ${
              isDark
                ? "text-gray-500 group-hover/item:text-blue-400"
                : "text-gray-400 group-hover/item:text-blue-600"
            }`}
          />
          <span
            className={`text-sm transition-colors duration-300 truncate ${
              isDark
                ? "text-gray-300 group-hover/item:text-white"
                : "text-gray-700 group-hover/item:text-gray-900"
            }`}
          >
            {staff.address || "No address"}
          </span>
        </div>
      </div>

      {/* Salary Information */}
      <div
        className={`pt-4 border-t transition-colors duration-300 ${
          isDark ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-sm transition-colors duration-300 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Annual Salary
          </span>
          <div className="flex items-center gap-1 text-emerald-600 font-bold text-lg transition-all duration-300 group-hover:scale-105">
            <IndianRupee size={16} />
            <span>{staff.annualSalary.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;