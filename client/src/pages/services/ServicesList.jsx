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

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const apiRequest = async (url) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

const approvalMeta = {
  PENDING: {
    label: "Waiting for Approval",
    class: "bg-yellow-100 text-yellow-800",
  },
  APPROVED: {
    label: "Approved",
    class: "bg-green-100 text-green-800",
  },
  REJECTED: {
    label: "Rejected",
    class: "bg-red-100 text-red-800",
  },
  READY_SENT: {
    // ✅ ADD THIS
    label: "Vehicle Ready",
    class: "bg-blue-100 text-blue-800",
  },
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
        if (!res.ok)
          throw new Error(data.message || "Failed to fetch services");
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
      (Number(s.cost) || Number(s.partsCost || 0) + Number(s.laborCost || 0)),
    0,
  );

  if (error)
    return (
      <div
        className={`p-6 text-center ${
          isDark ? "text-red-400" : "text-red-600"
        } font-semibold`}
      >
        {error}
      </div>
    );

  const renderApprovalBadge = (service) => {
    if (!service.approvalStatus) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
          WhatsApp: Not Sent
        </span>
      );
    }

    const meta = approvalMeta[service.approvalStatus];

    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-semibold ${meta.class}`}
        title={
          service.approvalAt
            ? `Updated at ${new Date(service.approvalAt).toLocaleString()}`
            : ""
        }
      >
        WhatsApp: {meta.label}
      </span>
    );
  };

  return (
    <div className={`space-y-6 lg:ml-16 ${isDark ? "" : ""}`}>
      <div className="  mx-auto px-4 sm:px-1 lg:px-6 py-6 space-y-6">
        {/* Header */}
        <div
          className={`rounded-2xl shadow-lg border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } p-4 sm:p-6`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1
                className={`text-xl sm:text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Service Management
              </h1>
              <p
                className={`mt-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
              >
                Track and manage all service records
              </p>
            </div>
            <Link
              to="/services/new"
              className="flex items-center justify-center gap-2 bg-blue-900 text-white px-4 sm:px-5 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm sm:text-base whitespace-nowrap"
            >
              <FiPlus /> Add New Service
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div
          className={`rounded-2xl shadow-lg border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } p-3 sm:p-4`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 w-full">
              <FiSearch
                className={isDark ? "text-gray-400" : "text-gray-400"}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client, status, reg number..."
                className={`w-full bg-transparent outline-none ${
                  isDark ? "text-white" : "text-gray-900"
                } text-sm sm:text-base`}
              />
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 justify-start sm:justify-end w-full mt-3 sm:mt-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FiFilter />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`rounded-lg border p-2 text-sm ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto`}
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
                className={`rounded-lg border p-2 text-sm ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto`}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
              </select>

              {/* Date Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FiCalendar
                  className={isDark ? "text-gray-400" : "text-gray-400"}
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`rounded-lg border p-2 text-sm ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto`}
                />
                <span className={isDark ? "text-gray-400" : "text-gray-400"}>
                  -
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`rounded-lg border p-2 text-sm ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
          <div
            className={`text-center py-20 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div
            className={`text-center py-20 ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            <FiAlertCircle className="mx-auto mb-2 text-3xl" />
            No services found.
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filtered.map((s) => {
              const estimatedTotal =
                Number(s.cost) ||
                Number(s.partsCost || 0) + Number(s.laborCost || 0);

              const statusColor =
                s.status === "Pending"
                  ? "bg-red-600 text-white"
                  : s.status === "Paid"
                    ? "bg-green-600 text-white"
                    : "bg-gray-600 text-white";

              return (
                <div
                  key={s.id}
                  className={`rounded-2xl shadow-lg border hover:shadow-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-5 ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Left Section */}
                  <div className="space-y-1 flex-1">
                    <h3
                      className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      <FiTool /> {s.subService?.name || s.type || "Service"}
                    </h3>
                    <p
                      className={`text-sm flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <FiTag /> {s.category?.name || "No Category"}
                    </p>
                    <p
                      className={`text-sm flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <FiUser /> {s.client?.fullName || "No Client"} (
                      {s.client?.regNumber || "N/A"})
                    </p>
                    <p
                      className={`text-sm flex items-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <FiCalendar /> {new Date(s.date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end space-y-2 text-right w-full sm:w-auto mt-3 sm:mt-0">
                    {/* Service Status */}
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold text-white ${statusColor}`}
                    >
                      {s.status}
                    </span>

                    {/* WhatsApp Approval Status */}
                    {renderApprovalBadge(s)}

                    {/* Amount */}
                    <span className="text-blue-900 font-bold text-base sm:text-lg">
                      ₹{estimatedTotal.toFixed(2)}
                    </span>

                    <button
                      onClick={() => navigate(`/services/${s.id}`)}
                      className="text-blue-600 hover:underline text-sm font-semibold"
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
      className={`rounded-2xl shadow-lg border ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } p-4 sm:p-6 flex items-center justify-between`}
    >
      <div>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {title}
        </p>
        <p
          className={`text-xl sm:text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
      <div className="text-blue-900 text-xl sm:text-2xl">{icon}</div>
    </div>
  );
}
