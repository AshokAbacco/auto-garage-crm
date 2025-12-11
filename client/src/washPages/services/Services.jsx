// src/ServiceManagement.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench, Filter, IndianRupee, ClipboardX } from "lucide-react";

export default function ServiceManagement() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All Categories");
    const [status, setStatus] = useState("All Status");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const services = [];

    const totalServices = services.length;
    const filteredResults = services.length;
    const totalRevenue = 0;

    const resetFilters = () => {
        setQuery("");
        setCategory("All Categories");
        setStatus("All Status");
        setFromDate("");
        setToDate("");
    };

    const filtered = useMemo(() => {
        return services;
    }, [services, query, category, status, fromDate, toDate]);

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
                    className="inline-flex items-center gap-3 px-4 py-2 font-semibold text-white rounded-full shadow-lg bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] hover:opacity-95"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add New Service
                </button>
            </div>

            {/* Search & Filters */}
            <div className="grid items-center grid-cols-1 gap-4 mb-6 lg:grid-cols-12">
                <div className="lg:col-span-9">
                    <div className="p-4 bg-white border shadow-sm rounded-xl">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
                            </svg>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by client, status, reg number..."
                                className="w-full bg-transparent outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 lg:col-span-3">
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg">
                        <option>All Categories</option>
                        <option>Maintenance</option>
                        <option>Repair</option>
                        <option>Inspection</option>
                    </select>

                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg">
                        <option>All Status</option>
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                    </select>
                </div>

                <div className="flex gap-3 mt-3 lg:col-span-12">
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2 bg-white border rounded-lg" />
                    <span className="self-center text-slate-400">-</span>
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2 bg-white border rounded-lg" />
                    <button onClick={resetFilters} className="px-3 py-2 ml-auto bg-white border rounded-lg">
                        Reset
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
                {/* Total Services */}
                <div className="flex items-center justify-between p-6 bg-white border shadow-sm rounded-xl">
                    <div>
                        <div className="text-sm text-slate-500">Total Services</div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">{totalServices}</div>
                    </div>

                    <div className="flex items-center justify-center w-12 h-12 rounded-lg shadow bg-slate-100">
                        <Wrench className="w-6 h-6 text-sky-600" />
                    </div>
                </div>

                {/* Filtered Results */}
                <div className="flex items-center justify-between p-6 bg-white border shadow-sm rounded-xl">
                    <div>
                        <div className="text-sm text-slate-500">Filtered Results</div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">{filteredResults}</div>
                    </div>

                    <div className="flex items-center justify-center w-12 h-12 rounded-lg shadow bg-slate-100">
                        <Filter className="w-6 h-6 text-green-600" />
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="flex items-center justify-between p-6 bg-white border shadow-sm rounded-xl">
                    <div>
                        <div className="text-sm text-slate-500">Total Revenue</div>
                        <div className="mt-3 text-3xl font-bold text-slate-900">₹{totalRevenue.toFixed(2)}</div>
                    </div>

                    <div className="flex items-center justify-center w-12 h-12 rounded-lg shadow bg-slate-100">
                        <IndianRupee className="w-6 h-6 text-emerald-600" />
                    </div>
                </div>
            </div>

            {/* Empty state / service list */}
            <div className="p-12 bg-white border shadow-sm rounded-xl">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                        {/* Icon */}
                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100">
                            <ClipboardX className="w-8 h-8 text-slate-500" />
                        </div>

                        {/* Title */}
                        <div className="text-xl font-semibold text-slate-700">No services found</div>

                        {/* Subtitle */}
                        <div className="text-sm text-slate-500">
                            Use the search or click{" "}
                            <span className="font-semibold text-[#0ea5e9] cursor-pointer" onClick={() => navigate("/add-service")}>
                                Add New Service
                            </span>{" "}
                            to create one.
                        </div>
                    </div>
                ) : (
                    <div>{/* service list */}</div>
                )}
            </div>
        </div>
    );
}
