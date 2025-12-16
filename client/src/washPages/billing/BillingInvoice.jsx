// src/wasgPages/billing/BillingIvoice.jsx
import React from "react";
import {
    FiMapPin, FiMail, FiPhone, FiUser, FiTool, FiCreditCard
} from "react-icons/fi";
import { FaCar, FaRupeeSign, FaWrench } from "react-icons/fa";
import { useParams } from "react-router-dom";



export default function InvoiceLayout({ invoice }) {
    if (!invoice) return null;

    const c = invoice.client || {};

    const partsCost = Number(invoice.partsCost || 0);
    const partsGst = Number(invoice.partsGst || 0);
    const laborCost = Number(invoice.laborCost || 0);
    const laborGst = Number(invoice.laborGst || 0);
    const tax = Number(invoice.tax || 0);
    const discount = Number(invoice.discount || 0);
    const grandTotal = Number(invoice.grandTotal || 0);

    const partsTotal = partsCost + (partsCost * partsGst) / 100;
    const laborTotal = laborCost + (laborCost * laborGst) / 100;

    return (
        <div className="max-w-5xl mx-auto overflow-hidden text-black bg-white shadow-2xl rounded-3xl print:shadow-none print:rounded-none">

            {/* HEADER */}
            <div className="p-6 border-b">
                <div className="flex justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">AUTO GARAGE</h1>
                        <p className="flex gap-2 mt-1 text-xs">
                            <FiMapPin /> Bengaluru, India
                        </p>
                        <p className="flex gap-2 text-xs">
                            <FiMail /> contact@autogarage.com
                        </p>
                        <p className="flex gap-2 text-xs">
                            <FiPhone /> +91 98765 43210
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-xs font-semibold">INVOICE</p>
                        <h2 className="text-2xl font-bold">#{invoice.invoiceNumber}</h2>
                        <p className="font-semibold">{invoice.status}</p>
                    </div>
                </div>
            </div>

            {/* CLIENT + VEHICLE */}
            <div className="grid gap-4 p-6 border-b md:grid-cols-2">
                <div>
                    <h3 className="flex items-center gap-2 font-bold">
                        <FiUser /> Bill To
                    </h3>
                    <p className="font-semibold">{c.fullName}</p>
                    <p className="text-xs">{c.phone}</p>
                    <p className="text-xs">{c.email}</p>
                </div>

                <div>
                    <h3 className="flex items-center gap-2 font-bold">
                        <FaCar /> Vehicle
                    </h3>
                    <p className="font-semibold">
                        {c.vehicleMake} {c.vehicleModel}
                    </p>
                </div>
            </div>

            {/* COST TABLE */}
            <div className="p-6">
                <h3 className="flex items-center gap-2 mb-3 font-bold">
                    <FaRupeeSign /> Cost Breakdown
                </h3>

                <table className="w-full text-sm">
                    <tbody>
                        <tr>
                            <td className="flex items-center gap-2">
                                <FiTool /> Parts
                            </td>
                            <td className="text-right">₹ {partsTotal.toFixed(2)}</td>
                        </tr>

                        <tr>
                            <td className="flex items-center gap-2">
                                <FaWrench /> Labor
                            </td>
                            <td className="text-right">₹ {laborTotal.toFixed(2)}</td>
                        </tr>

                        <tr>
                            <td>Tax</td>
                            <td className="text-right">₹ {tax.toFixed(2)}</td>
                        </tr>

                        {discount > 0 && (
                            <tr className="text-red-500">
                                <td>Discount</td>
                                <td className="text-right">- ₹ {discount.toFixed(2)}</td>
                            </tr>
                        )}

                        <tr className="font-bold border-t">
                            <td>Grand Total</td>
                            <td className="text-lg text-right">
                                ₹ {grandTotal.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* FOOTER */}
            <div className="p-4 text-center border-t">
                <p className="font-semibold">Thank you for your business!</p>
            </div>
        </div>
    );
}
