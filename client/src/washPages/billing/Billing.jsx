// src/Billing.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, FileText } from "lucide-react";

export default function Billing() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("All");
    const [isDark, setIsDark] = useState(false);
    const navigate = useNavigate();

    const invoices = [];

    const filtered = useMemo(() => {
        // keep simple filter for now (expand later)
        if (!query && status === "All") return invoices;
        return invoices.filter((inv) => {
            const q = query.trim().toLowerCase();
            const matchesQuery =
                !q ||
                String(inv.invoiceNumber || "").toLowerCase().includes(q) ||
                String(inv.clientName || "").toLowerCase().includes(q) ||
                String(inv.note || "").toLowerCase().includes(q);
            const matchesStatus = status === "All" || (inv.status || "") === status;
            return matchesQuery && matchesStatus;
        });
    }, [invoices, query, status]);

    return (
        <div className={isDark ? "min-h-screen p-6 bg-slate-900 text-slate-100" : "min-h-screen p-6 bg-[#f0fbff] text-slate-800"}>
            {/* Header */}
            <div className="mb-6">
                <div className="overflow-hidden shadow-md rounded-xl">
                    <div className="px-8 py-8 bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] rounded-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-white md:text-4xl">Billing & Invoices</h1>
                                <p className="mt-2 text-white/90">Manage invoices and track payments efficiently</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Dark toggle */}
                                <button
                                    type="button"
                                    onClick={() => setIsDark((prev) => !prev)}
                                    className={`flex items-center justify-center w-9 h-9 rounded-full border bg-white/90 shadow ${isDark ? "border-yellow-400" : "border-slate-200"}`}
                                    aria-label="Toggle theme"
                                >
                                    {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-500" />}
                                </button>

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
            </div>

            {/* Search + Filter */}
            <div className="mb-6">
                <div className={isDark ? "p-4 bg-slate-800 border border-slate-700 shadow-sm rounded-xl" : "p-4 bg-white border shadow-sm rounded-xl"}>
                    <div className="grid items-center grid-cols-1 gap-4 lg:grid-cols-6">
                        <div className="lg:col-span-4">
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search invoice number, client or note..."
                                className={
                                    isDark
                                        ? "w-full px-4 py-3 border rounded-md bg-slate-900/60 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                        : "w-full px-4 py-3 border rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                }
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={isDark ? "w-full px-4 py-3 bg-slate-900/60 border border-slate-600 rounded-md text-slate-100" : "w-full px-4 py-3 bg-white border rounded-md"}
                            >
                                <option>All</option>
                                <option>Paid</option>
                                <option>Pending</option>
                                <option>Overdue</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Panel */}
            <div className={isDark ? "p-12 bg-slate-800 border border-slate-700 shadow-sm rounded-2xl" : "p-12 bg-white border shadow-sm rounded-2xl"}>
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className={`w-16 h-16 mb-6 rounded-full ${isDark ? "bg-slate-700" : "bg-[#f0fbff]"} flex items-center justify-center`}>
                            <FileText className={isDark ? "w-8 h-8 text-slate-100" : "w-8 h-8 text-slate-500"} />
                        </div>

                        <h3 className={isDark ? "mb-2 text-lg font-semibold text-slate-100" : "mb-2 text-lg font-semibold text-slate-700"}>No Invoices Found</h3>

                        <p className="mb-6 text-sm text-slate-400">Try adjusting your filters or create a new invoice.</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate("/create-invoice")}
                                className="inline-flex items-center gap-2 px-5 py-3 text-white rounded-full shadow-lg bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9]"
                            >
                                Create Invoice
                            </button>


                        </div>
                    </div>
                ) : (
                    <div>{/* Invoice table / list goes here */}</div>
                )}
            </div>
        </div>
    );
}
