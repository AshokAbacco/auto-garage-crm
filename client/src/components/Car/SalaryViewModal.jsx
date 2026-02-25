import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  X,
  Download,
  Loader2,
  Clock,
  Wallet,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  Receipt,
} from "lucide-react";
import { HiMiniWrenchScrewdriver } from "react-icons/hi2";

/* ================= HELPERS ================= */
const formatMonthYear = (month, year) =>
  new Date(year, month - 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

const getFinancialYear = (month, year) => {
  const startYear = month >= 4 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

const numberToWords = (num) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
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
  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] + " Hundred " + (n % 100 ? inWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        " Thousand " +
        (n % 1000 ? inWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        " Lakh " +
        (n % 100000 ? inWords(n % 100000) : "")
      );
    return "";
  };
  return num ? `${inWords(Math.floor(num))} Rupees Only` : "Zero Rupees";
};

export default function SalaryViewModal({ salary, companyProfile, onClose }) {
  const payslipRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  // Logic to shrink the A4 preview to fit mobile/tablet screens
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 850) {
        // If screen is smaller than A4 width + padding
        const newScale = (width - 40) / 794; // 794px is approx 210mm
        setScale(newScale);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!salary) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Awaiting Payment";

  const totalEarnings = (salary.baseSalary || 0) + (salary.bonus || 0);
  const totalDeductions =
    (salary.leaveDeduction || 0) + (salary.extraDeductions || 0);
  const netSalary = totalEarnings - totalDeductions;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const element = payslipRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794, // Force A4 Width in pixels for the capture
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        210,
        (canvas.height * 210) / canvas.width,
      );
      pdf.save(`Payslip_${salary.staff?.name || "Staff"}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950/95 backdrop-blur-md overflow-hidden">
      {/* 1. Header: Always responsive */}
      <div className="w-full bg-white border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-indigo-600 items-center justify-center shadow-indigo-200 shadow-lg">
            <Receipt className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 leading-none">
              Payslip
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              {formatMonthYear(salary.month, salary.year)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all"
          >
            {isDownloading ? (
              <Loader2 className="animate-spin w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span>{isDownloading ? "..." : "PDF"}</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* 2. Scalable Preview Area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center">
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "transform 0.2s ease-out",
            marginBottom: `${794 * scale - 794}px`, // Adjust spacing for the scaled element
          }}
        >
          {/* ================= PAYSLIP CONTAINER (Fixed A4 width) ================= */}
          <div
            ref={payslipRef}
            className="bg-white shadow-2xl overflow-hidden"
            style={{ width: "210mm", minHeight: "297mm", padding: "0" }}
          >
            <div className="h-2 w-full bg-slate-900" />

            <div className="px-12 py-12 space-y-10">
              {/* Header */}
              <header className="flex justify-between items-start">
                <div className="flex gap-5 items-start">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <HiMiniWrenchScrewdriver className="text-slate-900 w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl font-black text-slate-900 uppercase">
                      {companyProfile?.companyName || "Garage3"}
                    </h1>
                    <div className="flex items-start gap-2 text-slate-500 max-w-[320px]">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      <span className="text-[11px] font-medium">
                        {companyProfile?.address || "Bengaluru, India"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="border-2 border-slate-900 px-4 py-1 rounded-lg inline-block mb-2">
                    <h2 className="text-lg font-black tracking-widest">
                      PAYSLIP
                    </h2>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                    FY {getFinancialYear(salary.month, salary.year)}
                  </p>
                </div>
              </header>

              {/* Employee Info */}
              <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white border flex items-center justify-center font-black text-lg shadow-sm">
                    {(salary.staff?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {salary.staff?.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-500">
                      {salary.staff?.role} • ID: {salary.staff?.id}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${salary.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {salary.status}
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-500">
                    <tr>
                      <th className="py-4 px-6 text-left">Description</th>
                      <th className="py-4 px-6 text-right">Earnings</th>
                      <th className="py-4 px-6 text-right">Deductions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-medium divide-y divide-slate-100">
                    <tr>
                      <td className="py-4 px-6">Basic Salary</td>
                      <td className="py-4 px-6 text-right font-bold">
                        {formatCurrency(salary.baseSalary)}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-300">
                        0.00
                      </td>
                    </tr>
                    {salary.bonus > 0 && (
                      <tr>
                        <td className="py-4 px-6">Bonus/Incentive</td>
                        <td className="py-4 px-6 text-right font-bold text-emerald-600">
                          {formatCurrency(salary.bonus)}
                        </td>
                        <td className="py-4 px-6 text-right text-slate-300">
                          0.00
                        </td>
                      </tr>
                    )}
                    {salary.leaveDeduction + salary.extraDeductions > 0 && (
                      <tr>
                        <td className="py-4 px-6">Total Deductions</td>
                        <td className="py-4 px-6 text-right text-slate-300">
                          0.00
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-red-600">
                          {formatCurrency(totalDeductions)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-bold text-xs uppercase">
                    <tr>
                      <td className="py-4 px-6">Total Net Payable</td>
                      <td
                        colSpan="2"
                        className="py-4 px-6 text-right text-base"
                      >
                        {formatCurrency(netSalary)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Words */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Amount in words
                </p>
                <p className="text-sm font-bold text-slate-700 italic">
                  {numberToWords(netSalary)}
                </p>
              </div>

              {/* Footer Signature */}
              <footer className="pt-10 flex justify-between items-end border-t border-slate-100">
                <p className="text-[10px] text-slate-400 max-w-[300px]">
                  Computer generated payslip. No physical signature required.
                </p>
                <div className="text-center w-48 border-t-2 border-slate-900 pt-2">
                  <p className="text-[10px] font-black uppercase">
                    Authorized Signatory
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
