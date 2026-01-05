import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext"; // Import theme context

const API = import.meta.env.VITE_API_BASE_URL;

export default function BillingInvoice() {
    const { isDark } = useTheme(); // Get theme state
    const { id } = useParams();
    const navigate = useNavigate();
    const invoiceRef = useRef(null);

    const [billing, setBilling] = useState(null);
    const token = localStorage.getItem("token");

    /* ================= FETCH BILLING ================= */
    useEffect(() => {
        fetch(`${API}/api/wash-billing/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(setBilling)
            .catch(console.error);
    }, [id]);

    /* ================= PDF ================= */
    const downloadPDF = async () => {
        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const width = 210;
        const height = (canvas.height * width) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save(`Billing-Invoice-${billing.invoiceNumber}.pdf`);
    };

    if (!billing) return <div className={`p-10 ${isDark ? "text-gray-300" : ""}`}>Loading invoice...</div>;

    /* ================= DATA ================= */
    const services = billing.services || [];
    const cost = Number(billing.partsCost || 0);
    const gstAmount = Number(billing.partsGst || 0);
    const total = Number(billing.grandTotal || 0);

    return (
        <div className={`min-h-screen p-6 transition-all duration-300 ${isDark ? "bg-gray-900" : "bg-gray-100"} print:bg-white`}>
            {/* ACTION BAR */}
            <div className="flex justify-between max-w-4xl mx-auto mb-6 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className={`flex items-center gap-2 transition-colors ${isDark
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-600 hover:text-black"
                        }`}
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-800 hover:bg-gray-700"
                            }`}
                    >
                        <Printer size={16} /> Print
                    </button>

                    <button
                        onClick={downloadPDF}
                        className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${isDark
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        <Download size={16} /> PDF
                    </button>
                </div>
            </div>

            {/* INVOICE */}
            <div
                ref={invoiceRef}
                className={`max-w-4xl p-10 mx-auto rounded-xl transition-all duration-300 ${isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white shadow"
                    } print:shadow-none print:bg-white print:border-none`}
            >
                {/* HEADER */}
                <div className="flex justify-between mb-8">
                    <div>
                        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : ""}`}>AUTO GARAGE</h1>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Washing & Detailing Services
                        </p>
                        <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Bangalore, India
                        </p>
                    </div>

                    <div className="text-right">
                        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : ""}`}>BILLING INVOICE</h2>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Invoice #: {billing.invoiceNumber}
                        </p>
                        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Date: {new Date(billing.createdAt).toLocaleDateString()}
                        </p>
                        <span
                            className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold ${billing.status === "PAID"
                                ? isDark
                                    ? "bg-green-900/30 text-green-400"
                                    : "bg-green-100 text-green-700"
                                : isDark
                                    ? "bg-yellow-900/30 text-yellow-400"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                        >
                            {billing.status}
                        </span>
                    </div>
                </div>

                {/* CLIENT */}
                <div className="mb-8">
                    <h3 className={`mb-2 font-bold ${isDark ? "text-white" : ""}`}>Bill To</h3>
                    <p className={`font-medium ${isDark ? "text-white" : ""}`}>
                        {billing.washingClient?.fullName}
                    </p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {billing.washingClient?.phone}
                    </p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {billing.washingClient?.email}
                    </p>
                </div>

                {/* SERVICES TABLE */}
                <div className={`mb-8 overflow-hidden rounded-lg border ${isDark ? "border-gray-700" : ""}`}>
                    <div className={`grid grid-cols-4 text-sm font-semibold ${isDark ? "bg-gray-700" : "bg-gray-50"
                        }`}>
                        <div className="col-span-2 p-3">Service</div>
                        <div className="p-3 text-right">Amount</div>
                        <div className="p-3 text-right">Total</div>
                    </div>

                    {services.map((s, index) => {
                        const ws = s.washingService;
                        return (
                            <div key={index} className={`grid grid-cols-4 text-sm border-t ${isDark ? "border-gray-700" : ""}`}>
                                <div className="col-span-2 p-3">
                                    <p className={`font-medium ${isDark ? "text-white" : ""}`}>
                                        {ws?.subService?.name || "Washing Service"}
                                    </p>
                                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                        {ws?.category?.name}
                                    </p>
                                </div>
                                <div className={`p-3 text-right ${isDark ? "text-gray-300" : ""}`}>
                                    ₹{Number(ws?.partsCost || 0).toFixed(2)}
                                </div>
                                <div className={`p-3 text-right ${isDark ? "text-gray-300" : ""}`}>
                                    ₹{Number(ws?.partsCost || 0).toFixed(2)}
                                </div>
                            </div>
                        );
                    })}

                    <div className={`grid grid-cols-4 text-sm border-t ${isDark ? "border-gray-700" : ""}`}>
                        <div className="col-span-3 p-3 text-right">GST</div>
                        <div className={`p-3 text-right ${isDark ? "text-gray-300" : ""}`}>
                            ₹{gstAmount.toFixed(2)}
                        </div>
                    </div>

                    <div className={`grid grid-cols-4 font-bold border-t ${isDark ? "bg-gray-700 border-gray-700" : "bg-gray-50"
                        }`}>
                        <div className="col-span-3 p-4 text-right">
                            Grand Total
                        </div>
                        <div className={`p-4 text-right ${isDark ? "text-white" : ""}`}>
                            ₹{total.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className={`pt-6 text-center border-t ${isDark ? "border-gray-700" : ""}`}>
                    <p className={`font-semibold ${isDark ? "text-white" : ""}`}>Thank you for your business!</p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        For queries: contact@autogarage.com
                    </p>
                </div>
            </div>
        </div>
    );
}