// src/ServiceManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Wrench,
    Filter,
    IndianRupee,
    ClipboardX
} from "lucide-react";

export default function ServiceManagement() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [status, setStatus] = useState("All Status");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [services, setServices] = useState([]);

    // ---------------- FETCH SERVICES ----------------
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/washing-services`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const data = await res.json();
                setServices(data);
            } catch (err) {
                console.error("Failed to load services", err);
            }
        };

        fetchServices();
    }, []);

    // ---------------- DELETE SERVICE ----------------
    const handleDelete = async (id) => {
        if (!confirm("Delete this service?")) return;

        try {
            const token = localStorage.getItem("token");

            await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/washing-services/${id}`,
                { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
            );

            setServices((prev) => prev.filter((s) => s.id !== id));
            alert("Service deleted");
        } catch (err) {
            console.error(err);
            alert("Error deleting service");
        }
    };

    // ---------------- FILTER ----------------
    const filtered = useMemo(() => {
        return services.filter((s) =>
            `${s.client?.fullName} ${s.category?.name} ${s.subService?.name}`
                .toLowerCase()
                .includes(query.toLowerCase())
        );
    }, [services, query]);

    // ---------------- TOP METRIC CALCULATIONS ----------------
    const totalServices = services.length;
    const filteredResults = filtered.length;
    const totalRevenue = Number(
        services.reduce((sum, s) => sum + (Number(s.estimatedTotal) || 0), 0)
    );

    // ------------------- SERVICE CARD (MATCHES SCREENSHOT) --------------------
    const ServiceCard = ({ service }) => (
        <div className="flex justify-between p-5 mb-4 transition-all bg-white border shadow-sm rounded-xl hover:shadow-md">

            {/* LEFT SIDE */}
            <div>
                <h2 className="text-lg font-bold text-slate-900">
                    {service.subService?.name}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                    {service.category?.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                    {service.client?.fullName}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                    {new Date(service.date).toLocaleDateString()}
                </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="text-right">
                {/* Status Pill */}
                <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${service.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {service.status === "COMPLETED" ? "Completed" : "Pending"}
                </span>

                {/* Amount */}
                <p className="mt-3 text-lg font-bold text-emerald-600">
                    ₹{service.estimatedTotal}
                </p>

                {/* Buttons */}
                <div className="flex flex-col items-end gap-2 mt-2">
                    <button
                        onClick={() => navigate(`/wservices-details/${service.id}`)}
                        className="text-sm text-sky-600 hover:underline"
                    >
                        View Details →
                    </button>


                    <button
                        onClick={() => handleDelete(service.id)}
                        className="text-sm text-red-500 hover:underline"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    // ---------------- UI ----------------
    return (
        <div className="min-h-screen p-8 bg-[#f0fbff]">

            {/* Header */}
            <div className="flex items-center justify-between p-6 mb-6 bg-white shadow-md rounded-xl">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">Service Management</h1>
                    <p className="mt-1 text-sm text-slate-500">Track and manage all service records</p>
                </div>

                <button
                    onClick={() => navigate("/add-service")}
                    className="inline-flex items-center gap-3 px-4 py-2 font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9]"
                >
                    + Add New Service
                </button>
            </div>

            {/* Search Box */}
            <div className="p-4 mb-6 bg-white border shadow-sm rounded-xl">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by service, client, status..."
                    className="w-full bg-transparent outline-none"
                />
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3 lg:grid-cols-4">

                {/* Total Services */}
                <div className="flex items-center justify-between p-5 bg-white border shadow-sm rounded-xl">
                    <div>
                        <p className="text-sm text-slate-500">Total Services</p>
                        <h2 className="text-3xl font-bold text-slate-900">{totalServices}</h2>
                    </div>
                    <Wrench className="w-8 h-8 text-sky-500" />
                </div>

                {/* Filtered Results */}
                <div className="flex items-center justify-between p-5 bg-white border shadow-sm rounded-xl">
                    <div>
                        <p className="text-sm text-slate-500">Filtered Results</p>
                        <h2 className="text-3xl font-bold text-slate-900">{filteredResults}</h2>
                    </div>
                    <Filter className="w-8 h-8 text-green-500" />
                </div>

                {/* Completed */}
                <div className="flex items-center justify-between p-5 bg-white border shadow-sm rounded-xl">
                    <div>
                        <p className="text-sm text-slate-500">Completed</p>
                        <h2 className="text-3xl font-bold text-slate-900">
                            {services.filter((s) => s.status === "COMPLETED").length}
                        </h2>
                    </div>
                    <span className="text-xl text-green-500">✔</span>
                </div>

                {/* Total Revenue */}
                <div className="flex items-center justify-between p-5 bg-white border shadow-sm rounded-xl">
                    <div>
                        <p className="text-sm text-slate-500">Total Revenue</p>
                        <h2 className="text-3xl font-bold text-emerald-600">
                            ₹{totalRevenue.toFixed(2)}
                        </h2>
                    </div>
                    <IndianRupee className="w-8 h-8 text-emerald-600" />
                </div>
            </div>

            {/* Service Cards */}
            {filtered.length === 0 ? (
                <div className="py-20 text-center">
                    <ClipboardX className="w-10 h-10 mx-auto text-slate-400" />
                    <p className="mt-4 text-slate-500">No services found</p>
                </div>
            ) : (
                filtered.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                ))
            )}
        </div>
    );
}
