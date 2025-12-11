import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Calendar,
    Wrench,
    Upload,
    Lock,
} from "lucide-react";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AddNewServiceForm() {
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [clientId, setClientId] = useState("");

    const [partsCost, setPartsCost] = useState(0);
    const [laborCost, setLaborCost] = useState(0);

    const estimatedTotal = partsCost + laborCost;

    /* ✅ Fetch clients on load */
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch(`${API_BASE}/api/washing-clients`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to load clients");

                const data = await res.json();
                setClients(data);
            } catch (err) {
                console.error(err.message);
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
                            Add New Subservice
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage your service record easily
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div className="p-6 space-y-6 bg-white shadow-sm rounded-2xl">

                    {/* ✅ Client Dropdown */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <User className="w-4 h-4" /> Client
                        </label>

                        <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2.5 text-sm"
                        >
                            <option value="">Select Client</option>

                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.fullName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date + Category */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            type="date"
                            className="rounded-lg border px-3 py-2.5 text-sm"
                        />
                        <select className="rounded-lg border px-3 py-2.5 text-sm">
                            <option>Select Category</option>
                        </select>
                    </div>

                    {/* Sub-Service */}
                    <select className="rounded-lg border px-3 py-2.5 text-sm">
                        <option>Select Sub-Service</option>
                    </select>

                    {/* Upload */}
                    <div className="flex items-center border rounded-lg">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-2.5 border-r bg-slate-50"
                        >
                            <Upload className="w-4 h-4" /> Choose File
                        </button>
                        <span className="px-3 text-slate-400">
                            No file chosen
                        </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t">
                        <span className="font-semibold">Estimated Total:</span>
                        <div className="flex items-center gap-4">
                            <span className="text-lg font-semibold text-emerald-600">
                                ₹{estimatedTotal.toFixed(2)}
                            </span>
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-full"
                                disabled={!clientId}
                            >
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
