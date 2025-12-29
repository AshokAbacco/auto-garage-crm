import React, { useEffect, useMemo, useState } from "react";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
    FiPlus,
    FiSearch,
    FiFileText,
    FiCheckCircle,
    FiClock,
    FiTrendingUp,
} from "react-icons/fi";
import { IndianRupee } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext"; // Import theme context

const API = import.meta.env.VITE_API_BASE_URL;

export default function WashBillingList() {
    const { isDark } = useTheme(); // Get theme state
    const [billings, setBillings] = useState([]);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(`${API}/api/wash-billing`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(setBillings);
    }, []);

    const filtered = useMemo(() => {
        return billings.filter(b =>
            b.invoiceNumber?.toLowerCase().includes(query.toLowerCase()) ||
            b.washingClient?.fullName?.toLowerCase().includes(query.toLowerCase())
        );
    }, [billings, query]);

    const totalInvoices = billings.length;
    const paidInvoices = billings.filter(b => b.status === "PAID").length;
    const pendingInvoices = billings.filter(b => b.status === "PENDING").length;
    const totalRevenue = billings
        .filter(b => b.status === "PAID")
        .reduce((s, b) => s + Number(b.grandTotal || 0), 0)
        .toFixed(2);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this invoice?")) return;

        try {
            const res = await fetch(`${API}/api/wash-billing/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Delete failed");

            setBillings(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            alert("Failed to delete invoice");
            console.error(err);
        }
    };

    // Button styling function
    const getActionButtonStyles = (type) => {
        const baseStyles = "flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5";

        switch (type) {
            case 'view':
                return `${baseStyles} ${isDark
                    ? "text-blue-400 bg-blue-900/30 hover:bg-blue-900/50"
                    : "text-blue-600 bg-blue-50 hover:bg-blue-100"}`;
            case 'edit':
                return `${baseStyles} ${isDark
                    ? "text-yellow-400 bg-yellow-900/30 hover:bg-yellow-900/50"
                    : "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"}`;
            case 'delete':
                return `${baseStyles} ${isDark
                    ? "text-red-400 bg-red-900/30 hover:bg-red-900/50"
                    : "text-red-600 bg-red-50 hover:bg-red-100"}`;
            default:
                return baseStyles;
        }
    };

    return (
        <div className={`min-h-screen p-6 transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-gray-100"} lg:ml-16`}>
            {/* Header */}
            <div className="flex justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text">
                        Wash Billing
                    </h1>
                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>Manage all washing invoices</p>
                </div>

                <button
                    onClick={() => navigate("/billing/create-invoice")}
                    className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${isDark
                        ? "bg-gradient-to-r from-blue-600 to-indigo-700"
                        : "bg-gradient-to-r from-blue-500 to-indigo-600"
                        }`}
                >
                    <FiPlus /> New Invoice
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                <Stat title="Total Invoices" value={totalInvoices} icon={<FiFileText />} isDark={isDark} />
                <Stat title="Pending" value={pendingInvoices} icon={<FiClock />} isDark={isDark} />
                <Stat title="Paid" value={paidInvoices} icon={<FiCheckCircle />} isDark={isDark} />
                <Stat title="Revenue" value={`₹ ${totalRevenue}`} icon={<IndianRupee />} isDark={isDark} />
            </div>

            {/* Search */}
            <div className="relative max-w-xl mb-6">
                <FiSearch className={`absolute top-4 left-4 ${isDark ? "text-gray-400" : "text-gray-400"}`} />
                <input
                    className={`w-full py-4 pl-12 pr-4 rounded-xl transition-all duration-300 outline-none ${isDark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        }`}
                    placeholder="Search invoice or client..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                {filtered.map(b => (
                    <div
                        key={b.id}
                        className={`flex items-center justify-between p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-white shadow"
                            }`}
                    >
                        <div>
                            <h2 className={`text-xl font-bold ${isDark ? "text-white" : ""}`}>#{b.invoiceNumber}</h2>
                            <p className={isDark ? "text-gray-400" : "text-gray-600"}>{b.washingClient?.fullName}</p>
                            <span className={`text-sm font-semibold ${b.status === "PAID"
                                ? isDark ? "text-green-400" : "text-green-600"
                                : isDark ? "text-orange-400" : "text-orange-500"
                                }`}>
                                {b.status}
                            </span>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                            {/* View */}
                            <button
                                onClick={() => navigate(`/billing/invoice/${b.id}`)}
                                className={getActionButtonStyles('view')}
                                title="View"
                            >
                                <FiEye />
                                View
                            </button>

                            {/* Edit */}
                            <button
                                onClick={() =>
                                    navigate("/billing/create-invoice", {
                                        state: {
                                            isEdit: true,
                                            billing: b, // FULL billing object
                                        },
                                    })
                                }
                                className={getActionButtonStyles('edit')}
                            >
                                <FiEdit2 /> Edit
                            </button>

                            {/* Delete */}
                            <button
                                onClick={() => handleDelete(b.id)}
                                className={getActionButtonStyles('delete')}
                                title="Delete"
                            >
                                <FiTrash2 />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Stat({ title, value, icon, isDark }) {
    return (
        <div className={`p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDark
            ? "bg-gray-800 border border-gray-700"
            : "bg-white shadow"
            }`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={isDark ? "text-gray-400" : "text-gray-500"}>{title}</p>
                    <h2 className={`text-3xl font-bold ${isDark ? "text-white" : ""}`}>{value}</h2>
                </div>
                <div className={`text-2xl ${isDark ? "text-blue-400" : "text-blue-500"}`}>{icon}</div>
            </div>
        </div>
    );
}