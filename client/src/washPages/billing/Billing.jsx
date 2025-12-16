// src/washPages/billing/Billing.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Phone, Mail, Calendar, User, FileCheck, Eye, Edit, Trash2 } from "lucide-react";

export default function Billing() {
    const [invoices, setInvoices] = useState([]);
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("All");
    const navigate = useNavigate();

    /* ---------------- LOAD INVOICES FROM SERVICES ---------------- */
    useEffect(() => {
        const fetchServicesAndCreateInvoices = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/api/washing-services`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const services = await res.json();

                // Transform services into invoice format
                const transformedInvoices = services.map((service) => ({
                    id: service.id,
                    invoiceNumber: `INV-${service.id}${Date.now()}`.substring(0, 20),
                    clientName: service.client?.fullName || "N/A",
                    phone: service.client?.phone || "",
                    email: service.client?.email || "",
                    invoiceDate: new Date(service.date).toLocaleDateString('en-GB'),
                    dueDate: service.dueDate
                        ? new Date(service.dueDate).toLocaleDateString('en-GB')
                        : "No Due Date",
                    amount: service.estimatedTotal || 0,
                    status: service.status === "COMPLETED" ? "Paid" : "Pending",
                    serviceNotes: `${service.category?.name} - ${service.subService?.name}`,
                    createdAt: new Date(service.createdAt || service.date).toLocaleDateString('en-GB'),
                    serviceDetails: {
                        category: service.category?.name,
                        subService: service.subService?.name,
                        originalServiceId: service.id
                    }
                }));

                setInvoices(transformedInvoices);
            } catch (err) {
                console.error("Failed to load services", err);
            }
        };

        fetchServicesAndCreateInvoices();
    }, []);

    /* ---------------- FILTER LOGIC ---------------- */
    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const q = query.toLowerCase();

            const matchesQuery =
                inv.invoiceNumber?.toLowerCase().includes(q) ||
                inv.clientName?.toLowerCase().includes(q) ||
                inv.email?.toLowerCase().includes(q);

            const matchesStatus =
                status === "All" || inv.status === status;

            return matchesQuery && matchesStatus;
        });
    }, [query, status, invoices]);

    /* ---------------- DELETE ---------------- */
    const deleteInvoice = async (id) => {
        if (!confirm("Delete this invoice?")) return;

        try {
            const token = localStorage.getItem("token");

            await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/washing-services/${id}`,
                { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
            );

            setInvoices((prev) => prev.filter((inv) => inv.id !== id));
            alert("Invoice deleted");
        } catch (err) {
            console.error(err);
            alert("Error deleting invoice");
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="min-h-screen p-6 bg-[#f0fbff]">

            {/* HEADER */}
            <div className="mb-6">
                <div className="px-8 py-8 shadow rounded-xl bg-gradient-to-r from-sky-400 to-cyan-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold text-white">
                                Billing & Invoices
                            </h1>

                            <p className="mt-1 text-white/90">
                                Manage invoices and track payments
                            </p>
                        </div>

                        {/* CREATE INVOICE */}
                        <button
                            onClick={() => navigate("/billing/create-invoice")}
                            className="px-5 py-2 text-sm font-semibold bg-white rounded-lg shadow text-sky-600 hover:bg-sky-50"
                        >
                            + New Invoice
                        </button>
                    </div>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="p-4 mb-6 bg-white shadow rounded-xl">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search invoice number or client..."
                        className="px-4 py-3 border rounded-lg"
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-4 py-3 border rounded-lg"
                    >
                        <option>All</option>
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Partially Paid</option>
                    </select>
                </div>
            </div>

            {/* INVOICE LIST */}
            <div className="space-y-4">
                {filteredInvoices.length === 0 ? (
                    <div className="py-20 text-center text-slate-500">
                        No invoices found
                    </div>
                ) : (
                    filteredInvoices.map((inv) => (
                        <div
                            key={inv.id}
                            className="p-6 bg-white border shadow-sm rounded-xl"
                        >
                            {/* HEADER ROW */}
                            <div className="flex items-center justify-between mb-4">
                                {/* Left: Icon + Invoice Info */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 text-white rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500">
                                        <FileText size={24} />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Invoice #{inv.invoiceNumber}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Created on {inv.createdAt}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Status Badge */}
                                <span
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-full
                                        ${inv.status === "Paid"
                                            ? "bg-green-100 text-green-700"
                                            : inv.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-blue-100 text-blue-700"
                                        }`}
                                >
                                    {inv.status}
                                </span>
                            </div>

                            {/* DETAILS ROW */}
                            <div className="flex items-center justify-between py-4 border-t border-b">
                                {/* Client Name */}
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-sky-500" />
                                    <span className="font-medium text-slate-900">
                                        {inv.clientName}
                                    </span>
                                </div>

                                {/* Invoice Date */}
                                <div className="flex items-center gap-2">
                                    <FileCheck size={16} className="text-pink-500" />
                                    <span className="text-sm text-slate-600">—</span>
                                </div>

                                {/* Due Date */}
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-emerald-500" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {inv.dueDate}
                                    </span>
                                </div>

                                {/* Amount */}
                                <div className="text-right">
                                    <span className="text-xl font-bold text-emerald-600">
                                        ₹ {Number(inv.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>

                            {/* SERVICE NOTES */}
                            {inv.serviceNotes && (
                                <div className="py-3">
                                    <p className="text-sm text-slate-600">
                                        {inv.serviceNotes}
                                    </p>
                                </div>
                            )}

                            {/* FOOTER ROW */}
                            <div className="flex items-center justify-between pt-4">
                                {/* Contact Info */}
                                <div className="flex gap-4 text-sm text-slate-600">
                                    {inv.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone size={14} /> {inv.phone}
                                        </span>
                                    )}
                                    {inv.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail size={14} /> {inv.email}
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            navigate("/billing/invoice/:id")
                                        }
                                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                    >
                                        <Eye size={16} /> View
                                    </button>

                                    <button
                                        onClick={() =>
                                            navigate(`/billing/edit-invoice/${inv.id}`)
                                        }
                                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
                                    >
                                        <Edit size={16} /> Edit
                                    </button>

                                    <button
                                        onClick={() => deleteInvoice(inv.id)}
                                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}