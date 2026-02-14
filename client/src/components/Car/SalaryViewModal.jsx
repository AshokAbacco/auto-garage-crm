import React, { useRef, useState } from "react";
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

  /* ================= PDF GENERATION (ALIGNMENT FIXED) ================= */
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const element = payslipRef.current;

      // We force the canvas to capture at exactly 210mm width (A4)
      // to prevent the flex-box items from shifting during render
      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for ultra-sharp text
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible and properly styled for capture
          const clonedElement = clonedDoc.querySelector(
            "[data-payslip-container]"
          );
          if (clonedElement) {
            clonedElement.style.width = "210mm";
            clonedElement.style.transform = "none";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Use 0,0 to fill the A4 width exactly
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST"
      );

      pdf.save(
        `Payslip_${(salary.staff?.name || "Staff").replace(/\s+/g, "_")}_${
          salary.month
        }_${salary.year}.pdf`
      );
    } catch (error) {
      console.error("PDF Error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full flex flex-col items-center py-8">
        {/* Modern Floating Toolbar */}
        <div className="sticky top-0 z-50 w-full max-w-[210mm] flex justify-between items-center bg-white/95 backdrop-blur-md text-slate-900 px-6 py-4 rounded-2xl shadow-2xl border border-slate-200 mb-8 ring-1 ring-black/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Receipt className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-none">
                Payslip Preview
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Verify details before downloading
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-slate-900 hover:bg-black px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? "Processing..." : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ================= PAYSLIP CONTAINER (A4 Size) ================= */}
        <div
          ref={payslipRef}
          data-payslip-container
          className="bg-white shadow-2xl relative"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "0",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Top Decorative Bar */}
          <div className="h-2 w-full bg-slate-900"></div>

          <div className="px-12 py-12 space-y-10">
            {/* Header Section */}
            <header className="flex justify-between items-start">
              {/* Left: Company Profile */}
              <div className="flex gap-5 items-start">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <HiMiniWrenchScrewdriver className="text-slate-900 w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tight">
                    {companyProfile?.companyName || "Garage3"}
                  </h1>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2 text-slate-500 max-w-[320px]">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <span className="text-[11px] leading-relaxed font-medium">
                        {companyProfile?.address ||
                          "Building No. 24, 3rd Cross, Hosur Main Road, Bengaluru - 560068"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-400" />
                        <span>{companyProfile?.phone || "9874563211"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-400" />
                        <span>
                          {companyProfile?.email || "carpremium@gmail.com"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Title & Date */}
              <div className="text-right pt-1">
                <div className="border-[2.5px] border-slate-900 px-6 py-2 rounded-lg inline-block mb-3">
                  <h2 className="text-xl font-black text-slate-900 tracking-[0.2em] leading-none">
                    PAYSLIP
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 uppercase">
                    {formatMonthYear(salary.month, salary.year)}
                  </p>
                  <p className="text-[11px] text-slate-500 font-bold">
                    FINANCIAL YEAR {getFinancialYear(salary.month, salary.year)}
                  </p>
                </div>
              </div>
            </header>

            {/* Employee Banner */}
            <div className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm">
                  {(salary.staff?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900 leading-none">
                    {salary.staff?.name || "premium staff1"}
                  </h3>
                  <p className="text-sm font-bold text-slate-500">
                    {salary.staff?.role || "Mechanic"}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    EMP ID:{" "}
                    {String(salary.staff?.id || "0000").padStart(4, "0")}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-3">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${
                    salary.status === "PAID"
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {salary.status === "PAID" ? (
                    <BadgeCheck size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                  {salary.status}
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    Payment Date
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {formatDate(salary.paidAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
                <div className="p-1.5 bg-slate-900 rounded-lg">
                  <Wallet size={16} className="text-white" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                  Salary Breakdown
                </h3>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-500 border-b border-slate-200">
                      <th className="py-4 px-6 text-left tracking-widest">
                        Description
                      </th>
                      <th className="py-4 px-6 text-right tracking-widest">
                        Earnings
                      </th>
                      <th className="py-4 px-6 text-right tracking-widest">
                        Deductions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px] font-medium text-slate-700">
                    <tr>
                      <td className="py-4 px-6">Basic Monthly Salary</td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {formatCurrency(salary.baseSalary)}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-300">
                        0.00
                      </td>
                    </tr>
                    {salary.bonus > 0 && (
                      <tr>
                        <td className="py-4 px-6">
                          Incentive / Performance Bonus
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-emerald-600">
                          {formatCurrency(salary.bonus)}
                        </td>
                        <td className="py-4 px-6 text-right text-slate-300">
                          0.00
                        </td>
                      </tr>
                    )}
                    {salary.leaves > 0 && (
                      <tr className="bg-red-50/20">
                        <td className="py-4 px-6">
                          Unpaid Leaves ({salary.leaves} Days)
                        </td>
                        <td className="py-4 px-6 text-right text-slate-300">
                          0.00
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-red-600">
                          {formatCurrency(salary.leaveDeduction)}
                        </td>
                      </tr>
                    )}
                    {salary.extraDeductions > 0 && (
                      <tr className="bg-red-50/20">
                        <td className="py-4 px-6">Other Ad-hoc Deductions</td>
                        <td className="py-4 px-6 text-right text-slate-300">
                          0.00
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-red-600">
                          {formatCurrency(salary.extraDeductions)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white font-bold">
                      <td className="py-4 px-6 text-xs uppercase tracking-widest">
                        Total Accumulations
                      </td>
                      <td className="py-4 px-6 text-right text-sm">
                        {formatCurrency(totalEarnings)}
                      </td>
                      <td className="py-4 px-6 text-right text-sm">
                        {formatCurrency(totalDeductions)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Net Amount Highlight */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Net Payable (In Words)
                </p>
                <p className="text-sm font-bold text-slate-700 italic leading-relaxed">
                  {numberToWords(netSalary)}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[11px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                  Take Home Salary
                </p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">
                  {formatCurrency(netSalary)}
                </p>
              </div>
            </div>

            {/* Footer / Signatures */}
            <footer className="pt-10 border-t border-slate-100">
              <div className="flex justify-between items-end mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Document Hash
                  </p>
                  <p className="text-[10px] font-mono text-slate-300">
                    GEN-{Date.now()}-AUTH
                  </p>
                </div>
                <div className="text-center min-w-[180px]">
                  <div className="h-12 flex items-center justify-center">
                    {/* Space for Digital Signature */}
                  </div>
                  <div className="border-t-2 border-slate-900 pt-2">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                      Authorized Signatory
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-400 font-medium leading-relaxed max-w-xl mx-auto">
                This is a computer-generated document and contains digital
                authentication. It does not require a physical signature. Any
                discrepancy should be reported to the finance office within 7
                working days.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
