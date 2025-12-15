import React, { useEffect, useState } from "react";
import {
    User,
    Calendar,
    Wrench,
    Upload,
    Lock,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AddNewServiceForm() {
    const [partsCost, setPartsCost] = useState(0);
    const [laborCost, setLaborCost] = useState(0);
    const [status, setStatus] = useState("Pending");

    const [clients, setClients] = useState([]);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [clientsError, setClientsError] = useState(null);
    const [selectedClientId, setSelectedClientId] = useState("");

    const estimatedTotal = partsCost + laborCost;

    // 🔁 Load all washing clients on mount
    useEffect(() => {
        const fetchClients = async () => {
            try {
                setClientsLoading(true);

                const token = localStorage.getItem("token");
                if (!token) {
                    setClientsError("You are not logged in");
                    setClientsLoading(false);
                    return;
                }

                const res = await fetch(`${API_BASE}/api/washing-clients`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to load clients");
                }

                const data = await res.json();
                setClients(data);
            } catch (err) {
                setClientsError(err.message || "Failed to load clients");
            } finally {
                setClientsLoading(false);
            }
        };

        fetchClients();
    }, []);

    return (
        <div className="min-h-screen p-6 bg-gray-50 md:p-10">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 mb-6 bg-white shadow-sm rounded-2xl">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Add New Service
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage your service record easily
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="p-6 space-y-6 bg-white shadow-sm rounded-2xl">

                    {/* Client */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            <User className="w-4 h-4" />
                            Client
                        </label>

                        <select
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100"
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            disabled={clientsLoading || !!clientsError}
                        >
                            {clientsLoading && (
                                <option>Loading clients...</option>
                            )}
                            {!clientsLoading && !clientsError && (
                                <>
                                    <option value="">Select Client</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.fullName}
                                        </option>
                                    ))}
                                </>
                            )}
                            {clientsError && (
                                <option>{clientsError}</option>
                            )}
                        </select>
                    </div>

                    {/* Date + Category */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                <Calendar className="w-4 h-4" />
                                Date
                            </label>
                            <input
                                type="date"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                <Wrench className="w-4 h-4" />
                                Service Category
                            </label>
                            <select className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100">
                                <option>Select Category</option>
                            </select>
                        </div>
                    </div>

                    {/* Sub-service */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            <Wrench className="w-4 h-4" />
                            Sub-Service
                        </label>
                        <select className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-100">
                            <option>Select Sub-Service</option>
                        </select>
                    </div>

                    {/* Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-800">
                            Upload Media
                        </label>
                        <div className="flex items-center overflow-hidden border rounded-lg border-slate-300">
                            <button
                                type="button"
                                className="flex items-center gap-2 px-3 py-2.5 border-r bg-slate-50"
                            >
                                <Upload className="w-4 h-4" />
                                Choose Files
                            </button>
                            <span className="px-3 py-2.5 text-slate-400">
                                No file chosen
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm font-semibold">
                            Estimated Total:
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-lg font-semibold text-emerald-600">
                                ₹{estimatedTotal.toFixed(2)}
                            </div>

                            <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-full">
                                <Lock className="w-4 h-4" />
                                Create Service
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
