import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";

const API = import.meta.env.VITE_API_BASE_URL;

function Reports() {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState("analytics");
    const [billings, setBillings] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper function to apply conditional classes based on theme
    const getStyles = (lightClasses, darkClasses) => {
        return isDark ? darkClasses : lightClasses;
    };

    // Fetch data
    useEffect(() => {
        const token = localStorage.getItem("token");

        setLoading(true);
        Promise.all([
            fetch(`${API}/api/wash-billing`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json()),

            fetch(`${API}/api/washing-services`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json()),
        ])
            .then(([billingData, serviceData]) => {
                setBillings(Array.isArray(billingData) ? billingData : []);
                setServices(Array.isArray(serviceData) ? serviceData : []);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Calculate stats
    const paidRevenue = billings
        .filter(b => b.status === "PAID")
        .reduce((s, b) => s + Number(b.grandTotal || 0), 0);

    const pendingRevenue = billings
        .filter(b => b.status === "PENDING")
        .reduce((s, b) => s + Number(b.grandTotal || 0), 0);

    const totalRevenue = paidRevenue + pendingRevenue;

    const totalServices = services.length;

    const completedServices = services.filter(
        s => s.status === "COMPLETED"
    ).length;

    const pendingServices = services.filter(
        s => s.status === "PENDING"
    ).length;

    const serviceRevenue = services.reduce((sum, s) => {
        const cost = Number(s.partsCost || 0);
        const gst = Number(s.partsGst || 0);
        return sum + cost + (cost * gst) / 100;
    }, 0);

    const avgServiceCost = totalServices > 0 ? serviceRevenue / totalServices : 0;

    // Chart data - Revenue Over Time (by month)
    const revenueByMonth = billings
        .filter(b => b.status === "PAID")
        .reduce((acc, b) => {
            const date = new Date(b.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!acc[monthKey]) {
                acc[monthKey] = 0;
            }
            acc[monthKey] += Number(b.grandTotal || 0);
            return acc;
        }, {});

    const revenueChartData = Object.entries(revenueByMonth)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => a.month.localeCompare(b.month));

    // Invoice Status Distribution
    const invoiceStatusData = [
        { name: "Paid", value: billings.filter(b => b.status === "PAID").length, color: "#4f46e5" },
        { name: "Pending", value: billings.filter(b => b.status === "PENDING").length, color: "#f59e0b" },
    ];

    // Service Status Distribution
    const serviceStatusData = [
        { name: "Completed", value: completedServices, color: "#4f46e5" },
        { name: "Pending", value: pendingServices, color: "#f59e0b" },
    ];

    // Top Services by Revenue
    const servicesByCategory = services.reduce((acc, s) => {
        const categoryName = s.category?.name || "Unknown";
        const cost = Number(s.partsCost || 0);
        const gst = Number(s.partsGst || 0);
        const total = cost + (cost * gst) / 100;

        if (!acc[categoryName]) {
            acc[categoryName] = 0;
        }
        acc[categoryName] += total;
        return acc;
    }, {});

    const topServicesData = Object.entries(servicesByCategory)
        .map(([category, revenue]) => ({ category, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // Top Clients by Spending
    const clientSpending = billings.reduce((acc, b) => {
        const clientName = b.washingClient?.fullName || "Unknown";
        const amount = Number(b.grandTotal || 0);

        if (!acc[clientName]) {
            acc[clientName] = 0;
        }
        acc[clientName] += amount;
        return acc;
    }, {});

    const topClientsData = Object.entries(clientSpending)
        .map(([client, spending]) => ({ client, spending }))
        .sort((a, b) => b.spending - a.spending)
        .slice(0, 5);

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-lg shadow-lg border transition-all duration-300 ${getStyles(
                    "bg-white text-gray-900 border-gray-200",
                    "bg-gray-800 text-white border-gray-700"
                )}`}>
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm">₹{payload[0].value.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    // Button styling function
    const getTabButtonStyles = (isActive) => {
        if (isActive) {
            return "text-white bg-gradient-to-r from-sky-400 to-cyan-500 shadow-lg";
        }
        return getStyles(
            "bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-400",
            "bg-gray-700 border-2 border-gray-600 text-white hover:bg-gray-600 hover:border-blue-500"
        );
    };

    if (loading) {
        return (
            <div className={`min-h-screen p-8 flex items-center justify-center transition-all duration-300 ${getStyles(
                "bg-[#f0fbff]",
                "bg-gray-900"
            )}`}>
                <div className={`text-xl ${getStyles("text-slate-600", "text-gray-300")}`}>Loading reports...</div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-8 transition-all duration-300 ${getStyles(
            "bg-[#f0fbff] text-slate-800",
            "bg-gray-900 text-gray-100"
        )}`}>
            {/* Top tabs */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-6 py-3 font-medium rounded-full shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${getTabButtonStyles(activeTab === 'analytics')}`}
                >
                    Analytics
                </button>

                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-6 py-3 font-medium rounded-full shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${getTabButtonStyles(activeTab === 'reports')}`}
                >
                    Reports
                </button>
            </div>

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-8">
                    {/* Top Revenue Cards */}
                    <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
                        <div className={`p-6 transition-all duration-300 ${getStyles(
                            "bg-white border-gray-200",
                            "bg-gray-800 border-gray-700"
                        )} shadow rounded-xl hover:shadow-xl hover:-translate-y-1`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`text-sm ${getStyles("text-gray-600", "text-gray-400")}`}>Total Revenue</div>
                                    <div className={`mt-2 text-2xl font-bold ${getStyles("text-gray-900", "text-white")}`}>
                                        ₹ {totalRevenue.toFixed(2)}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#29BAED]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#29BAED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 transition-all duration-300 ${getStyles(
                            "bg-white border-gray-200",
                            "bg-gray-800 border-gray-700"
                        )} shadow rounded-xl hover:shadow-xl hover:-translate-y-1`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`text-sm ${getStyles("text-gray-600", "text-gray-400")}`}>Paid Revenue</div>
                                    <div className={`mt-2 text-2xl font-bold ${getStyles("text-gray-900", "text-white")}`}>₹ {paidRevenue.toFixed(2)}</div>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#29BAED]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#29BAED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 transition-all duration-300 ${getStyles(
                            "bg-white border-gray-200",
                            "bg-gray-800 border-gray-700"
                        )} shadow rounded-xl hover:shadow-xl hover:-translate-y-1`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`text-sm ${getStyles("text-gray-600", "text-gray-400")}`}>Pending Revenue</div>
                                    <div className={`mt-2 text-2xl font-bold ${getStyles("text-gray-900", "text-white")}`}>₹ {pendingRevenue.toFixed(2)}</div>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#29BAED]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#29BAED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Stats */}
                    <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div className={`p-5 transition-all duration-300 ${getStyles(
                            "bg-white border-gray-200",
                            "bg-gray-800 border-gray-700"
                        )} shadow rounded-xl hover:shadow-xl hover:-translate-y-1`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`text-sm ${getStyles("text-gray-600", "text-gray-400")}`}>Total Services</div>
                                    <div className={`mt-2 text-2xl font-bold ${getStyles("text-gray-900", "text-white")}`}>{totalServices}</div>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#29BAED]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#29BAED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className={`p-5 transition-all duration-300 ${getStyles(
                            "bg-white border-gray-200",
                            "bg-gray-800 border-gray-700"
                        )} shadow rounded-xl hover:shadow-xl hover:-translate-y-1`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`text-sm ${getStyles("text-gray-600", "text-gray-400")}`}>Completed</div>
                                    <div className={`mt-2 text-2xl font-bold ${getStyles("text-gray-900", "text-white")}`}>{completedServices}</div>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#29BAED]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#29BAED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className={`p-5 transition-all duration-300 ${getStyles(
                            "bg-white border-gray-200",
                            "bg-gray-800 border-gray-700"
                        )} shadow rounded-xl hover:shadow-xl hover:-translate-y-1`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`text-sm ${getStyles("text-gray-600", "text-gray-400")}`}>Pending</div>
                                    <div className={`mt-2 text-2xl font-bold ${getStyles("text-gray-900", "text-white")}`}>{pendingServices}</div>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#29BAED]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#29BAED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className={`p-5 transition-all duration-300 ${getStyles(
                            "bg-white border-gray-200",
                            "bg-gray-800 border-gray-700"
                        )} shadow rounded-xl hover:shadow-xl hover:-translate-y-1`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`text-sm ${getStyles("text-gray-600", "text-gray-400")}`}>Avg Service Cost</div>
                                    <div className={`mt-2 text-2xl font-bold ${getStyles("text-gray-900", "text-white")}`}>₹ {avgServiceCost.toFixed(2)}</div>
                                </div>
                                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#29BAED]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#29BAED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Over Time Chart */}
                    <div className={`overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${getStyles(
                        "border-slate-100",
                        "border-gray-700"
                    )}`}>
                        <div className="px-6 py-5 text-white bg-gradient-to-r from-sky-400 to-cyan-500">
                            <h3 className="text-xl font-semibold">Revenue Over Time</h3>
                            <p className="text-sm opacity-90">Monthly revenue from invoices</p>
                        </div>

                        <div className={`p-8 ${getStyles("bg-white", "bg-gray-800")}`}>
                            {revenueChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={revenueChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={getStyles("#e5e7eb", "#374151")} />
                                        <XAxis dataKey="month" stroke={getStyles("#6b7280", "#9ca3af")} />
                                        <YAxis stroke={getStyles("#6b7280", "#9ca3af")} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className={`flex items-center justify-center min-h-[300px] ${getStyles("text-slate-400", "text-gray-400")}`}>
                                    No revenue data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Invoice Status Distribution */}
                        <div className={`overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${getStyles(
                            "border-slate-100",
                            "border-gray-700"
                        )}`}>
                            <div className="px-6 py-5 text-white bg-gradient-to-r from-sky-400 to-cyan-500">
                                <h3 className="text-xl font-semibold">Invoice Status Distribution</h3>
                                <p className="text-sm opacity-90">Breakdown of invoices by payment status</p>
                            </div>

                            <div className={`p-8 ${getStyles("bg-white", "bg-gray-800")}`}>
                                {invoiceStatusData.some(d => d.value > 0) ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={invoiceStatusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {invoiceStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className={`flex items-center justify-center min-h-[300px] ${getStyles("text-slate-400", "text-gray-400")}`}>
                                        No invoice data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Service Status Overview */}
                        <div className={`overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${getStyles(
                            "border-slate-100",
                            "border-gray-700"
                        )}`}>
                            <div className="px-6 py-5 text-white bg-gradient-to-r from-sky-400 to-cyan-500">
                                <h3 className="text-xl font-semibold">Service Status Overview</h3>
                                <p className="text-sm opacity-90">Completion and progress of all services</p>
                            </div>

                            <div className={`p-8 ${getStyles("bg-white", "bg-gray-800")}`}>
                                {serviceStatusData.some(d => d.value > 0) ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={serviceStatusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {serviceStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className={`flex items-center justify-center min-h-[300px] ${getStyles("text-slate-400", "text-gray-400")}`}>
                                        No service data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Top Services by Revenue */}
                    <div className={`overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${getStyles(
                        "border-slate-100",
                        "border-gray-700"
                    )}`}>
                        <div className="px-6 py-5 text-white bg-gradient-to-r from-sky-400 to-cyan-500">
                            <h3 className="text-xl font-semibold">Top Services by Revenue</h3>
                            <p className="text-sm opacity-90">Highest-earning service categories</p>
                        </div>

                        <div className={`p-8 ${getStyles("bg-white", "bg-gray-800")}`}>
                            {topServicesData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={topServicesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={getStyles("#e5e7eb", "#374151")} />
                                        <XAxis dataKey="category" stroke={getStyles("#6b7280", "#9ca3af")} />
                                        <YAxis stroke={getStyles("#6b7280", "#9ca3af")} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="revenue" fill="#06b6d4" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className={`flex items-center justify-center min-h-[300px] ${getStyles("text-slate-400", "text-gray-400")}`}>
                                    No service revenue data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Clients */}
                    <div className={`overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 ${getStyles(
                        "border-slate-100",
                        "border-gray-700"
                    )}`}>
                        <div className="px-6 py-5 text-white bg-gradient-to-r from-sky-400 to-cyan-500">
                            <h3 className="text-xl font-semibold">Top Clients</h3>
                            <p className="text-sm opacity-90">Clients with highest total spending</p>
                        </div>

                        <div className={`p-8 ${getStyles("bg-white", "bg-gray-800")}`}>
                            {topClientsData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={topClientsData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={getStyles("#e5e7eb", "#374151")} />
                                        <XAxis dataKey="client" stroke={getStyles("#6b7280", "#9ca3af")} />
                                        <YAxis stroke={getStyles("#6b7280", "#9ca3af")} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="spending" fill="#8b5cf6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className={`flex items-center justify-center min-h-[300px] ${getStyles("text-slate-400", "text-gray-400")}`}>
                                    No client data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className="space-y-6">
                    {/* Recent Invoices */}
                    <div className={`overflow-hidden rounded-xl shadow transition-all duration-300 ${getStyles(
                        "bg-white",
                        "bg-gray-800"
                    )}`}>
                        <div className="px-6 py-4 text-white bg-gradient-to-r from-cyan-400 to-teal-500">
                            <h3 className="text-lg font-semibold">Recent Invoices</h3>
                            <p className="text-sm opacity-90">Latest billing records</p>
                        </div>
                        <div className="p-6">
                            {billings.length > 0 ? (
                                <div className="space-y-3">
                                    {billings.slice(0, 10).map(b => (
                                        <div key={b.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${getStyles(
                                            "border-slate-200 hover:bg-slate-50",
                                            "border-gray-700 hover:bg-gray-700/50"
                                        )}`}>
                                            <div>
                                                <div className={`font-semibold ${getStyles("", "text-white")}`}>#{b.invoiceNumber}</div>
                                                <div className={`text-sm ${getStyles("text-slate-600", "text-gray-400")}`}>{b.washingClient?.fullName}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-bold ${getStyles("text-emerald-600", "text-emerald-400")}`}>₹{Number(b.grandTotal || 0).toFixed(2)}</div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${b.status === "PAID"
                                                    ? getStyles("bg-green-100 text-green-700", "bg-green-900/30 text-green-400")
                                                    : getStyles("bg-yellow-100 text-yellow-700", "bg-yellow-900/30 text-yellow-400")
                                                    }`}>
                                                    {b.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={getStyles("text-gray-500", "text-gray-400")}>No invoices found.</div>
                            )}
                        </div>
                    </div>

                    {/* Recent Services */}
                    <div className={`overflow-hidden rounded-xl shadow transition-all duration-300 ${getStyles(
                        "bg-white",
                        "bg-gray-800"
                    )}`}>
                        <div className="px-6 py-4 text-white bg-gradient-to-r from-cyan-400 to-teal-500">
                            <h3 className="text-lg font-semibold">Recent Services</h3>
                            <p className="text-sm opacity-90">Latest completed and pending services</p>
                        </div>
                        <div className="p-6">
                            {services.length > 0 ? (
                                <div className="space-y-3">
                                    {services.slice(0, 10).map(s => {
                                        const cost = Number(s.partsCost || 0);
                                        const gst = Number(s.partsGst || 0);
                                        const total = cost + (cost * gst) / 100;

                                        return (
                                            <div key={s.id} className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${getStyles(
                                                "border-slate-200 hover:bg-slate-50",
                                                "border-gray-700 hover:bg-gray-700/50"
                                            )}`}>
                                                <div>
                                                    <div className={`font-semibold ${getStyles("", "text-white")}`}>{s.subService?.name || "Service"}</div>
                                                    <div className={`text-sm ${getStyles("text-slate-600", "text-gray-400")}`}>{s.category?.name}</div>
                                                    <div className={`text-xs ${getStyles("text-slate-500", "text-gray-500")}`}>{s.client?.fullName}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-bold ${getStyles("text-emerald-600", "text-emerald-400")}`}>₹{total.toFixed(2)}</div>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${s.status === "COMPLETED"
                                                        ? getStyles("bg-green-100 text-green-700", "bg-green-900/30 text-green-400")
                                                        : getStyles("bg-yellow-100 text-yellow-700", "bg-yellow-900/30 text-yellow-400")
                                                        }`}>
                                                        {s.status}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={getStyles("text-gray-500", "text-gray-400")}>No services found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reports;