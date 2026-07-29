// client/src/pages/services/ServiceDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPrinter,
  FiFileText,
  FiClipboard,
  FiCalendar,
  FiUser,
  FiTool,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiPackage,
  FiAlertCircle,
  FiTag,
  FiMessageSquare,
  FiSmartphone,
} from "react-icons/fi";
import { FaCar, FaRupeeSign, FaWhatsapp } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { Toaster, toast } from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

const approvalMeta = {
  PENDING: {
    label: "Pending Customer Approval",
    color: "bg-yellow-100 text-yellow-800",
  },
  APPROVED: {
    label: "Approved by Customer",
    color: "bg-green-100 text-green-800",
  },
  REJECTED: {
    label: "Rejected by Customer",
    color: "bg-red-100 text-red-800",
  },
  CONDITION_REQUESTED: {
    label: "Approved with Conditions",
    color: "bg-orange-100 text-orange-800",
  },
  READY_SENT: {
    label: "Vehicle Ready (Sent)",
    color: "bg-green-100 text-green-800",
  },
};

const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  return res;
};

// Helper Component for Info Grids
const InfoItem = ({ icon: Icon, label, value, renderCustom, colorClass, isDark }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
    <div className={`p-2.5 rounded-lg ${colorClass} bg-opacity-10 shrink-0`}>
      <Icon className={`w-5 h-5 ${colorClass.replace("bg-", "text-")}`} />
    </div>
    <div className="overflow-hidden w-full">
      <p
        className={`text-xs font-medium mb-1 ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      {renderCustom ? (
        renderCustom()
      ) : (
        <p
          className={`font-semibold text-sm truncate ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {value}
        </p>
      )}
    </div>
  </div>
);

export default function ServiceDetail() {
  const { id } = useParams();
  const { isDark } = useTheme();
  const [service, setService] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [waError, setWaError] = useState("");

  const loadService = async () => {
    try {
      const res = await apiRequest(`/api/services/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load service");
      setService(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadService();
  }, [id]);

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900 text-gray-400" : "bg-gray-50 text-gray-500"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading service details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl text-center max-w-md">
          <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4 font-semibold text-lg">{error}</p>
          <Link
            to="/services"
            className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:shadow-md transition-all"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );

  if (!service) return null;

  // --- Calculations ---
  const costItems = service.serviceCostItems || [];
  const num = (v) => (Number.isFinite(+v) ? +v : 0);

  const totalAmount = costItems.reduce((sum, i) => {
    const itemBase = num(i.quantity) * num(i.unitPrice);
    const cgstAmount = (itemBase * num(i.cgstRate)) / 100;
    const sgstAmount = (itemBase * num(i.sgstRate)) / 100;
    return sum + itemBase + cgstAmount + sgstAmount;
  }, 0);

  const partsSubtotal = costItems
    .filter((item) => item.type === "part")
    .reduce((sum, i) => sum + num(i.totalCost), 0);
  const laborSubtotal = costItems
    .filter((item) => item.type === "labor")
    .reduce((sum, i) => sum + num(i.totalCost), 0);

  // Status Styling
  const getStatusStyles = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const serviceDataForInvoice = {
    id: service.id,
    vehicle: `${service.client?.vehicleMake || ""} ${
      service.client?.vehicleModel || ""
    } (${service.client?.regNumber || ""})`,
    mechanic: service.assignedMechanic || "",
    description: service.notes || "",
    partsCost: partsSubtotal,
    partsGst: 0,
    laborCost: laborSubtotal,
    laborGst: 0,
    taxes: 0,
    discounts: 0,
    total: parseFloat(totalAmount.toFixed(2)),
    paymentMode: "",
    status: service.status || "Pending",
    dueDate: "",
    notes: service.notes || "",
    serviceCategory: service.category?.name || "",
    // 🔄 UPDATED: Join selected items gracefully for generic downstream string rendering templates
    serviceSubCategory: service.subServices?.map(sub => sub.name).join(", ") || "General",
    serviceNotes: service.notes || "",
    clientId: service.client?.id,
    costItems: costItems,
  };

  // Common Card Classes
  const cardClass = `rounded-2xl shadow-sm border ${
    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  }`;
  const headingClass = `text-lg font-bold flex items-center gap-2 mb-4 pb-3 border-b ${
    isDark ? "border-gray-700" : "border-gray-100"
  }`;

  const sendWhatsAppApproval = async () => {
    try {
      setSendingWhatsApp(true);
      setWaError("");

      const res = await apiRequest(`/api/services/${service.id}/whatsapp`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send WhatsApp");

      const refresh = await apiRequest(`/api/services/${service.id}`);
      const updated = await refresh.json();
      setService(updated);
    } catch (err) {
      setWaError(err.message);
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleSendReadyAlert = async () => {
    if (!window.confirm("Notify the client and mark as Paid?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/services/${id}/whatsapp-ready`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Ready alert sent & Status updated to Paid!");
        loadService();
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div
      className={`min-h-screen lg:ml-16 transition-colors duration-300 ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Toaster position="top-right" />
      {/* Top Navigation Bar */}
      <div
        className={`sticky top-0 z-20 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-md border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark
            ? "bg-gray-900/80 border-gray-800"
            : "bg-white/80 border-gray-200"
        }`}
      >
        {/* Left Side: Navigation & Title */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          <Link
            to="/services"
            className="p-2 shrink-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold flex flex-wrap items-center gap-2">
              <span className="truncate">Service #{service.id}</span>
              <span
                className={`px-2.5 py-0.5 text-[10px] sm:text-xs rounded-full border font-bold uppercase tracking-wide ${getStatusStyles(
                  service.status,
                )}`}
              >
                {service.status}
              </span>
            </h1>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {service.approvalStatus === "READY_SENT" ? (
            <div className="flex shrink-0 items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xs sm:text-sm font-bold border border-green-200">
              <FiCheckCircle className="w-4 h-4" />
              <span className="whitespace-nowrap">Ready Alert Sent</span>
            </div>
          ) : (
            <button
              onClick={handleSendReadyAlert}
              className="flex shrink-0 items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md text-xs sm:text-sm font-bold whitespace-nowrap"
            >
              <FiCheckCircle className="w-4 h-4" />
              Notify
            </button>
          )}

          <button
            onClick={() => window.print()}
            className={`p-2 shrink-0 rounded-lg border transition-all ${
              isDark
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            <FiPrinter className="w-5 h-5" />
          </button>

          {service.approvalStatus !== "APPROVED" && (
            <Link
              to={`/services/${id}/edit`}
              className="px-4 py-2 shrink-0 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-bold whitespace-nowrap"
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* --- LEFT COLUMN (Details) --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Main Info Card */}
            <div className={cardClass}>
              <div className="p-6">
                <h2 className={headingClass}>
                  <FiTool className="text-blue-500" /> Service Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoItem
                    icon={FiTag}
                    label="Category"
                    value={service.category?.name || "N/A"}
                    colorClass="bg-blue-500"
                    isDark={isDark}
                  />
                  
                  {/* 🔄 REDESIGNED: Multiple Sub-Services List View layout block */}
                  <InfoItem
                    icon={FiTool}
                    label="Sub-Services Included"
                    colorClass="bg-indigo-500"
                    isDark={isDark}
                    renderCustom={() => (
                      <div className="flex flex-wrap gap-1.5 mt-1 max-w-full">
                        {service.subServices && service.subServices.length > 0 ? (
                          service.subServices.map((sub, idx) => (
                            <span
                              key={sub.id || idx}
                              className={`text-xs px-2.5 py-1 rounded-md font-semibold border tracking-wide whitespace-nowrap ${
                                isDark
                                  ? "bg-gray-900/40 text-indigo-400 border-indigo-500/20"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
                              }`}
                            >
                              {sub.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-medium text-gray-400 italic">
                            General Service
                          </span>
                        )}
                      </div>
                    )}
                  />

                  <InfoItem
                    icon={FiCalendar}
                    label="Service Date"
                    value={new Date(service.date).toLocaleDateString()}
                    colorClass="bg-purple-500"
                    isDark={isDark}
                  />
                  <InfoItem
                    icon={FiClock}
                    label="Expected Delivery"
                    value={
                      service.expectedDelivery
                        ? new Date(service.expectedDelivery).toLocaleString()
                        : "N/A"
                    }
                    colorClass="bg-orange-500"
                    isDark={isDark}
                  />
                  <InfoItem
                    icon={FiUser}
                    label="Mechanic"
                    value={service.assignedMechanic || "Unassigned"}
                    colorClass="bg-teal-500"
                    isDark={isDark}
                  />
                  <InfoItem
                    icon={FiAlertCircle}
                    label="Priority"
                    value={service.priority || "Normal"}
                    colorClass="bg-red-500"
                    isDark={isDark}
                  />
                </div>

                {/* Notes Section */}
                {(service.notes || service.internalNotes) && (
                  <div
                    className={`mt-6 p-4 rounded-xl ${
                      isDark
                        ? "bg-gray-750 border border-gray-700"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    {service.notes && (
                      <div className="mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                          Customer Notes
                        </span>
                        <p className="mt-1 text-sm leading-relaxed">
                          {service.notes}
                        </p>
                      </div>
                    )}
                    {service.internalNotes && (
                      <div className="pt-3 border-t dark:border-gray-700 border-gray-200">
                        <span className="text-xs font-bold uppercase tracking-wider text-yellow-500">
                          Internal Notes
                        </span>
                        <p className="mt-1 text-sm leading-relaxed italic opacity-80">
                          {service.internalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Client & Vehicle Card */}
            <div className={cardClass}>
              <div className="p-6">
                <h2 className={headingClass}>
                  <FiUser className="text-green-500" /> Client & Vehicle
                </h2>
                {service.client ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Side */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-green-500/30">
                          {service.client.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-lg">
                            {service.client.fullName}
                          </p>
                          <p
                            className={`text-xs ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Client ID: #{service.client.id}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 pl-2">
                        <div className="flex items-center gap-2 text-sm opacity-80">
                          <FiPhone className="w-4 h-4" />{" "}
                          {service.client.phone || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-sm opacity-80">
                          <FiMail className="w-4 h-4" />{" "}
                          {service.client.email || "N/A"}
                        </div>
                        {service.client.address && (
                          <div className="flex items-center gap-2 text-sm opacity-80">
                            <FiMapPin className="w-4 h-4" />{" "}
                            {service.client.address}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vehicle Side */}
                    <div
                      className={`p-4 rounded-xl border ${
                        isDark
                          ? "bg-gray-900/50 border-gray-700"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FaCar className="text-2xl text-blue-500" />
                        <span className="font-mono text-sm font-bold text-white bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          {service.client.regNumber}
                        </span>
                      </div>
                      <p className="font-bold">
                        {service.client.vehicleMake}{" "}
                        {service.client.vehicleModel}
                      </p>
                      <p className="text-sm opacity-60">
                        {service.client.vehicleYear || "Year unknown"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 opacity-50 italic">
                    No Client Information Attached
                  </div>
                )}
              </div>
            </div>

            {/* 3. Media Gallery */}
            <div className={cardClass}>
              <div className="p-6">
                <h2 className={headingClass}>
                  <FiFileText className="text-purple-500" /> Attached Media
                </h2>
                {service.mediaFiles?.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {service.mediaFiles.map((file) => (
                      <div
                        key={file.id}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border dark:border-gray-700"
                      >
                        <img
                          src={file.mediaUrl}
                          alt={file.fileName || "Image"}
                          onError={(e) => {
                            e.currentTarget.src = "/image-placeholder.png";
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                          <p className="text-[10px] text-white truncate">
                            {file.fileName}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl border-gray-300 dark:border-gray-700 text-gray-400">
                    <FiPackage className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">No images uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN (Cost Summary & Actions) --- */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Cost Breakdown Card */}
              <div
                className={`${cardClass} overflow-hidden border-t-4 border-t-green-500`}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <FaRupeeSign className="text-green-500" /> Cost Summary
                  </h2>

                  {/* Scrollable list */}
                  <div className="max-h-[500px] overflow-y-auto pr-1 space-y-4 custom-scrollbar mb-4">
                    {costItems.length > 0 ? (
                      costItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-start text-base pb-3 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0"
                        >
                          <div>
                            <p className="font-medium line-clamp-1">
                              {item.name || `Item #${idx + 1}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} x ₹{num(item.unitPrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-base">
                              ₹
                              {(
                                num(item.quantity) *
                                num(item.unitPrice) *
                                (1 +
                                  (num(item.cgstRate) + num(item.sgstRate)) /
                                    100)
                              ).toFixed(2)}
                            </p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 capitalize">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-center text-gray-400 py-4">
                        No cost items added
                      </p>
                    )}
                  </div>

                  {/* Totals Section */}
                  <div
                    className={`p-5 rounded-xl ${
                      isDark ? "bg-gray-900/50" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Parts Total</span>
                      <span>₹{partsSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Labor Total</span>
                      <span>₹{laborSubtotal.toFixed(2)}</span>
                    </div>
                    {service.advancePaid > 0 && (
                      <div className="flex justify-between text-sm mb-1 text-green-600">
                        <span>Advance Paid</span>
                        <span>- ₹{num(service.advancePaid).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-3xl text-green-600">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Card */}
              <div className={cardClass}>
                <div className="p-6">
                  <h3 className="font-semibold mb-2">Next Actions</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Ready to finalize? Generate an invoice instantly.
                  </p>

                  {/* WhatsApp Approval */}
                  <div className="mt-4 border-t pt-4">
                    {waError && (
                      <div className="text-xs text-red-500 mb-2">{waError}</div>
                    )}

                    {/* Approval Status */}
                    <div className="mb-4 p-4 rounded-xl border">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <FaWhatsapp className="text-green-500" /> WhatsApp
                          Approval
                        </h4>

                        {service.approvalStatus ? (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              approvalMeta[service.approvalStatus]?.color
                            }`}
                          >
                            {approvalMeta[service.approvalStatus]?.label}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                            Not Sent
                          </span>
                        )}
                      </div>

                      {service.approvalAt && (
                        <div className="mt-2 text-xs text-gray-500">
                          Updated on{" "}
                          {new Date(service.approvalAt).toLocaleString()}
                        </div>
                      )}
                    </div>

                    <button
                      disabled={
                        sendingWhatsApp ||
                        ["PENDING", "APPROVED"].includes(service.approvalStatus)
                      }
                      onClick={sendWhatsAppApproval}
                      className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 mb-2
    ${
      service.approvalStatus === "APPROVED"
        ? "bg-green-200 text-green-800 cursor-not-allowed"
        : service.approvalStatus === "PENDING"
          ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700 text-white"
    }`}
                    >
                      <FaWhatsapp />
                      {service.approvalStatus === "APPROVED"
                        ? "Approved via WhatsApp"
                        : service.approvalStatus === "PENDING"
                          ? "Waiting for Customer"
                          : sendingWhatsApp
                            ? "Sending..."
                            : "Send WhatsApp Approval"}
                    </button>
                  </div>

                  <Link
                    to="/billing/new"
                    state={{
                      serviceId: service.id,
                      clientId: service.client?.id,
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                  >
                    <FiClipboard className="w-5 h-5" /> Generate Invoice
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}