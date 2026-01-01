import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiArrowLeft,
  FiPrinter,
  FiDownload,
  FiMapPin,
  FiMail,
  FiPhone,
  FiUser,
  FiTool,
  FiHash,
  FiCreditCard,
  FiLoader
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../utils/axiosInstance";

export default function InvoiceBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const invoiceRef = useRef(null);
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/bike-invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      console.error("Fetch invoice error:", err);
      toast.error(err.response?.data?.message || "Failed to load invoice");
      
      if (err.response?.status === 403 || err.response?.status === 404) {
        setTimeout(() => navigate("/bike-billing"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const element = invoiceRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
      
      toast.success("PDF downloaded successfully");
    } catch (err) {
      console.error("Download PDF error:", err);
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="animate-spin text-blue-500" size={48} />
          <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      }`}>
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg text-red-600">Invoice not found</p>
          <button
            onClick={() => navigate("/bike-billing")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Billing
          </button>
        </div>
      </div>
    );
  }

  // Calculate costs
  const partsWithGst = Number(invoice.partsCost) * (1 + Number(invoice.partsGst) / 100);
  const laborWithGst = Number(invoice.laborCost) * (1 + Number(invoice.laborGst) / 100);
  const additionalTaxes = Number(invoice.tax || 0);
  const grandTotal = Number(invoice.grandTotal);

  return (
    <div className={`min-h-screen p-6 print:p-0 print:ml-0 ${
      isDark ? "bg-gray-900" : "bg-gray-100"
    } print:bg-white`}>
      <Toaster position="top-right" />

      {/* Action Buttons - Hidden in Print */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/bike-billing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <FiArrowLeft size={20} />
            Back to Billing
          </button>

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 font-medium"
            >
              <FiPrinter size={18} />
              Print
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <FiLoader className="animate-spin" size={18} />
                  Downloading...
                </>
              ) : (
                <>
                  <FiDownload size={18} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Container */}
      <div className="max-w-4xl mx-auto">
        <div 
          ref={invoiceRef}
          className="bg-white shadow-2xl rounded-xl print:shadow-none print:rounded-none"
          style={{ padding: '48px' }}
        >
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            {/* Company Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AUTO GARAGE</h1>
              <p className="text-sm text-gray-600 mb-4">Professional Auto Services</p>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiMapPin size={14} />
                  <span>Bangalore, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMail size={14} />
                  <span>contact@autogarage.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone size={14} />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">INVOICE NUMBER</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                #{invoice.invoiceNumber}
              </h2>
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
                invoice.status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Date and Payment Mode */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-gray-200">
            <div>
              <div className="text-xs text-gray-500 mb-1">Invoice Date</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Payment Mode</div>
              <div className="text-sm font-medium text-gray-900">
                {invoice.paymentMode || "N/A"}
              </div>
            </div>
          </div>

          {/* Bill To and Vehicle Details */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Bill To */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiUser size={16} className="text-gray-700" />
                <h3 className="font-bold text-gray-900">Bill To</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-gray-900">{invoice.bike?.ownerName}</p>
                <p className="text-gray-600">+91 {invoice.bike?.phone}</p>
                <p className="text-gray-600">{invoice.bike?.email}</p>
              </div>
            </div>

            {/* Vehicle Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiTool size={16} className="text-gray-700" />
                <h3 className="font-bold text-gray-900">Vehicle Details</h3>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-gray-900">
                  {invoice.bike?.bikeBrand} {invoice.bike?.bikeModel}
                </p>
                <p className="text-gray-600">Reg: {invoice.bike?.regNumber}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <FiTool size={16} className="text-gray-700" />
              <h3 className="font-bold text-gray-900">Service Details</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Category</span>
                <span className="font-medium text-gray-900">{invoice.serviceCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Sub-Category</span>
                <span className="font-medium text-gray-900">
                  {invoice.serviceSubCategory || "N/A"}
                </span>
              </div>
              {invoice.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500 mb-1">Service Description</div>
                  <p className="text-gray-700">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-900">₹</span>
              <h3 className="font-bold text-gray-900">Cost Breakdown</h3>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 bg-gray-50 text-sm font-semibold text-gray-700 border-b border-gray-200">
                <div className="col-span-6 px-4 py-3">Description</div>
                <div className="col-span-2 px-4 py-3 text-right">Cost</div>
                <div className="col-span-2 px-4 py-3 text-right">GST (%)</div>
                <div className="col-span-2 px-4 py-3 text-right">Total</div>
              </div>

              {/* Parts Row */}
              <div className="grid grid-cols-12 text-sm border-b border-gray-200">
                <div className="col-span-6 px-4 py-3 flex items-center gap-2 text-gray-700">
                  <FiTool size={14} />
                  Parts
                </div>
                <div className="col-span-2 px-4 py-3 text-right text-gray-900">
                  ₹ {Number(invoice.partsCost).toFixed(2)}
                </div>
                <div className="col-span-2 px-4 py-3 text-right text-gray-600">
                  {invoice.partsGst}%
                </div>
                <div className="col-span-2 px-4 py-3 text-right font-semibold text-gray-900">
                  ₹ {partsWithGst.toFixed(2)}
                </div>
              </div>

              {/* Labor Row */}
              <div className="grid grid-cols-12 text-sm border-b border-gray-200">
                <div className="col-span-6 px-4 py-3 flex items-center gap-2 text-gray-700">
                  <FiTool size={14} />
                  Labor
                </div>
                <div className="col-span-2 px-4 py-3 text-right text-gray-900">
                  ₹ {Number(invoice.laborCost).toFixed(2)}
                </div>
                <div className="col-span-2 px-4 py-3 text-right text-gray-600">
                  {invoice.laborGst}%
                </div>
                <div className="col-span-2 px-4 py-3 text-right font-semibold text-gray-900">
                  ₹ {laborWithGst.toFixed(2)}
                </div>
              </div>

              {/* Additional Taxes */}
              {additionalTaxes > 0 && (
                <div className="grid grid-cols-12 text-sm border-b border-gray-200">
                  <div className="col-span-6 px-4 py-3 text-gray-700">
                    Additional Taxes
                  </div>
                  <div className="col-span-4 px-4 py-3"></div>
                  <div className="col-span-2 px-4 py-3 text-right font-semibold text-gray-900">
                    ₹ {additionalTaxes.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Discount */}
              {invoice.discount > 0 && (
                <div className="grid grid-cols-12 text-sm border-b border-gray-200">
                  <div className="col-span-6 px-4 py-3 text-gray-700">
                    Discount
                  </div>
                  <div className="col-span-4 px-4 py-3"></div>
                  <div className="col-span-2 px-4 py-3 text-right font-semibold text-red-600">
                    - ₹ {Number(invoice.discount).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Grand Total */}
              <div className="grid grid-cols-12 text-base bg-gray-50">
                <div className="col-span-10 px-4 py-4 font-bold text-gray-900">
                  Grand Total
                </div>
                <div className="col-span-2 px-4 py-4 text-right font-bold text-gray-900">
                  ₹ {grandTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {invoice.paymentMode && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <FiCreditCard size={16} className="text-gray-700" />
                <h3 className="font-bold text-gray-900">Payment Details</h3>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Bank Name</div>
                  <div className="font-medium text-gray-900">Auto Garage Bank</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Account No.</div>
                  <div className="font-medium text-gray-900">1234567890</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">IFSC Code</div>
                  <div className="font-medium text-gray-900">AGBK0001234</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Branch</div>
                  <div className="font-medium text-gray-900">Bangalore Main</div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="font-semibold text-gray-900 mb-2">Thank You for Your Business!</p>
            <p className="text-sm text-gray-600">
              For any queries, contact us at contact@autogarage.com
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:ml-0 {
            margin-left: 0 !important;
          }
          
          .print\\:bg-white {
            background-color: white !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:rounded-none {
            border-radius: 0 !important;
          }

          @page {
            margin: 0;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}