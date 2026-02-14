import React from "react";
import jsPDF from "jspdf";
import html2pdf from "html2pdf.js";

const PayslipModal = ({ salary, user, onClose }) => {
  if (!salary) return null;

  const monthlySalary = Math.round(salary.annualSalary / 12);
  const deduction = Math.round((salary.annualSalary / 365) * salary.leaves);
  const netSalary = monthlySalary + salary.bonus - deduction;

  const monthLabel = new Date(salary.lastPaid).toLocaleString("default", {
    month: "short",
    year: "numeric",
  });

  const downloadPDF = () => {
    const element = document.getElementById("payslip-pdf");

    const options = {
      margin: 10,
      filename: `Payslip-${new Date(salary.lastPaid).toLocaleString("default", {
        month: "short",
        year: "numeric",
      })}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-lg shadow-xl overflow-hidden flex flex-col">
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <div id="payslip-pdf" className="bg-white">
            
            {/* HEADER */}
            <div className="bg-slate-800 px-8 py-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center text-slate-800 font-bold text-lg">
                    RG
                  </div>
                  <div className="text-white">
                    <h2 className="font-bold text-xl">
                      {user?.companyName || "Company Name"}
                    </h2>
                    <p className="text-slate-300 text-sm">
                      Admin: {user?.username || "Admin"}
                    </p>
                  </div>

                </div>

                <div className="text-right text-white">
                  <h1 className="text-3xl font-bold">PAYSLIP</h1>
                  <p className="text-slate-300 text-sm mt-1">{monthLabel}</p>
                </div>
              </div>
            </div>

            {/* BODY */}
            <div className="p-8 space-y-6">

              {/* Status Badge */}
              <div className="flex justify-end">
                <span className="px-4 py-1.5 rounded bg-green-100 text-green-700 text-sm font-semibold">
                  ✓ PAID
                </span>
              </div>

              {/* EMPLOYEE INFO */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700 uppercase">
                    Employee Information
                  </h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">EMPLOYEE NAME</p>
                      <p className="font-semibold text-slate-900">{salary.staff.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">DESIGNATION</p>
                      <p className="font-semibold text-slate-900">{salary.staff.role}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">PAY PERIOD</p>
                      <p className="font-semibold text-slate-900">{monthLabel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold mb-1">PAYMENT DATE</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(salary.lastPaid).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SALARY BREAKDOWN TABLE */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-5 py-3 text-sm font-bold text-slate-700">PARTICULARS</th>
                      <th className="text-right px-5 py-3 text-sm font-bold text-slate-700">AMOUNT (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Earnings */}
                    <tr className="border-b border-slate-100">
                      <td className="px-5 py-3 font-semibold text-slate-900">Basic Salary</td>
                      <td className="px-5 py-3 text-right font-semibold text-slate-900">
                        ₹{monthlySalary.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="px-5 py-3 text-slate-700">Performance Bonus</td>
                      <td className="px-5 py-3 text-right text-slate-900">
                        ₹{salary.bonus.toLocaleString()}
                      </td>
                    </tr>
                    
                    {/* Gross Total */}
                    <tr className="bg-slate-50 border-b-2 border-slate-300">
                      <td className="px-5 py-3 font-bold text-slate-900">Gross Earnings</td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900">
                        ₹{(monthlySalary + salary.bonus).toLocaleString()}
                      </td>
                    </tr>

                    {/* Deductions */}
                    <tr className="border-b border-slate-100">
                      <td className="px-5 py-3 text-slate-700">
                        Leave Deduction ({salary.leaves} days)
                      </td>
                      <td className="px-5 py-3 text-right text-red-600">
                        ₹{deduction.toLocaleString()}
                      </td>
                    </tr>

                    {/* Total Deductions */}
                    <tr className="bg-slate-50 border-b-2 border-slate-300">
                      <td className="px-5 py-3 font-bold text-slate-900">Total Deductions</td>
                      <td className="px-5 py-3 text-right font-bold text-red-600">
                        ₹{deduction.toLocaleString()}
                      </td>
                    </tr>

                    {/* Net Pay */}
                    <tr className="bg-green-50">
                      <td className="px-5 py-4 font-bold text-green-900 text-lg">Net Payable Amount</td>
                      <td className="px-5 py-4 text-right font-bold text-green-700 text-2xl">
                        ₹{netSalary.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}
              <div className="flex justify-between items-end pt-4 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">System Generated</p>
                  <p className="mt-1">
                    {new Date().toLocaleDateString('en-GB', { 
                      day: '2-digit',
                      month: 'short', 
                      year: 'numeric'
                    })} at {new Date().toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 border-4 border-green-500 rounded-full flex items-center justify-center bg-green-50">
                    <span className="text-green-600 font-bold text-sm">PAID</span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-2">Payment Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BAR - FIXED AT BOTTOM */}
        <div className="flex justify-between items-center px-8 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={downloadPDF}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded text-sm font-semibold transition-colors"
          >
            ⬇ Download PDF
          </button>

          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold text-sm px-5 py-2.5 rounded hover:bg-slate-100 transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;