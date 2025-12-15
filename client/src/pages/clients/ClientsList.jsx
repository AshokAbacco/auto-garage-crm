import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEdit, FiTrash2, FiX, FiUser, FiPhone, FiMail, FiCreditCard, FiHash, FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { FaCar } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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

  const fetchClients = async (pageToFetch = 1, search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const url = `${API_BASE}/api/clients?page=${pageToFetch}&limit=${limit}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

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
      if (err.message.includes("401") || err.message.includes("Unauthorized") || err.message.includes("token")) {
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
      if (err.message.includes("401") || err.message.includes("Unauthorized") || err.message.includes("token")) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Handle authentication error
  useEffect(() => {
    if (error && (error.includes("Unauthorized") || error.includes("401") || error.includes("token"))) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} lg:ml-16 transition-colors duration-300`}>
      <div className="p-4 mx-auto space-y-6 max-w-7xl sm:p-6 lg:p-8">
        {/* Toast Notifications */}
        <div className="fixed z-50 top-4 right-4">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: isDark ? '#374151' : '#ffffff',
                color: isDark ? '#f3f4f6' : '#1f2937',
                border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: isDark ? '#111827' : '#f9fafb',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: isDark ? '#111827' : '#f9fafb',
                },
              },
            }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className={`rounded-2xl p-4 shadow-lg border transition-all duration-300 ${isDark ? "bg-red-900/20 border-red-800" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-3">
              <FiAlertCircle className="flex-shrink-0 text-red-500" size={20} />
              <p className={`font-semibold ${isDark ? "text-red-400" : "text-red-700"}`}>Error: {error}</p>
              {(error.includes("Unauthorized") || error.includes("401") || error.includes("token")) && (
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
        <div className={`rounded-2xl p-6 sm:p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${isDark ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
          <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Client Management</h1>
          <p className="text-blue-100">Manage your clients and their vehicles</p>
        </div>

        {/* Search & Add Button */}
        <div className={`rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, phone, email, reg no..."
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${isDark
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
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
            isDark={isDark}
          />
          <StatCard
            title="Current Page"
            value={data.length}
            icon={<FaCar size={24} />}
            gradient="from-purple-500 to-purple-600"
            isDark={isDark}
          />
          <StatCard
            title="Page"
            value={`${page}/${totalPages}`}
            icon={<FiMail size={24} />}
            gradient="from-green-500 to-green-600"
            isDark={isDark}
          />
        </div>

        {/* Full Width Cards List */}
        {loading ? (
          <div className={`rounded-2xl p-16 text-center shadow-lg transition-all duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <div className="w-12 h-12 mx-auto border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
            <p className={`mt-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}>Loading clients...</p>
          </div>
        ) : data.length === 0 ? (
          <div className={`rounded-2xl p-16 text-center shadow-lg transition-all duration-300 ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <FiUser size={48} className={`mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
            <p className={`text-lg font-semibold ${isDark ? "text-gray-300" : "text-gray-600"}`}>No clients found</p>
            <p className={`text-sm mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Try adjusting your search or add a new client</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onView={() => navigate(`/clients/${client.id}`)}
                onEdit={() => navigate(`/clients/${client.id}/edit`, { state: { clientData: client } })}
                onDelete={() => deleteClient(client.id)}
                onQuickView={() => setSelectedClient(client)}
                isDark={isDark}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className={`rounded-2xl p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (page > 1) fetchClients(page - 1, q);
                }}
                disabled={page <= 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${page <= 1
                  ? isDark ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                  } shadow`}
              >
                Previous
              </button>
              <div className={`px-4 py-2 rounded-lg font-medium ${isDark ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-700"}`}>
                {page} / {totalPages}
              </div>
              <button
                onClick={() => {
                  if (page < totalPages) fetchClients(page + 1, q);
                }}
                disabled={page >= totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${page >= totalPages
                  ? isDark ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isDark ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                  } shadow`}
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
            isDark={isDark}
          />
        )}
      </div>
    </div>
  );
}

function ClientCard({ client, onView, onEdit, onDelete, onQuickView, isDark }) {
  return (
    <div className={`rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
      <div className="flex flex-col md:flex-row">
        {/* Vehicle Image */}
        <div className="relative flex-shrink-0 h-48 overflow-hidden cursor-pointer md:w-64 md:h-auto group" onClick={onQuickView}>
          <img
            src={client.carImage || `https://via.placeholder.com/400x300?text=${encodeURIComponent(client.vehicleMake)}+${encodeURIComponent(client.vehicleModel)}`}
            alt="Vehicle"
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(client.vehicleMake)}+${encodeURIComponent(client.vehicleModel)}`;
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
                <h3 className={`font-bold text-xl truncate ${isDark ? "text-white" : "text-gray-900"}`}>{client.fullName}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Active</span>
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className={`flex items-center gap-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                <FaCar size={16} className={isDark ? "text-blue-400" : "text-blue-600"} />
                <span className="text-sm font-semibold">{client.vehicleMake} {client.vehicleModel}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                <FaCar size={14} />
                <span>Year: {client.vehicleYear}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <FiPhone size={14} className={isDark ? "text-blue-400" : "text-blue-600"} />
                <span className="truncate">{client.phone}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <FiMail size={14} className={isDark ? "text-purple-400" : "text-purple-600"} />
                <span className="truncate">{client.email}</span>
              </div>
            </div>

            {/* Registration Number */}
            <div>
              <span className={`inline-block px-4 py-2 rounded-lg font-mono font-bold text-sm ${isDark ? "bg-gray-700 text-yellow-400" : "bg-gray-100 text-gray-900"}`}>
                {client.regNumber}
              </span>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex gap-2 md:flex-col md:gap-3">
            <button
              onClick={onView}
              className={`flex-1 md:flex-none p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${isDark ? "hover:bg-blue-900/30 text-blue-400 border border-blue-800" : "hover:bg-blue-50 text-blue-600 border border-blue-200"}`}
              title="View Details"
            >
              <FiEye size={20} />
              <span className="text-sm font-medium md:hidden">View</span>
            </button>
            <button
              onClick={onEdit}
              className={`flex-1 md:flex-none p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${isDark ? "hover:bg-purple-900/30 text-purple-400 border border-purple-800" : "hover:bg-purple-50 text-purple-600 border border-purple-200"}`}
              title="Edit Client"
            >
              <FiEdit size={20} />
              <span className="text-sm font-medium md:hidden">Edit</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this client?")) {
                  onDelete();
                }
              }}
              className={`flex-1 md:flex-none p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${isDark ? "hover:bg-red-900/30 text-red-400 border border-red-800" : "hover:bg-red-50 text-red-600 border border-red-200"}`}
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

function StatCard({ title, value, icon, gradient, isDark }) {
  return (
    <div className={`rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${isDark ? "bg-gray-800" : "bg-white"}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{title}</p>
          <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110`}>
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function ClientModal({ client, onClose, navigate, deleteClient, isDark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ${isDark ? "bg-gray-800" : "bg-white"} transform transition-all duration-300 scale-95 animate-scaleIn`}>
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${isDark ? "border-gray-700 bg-gradient-to-r from-blue-900/50 to-purple-900/50" : "border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600"}`}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 transition-transform duration-300 bg-white/20 backdrop-blur-sm rounded-xl hover:scale-110">
              <FaCar className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Vehicle Details</h2>
              <p className="text-sm text-white/80">Complete information</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 transition-all text-white/80 hover:text-white hover:bg-white/20 rounded-xl">
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Vehicle Image */}
            <div className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
              <img
                src={client.carImage || `https://via.placeholder.com/600x300?text=${encodeURIComponent(client.vehicleMake)}+${encodeURIComponent(client.vehicleModel)}`}
                alt="Vehicle"
                className="object-contain w-full h-48"
              />
            </div>

            {/* Client Info */}
            <div className={`flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 hover:shadow-md ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
              <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold text-white transition-transform duration-300 shadow-lg rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 hover:scale-110">
                {client.fullName?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div>
                <h4 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{client.fullName}</h4>
                <p className={`flex items-center gap-1 mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Active Client
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoItem icon={<FiPhone />} label="Phone" value={client.phone} isDark={isDark} />
              <InfoItem icon={<FiMail />} label="Email" value={client.email} isDark={isDark} />
              <InfoItem icon={<FaCar />} label="Vehicle" value={`${client.vehicleMake} ${client.vehicleModel}`} isDark={isDark} />
              <InfoItem icon={<FaCar />} label="Year" value={client.vehicleYear} isDark={isDark} />
              <InfoItem icon={<FiCreditCard />} label="Reg No." value={client.regNumber} isDark={isDark} />
              <InfoItem icon={<FiHash />} label="VIN" value={client.vin || "N/A"} isDark={isDark} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`p-6 border-t ${isDark ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"}`}>
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
                navigate(`/clients/${client.id}/edit`, { state: { clientData: client } });
                onClose();
              }}
              className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl font-semibold ${isDark ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600"}`}
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
              className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl font-semibold ${isDark ? "bg-red-600 hover:bg-red-700 text-white" : "bg-white hover:bg-red-50 text-red-600 border-2 border-red-600"}`}
            >
              <FiTrash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

function InfoItem({ icon, label, value, isDark }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-300 hover:shadow-md ${isDark ? "bg-gray-700" : "bg-white"}`}>
      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-white transition-transform duration-300 shadow rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-110">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium mb-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        <p className={`font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
      </div>
    </div>
  );
}