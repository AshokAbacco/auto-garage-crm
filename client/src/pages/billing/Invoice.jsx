import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiPrinter, FiDownload } from "react-icons/fi";
import { useTheme } from "../../contexts/ThemeContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const numberToWords = (num) => {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const format = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + format(n % 100);
    if (n < 100000)
      return format(Math.floor(n / 1000)) + "Thousand " + format(n % 1000);
    if (n < 10000000)
      return format(Math.floor(n / 100000)) + "Lakh " + format(n % 100000);
    return "";
  };
  return `${format(Math.floor(num))}Only`.replace(/\s+/g, " ");
};

const getAuthToken = () =>
  localStorage.getItem("token") || localStorage.getItem("authToken");

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
    window.location.href = "/login";
    throw new Error("Session expired.");
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/user/profile`);
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchUserProfile();
  }, []);

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

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        Loading Invoice...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error: {error}
      </div>
    );

  const invoiceData = isPreview
    ? { ...previewData, invoiceCostItems: previewData?.costItems || [] }
    : invoice || {};
  // const owner = isPreview ? previewData?.userProfile : userProfile;
  // const owner = previewData?.userProfile || userProfile;
  const owner = isPreview ? previewData?.userProfile : invoiceData?.ownerUser;


  const c = invoiceData?.client || {};
  const items = invoiceData?.invoiceCostItems || [];

  const parts = items.filter((item) => item?.type === "part");
  const labour = items.filter((item) => item?.type === "labor");

  const getTaxGroups = (itemArray) => {
    const groups = {};
    itemArray.forEach((item) => {
      const rate = Number(item.cgstRate || 0);
      const rateStr = rate.toFixed(2);
      const taxable = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      const taxAmt = (taxable * rate) / 100;
      if (!groups[rateStr]) {
        groups[rateStr] = { rate: rateStr, taxable: 0, taxAmount: 0 };
      }
      groups[rateStr].taxable += taxable;
      groups[rateStr].taxAmount += taxAmt;
    });
    return Object.values(groups);
  };

  const partsTaxGroups = getTaxGroups(parts);
  const laborTaxGroups = getTaxGroups(labour);

  const totalTaxable = items.reduce(
    (sum, i) => sum + Number(i.quantity || 0) * Number(i.unitPrice || 0),
    0
  );
  const totalTax = items.reduce((sum, i) => {
    const taxable = Number(i.quantity || 0) * Number(i.unitPrice || 0);
    return (
      sum +
      (taxable * (Number(i.cgstRate || 0) + Number(i.sgstRate || 0))) / 100
    );
  }, 0);

  const discount = Number(invoiceData.discount || 0);
  const totalWithTax = totalTaxable + totalTax;
  const rawTotal = totalWithTax - discount;

  // Round down logic
  const finalPayable = Math.floor(rawTotal);
  const roundOff = (finalPayable - rawTotal).toFixed(2);

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      210,
      (canvas.height * 210) / canvas.width
    );
    pdf.save(`Invoice_${invoiceData?.invoiceNumber}.pdf`);
  };

  return (
    <div
      className={`min-h-screen p-4 lg:p-8 ${
        isDark ? "bg-slate-900" : ""
      } print:bg-white print:p-0`}
    >
      {/* CRITICAL PRINT STYLES */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `,
        }}
      />

      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center no-print">
        <Link
          to="/billing"
          className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-medium"
        >
          <FiArrowLeft /> Back to Billing
        </Link>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-gray-800 text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-black"
          >
            <FiPrinter /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
          >
            <FiDownload /> Download PDF
          </button>
        </div>
      </div>

      <div
        ref={printRef}
        className="printable-area relative  max-w-[210mm] mx-auto bg-white text-black p-10 shadow-lg font-sans text-[11px] leading-tight min-h-[297mm] flex flex-col border border-gray-200"
      >
        {isPreview && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-[70px] font-black text-gray-400 opacity-20 rotate-[-30deg] select-none"
              style={{ marginTop: "-300px" }}
            >
              PROFORMA INVOICE
            </span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-5 mb-6">
          <div className="w-2/3">
            <h1 className="text-3xl font-bold uppercase mb-2 text-gray-900">
              {owner?.companyName || "Company Name"}
            </h1>
            <p className="text-[10px] text-gray-600 leading-relaxed max-w-md">
              {owner?.address || "Address N/A"}
            </p>
            <div className="mt-3 text-[10px] space-y-1">
              <div className="flex gap-6">
                <span className="font-semibold">GSTIN:</span>
                <span>{owner?.gstNumber || "N/A"}</span>
              </div>
              <div className="flex gap-6">
                <span className="font-semibold">Contact:</span>
                <span>{owner?.phone || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              TAX INVOICE
            </h2>
            <p className="text-[9px] font-semibold uppercase text-gray-500">
              Cash / Credit
            </p>
          </div>
        </div>

        {/* Customer & Vehicle Info */}
        <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b border-gray-300">
          <div className="space-y-2">
            <h3 className="font-bold text-[10px] uppercase text-gray-500 mb-3">
              Customer Details
            </h3>
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-28 text-gray-600">Name:</span>
                <span className="font-medium uppercase">
                  {c?.fullName || "Walking Customer"}
                </span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-600">Address:</span>
                <span className="font-medium">{c?.address || "N/A"}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-gray-600">Contact:</span>
                <span className="font-medium">{c?.phone || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-[10px] uppercase text-gray-500 mb-3">
              Invoice Details
            </h3>
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-gray-600">Invoice No:</span>
                <span className="font-medium">
                  {invoiceData?.invoiceNumber}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(invoiceData?.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Vehicle No:</span>
                <span className="font-medium uppercase">
                  {c?.regNumber || "N/A"}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Model/Make:</span>
                <span className="font-medium uppercase">
                  {invoiceData?.vehicle || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Parts and Labour Tables (Logic kept from previous version) */}
        {/* ... (Your parts and labour table code) ... */}
        {parts.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-[11px] uppercase mb-3 text-gray-800">
              Genuine Parts Details
            </h3>
            <table className="w-full text-[9px] border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border border-gray-400 p-1.5 w-10 text-center">
                    S.No
                  </th>
                  <th className="border border-gray-400 p-1.5">Description</th>
                  <th className="border border-gray-400 p-1.5 text-center w-10">
                    Qty
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-16">
                    Rate
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-16">
                    Taxable
                  </th>
                  <th className="border border-gray-400 p-1.5 text-center w-12">
                    CGST
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-14">
                    Amt
                  </th>
                  <th className="border border-gray-400 p-1.5 text-center w-12">
                    SGST
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-14">
                    Amt
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-20">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {parts.map((item, idx) => (
                  <tr key={`p-${idx}`}>
                    <td className="border border-gray-400 p-1.5 text-center">
                      {idx + 1}
                    </td>
                    <td className="border border-gray-400 p-1.5 uppercase font-medium">
                      {item.name}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right">
                      {Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right">
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-center">
                      {item.cgstRate}%
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right">
                      {(
                        (item.quantity * item.unitPrice * item.cgstRate) /
                        100
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-center">
                      {item.sgstRate}%
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right">
                      {(
                        (item.quantity * item.unitPrice * item.sgstRate) /
                        100
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right font-bold">
                      {(
                        item.quantity *
                        item.unitPrice *
                        (1 + (item.cgstRate + item.sgstRate) / 100)
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {labour.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-[11px] uppercase mb-3 text-gray-800">
              Labour Details
            </h3>
            <table className="w-full text-[9px] border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border border-gray-400 p-1.5 w-10 text-center">
                    S.No
                  </th>
                  <th className="border border-gray-400 p-1.5">Description</th>
                  <th className="border border-gray-400 p-1.5 text-center w-10">
                    Qty
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-16">
                    Rate
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-16">
                    Taxable
                  </th>
                  <th className="border border-gray-400 p-1.5 text-center w-12">
                    CGST
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-14">
                    Amt
                  </th>
                  <th className="border border-gray-400 p-1.5 text-center w-12">
                    SGST
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-14">
                    Amt
                  </th>
                  <th className="border border-gray-400 p-1.5 text-right w-20">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {labour.map((item, idx) => (
                  <tr key={`l-${idx}`}>
                    <td className="border border-gray-400 p-1.5 text-center">
                      {idx + 1}
                    </td>
                    <td className="border border-gray-400 p-1.5 uppercase font-medium">
                      {item.name}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-center">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right">
                      {Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right">
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-center">
                      {item.cgstRate}%
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right">
                      {(
                        (item.quantity * item.unitPrice * item.cgstRate) /
                        100
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-center">
                      {item.sgstRate}%
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right">
                      {(
                        (item.quantity * item.unitPrice * item.sgstRate) /
                        100
                      ).toFixed(2)}
                    </td>
                    <td className="border border-gray-400 p-1.5 text-right font-bold">
                      {(
                        item.quantity *
                        item.unitPrice *
                        (1 + (item.cgstRate + item.sgstRate) / 100)
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Calculation Section */}
        <div className="mt-4 border-t-2 border-gray-800 pt-4">
          <h3 className="font-bold text-[11px] uppercase mb-4 text-gray-800">
            Grand Total Calculation
          </h3>
          <div className="flex justify-between gap-10">
            <div className="w-1/2 space-y-1.5 text-[10px]">
              {partsTaxGroups.map((g, i) => (
                <div key={`pc-${i}`} className="flex justify-between pl-4">
                  <span className="text-gray-600">
                    CGST(Parts) @{" "}
                    <span className="font-bold text-black">{g.rate}%</span> on
                    Amount{" "}
                    <span className="font-bold ml-1 text-black">
                      ₹{g.taxable.toFixed(2)}
                    </span>
                  </span>
                  <span className="font-medium">₹{g.taxAmount.toFixed(2)}</span>
                </div>
              ))}
              {partsTaxGroups.map((g, i) => (
                <div key={`ps-${i}`} className="flex justify-between pl-4">
                  <span className="text-gray-600">
                    SGST(Parts) @{" "}
                    <span className="font-bold text-black">{g.rate}%</span> on
                    Amount{" "}
                    <span className="font-bold ml-1 text-black">
                      ₹{g.taxable.toFixed(2)}
                    </span>
                  </span>
                  <span className="font-medium">₹{g.taxAmount.toFixed(2)}</span>
                </div>
              ))}
              {laborTaxGroups.map((g, i) => (
                <div key={`lc-${i}`} className="flex justify-between pl-4">
                  <span className="text-gray-600">
                    CGST(Labor) @{" "}
                    <span className="font-bold text-black">{g.rate}%</span> on
                    Amount{" "}
                    <span className="font-bold ml-1 text-black">
                      ₹{g.taxable.toFixed(2)}
                    </span>
                  </span>
                  <span className="font-medium">₹{g.taxAmount.toFixed(2)}</span>
                </div>
              ))}
              {laborTaxGroups.map((g, i) => (
                <div
                  key={`ls-${i}`}
                  className="flex justify-between pl-4 border-b pb-2"
                >
                  <span className="text-gray-600">
                    SGST(Labor) @{" "}
                    <span className="font-bold text-black">{g.rate}%</span> on
                    Amount{" "}
                    <span className="font-bold ml-1 text-black">
                      ₹{g.taxable.toFixed(2)}
                    </span>
                  </span>
                  <span className="font-medium">₹{g.taxAmount.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2">
                <span className="font-bold text-gray-800">
                  Total Amount (In Words):
                </span>
                <p className="italic font-bold text-gray-900">
                  {numberToWords(finalPayable)}
                </p>
              </div>
            </div>

            <div className="w-1/2 space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-gray-600">Net Amount (Incl. Tax)</span>
                <span>₹{totalWithTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Amount After Discount</span>
                <span>₹{rawTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Round off</span>
                {/* Math.floor ensures this is always a negative subtraction */}
                <span className="font-medium text-red-500">₹{roundOff}</span>
              </div>
              <div className="flex justify-between text-[12px] font-black bg-gray-100 px-2 py-1.5 border-y border-gray-400">
                <span>AMOUNT PAYABLE</span>
                <span>₹{finalPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto pt-8 border-t border-gray-200 text-center">
          <p className="text-blue-700 font-bold text-[10px] mb-1">
            Thank you for choosing {owner?.companyName || "our services"} for
            your vehicle service!
          </p>
          <p className="text-gray-600 text-[9px] mb-4">
            Support Email:{" "}
            <span className="text-black font-semibold">
              {owner?.email || "support@company.com"}
            </span>
          </p>
          <div className="flex justify-between items-center text-[8px] text-gray-800 uppercase font-medium tracking-wider">
            <span>The Motor Desk © {new Date().getFullYear()}</span>
            <span>Digital Billing System - Secure & Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
