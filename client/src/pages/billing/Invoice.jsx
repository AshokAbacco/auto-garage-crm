//invoice.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPrinter,
  FiDownload,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiTool,
  FiFileText,
  FiDollarSign,
  FiHash,
  FiInfo,
  FiPercent,
  FiTag,
} from "react-icons/fi";
import { FaRupeeSign, FaCar, FaWrench } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth token
const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("authToken");

// Helper function to make authenticated API requests
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  if (!token) throw new Error("No authentication token found");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }
  return response;
};

export default function Invoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();
  const printRef = useRef();

  // Fetch invoice
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/invoices/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch invoice");
        setInvoice(data);
        console.log("Invoice data:", data); // For debugging
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = () => alert("PDF download feature coming soon!");

  if (loading)
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
        }`}
      >
        Loading invoice...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-semibold">
        Error: {error}
      </div>
    );

  const c = invoice?.client || {};
  const discount = Number(invoice.discount || 0);
  const grandTotal = Number(invoice.grandTotal || 0);

  return (
    <div
      className={`min-h-screen p-6 lg:ml-16 ${
        isDark ? " text-gray-100" : "bg-gray-50 text-gray-900"
      } print:bg-white print:text-black`}
    >
      {/* Action Bar - Hidden when printing */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link
          to="/billing"
          className={`flex items-center gap-2 font-medium ${
            isDark
              ? "text-gray-400 hover:text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FiArrowLeft /> Back to Billing
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-700"
          >
            <FiPrinter /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700"
          >
            <FiDownload /> Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div
        ref={printRef}
        className="print-content max-w-5xl mx-auto shadow-2xl rounded-3xl overflow-hidden bg-white text-black print:shadow-none print:rounded-none"
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                AUTO GARAGE
              </h1>
              <p className="text-sm">Professional Auto Services</p>
              <div className="mt-2 space-y-1 text-xs">
                <p className="flex items-center gap-2">
                  <FiMapPin size={12} /> Bengaluru, India
                </p>
                <p className="flex items-center gap-2">
                  <FiMail size={12} /> contact@autogarage.com
                </p>
                <p className="flex items-center gap-2">
                  <FiPhone size={12} /> +91 98765 43210
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold">INVOICE NUMBER</p>
              <h2 className="text-2xl font-black mb-1">
                #{invoice.invoiceNumber}
              </h2>
              <p
                className={`font-bold text-sm ${
                  invoice.status === "Paid"
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
              >
                {invoice.status}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs">Invoice Date</p>
              <p className="font-semibold text-sm">
                {formatDate(invoice.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs">Payment Mode</p>
              <p className="font-semibold text-sm capitalize">
                {invoice.paymentMode || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="grid md:grid-cols-2 gap-4 p-6 border-b border-gray-300">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-2">
              <FiUser /> Bill To
            </h3>
            <p className="font-semibold text-sm">{c.fullName}</p>
            <p className="text-xs">{c.address || "Address not provided"}</p>
            <p className="text-xs mt-1 flex items-center gap-2">
              <FiPhone size={12} /> {c.phone}
            </p>
            <p className="text-xs flex items-center gap-2">
              <FiMail size={12} /> {c.email}
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold flex items-center gap-2 mb-2">
              <FaCar /> Vehicle Details
            </h3>
            <p className="font-semibold text-sm">
              {c.vehicleMake} {c.vehicleModel} ({c.regNumber})
            </p>
          </div>
        </div>

        {/* Service Details */}
        <div className="p-6 border-b border-gray-300">
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <FiTool /> Service Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs">Service Category</p>
              <p className="font-semibold text-sm">
                {invoice.serviceCategory || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs">Service Sub-Category</p>
              <p className="font-semibold text-sm">
                {invoice.serviceSubCategory || "N/A"}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs">Service Description</p>
            <p className="font-semibold text-sm">
              {invoice.serviceNotes || invoice.notes || "N/A"}
            </p>
          </div>
          <div className="mt-3">
            <p className="text-xs">Mechanic</p>
            <p className="font-semibold text-sm">{invoice.mechanic || "N/A"}</p>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="p-6">
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <FaRupeeSign /> Cost Breakdown
          </h2>
          <table className="w-full text-xs border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2 font-semibold">Description</th>
                <th className="text-right p-2 font-semibold">Parts Cost</th>
                <th className="text-right p-2 font-semibold">Parts GST (%)</th>
                <th className="text-right p-2 font-semibold">Labor Cost</th>
                <th className="text-right p-2 font-semibold">Labor GST (%)</th>
                <th className="text-right p-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Show individual cost items */}
              {invoice.invoiceCostItems &&
              invoice.invoiceCostItems.length > 0 ? (
                invoice.invoiceCostItems.map((item, index) => {
                  const partTotal =
                    Number(item.partCost || 0) +
                    (Number(item.partCost || 0) * Number(item.partGst || 0)) /
                      100;
                  const laborTotal =
                    Number(item.laborCost || 0) +
                    (Number(item.laborCost || 0) * Number(item.laborGst || 0)) /
                      100;
                  const itemTotal = partTotal + laborTotal;

                  return (
                    <tr key={index} className="border-b">
                      <td className="p-2 flex items-center gap-2">
                        <FiTool /> {item.partName || `Item #${index + 1}`}
                      </td>
                      <td className="p-2 text-right">
                        ₹ {Number(item.partCost || 0).toFixed(2)}
                      </td>
                      <td className="p-2 text-right">
                        {Number(item.partGst || 0)}%
                      </td>
                      <td className="p-2 text-right">
                        ₹ {Number(item.laborCost || 0).toFixed(2)}
                      </td>
                      <td className="p-2 text-right">
                        {Number(item.laborGst || 0)}%
                      </td>
                      <td className="p-2 text-right font-bold">
                        ₹ {itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-2 text-center text-gray-500">
                    No cost breakdown available
                  </td>
                </tr>
              )}

              {/* Additional taxes */}
              {invoice.tax > 0 && (
                <tr>
                  <td className="p-2 font-semibold">Additional Taxes</td>
                  <td className="p-2 text-right" colSpan="5">
                    ₹ {Number(invoice.tax || 0).toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Discount */}
              {discount > 0 && (
                <tr>
                  <td className="p-2 font-semibold text-red-500">Discounts</td>
                  <td className="p-2 text-right text-red-500" colSpan="5">
                    -₹ {discount.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Grand total */}
              <tr className="bg-gray-100">
                <td className="p-3 font-bold">Grand Total</td>
                <td colSpan="5" className="p-3 text-right font-bold text-lg">
                  ₹ {grandTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Info */}
        <div className="p-6 border-t border-gray-300 bg-gray-50">
          <h3 className="font-bold text-base mb-2 flex items-center gap-2">
            <FiCreditCard /> Payment Details
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="font-semibold">Bank Name</p>
              <p>Auto Garage Bank</p>
            </div>
            <div>
              <p className="font-semibold">Account No.</p>
              <p>1234567890</p>
            </div>
            <div>
              <p className="font-semibold">IFSC Code</p>
              <p>AUTG0001234</p>
            </div>
            <div>
              <p className="font-semibold">Branch</p>
              <p>Bengaluru Main</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="font-semibold text-base">
            Thank You for Your Business!
          </p>
          <p className="text-xs">
            For any queries, contact us at contact@autogarage.com
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: A4;
          }

          /* Hide everything except the invoice when printing */
          body * {
            visibility: hidden;
          }

          /* Show only the invoice and its children */
          .print-content,
          .print-content * {
            visibility: visible;
          }

          /* Position the invoice at the top left when printing */
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* Remove shadows and rounded corners for print */
          .shadow-2xl,
          .shadow-xl {
            box-shadow: none !important;
          }

          .rounded-3xl,
          .rounded-xl,
          .rounded-lg {
            border-radius: 0 !important;
          }

          /* Ensure text is black */
          .text-blue-600,
          .text-purple-600,
          .text-green-500,
          .text-yellow-500,
          .text-red-500 {
            color: black !important;
          }

          /* Ensure backgrounds are white */
          .bg-gradient-to-r,
          .bg-gray-100,
          .bg-gray-50,
          .bg-gray-800,
          .bg-gray-900 {
            background-color: white !important;
          }

          /* Ensure borders are visible */
          .border-gray-300,
          .border-gray-200,
          .border-gray-700 {
            border-color: #d1d5db !important;
          }

          /* Reduce padding for print */
          .p-8 {
            padding: 1rem !important;
          }

          .p-6 {
            padding: 0.75rem !important;
          }

          .p-4 {
            padding: 0.5rem !important;
          }

          .p-3 {
            padding: 0.4rem !important;
          }

          .p-2 {
            padding: 0.3rem !important;
          }

          /* Reduce font sizes for print */
          .text-4xl {
            font-size: 1.75rem !important;
          }

          .text-3xl {
            font-size: 1.5rem !important;
          }

          .text-2xl {
            font-size: 1.25rem !important;
          }

          .text-xl {
            font-size: 1.1rem !important;
          }

          .text-lg {
            font-size: 1rem !important;
          }

          .text-base {
            font-size: 0.9rem !important;
          }

          .text-sm {
            font-size: 0.8rem !important;
          }

          .text-xs {
            font-size: 0.7rem !important;
          }

          /* Reduce gaps for print */
          .gap-6 {
            gap: 1rem !important;
          }

          .gap-4 {
            gap: 0.75rem !important;
          }

          .gap-3 {
            gap: 0.5rem !important;
          }

          .gap-2 {
            gap: 0.4rem !important;
          }

          /* Reduce margins for print */
          .mb-6,
          .mb-4,
          .mb-3,
          .mb-2,
          .mb-1 {
            margin-bottom: 0.5rem !important;
          }

          .mt-6,
          .mt-4,
          .mt-3,
          .mt-2,
          .mt-1 {
            margin-top: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
