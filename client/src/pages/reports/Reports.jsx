import React, { useState, useEffect } from "react";
import { FiPrinter, FiDownload } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import AnalyticsView from "./AnalyticsView";
import ReportsList from "./ReportsList";
import ClientsReport from "./ClientsReport";

export default function Reports() {
  const { isDark } = useTheme();
  const [mode, setMode] = useState(
    localStorage.getItem("reportMode") || "analytics",
  );
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [clientsReport, setClientsReport] = useState([]);

  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const headers = { Authorization: `Bearer ${token}` };

      // Fetch everything in parallel
      const [summaryRes, invoicesRes, clientsRes, servicesRes] =
        await Promise.all([
          fetch(`${base}/api/reports/summary`, { headers }),
          fetch(`${base}/api/invoices`, { headers }),
          fetch(`${base}/api/clients`, { headers }),
          fetch(`${base}/api/reports/all-services`, { headers }),
        ]);

      // Handle HTTP errors quickly
      if (
        !summaryRes.ok ||
        !invoicesRes.ok ||
        !clientsRes.ok ||
        !servicesRes.ok
      ) {
        throw new Error("One or more requests failed");
      }

      const [summaryData, invoicesData, clientsData, servicesData] =
        await Promise.all([
          summaryRes.json(),
          invoicesRes.json(),
          clientsRes.json(),
          servicesRes.json(),
        ]);

      setSummary(summaryData);
      setInvoices(invoicesData);
      setClients(clientsData);
      setServices(servicesData);

      const [clientsReportRes] = await Promise.all([
        fetch(`${base}/api/reports/clients-details`, { headers }),
      ]);

      if (!clientsReportRes.ok) {
        throw new Error("Clients report request failed");
      }

      const clientsReportData = await clientsReportRes.json();
      setClientsReport(clientsReportData);
    } catch (err) {
      console.error("❌ Failed to load reports:", err);
      setError("Failed to load reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleMode = (m) => {
    setMode(m);
    localStorage.setItem("reportMode", m);
  };

  if (loading) {
    return (
      <div
        className={`flex items-center lg:ml-16 justify-center min-h-screen ${
          isDark ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p
            className={`text-lg font-medium ${
              isDark ? "text-white" : "text-gray-700"
            }`}
          >
            Loading Reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen lg:ml-16 ${isDark ? "" : ""}`}>
      <div className="lg: max-w-7xl  mx-auto px-4 sm:px-1 lg:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="mb-8 ">
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Reports Dashboard
          </h1>
          <p className={`mt-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
            Comprehensive business analytics and reports
          </p>
        </div>

        {/* Header Controls */}
        <div
          className={`rounded-2xl shadow-lg border ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } p-4 sm:p-6 mb-6`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => toggleMode("analytics")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                  mode === "analytics"
                    ? "bg-blue-900 text-white shadow-md"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-700 border border-gray-600"
                      : "text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => toggleMode("reports")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                  mode === "reports"
                    ? "bg-blue-900 text-white shadow-md"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-700 border border-gray-600"
                      : "text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => toggleMode("clients")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                  mode === "clients"
                    ? "bg-blue-900 text-white shadow-md"
                    : isDark
                      ? "text-gray-300 hover:bg-gray-700 border border-gray-600"
                      : "text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                Clients
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => window.print()}
                className={`p-2 sm:p-3 rounded-lg transition-colors duration-200 border ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                    : "bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200"
                }`}
                title="Print report"
              >
                <FiPrinter size={16} />
              </button>
              <button
                onClick={() => alert("Export feature coming soon")}
                className={`p-2 sm:p-3 rounded-lg transition-colors duration-200 border ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
                    : "bg-blue-50 text-blue-900 hover:bg-blue-100 border-blue-200"
                }`}
                title="Export report"
              >
                <FiDownload size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              isDark
                ? "border-red-900 bg-red-950 text-red-300"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content View Switch */}
        {mode === "analytics" && (
          <AnalyticsView
            summary={summary}
            invoices={invoices}
            isDark={isDark}
          />
        )}

        {mode === "reports" && (
          <ReportsList
            invoices={invoices}
            clients={clients}
            services={services}
            isDark={isDark}
          />
        )}

        {mode === "clients" && (
          <ClientsReport clients={clientsReport} isDark={isDark} />
        )}
      </div>
    </div>
  );
}
