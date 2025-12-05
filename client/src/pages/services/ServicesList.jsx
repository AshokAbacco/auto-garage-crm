// client/src/pages/services/ServicesList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiTool,
  FiPlus,
  FiSearch,
  FiDollarSign,
  FiFileText,
  FiAlertCircle,
  FiFilter,
  FiCalendar,
  FiUser,
  FiTag,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const apiRequest = async (url) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export default function ServicesList() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await apiRequest("/api/services");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch services");
        setServices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const res = await apiRequest("/api/services/list");
        const data = await res.json();
        if (res.ok) setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    loadServices();
    loadCategories();
  }, []);

  // ✅ Enhanced Filtered List
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return services.filter((s) => {
      const matchesSearch =
        s.client?.fullName?.toLowerCase().includes(q) ||
        s.client?.regNumber?.toLowerCase().includes(q) ||
        s.status?.toLowerCase().includes(q) ||
        s.category?.name?.toLowerCase().includes(q) ||
        s.subService?.name?.toLowerCase().includes(q);

      const matchesCategory = selectedCategory
        ? s.category?.id === Number(selectedCategory)
        : true;

      const matchesStatus = selectedStatus
        ? s.status?.toLowerCase() === selectedStatus.toLowerCase()
        : true;

      const serviceDate = new Date(s.date);
      const matchesDate =
        (!startDate || serviceDate >= new Date(startDate)) &&
        (!endDate || serviceDate <= new Date(endDate));

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [search, services, selectedCategory, selectedStatus, startDate, endDate]);

  const totalRevenue = services.reduce(
    (sum, s) =>
      sum +
      (Number(s.cost) ||
        Number(s.partsCost || 0) + Number(s.laborCost || 0)),
    0
  );

  if (error)
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        {error}
      </div>
    );

  return (
    <div
      className={`min-h-screen p-6 lg:ml-16 ${isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div
          className={`rounded-3xl p-8 shadow-lg ${isDark ? "bg-gray-800" : "bg-white"
            }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Service Management</h1>
              <p className={`${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Track and manage all service records
              </p>
            </div>
            <Link
              to="/services/new"
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              <FiPlus /> Add New Service
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div
          className={`p-4 rounded-2xl flex flex-col md:flex-row md:items-center gap-3 shadow ${isDark ? "bg-gray-800" : "bg-white"
            }`}
        >
          <div className="flex items-center gap-3 w-full md:w-2/5">
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, status, reg number..."
              className={`w-full bg-transparent outline-none ${isDark ? "text-white" : "text-gray-900"
                }`}
            />
          </div>

          <div className="flex gap-3 flex-wrap justify-end w-full md:w-3/5">
            <div className="flex items-center gap-2">
              <FiFilter />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`rounded-lg border p-2 text-sm ${isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300"
                  }`}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`rounded-lg border p-2 text-sm ${isDark
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-gray-50 border-gray-300"
                }`}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
            </select>

            {/* Date Filters */}
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`rounded-lg border p-2 text-sm ${isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300"
                  }`}
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`rounded-lg border p-2 text-sm ${isDark
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <StatCard
            icon={<FiTool />}
            title="Total Services"
            value={services.length}
            isDark={isDark}
          />
          <StatCard
            icon={<FiFileText />}
            title="Filtered Results"
            value={filtered.length}
            isDark={isDark}
          />
          <StatCard
            icon={<FaRupeeSign />}
            title="Total Revenue"
            value={`₹${totalRevenue.toFixed(2)}`}
            isDark={isDark}
          />
        </div>

        {/* Services List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FiAlertCircle className="mx-auto mb-2 text-3xl" />
            No services found.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((s) => {
              const estimatedTotal =
                Number(s.cost) ||
                Number(s.partsCost || 0) + Number(s.laborCost || 0);

              const statusColor =
              s.status === "Pending"
                ? "bg-red-500 text-white"
                : s.status === "Paid"
                ? "bg-green-600 text-white"
                : "bg-gray-400 text-white";


              return (
                <div
                  key={s.id}
                  className={`w-full rounded-2xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDark ? "bg-gray-800" : "bg-white"
                    }`}
                >
                  {/* Left Section */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <FiTool /> {s.subService?.name || s.type || "Service"}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <FiTag /> {s.category?.name || "No Category"}
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <FiUser /> {s.client?.fullName || "No Client"} ({s.client?.regNumber || "N/A"})
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <FiCalendar /> {new Date(s.date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end space-y-2 text-right">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold text-white ${statusColor}`}
                    >
                      {s.status}
                    </span>
                    <span className="text-green-500 font-bold text-lg">
                      ₹{estimatedTotal.toFixed(2)}
                    </span>
                    <button
                      onClick={() => navigate(`/services/${s.id}`)}
                      className="text-green-600 hover:underline text-sm font-semibold"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, isDark }) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-lg flex items-center justify-between ${isDark ? "bg-gray-800" : "bg-white"
        }`}
    >
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-green-500 text-3xl">{icon}</div>
    </div>
  );
}
