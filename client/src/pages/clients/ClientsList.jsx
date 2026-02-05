import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiEye,
  FiEdit,
  FiTrash2,
  FiX,
  FiUser,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiHash,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function ClientsList() {
  const [q, setQ] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Use the same color configuration as Layout.js
  const colors = useMemo(
    () => ({
      // Backgrounds
      layoutBg: isDark ? "#020617" : "#FFFFFF", // Sidebar/Header BG
      mainBg: isDark ? "#020617" : "#F8FAFC", // Page Content BG
      elementBg: isDark ? "#020D36" : "#FFFFFF", // Dropdowns/Modals

      // Text
      textPrimary: isDark ? "#E5E7EB" : "#0F172A",
      textSecondary: isDark ? "#94A3B8" : "#475569",

      // Brand & Accents
      brand: isDark ? "#1E3A8A" : "#0B1D51",
      primaryButton: isDark ? "#3B82F6" : "#0046FF", // Blue Color for Active Tab

      // Borders & Hover
      border: isDark ? "#1E293B" : "#E5E7EB",
      hoverBg: isDark ? "#1E293B" : "#F8FAFC",
    }),
    [isDark]
  );

  const fetchClients = async (pageToFetch = 1, search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const url = `${API_BASE}/api/clients?page=${pageToFetch}&limit=${limit}${
        search ? `&q=${encodeURIComponent(search)}` : ""
      }`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const text = await res.text();
        console.error("Non-OK response:", text);
        throw new Error("Failed to fetch clients");
      }

      const text = await res.text();
      if (!text) throw new Error("Empty response from server");

      let json;
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        console.error("Invalid JSON response:", text);
        throw new Error("Server returned invalid JSON");
      }

      setData(json.data || []);
      setTotal(json.total || 0);
      setPage(json.page || pageToFetch);
    } catch (err) {
      setError(err.message);
      console.error("Fetch clients failed:", err);
      if (
        err.message.includes("401") ||
        err.message.includes("Unauthorized") ||
        err.message.includes("token")
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(page, q);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchClients(1, q);
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const deleteClient = async (id) => {
    if (!id || id === "undefined" || isNaN(Number(id))) {
      console.error("Invalid client ID for deletion:", id);
      toast.error("Invalid client ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const res = await fetch(`${API_BASE}/api/clients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Failed to delete client");
      }

      toast.success("Client deleted successfully");
      fetchClients(page, q);
    } catch (err) {
      console.error("Delete client failed:", err);
      toast.error(err.message);
      if (
        err.message.includes("401") ||
        err.message.includes("Unauthorized") ||
        err.message.includes("token")
      ) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Handle authentication error
  useEffect(() => {
    if (
      error &&
      (error.includes("Unauthorized") ||
        error.includes("401") ||
        error.includes("token"))
    ) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  return (
    <div
      className="space-y-6 lg:ml-16 p-0"
      style={{ backgroundColor: colors.mainBg }}
    >
      <div className="p-4 mx-auto space-y-6  sm:p-1 lg:p-2">
        {/* Toast Notifications */}
        <div className="fixed z-50 top-4 right-4">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: colors.elementBg,
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
                borderRadius: "0.75rem",
                boxShadow:
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: colors.elementBg,
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: colors.elementBg,
                },
              },
            }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="rounded-2xl p-4 shadow-lg border transition-all duration-300"
            style={{
              backgroundColor: isDark ? "rgba(127, 29, 29, 0.2)" : "#FEF2F2",
              borderColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#FECACA",
            }}
          >
            <div className="flex items-center gap-3">
              <FiAlertCircle className="flex-shrink-0 text-red-500" size={20} />
              <p
                className="font-semibold"
                style={{ color: isDark ? "#FCA5A5" : "#DC2626" }}
              >
                Error: {error}
              </p>
              {(error.includes("Unauthorized") ||
                error.includes("401") ||
                error.includes("token")) && (
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1 ml-auto text-sm text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <div
          className="rounded-2xl p-6 sm:p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{
            background: isDark
              ? "linear-gradient(to right, rgba(30, 58, 138, 0.5), rgba(124, 58, 237, 0.5))"
              : "linear-gradient(to right, #2563eb, #9333ea)",
          }}
        >
          <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Client Management
          </h1>
          <p className="text-blue-100">
            Manage your clients and their vehicles
          </p>
        </div>

        {/* Search & Add Button */}
        <div
          className="rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{ backgroundColor: colors.elementBg }}
        >
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, phone, email, reg no..."
                className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                style={{
                  backgroundColor: colors.elementBg,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  placeholderColor: colors.textSecondary,
                }}
              />
            </div>
            <Link
              to="/clients/new"
              className="flex items-center justify-center gap-2 px-6 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl hover:shadow-xl whitespace-nowrap"
            >
              <FiUser size={18} />
              Add New Client
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          <StatCard
            title="Total Clients"
            value={total}
            icon={<FiUser size={24} />}
            gradient="from-blue-500 to-blue-600"
            colors={colors}
          />
          <StatCard
            title="Current Page"
            value={data.length}
            icon={<FaCar size={24} />}
            gradient="from-purple-500 to-purple-600"
            colors={colors}
          />
          <StatCard
            title="Page"
            value={`${page}/${totalPages}`}
            icon={<FiMail size={24} />}
            gradient="from-green-500 to-green-600"
            colors={colors}
          />
        </div>

        {/* Full Width Cards List */}
        {loading ? (
          <div
            className="rounded-2xl p-16 text-center shadow-lg transition-all duration-300"
            style={{ backgroundColor: colors.elementBg }}
          >
            <div className="w-12 h-12 mx-auto border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
            <p className="mt-4" style={{ color: colors.textSecondary }}>
              Loading clients...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div
            className="rounded-2xl p-16 text-center shadow-lg transition-all duration-300"
            style={{ backgroundColor: colors.elementBg }}
          >
            <FiUser
              size={48}
              className="mx-auto mb-4"
              style={{ color: colors.textSecondary }}
            />
            <p
              className="text-lg font-semibold"
              style={{ color: colors.textPrimary }}
            >
              No clients found
            </p>
            <p className="text-sm mt-2" style={{ color: colors.textSecondary }}>
              Try adjusting your search or add a new client
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onView={() => navigate(`/clients/${client.id}`)}
                onEdit={() =>
                  navigate(`/clients/${client.id}/edit`, {
                    state: { clientData: client },
                  })
                }
                onDelete={() => deleteClient(client.id)}
                onQuickView={() => setSelectedClient(client)}
                colors={colors}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div
          className="rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{ backgroundColor: colors.elementBg }}
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm" style={{ color: colors.textSecondary }}>
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)}{" "}
              of {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (page > 1) fetchClients(page - 1, q);
                }}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg font-medium transition-all shadow"
                style={{
                  backgroundColor:
                    page <= 1 ? colors.hoverBg : colors.elementBg,
                  color: page <= 1 ? colors.textSecondary : colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Previous
              </button>
              <div
                className="px-4 py-2 rounded-lg font-medium"
                style={{
                  backgroundColor: colors.elementBg,
                  color: colors.textPrimary,
                }}
              >
                {page} / {totalPages}
              </div>
              <button
                onClick={() => {
                  if (page < totalPages) fetchClients(page + 1, q);
                }}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg font-medium transition-all shadow"
                style={{
                  backgroundColor:
                    page >= totalPages ? colors.hoverBg : colors.elementBg,
                  color:
                    page >= totalPages
                      ? colors.textSecondary
                      : colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedClient && (
          <ClientModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            navigate={navigate}
            deleteClient={deleteClient}
            colors={colors}
          />
        )}
      </div>
    </div>
  );
}

function ClientCard({ client, onView, onEdit, onDelete, onQuickView, colors }) {
  const isDark = colors.layoutBg === "#020617";

  return (
    <div
      className="rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl"
      style={{ backgroundColor: colors.elementBg }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Vehicle Image */}
        <div
          className="relative flex-shrink-0 h-48 overflow-hidden cursor-pointer md:w-64 md:h-auto group"
          onClick={onQuickView}
        >
          <img
            src={
              client.carImage ||
              `https://via.placeholder.com/400x300?text=${encodeURIComponent(
                client.vehicleMake
              )}+${encodeURIComponent(client.vehicleModel)}`
            }
            alt="Vehicle"
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(
                client.vehicleMake
              )}+${encodeURIComponent(client.vehicleModel)}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent md:bg-gradient-to-t md:from-black/60 md:via-transparent"></div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 gap-4 p-5 md:p-6 md:flex-row md:items-center md:gap-6">
          {/* Left Section - Client & Vehicle Info */}
          <div className="flex-1 space-y-4">
            {/* Client Info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0 text-xl font-bold text-white transition-transform duration-300 shadow-lg w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-105">
                {client.fullName?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-bold text-xl truncate"
                  style={{ color: colors.textPrimary }}
                >
                  {client.fullName}
                </h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                className="flex items-center gap-2"
                style={{ color: colors.textSecondary }}
              >
                <FaCar
                  size={16}
                  style={{ color: isDark ? "#60A5FA" : "#2563EB" }}
                />
                <span className="text-sm font-semibold">
                  {client.vehicleMake} {client.vehicleModel}
                </span>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                <FaCar size={14} />
                <span>Year: {client.vehicleYear}</span>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                <FiPhone
                  size={14}
                  style={{ color: isDark ? "#60A5FA" : "#2563EB" }}
                />
                <span className="truncate">{client.phone}</span>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: colors.textSecondary }}
              >
                <FiMail
                  size={14}
                  style={{ color: isDark ? "#A78BFA" : "#9333EA" }}
                />
                <span className="truncate">{client.email}</span>
              </div>
            </div>

            {/* Registration Number */}
            <div>
              <span
                className="inline-block px-4 py-2 rounded-lg font-mono font-bold text-sm"
                style={{
                  backgroundColor: isDark ? "#1E293B" : "#F3F4F6",
                  color: isDark ? "#FCD34D" : "#1F2937",
                }}
              >
                {client.regNumber}
              </span>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex gap-2 md:flex-col md:gap-3">
            <button
              onClick={onView}
              className="flex-1 md:flex-none p-3 rounded-xl transition-all flex items-center justify-center gap-2 border"
              style={{
                backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#EFF6FF",
                color: isDark ? "#60A5FA" : "#2563EB",
                borderColor: isDark ? "rgba(59, 130, 246, 0.3)" : "#DBEAFE",
              }}
              title="View Details"
            >
              <FiEye size={20} />
              <span className="text-sm font-medium md:hidden">View</span>
            </button>
            <button
              onClick={onEdit}
              className="flex-1 md:flex-none p-3 rounded-xl transition-all flex items-center justify-center gap-2 border"
              style={{
                backgroundColor: isDark ? "rgba(168, 85, 247, 0.1)" : "#F3E8FF",
                color: isDark ? "#A78BFA" : "#9333EA",
                borderColor: isDark ? "rgba(168, 85, 247, 0.3)" : "#E9D5FF",
              }}
              title="Edit Client"
            >
              <FiEdit size={20} />
              <span className="text-sm font-medium md:hidden">Edit</span>
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this client?")
                ) {
                  onDelete();
                }
              }}
              className="flex-1 md:flex-none p-3 rounded-xl transition-all flex items-center justify-center gap-2 border"
              style={{
                backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEE2E2",
                color: isDark ? "#F87171" : "#DC2626",
                borderColor: isDark ? "rgba(239, 68, 68, 0.3)" : "#FECACA",
              }}
              title="Delete Client"
            >
              <FiTrash2 size={20} />
              <span className="text-sm font-medium md:hidden">Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient, colors }) {
  const isDark = colors.layoutBg === "#020617";

  return (
    <div
      className="rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl"
      style={{ backgroundColor: colors.elementBg }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-sm font-medium mb-1"
            style={{ color: colors.textSecondary }}
          >
            {title}
          </p>
          <p
            className="text-3xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            {value}
          </p>
        </div>
        <div
          className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110`}
        >
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ client, onClose, navigate, deleteClient, colors }) {
  const isDark = colors.layoutBg === "#020617";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.elementBg }}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{
            background: isDark
              ? "linear-gradient(to right, rgba(30, 58, 138, 0.5), rgba(124, 58, 237, 0.5))"
              : "linear-gradient(to right, #2563eb, #9333ea)",
            borderColor: colors.border,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 transition-transform duration-300 bg-white/20 backdrop-blur-sm rounded-xl hover:scale-110">
              <FaCar className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Vehicle Details</h2>
              <p className="text-sm text-white/80">Complete information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-all text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Vehicle Image */}
            <div
              className="rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{ backgroundColor: isDark ? "#1E293B" : "#F3F4F6" }}
            >
              <img
                src={
                  client.carImage ||
                  `https://via.placeholder.com/600x300?text=${encodeURIComponent(
                    client.vehicleMake
                  )}+${encodeURIComponent(client.vehicleModel)}`
                }
                alt="Vehicle"
                className="object-contain w-full h-48"
              />
            </div>

            {/* Client Info */}
            <div
              className="flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 hover:shadow-md"
              style={{ backgroundColor: isDark ? "#1E293B" : "#F9FAFB" }}
            >
              <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white transition-transform duration-300 shadow-lg rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 hover:scale-110">
                {client.fullName?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div>
                <h4
                  className="text-xl font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  {client.fullName}
                </h4>
                <p
                  className="flex items-center gap-1 mt-1"
                  style={{ color: colors.textSecondary }}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Active Client
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem
                icon={<FiPhone />}
                label="Phone"
                value={client.phone}
                colors={colors}
              />
              <InfoItem
                icon={<FiMail />}
                label="Email"
                value={client.email}
                colors={colors}
              />
              <InfoItem
                icon={<FaCar />}
                label="Vehicle"
                value={`${client.vehicleMake} ${client.vehicleModel}`}
                colors={colors}
              />
              <InfoItem
                icon={<FaCar />}
                label="Year"
                value={client.vehicleYear}
                colors={colors}
              />
              <InfoItem
                icon={<FiCreditCard />}
                label="Reg No."
                value={client.regNumber}
                colors={colors}
              />
              <InfoItem
                icon={<FiHash />}
                label="VIN"
                value={client.vin || "N/A"}
                colors={colors}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="p-6 border-t"
          style={{
            backgroundColor: isDark ? "#1E293B" : "#F9FAFB",
            borderColor: colors.border,
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => {
                navigate(`/clients/${client.id}`);
                onClose();
              }}
              className="flex items-center justify-center gap-2 py-3 font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl hover:shadow-xl"
            >
              <FiEye size={18} />
              View
            </button>
            <button
              onClick={() => {
                navigate(`/clients/${client.id}/edit`, {
                  state: { clientData: client },
                });
                onClose();
              }}
              className="py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl font-semibold"
              style={{
                backgroundColor: isDark ? "#9333EA" : "#FFFFFF",
                color: isDark ? "#FFFFFF" : "#9333EA",
                border: `2px solid ${isDark ? "#9333EA" : "#9333EA"}`,
              }}
            >
              <FiEdit size={18} />
              Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm("Delete this client?")) {
                  deleteClient(client.id);
                  onClose();
                }
              }}
              className="py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl font-semibold"
              style={{
                backgroundColor: isDark ? "#DC2626" : "#FFFFFF",
                color: isDark ? "#FFFFFF" : "#DC2626",
                border: `2px solid ${isDark ? "#DC2626" : "#DC2626"}`,
              }}
            >
              <FiTrash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

function InfoItem({ icon, label, value, colors }) {
  const isDark = colors.layoutBg === "#020617";

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl transition-all duration-300 hover:shadow-md"
      style={{ backgroundColor: colors.elementBg }}
    >
      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-white transition-transform duration-300 shadow rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-110">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium mb-1"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </p>
        <p
          className="font-semibold truncate"
          style={{ color: colors.textPrimary }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
