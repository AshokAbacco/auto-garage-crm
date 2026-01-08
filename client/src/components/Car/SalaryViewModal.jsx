//SalaryViewModal.jsx
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  X,
  Download,
  Building2,
  Loader2,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

const formatMonthYear = (month, year) => {
  if (!month || !year) return "";
  return new Date(year, month - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export default function SalaryViewModal({ salary, companyProfile, onClose }) {
  const payslipRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!salary) return null;

  /* ================= HELPERS ================= */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  /* ================= DOWNLOAD LOGIC ================= */
  const handleDownloadPdf = async () => {
    if (!payslipRef.current) return;
    setIsDownloading(true);

    try {
      const element = payslipRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `Payslip_${salary.staff.name}_${salary.month}_${salary.year}.pdf`
      );
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  /* ================= CALCULATIONS ================= */
  const totalEarnings = (salary.baseSalary || 0) + (salary.bonus || 0);
  const totalDeductions =
    (salary.leaveDeduction || 0) + (salary.extraDeductions || 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="flex flex-col max-h-full">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4 text-white">
          <h2 className="text-xl font-semibold">Salary Slip Preview</h2>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= PAYSLIP DOCUMENT START ================= */}
        <div className="overflow-auto rounded-xl shadow-2xl max-h-[85vh]">
          <div
            ref={payslipRef}
            className="w-[210mm] min-h-[140mm] bg-white text-black p-10 relative box-border mx-auto"
            style={{ width: "800px" }}
          >
            {/* Header */}
            <header className="relative mb-8 border-b-4 border-black pb-6">
              <div className="flex justify-between items-start">
                {/* Left: Company Info */}
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white p-3 rounded-lg">
                    <Building2 size={36} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-black mb-1 tracking-tight">
                      {companyProfile?.companyName || "Garage"}
                    </h1>

                    <div className="mt-2 max-w-[420px] space-y-1 text-xs text-gray-700 leading-relaxed">
                      {companyProfile?.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-3.5 h-3.5 mt-0.5 text-gray-600" />
                          <span className="break-words">
                            {companyProfile.phone}
                          </span>
                        </div>
                      )}

                      {companyProfile?.email && (
                        <div className="flex items-start gap-2">
                          <Mail className="w-3.5 h-3.5 mt-0.5 text-gray-600" />
                          <span className="break-words">
                            {companyProfile.email}
                          </span>
                        </div>
                      )}

                      {companyProfile?.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-600 flex-shrink-0" />
                          <span className="break-words max-w-[380px]">
                            {companyProfile.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Payslip Title & Status */}
                <div className="text-right">
                  <h2 className="text-3xl font-black text-black mb-2 tracking-tight">
                    PAYSLIP
                  </h2>
                  <p className="text-md text-gray-700 font-semibold mb-3">
                    Payroll Month:{" "}
                    <span className="">
                      {formatMonthYear(salary.month, salary.year)}
                    </span>
                  </p>

                  {/* Status Badge */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: "8px",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor:
                          salary.status === "PAID" ? "#16a34a" : "#f97316",
                        color: "#ffffff",
                        padding: "8px 18px",
                        borderRadius: "20px",
                        fontWeight: "700",
                        fontSize: "12px",
                        letterSpacing: "0.5px",
                        display: "inline-block",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {salary.status}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Employee Details */}
            <div className="bg-gray-50 rounded-sm border-2 border-gray-300 p-6 mb-8">
              <h3 className="text-xs font-black text-black uppercase tracking-widest mb-4 pb-2 border-b-2 border-gray-400">
                Employee Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-bold mb-1.5">
                    Employee Name
                  </p>
                  <p className="text-lg font-black text-black">
                    {salary.staff.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-bold mb-1.5">
                    Designation
                  </p>
                  <p className="text-lg font-bold text-black">
                    {salary.staff.role}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-bold mb-1.5">
                    Pay Period
                  </p>
                  <p className="text-base font-bold text-black">
                    {salary.month}, {salary.year}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-bold mb-1.5">
                    Payment Date
                  </p>
                  <p className="text-base font-bold text-black">
                    {formatDate(salary.paidAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Simple Earnings & Deductions Table */}
            <div className="border-2 border-gray-300 rounded-sm overflow-hidden mb-8">
              {/* Table Header */}
              <div className="grid grid-cols-3 bg-gray-200 text-black font-bold text-sm uppercase">
                <div className="col-span-2 py-3 px-5 border-r border-gray-300">
                  Particulars
                </div>
                <div className="py-3 px-5 text-right">Amount (₹)</div>
              </div>

              {/* EARNINGS SECTION */}
              <div className="bg-gray-200">
                <div className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-black">
                  Earnings
                </div>
              </div>

              <div className="bg-white">
                <div className="grid grid-cols-3 py-3 px-5 border-b border-gray-300">
                  <div className="col-span-2 font-semibold text-black">
                    Basic Salary
                  </div>
                  <div className="text-right font-mono font-bold text-black">
                    {formatCurrency(salary.baseSalary)}
                  </div>
                </div>
                <div className="grid grid-cols-3 py-3 px-5 border-b border-gray-300">
                  <div className="col-span-2 font-semibold text-black">
                    Performance Bonus
                  </div>
                  <div className="text-right font-mono font-bold text-black">
                    {formatCurrency(salary.bonus)}
                  </div>
                </div>
                <div className="grid grid-cols-3 py-3 px-5 bg-gray-200 border-b-2 border-black">
                  <div className="col-span-2 font-black text-black">
                    Gross Earnings
                  </div>
                  <div className="text-right font-mono font-black text-black">
                    {formatCurrency(totalEarnings)}
                  </div>
                </div>
              </div>

              {/* DEDUCTIONS SECTION */}
              <div className="bg-gray-200">
                <div className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-black">
                  Deductions
                </div>
              </div>

              <div className="bg-white">
                <div className="grid grid-cols-3 py-3 px-5 border-b border-gray-300">
                  <div className="col-span-2 font-semibold text-black">
                    Unpaid Leaves ({salary.leaves} days)
                  </div>
                  <div className="text-right font-mono font-bold text-black">
                    {formatCurrency(salary.leaveDeduction)}
                  </div>
                </div>
                {salary.extraDeductions > 0 && (
                  <div className="grid grid-cols-3 py-3 px-5 border-b border-gray-300">
                    <div className="col-span-2 font-semibold text-black">
                      Other Deductions
                    </div>
                    <div className="text-right font-mono font-bold text-black">
                      {formatCurrency(salary.extraDeductions)}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 py-3 px-5 bg-gray-200">
                  <div className="col-span-2 font-black text-black">
                    Total Deductions
                  </div>
                  <div className="text-right font-mono font-black text-black">
                    {formatCurrency(totalDeductions)}
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className=" text-black rounded-sm p-6 mb-10 border-2 border-gray-400">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase font-black tracking-widest mb-1 text-gray-800">
                    Net Payable Amount
                  </p>
                  <p className="text-xs font-semibold text-gray-800">
                    (Gross Earnings - Total Deductions)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-semibold font-mono tracking-tight text-green-600">
                    {formatCurrency(salary.netSalary)}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative pt-6 border-t-2 border-dashed border-gray-400 flex justify-between items-end">
              {/* System Note */}
              <div className="text-xs text-gray-700">
                <p className="font-bold">System Generated</p>
                <p className="text-gray-600">{new Date().toLocaleString()}</p>
              </div>

              {/* Signature */}
              <div className="text-center">
                <div className="h-12 w-32 border-b-2 border-black mb-2"></div>
                <p className="text-xs uppercase font-black text-black tracking-wider">
                  Authorized Signature
                </p>
              </div>

              {/* Modern GREEN PAID Stamp */}
              {salary.status === "PAID" && (
                <div className="absolute -top-8 right-8 transform -rotate-12">
                  <div className="relative">
                    {/* Outer glow effect */}
                    <div className="absolute inset-0 bg-emerald-400/40 rounded-full blur-xl"></div>

                    {/* Main stamp circle */}
                    <div className="relative h-28 w-28 rounded-full border-[6px] border-emerald-600 bg-white flex items-center justify-center shadow-2xl">
                      <div className="h-20 w-20 rounded-full border-[3px] border-dashed border-emerald-500 flex flex-col items-center justify-center">
                        <CheckCircle2
                          className="w-9 h-9 text-emerald-600 mb-0.5"
                          strokeWidth={3}
                        />
                        <span className="text-2xl font-black text-emerald-600 uppercase tracking-tight leading-none">
                          PAID
                        </span>
                        <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-widest mt-0.5">
                          ✓ VERIFIED
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* ================= PAYSLIP END ================= */}
      </div>
    </div>
  );
}
