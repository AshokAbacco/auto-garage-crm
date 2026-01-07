import React, { useState, useEffect } from "react";
import { FiPrinter, FiDownload, FiBarChart2, FiFileText, FiRefreshCw,FiUsers } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import BikeAnalyticsView from "./BikeAnalyticsView";
import BikeReportsList from "./BikeReportsList";
import BikeClientsReport from "./BikeClientsReport";

import { Toaster, toast } from "react-hot-toast";

export default function BikeReports() {
  const { isDark } = useTheme();
  const [mode, setMode] = useState(localStorage.getItem("bikeReportMode") || "analytics");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);

  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const fetchData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const [invoicesRes, clientsRes, servicesRes] = await Promise.all([
      fetch(`${base}/api/bike-invoices`, { headers }),
      fetch(`${base}/api/bikes`, { headers }),
      fetch(`${base}/api/bike-services`, { headers }),
    ]);

    const [invoicesData, clientsData, servicesData] = await Promise.all([
      invoicesRes.json(),
      clientsRes.json(),
      servicesRes.json(),
    ]);

    // ✅ SAFE DATA NORMALIZATION
    const safeInvoices = Array.isArray(invoicesData) ? invoicesData : [];

    const safeClients = Array.isArray(clientsData)
      ? clientsData
      : clientsData?.data || [];

    const safeServices = Array.isArray(servicesData?.services)
      ? servicesData.services
      : Array.isArray(servicesData)
      ? servicesData
      : [];

    // ✅ SET STATE ONLY ONCE
    setInvoices(safeInvoices);
    setClients(safeClients);
    setServices(safeServices);

    const paidInvoices = safeInvoices.filter(i => i.status === "Paid");
    const pendingInvoices = safeInvoices.filter(i => i.status === "Pending");

    setSummary({
      revenueSummary: {
        totalRevenue: safeInvoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0),
        paidRevenue: paidInvoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0),
        pendingRevenue: pendingInvoices.reduce((s, i) => s + Number(i.grandTotal || 0), 0),
      },
      serviceSummary: {
        totalServices: safeServices.length,
        completedServices: safeServices.filter(s => s.status === "Paid").length,
        pendingServices: safeServices.filter(s => s.status === "Pending").length,
      },
    });

    toast.success("Reports loaded successfully");
  } catch (err) {
    console.error(err);
    setError("Failed to load bike reports");
    toast.error("Failed to load reports");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const toggleMode = (m) => {
    setMode(m);
    localStorage.setItem("bikeReportMode", m);
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleExport = () => {
    toast.success("Export feature coming soon!");
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <FiRefreshCw className="animate-spin text-blue-600" size={40} />
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading Bike Reports...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
    }`}>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Business Reports & Analytics
            </h1>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Track performance, revenue, and service insights
            </p>
          </div>
        </div>
      </div>

      {/* Mode Toggle & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-8 animate-slide-down">
        {/* Mode Toggle Buttons */}
        <div className={`flex gap-2 p-1.5 rounded-xl ${
          isDark ? "bg-gray-800" : "bg-white shadow-md"
        }`}>
          <button
            onClick={() => toggleMode("analytics")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              mode === "analytics"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                : isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FiBarChart2 size={20} />
            Analytics
          </button>

          <button
            onClick={() => toggleMode("reports")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              mode === "reports"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                : isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FiFileText size={20} />
            Reports
          </button>

          <button
            onClick={() => toggleMode("clients")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              mode === "clients"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                : isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <FiUsers size={20} />
            Clients
          </button>

        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 ml-auto">
          <button
            onClick={handlePrint}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
            }`}
            title="Print Report"
          >
            <FiPrinter size={20} />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDark
                ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
            }`}
            title="Export Data"
          >
            <FiDownload size={20} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            title="Refresh Data"
          >
            <FiRefreshCw size={20} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

{/* Content Area */}
<div className="animate-fade-in">
  {mode === "analytics" && (
    <BikeAnalyticsView
      invoices={invoices}
      services={services}
      clients={clients}
      isDark={isDark}
    />
  )}

  {mode === "reports" && (
    <BikeReportsList
      invoices={invoices}
      clients={clients}
      services={services}
      isDark={isDark}
    />
  )}

  {mode === "clients" && (
    <BikeClientsReport
      clients={clients}
      isDark={isDark}
    />
  )}
</div>

    </div>
  );
}