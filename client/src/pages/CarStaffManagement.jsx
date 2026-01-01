import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  Users,
  Wallet,
  CheckCircle2,
  Briefcase,
  UserPlus,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

import StaffEditModal from "../components/Car/StaffEditModal";
import StaffViewModal from "../components/Car/StaffViewModal";
import StaffCreateModal from "../components/Car/StaffCreateModal";
import StaffLoginCreateModal from "../components/Car/StaffLoginCreateModal";

const API = import.meta.env.VITE_API_BASE_URL;

export default function StaffManagement() {
  const { isDark } = useTheme();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editStaff, setEditStaff] = useState(null);
  const [viewStaff, setViewStaff] = useState(null);
  const [loginStaff, setLoginStaff] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  /* ===============================
      FETCH STAFF
  =============================== */
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/car-staff`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  /* ===============================
      ACTIONS
  =============================== */
  const deleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;
    const res = await fetch(`${API}/api/car-staff/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.ok) fetchStaff();
    else alert("Failed to delete staff");
  };

  const toggleLogin = async (id) => {
    const res = await fetch(`${API}/api/car-staff/${id}/toggle`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    if (!res.ok) alert(data.message);
    else fetchStaff();
  };

  /* ===============================
      HELPERS
  =============================== */
  const calculateNetSalary = (s) => {
    const leaveDeduction = (s.leaves || 0) * (s.deductionPerLeave || 0);
    return (
      (s.baseSalary || 0) -
      leaveDeduction -
      (s.extraDeductions || 0) +
      (s.bonus || 0)
    );
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getRandomColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-emerald-500",
      "bg-orange-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  /* ===============================
      MEMOS
  =============================== */
  const filteredStaff = useMemo(() => {
    return staff.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staff, searchTerm]);

  const stats = useMemo(() => {
    const totalStaff = staff.length;
    const activeLogins = staff.filter(
      (s) => s.login && s.login.isActive
    ).length;
    const totalPayroll = staff.reduce(
      (acc, curr) => acc + calculateNetSalary(curr),
      0
    );
    return { totalStaff, activeLogins, totalPayroll };
  }, [staff]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 md:p-8 min-h-screen font-sans ${
        isDark ? "text-slate-100" : "text-slate-900"
      } lg:ml-[5rem]`}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1
            className={`text-3xl font-extrabold ${
              isDark ? "text-slate-100" : "text-slate-900"
            } tracking-tight`}
          >
            Staff Management
          </h1>
          <p
            className={`${
              isDark ? "text-slate-400" : "text-slate-500"
            } mt-2 text-sm`}
          >
            Overview of your team members, roles, and payroll status.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className={`flex items-center gap-2 ${
            isDark
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-indigo-600 hover:bg-indigo-700"
          } text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 font-medium`}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.totalStaff}
          icon={Users}
          color="bg-blue-500"
          isDark={isDark}
        />
        <StatCard
          title="System Access"
          value={stats.activeLogins}
          icon={Shield}
          color="bg-emerald-500"
          isDark={isDark}
        />
        <StatCard
          title="Monthly Payroll"
          value={`₹${stats.totalPayroll.toLocaleString()}`}
          icon={Wallet}
          color="bg-violet-500"
          isDark={isDark}
        />
      </div>

      {/* Main Content Card */}
      <div
        className={`${
          isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
        } rounded-2xl shadow-sm border overflow-hidden`}
      >
        {/* Toolbar */}
        <div
          className={`p-5 border-b ${
            isDark
              ? "border-slate-700 bg-slate-800"
              : "border-slate-100 bg-slate-50/50"
          } flex items-center justify-between gap-4`}
        >
          <div className="relative w-full max-w-md">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? "text-slate-400" : "text-slate-400"
              }`}
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2.5 w-full ${
                isDark
                  ? "bg-slate-700 border-slate-600 text-slate-100 focus:bg-slate-600"
                  : "bg-slate-50 border-transparent focus:bg-white"
              } border focus:border-indigo-500 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm`}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`${
                  isDark
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-slate-50/50 border-slate-100"
                } border-b border-slate-100 text-xs font-bold ${
                  isDark ? "text-slate-400" : "text-slate-500"
                } uppercase tracking-wider`}
              >
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-center">System Access</th>
                <th className="px-6 py-4 text-center">Leaves</th>
                <th className="px-6 py-4 text-right">Net Salary</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-slate-700" : "divide-slate-100"
              }`}
            >
              {filteredStaff.map((s) => (
                <tr
                  key={s.id}
                  className={`hover:${
                    isDark ? "bg-slate-800" : "bg-slate-50"
                  } transition-colors group`}
                >
                  {/* Name Column with Avatar (ID Removed) */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 ${getRandomColor(
                          s.name
                        )}`}
                      >
                        {getInitials(s.name)}
                      </div>
                      <p
                        className={`font-semibold ${
                          isDark ? "text-slate-100" : "text-slate-900"
                        }`}
                      >
                        {s.name}
                      </p>
                    </div>
                  </td>

                  {/* Role Column */}
                  <td className="px-6 py-4 align-middle">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                        isDark
                          ? "bg-slate-700 text-slate-300 border-slate-600"
                          : "bg-slate-100 text-slate-600"
                      } text-xs font-semibold border ${
                        isDark ? "border-slate-600" : "border-slate-200"
                      }`}
                    >
                      <Briefcase size={12} />
                      {s.role || "Staff"}
                    </span>
                  </td>

                  {/* Login Status Column - IMPROVED VISIBILITY */}
                  <td className="px-6 py-4 text-center align-middle">
                    {!s.login ? (
                      <button
                        onClick={() => setLoginStaff(s)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          isDark
                            ? "text-indigo-400 bg-indigo-900/30 border-indigo-700 hover:bg-indigo-900/40"
                            : "text-indigo-700 bg-indigo-50 border-indigo-200"
                        } hover:${
                          isDark ? "bg-indigo-900/40" : "bg-indigo-100"
                        } border px-3 py-1.5 rounded-lg transition-colors`}
                      >
                        <UserPlus size={14} /> Create Login
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            s.login.isActive
                              ? `${
                                  isDark
                                    ? "bg-emerald-900/30 text-emerald-400 border-emerald-700"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`
                              : `${
                                  isDark
                                    ? "bg-rose-900/30 text-rose-400 border-rose-700"
                                    : "bg-rose-50 text-rose-700 border-rose-200"
                                }`
                          }`}
                        >
                          {s.login.isActive ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <ShieldAlert size={12} />
                          )}
                          {s.login.isActive ? "Active" : "Inactive"}
                        </span>

                        <button
                          onClick={() => toggleLogin(s.id)}
                          className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${
                            s.login.isActive
                              ? `${
                                  isDark
                                    ? "text-rose-400 hover:bg-rose-900/30"
                                    : "text-rose-600 hover:bg-rose-50"
                                }`
                              : `${
                                  isDark
                                    ? "text-emerald-400 hover:bg-emerald-900/30"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`
                          }`}
                        >
                          {s.login.isActive ? "Revoke Access" : "Enable Access"}
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Leaves Column */}
                  <td className="px-6 py-4 text-center text-slate-600 font-medium text-sm align-middle">
                    {s.leaves || 0}
                  </td>

                  {/* Salary Column */}
                  <td className="px-6 py-4 text-right align-middle">
                    <span className="font-bold text-green-600">
                      ₹{calculateNetSalary(s).toLocaleString()}
                    </span>
                  </td>

                  {/* Actions Column - ALWAYS VISIBLE */}
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn
                        icon={Eye}
                        onClick={() => setViewStaff(s)}
                        color={`${
                          isDark
                            ? "text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/30"
                            : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        }`}
                        title="View Details"
                        isDark={isDark}
                      />
                      <ActionBtn
                        icon={Edit3}
                        onClick={() => setEditStaff(s)}
                        color={`${
                          isDark
                            ? "text-slate-400 hover:text-amber-400 hover:bg-amber-900/30"
                            : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                        }`}
                        title="Edit Staff"
                        isDark={isDark}
                      />
                      <ActionBtn
                        icon={Trash2}
                        onClick={() => deleteStaff(s.id)}
                        color={`${
                          isDark
                            ? "text-slate-400 hover:text-rose-400 hover:bg-rose-900/30"
                            : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        }`}
                        title="Delete Staff"
                        isDark={isDark}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStaff.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className={`py-12 text-center ${
                      isDark ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Users
                        size={48}
                        className={`${
                          isDark ? "text-slate-700" : "text-slate-200"
                        } mb-3`}
                      />
                      <p>No staff members found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreate && (
        <StaffCreateModal
          onClose={() => setShowCreate(false)}
          onSaved={fetchStaff}
          isDark={isDark}
        />
      )}
      {editStaff && (
        <StaffEditModal
          staff={editStaff}
          onClose={() => setEditStaff(null)}
          onSaved={fetchStaff}
          isDark={isDark}
        />
      )}
      {viewStaff && (
        <StaffViewModal
          staff={viewStaff}
          onClose={() => setViewStaff(null)}
          isDark={isDark}
        />
      )}
      {loginStaff && (
        <StaffLoginCreateModal
          staff={loginStaff}
          onClose={() => setLoginStaff(null)}
          onSaved={fetchStaff}
          isDark={isDark}
        />
      )}
    </div>
  );
}

/* ===============================
   SUB COMPONENTS
=============================== */

function StatCard({ title, value, icon: Icon, color, isDark }) {
  return (
    <div
      className={`${
        isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
      } p-6 rounded-2xl shadow-sm border flex items-start justify-between hover:shadow-md transition-shadow`}
    >
      <div>
        <p
          className={`text-sm font-medium ${
            isDark ? "text-slate-400" : "text-slate-500"
          } mb-1`}
        >
          {title}
        </p>
        <h3
          className={`text-2xl font-bold ${
            isDark ? "text-slate-100" : "text-slate-800"
          }`}
        >
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace("bg-", "text-")} />
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, onClick, color, title, isDark }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${color}`}
    >
      <Icon size={18} />
    </button>
  );
}
