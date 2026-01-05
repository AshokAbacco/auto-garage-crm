import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiEdit,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCreditCard,
  FiHash,
  FiCalendar,
  FiTool,
  FiDollarSign,
  FiPlus,
  FiArrowLeft,
  FiX,
  FiTrash2,
  FiFileText,
  FiCamera,
  FiEye,
  FiUsers,
} from "react-icons/fi";
import { BsFuelPumpFill } from "react-icons/bs";
import { useTheme } from "../../contexts/ThemeContext";
import OCRUploader from "../details/components/OCRUploader";
import OCRResults from "../details/components/OCRResults";
import { processImage } from "../details/utils/OCRProcessor.js";
import { Toaster, toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  // Use the same color configuration as Layout.js
  const colors = useMemo(
    () => ({
      // Backgrounds
      layoutBg: isDark ? "#020617" : "#FFFFFF", // Sidebar/Header BG
      mainBg: isDark ? "#020617" : "#F8FAFC", // Page Content BG
      elementBg: isDark ? "#020D36" : "#FFFFFF", // Dropdowns/Modals

      // Text
      textPrimary: isDark ? "#E5E7EB" : "#0F172A",
      textSecondary: isDark ? "#94A3B8" : "#475569",

      // Brand & Accents
      brand: isDark ? "#1E3A8A" : "#0B1D51",
      primaryButton: isDark ? "#3B82F6" : "#0046FF", // Blue Color for Active Tab

      // Borders & Hover
      border: isDark ? "#1E293B" : "#E5E7EB",
      hoverBg: isDark ? "#1E293B" : "#F8FAFC",
    }),
    [isDark]
  );

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedService, setSelectedService] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [serviceForm, setServiceForm] = useState({});
  const [isSavingService, setIsSavingService] = useState(false);

  // OCR states
  const [ocrRecords, setOcrRecords] = useState([]);
  const [isLoadingOCR, setIsLoadingOCR] = useState(false);
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrParsed, setOcrParsed] = useState(null);
  const [ocrRaw, setOcrRaw] = useState("");
  const [selectedOCR, setSelectedOCR] = useState(null);

  // fetch client by id
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        const res = await fetch(`${API_BASE}/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch client data");
        }

        const data = await res.json();
        setClient(data);
      } catch (err) {
        setError(err.message || "Unknown error");
        if (
          err.message.includes("401") ||
          err.message.includes("Unauthorized")
        ) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // fetch OCR records for this client
  const fetchOCR = async () => {
    try {
      setIsLoadingOCR(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const res = await fetch(`${API_BASE}/api/ocr/history?clientId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch OCR records");
      }

      const data = await res.json();
      setOcrRecords(data || []);
    } catch (err) {
      console.error("OCR fetch failed:", err);
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        navigate("/login");
      }
    } finally {
      setIsLoadingOCR(false);
    }
  };

  useEffect(() => {
    if (id) fetchOCR();
  }, [id]);

  // Delete OCR record
  const handleDeleteOCR = async (recordId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const res = await fetch(`${API_BASE}/api/ocr/${recordId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to delete OCR record");
      }

      setOcrRecords((prev) => prev.filter((r) => r.id !== recordId));
      toast.success("OCR record deleted successfully");
    } catch (err) {
      toast.error(err.message || "Delete failed");
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        navigate("/login");
      }
    }
  };

  // Start OCR (camera/upload) directly from client detail
  const handleStartOCR = async (image) => {
    try {
      setOcrImage(image);
      const result = await processImage(image, (p) =>
        console.log("OCR progress:", Math.round(p * 100), "%")
      );
      setOcrParsed(result.parsed);
      setOcrRaw(result.text);
      setActiveTab("ocr");
    } catch (err) {
      toast.error("OCR failed: " + err.message);
    }
  };

  // Save OCR record to backend
  const handleSaveOCR = async (data) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const body = {
        clientId: parseInt(id, 10),
        rawText: ocrRaw,
        parsedData: JSON.stringify(data),
        confidence: data.ocrConfidence || 85,
      };

      const res = await fetch(`${API_BASE}/api/ocr/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const txt = await res.text();
        throw new Error(txt || "Failed to save OCR record");
      }

      const responseData = await res.json();
      setOcrRecords((prev) => [...prev, responseData.record]);
      setOcrParsed(null);
      setOcrRaw("");
      setOcrImage(null);
      toast.success("OCR data saved successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save OCR data");
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        navigate("/login");
      }
    }
  };

  const saveServiceChanges = async () => {
    try {
      setIsSavingService(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const res = await fetch(`${API_BASE}/api/services/${serviceForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(serviceForm),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error("Failed to update service");
      }

      const data = await res.json();
      setClient((prev) => ({
        ...prev,
        services: prev.services.map((s) =>
          s.id === data.service.id ? data.service : s
        ),
      }));
      setSelectedService(null);
      toast.success("Service updated successfully");
    } catch (err) {
      toast.error(err.message);
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        navigate("/login");
      }
    } finally {
      setIsSavingService(false);
    }
  };

  const handleScanNavigate = () => {
    const q = new URLSearchParams({
      clientId: id,
      clientName: client?.fullName || "",
    }).toString();
    navigate(`/details?${q}`);
  };

  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.mainBg }}
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <div
            className="mt-4 text-center font-medium"
            style={{ color: colors.textSecondary }}
          >
            Loading client...
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.mainBg }}
      >
        <div
          className="max-w-md w-full p-6 rounded-2xl"
          style={{
            backgroundColor: isDark ? "rgba(127, 29, 29, 0.2)" : "#FEF2F2",
            borderColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#FECACA",
          }}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FiX className="w-8 h-8 text-red-600" />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: isDark ? "#FCA5A5" : "#DC2626" }}
            >
              Error Loading Client
            </h3>
            <p style={{ color: colors.textSecondary }}>{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );

  if (!client) return null;

  // derived summary
  const services = client.services || [];
  const invoices = client.invoices || [];
  const lastService = services[0]?.date
    ? new Date(services[0].date).toLocaleDateString()
    : "N/A";
  const totalServices = services.length;
  const totalBilled = invoices.reduce(
    (s, i) => s + (i.grandTotal || i.totalAmount || 0),
    0
  );

  return (
    <div
      className="min-h-screen lg:ml-16 transition-colors duration-300"
      style={{ backgroundColor: colors.mainBg }}
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: colors.elementBg,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
              borderRadius: "0.75rem",
              boxShadow:
                "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: colors.elementBg,
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: colors.elementBg,
              },
            },
          }}
        />

        {/* Back Button */}
        <Link
          to="/clients"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
          style={{
            backgroundColor: colors.hoverBg,
            color: colors.textSecondary,
            border: `1px solid ${colors.border}`,
          }}
        >
          <FiArrowLeft className="w-4 h-4 transition-transform duration-300" />
          <span className="font-medium">Back to Clients</span>
        </Link>

        {/* Hero Section with Background Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          {/* Background Image */}
          <div className="relative h-100 sm:h-[600px]">
            <img
              src={
                client.carImage ||
                `https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80`
              }
              alt="vehicle"
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 p-6 sm:p-8">
            {/* Top Right Buttons */}
            <div className="flex justify-between items-start mb-6">
              <Link
                to="/clients"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: colors.hoverBg,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <FiArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </Link>
              <button
                onClick={handleScanNavigate}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <FiCamera className="w-4 h-4" />
                <span className="font-medium">Scan RC</span>
              </button>
            </div>

            {/* Client Info */}
            <div className="flex items-start gap-4 mb-6">
              {/* Client Initial */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {client.fullName?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {client.fullName}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                    ACTIVE CLIENT
                  </span>
                  <span className="text-white/80 text-sm font-mono">
                    {client.regNumber}
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                {client.vehicleMake} {client.vehicleModel}
              </h2>
              <p className="text-white/80 text-sm">Total Lifetime Value</p>
              <p className="text-2xl font-bold text-white">
                ₹{totalBilled.toFixed(2)}
              </p>
            </div>

            {/* Vehicle Specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <SpecCard
                icon={<BsFuelPumpFill />}
                label="FUEL TYPE"
                value={client.fuel}
                colors={colors}
              />
              <SpecCard
                icon={<FiUsers />}
                label="SEATS"
                value={client.seats}
                colors={colors}
              />
              <SpecCard
                icon={<FiHash />}
                label="COLOR"
                value={client.color || "N/A"}
                colors={colors}
              />
              <SpecCard
                icon={<FiTool />}
                label="BODY TYPE"
                value={client.bodyType || "SUV"}
                colors={colors}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div
          className="rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl"
          style={{ backgroundColor: colors.elementBg }}
        >
          <h2
            className="text-xl font-bold mb-6"
            style={{ color: colors.textPrimary }}
          >
            Contact Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ContactCard
              icon={<FiPhone />}
              label="Phone"
              value={client.phone}
              colors={colors}
            />
            <ContactCard
              icon={<FiMail />}
              label="Email"
              value={client.email}
              colors={colors}
            />
            <ContactCard
              icon={<FiMapPin />}
              label="Address"
              value={client.address}
              colors={colors}
            />
            <ContactCard
              icon={<FiCreditCard />}
              label="Registration No."
              value={client.regNumber}
              colors={colors}
            />
            <ContactCard
              icon={<FiHash />}
              label="VIN / Chassis"
              value={client.vin}
              colors={colors}
            />
            <ContactCard
              icon={<FiCalendar />}
              label="Last Service"
              value={lastService}
              colors={colors}
            />
            <ContactCard
              icon={<BsFuelPumpFill />}
              label="Fuel Type"
              value={client.fuel}
              colors={colors}
            />
            <ContactCard
              icon={<FiUsers />}
              label="Seating Capacity"
              value={client.seats}
              colors={colors}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <div
          className="rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
          style={{ backgroundColor: colors.elementBg }}
        >
          {/* Tab Header */}
          <div
            className="p-4 sm:p-6 border-b"
            style={{ borderColor: colors.border }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Tab Buttons */}
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {["overview", "services", "invoices", "ocr"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105"
                        : isDark
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab === "ocr"
                      ? "OCR Records"
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Action Buttons (contextual) */}
              {activeTab === "services" && (
                <Link
                  to="/services/new"
                  state={{ customerId: client.id }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="font-medium">Add Service</span>
                </Link>
              )}
              {activeTab === "invoices" && (
                <Link
                  to="/billing/new"
                  state={{ customerId: client.id }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-500 text-white hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
                >
                  <FiPlus className="w-4 h-4" />
                  <span className="font-medium">Create Invoice</span>
                </Link>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Last Service"
                  value={lastService}
                  icon={<FiCalendar />}
                  colors={colors}
                />
                <StatCard
                  title="Total Services"
                  value={totalServices}
                  icon={<FiTool />}
                  colors={colors}
                />
                <StatCard
                  title="Total Billed"
                  value={`₹${totalBilled.toFixed(2)}`}
                  icon={<FiDollarSign />}
                  colors={colors}
                />
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div className="space-y-4">
                {services.length ? (
                  services.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedService(s);
                        setServiceForm(s);
                      }}
                      className="p-4 sm:p-5 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
                      style={{ backgroundColor: colors.hoverBg }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-lg truncate"
                            style={{ color: colors.textPrimary }}
                          >
                            {s.type || "Service"}
                          </h3>
                          <p
                            className="text-sm mt-1"
                            style={{ color: colors.textSecondary }}
                          >
                            {new Date(s.date).toLocaleDateString()} • ₹
                            {(s.cost || 0).toFixed(2)}
                          </p>
                          {s.notes && (
                            <p
                              className="text-xs mt-2"
                              style={{ color: colors.textSecondary }}
                            >
                              {s.notes}
                            </p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                            s.status === "Paid"
                              ? "bg-green-500/20 text-green-400"
                              : s.status === "In Progress"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FiTool
                      className="w-12 h-12 mx-auto mb-3"
                      style={{ color: colors.textSecondary }}
                    />
                    <p style={{ color: colors.textSecondary }}>
                      No service records yet.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <div className="space-y-4">
                {invoices.length ? (
                  invoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="p-4 sm:p-5 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
                      style={{ backgroundColor: colors.hoverBg }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-lg"
                            style={{ color: colors.textPrimary }}
                          >
                            Invoice #{inv.id}
                          </h3>
                          <p
                            className="text-sm mt-1"
                            style={{ color: colors.textSecondary }}
                          >
                            {new Date(inv.createdAt).toLocaleDateString()} • ₹
                            {(inv.grandTotal || inv.totalAmount || 0).toFixed(
                              2
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                            inv.status === "Paid"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FiDollarSign
                      className="w-12 h-12 mx-auto mb-3"
                      style={{ color: colors.textSecondary }}
                    />
                    <p style={{ color: colors.textSecondary }}>
                      No invoices found.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* OCR Tab */}
            {activeTab === "ocr" && (
              <div className="space-y-4">
                {/* If there's a parsed buffer (from local camera/upload), show results + save */}
                {ocrParsed && (
                  <div
                    className="p-4 rounded-xl transition-all duration-300 hover:shadow-md"
                    style={{ backgroundColor: isDark ? "#1E293B" : "#F3F4F6" }}
                  >
                    <OCRResults
                      isDark={isDark}
                      parsedData={ocrParsed}
                      rawOcrText={ocrRaw}
                      onSave={handleSaveOCR}
                    />
                  </div>
                )}

                {/* OCR history list */}
                {isLoadingOCR ? (
                  <p
                    className="text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    Loading OCR records...
                  </p>
                ) : ocrRecords.length ? (
                  ocrRecords.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-xl flex justify-between items-center border transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.hoverBg,
                      }}
                    >
                      <div>
                        <h4
                          className="font-semibold"
                          style={{ color: colors.textPrimary }}
                        >
                          {r.parsedData?.ownerName || "Unknown Owner"}
                        </h4>
                        <p style={{ color: colors.textSecondary }}>
                          Reg: {r.parsedData?.regNo || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(r.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOCR(r)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-300"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <button
                          onClick={() => handleDeleteOCR(r.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-300"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="text-center py-10"
                    style={{ color: colors.textSecondary }}
                  >
                    <FiFileText className="mx-auto mb-2" size={32} />
                    <p>No OCR records found for this client.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* OCR Detail Modal – redesigned and grouped */}
        {selectedOCR && (
          <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-6 overflow-y-auto backdrop-blur-sm">
            <div
              className="w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: colors.elementBg }}
            >
              <div
                className="flex items-center justify-between p-4"
                style={{
                  background: isDark
                    ? "linear-gradient(to right, rgba(30, 58, 138, 0.6), rgba(124, 58, 237, 0.6))"
                    : "linear-gradient(to right, #2563eb, #9333ea)",
                  color: "white",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
                    <FiFileText />
                  </div>
                  <h3 className="text-lg font-semibold">OCR Record Details</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-white/80 mr-4">
                    Created: {new Date(selectedOCR.createdAt).toLocaleString()}
                  </div>
                  <button
                    onClick={() => setSelectedOCR(null)}
                    className="text-white hover:opacity-90 transition-opacity duration-300"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Group: Vehicle Identification */}
                <Section title="🚗 Vehicle Identification" colors={colors}>
                  <TwoCol
                    label="Registration Number"
                    value={selectedOCR.parsedData?.regNo}
                    colors={colors}
                  />
                  <TwoCol
                    label="Registration Date"
                    value={selectedOCR.parsedData?.regDate}
                    colors={colors}
                  />
                  <TwoCol
                    label="Chassis Number"
                    value={selectedOCR.parsedData?.chassisNo}
                    colors={colors}
                  />
                  <TwoCol
                    label="Engine Number"
                    value={selectedOCR.parsedData?.engineNo}
                    colors={colors}
                  />
                  <TwoCol
                    label="Maker (Manufacturer)"
                    value={
                      selectedOCR.parsedData?.maker ||
                      selectedOCR.parsedData?.mfr
                    }
                    colors={colors}
                  />
                  <TwoCol
                    label="Model / Variant"
                    value={
                      (selectedOCR.parsedData?.model || "") +
                      (selectedOCR.parsedData?.variant
                        ? ` / ${selectedOCR.parsedData.variant}`
                        : "")
                    }
                    colors={colors}
                  />
                </Section>

                {/* Group: Vehicle Specifications */}
                <Section title="⚙️ Vehicle Specifications" colors={colors}>
                  <TwoCol
                    label="Vehicle Class"
                    value={selectedOCR.parsedData?.vehicleClass}
                    colors={colors}
                  />
                  <TwoCol
                    label="Body Type"
                    value={
                      selectedOCR.parsedData?.body ||
                      selectedOCR.parsedData?.bodyType
                    }
                    colors={colors}
                  />
                  <TwoCol
                    label="Colour"
                    value={
                      selectedOCR.parsedData?.colour ||
                      selectedOCR.parsedData?.color
                    }
                    colors={colors}
                  />
                  <TwoCol
                    label="Fuel Type"
                    value={
                      selectedOCR.parsedData?.fuel ||
                      selectedOCR.parsedData?.fuelType
                    }
                    colors={colors}
                  />
                  <TwoCol
                    label="Wheel Base"
                    value={selectedOCR.parsedData?.wheelBase}
                    colors={colors}
                  />
                  <TwoCol
                    label="MFG Date"
                    value={selectedOCR.parsedData?.mfgDate}
                    colors={colors}
                  />
                  <TwoCol
                    label="Seating Capacity"
                    value={
                      selectedOCR.parsedData?.seating ||
                      selectedOCR.parsedData?.seatingCapacity
                    }
                    colors={colors}
                  />
                  <TwoCol
                    label="No. of Cylinders"
                    value={selectedOCR.parsedData?.noOfCyl}
                    colors={colors}
                  />
                  <TwoCol
                    label="Unladen Weight"
                    value={selectedOCR.parsedData?.unladenWt}
                    colors={colors}
                  />
                  <TwoCol
                    label="CC"
                    value={selectedOCR.parsedData?.cc}
                    colors={colors}
                  />
                </Section>

                {/* Group: Registration / Validity */}
                <Section title="🧾 Registration / Validity" colors={colors}>
                  <TwoCol
                    label="Reg/FC Valid Upto"
                    value={selectedOCR.parsedData?.regFcUpto}
                    colors={colors}
                  />
                  <TwoCol
                    label="Fitness Valid Upto"
                    value={
                      selectedOCR.parsedData?.fitUpto ||
                      selectedOCR.parsedData?.fitnessUpto
                    }
                    colors={colors}
                  />
                  <TwoCol
                    label="Insurance Valid Upto"
                    value={selectedOCR.parsedData?.insuranceUpto}
                    colors={colors}
                  />
                  <TwoCol
                    label="Tax Valid Upto"
                    value={selectedOCR.parsedData?.taxUpto}
                    colors={colors}
                  />
                </Section>

                {/* Group: Ownership */}
                <Section title="👤 Ownership" colors={colors}>
                  <TwoCol
                    label="Owner Name"
                    value={selectedOCR.parsedData?.ownerName}
                    colors={colors}
                  />
                  <TwoCol
                    label="S/W/D Of"
                    value={selectedOCR.parsedData?.swdOf}
                    colors={colors}
                  />
                  <div className="col-span-full">
                    <div className="text-xs font-semibold text-gray-400 mb-2">
                      Address
                    </div>
                    <div
                      className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                        isDark
                          ? "bg-gray-700/40 border-gray-600 text-white"
                          : "bg-gray-50 border-gray-200 text-gray-900"
                      }`}
                    >
                      {selectedOCR.parsedData?.address || "—"}
                    </div>
                  </div>
                </Section>

                {/* Raw OCR text (collapsed style) */}
                {selectedOCR.rawText && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      Raw OCR Text
                    </h4>
                    <pre
                      className={`p-4 rounded-xl text-sm transition-all duration-300 hover:shadow-md ${
                        isDark
                          ? "bg-gray-700/40 text-white"
                          : "bg-gray-50 text-gray-800"
                      }`}
                    >
                      {selectedOCR.rawText}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          @keyframes scaleIn {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }

          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}

/* ----------------------
  Small helper components
   - ContactCard
   - StatCard
   - Section, TwoCol (used in modal)
   - SpecCard (new component for vehicle specs)
---------------------- */

function ContactCard({ icon, label, value, colors }) {
  const isDark = colors.layoutBg === "#020617";

  return (
    <div
      className="p-4 rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-md"
      style={{ backgroundColor: colors.hoverBg }}
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-medium uppercase mb-1"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </p>
        <p
          className="font-semibold truncate"
          style={{ color: colors.textPrimary }}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, colors }) {
  return (
    <div
      className="p-5 rounded-xl flex items-center justify-between transition-all duration-300 hover:shadow-md"
      style={{ backgroundColor: colors.hoverBg }}
    >
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: colors.textSecondary }}
        >
          {title}
        </p>
        <p className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
          {value}
        </p>
      </div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
    </div>
  );
}

function SpecCard({ icon, label, value, colors }) {
  const isDark = colors.layoutBg === "#020617";

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-white/80 uppercase">{label}</p>
          <p className="text-white font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* Section wrapper for modal groups */
function Section({ title, children, colors }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <h4 className="font-semibold" style={{ color: colors.textPrimary }}>
          {title}
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

/* Two-column label/value box used inside modal */
function TwoCol({ label, value, colors }) {
  return (
    <div
      className="p-4 rounded-xl border transition-all duration-300 hover:shadow-md"
      style={{ borderColor: colors.border, backgroundColor: colors.hoverBg }}
    >
      <div className="text-xs text-gray-400 mb-2">{label}</div>
      <div className="font-semibold" style={{ color: colors.textPrimary }}>
        {value || "—"}
      </div>
    </div>
  );
}
