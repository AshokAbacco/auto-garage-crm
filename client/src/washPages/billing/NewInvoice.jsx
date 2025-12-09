// src/billing/CreateInvoice.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    Hash,
    Calendar,
    User2,
    Tag,
    Car,
    Wrench,
    FileText,
    IndianRupee,
    Percent,
    CreditCard,
    Save,
    X,
    BadgeCheck,
} from "lucide-react";

export default function CreateInvoice() {
    const navigate = useNavigate();

    // simple cost state to drive the Grand Total
    const [partsCost, setPartsCost] = useState(0);
    const [partsGst, setPartsGst] = useState(0);
    const [laborCost, setLaborCost] = useState(0);
    const [laborGst, setLaborGst] = useState(0);
    const [additionalTaxes, setAdditionalTaxes] = useState(0);
    const [discounts, setDiscounts] = useState(0);

    const grandTotal = useMemo(() => {
        const pCost = Number(partsCost) || 0;
        const pGst = Number(partsGst) || 0;
        const lCost = Number(laborCost) || 0;
        const lGst = Number(laborGst) || 0;
        const taxAdd = Number(additionalTaxes) || 0;
        const disc = Number(discounts) || 0;

        const partsTotal = pCost + (pCost * pGst) / 100;
        const laborTotal = lCost + (lCost * lGst) / 100;

        return partsTotal + laborTotal + taxAdd - disc;
    }, [partsCost, partsGst, laborCost, laborGst, additionalTaxes, discounts]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // hook up to your API here
        alert("Invoice submitted (hook up API here)");
    };

    return (
        <div className="min-h-screen px-6 py-6 bg-slate-50 lg:px-12">
            {/* Top back link */}
            <button
                type="button"
                onClick={() => navigate("/billing")}
                className="inline-flex items-center gap-2 mb-4 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Billing</span>
            </button>

            {/* Page Title */}
            <h1 className="mb-6 text-3xl font-semibold text-slate-900">Create Invoice</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Invoice header card */}
                <section className="p-6 bg-white border shadow-sm rounded-2xl">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Invoice Number */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Hash className="w-4 h-4" />
                                <span>Invoice Number</span>
                            </label>
                            <input
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                defaultValue="INV-20251208-9337"
                            />
                        </div>

                        {/* Invoice Date */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Calendar className="w-4 h-4" />
                                <span>Invoice Date</span>
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                defaultValue={new Date().toISOString().slice(0, 10)}
                            />
                        </div>

                        {/* Customer */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <User2 className="w-4 h-4" />
                                <span>Customer</span>
                            </label>
                            <select className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                                <option>Select Customer</option>
                                <option>John Doe</option>
                                <option>Jane Smith</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Service Details card */}
                <section className="p-6 bg-white border shadow-sm rounded-2xl">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Service Details</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Service Category */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Tag className="w-4 h-4" />
                                <span>Service Category</span>
                            </label>
                            <select className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                                <option>Select Category</option>
                                <option>General Service</option>
                                <option>Body Repair</option>
                            </select>
                        </div>

                        {/* Service Sub-category */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Tag className="w-4 h-4" />
                                <span>Service Sub-Category</span>
                            </label>
                            <select className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                                <option>Select Sub-Category</option>
                                <option>Interior Cleaning</option>
                                <option>Exterior Detailing</option>
                            </select>
                        </div>

                        {/* Vehicle */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Car className="w-4 h-4" />
                                <span>Vehicle</span>
                            </label>
                            <input
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Select or enter vehicle"
                            />
                        </div>

                        {/* Mechanic */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Wrench className="w-4 h-4" />
                                <span>Mechanic</span>
                            </label>
                            <input
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Assign mechanic"
                            />
                        </div>

                        {/* Service Notes */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <FileText className="w-4 h-4" />
                                <span>Service Notes</span>
                            </label>
                            <textarea
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg resize-none bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                                placeholder="Enter any additional notes or details..."
                            />
                        </div>
                    </div>
                </section>

                {/* Cost Breakdown card */}
                <section className="p-6 bg-white border shadow-sm rounded-2xl">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">Cost Breakdown</h2>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Parts Cost */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <IndianRupee className="w-4 h-4" />
                                <span>Parts Cost</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={partsCost}
                                onChange={(e) => setPartsCost(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Parts GST */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Percent className="w-4 h-4" />
                                <span>Parts GST (%)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={partsGst}
                                onChange={(e) => setPartsGst(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Labor Cost */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <IndianRupee className="w-4 h-4" />
                                <span>Labor Cost</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={laborCost}
                                onChange={(e) => setLaborCost(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Labor GST */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Percent className="w-4 h-4" />
                                <span>Labor GST (%)</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={laborGst}
                                onChange={(e) => setLaborGst(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Additional Taxes */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Tag className="w-4 h-4" />
                                <span>Additional Taxes</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={additionalTaxes}
                                onChange={(e) => setAdditionalTaxes(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Discounts */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <Tag className="w-4 h-4" />
                                <span>Discounts</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={discounts}
                                onChange={(e) => setDiscounts(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg bg-slate-50/40 border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                            />
                        </div>

                        {/* Payment Mode */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <CreditCard className="w-4 h-4" />
                                <span>Payment Mode</span>
                            </label>
                            <select className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                                <option>Select Payment Mode</option>
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Card</option>
                                <option>Bank Transfer</option>
                            </select>
                        </div>

                        {/* Payment Status */}
                        <div>
                            <label className="flex items-center gap-2 mb-1 text-sm font-medium text-slate-800">
                                <BadgeCheck className="w-4 h-4" />
                                <span>Payment Status</span>
                            </label>
                            <select className="w-full px-3 py-2 border rounded-lg border-slate-200 bg-slate-50/40 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                                <option>Pending</option>
                                <option>Paid</option>
                                <option>Partially Paid</option>
                            </select>
                        </div>
                    </div>

                    {/* Grand total + buttons */}
                    <div className="flex flex-col items-start justify-between mt-8 gap-y-4 md:flex-row md:items-center">
                        <div className="text-base font-semibold text-slate-900">
                            Grand Total:
                        </div>
                        <div className="flex items-center gap-8 md:ml-auto">
                            <div className="text-2xl font-bold text-emerald-600">
                                ₹ {grandTotal.toFixed(2)}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white shadow rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Save className="w-4 h-4" />
                                    Create Invoice
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/billing")}
                                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold bg-white border rounded-xl text-slate-700 hover:bg-slate-50"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </form>
        </div>
    );
}
