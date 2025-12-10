import React, { useState, useEffect } from "react";
import { 
  Users, 
  Phone, 
  MapPin, 
  PlusCircle, 
  Search, 
  RefreshCw, 
  Car, 
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Hash
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Clients() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/bikes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();
      setClients(data.data || []);
    } catch (err) {
      toast.error("Failed to load clients");
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/bikes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Deleted successfully");
      fetchClients();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredClients = clients.filter((c) =>
    [c.fullName, c.phone, c.vehicleMake, c.vehicleModel, c.regNumber]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-6 lg:ml-16 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent`}>
              Clients List
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Manage all customer details & service history
            </p>
          </div>

          <button
            onClick={() => navigate("/editclient/new")}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-medium"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 animate-slide-down">
        <div className="relative max-w-2xl">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`} size={20} />
          <input
            type="text"
            placeholder="Search by name, phone, vehicle, or registration number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm"
            }`}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="animate-spin text-orange-500" size={40} />
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading clients...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
          isDark ? "bg-red-900/20 border-red-800 text-red-400" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          <AlertCircle size={24} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Clients List */}
      {!loading && !error && (
        <div className="space-y-4 animate-fade-in">
          {filteredClients.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed ${
              isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-white"
            }`}>
              <Users size={64} className={isDark ? "text-gray-600" : "text-gray-400"} />
              <p className={`mt-4 text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {searchQuery ? "No clients found" : "No clients yet"}
              </p>
              <p className={`mt-2 text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                {searchQuery ? "Try adjusting your search" : "Add your first client to get started"}
              </p>
            </div>
          ) : (
            filteredClients.map((client, index) => (
              <ClientListCard
                key={client.id}
                client={client}
                isDark={isDark}
                index={index}
                onView={() => navigate(`/bikes/${client.id}`)}
                onEdit={() => navigate(`/bikes/${client.id}`, { state: { edit: true } })}
                onDelete={() => handleDelete(client.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ClientListCard({ client, onView, onEdit, onDelete, isDark, index }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`group flex flex-col md:flex-row gap-6 items-start md:items-center rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 border-2 animate-slide-up ${
        isDark
          ? "bg-gray-800 border-gray-700 hover:border-orange-500/50"
          : "bg-white border-gray-100 hover:border-orange-500/30"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Vehicle Image */}
      <div className="relative w-full md:w-40 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
        {!imageError ? (
          <img
            src={client.bikeImage || "https://via.placeholder.com/300"}
            alt={`${client.bikeBrand} ${client.bikeModel}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car size={48} className="text-gray-400" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-white text-xs font-medium">View Details</span>
        </div>
      </div>

      {/* Client Info */}
      <div className="flex-1 space-y-3 min-w-0">
        <h3 className={`text-xl font-bold truncate ${
          isDark ? "text-white" : "text-gray-900"
        }`}>
          {client.fullName}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Vehicle Info */}
          <div className={`flex items-center gap-2 text-sm ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}>
            <Car size={16} className="text-orange-500 flex-shrink-0" />
            <span className="truncate">
              {client.vehicleMake} {client.vehicleModel}
            </span>
          </div>

          {/* Phone */}
          <div className={`flex items-center gap-2 text-sm ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}>
            <Phone size={16} className="text-blue-500 flex-shrink-0" />
            <span className="truncate">{client.phone}</span>
          </div>
        </div>

        {/* Registration Number */}
        <div className="flex items-center gap-2">
          <Hash size={16} className={isDark ? "text-gray-500" : "text-gray-400"} />
          <span className={`inline-block px-4 py-1.5 rounded-lg text-sm font-mono font-semibold ${
            isDark
              ? "bg-gray-700 text-orange-400"
              : "bg-gradient-to-r from-orange-50 to-red-50 text-orange-600"
          }`}>
            {client.regNumber}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex md:flex-col gap-2 w-full md:w-auto">
        <button
          onClick={onView}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
            isDark
              ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
        >
          <Eye size={18} />
          <span className="text-sm">View</span>
        </button>

        <button
          onClick={onEdit}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
            isDark
              ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
              : "bg-purple-50 text-purple-600 hover:bg-purple-100"
          }`}
        >
          <Edit2 size={18} />
          <span className="text-sm">Edit</span>
        </button>

        <button
          onClick={onDelete}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
            isDark
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          <Trash2 size={18} />
          <span className="text-sm">Delete</span>
        </button>
      </div>
    </div>
  );
}