import React, { useState, useEffect,useMemo  } from "react";
import {
  Users,
  Phone,
  PlusCircle,
  Search,
  RefreshCw,
  Car,
  Bike,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Hash
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import api from "../../utils/axiosInstance";

export default function Clients() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/bikes");
      setClients(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Fetch clients error:", err);
      toast.error(err.response?.data?.message || "Failed to load clients");
      setError("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await api.delete(`/api/bikes/${id}`);
      toast.success("Client deleted successfully");
      fetchClients();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete client");
    }
  };

  // ✅ SEARCH FILTER
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const searchableText = [
        c.ownerName || c.fullName || "",
        c.phone || "",
        c.bikeBrand || c.vehicleMake || "",
        c.bikeModel || c.vehicleModel || "",
        c.regNumber || ""
      ].join(" ").toLowerCase();
      
      return searchableText.includes(searchQuery.toLowerCase());
    });
  }, [clients, searchQuery]);

  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage) || 1;
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstClient,
    indexOfLastClient
  );

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <Toaster position="top-right" />

      {/* ✅ HEADER */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Clients List
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Manage all customer details & service history
            </p>
          </div>

          <button
            onClick={() => navigate("/editclient/new")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <PlusCircle size={20} />
            Add New Client
          </button>
        </div>
      </div>

      {/* ✅ TOP 3 STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className={`p-6 rounded-xl shadow-md flex items-center justify-between transition-colors duration-300 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}>
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Total Clients</p>
            <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{filteredClients.length}</h2>
          </div>
          <Users className="text-blue-500" size={36} />
        </div>

        <div className={`p-6 rounded-xl shadow-md flex items-center justify-between transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"
          }`}>
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Current Page</p>
            <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{currentPage}</h2>
          </div>
          <Bike className="text-blue-500" size={36} />
        </div>

        <div className={`p-6 rounded-xl shadow-md flex items-center justify-between transition-colors duration-300 ${isDark ? "bg-gray-800" : "bg-white"
          }`}>
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>Page</p>
            <h2 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{currentPage}/{totalPages}</h2>
          </div>
          <Hash className="text-blue-500" size={36} />
        </div>
      </div>

      {/* ✅ SEARCH BAR */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`} size={20} />
          <input
            type="text"
            placeholder="Search by name, phone, vehicle, or registration..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full pl-12 pr-4 py-4 rounded-xl border transition-colors duration-300 ${
              isDark 
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" 
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* ✅ LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="animate-spin text-blue-500" size={40} />
        </div>
      )}

      {/* ✅ ERROR */}
      {error && !loading && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${
          isDark ? "bg-red-900/30 text-red-400 border border-red-800" : "bg-red-50 text-red-600"
        }`}>
          <AlertCircle size={24} />
          {error}
        </div>
      )}

      {/* ✅ CLIENT LIST */}
      {!loading && !error && (
        <div className="space-y-4">
          {currentClients.length > 0 ? (
            currentClients.map((client) => (
              <ClientListCard
                key={client.id}
                client={client}
                isDark={isDark}
                onView={() => navigate(`/bikes/${client.id}`)}
                onEdit={() => navigate(`/bikes/${client.id}`, { state: { edit: true } })}
                onDelete={() => handleDelete(client.id)}
              />
            ))
          ) : (
            <div className={`text-center py-20 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No clients found</p>
              <p className="text-sm mt-2">Try adjusting your search or add a new client</p>
            </div>
          )}
        </div>
      )}

      {/* ✅ PAGINATION FOOTER */}
      {!loading && !error && filteredClients.length > 0 && (
        <div className={`mt-10 flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-xl shadow transition-colors duration-300 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Showing {indexOfFirstClient + 1} – {Math.min(indexOfLastClient, filteredClients.length)} of {filteredClients.length}
          </p>

          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                isDark 
                  ? "border-gray-700 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed" 
                  : "border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            <span className={`px-4 py-2 rounded-lg border font-semibold ${
              isDark 
                ? "border-gray-700 bg-gray-700 text-white" 
                : "border-gray-300 bg-gray-50 text-gray-900"
            }`}>
              {currentPage}/{totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                isDark 
                  ? "border-gray-700 text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed" 
                  : "border-gray-300 text-gray-900 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ✅ CLIENT CARD COMPONENT */
function ClientListCard({ client, onView, onEdit, onDelete, isDark }) {
  const fullName = client.ownerName || client.fullName || "Unknown";
  const vehicleMake = client.bikeBrand || client.vehicleMake || "N/A";
  const vehicleModel = client.bikeModel || client.vehicleModel || "";
 
  const getBikeImageSrc = (img) => {
  if (!img) return null;

  // base64
  if (img.startsWith("data:image")) return img;

  // full URL
  if (img.startsWith("http")) return img;

  // relative path
  return `${import.meta.env.VITE_API_BASE_URL}${img}`;
};

const bikeImageSrc = getBikeImageSrc(client.bikeImage);


  return (
    <div
      className={`flex flex-col md:flex-row gap-6 rounded-2xl shadow-md p-6 border transition-all duration-300 hover:shadow-lg ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Bike Image */}
      <div className="w-48 h-48 rounded-xl bg-gray-200 flex items-center justify-center">
      {bikeImageSrc ? (
        <img
          src={client.bikeImage || "https://via.placeholder.com/300"}
          alt="Bike"
          className="w-full h-full object-cover rounded-xl"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://via.placeholder.com/300x200?text=No+Bike+Image";
          }}
        />
      ) : (
        <Bike size={64} className="text-gray-500" />
      )}
    </div>


      {/* Client Details */}
      <div className="flex-1 space-y-4">
        {/* NAME */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold ${isDark
              ? "bg-gradient-to-br from-blue-500 to-purple-600"
              : "bg-gradient-to-br from-blue-500 to-indigo-600"
              }`}
          >
            {fullName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {fullName}
            </h3>

            <span className="inline-flex items-center gap-1 px-2 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active
            </span>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-3">
            {/* Bike Brand + Model */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-blue-50"
                  }`}
              >
                <Bike size={20} className="text-blue-500" />
              </div>

              <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {vehicleMake} {vehicleModel}
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-blue-50"
                  }`}
              >
                <Phone size={20} className="text-blue-500" />
              </div>
              <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {client.phone || "N/A"}
              </span>
            </div>

            {/* Registration Number */}
            <span className={`inline-block px-4 py-2 rounded-lg font-mono text-sm font-semibold ${
              isDark 
                ? "bg-blue-900/50 text-blue-300 border border-blue-700" 
                : "bg-blue-100 text-blue-600"
            }`}>
              {client.regNumber || "N/A"}
            </span>
          </div>

          {/* RIGHT */}
          <div className="space-y-3">
            {/* Year */}
            {client.bikeYear && (
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-blue-50"
                    }`}
                >
                  <Bike size={20} className="text-blue-500" />
                </div>

                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Year: {client.bikeYear || "-"}
                </span>
              </div>
            )}

            {/* Email */}
            {client.email && (
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? "bg-gray-700" : "bg-blue-50"
                    }`}
                >
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  {client.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex md:flex-col gap-2 justify-center">
        <button 
          onClick={onView} 
          className={`p-3 rounded-xl border-2 hover:scale-105 transition-all duration-200 ${
            isDark 
              ? "border-gray-700 hover:bg-gray-700" 
              : "border-gray-200 hover:bg-gray-50"
          }`}
          title="View Details"
        >
          <Eye size={20} className="text-blue-500" />
        </button>

        <button 
          onClick={onEdit} 
          className={`p-3 rounded-xl border-2 hover:scale-105 transition-all duration-200 ${
            isDark 
              ? "border-gray-700 hover:bg-gray-700" 
              : "border-gray-200 hover:bg-gray-50"
          }`}
          title="Edit Client"
        >
          <Edit2 size={20} className="text-purple-500" />
        </button>

        <button 
          onClick={onDelete} 
          className={`p-3 rounded-xl border-2 hover:scale-105 transition-all duration-200 ${
            isDark 
              ? "border-gray-700 hover:bg-gray-700" 
              : "border-gray-200 hover:bg-gray-50"
          }`}
          title="Delete Client"
        >
          <Trash2 size={20} className="text-red-500" />
        </button>
      </div>
    </div>
  );
}