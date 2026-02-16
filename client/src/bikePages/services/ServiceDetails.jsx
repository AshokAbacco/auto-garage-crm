import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Edit2,
  FileText,
  Printer,
  User,
  Phone,
  Mail,
  Bike,
  Hash,
  Wrench,
  Tag,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  Loader2,
  Image as ImageIcon,
  Package,
  Send,
} from "lucide-react";
import { FaWhatsapp, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import api from "../../utils/axiosInstance";

/**
 * BACKEND ROUTE ALIGNMENT (Based on Debug Steps)
 * ===============================================
 * Base Prefix: /api/bike-services
 *
 * 1. Approval: POST /:id/whatsapp-approval
 *    -> Full URL: /api/bike-services/${id}/whatsapp-approval
 *
 * 2. Ready Alert: POST /:id/whatsapp-ready
 *    -> Full URL: /api/bike-services/${id}/whatsapp-ready
 */

// Approval Status Meta
const approvalMeta = {
  PENDING: {
    label: "Pending Customer Approval",
    color: (isDark) =>
      isDark
        ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
        : "text-yellow-800 bg-yellow-100 border-yellow-200",
  },
  APPROVED: {
    label: "Approved by Customer",
    color: (isDark) =>
      isDark
        ? "text-green-400 bg-green-400/10 border-green-400/20"
        : "text-green-800 bg-green-100 border-green-200",
  },
  REJECTED: {
    label: "Rejected by Customer",
    color: (isDark) =>
      isDark
        ? "text-red-400 bg-red-400/10 border-red-400/20"
        : "text-red-800 bg-red-100 border-red-200",
  },
  CONDITION_REQUESTED: {
    label: "Approved with Conditions",
    color: (isDark) =>
      isDark
        ? "text-orange-400 bg-orange-400/10 border-orange-400/20"
        : "text-orange-800 bg-orange-100 border-orange-200",
  },
  READY_SENT: {
    label: "Vehicle Ready (Sent)",
    color: (isDark) =>
      isDark
        ? "text-green-400 bg-green-400/10 border-green-400/20"
        : "text-green-800 bg-green-100 border-green-200",
  },
};

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [waError, setWaError] = useState("");

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/bike-services/${id}`);
      setService(res.data);
    } catch (err) {
      console.error("Fetch service error:", err);
      toast.error(
        err.response?.data?.message || "Failed to load service details"
      );

      if (err.response?.status === 403 || err.response?.status === 404) {
        setTimeout(() => navigate("/bike-services"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Matches: router.post("/:id/whatsapp-approval", ...)
  const handleSendWhatsAppApproval = async () => {
    try {
      setSendingWhatsApp(true);
      setWaError("");

      // Direct call to the clean route
      const res = await api.post(
        `/api/bike-service/${id}/whatsapp-approval`
      );

      await fetchService();
      toast.success("WhatsApp Approval Sent!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send WhatsApp";
      setWaError(msg);
      toast.error(msg);
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // ✅ Matches: router.post("/:id/whatsapp-ready", ...)
  const handleSendReadyAlert = async () => {
    if (!window.confirm("Notify the client and mark as Paid?")) return;

    try {
      // Direct call to the clean route
      const res = await api.post(`/api/bike-service/${id}/whatsapp-ready`);

      if (res.status === 200) {
        toast.success("Ready alert sent & Status updated to Paid!");
        fetchService();
      } else {
        toast.error(res.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-green-500" size={48} />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Loading service details...
          </p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <AlertCircle size={48} className="text-red-500" />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Service not found
          </p>
          <button
            onClick={() => navigate("/bike-services")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/bike-services")}
            className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all duration-300 ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <ArrowLeft size={20} />
            Back to Services
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                Service Details
              </h1>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Complete information about this service
              </p>
            </div>

            <div className="flex gap-3">
              {/* Ready Alert Button */}
              {service.approvalStatus === "READY_SENT" ? (
                <div className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-600 border border-green-500/20 rounded-xl font-bold">
                  <FaCheckCircle className="w-5 h-5" />
                  Ready Alert Sent
                </div>
              ) : (
                <button
                  onClick={handleSendReadyAlert}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Ready & Notify
                </button>
              )}

              <button
                onClick={handlePrint}
                className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
                }`}
              >
                <Printer
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                Print
              </button>

              <button
                onClick={() => navigate(`/bike-services/${id}/edit`)}
                className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-medium"
              >
                <Edit2
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
                Edit Service
              </button>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`mb-8 p-6 rounded-2xl border-2 text-center animate-slide-down ${
            service.status === "Completed"
              ? isDark
                ? "bg-green-500/20 border-green-500/50"
                : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
              : service.status === "In Progress"
                ? isDark
                  ? "bg-blue-500/20 border-blue-500/50"
                  : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
                : isDark
                  ? "bg-orange-500/20 border-orange-500/50"
                  : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            {service.status === "Completed" ? (
              <CheckCircle size={32} className="text-green-500" />
            ) : (
              <Clock size={32} className="text-orange-600" />
            )}
            <h2
              className={`text-3xl font-bold ${
                service.status === "Completed"
                  ? "text-green-600"
                  : "text-orange-600"
              }`}
            >
              {service.status}
            </h2>
          </div>
          <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {service.status === "Completed"
              ? "Service completed"
              : "Service in progress"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Service Details */}
          <div
            className={`lg:col-span-2 rounded-2xl shadow-xl border-2 p-6 transition-all duration-300 animate-slide-up ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            <h3
              className={`flex items-center gap-2 text-xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <Wrench size={24} className="text-green-500" />
              Service Information
            </h3>

            <div className="space-y-4">
              <InfoRow
                icon={<Tag size={18} className="text-blue-600" />}
                label="Category"
                value={service.category?.name || service.categoryText}
                isDark={isDark}
              />

              <InfoRow
                icon={<Wrench size={18} className="text-blue-600" />}
                label="Sub Service"
                value={service.subService?.name || service.subServiceText}
                isDark={isDark}
              />

              <InfoRow
                icon={<Calendar size={18} className="text-blue-500" />}
                label="Service In Date"
                value={new Date(service.inDate).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                isDark={isDark}
              />

              {service.outDate && (
                <InfoRow
                  icon={<Calendar size={18} className="text-green-500" />}
                  label="Service Out Date"
                  value={new Date(service.outDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  isDark={isDark}
                />
              )}

              {service.expectedDelivery && (
                <InfoRow
                  icon={<Clock size={18} className="text-orange-500" />}
                  label="Expected Delivery"
                  value={new Date(service.expectedDelivery).toLocaleDateString(
                    "en-IN",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                  isDark={isDark}
                />
              )}

              <InfoRow
                icon={<Tag size={18} className="text-purple-500" />}
                label="Priority"
                value={service.priority}
                isDark={isDark}
              />

              {service.assignedMechanic && (
                <InfoRow
                  icon={<User size={18} className="text-indigo-500" />}
                  label="Assigned Mechanic"
                  value={service.assignedMechanic}
                  isDark={isDark}
                />
              )}

              {service.notes && (
                <div
                  className={`p-4 rounded-xl border-2 ${
                    isDark
                      ? "bg-gray-700/50 border-gray-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <FileText
                      size={18}
                      className="text-indigo-500 mt-1 flex-shrink-0"
                    />
                    <span
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Service Notes
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {service.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="space-y-6">
            {/* Billing Summary */}
            <div
              className={`rounded-2xl shadow-xl border-2 p-6 transition-all duration-300 animate-slide-up ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
              style={{ animationDelay: "100ms" }}
            >
              <h3
                className={`flex items-center gap-2 text-xl font-bold mb-6 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                <IndianRupee size={24} className="text-green-500" />
                Billing Summary
              </h3>

              <div className="space-y-3">
                <CostRow
                  label="Parts Subtotal"
                  amount={service.partsSubtotal?.toFixed(2) || "0.00"}
                  isDark={isDark}
                />
                <CostRow
                  label="Labor Subtotal"
                  amount={service.laborSubtotal?.toFixed(2) || "0.00"}
                  isDark={isDark}
                />
                <CostRow
                  label="CGST Total"
                  amount={service.cgstTotal?.toFixed(2) || "0.00"}
                  isDark={isDark}
                />
                <CostRow
                  label="SGST Total"
                  amount={service.sgstTotal?.toFixed(2) || "0.00"}
                  isDark={isDark}
                />

                {service.discount > 0 && (
                  <CostRow
                    label={`Discount (${service.discountType})`}
                    amount={service.discount?.toFixed(2) || "0.00"}
                    isDark={isDark}
                    isNegative
                  />
                )}

                {service.advancePaid > 0 && (
                  <CostRow
                    label="Advance Paid"
                    amount={service.advancePaid?.toFixed(2) || "0.00"}
                    isDark={isDark}
                  />
                )}

                <div className={`border-t-2 pt-3 mt-3 ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Grand Total
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{service.grandTotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      Balance Due
                    </span>
                    <span
                      className={`text-2xl font-bold ${
                        service.balanceDue > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ₹{service.balanceDue?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Status */}
              <div
                className={`mt-6 p-4 rounded-xl ${
                  service.invoiceStatus === "sent"
                    ? isDark
                      ? "bg-green-500/20"
                      : "bg-green-50"
                    : service.invoiceStatus === "generated"
                      ? isDark
                        ? "bg-blue-500/20"
                        : "bg-blue-50"
                      : isDark
                        ? "bg-gray-700"
                        : "bg-gray-100"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    service.invoiceStatus === "sent"
                      ? "text-green-600"
                      : service.invoiceStatus === "generated"
                        ? "text-blue-600"
                        : isDark
                          ? "text-gray-400"
                          : "text-gray-600"
                  }`}
                >
                  Invoice Status:{" "}
                  {service.invoiceStatus?.toUpperCase() || "DRAFT"}
                </p>
                {service.invoiceSentAt && (
                  <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Sent on {new Date(service.invoiceSentAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp Approval Card */}
            <div
              className={`rounded-2xl shadow-xl border-2 p-6 transition-all duration-300 animate-slide-up ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
              style={{ animationDelay: "150ms" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`flex items-center gap-2 text-lg font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  <FaWhatsapp className="text-green-500" /> WhatsApp Approval
                </h3>

                {service.approvalStatus ? (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${approvalMeta[
                      service.approvalStatus
                    ]?.color(isDark)}`}
                  >
                    {approvalMeta[service.approvalStatus]?.label}
                  </span>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isDark
                        ? "bg-gray-700 text-gray-400"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Not Sent
                  </span>
                )}
              </div>

              {service.approvalAt && (
                <div className="mb-4 text-xs text-gray-500">
                  Last updated: {new Date(service.approvalAt).toLocaleString()}
                </div>
              )}

              {waError && (
                <div className="mb-3 p-2 rounded bg-red-100 dark:bg-red-900/20 text-red-600 text-xs">
                  {waError}
                </div>
              )}

              <button
                disabled={
                  sendingWhatsApp ||
                  ["PENDING", "APPROVED"].includes(service.approvalStatus)
                }
                onClick={handleSendWhatsAppApproval}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
                  ${
                    service.approvalStatus === "APPROVED"
                      ? isDark
                        ? "bg-green-900/30 text-green-500 cursor-not-allowed"
                        : "bg-green-100 text-green-700 cursor-not-allowed"
                      : service.approvalStatus === "PENDING"
                        ? isDark
                          ? "bg-yellow-900/30 text-yellow-500 cursor-not-allowed"
                          : "bg-yellow-100 text-yellow-700 cursor-not-allowed"
                        : isDark
                          ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
                          : "bg-green-600 hover:bg-green-700 text-white shadow-lg"
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
          </div>
        </div>

        {/* Service Items */}
        {service.serviceItems && service.serviceItems.length > 0 && (
          <div
            className={`rounded-2xl shadow-xl border-2 p-6 mb-6 transition-all duration-300 animate-slide-up ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
            style={{ animationDelay: "200ms" }}
          >
            <h3
              className={`flex items-center gap-2 text-xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <Package size={24} className="text-blue-500" />
              Service Items
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b-2 ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    <th className={`text-left py-3 px-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Type</th>
                    <th className={`text-left py-3 px-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Item</th>
                    <th className={`text-right py-3 px-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Qty</th>
                    <th className={`text-right py-3 px-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Unit Price</th>
                    <th className={`text-right py-3 px-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>CGST %</th>
                    <th className={`text-right py-3 px-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>SGST %</th>
                    <th className={`text-right py-3 px-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {service.serviceItems.map((item, idx) => (
                    <tr key={item.id || idx} className={`border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.type === "Part"
                              ? isDark
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-blue-100 text-blue-700"
                              : isDark
                                ? "bg-green-500/20 text-green-400"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {item.name}
                      </td>
                      <td className={`py-3 px-4 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {item.quantity}
                      </td>
                      <td className={`py-3 px-4 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        ₹{Number(item.unitPrice).toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {item.cgst}%
                      </td>
                      <td className={`py-3 px-4 text-right ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        {item.sgst}%
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                        ₹{Number(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Client Information */}
        <div
          className={`rounded-2xl shadow-xl border-2 p-6 mb-6 transition-all duration-300 animate-slide-up ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
          }`}
          style={{ animationDelay: "250ms" }}
        >
          <h3
            className={`flex items-center gap-2 text-xl font-bold mb-6 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            <User size={24} className="text-blue-500" />
            Client Information
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard
              icon={<User size={20} className="text-green-500" />}
              label="Owner Name"
              value={service.client?.ownerName}
              isDark={isDark}
            />

            <InfoCard
              icon={<Phone size={20} className="text-blue-500" />}
              label="Phone"
              value={service.client?.phone}
              isDark={isDark}
            />

            <InfoCard
              icon={<Mail size={20} className="text-blue-600" />}
              label="Email"
              value={service.client?.email}
              isDark={isDark}
            />

            <InfoCard
              icon={<Bike size={20} className="text-blue-600" />}
              label="Vehicle"
              value={`${service.client?.bikeBrand || ""} ${service.client?.bikeModel || ""}`.trim()}
              isDark={isDark}
            />

            <InfoCard
              icon={<Hash size={20} className="text-indigo-500" />}
              label="Registration"
              value={service.client?.regNumber}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Media Files */}
        {service.serviceMedia && service.serviceMedia.length > 0 && (
          <div
            className={`rounded-2xl shadow-xl border-2 p-6 mb-6 transition-all duration-300 animate-slide-up ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
            style={{ animationDelay: "300ms" }}
          >
            <h3
              className={`flex items-center gap-2 text-xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <ImageIcon size={24} className="text-blue-600" />
              Service Images
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {service.serviceMedia.map((media, idx) => (
                <div
                  key={media.id || idx}
                  className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-300 hover:border-green-500 transition-all duration-300 hover:scale-105"
                >
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}/api/bike-services/media/${media.id}`}
                    className="w-full h-full object-cover"
                    alt="Service media"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <span className="text-white text-sm font-medium">
                      {media.fileName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-slide-up" style={{ animationDelay: "350ms" }}>
          <button
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
              isDark
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            <Send size={16} />
            Send Invoice
          </button>

          <button
            onClick={() =>
              navigate("/bill/new", {
                state: {
                  id: service.id,
                  bikeId: service.client?.id,
                  clientName: service.client?.ownerName,
                  vehicle: `${service.client?.bikeBrand || ""} ${service.client?.bikeModel || ""}`.trim(),
                  serviceCategory: service.category?.name || service.categoryText,
                  serviceSubCategory: service.subService?.name || service.subServiceText,
                  serviceItems: service.serviceItems || [],
                  discountType: service.discountType,
                  discount: service.discount,
                  advancePaid: service.advancePaid,
                },
              })
            }
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:scale-105"
          >
            <Receipt size={20} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-down { animation: slide-down 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

// Helper Components
function InfoRow({ icon, label, value, isDark }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        isDark ? "bg-gray-700/50" : "bg-gray-50"
      }`}
    >
      {icon}
      <div className="flex-1">
        <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
        <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
          {value || "N/A"}
        </p>
      </div>
    </div>
  );
}

function CostRow({ label, amount, isDark, isNegative = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className={isDark ? "text-gray-300" : "text-gray-700"}>{label}</span>
      <span
        className={`font-semibold ${
          isNegative ? "text-red-600" : isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {isNegative ? "-" : ""}₹{amount}
      </span>
    </div>
  );
}

function InfoCard({ icon, label, value, isDark }) {
  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
        isDark
          ? "bg-gray-700/50 border-gray-600 hover:border-green-500/50"
          : "bg-gray-50 border-gray-200 hover:border-green-500/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {label}
        </span>
      </div>
      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
        {value || "N/A"}
      </p>
    </div>
  );
}

export default ServiceDetails;