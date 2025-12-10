import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

export default function Billing() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("All");
    const navigate = useNavigate();

    const invoices = [];

    const filtered = useMemo(() => {
        if (!query && status === "All") return invoices;
        return invoices;
    }, [query, status]);

    return (
        <div className="min-h-screen p-6 bg-[#f0fbff] text-slate-800">
            {/* HEADER */}
            <div className="mb-6">
                <div className="overflow-hidden shadow-md rounded-xl">
                    <div className="px-8 py-8 bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] rounded-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-4xl font-extrabold text-white">
                                    Billing & Invoices
                                </h1>
                                <p className="mt-2 text-white/90">
                                    Manage invoices and track payments
                                </p>
                            </div>

                            {/* RIGHT SIDE ACTIONS (NO THEME ICON ✅) */}
                            <button
                                onClick={() => navigate("/create-invoice")}
                                className="px-4 py-2 font-medium bg-white rounded-lg shadow-md text-slate-800 hover:opacity-95"
                            >
                                + New Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH + FILTER */}
            <div className="mb-6">
                <div className="p-4 bg-white border shadow-sm rounded-xl">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search invoice number or client..."
                            className="w-full px-4 py-3 border rounded-md"
                        />

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-3 border rounded-md"
                        >
                            <option>All</option>
                            <option>Paid</option>
                            <option>Pending</option>
                            <option>Overdue</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* MAIN PANEL */}
            <div className="p-12 bg-white border shadow-sm rounded-2xl">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center">
                        <div className="w-16 h-16 mb-6 rounded-full bg-[#f0fbff] flex items-center justify-center">
                            <FileText className="w-8 h-8 text-slate-500" />
                        </div>

                        <h3 className="mb-2 text-lg font-semibold text-slate-700">
                            No Invoices Found
                        </h3>

                        <p className="mb-6 text-sm text-slate-400">
                            Create your first invoice to get started.
                        </p>

                        <button
                            onClick={() => navigate("/create-invoice")}
                            className="px-5 py-3 text-white rounded-full shadow-lg bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9]"
                        >
                            Create Invoice
                        </button>
                    </div>
                ) : (
                    <div>{/* invoice table later */}</div>
                )}
            </div>
        </div>
    );
}
