import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, IndianRupee, Search, PlusCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { Toaster, toast } from "react-hot-toast";

const API = import.meta.env.VITE_API_BASE_URL;

export default function ServiceManagement() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [services, setServices] = useState([]);
    const [query, setQuery] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* ================= FETCH SERVICES ================= */
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                if (!token) {
                    setError("No authentication token found");
                    return;
                }

                const res = await fetch(`${API}/api/washing-services`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    if (res.status === 401) {
                        setError("Session expired. Please login again.");
                        localStorage.removeItem("token");
                        return;
                    }
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setServices(Array.isArray(data) ? data : []);
                setError(null);
            } catch (err) {
                console.error("Failed to load services", err);
                setError(err.message || "Failed to load services");
                setServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    /* ================= FILTER ================= */
    const filtered = useMemo(() => {
        if (!services || services.length === 0) return [];
        return services.filter((s) => {
            const q = query.toLowerCase();
            return (
                s.subService?.name?.toLowerCase().includes(q) ||
                s.category?.name?.toLowerCase().includes(q) ||
                s.client?.fullName?.toLowerCase().includes(q)
            );
        });
    }, [services, query]);

    /* ================= STATS ================= */
    const totalServices = services.length;
    const completedServices = services.filter(
        (s) => s.status === "COMPLETED"
    ).length;
    const totalRevenue = services.reduce((sum, s) => {
        const cost = Number(s.partsCost || 0);
        const gst = Number(s.partsGst || 0);
        return sum + cost + (cost * gst) / 100;
    }, 0);

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this service? This action cannot be undone.")) return;

        setIsDeleting(true);

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${API}/api/washing-services/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: "Delete failed" }));
                throw new Error(errorData.message || `HTTP ${res.status}: Delete failed`);
            }

            setServices((prevServices) =>
                prevServices.filter((service) => service.id !== id)
            );

            toast.success("Service deleted successfully!");

        } catch (err) {
            console.error("Delete error:", err);
            toast.error(`Failed to delete service: ${err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    /* ================= SERVICE CARD ================= */
    const ServiceCard = ({ service, index }) => {
        const cost = Number(service.partsCost || 0);
        const gst = Number(service.partsGst || 0);
        const estimatedTotal = cost + (cost * gst) / 100;

        return (
            <div
                className={`flex justify-between p-5 mb-4 transition-all duration-300 rounded-xl border-2 hover:shadow-lg hover:-translate-y-1 ${isDark
                    ? "bg-gray-800 border-gray-700 hover:border-blue-500/60"
                    : "bg-white border-gray-100 hover:border-blue-400/60 shadow-sm"
                    }`}
                style={{ animationDelay: `${index * 50}ms` }}
            >
                {/* LEFT */}
                <div>
                    <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        {service.subService?.name || "Service"}
                    </h2>

                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-600"}`}>
                        {service.category?.name || "Category"}
                    </p>

                    <p className={`text-sm ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                        {service.client?.fullName || "Client"}
                    </p>

                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-slate-400"}`}>
                        {service.date
                            ? new Date(service.date).toLocaleDateString()
                            : "—"}
                    </p>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                    <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${service.status === "COMPLETED"
                            ? isDark
                                ? "bg-green-900/30 text-green-400"
                                : "bg-green-100 text-green-700"
                            : isDark
                                ? "bg-yellow-900/30 text-yellow-400"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                    >
                        {service.status === "COMPLETED" ? "Completed" : "Pending"}
                    </span>

                    <p className={`mt-3 text-lg font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                        ₹{estimatedTotal.toFixed(2)}
                    </p>

                    <div className="flex flex-col items-end gap-2 mt-2">
                        <button
                            onClick={() =>
                                navigate(`/wservices-details/${service.id}`)
                            }
                            className={`text-sm hover:underline ${isDark ? "text-sky-400" : "text-sky-600"}`}
                        >
                            View Details →
                        </button>

                        <button
                            onClick={() => handleDelete(service.id)}
                            disabled={isDeleting}
                            className={`text-sm hover:underline ${isDeleting
                                ? "opacity-50 cursor-not-allowed"
                                : isDark ? "text-red-400" : "text-red-500"
                                }`}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /* ================= UI ================= */
    return (
        <div className={`min-h-screen p-8 transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-[#f0fbff]"}`}>
            <Toaster position="top-right" />

            {/* HEADER */}
            <div className={`flex items-center justify-between p-6 mb-6 rounded-xl transition-all duration-300 ${isDark ? "bg-gray-800 shadow-xl" : "bg-white shadow-md"
                }`}>
                <div>
                    <h1 className={`text-3xl font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                        Service Management
                    </h1>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                        Track and manage all service records
                    </p>
                </div>

                <button
                    onClick={() => navigate("/add-service")}
                    className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${isDark
                        ? "bg-gradient-to-r from-sky-500 to-sky-700 text-white"
                        : "bg-gradient-to-r from-sky-400 to-sky-600 text-white"
                        }`}
                >
                    <PlusCircle
                        size={18}
                        className="transition-transform duration-300 group-hover:rotate-90"
                    />
                    Add New Service
                </button>
            </div>

            {/* SEARCH */}
            <div className={`p-4 mb-6 rounded-xl transition-all duration-300 ${isDark ? "bg-gray-800 shadow-lg" : "bg-white shadow-md"
                }`}>
                <div className="relative">
                    <Search
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                        size={20}
                    />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search service, category or client..."
                        className={`w-full pl-10 outline-none transition-all duration-300 ${isDark
                            ? "bg-transparent text-white placeholder-gray-500"
                            : "bg-transparent text-gray-900 placeholder-gray-500"
                            }`}
                    />
                </div>
            </div>

            {/* STATS */}
            <div className="grid gap-6 mb-10 md:grid-cols-3">
                <Stat
                    title="Total Services"
                    value={totalServices}
                    icon={<Wrench />}
                    isDark={isDark}
                    delay="0"
                />
                <Stat
                    title="Completed"
                    value={completedServices}
                    icon={"✓"}
                    isDark={isDark}
                    delay="100"
                />
                <Stat
                    title="Total Revenue"
                    value={`₹${totalRevenue.toFixed(2)}`}
                    icon={<IndianRupee />}
                    isDark={isDark}
                    delay="200"
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <RefreshCw className={`mb-4 animate-spin ${isDark ? "text-blue-400" : "text-blue-500"}`} size={48} />
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading services...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className={`flex items-center gap-3 p-5 rounded-xl border-2 ${isDark
                    ? "bg-red-900/20 border-red-800 text-red-400"
                    : "bg-red-50 border-red-200 text-red-600"
                    }`}>
                    <AlertCircle size={24} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {/* LIST */}
            {!loading && !error && (
                <>
                    {filtered.length === 0 ? (
                        <div className={`p-10 text-center rounded-xl transition-all duration-300 ${isDark ? "bg-gray-800 text-gray-400" : "bg-white text-slate-500"
                            }`}>
                            No services found
                        </div>
                    ) : (
                        filtered.map((s, index) => <ServiceCard key={s.id} service={s} index={index} />)
                    )}
                </>
            )}
        </div>
    );
}

/* ================= STAT CARD ================= */
function Stat({ title, value, icon, isDark, delay }) {
    return (
        <div
            className={`flex items-center justify-between p-5 rounded-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${isDark
                ? "bg-gray-800 border-2 border-gray-700 hover:border-blue-500/60"
                : "bg-white shadow-md border-2 border-gray-100 hover:border-blue-400/60"
                }`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>{title}</p>
                <h2 className={`text-3xl font-bold transition-transform duration-300 hover:scale-110 ${isDark ? "text-white" : "text-slate-900"
                    }`}>{value}</h2>
            </div>
            <div className={`text-2xl transition-all duration-500 hover:scale-125 hover:rotate-12 ${isDark ? "text-sky-400" : "text-sky-500"
                }`}>{icon}</div>
        </div>
    );
}