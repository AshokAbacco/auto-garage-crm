import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FiArrowLeft,
  FiPrinter,
  FiDownload,
  FiLoader
} from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../utils/axiosInstance";

// Helper function to convert number to words
const numberToWords = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return "Zero Only";
  }

  num = Math.floor(Number(num));

  if (num <= 0) {
    return "Zero Only";
  }

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const numToWord = (n) => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + numToWord(n % 100);
    if (n < 100000) return numToWord(Math.floor(n / 1000)) + ' Thousand ' + numToWord(n % 1000);
    if (n < 10000000) return numToWord(Math.floor(n / 100000)) + ' Lakh ' + numToWord(n % 100000);
    return numToWord(Math.floor(n / 10000000)) + ' Crore ' + numToWord(n % 10000000);
  };

  const words = numToWord(num);
  return `${words}`.trim() + " Only";
};


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

  // Separate parts and labor items
  const partsItems = invoice.invoiceItems?.filter(item => item.type === 'Part') || [];
  const laborItems = invoice.invoiceItems?.filter(item => item.type === 'Labor') || [];

  // Calculate totals
  const partsSubtotal = partsItems.reduce((sum, item) => 
    sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  
  const laborSubtotal = laborItems.reduce((sum, item) => 
    sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  
  const partsCGST = partsItems.reduce((sum, item) => 
    sum + ((Number(item.quantity) * Number(item.unitPrice)) * Number(item.cgst) / 100), 0);
  
  const partsSGST = partsItems.reduce((sum, item) => 
    sum + ((Number(item.quantity) * Number(item.unitPrice)) * Number(item.sgst) / 100), 0);
  
  const laborCGST = laborItems.reduce((sum, item) => 
    sum + ((Number(item.quantity) * Number(item.unitPrice)) * Number(item.cgst) / 100), 0);
  
  const laborSGST = laborItems.reduce((sum, item) => 
    sum + ((Number(item.quantity) * Number(item.unitPrice)) * Number(item.sgst) / 100), 0);

const netAmount =
  Number(invoice.partsSubtotal || 0) +
  Number(invoice.laborSubtotal || 0) +
  Number(invoice.cgstTotal || 0) +
  Number(invoice.sgstTotal || 0);

const discount = Number(invoice.discount || 0);
const advancePaid = Number(invoice.advancePaid || 0);

const amountAfterDiscount = netAmount - discount;
const amountPayable = Math.round(amountAfterDiscount - advancePaid);
const roundOff = amountPayable - (amountAfterDiscount - advancePaid);


  // Get CGST/SGST percentage (assuming same for all items)
  const cgstPercent = invoice.invoiceItems?.[0]?.cgst || 0;
  const sgstPercent = invoice.invoiceItems?.[0]?.sgst || 0;

  return (
    <div className={`min-h-screen p-6 print:p-0 ${
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
          className="bg-white shadow-2xl print:shadow-none"
          style={{ padding: '40px' }}
        >
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            {/* Company Details */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">AUTO GARAGE</h1>
              <p className="text-sm text-gray-600 mb-4">Bangalore, Karnataka</p>
              <div className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700">GSTIN:</span>
                  <span className="text-gray-600">N/A</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-gray-700">Contact:</span>
                  <span className="text-gray-600">7204986825</span>
                </div>
              </div>
            </div>

            {/* Invoice Type */}
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">TAX INVOICE</h2>
              <p className="text-sm text-gray-600">CASH / CREDIT</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-900 mb-6"></div>

          {/* Customer & Invoice Details */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Customer Details */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">CUSTOMER DETAILS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="font-medium text-gray-700 w-24">Name:</span>
                  <span className="text-gray-900 font-semibold">{invoice.bike?.ownerName}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-700 w-24">Address:</span>
                  <span className="text-gray-600">N/A</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-700 w-24">Contact:</span>
                  <span className="text-gray-900 font-semibold">{invoice.bike?.phone}</span>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">INVOICE DETAILS</h3>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="font-medium text-gray-700 w-32">Invoice No:</span>
                  <span className="text-gray-900 font-semibold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-700 w-32">Date:</span>
                  <span className="text-gray-600">
                    {new Date(invoice.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-700 w-32">Vehicle No:</span>
                  <span className="text-gray-900 font-semibold">{invoice.bike?.regNumber}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-700 w-32">Model/Make:</span>
                  <span className="text-gray-600">
                    {invoice.bike?.bikeBrand} {invoice.bike?.bikeModel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parts Table */}
          {partsItems.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">PARTS DETAILS</h3>
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-left font-semibold">S.No</th>
                    <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Description</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Qty</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Rate</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Taxable</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold">CGST</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Amt</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold">SGST</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Amt</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {partsItems.map((item, index) => {
                    const taxable = Number(item.quantity) * Number(item.unitPrice);
                    const cgstAmt = (taxable * Number(item.cgst)) / 100;
                    const sgstAmt = (taxable * Number(item.sgst)) / 100;
                    const total = taxable + cgstAmt + sgstAmt;

                    return (
                      <tr key={index}>
                        <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-2 py-2 font-medium">{item.name}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 px-2 py-2 text-right">{Number(item.unitPrice).toFixed(2)}</td>
                        <td className="border border-gray-300 px-2 py-2 text-right">{taxable.toFixed(2)}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{item.cgst}%</td>
                        <td className="border border-gray-300 px-2 py-2 text-right">{cgstAmt.toFixed(2)}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{item.sgst}%</td>
                        <td className="border border-gray-300 px-2 py-2 text-right">{sgstAmt.toFixed(2)}</td>
                        <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Labor Table */}
          {laborItems.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">LABOUR DETAILS</h3>
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-left font-semibold">S.No</th>
                    <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Description</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Qty</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Rate</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Taxable</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold">CGST</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Amt</th>
                    <th className="border border-gray-300 px-2 py-2 text-center font-semibold">SGST</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Amt</th>
                    <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {laborItems.map((item, index) => {
                    const taxable = Number(item.quantity) * Number(item.unitPrice);
                    const cgstAmt = (taxable * Number(item.cgst)) / 100;
                    const sgstAmt = (taxable * Number(item.sgst)) / 100;
                    const total = taxable + cgstAmt + sgstAmt;

                    return (
                      <tr key={index}>
                        <td className="border border-gray-300 px-2 py-2">{index + 1}</td>
                        <td className="border border-gray-300 px-2 py-2 font-medium">{item.name}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{item.quantity}</td>
                        <td className="border border-gray-300 px-2 py-2 text-right">{Number(item.unitPrice).toFixed(2)}</td>
                        <td className="border border-gray-300 px-2 py-2 text-right">{taxable.toFixed(2)}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{item.cgst}%</td>
                        <td className="border border-gray-300 px-2 py-2 text-right">{cgstAmt.toFixed(2)}</td>
                        <td className="border border-gray-300 px-2 py-2 text-center">{item.sgst}%</td>
                        <td className="border border-gray-300 px-2 py-2 text-right">{sgstAmt.toFixed(2)}</td>
                        <td className="border border-gray-300 px-2 py-2 text-right font-semibold">{total.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Divider */}
          <div className="border-t-2 border-gray-900 mb-6"></div>

          {/* Grand Total Calculation */}
          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">GRAND TOTAL CALCULATION</h3>
            
            <div className="grid grid-cols-2 gap-8">
              {/* Left Side - Tax Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    CGST(Parts) @ {cgstPercent.toFixed(2)}% on Amount {partsSubtotal.toFixed(2)}
                  </span>
                  <span className="font-semibold">₹{partsCGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    SGST(Parts) @ {sgstPercent.toFixed(2)}% on Amount {partsSubtotal.toFixed(2)}
                  </span>
                  <span className="font-semibold">₹{partsSGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    CGST(Labor) @ {cgstPercent.toFixed(2)}% on Amount {laborSubtotal.toFixed(2)}
                  </span>
                  <span className="font-semibold">₹{laborCGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    SGST(Labor) @ {sgstPercent.toFixed(2)}% on Amount {laborSubtotal.toFixed(2)}
                  </span>
                  <span className="font-semibold">₹{laborSGST.toFixed(2)}</span>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-300">
                  <div className="font-bold text-gray-900">
                    <div className="mb-1">Total Amount (In Words):</div>
                    <div className="italic">{numberToWords(amountPayable)}</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Amount Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Net Amount (Incl. Tax)</span>
                  <span className="font-semibold">₹{netAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span className="font-semibold">- ₹{discount.toFixed(2)}</span>
                </div>
                {advancePaid > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Advance Paid</span>
                      <span className="font-semibold">- ₹{advancePaid.toFixed(2)}</span>
                    </div>
                  )}

                  {invoice.balanceDue > 0 && (
                    <div className="flex justify-between font-bold text-orange-600">
                      <span>Balance Due</span>
                      <span>₹{Number(invoice.balanceDue).toFixed(2)}</span>
                    </div>
                  )}

                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-900">Amount After Discount</span>
                  <span className="font-semibold">₹{amountAfterDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Round off</span>
                  <span className="font-semibold">₹{roundOff.toFixed(2)}</span>
                </div>
                
                <div className="bg-gray-100 p-3 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">AMOUNT PAYABLE</span>
                    <span className="font-bold text-xl">₹{amountPayable.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <span className="font-semibold text-gray-900">Total Amount (In figure)</span>
                  <span className="font-bold">₹{amountPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Text */}
          <p className="text-xs text-gray-600 italic mb-8">
            Certified that the particulars given above are true and correct.
          </p>

          {/* Footer Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Terms & Conditions */}
            <div>
              <h4 className="font-bold text-gray-900 mb-2 text-sm">Terms & Conditions:</h4>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                <li>Goods once sold will not be taken back.</li>
                <li>Interest @ 18% p.a. will be charged if not paid on time.</li>
              </ol>
            </div>

            {/* Signature */}
            <div className="text-right">
              <div className="mb-16">
                <p className="text-sm font-semibold text-gray-900">FOR AUTO GARAGE</p>
              </div>
              <div className="border-t border-gray-400 pt-2">
                <p className="text-sm font-semibold">Authorised Signatory</p>
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="text-center mb-4">
            <p className="text-blue-600 font-semibold text-sm mb-1">
              Thank you for choosing Auto Garage for your vehicle service!
            </p>
            <p className="text-xs text-gray-600">
              Support Email: support@autogarage.com
            </p>
          </div>

          {/* Bottom Footer */}
          <div className="flex justify-between items-center text-xs text-gray-600 pt-4 border-t border-gray-300">
            <span>THE MOTOR DESK © 2025</span>
            <span>DIGITAL BILLING SYSTEM - SECURE & VERIFIED</span>
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
          
          .print\\:bg-white {
            background-color: white !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }

          @page {
            margin: 0;
            size: A4;
          }

          table {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}