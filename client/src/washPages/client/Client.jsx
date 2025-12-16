import React, { useState, useEffect } from "react";
import {
    Users,
    Phone,
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

    // LOAD CLIENTS (Washing Clients API)
    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE}/api/washing-clients`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch clients");

            const data = await res.json();
            setClients(data || []);
        } catch (err) {
            toast.error("Failed to load clients");
            setError("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    // DELETE CLIENT
    const handleDelete = async (id) => {
        if (!confirm("Delete this client?")) return;

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API_BASE}/api/washing-clients/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Delete failed");

            toast.success("Client deleted");
            loadClients();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    // SEARCH FILTER
    const filteredClients = clients.filter((c) =>
        [c.fullName, c.phone, c.vehicleMake, c.vehicleModel, c.regNumber]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    return (
        <div
            className={`min-h-screen p-6 lg:ml-16 transition-colors duration-300 ${isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
                }`}
        >
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-sky-600 bg-clip-text">
                        Washing Clients
                    </h1>
                    <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>
                        Manage your washing service clients
                    </p>
                </div>

                <button
                    onClick={() => navigate("/addclient")}
                    className="flex items-center gap-2 px-6 py-3 text-white transition-all shadow-lg bg-gradient-to-r from-blue-500 to-sky-600 rounded-xl hover:scale-105"
                >
                    <PlusCircle size={20} />
                    Add New Client
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-2xl">
                    <Search
                        className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Search by name, phone, vehicle, or registration number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 ${isDark
                            ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                            : "bg-white border-gray-200 placeholder-gray-400 shadow-sm"
                            }`}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <RefreshCw className="text-blue-500 animate-spin" size={40} />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 ${isDark
                        ? "bg-red-900/20 border-red-800 text-red-400"
                        : "bg-red-50 border-red-200 text-red-600"
                        }`}
                >
                    <AlertCircle size={24} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* CLIENT LIST */}
            {!loading && !error && (
                <div className="space-y-4 animate-fade-in">
                    {filteredClients.length === 0 ? (
                        <div
                            className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed ${isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-white"
                                }`}
                        >
                            <Users size={64} className={isDark ? "text-gray-600" : "text-gray-400"} />
                            <p className="mt-4 text-lg">No clients found</p>
                            <p className="text-sm text-gray-500">Try searching again</p>
                        </div>
                    ) : (
                        filteredClients.map((client, index) => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                index={index}
                                isDark={isDark}
                                onView={() => navigate(`/client-details/${client.id}`)}
                                onEdit={() => navigate(`/addclient/${client.id}`)}
                                onDelete={() => handleDelete(client.id)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function ClientCard({ client, onView, onEdit, onDelete, isDark, index }) {
    const [imageError, setImageError] = useState(false);

    return (
        <div
            className={`group flex flex-col md:flex-row gap-6 rounded-2xl shadow-md p-6 border-2 transition-all duration-300 ${isDark
                ? "bg-gray-800 border-gray-700 hover:border-blue-500/30"
                : "bg-white border-gray-200 hover:border-blue-500/30"
                }`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Vehicle Image */}
            <div className="relative w-full h-40 overflow-hidden bg-gray-200 md:w-40 rounded-xl">
                {!imageError ? (
                    <img
                        src={client.mainImage || "/no-image.png"}
                        className="object-cover w-full h-full"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                        <Car size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Client Info */}
            <div className="flex-1 space-y-3">
                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {client.fullName}
                </h3>

                <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                    <div className="flex items-center gap-2">
                        <Car size={16} className="text-blue-500" />
                        {client.vehicleMake} {client.vehicleModel}
                    </div>

                    <div className="flex items-center gap-2">
                        <Phone size={16} className="text-green-500" />
                        {client.phone}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Hash size={16} className="text-gray-500" />
                    <span className="px-4 py-1.5 rounded-lg text-sm font-mono font-semibold bg-gray-100">
                        {client.regNumber}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:flex-col">
                <ActionButton label="View" icon={<Eye size={18} />} color="blue" onClick={onView} />
                <ActionButton label="Edit" icon={<Edit2 size={18} />} color="purple" onClick={onEdit} />
                <ActionButton label="Delete" icon={<Trash2 size={18} />} color="red" onClick={onDelete} />
            </div>
        </div>
    );
}

function ActionButton({ label, icon, color, onClick }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
        purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
        red: "bg-red-50 text-red-600 hover:bg-red-100"
    };

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all hover:scale-105 ${colors[color]}`}
        >
            {icon}
            <span className="text-sm">{label}</span>
        </button>
    );
}
