import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiDownload, FiEdit } from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

// Helper function to convert number to words (Indian system)
const numberToWords = (num) => {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

  if (num === 0) return "Zero";

  const convertLessThanThousand = (n) => {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertLessThanThousand(n % 100) : "");
  };

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = num % 1000;

  let result = "";
  if (crore > 0) result += convertLessThanThousand(crore) + " Crore ";
  if (lakh > 0) result += convertLessThanThousand(lakh) + " Lakh ";
  if (thousand > 0) result += convertLessThanThousand(thousand) + " Thousand ";
  if (hundred > 0) result += convertLessThanThousand(hundred);

  return result.trim() + " Only";
};

export default function ProformaInvoicePreview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state) {
      navigate("/bike-billing");
      return;
    }

    // Fetch client details
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/bike-owners/${state.form.bikeId}`);
        setClientDetails(res.data);
      } catch (error) {
        console.error("Error fetching client details:", error);
        
      } finally {
        setLoading(false);
      }
    };

    if (state.form.bikeId) {
      fetchClientDetails();
    } else {
      setLoading(false);
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

const { form, invoiceItems, calculations, bike } = state;

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Invoice-${form.invoiceNumber}.pdf`);
  };

    const handleEdit = () => {
    navigate("/bill/new", {
        state: {
        form,
        invoiceItems,
        calculations,
        bike
        }
    });
    };

  const handleConfirm = async () => {
    // Navigate back and trigger save
    navigate(-1);
  };

  // Filter parts and labor
  const parts = invoiceItems.filter((i) => i.type === "Part");
  const labor = invoiceItems.filter((i) => i.type === "Labor");

  // Calculate individual item totals with tax
  const calculateItemTotal = (item) => {
    const taxable = item.quantity * item.unitPrice;
    const cgstAmt = (taxable * (item.cgst || 0)) / 100;
    const sgstAmt = (taxable * (item.sgst || 0)) / 100;
    const total = taxable + cgstAmt + sgstAmt;
    return { taxable, cgstAmt, sgstAmt, total };
  };

  // Group items by tax rate for the grand total calculation
  const groupByTaxRate = (items) => {
    const groups = {};
    items.forEach((item) => {
      const rate = item.cgst || 0; // Assuming CGST and SGST are same
      const taxable = item.quantity * item.unitPrice;
      if (!groups[rate]) {
        groups[rate] = { rate, amount: 0, cgst: 0, sgst: 0 };
      }
      groups[rate].amount += taxable;
      groups[rate].cgst += (taxable * rate) / 100;
      groups[rate].sgst += (taxable * rate) / 100;
    });
    return Object.values(groups);
  };

  const taxGroups = groupByTaxRate(invoiceItems);

  // Calculate round-off
  const beforeRoundOff = calculations.grandTotal;
  const roundedTotal = Math.round(beforeRoundOff);
  const roundOff = roundedTotal - beforeRoundOff;

  // Amount in words
  const amountInWords = numberToWords(roundedTotal);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 print:bg-white print:p-0">
      {/* TOP HEADER - Non-printable */}
      <div className="max-w-5xl mx-auto mb-4 print:hidden">
        <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Proforma Invoice (Preview)</h1>
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FiEdit size={16} />
              Edit
            </button>
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Confirm & Generate
            </button>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS - Non-printable */}
      <div className="max-w-5xl mx-auto mb-4 print:hidden flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-black transition-all"
        >
          <FiArrowLeft /> Back to Billing
        </button>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-all"
          >
            <FiPrinter /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <FiDownload /> Download PDF
          </button>
        </div>
      </div>

      {/* INVOICE */}
      <div ref={invoiceRef} className="max-w-5xl mx-auto bg-white shadow-lg print:shadow-none">
        {/* Invoice Header */}
        <div className="border-b-2 border-gray-800 pb-4 pt-6 px-8">
          <div className="flex justify-between items-start">
            {/* Company Details */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">RASUL GARAGE</h1>
              <p className="text-xs text-gray-600 mb-1">Address: N/A</p>
              <div className="grid grid-cols-2 gap-x-4 text-xs">
                <div>
                  <span className="font-semibold">GSTIN:</span>
                  <span className="ml-2">N/A</span>
                </div>
                <div>
                  <span className="font-semibold">Contact:</span>
                  <span className="ml-2">7896541230</span>
                </div>
              </div>
            </div>

            {/* Invoice Title */}
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900">TAX INVOICE</h2>
              <p className="text-xs text-gray-600 mt-1">{form.invoiceNumber || "CASH / CREDIT"}</p>
            </div>
          </div>
        </div>

        {/* Customer & Invoice Details */}
        <div className="px-8 py-4 border-b border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            {/* Customer Details */}
            <div>
              <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase">Customer Details</h3>
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">
                    {bike?.ownerName || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-semibold">
                    {clientDetails?.address || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-[80px_1fr]">
                  <span className="text-gray-600">Contact:</span>
                  <span className="font-semibold">
                    {bike?.phone || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div>
              <h3 className="text-xs font-bold text-gray-700 mb-2 uppercase">Invoice Details</h3>
              <div className="space-y-1 text-xs">
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-gray-600">Invoice No:</span>
                  <span className="font-semibold">{form.invoiceNumber}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">
                    {form.date ? new Date(form.date).toLocaleDateString('en-GB') : "Invalid Date"}
                  </span>
                </div>
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-gray-600">Vehicle No:</span>
                  <span className="font-semibold">
                    {bike?.regNumber || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-gray-600">Model/Make:</span>
                  <span className="font-semibold">
                    {bike?.bikeBrand}, {bike?.bikeModel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GENUINE PARTS DETAILS */}
        {parts.length > 0 && (
          <div className="px-8 py-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase">
              Genuine Parts Details
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-y border-gray-400">
                  <th className="py-2 px-1 text-left font-semibold bg-gray-50">S.No</th>
                  <th className="py-2 px-2 text-left font-semibold bg-gray-50">Description</th>
                  <th className="py-2 px-1 text-center font-semibold bg-gray-50">Qty</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Rate</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Taxable</th>
                  <th className="py-2 px-1 text-center font-semibold bg-gray-50">CGST</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Amt</th>
                  <th className="py-2 px-1 text-center font-semibold bg-gray-50">SGST</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Amt</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Total</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p, i) => {
                  const { taxable, cgstAmt, sgstAmt, total } = calculateItemTotal(p);
                  return (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-2 px-1 text-left">{i + 1}</td>
                      <td className="py-2 px-2 text-left">{p.name}</td>
                      <td className="py-2 px-1 text-center">{p.quantity}</td>
                      <td className="py-2 px-2 text-right">{p.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right">{taxable.toFixed(2)}</td>
                      <td className="py-2 px-1 text-center">{p.cgst}%</td>
                      <td className="py-2 px-2 text-right">{cgstAmt.toFixed(2)}</td>
                      <td className="py-2 px-1 text-center">{p.sgst}%</td>
                      <td className="py-2 px-2 text-right">{sgstAmt.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-semibold">{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* LABOUR DETAILS */}
        {labor.length > 0 && (
          <div className="px-8 py-4">
            <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase">Labour Details</h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-y border-gray-400">
                  <th className="py-2 px-1 text-left font-semibold bg-gray-50">S.No</th>
                  <th className="py-2 px-2 text-left font-semibold bg-gray-50">Description</th>
                  <th className="py-2 px-1 text-center font-semibold bg-gray-50">Qty</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Rate</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Taxable</th>
                  <th className="py-2 px-1 text-center font-semibold bg-gray-50">CGST</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Amt</th>
                  <th className="py-2 px-1 text-center font-semibold bg-gray-50">SGST</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Amt</th>
                  <th className="py-2 px-2 text-right font-semibold bg-gray-50">Total</th>
                </tr>
              </thead>
              <tbody>
                {labor.map((l, i) => {
                  const { taxable, cgstAmt, sgstAmt, total } = calculateItemTotal(l);
                  return (
                    <tr key={i} className="border-b border-gray-200">
                      <td className="py-2 px-1 text-left">{i + 1}</td>
                      <td className="py-2 px-2 text-left">{l.name}</td>
                      <td className="py-2 px-1 text-center">{l.quantity}</td>
                      <td className="py-2 px-2 text-right">{l.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right">{taxable.toFixed(2)}</td>
                      <td className="py-2 px-1 text-center">{l.cgst}%</td>
                      <td className="py-2 px-2 text-right">{cgstAmt.toFixed(2)}</td>
                      <td className="py-2 px-1 text-center">{l.sgst}%</td>
                      <td className="py-2 px-2 text-right">{sgstAmt.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-semibold">{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* GRAND TOTAL CALCULATION */}
        <div className="px-8 py-4 border-t-2 border-gray-800">
          <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase">
            Grand Total Calculation
          </h3>

          <div className="grid grid-cols-2 gap-8">
            {/* Tax Breakdown */}
            <div className="space-y-2 text-xs">
              {taxGroups.map((group, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      CGST/IGST @ {group.rate.toFixed(2)}% on Amount ₹{group.amount.toFixed(2)}
                    </span>
                    <span className="font-semibold">₹{group.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">
                      SGST/UTGST @ {group.rate.toFixed(2)}% on Amount ₹{group.amount.toFixed(2)}
                    </span>
                    <span className="font-semibold">₹{group.sgst.toFixed(2)}</span>
                  </div>
                </React.Fragment>
              ))}

              <div className="pt-2 border-t border-gray-300">
                <div className="text-gray-700">
                  <span className="font-semibold">Total Amount (In Words):</span>
                  <br />
                  <span className="italic">{amountInWords}</span>
                </div>
              </div>
            </div>

            {/* Amount Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-700 font-semibold">Net Amount (Incl. Tax):</span>
                <span className="font-semibold">₹{calculations.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="font-semibold">Discount:</span>
                <span className="font-semibold">-₹{calculations.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2">
                <span className="text-gray-700 font-semibold">Amount After Discount:</span>
                <span className="font-semibold">₹{calculations.grandTotal.toFixed(2)}</span>
              </div>
              {form.advancePaid > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span className="font-semibold">Advance Paid:</span>
                  <span className="font-semibold">-₹{Number(form.advancePaid).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-700">Round off:</span>
                <span className="font-semibold">₹{roundOff.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-800 pt-2">
                <span className="text-base font-bold">AMOUNT PAYABLE</span>
                <span className="text-base font-bold">
                  ₹{form.advancePaid > 0 
                    ? Math.round(calculations.grandTotal - Number(form.advancePaid)).toFixed(2)
                    : roundedTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {form.notes && (
          <div className="px-8 py-4 border-t border-gray-300">
            <h3 className="text-xs font-bold text-gray-800 mb-1">Notes:</h3>
            <p className="text-xs text-gray-700 whitespace-pre-wrap">{form.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-600 italic">
            This is a computer-generated invoice and does not require a signature.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Payment Status: <span className="font-semibold">{form.status}</span>
            {form.paymentMode && (
              <span> | Payment Mode: <span className="font-semibold">{form.paymentMode}</span></span>
            )}
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}