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
  ArrowUpRight,
  Filter,
  XCircle,
  Calendar, // Imported Calendar icon
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

// Import your existing modals
import StaffEditModal from "../../components/Car/StaffEditModal";
import StaffViewModal from "../../components/Car/StaffViewModal";
import StaffCreateModal from "../../components/Car/StaffCreateModal";
import StaffLoginCreateModal from "../../components/Car/StaffLoginCreateModal";

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
  const calculateEstimatedSalary = (s) => {
    return (
      (s.baseSalary || 0) +
      (s.bonusDefault || 0) -
      (s.extraDeductionsDefault || 0)
    );
  };

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const getRandomColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-emerald-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-cyan-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
    const estimatedPayroll = staff.reduce(
      (acc, curr) => acc + calculateEstimatedSalary(curr),
      0
    );
    return { totalStaff, activeLogins, estimatedPayroll };
  }, [staff]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center h-screen ${
          isDark ? "bg-slate-900" : "bg-slate-50"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>
            Loading staff data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-6 lg:p-10 min-h-screen font-sans transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
      } lg:ml-[5rem]`}
    >
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1
            className={`text-3xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Staff Management
          </h1>
          <p className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Overview of your team, roles, and access permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 font-medium"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Total Employees"
          value={stats.totalStaff}
          icon={Users}
          trend="+2 this month"
          color="blue"
          isDark={isDark}
        />
        <StatCard
          title="Active System Users"
          value={stats.activeLogins}
          icon={Shield}
          trend="Secure Access"
          color="emerald"
          isDark={isDark}
        />
        <StatCard
          title="Est. Monthly Payroll"
          value={`₹${stats.estimatedPayroll.toLocaleString()}`}
          icon={Wallet}
          trend="Based on defaults"
          color="violet"
          isDark={isDark}
        />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div
        className={`rounded-2xl shadow-sm border overflow-hidden ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        {/* Toolbar */}
        <div className="p-5 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className={`relative w-full max-w-md group`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                size={18}
                className={isDark ? "text-slate-500" : "text-slate-400"}
              />
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm transition-all outline-none border ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  : "bg-gray-50 border-gray-200 text-slate-900 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              }`}
            />
          </div>

          <button
            className={`p-2.5 rounded-xl border transition-colors ${
              isDark
                ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                : "border-gray-200 text-slate-500 hover:bg-gray-50 hover:text-slate-900"
            }`}
          >
            <Filter size={18} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr
                className={`text-xs uppercase tracking-wider font-semibold ${
                  isDark
                    ? "bg-slate-800/50 text-slate-400 border-b border-slate-800"
                    : "bg-gray-50/80 text-gray-500 border-b border-gray-100"
                }`}
              >
                <th className="px-6 py-4 text-left">Employee Details</th>
                <th className="px-6 py-4 text-left">Role</th>
                {/* NEW COLUMN HEADER */}
                <th className="px-6 py-4 text-left">Joined Date</th>
                <th className="px-6 py-4 text-left">System Access</th>
                <th className="px-6 py-4 text-right">Base Salary (Est.)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-slate-800" : "divide-slate-100"
              }`}
            >
              {filteredStaff.map((s) => (
                <tr
                  key={s.id}
                  className={`group transition-colors duration-200 ${
                    isDark ? "hover:bg-slate-800/60" : "hover:bg-slate-50"
                  }`}
                >
                  {/* Name */}
                  <td className="px-6 py-4 align-middle text-left">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md ring-2 ring-offset-2 ${
                          isDark ? "ring-offset-slate-900" : "ring-offset-white"
                        } ${getRandomColor(s.name)}`}
                      >
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <p
                          className={`font-semibold text-sm ${
                            isDark ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {s.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isDark ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          ID: #{s.id.toString().padStart(4, "0")}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4 align-middle text-left">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        isDark
                          ? "bg-slate-800 text-slate-300 border-slate-700"
                          : "bg-white text-slate-600 border-slate-200 shadow-sm"
                      }`}
                    >
                      <Briefcase size={12} className="opacity-70" />
                      {s.role || "Staff Member"}
                    </span>
                  </td>

                  {/* NEW COLUMN BODY: JOINED DATE */}
                  <td className="px-6 py-4 align-middle text-left">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      <Calendar size={14} className="opacity-70" />
                      <span>{formatDate(s.createdAt || s.joinDate)}</span>
                    </div>
                  </td>

                  {/* Access Status & Revoke Button */}
                  <td className="px-6 py-4 align-middle text-left">
                    {!s.login ? (
                      <button
                        onClick={() => setLoginStaff(s)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border border-dashed transition-all flex items-center gap-2 ${
                          isDark
                            ? "border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500 hover:bg-indigo-500/10"
                            : "border-gray-300 text-gray-500 hover:text-indigo-600 hover:border-indigo-600 hover:bg-indigo-50"
                        }`}
                      >
                        <UserPlus size={14} /> Create Login
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        {/* Status Badge */}
                        <div
                          className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                            s.login.isActive
                              ? isDark
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isDark
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {s.login.isActive ? (
                            <CheckCircle2 size={12} />
                          ) : (
                            <ShieldAlert size={12} />
                          )}
                          {s.login.isActive ? "Active" : "Inactive"}
                        </div>

                        {/* Revoke/Enable Button */}
                        <button
                          onClick={() => toggleLogin(s.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
                            s.login.isActive
                              ? isDark
                                ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/50"
                                : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300"
                              : isDark
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {s.login.isActive ? (
                            <>
                              <XCircle size={14} /> Revoke
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} /> Enable
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Salary - Green Color */}
                  <td className="px-6 py-4 align-middle text-right">
                    <p
                      className={`font-mono font-bold ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      ₹{calculateEstimatedSalary(s).toLocaleString()}
                    </p>
                  </td>

                  {/* Actions - Always Visible */}
                  <td className="px-6 py-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn
                        icon={Eye}
                        onClick={() => setViewStaff(s)}
                        isDark={isDark}
                        tooltip="View Details"
                      />
                      <ActionBtn
                        icon={Edit3}
                        onClick={() => setEditStaff(s)}
                        isDark={isDark}
                        tooltip="Edit Staff"
                      />
                      <ActionBtn
                        icon={Trash2}
                        onClick={() => deleteStaff(s.id)}
                        isDark={isDark}
                        danger
                        tooltip="Delete"
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div
                      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 ${
                        isDark
                          ? "border-slate-800 bg-slate-800/30"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div
                        className={`p-4 rounded-full mb-3 ${
                          isDark
                            ? "bg-slate-800 text-slate-600"
                            : "bg-white text-slate-300 shadow-sm"
                        }`}
                      >
                        <Users size={32} />
                      </div>
                      <h3
                        className={`text-lg font-medium mb-1 ${
                          isDark ? "text-slate-200" : "text-slate-900"
                        }`}
                      >
                        No staff found
                      </h3>
                      <p
                        className={`text-sm ${
                          isDark ? "text-slate-500" : "text-slate-500"
                        }`}
                      >
                        Try adjusting your search or add a new staff member.
                      </p>
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-4 text-indigo-500 text-sm font-medium hover:underline"
                      >
                        Clear search
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODALS ================= */}
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
        />
      )}
    </div>
  );
}

/* ===============================
   SUB COMPONENTS
=============================== */

function StatCard({ title, value, icon: Icon, trend, color, isDark }) {
  const colors = {
    blue: isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600",
    emerald: isDark
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-emerald-50 text-emerald-600",
    violet: isDark
      ? "bg-violet-500/10 text-violet-400"
      : "bg-violet-50 text-violet-600",
  };

  return (
    <div
      className={`p-6 rounded-2xl border transition-all duration-200 ${
        isDark
          ? "bg-slate-900 border-slate-800 hover:border-slate-700"
          : "bg-white border-slate-200 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={22} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium flex items-center gap-1 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {trend} <ArrowUpRight size={12} />
          </span>
        )}
      </div>
      <div>
        <p
          className={`text-sm font-medium mb-1 ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {title}
        </p>
        <h3
          className={`text-2xl font-bold ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, onClick, danger, isDark, tooltip }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2 rounded-lg transition-all duration-200 ${
        danger
          ? isDark
            ? "text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
            : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          : isDark
          ? "text-slate-500 hover:bg-slate-800 hover:text-indigo-400"
          : "text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
      }`}
    >
      <Icon size={18} />
    </button>
  );
}
