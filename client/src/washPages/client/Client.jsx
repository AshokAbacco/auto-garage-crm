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
    Hash,
    Mail,
    Calendar
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

    // LOAD CLIENTS (Washing Clients API) - NO CHANGES TO BACKEND
    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("You are not logged in. Please login again.");
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_BASE}/api/washing-clients`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 401) {
                toast.error("Session expired. Please login again.");
                localStorage.removeItem("token");
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to fetch clients");
            }

            const data = await res.json();
            setClients(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Load clients error:", err);
            toast.error("Failed to load clients");
            setError("Failed to load clients");
        } finally {
            setLoading(false);
        }
    };

    // DELETE CLIENT - NO CHANGES TO BACKEND
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

    // SEARCH FILTER - NO CHANGES
    const filteredClients = clients.filter((c) =>
        [c.fullName, c.phone, c.vehicleMake, c.vehicleModel, c.regNumber]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    const totalClients = clients.length;
    const currentPage = 1;
    const totalPages = 1;

    return (
        <div className={`min-h-screen transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
            <Toaster position="top-right" />

            {/* Modern Header with Light Blue/White Theme */}
            <div className={`${isDark ? "bg-gray-800 " : "bg-white "} border-b ${isDark ? "border-gray-700" : "border-gray-100"} px-6 py-6 transition-all duration-300`}>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-5xl font-bold text-[#0356a3]
 ]">
                            Clients List
                        </h1>



                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            Manage all customer details & service history
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/addclient")}
                        className="group flex items-center gap-2 px-6 py-3 
             bg-gradient-to-r from-[#0356a3] to-[#0356a3] 
             text-white rounded-xl font-medium shadow-lg 
             hover:shadow-xl hover:-translate-y-0.5 
             transition-all duration-300"
                    >
                        <PlusCircle
                            size={18}
                            className="transition-transform duration-300 group-hover:rotate-90"
                        />
                        Add New Client
                    </button>

                </div>
            </div>

            <div className="p-6">
                {/* Stats Cards with Animations */}
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                    <StatCard
                        title="Total Clients"
                        value={totalClients}
                        icon={<Users size={24} />}
                        gradient="from-blue-400 to-blue-600"
                        isDark={isDark}
                        delay="0"
                    />
                    <StatCard
                        title="Current Page"
                        value={currentPage}
                        icon={<Car size={24} />}
                        gradient="from-blue-400 to-blue-600"
                        isDark={isDark}
                        delay="100"
                    />
                    <StatCard
                        title="Page"
                        value={`${currentPage}/${totalPages}`}
                        icon={<Hash size={24} />}
                        gradient="from-blue-400 to-blue-600"
                        isDark={isDark}
                        delay="200"
                    />
                </div>

                {/* Modern Search Bar */}
                <div className="mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <div className="relative group">
                        <Search
                            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isDark ? "text-gray-400 group-focus-within:text-blue-400" : "text-gray-400 group-focus-within:text-blue-500"
                                }`}
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search by name, phone, vehicle, or registration..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-300 ${isDark
                                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:bg-gray-750"
                                : "bg-white border-gray-200 placeholder-gray-400 focus:border-blue-400 shadow-sm hover:shadow-md focus:shadow-lg"
                                } outline-none`}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="mb-4 text-blue-500 animate-spin" size={48} />
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading clients...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className={`flex items-center gap-3 p-5 rounded-xl border-2 animate-shake ${isDark
                        ? "bg-red-900/20 border-red-800 text-red-400"
                        : "bg-red-50 border-red-200 text-red-600"
                        }`}>
                        <AlertCircle size={24} />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {/* CLIENT LIST */}
                {!loading && !error && (
                    <div className="space-y-4">
                        {filteredClients.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed transition-all duration-300 ${isDark ? "border-gray-700 bg-gray-800/50 hover:bg-gray-800/70" : "border-gray-300 bg-white hover:shadow-lg"
                                }`}>
                                <Users size={64} className={`${isDark ? "text-gray-600" : "text-gray-400"} mb-4`} />
                                <p className={`text-lg font-semibold ${isDark ? "text-gray-300" : "text-gray-700"}`}>No clients found</p>
                                <p className="mt-1 text-sm text-gray-500">Try searching again or add a new client</p>
                            </div>
                        ) : (
                            <>
                                {filteredClients.map((client, index) => (
                                    <ClientCard
                                        key={client.id}
                                        client={client}
                                        index={index}
                                        isDark={isDark}
                                        onView={() => navigate(`/client-details/${client.id}`)}
                                        onEdit={() => navigate(`/addclient/${client.id}`)}
                                        onDelete={() => handleDelete(client.id)}
                                    />
                                ))}

                                {/* Modern Pagination */}
                                <div className={`flex items-center justify-between mt-8 pt-6 border-t-2 ${isDark ? "border-gray-700" : "border-gray-200"
                                    }`}>
                                    <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                        Showing 1 - {filteredClients.length} of {totalClients}
                                    </p>
                                    <div className="flex gap-2">
                                        <PaginationButton label="Previous" isDark={isDark} disabled />
                                        <span className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md">
                                            1/1
                                        </span>
                                        <PaginationButton label="Next" isDark={isDark} disabled />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                .animate-shake {
                    animation: shake 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}

// Stat Card Component with Hover Animations
function StatCard({ title, value, icon, gradient, isDark, delay }) {
    return (
        <div
            className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                } border-2 rounded-xl p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group animate-fade-in`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-semibold mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {title}
                    </p>
                    <p className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"} transition-transform duration-300 group-hover:scale-110`}>
                        {value}
                    </p>
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-125 group-hover:rotate-12`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// Client Card with Modern Design
function ClientCard({ client, onView, onEdit, onDelete, isDark, index }) {
    const [imageError, setImageError] = useState(false);

    return (
        <div
            className={`group rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 animate-fade-in ${isDark
                ? "bg-gray-800 border-gray-700 hover:border-blue-500/60"
                : "bg-white border-gray-100 hover:border-blue-400/60"
                }`}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex flex-col gap-5 p-6 md:flex-row">
                {/* Image & Avatar Section */}
                <div className="flex items-start gap-4">
                    {/* Vehicle Image */}
                    <div className="relative flex-shrink-0 overflow-hidden transition-all duration-500 shadow-lg w-36 h-36 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 group-hover:shadow-2xl">
                        {!imageError ? (
                            <img
                                src={client.mainImage || "/no-image.png"}
                                alt={client.fullName}
                                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-125 group-hover:rotate-2"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <Car size={56} className="text-gray-400 transition-transform duration-500 group-hover:scale-110" />
                            </div>
                        )}
                    </div>

                    {/* Client Avatar & Status */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center text-xl font-bold text-white transition-all duration-500 shadow-lg w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 group-hover:scale-110 group-hover:rotate-6">
                            {client.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="px-3 py-1 text-xs font-bold text-white transition-transform duration-300 rounded-full shadow-md bg-gradient-to-r from-green-400 to-green-500 group-hover:scale-110">
                            Active
                        </span>
                    </div>
                </div>

                {/* Client Information */}
                <div className="flex-1 space-y-4">
                    <h3 className={`text-2xl font-bold transition-colors duration-300 ${isDark ? "text-white group-hover:text-blue-400" : "text-gray-900 group-hover:text-blue-600"
                        }`}>
                        {client.fullName}
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <InfoItem
                            icon={<Car size={18} className="text-blue-500" />}
                            label={client.vehicleMake || 'N/A'}
                            isDark={isDark}
                        />
                        <InfoItem
                            icon={<Calendar size={18} className="text-blue-500" />}
                            label={`Year: ${client.year || 'N/A'}`}
                            isDark={isDark}
                        />
                        <InfoItem
                            icon={<Phone size={18} className="text-green-500" />}
                            label={client.phone || 'N/A'}
                            isDark={isDark}
                        />
                        <InfoItem
                            icon={<Mail size={18} className="text-purple-500" />}
                            label={client.email || 'N/A'}
                            isDark={isDark}
                        />
                    </div>

                    <div className="pt-2">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 ${isDark ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                            }`}>
                            <Hash size={16} />
                            {client.regNumber || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-2 md:flex-col">
                    <ActionButton
                        icon={<Eye size={20} />}
                        onClick={onView}
                        isDark={isDark}
                        color="blue"
                        tooltip="View"
                    />
                    <ActionButton
                        icon={<Edit2 size={20} />}
                        onClick={onEdit}
                        isDark={isDark}
                        color="purple"
                        tooltip="Edit"
                    />
                    <ActionButton
                        icon={<Trash2 size={20} />}
                        onClick={onDelete}
                        isDark={isDark}
                        color="red"
                        tooltip="Delete"
                    />
                </div>
            </div>
        </div>
    );
}

// Info Item Component
function InfoItem({ icon, label, isDark }) {
    return (
        <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${isDark ? "bg-gray-700/50 hover:bg-gray-700" : "bg-gray-50 hover:bg-gray-100"
            }`}>
            {icon}
            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {label}
            </span>
        </div>
    );
}

// Action Button with Hover Effects
function ActionButton({ icon, onClick, isDark, color, tooltip }) {
    const colors = {
        blue: isDark
            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 hover:text-blue-300"
            : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700",
        purple: isDark
            ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/40 hover:text-purple-300"
            : "bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700",
        red: isDark
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/40 hover:text-red-300"
            : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
    };

    return (
        <button
            onClick={onClick}
            title={tooltip}
            className={`relative p-3 rounded-xl transition-all duration-300 hover:scale-125 hover:shadow-xl hover:-translate-y-1 ${colors[color]}`}
        >
            {icon}
        </button>
    );
}

// Pagination Button
function PaginationButton({ label, isDark, disabled }) {
    return (
        <button
            disabled={disabled}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${disabled
                ? isDark
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isDark
                    ? "bg-gray-700 text-gray-200 hover:bg-gray-600 hover:shadow-lg hover:-translate-y-0.5"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5"
                }`}
        >
            {label}
        </button>
    );
}