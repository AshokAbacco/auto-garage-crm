//invoiceData.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiPrinter,
  FiDownload,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import { FaCar, FaCreditCard } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

export default function Invoice({ previewData }) {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDark } = useTheme();
  const printRef = useRef();
  const isPreview = Boolean(previewData);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch invoice
  useEffect(() => {
    if (isPreview) {
      setLoading(false);
      return;
    }

    const fetchInvoice = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/invoices/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch invoice");
        setInvoice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, isPreview]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/user/profile`);
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };

    fetchUserProfile();
  }, []);

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

  // ✅ UPDATED: FORCE-FIX STYLE INJECTION
const handleDownloadPDF = async () => {
  const element = printRef.current;
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
      onclone: (documentClone) => {
        // Force light mode for the entire document
        documentClone.body.style.backgroundColor = "#ffffff";
        documentClone.body.style.color = "#000000";

        // 1. Fix Invoice Title Box - Direct and forceful styling
        const titleBox = documentClone.getElementById("invoice-title-box");
        if (titleBox) {
          titleBox.style.backgroundColor = "#f1f5f9"; // Force grey background
          titleBox.style.color = "#000000"; // Force black text
          titleBox.style.padding = "12px 20px";
          titleBox.style.borderRadius = "8px";
          titleBox.style.display = "inline-block";
          titleBox.style.fontWeight = "bold";
          titleBox.style.fontSize = "24px";
          titleBox.style.minWidth = "120px";
          titleBox.style.textAlign = "center";
        }

        // 2. Fix Payment Badge - Force correct styling
        const badge = documentClone.getElementById("payment-badge");
        if (badge) {
          badge.style.display = "inline-flex";
          badge.style.alignItems = "center";
          badge.style.justifyContent = "center";
          badge.style.gap = "6px";
          badge.style.padding = "6px 14px";
          badge.style.borderRadius = "9999px";
          badge.style.fontSize = "12px";
          badge.style.fontWeight = "bold";

          // Force green styling for "Paid"
          badge.style.backgroundColor = "#f0fdf4"; // Green-50
          badge.style.color = "#15803d"; // Green-700
          badge.style.border = "1px solid #bbf7d0";
        }

        // 3. Fix Vehicle Info Box
        const vehicleBox = documentClone.getElementById("vehicle-box");
        if (vehicleBox) {
          vehicleBox.style.backgroundColor = "#ffffff";
          vehicleBox.style.color = "#000000";
          vehicleBox.style.border = "1px solid #e2e8f0";
          vehicleBox.style.padding = "12px 16px";
          vehicleBox.style.borderRadius = "6px";
          vehicleBox.style.display = "block";
          vehicleBox.style.minWidth = "200px";
        }

        // 4. Fix Footer
        const footer = documentClone.getElementById("invoice-footer");
        if (footer) {
          footer.style.backgroundColor = "#0f172a";
          footer.style.color = "#ffffff";
          footer.style.padding = "20px 40px";

          const footerElements = footer.querySelectorAll("*");
          footerElements.forEach((el) => {
            el.style.color = "#ffffff";
            el.style.backgroundColor = "transparent";
          });
        }

        // 5. Force table styling
        const tables = documentClone.querySelectorAll("table");
        tables.forEach((table) => {
          table.style.width = "100%";
          table.style.borderCollapse = "collapse";
        });

        const tableCells = documentClone.querySelectorAll("td, th");
        tableCells.forEach((cell) => {
          cell.style.padding = "10px 16px";
          cell.style.border = "1px solid #e2e8f0";
        });
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const fileName = `Invoice_${invoiceData?.invoiceNumber || "document"}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-32 bg-gray-300 rounded mb-4"></div>
          <div className="text-sm text-gray-500">Generating Invoice...</div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-semibold bg-red-50 rounded-lg m-10">
        Error: {error}
      </div>
    );

  const invoiceData = isPreview
    ? {
        ...previewData,
        invoiceCostItems: previewData.costItems || [],
        createdAt: new Date(),
        client: {
          fullName:
            previewData.client?.fullName ||
            previewData.clientName ||
            "Preview Customer",
          email: previewData.client?.email || previewData.clientEmail || "",
          phone: previewData.client?.phone || previewData.clientPhone || "",
          address:
            previewData.client?.address ||
            previewData.clientAddress ||
            "Bengaluru",
          vehicleMake: previewData.vehicle || "",
          vehicleModel: "",
          regNumber: previewData.client?.regNumber || "",
        },
      }
    : invoice;

  const owner = isPreview ? previewData?.userProfile : userProfile;
  const c = invoiceData?.client || {};
  const discount = Number(invoiceData.discount || 0);
  const grandTotal = Number(invoiceData.grandTotal || 0);

  return (
    <div
      className={`min-h-screen p-4 lg:p-8 font-sans ${
        isDark ? "text-gray-100" : "bg-gray-100 text-gray-900"
      } print:bg-white print:text-black print:p-0`}
    >
      {/* Action Bar */}
      {!isPreview && (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 print:hidden gap-4 max-w-5xl mx-auto">
          <Link
            to="/billing"
            className="flex items-center gap-2 font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft /> Back to Billing
          </Link>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-md active:transform active:scale-95"
            >
              <FiPrinter /> Print
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-all shadow-md active:transform active:scale-95"
            >
              <FiDownload /> Download PDF
            </button>
          </div>
        </div>
      )}

      {/* Invoice Card */}
      <div
        ref={printRef}
        id="invoice-wrapper" /* ✅ ADDED ID */
        className="print-content relative max-w-[210mm] mx-auto bg-white text-slate-900 shadow-2xl rounded-sm print:shadow-none print:rounded-none overflow-hidden flex flex-col print:min-h-screen"
      >
        {/* PROFORMA WATERMARK */}
        {isPreview && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <span className="text-6xl font-black text-gray-200 -rotate-45 border-4 border-gray-100 p-8 rounded-xl">
              PROFORMA-INVOICE
            </span>
          </div>
        )}

        {/* 1. BRAND HEADER STRIP */}
        <div className="h-2 w-full bg-slate-900 print:bg-slate-900"></div>

        {/* 2. HEADER SECTION */}
        <div className="px-10 py-6 print:px-6 print:py-4 flex justify-between items-start z-10 relative">
          <div className="max-w-[50%]">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">
              {owner?.companyName || "Service Invoice"}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wide">
              {owner?.username}
            </p>
            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <FiMapPin className="text-slate-400" /> Bengaluru, India
              </p>
              <p className="flex items-center gap-2">
                <FiMail className="text-slate-400" /> {owner?.email}
              </p>
              {owner?.phone && (
                <p className="flex items-center gap-2">
                  <FiPhone className="text-slate-400" /> {owner.phone}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <div
              id="invoice-title-box" /* ✅ ADDED ID */
              className="inline-block bg-slate-100 px-4 py-2 rounded-lg mb-4 print:bg-slate-100"
            >
              <h2 className="text-3xl font-mono font-bold text-slate-800">
                INVOICE
              </h2>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Invoice Number</p>
              <p className="text-lg font-bold text-slate-900">
                #{invoiceData.invoiceNumber}
              </p>
            </div>
            <div className="mt-3">
              <span
                id="payment-badge" /* ✅ ADDED ID */
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                  invoiceData.status === "Paid"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    invoiceData.status === "Paid"
                      ? "bg-green-600"
                      : "bg-amber-600"
                  }`}
                ></span>
                {invoiceData.status}
              </span>
            </div>
          </div>
        </div>

        {/* 3. INFO GRID */}
        <div className="px-10 py-6 print:px-6 print:py-4 grid grid-cols-2 gap-12 print:gap-6 border-t border-b border-gray-100 bg-gray-50/50 print:bg-gray-50 print:border-gray-200">
          <div className="relative">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FiUser /> Bill To
            </h3>
            <div className="pl-3 border-l-2 border-slate-300">
              <p className="font-bold text-slate-900 text-lg">{c.fullName}</p>
              <p className="text-sm text-slate-600 mt-1">
                {c.address || "Address not provided"}
              </p>
              <div className="flex gap-4 mt-3 text-sm text-slate-600">
                <p className="flex items-center gap-1.5">
                  <FiPhone size={14} className="text-slate-400" /> {c.phone}
                </p>
                <p className="flex items-center gap-1.5">
                  <FiMail size={14} className="text-slate-400" /> {c.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiCalendar /> Date Issued
              </h3>
              <p className="font-semibold text-slate-800">
                {formatDate(invoiceData.createdAt)}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FaCreditCard /> Payment
              </h3>
              <p className="font-semibold text-slate-800 capitalize">
                {invoiceData.paymentMode || "Cash"}
              </p>
            </div>
            <div className="col-span-2 mt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <FaCar /> Vehicle Info
              </h3>
              <div
                id="vehicle-box" /* ✅ ADDED ID */
                className="bg-white border border-gray-200 p-2 rounded-md inline-block min-w-full text-slate-900"
              >
                <p className="font-bold text-slate-900 text-sm">
                  {invoiceData.vehicle ||
                    `${c.vehicleMake || ""} ${c.vehicleModel || ""}`}
                </p>
                {c.regNumber && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    REG: {c.regNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. SERVICE NOTES */}
        {(invoiceData.serviceCategory || invoiceData.serviceNotes) && (
          <div className="px-10 py-6 print:px-6 print:py-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Service Summary
            </h3>
            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
              <span className="font-semibold not-italic">
                {invoiceData.serviceCategory}
                {invoiceData.serviceSubCategory
                  ? ` - ${invoiceData.serviceSubCategory}`
                  : ""}
              </span>
              {(invoiceData.serviceNotes || invoiceData.notes) && (
                <span className="block mt-1 text-slate-600">
                  "{invoiceData.serviceNotes || invoiceData.notes}"
                </span>
              )}
            </div>
          </div>
        )}

        {/* 5. TABLE SECTION */}
        <div className="px-10 pt-2 pb-10 print:px-6 print:pb-2 flex-grow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-800">
                <th className="py-3 text-left font-bold text-slate-900 uppercase tracking-wide w-5/12">
                  Description
                </th>
                <th className="py-3 text-right font-bold text-slate-900 uppercase tracking-wide">
                  Parts
                </th>
                <th className="py-3 text-right font-bold text-slate-900 uppercase tracking-wide">
                  Labor
                </th>
                <th className="py-3 text-right font-bold text-slate-900 uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoiceData.invoiceCostItems &&
              invoiceData.invoiceCostItems.length > 0 ? (
                invoiceData.invoiceCostItems.map((item, index) => {
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
                    <tr key={index}>
                      <td className="py-4 print:py-2 pr-4 align-top">
                        <p className="font-semibold text-slate-800">
                          {item.partName || `Item #${index + 1}`}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          GST: P({item.partGst}%) / L({item.laborGst}%)
                        </p>
                      </td>
                      <td className="py-4 print:py-2 text-right align-top text-slate-600 font-mono">
                        {Number(item.partCost || 0).toFixed(2)}
                      </td>
                      <td className="py-4 print:py-2 text-right align-top text-slate-600 font-mono">
                        {Number(item.laborCost || 0).toFixed(2)}
                      </td>
                      <td className="py-4 print:py-2 text-right align-top font-bold text-slate-800 font-mono">
                        {itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="py-8 print:py-4 text-center text-gray-400"
                  >
                    No items added to this invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 6. TOTALS SECTION */}
          <div className="mt-8 flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal (Parts + Labor)</span>
                <span className="font-mono">
                  {(
                    grandTotal -
                    Number(invoiceData.tax || 0) +
                    discount
                  ).toFixed(2)}
                </span>
              </div>

              {invoiceData.tax > 0 && (
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Additional Tax</span>
                  <span className="font-mono">
                    {Number(invoiceData.tax).toFixed(2)}
                  </span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-mono">-{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="font-bold text-slate-900 text-2xl font-mono">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. FOOTER SECTION */}
        <div
          id="invoice-footer" /* ✅ ADDED ID */
          className="bg-slate-900 text-white p-8 print:p-2 mt-auto print:mt-auto print:bg-slate-900 print:text-white"
        >
          <div className="flex flex-col md:flex-row print:flex-row justify-between items-center print:items-start gap-6">
            <div className="text-center md:text-left print:text-left">
              <h4 className="font-bold text-lg mb-1">Thank You!</h4>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                We appreciate your business. Please contact us within 7 days for
                any queries regarding this invoice.
              </p>
            </div>
            <div className="text-center md:text-right print:text-right">
              <p className="font-bold text-sm tracking-widest uppercase text-slate-400 mb-2">
                Contact Support
              </p>
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-mono">{owner?.email}</span>
                <span className="font-mono">{owner?.phone}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-6 print:mt-4 pt-4 print:pt-2 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Generated by Moto Desk • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      {/* 8. PRINT STYLES */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            zoom: 0.92;
          }

          nav,
          header,
          .navbar,
          .site-header,
          button,
          [role="button"] {
            display: none !important;
          }

          .print-content {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            page-break-inside: auto;
            min-height: 100vh !important;
          }
          .bg-slate-900 {
            background-color: #0f172a !important;
            color: white !important;
          }
          .bg-slate-100 {
            background-color: #f1f5f9 !important;
          }
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
